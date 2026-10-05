import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { supabase, KuisionerJawaban, Laptop, getLaptopImageUrl } from '@/lib/supabase';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // Check if user has answered questionnaire
  const { count: historyCount } = await supabase
    .from('kuisioner_jawaban')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.userId);

  if (session.role !== 'admin' && (!historyCount || historyCount === 0)) {
    redirect(
      '/questionnaire?info=' +
        encodeURIComponent(
          'Selamat datang! Anda diwajibkan mengisi kuisioner kebutuhan terlebih dahulu sebelum dapat melihat hasil rekomendasi laptop.'
        )
    );
  }

  // Fetch all consultations for this user
  const { data: consultationsRaw } = await supabase
    .from('kuisioner_jawaban')
    .select('*')
    .eq('user_id', session.userId)
    .order('id', { ascending: false });

  const consultations = (consultationsRaw || []) as KuisionerJawaban[];
  const consultationIds = consultations.map((c) => c.id);

  // Fetch all laptops for mapping
  const { data: allLaptopsList } = await supabase.from('laptops').select('*');
  const laptopMap = new Map(((allLaptopsList || []) as Laptop[]).map((l) => [l.id, l]));

  // Fetch topsis results for these consultations
  const { data: allTopsis } = consultationIds.length > 0
    ? await supabase
        .from('hasil_topsis')
        .select('*')
        .in('kuisioner_jawaban_id', consultationIds)
        .order('peringkat', { ascending: true })
    : { data: [] };

  const bestTopsisByKj = new Map<number, Laptop & { nilai_v: number; peringkat: number }>();
  for (const t of (allTopsis || [])) {
    if (!bestTopsisByKj.has(t.kuisioner_jawaban_id)) {
      const laptop = laptopMap.get(t.laptop_id);
      if (laptop) {
        bestTopsisByKj.set(t.kuisioner_jawaban_id, {
          ...laptop,
          nilai_v: t.nilai_v,
          peringkat: t.peringkat,
        });
      }
    }
  }

  // Get best laptop for each consultation
  const enrichedConsultations = consultations.map((item) => {
    const bestTopsis = bestTopsisByKj.get(item.id);

    return {
      ...item,
      bestLaptop: bestTopsis
        ? {
            ...bestTopsis,
            image_url: getLaptopImageUrl(bestTopsis),
            skor_persen: Number((bestTopsis.nilai_v * 100).toFixed(2)),
          }
        : null,
      tanggalFormatted: item.tanggal_pengisian
        ? new Date(item.tanggal_pengisian).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : new Date(item.created_at || Date.now()).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
      judulSesi:
        item.judul ||
        `Konsultasi ${item.peruntukan.charAt(0).toUpperCase() + item.peruntukan.slice(1)}`,
    };
  });

  const latestBest = enrichedConsultations[0]?.bestLaptop;

  return (
    <div className="space-y-8">
      {/* Top Header & Action Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900/90 via-violet-950/30 to-zinc-900/90 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Halo, {session.name}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20 capitalize">
                {session.role}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
              Pusat rekomendasi laptop mahasiswa berbasis sistem pendukung keputusan multi-kriteria TOPSIS & preferensi bobot Rank Order Centroid (ROC).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-violet-600/25 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Mulai Kuisioner Baru</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-violet-500/40 transition duration-300">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
            <span className="font-mono uppercase text-[11px] tracking-wider text-zinc-400">
              Total Sesi Kuisioner
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">
            {enrichedConsultations.length}
          </div>
          <p className="text-[11px] text-zinc-500 mt-2 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
            <span>Riwayat evaluasi TOPSIS tersimpan</span>
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/40 transition duration-300">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
            <span className="font-mono uppercase text-[11px] tracking-wider text-zinc-400">
              Rekomendasi Terakhir
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          {latestBest ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={latestBest.image_url}
                alt={latestBest.name}
                className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                loading="lazy"
              />
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition">
                  {latestBest.name}
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  Rp {new Intl.NumberFormat('id-ID').format(latestBest.price)}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-base font-semibold text-zinc-400">Belum ada kuisioner</div>
              <p className="text-[11px] text-zinc-500 mt-2 font-mono">Silakan isi formulir kuisioner baru</p>
            </>
          )}
        </div>

        <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition duration-300">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
            <span className="font-mono uppercase text-[11px] tracking-wider text-zinc-400">
              Metode Pembobotan
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">ROC & TOPSIS</div>
          <p className="text-[11px] text-zinc-400 mt-2 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono">
              Kategori Baru
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-amber-300 font-mono">
              Kategori Second
            </span>
          </p>
        </div>
      </div>

      {/* Riwayat Konsultasi Card */}
      <div className="rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Riwayat Konsultasi & Rekomendasi Terakhir</span>
            </h2>
            <p className="text-xs text-zinc-400">Daftar seluruh sesi kuisioner yang pernah Anda jalankan.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 font-mono px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
              {enrichedConsultations.length} Sesi
            </span>
            <Link
              href="/riwayat"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {enrichedConsultations.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 mx-auto flex items-center justify-center text-zinc-400 mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">Belum Ada Riwayat Konsultasi</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
              Anda belum pernah mengisi kuisioner. Dapatkan rekomendasi laptop terbaik yang dipersonalisasi dengan mengisi preferensi Anda.
            </p>
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-violet-600/20"
            >
              Isi Kuisioner Sekarang &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-zinc-400 font-mono uppercase text-[11px]">
                  <th className="py-3.5 px-6">Sesi / Tanggal Pengisian</th>
                  <th className="py-3.5 px-6">Laptop Terbaik</th>
                  <th className="py-3.5 px-6">Harga</th>
                  <th className="py-3.5 px-6">Peruntukan</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {enrichedConsultations.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-4 px-6 text-xs">
                      <div className="font-bold text-white font-mono text-sm">{item.judulSesi}</div>
                      <div className="text-[11px] text-cyan-300/90 font-mono flex items-center gap-1.5 mt-1">
                        <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{item.tanggalFormatted}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {item.bestLaptop ? (
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.bestLaptop.image_url}
                            alt={item.bestLaptop.name}
                            className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
                            loading="lazy"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate max-w-[220px]">
                              {item.bestLaptop.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                                  item.bestLaptop.condition === 'second'
                                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                }`}
                              >
                                {item.bestLaptop.condition}
                              </span>
                              <span className="text-[10px] text-cyan-400 font-mono">
                                Skor: {item.bestLaptop.skor_persen}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">Sesi telah dihitung</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-emerald-400 font-bold">
                      {item.bestLaptop ? `Rp ${new Intl.NumberFormat('id-ID').format(item.bestLaptop.price)}` : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-mono bg-violet-950/40 text-violet-300 border border-violet-800/40 capitalize">
                        {item.peruntukan}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/recommendation/${item.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition"
                        >
                          Hasil &rarr;
                        </Link>
                        <Link
                          href={`/recommendation/${item.id}/pdf`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition"
                          title="Cetak PDF"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
