import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { db, KuisionerJawaban, Laptop, getLaptopImageUrl } from '@/lib/db';
import { DeleteHistoryButton } from '@/components/DeleteHistoryButton';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; kondisi?: string; success?: string; error?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const params = await searchParams;
  const search = params.search?.trim();
  const filterKondisi = params.kondisi?.trim();
  const success = params.success;
  const error = params.error;

  const countRow = db
    .prepare('SELECT count(*) as count FROM kuisioner_jawaban WHERE user_id = ?')
    .get(session.userId) as { count: number } | undefined;
  const totalHistory = countRow?.count || 0;

  // Build query
  let sql = 'SELECT * FROM kuisioner_jawaban WHERE user_id = ?';
  const queryArgs: (string | number)[] = [session.userId];

  if (filterKondisi) {
    sql += ' AND kondisi_pilihan = ?';
    queryArgs.push(filterKondisi);
  }

  if (search) {
    sql += ' AND (judul LIKE ? OR peruntukan LIKE ?)';
    queryArgs.push(`%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY id DESC';

  const rows = (db.prepare(sql).all(...queryArgs) as KuisionerJawaban[]) || [];

  const enrichedConsultations = rows.map((item) => {
    const bestTopsis = db
      .prepare(
        'SELECT ht.*, l.name, l.brand, l.price, l.condition, l.image FROM hasil_topsis ht JOIN laptops l ON ht.laptop_id = l.id WHERE ht.kuisioner_jawaban_id = ? ORDER BY ht.peringkat ASC LIMIT 1'
      )
      .get(item.id) as (Laptop & { nilai_v: number; peringkat: number }) | undefined;

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

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-950/50 text-blue-300 border border-blue-800/50">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Multi-Session History
            </span>
            <span className="text-xs text-zinc-500 font-mono">{totalHistory} Sesi Kuisioner Tersimpan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Riwayat Kuisioner & Rekomendasi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Setiap kali Anda mengirimkan kuisioner, sistem TOPSIS dan perhitungan bobot ROC dicatat secara mandiri untuk transparansi penelusuran hasil.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/questionnaire"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-xs sm:text-sm transition shadow-sm active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Isi Kuisioner Baru</span>
          </Link>
        </div>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200 text-xs">
          {error}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-sm">
        <form method="GET" action="/riwayat" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <input
              type="text"
              name="search"
              defaultValue={search || ''}
              placeholder="Cari label sesi atau peruntukan..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 transition"
            />
            <svg className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="sm:col-span-3">
            <select
              name="kondisi"
              defaultValue={filterKondisi || ''}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-zinc-500 transition"
            >
              <option value="">Semua Kondisi</option>
              <option value="keduanya">Keduanya (Baru & Second)</option>
              <option value="baru">Hanya Baru</option>
              <option value="second">Hanya Second</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition cursor-pointer"
            >
              Filter
            </button>
            {(search || filterKondisi) && (
              <Link
                href="/riwayat"
                className="py-2 px-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs border border-zinc-800 transition"
                title="Reset Filter"
              >
                ✕
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* History Cards */}
      {enrichedConsultations.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/80">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700/60 mx-auto flex items-center justify-center text-zinc-400 mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white">Belum Ada Riwayat Kuisioner</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-5">
            Anda belum memiliki riwayat kuisioner. Silakan isi kuisioner kebutuhan untuk mendapatkan rekomendasi laptop terbaik.
          </p>
          <Link
            href="/questionnaire"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition"
          >
            Mulai Kuisioner &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrichedConsultations.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md p-5 flex flex-col justify-between hover:border-violet-500/40 hover:shadow-[0_0_25px_rgba(124,58,237,0.15)] transition duration-300 space-y-4"
            >
              {/* Top Info */}
              <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h3 className="text-xs font-bold text-white font-mono">{item.judulSesi}</h3>
                  </div>
                  <p className="text-[11px] text-cyan-300 font-mono flex items-center gap-1">
                    <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{item.tanggalFormatted}</span>
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-mono capitalize bg-violet-950/40 text-violet-300 border border-violet-800/40">
                  {item.peruntukan}
                </span>
              </div>

              {/* Recommended Top Laptop with Image */}
              <div className="space-y-2">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                  Rekomendasi Teratas:
                </div>
                {item.bestLaptop ? (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.bestLaptop.image_url}
                      alt={item.bestLaptop.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-sm font-bold text-white leading-snug line-clamp-1">
                        {item.bestLaptop.name}
                      </div>
                      <div className="flex items-baseline gap-2 text-xs font-mono">
                        <span className="text-emerald-400 font-bold">
                          Rp {new Intl.NumberFormat('id-ID').format(item.bestLaptop.price)}
                        </span>
                        <span className="text-cyan-300 text-[11px]">
                          Skor: <strong>{item.bestLaptop.skor_persen}%</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 italic">Sesi telah dihitung</div>
                )}
              </div>

              {/* Filter Parameter Badges */}
              <div className="pt-3 border-t border-zinc-800/60">
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                    💰 {(item.budget_min / 1000000).toFixed(1)}-{(item.budget_max / 1000000).toFixed(1)} Jt
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800 uppercase">
                    🏷️ {item.kondisi_pilihan}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                    🎒 {item.frekuensi_membawa || 'Rutin'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800/70 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/recommendation/${item.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition"
                  >
                    <span>Hasil</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href={`/questionnaire?copy_from=${item.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
                    title="Gunakan preferensi ini untuk kuisioner baru"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    <span className="hidden sm:inline">Pakai Ulang</span>
                  </Link>
                  <Link
                    href={`/recommendation/${item.id}/pdf`}
                    target="_blank"
                    className="inline-flex items-center p-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                    title="Unduh PDF"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </Link>
                </div>

                <DeleteHistoryButton id={item.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
