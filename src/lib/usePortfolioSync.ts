import { useEffect, useCallback } from 'react';

/**
 * Custom hook to sync data across browser tabs and devices in real time without reloading.
 * 1. BroadcastChannel (0ms instant cross-tab communication)
 * 2. StorageEvent fallback (instant cross-tab on same browser)
 * 3. VisibilityChange / Focus event (refreshes whenever user switches tabs)
 * 4. Heartbeat timer poll (periodic refresh every few seconds when tab is active)
 */
export function usePortfolioSync(onSync: () => void, intervalMs: number = 5000) {
  const handleSync = useCallback(() => {
    onSync();
  }, [onSync]);

  useEffect(() => {
    // 1. BroadcastChannel (Instant 0ms sync across tabs)
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('portfolio_sync');
        channel.onmessage = () => {
          handleSync();
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel notice:', e);
    }

    // 2. Storage event fallback
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'portfolio_sync_trigger') {
        handleSync();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Tab visibility & focus
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleSync();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleSync);

    // 4. Background heartbeat interval while tab is visible
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        handleSync();
      }
    }, intervalMs);

    return () => {
      if (channel) {
        channel.close();
      }
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleSync);
      clearInterval(timer);
    };
  }, [handleSync, intervalMs]);
}

/**
 * Broadcast an update event so all open tabs and the public website refresh immediately.
 */
export function notifyPortfolioUpdate() {
  if (typeof window === 'undefined') return;

  try {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('portfolio_sync');
      channel.postMessage({ type: 'PORTFOLIO_UPDATED', timestamp: Date.now() });
      channel.close();
    }
  } catch (e) {
    // ignore
  }

  try {
    localStorage.setItem('portfolio_sync_trigger', String(Date.now()));
  } catch (e) {
    // ignore
  }
}
