export interface PhotoItem {
  id: string;
  title: string;
  meta: string;
  caption: string;
  scene: string;
}

export interface OutputItem {
  id: string;
  title: string;
  type: string;
  dim: string;
  tools: string[];
  colors: string[];
  art: string;
}

export interface TreasureStop {
  code: string;
  route: number;
  year: string;
  period: string;
  event: string;
  role: string;
  roleTags: string[];
  summary: string;
  id: string;
  number: number;
  marker: string;
  coord: string;
  photos: PhotoItem[];
  outputs: OutputItem[];
}

export interface RouteChapter {
  id: number;
  label: string;
  range: string;
}

export interface CreativeTool {
  id: string;
  abbr: string;
  name: string;
  category: string;
  usage: string;
  highlight: string;
  desc: string;
  tilt: string;
  icon_url?: string;
  order_num?: number;
}

export interface GalleryWork {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  committee: string;
  spanClass: string;
  aspectClass: string;
  dim: string;
  tools: string[];
  colors: string[];
  desc: string;
  art: string;
}

export interface CertificateItem {
  id: string;
  title: string;
  event: string;
  role: string;
  issuer: string;
  year: string;
  category: string;
  imageUrl: string;
  credentialUrl?: string;
  desc?: string;
  orderNum?: number;
}

export interface LightboxItem {
  title: string;
  subtitle: string;
  meta?: string;
  desc?: string;
  art?: string;
  colors?: string[];
  imageUrl?: string;
  credentialUrl?: string;
}
