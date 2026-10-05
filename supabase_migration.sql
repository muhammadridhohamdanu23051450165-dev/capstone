-- ============================================================
-- JALANKAN SQL INI DI SUPABASE SQL EDITOR
-- Dashboard -> SQL Editor -> New Query -> paste semua ini -> Run
-- ============================================================

-- 1. TABEL USERS
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  email_verified_at TIMESTAMP,
  password VARCHAR NOT NULL,
  remember_token VARCHAR,
  role VARCHAR NOT NULL DEFAULT 'mahasiswa',
  phone VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABEL LAPTOPS
CREATE TABLE IF NOT EXISTS laptops (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  brand VARCHAR,
  price BIGINT,
  ram_gb INTEGER,
  storage_gb INTEGER,
  display_size FLOAT,
  processor_score INTEGER,
  vga_score INTEGER,
  battery_hours FLOAT,
  weight_kg FLOAT,
  mobility_score INTEGER,
  category VARCHAR,
  image VARCHAR,
  condition VARCHAR NOT NULL DEFAULT 'baru',
  performa_komposit INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. TABEL KRITERIA
CREATE TABLE IF NOT EXISTS kriteria (
  id BIGSERIAL PRIMARY KEY,
  kode VARCHAR NOT NULL,
  nama VARCHAR NOT NULL,
  tipe VARCHAR NOT NULL DEFAULT 'benefit' CHECK (tipe IN ('benefit', 'cost')),
  deskripsi TEXT,
  bobot NUMERIC NOT NULL DEFAULT 0.1667,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. TABEL KUISIONER_JAWABAN
CREATE TABLE IF NOT EXISTS kuisioner_jawaban (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  budget_min BIGINT NOT NULL DEFAULT 0,
  budget_max BIGINT NOT NULL DEFAULT 50000000,
  peruntukan VARCHAR NOT NULL DEFAULT 'Kuliah',
  ranking_kriteria TEXT NOT NULL,
  merek_pilihan TEXT NOT NULL,
  kondisi_pilihan VARCHAR NOT NULL DEFAULT 'keduanya' CHECK (kondisi_pilihan IN ('baru', 'second', 'keduanya')),
  frekuensi_membawa VARCHAR,
  judul VARCHAR,
  tanggal_pengisian TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. TABEL BOBOT_KRITERIA_HASIL
CREATE TABLE IF NOT EXISTS bobot_kriteria_hasil (
  id BIGSERIAL PRIMARY KEY,
  kuisioner_jawaban_id BIGINT NOT NULL REFERENCES kuisioner_jawaban(id) ON DELETE CASCADE,
  kriteria_id BIGINT NOT NULL REFERENCES kriteria(id) ON DELETE CASCADE,
  prioritas INTEGER NOT NULL,
  bobot NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. TABEL HASIL_TOPSIS
CREATE TABLE IF NOT EXISTS hasil_topsis (
  id BIGSERIAL PRIMARY KEY,
  kuisioner_jawaban_id BIGINT NOT NULL REFERENCES kuisioner_jawaban(id) ON DELETE CASCADE,
  laptop_id BIGINT NOT NULL REFERENCES laptops(id) ON DELETE CASCADE,
  kondisi VARCHAR NOT NULL CHECK (kondisi IN ('baru', 'second')),
  nilai_v NUMERIC NOT NULL,
  peringkat INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. TABEL PENJELASAN_AI
CREATE TABLE IF NOT EXISTS penjelasan_ai (
  id BIGSERIAL PRIMARY KEY,
  kuisioner_jawaban_id BIGINT NOT NULL REFERENCES kuisioner_jawaban(id) ON DELETE CASCADE,
  laptop_id BIGINT NOT NULL REFERENCES laptops(id) ON DELETE CASCADE,
  penjelasan TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Seed Users
INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES
(1, 'Administrator', 'admin@gmail.com', '$2b$10$4P/x8albZrSc3NYUF98/8e9BzshM80K.rhuCakcLKFfJVjj8wpf8u', 'admin', '2026-10-02 16:15:24', '2026-10-02 16:15:24'),
(2, 'Mahasiswa User', 'mahasiswa@gmail.com', '$2y$12$I.EPF9y4jDy8CBK/VoDs1.IibgCwRKPDljFE91lLoV83.UvLqPvIq', 'mahasiswa', '2026-10-02 16:15:24', '2026-10-02 16:15:24')
ON CONFLICT (email) DO NOTHING;

-- Reset sequence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Seed Laptops
INSERT INTO laptops (id, name, brand, price, ram_gb, storage_gb, display_size, processor_score, vga_score, battery_hours, weight_kg, mobility_score, category, image, condition) VALUES
(1, 'Acer Aspire 5', 'Acer', 8200000, 8, 512, 14, 72, 60, 7, 1.8, 75, 'kuliah', '', 'baru'),
(2, 'Lenovo Ideapad Gaming 3', 'Lenovo', 12600000, 16, 512, 15.6, 82, 84, 5, 2.4, 60, 'gaming', '', 'second'),
(3, 'Dell XPS 13', 'Dell', 16800000, 16, 512, 13.4, 88, 52, 10, 1.2, 95, 'programming', '', 'baru'),
(4, 'ASUS TUF Gaming F15', 'ASUS', 15400000, 16, 1000, 15.6, 87, 90, 5.5, 2.3, 58, 'gaming', '', 'second')
ON CONFLICT DO NOTHING;

SELECT setval('laptops_id_seq', (SELECT MAX(id) FROM laptops));

-- Seed Kriteria
INSERT INTO kriteria (id, kode, nama, tipe, deskripsi, bobot) VALUES
(1, 'C1', 'Harga', 'cost', 'Biaya pengadaan laptop, semakin murah semakin baik.', 0.4083),
(2, 'C2', 'Performa', 'benefit', 'Performa komposit komputasi CPU dan GPU.', 0.2417),
(3, 'C3', 'RAM', 'benefit', 'Kapasitas memori RAM multitasking (GB).', 0.1583),
(4, 'C4', 'Storage', 'benefit', 'Kapasitas ruang penyimpanan SSD (GB).', 0.1028),
(5, 'C5', 'Baterai', 'benefit', 'Ketahanan daya baterai pemakaian (Jam).', 0.0611),
(6, 'C6', 'Portabilitas', 'cost', 'Bobot fisik laptop (Kg), semakin ringan semakin portabel.', 0.0278)
ON CONFLICT DO NOTHING;

SELECT setval('kriteria_id_seq', (SELECT MAX(id) FROM kriteria));

-- Disable Row Level Security (agar mudah diakses dari server)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE laptops DISABLE ROW LEVEL SECURITY;
ALTER TABLE kriteria DISABLE ROW LEVEL SECURITY;
ALTER TABLE kuisioner_jawaban DISABLE ROW LEVEL SECURITY;
ALTER TABLE bobot_kriteria_hasil DISABLE ROW LEVEL SECURITY;
ALTER TABLE hasil_topsis DISABLE ROW LEVEL SECURITY;
ALTER TABLE penjelasan_ai DISABLE ROW LEVEL SECURITY;
