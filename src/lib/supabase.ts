import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper types (sama seperti sebelumnya)
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Laptop {
  id: number;
  name: string;
  brand: string;
  price: number;
  ram_gb: number;
  storage_gb: number;
  display_size?: number | null;
  processor_score?: number | null;
  vga_score?: number | null;
  performa_komposit?: number | null;
  battery_hours: number;
  weight_kg: number;
  mobility_score?: number | null;
  category?: string | null;
  condition: string;
  image?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Kriteria {
  id: number;
  kode: string;
  nama: string;
  tipe: 'benefit' | 'cost';
  deskripsi?: string | null;
  bobot: number;
}

export interface KuisionerJawaban {
  id: number;
  user_id: number;
  budget_min: number;
  budget_max: number;
  peruntukan: string;
  ranking_kriteria: string | string[];
  merek_pilihan: string | string[];
  kondisi_pilihan: string;
  frekuensi_membawa?: string | null;
  judul?: string | null;
  tanggal_pengisian?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HasilTopsis {
  id: number;
  kuisioner_jawaban_id: number;
  laptop_id: number;
  kondisi: string;
  nilai_v: number;
  peringkat: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BobotKriteriaHasil {
  id: number;
  kuisioner_jawaban_id: number;
  kriteria_id: number;
  prioritas: number;
  bobot: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PenjelasanAi {
  id: number;
  kuisioner_jawaban_id: number;
  laptop_id: number;
  penjelasan: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export function getLaptopPerforma(laptop: Partial<Laptop>): number {
  if (laptop.performa_komposit) {
    return Number(laptop.performa_komposit);
  }
  const cpu = laptop.processor_score || 50;
  const vga = laptop.vga_score || 50;
  return Math.round((cpu + vga) / 2);
}

export function getLaptopImageUrl(laptop: Partial<Laptop>): string {
  if (laptop.image && (laptop.image.startsWith('http://') || laptop.image.startsWith('https://'))) {
    return laptop.image;
  }
  if (laptop.image && laptop.image.trim() !== '') {
    return laptop.image.startsWith('/') ? laptop.image : `/${laptop.image}`;
  }

  const brand = (laptop.brand || '').toLowerCase();
  const name = (laptop.name || '').toLowerCase();

  if (brand.includes('acer')) {
    if (name.includes('nitro') || name.includes('predator') || name.includes('aspire 7')) {
      return '/images/laptops/acer-nitro.jpg';
    }
    if (name.includes('travelmate') || name.includes('extensa')) {
      return '/images/laptops/black-business.jpg';
    }
    return '/images/laptops/acer-aspire.jpg';
  }

  if (brand.includes('asus')) {
    if (name.includes('tuf') || name.includes('rog') || name.includes('zephyrus') || name.includes('gaming')) {
      return '/images/laptops/asus-tuf.jpg';
    }
    return '/images/laptops/asus-vivobook.jpg';
  }

  if (brand.includes('lenovo')) {
    if (
      name.includes('thinkpad') || name.includes('t14') || name.includes('t480') ||
      name.includes('t470') || name.includes('t460') || name.includes('t440') ||
      name.includes('x1 carbon') || name.includes('x13') || name.includes('x260') ||
      name.includes('x250') || name.includes('l380') || name.includes('l490') ||
      name.includes('l15') || name.includes('e590') || name.includes('500e')
    ) {
      return '/images/laptops/thinkpad.jpg';
    }
    if (name.includes('gaming') || name.includes('legion')) {
      return '/images/laptops/gaming-laptop.jpg';
    }
    return '/images/laptops/ideapad-slim.jpg';
  }

  if (brand.includes('dell')) {
    if (name.includes('xps')) return '/images/laptops/dell-xps.jpg';
    if (name.includes('alienware') || name.includes('g15') || name.includes('gaming')) {
      return '/images/laptops/gaming-laptop.jpg';
    }
    return '/images/laptops/dell-latitude.jpg';
  }

  if (brand.includes('hp')) {
    if (name.includes('elitebook')) return '/images/laptops/hp-elitebook.jpg';
    if (name.includes('probook') || name.includes('4420s')) return '/images/laptops/black-business.jpg';
    if (name.includes('victus') || name.includes('omen') || name.includes('gaming')) {
      return '/images/laptops/gaming-laptop.jpg';
    }
    return '/images/laptops/hp-laptop.jpg';
  }

  if (brand.includes('msi')) return '/images/laptops/msi-gaming.jpg';

  if (brand.includes('axioo')) {
    if (name.includes('pongo')) return '/images/laptops/gaming-laptop.jpg';
    return '/images/laptops/axioo-hype.jpg';
  }

  if (brand.includes('advan')) {
    if (name.includes('pixwar') || name.includes('gaming')) return '/images/laptops/gaming-laptop.jpg';
    return '/images/laptops/advan-laptop.jpg';
  }

  if (brand.includes('macbook') || brand.includes('apple') || name.includes('macbook') || name.includes('air')) {
    return '/images/laptops/macbook.jpg';
  }

  return '/images/laptops/silver-ultrabook.jpg';
}
