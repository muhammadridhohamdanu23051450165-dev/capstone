// Re-export dari supabase.ts untuk backward compatibility
// File ini tidak lagi menggunakan SQLite - semua data dari Supabase PostgreSQL
export { supabase as db, supabase } from './supabase';
export type {
  User,
  Laptop,
  Kriteria,
  KuisionerJawaban,
  HasilTopsis,
  BobotKriteriaHasil,
  PenjelasanAi,
} from './supabase';
export { getLaptopPerforma, getLaptopImageUrl } from './supabase';
