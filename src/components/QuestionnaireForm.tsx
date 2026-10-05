'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  initialData?: {
    judul?: string;
    tanggal_pengisian?: string;
    budget_min?: number;
    budget_max?: number;
    peruntukan?: string;
    ranking_kriteria?: string[];
    merek_pilihan?: string[];
    kondisi_pilihan?: string;
    frekuensi_membawa?: string;
  };
  brands: string[];
  totalHistory: number;
}

const AWAM_PRESETS: Record<
  string,
  {
    title: string;
    icon: string;
    badge: string;
    desc: string;
    order: string[];
  }
> = {
  hemat: {
    title: 'Harga Paling Hemat & Ramah Kantong',
    icon: '💰',
    badge: 'Paling Ekonomis',
    desc: 'Mencari laptop termurah yang tetap handal untuk mengetik tugas kuliah, browsing materi, Zoom, dan tugas harian.',
    order: ['C1', 'C5', 'C3', 'C4', 'C6', 'C2'],
  },
  performa: {
    title: 'Kinerja Kencang & Anti-Lemot',
    icon: '⚡',
    badge: 'Multitasking Cepat',
    desc: 'Memprioritaskan prosesor bertenaga dan RAM lapang agar tidak lelet saat membuka banyak aplikasi kuliah sekaligus.',
    order: ['C2', 'C3', 'C4', 'C1', 'C5', 'C6'],
  },
  mobilitas: {
    title: 'Baterai Awet Seharian & Bobot Ringan',
    icon: '🔋',
    badge: 'Nyaman Dibawa',
    desc: 'Memprioritaskan daya tahan baterai panjang dan laptop ringan agar praktis dibawa keliling kampus tanpa harus sering mencari colokan listrik.',
    order: ['C5', 'C6', 'C1', 'C3', 'C4', 'C2'],
  },
  storage: {
    title: 'Kapasitas Penyimpanan Besar (SSD Lega)',
    icon: '💾',
    badge: 'Simpan Banyak File',
    desc: 'Memprioritaskan ruang SSD lapang untuk menyimpan ribuan dokumen kuliah, modul, video praktikum, dan materi skripsi.',
    order: ['C4', 'C3', 'C2', 'C1', 'C5', 'C6'],
  },
  kreator: {
    title: 'Olah Grafis, Desain & Editing Video',
    icon: '🎨',
    badge: 'Visual & Kreatif',
    desc: 'Memprioritaskan performa grafis tinggi untuk aplikasi desain visual (Photoshop/Canva), render video, atau hiburan gaming lancar.',
    order: ['C2', 'C4', 'C3', 'C1', 'C5', 'C6'],
  },
  seimbang: {
    title: 'Spesifikasi Seimbang di Segala Sisi',
    icon: '⚖️',
    badge: 'All-Rounder Terbaik',
    desc: 'Kombinasi merata dan seimbang antara harga bersahabat, ketahanan baterai, performa cepat, dan kenyamanan pemakaian jangka panjang.',
    order: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
  },
};

const CRITERIA_META: Record<string, { name: string; icon: string; desc: string }> = {
  C1: { name: 'Harga Laptop', icon: '💰', desc: 'Efisiensi biaya dan kesesuaian anggaran pengadaan laptop' },
  C2: { name: 'Performa Komputasi', icon: '⚡', desc: 'Kecepatan prosesor (CPU) & grafis (GPU) untuk kelancaran tugas' },
  C3: { name: 'Kapasitas RAM', icon: '🧠', desc: 'Kelancaran multitasking banyak aplikasi tanpa lagging' },
  C4: { name: 'Penyimpanan (SSD)', icon: '💾', desc: 'Kapasitas ruang penyimpanan dokumen kuliah dan kecepatan baca/tulis' },
  C5: { name: 'Ketahanan Baterai', icon: '🔋', desc: 'Daya tahan baterai saat dipakai di kampus atau perpustakaan' },
  C6: { name: 'Portabilitas & Berat', icon: '🎒', desc: 'Bobot fisik ringan yang tidak membebani saat dibawa di tas ransel' },
};

export function QuestionnaireForm({ initialData, brands, totalHistory }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [judul, setJudul] = useState(initialData?.judul || '');
  const [tanggalPengisian, setTanggalPengisian] = useState(
    initialData?.tanggal_pengisian || new Date().toISOString().split('T')[0]
  );
  const [budgetMin, setBudgetMin] = useState(initialData?.budget_min || 5000000);
  const [budgetMax, setBudgetMax] = useState(initialData?.budget_max || 15000000);
  const [peruntukan, setPeruntukan] = useState(initialData?.peruntukan || 'Kuliah & Skripsi');

  const [ranking, setRanking] = useState<string[]>(
    initialData?.ranking_kriteria || ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']
  );
  const [activePreset, setActivePreset] = useState<string>('seimbang');

  const [merekPilihan, setMerekPilihan] = useState<string[]>(
    initialData?.merek_pilihan || ['semua']
  );
  const [kondisiPilihan, setKondisiPilihan] = useState<string>(
    initialData?.kondisi_pilihan || 'keduanya'
  );
  const [frekuensiMembawa, setFrekuensiMembawa] = useState<string>(
    initialData?.frekuensi_membawa || 'Rutin Setiap Hari'
  );

  const selectPreset = (key: string) => {
    setActivePreset(key);
    setRanking([...AWAM_PRESETS[key].order]);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= ranking.length) return;
    const newArr = [...ranking];
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setRanking(newArr);
    setActivePreset('');
  };

  const toggleBrand = (b: string) => {
    if (b === 'semua') {
      setMerekPilihan(['semua']);
      return;
    }
    let updated = merekPilihan.filter((item) => item !== 'semua');
    if (updated.includes(b)) {
      updated = updated.filter((item) => item !== b);
    } else {
      updated.push(b);
    }
    if (updated.length === 0) {
      updated = ['semua'];
    }
    setMerekPilihan(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul,
          tanggal_pengisian: tanggalPengisian,
          budget_min: Number(budgetMin),
          budget_max: Number(budgetMax),
          peruntukan,
          ranking_kriteria: ranking,
          merek_pilihan: merekPilihan,
          kondisi_pilihan: kondisiPilihan,
          frekuensi_membawa: frekuensiMembawa,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses kuisioner');
      }

      router.push(`/recommendation/${data.jawabanId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setErrorMsg(message);
      setLoading(false);
    }
  };

  const peruntukanList: Record<string, [string, string]> = {
    'Kuliah & Skripsi': ['Dokumen, browsing riset, presentasi, Zoom/Meet, dan tugas harian.', '🎓'],
    'Programming & Dev': ['Coding IDE, kompilasi software, web development, dan emulator.', '💻'],
    'Desain & Multimedia': ['Photoshop, Illustrator, video editing, canva, dan rendering grafis.', '🎨'],
    'Gaming & 3D Render': ['Gaming kompetitif/AAA, modeling 3D, Blender, dan simulasi berat.', '🎮'],
    'Kerja Kantoran': ['Spreadsheet kompleks, administrasi, akuntansi, dan multitasking bisnis.', '📊'],
  };

  const presets = [
    { label: 'Rp 3 - 6 Juta', min: 3000000, max: 6000000 },
    { label: 'Rp 6 - 10 Juta', min: 6000000, max: 10000000 },
    { label: 'Rp 10 - 15 Juta', min: 10000000, max: 15000000 },
    { label: 'Rp 15 - 30 Juta', min: 15000000, max: 30000000 },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Label & Tanggal Pengisian */}
      <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md space-y-4 shadow-lg">
        <div className="grid sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                <span>Nama / Label Kuisioner (Opsional)</span>
              </label>
              <span className="text-[11px] text-zinc-400 font-mono">Penanda sesi riwayat</span>
            </div>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Kebutuhan Skripsi, Laptop Editing Video, atau Kuliah Harian"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/90 border border-white/10 text-zinc-100 placeholder-zinc-400 text-xs sm:text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
            />
          </div>

          <div className="sm:col-span-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Tanggal Pengisian</span>
              </label>
              <span className="text-[11px] text-cyan-400 font-mono">WIB</span>
            </div>
            <div className="relative">
              <input
                type="date"
                value={tanggalPengisian}
                onChange={(e) => setTanggalPengisian(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-zinc-950/90 border border-white/10 text-zinc-100 font-mono text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition cursor-pointer"
              />
              <svg className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Pertanyaan 1: Rentang Budget */}
      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-zinc-300">1</span>
            <label className="text-sm font-semibold text-white">Rentang Anggaran (Budget)</label>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">Fungsi: Filter Data</span>
        </div>
        <p className="text-xs text-zinc-400">
          Tentukan batas minimal dan maksimal harga laptop yang akan diikutsertakan dalam pemeringkatan TOPSIS.
        </p>

        {/* Budget Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setBudgetMin(p.min);
                setBudgetMax(p.max);
              }}
              className="py-2 px-3 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-zinc-600 text-zinc-300 text-xs font-medium transition text-center active:scale-[0.98] cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Batas Minimal (Rp)</label>
            <input
              type="number"
              value={budgetMin}
              onChange={(e) => setBudgetMin(Number(e.target.value))}
              step="500000"
              min="0"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 font-mono text-sm focus:outline-none focus:border-zinc-500 transition"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Batas Maksimal (Rp)</label>
            <input
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              step="500000"
              min="1000000"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 font-mono text-sm focus:outline-none focus:border-zinc-500 transition"
            />
          </div>
        </div>
      </div>

      {/* 2. Pertanyaan 2: Peruntukan */}
      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-zinc-300">2</span>
            <label className="text-sm font-semibold text-white">Peruntukan Pemakaian Utama</label>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/50">Fungsi: Label Informatif</span>
        </div>
        <p className="text-xs text-zinc-400">
          Pilih aktivitas utama laptop. Pilihan ini akan ditampilkan sebagai label profil pada hasil dan memandu narasi AI.
        </p>

        <div className="grid sm:grid-cols-3 gap-3">
          {Object.entries(peruntukanList).map(([val, info]) => (
            <label
              key={val}
              className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition ${
                peruntukan === val
                  ? 'border-white bg-zinc-800/70 ring-1 ring-white/20'
                  : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
              }`}
            >
              <input
                type="radio"
                name="peruntukan"
                value={val}
                checked={peruntukan === val}
                onChange={() => setPeruntukan(val)}
                className="sr-only"
              />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{info[1]}</span>
                <span className="text-xs font-bold text-zinc-100">{val}</span>
              </div>
              <span className="text-[11px] text-zinc-400 leading-snug">{info[0]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Pertanyaan 3: Gaya Penggunaan & Fokus Kebutuhan */}
      <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md space-y-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-mono font-bold text-white shadow-sm">3</span>
            <label className="text-sm font-bold text-white">Gaya Penggunaan & Fokus Kebutuhan Utama Anda</label>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-800/40">✨ Ramah Orang Awam</span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Pilih salah satu opsi kebutuhan di bawah ini yang paling menggambarkan rencana pemakaian laptop Anda. Sistem otomatis menyusun urutan prioritas pembobotan (ROC) yang paling pas untuk Anda.
        </p>

        {/* Pilihan Kartu Kebutuhan untuk Orang Awam */}
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.entries(AWAM_PRESETS).map(([key, p]) => (
            <div
              key={key}
              onClick={() => selectPreset(key)}
              className={`relative p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                activePreset === key
                  ? 'bg-gradient-to-br from-violet-950/40 via-zinc-900 to-zinc-950 border-violet-500 ring-1 ring-violet-500/50 shadow-md'
                  : 'bg-zinc-950/70 border-white/10 hover:border-zinc-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.icon}</span>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{p.title}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      activePreset === key ? 'bg-violet-600 text-white font-bold' : 'bg-white/5 text-zinc-400'
                    }`}
                  >
                    {p.badge}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-snug">{p.desc}</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span>
                  Prioritas Utama: <strong className="text-cyan-300">{CRITERIA_META[p.order[0]].name}</strong>
                </span>
                {activePreset === key && <span className="text-violet-400 font-bold">✓ Terpilih</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Mode Lanjutan: Pengaturan Manual Kriteria Teknis */}
        <details className="group mt-4 pt-3 border-t border-white/10">
          <summary className="cursor-pointer text-xs font-mono text-zinc-400 hover:text-cyan-300 flex items-center justify-between py-1 select-none">
            <span className="flex items-center gap-2">
              <span>⚙️ Mode Lanjutan: Lihat / Atur Urutan Manual Kriteria Teknis (Dosen / Riset)</span>
            </span>
            <span className="text-xs text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="pt-3 space-y-3">
            <p className="text-[11px] text-zinc-400">
              Urutan kriteria di bawah ini secara otomatis tersinkronisasi saat Anda memilih kebutuhan di atas. Anda juga dapat mengubah posisi secara manual menggunakan tombol panah jika diperlukan.
            </p>
            <div className="space-y-2">
              {ranking.map((code, idx) => {
                const c = CRITERIA_META[code] || { name: code, icon: '💻', desc: '' };
                return (
                  <div
                    key={code}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-violet-500/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-cyan-300 shadow-inner">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {c.icon} {c.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/[0.05] text-zinc-400 border border-white/10">
                            {code}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">{c.desc}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 'up')}
                        disabled={idx === 0}
                        className="w-7 h-7 rounded-xl bg-zinc-900 hover:bg-violet-600 disabled:opacity-30 border border-white/10 flex items-center justify-center text-xs text-zinc-300 hover:text-white transition shadow-sm cursor-pointer"
                        title="Pindah Lebih Utama (Naik)"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 'down')}
                        disabled={idx === ranking.length - 1}
                        className="w-7 h-7 rounded-xl bg-zinc-900 hover:bg-violet-600 disabled:opacity-30 border border-white/10 flex items-center justify-center text-xs text-zinc-300 hover:text-white transition shadow-sm cursor-pointer"
                        title="Pindah Kurang Penting (Turun)"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </details>
      </div>

      {/* 4. Pertanyaan 4: Preferensi Merek Laptop */}
      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-zinc-300">4</span>
            <label className="text-sm font-semibold text-white">Preferensi Merek Laptop</label>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">Fungsi: Filter Alternatif</span>
        </div>
        <p className="text-xs text-zinc-400">
          Pilih satu atau beberapa merek yang diinginkan, atau biarkan &quot;Semua Merek&quot; untuk perbandingan terluas.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => toggleBrand('semua')}
            className={`py-2 px-3.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
              merekPilihan.includes('semua')
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500 text-white font-bold'
                : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            Semua Merek
          </button>
          {brands.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => toggleBrand(b)}
              className={`py-2 px-3.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                merekPilihan.includes(b) && !merekPilihan.includes('semua')
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500 text-white font-bold'
                  : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Pertanyaan 5: Preferensi Kondisi Laptop */}
      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-zinc-300">5</span>
            <label className="text-sm font-semibold text-white">Preferensi Kondisi Laptop</label>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">Fungsi: Segmentasi Evaluasi</span>
        </div>
        <p className="text-xs text-zinc-400">
          Metode TOPSIS akan dijalankan secara terpisah untuk laptop baru dan/atau second demi menjaga keadilan perbandingan nilai preferensi.
        </p>

        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {
              val: 'keduanya',
              label: 'Keduanya (Baru & Second)',
              desc: 'Tampilkan hasil rekomendasi laptop baru dan laptop second dalam tab terpisah.',
              badge: 'Paling Lengkap',
            },
            {
              val: 'baru',
              label: 'Hanya Laptop Baru',
              desc: 'Hanya merekomendasikan unit bergaransi resmi dari pabrik.',
              badge: 'Resmi',
            },
            {
              val: 'second',
              label: 'Hanya Laptop Second',
              desc: 'Mencari laptop second berkualitas tinggi untuk penghematan anggaran maksimal.',
              badge: 'Value for Money',
            },
          ].map((item) => (
            <label
              key={item.val}
              className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                kondisiPilihan === item.val
                  ? 'border-white bg-zinc-800/70 ring-1 ring-white/20'
                  : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
              }`}
            >
              <input
                type="radio"
                name="kondisi_pilihan"
                value={item.val}
                checked={kondisiPilihan === item.val}
                onChange={() => setKondisiPilihan(item.val)}
                className="sr-only"
              />
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">{item.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 6. Pertanyaan 6: Mobilitas / Frekuensi Membawa Laptop */}
      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-zinc-300">6</span>
            <label className="text-sm font-semibold text-white">Mobilitas / Frekuensi Membawa Laptop</label>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/50">Fungsi: Panduan AI</span>
        </div>
        <p className="text-xs text-zinc-400">
          Seberapa sering Anda membawa laptop ke kampus, kafe, atau ruang kelas? Informasi ini memandu mesin AI dalam menyusun evaluasi portabilitas & bobot.
        </p>

        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {
              val: 'Rutin Setiap Hari',
              label: 'Rutin Setiap Hari',
              desc: 'Sangat sering mobile di kampus, butuh laptop enteng & baterai tahan lama.',
              icon: '🎒',
            },
            {
              val: '2-3 Hari Seminggu',
              label: '2-3 Hari Seminggu',
              desc: 'Kombinasi seimbang antara pemakaian di kost/rumah dan sesekali ke kampus.',
              icon: '🚶',
            },
            {
              val: 'Jarang / Menetap di Meja',
              label: 'Jarang / Menetap di Meja',
              desc: 'Sebagian besar waktu di atas meja kerja, berat dan ukuran charger tidak masalah.',
              icon: '🖥️',
            },
          ].map((item) => (
            <label
              key={item.val}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                frekuensiMembawa === item.val
                  ? 'border-white bg-zinc-800/70 ring-1 ring-white/20'
                  : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
              }`}
            >
              <input
                type="radio"
                name="frekuensi_membawa"
                value={item.val}
                checked={frekuensiMembawa === item.val}
                onChange={() => setFrekuensiMembawa(item.val)}
                className="sr-only"
              />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{item.icon}</span>
                <span className="text-xs font-bold text-white">{item.label}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">{item.desc}</p>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="text-xs text-zinc-400 text-center sm:text-left">
          Dengan menekan tombol di samping, sistem akan memproses perhitungan pembobotan ROC, matriks TOPSIS, dan menyusun penjelasan AI secara instan.
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.7)] transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Memproses TOPSIS & ROC...</span>
            </>
          ) : (
            <>
              <span>Proses Rekomendasi TOPSIS & AI &rarr;</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
