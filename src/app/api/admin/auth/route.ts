import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool } from '@/lib/postgres';
import crypto from 'crypto';

function verifyPassword(inputPassword: string, storedHash: string): boolean {
  if (!storedHash || !inputPassword) return false;

  // 1. Plaintext fallback (if user changed it manually in Neon SQL console)
  if (storedHash === inputPassword) return true;

  // 2. SHA-256 fallback
  const sha256 = crypto.createHash('sha256').update(inputPassword).digest('hex');
  if (storedHash === sha256) return true;

  // 3. Salted Scrypt format: salt:hexKey
  if (storedHash.includes(':')) {
    try {
      const [salt, key] = storedHash.split(':');
      if (salt && key) {
        const derivedKey = crypto.scryptSync(inputPassword, salt, 64);
        const keyBuffer = Buffer.from(key, 'hex');
        if (keyBuffer.length === derivedKey.length && crypto.timingSafeEqual(derivedKey, keyBuffer)) {
          return true;
        }
      }
    } catch (e) {
      console.warn('Scrypt verification notice:', e);
    }
  }

  return false;
}

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Body JSON request tidak valid' },
        { status: 400 }
      );
    }

    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Query directly from Neon Database table: admin_users
    const { rows } = await pool.query(
      `SELECT id, email, password_hash, name, role
         FROM admin_users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1;`,
      [normalizedEmail]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Akun email admin tidak ditemukan di database Neon.' },
        { status: 401 }
      );
    }

    const user = rows[0];
    const isPasswordValid = verifyPassword(cleanPassword, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Kata sandi yang Anda masukkan salah.' },
        { status: 401 }
      );
    }

    // Set secure session cookie
    const cookieStore = await cookies();
    cookieStore.set('han_admin_session', `auth_${user.id}_${Date.now()}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Admin Auth Login error:', error);
    return NextResponse.json(
      { error: 'Gagal memproses login dari database Neon: ' + String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('han_admin_session');

    if (sessionCookie && sessionCookie.value.startsWith('auth_')) {
      const parts = sessionCookie.value.split('_');
      const userId = parseInt(parts[1], 10);

      if (!isNaN(userId)) {
        const { rows } = await pool.query(
          `SELECT id, email, name, role FROM admin_users WHERE id = $1 LIMIT 1;`,
          [userId]
        );
        if (rows && rows.length > 0) {
          const user = rows[0];
          return NextResponse.json({
            authenticated: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          });
        }
      }
    }

    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error('Admin Auth Check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('han_admin_session');
    return NextResponse.json({ success: true, message: 'Logout berhasil' });
  } catch (error) {
    console.error('Admin Auth Logout error:', error);
    return NextResponse.json(
      { error: 'Gagal logout: ' + String(error) },
      { status: 500 }
    );
  }
}
