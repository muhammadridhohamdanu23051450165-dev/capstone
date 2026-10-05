import Link from 'next/link';
import { supabase, Laptop, getLaptopPerforma, getLaptopImageUrl } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { FeaturedLaptopsSection, LaptopItem } from '@/components/FeaturedLaptopsSection';

export default async function HomePage() {
  const session = await getSession();

  // Query laptops from database
  const { data: laptopsData } = await supabase
    .from('laptops')
    .select('*')
    .gt('price', 0);
  const allLaptops = (laptopsData || []) as Laptop[];

  function mapToItem(l: Laptop): LaptopItem {
    return {
      id: l.id,
      name: l.name,
      brand: l.brand || '',
      price: l.price,
      condition: l.condition || 'baru',
      ram_gb: l.ram_gb,
      storage_gb: l.storage_gb,
      battery_hours: l.battery_hours,
      weight_kg: l.weight_kg,
      performa: getLaptopPerforma(l),
      image_url: getLaptopImageUrl(l),
    };
  }

  // Featured
  const sortedByScore = [...allLaptops].sort((a, b) => getLaptopPerforma(b) - getLaptopPerforma(a));
  const featured = sortedByScore.slice(0, 8).map(mapToItem);

  // Gaming
  const gaming = allLaptops
    .filter((l) => {
      const cat = (l.category || '').toLowerCase();
      const n = (l.name || '').toLowerCase();
      return (
        cat.includes('gaming') ||
        n.includes('tuf') ||
        n.includes('rog') ||
        n.includes('legion') ||
        n.includes('gaming') ||
        n.includes('nitro')
      );
    })
    .sort((a, b) => getLaptopPerforma(b) - getLaptopPerforma(a))
    .slice(0, 4)
    .map(mapToItem);

  // Portable
  const portable = allLaptops
    .filter((l) => l.weight_kg <= 1.5)
    .sort((a, b) => b.battery_hours - a.battery_hours)
    .slice(0, 4)
    .map(mapToItem);

  // Budget
  const budget = allLaptops
    .filter((l) => l.price <= 10000000)
    .sort((a, b) => getLaptopPerforma(b) - getLaptopPerforma(a))
    .slice(0, 4)
    .map(mapToItem);

  return (
    <div className="py-8 sm:py-14 space-y-20">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto">
        {/* 21st.dev Animated Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-violet-950/60 via-indigo-950/60 to-cyan-950/60 border border-violet-500/30 text-zinc-200 shadow-[0_0_20px_rgba(124,58,237,0.25)] mb-6 hover:border-cyan-400/50 transition">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-mono text-cyan-300 font-semibold">Algoritme TOPSIS & ROC</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300">Rekomendasi Laptop Cerdas Mahasiswa</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
          Temukan Laptop Ideal untuk <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">
            Kuliah & Kebutuhan Anda
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl mx-auto mb-10">
          Sistem Pendukung Keputusan berbasis metode <strong>TOPSIS</strong> & <strong>ROC</strong> yang memadukan komputasi matematis objektif dan analisis naratif <strong>AI</strong> untuk merekomendasikan laptop terbaik sesuai anggaran Anda.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
          {session ? (
            <>
              <Link
                href="/questionnaire"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.7)] transition active:scale-[0.98]"
              >
                <span>Mulai Isi Kuisioner</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0e0e15]/90 border border-white/10 hover:border-violet-500/50 text-zinc-200 hover:text-white font-semibold text-sm hover:bg-white/[0.04] transition"
              >
                Buka Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.7)] transition active:scale-[0.98]"
              >
                <span>Daftar & Mulai Konsultasi</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0e0e15]/90 border border-white/10 hover:border-violet-500/50 text-zinc-200 hover:text-white font-semibold text-sm hover:bg-white/[0.04] transition"
              >
                Masuk Akun
              </Link>
            </>
          )}
        </div>

        {/* 6 Kriteria Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-zinc-400 font-mono">Kriteria Keputusan:</span>
          <span className="px-3 py-1 rounded-xl text-xs font-mono bg-violet-950/40 text-violet-300 border border-violet-800/40">💰 C1: Harga</span>
          <span className="px-3 py-1 rounded-xl text-xs font-mono bg-indigo-950/40 text-indigo-300 border border-indigo-800/40">⚡ C2: Performa</span>
          <span className="px-3 py-1 rounded-xl text-xs font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">🧠 C3: RAM</span>
          <span className="px-3 py-1 rounded-xl text-xs font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">💾 C4: Storage SSD</span>
          <span className="px-3 py-1 rounded-xl text-xs font-mono bg-amber-950/40 text-amber-300 border border-amber-800/40">🔋 C5: Baterai</span>
          <span className="px-3 py-1 rounded-xl text-xs font-mono bg-pink-950/40 text-pink-300 border border-pink-800/40">🎒 C6: Portabilitas</span>
        </div>
      </div>

      {/* Featured Laptops Section */}
      <FeaturedLaptopsSection
        featured={featured}
        gaming={gaming}
        portable={portable}
        budget={budget}
      />

      {/* 21st.dev Component Feature Bento Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="relative group p-7 rounded-3xl bg-[#0e0e15]/70 border border-white/10 hover:border-violet-500/50 transition-all duration-300 backdrop-blur-md hover:shadow-[0_0_25px_rgba(124,58,237,0.2)]">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/30 flex items-center justify-center text-violet-300 mb-5 font-mono font-bold text-sm shadow-[0_0_15px_rgba(124,58,237,0.3)]">
            01
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Preferensi Mahasiswa</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Tentukan rentang anggaran riil, peruntukan studi (Coding, Desain, Gaming, Kuliah), kapasitas RAM & SSD, serta mobilitas harian tanpa asumsi kaku.
          </p>
        </div>

        {/* Step 2 */}
        <div className="relative group p-7 rounded-3xl bg-[#0e0e15]/70 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 backdrop-blur-md hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-cyan-600/30 border border-indigo-500/30 flex items-center justify-center text-cyan-300 mb-5 font-mono font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            02
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Pembobotan & TOPSIS</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Matriks keputusan ternormalisasi terbobot dihitung secara objektif. Jarak Euclidean ke solusi ideal positif (A+) dan negatif (A-) menghasilkan ranking presisi.
          </p>
        </div>

        {/* Step 3 */}
        <div className="relative group p-7 rounded-3xl bg-[#0e0e15]/70 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-md hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600/30 to-emerald-600/30 border border-cyan-500/30 flex items-center justify-center text-emerald-300 mb-5 font-mono font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            03
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Penjelasan AI & Unduh PDF</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Setiap alternatif teratas dilengkapi ulasan naratif cerdas bertenaga AI mengapa laptop tersebut tepat untuk kebutuhan Anda, lengkap dengan cetak laporan PDF.
          </p>
        </div>
      </div>
    </div>
  );
}
