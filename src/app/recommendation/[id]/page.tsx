import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import {
  supabase,
  KuisionerJawaban,
  getLaptopPerforma,
  getLaptopImageUrl,
} from '@/lib/supabase';
import { ResultTabs, LaptopResultCardProps } from '@/components/ResultTabs';

export default async function RecommendationResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const jawabanId = parseInt(id);

  const { data: jawabanData } = await supabase
    .from('kuisioner_jawaban')
    .select('*')
    .eq('id', jawabanId)
    .single();

  const jawaban = jawabanData as KuisionerJawaban | null;

  if (!jawaban) {
    notFound();
  }

  // Check permission: user must own it or be admin
  if (jawaban.user_id !== session.userId && session.role !== 'admin') {
    redirect('/dashboard');
  }

  // Total history
  const { count: totalHistoryCount } = await supabase
    .from('kuisioner_jawaban')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', jawaban.user_id);
  const totalHistory = totalHistoryCount || 0;

  // Bobot ROC
  const { data: bobotData } = await supabase
    .from('bobot_kriteria_hasil')
    .select('prioritas, bobot, kriteria_id')
    .eq('kuisioner_jawaban_id', jawabanId)
    .order('prioritas', { ascending: true });

  const { data: kriteriaData } = await supabase.from('kriteria').select('*');
  const kriteriaMap = new Map((kriteriaData || []).map((k: { id: number; kode: string; nama: string; tipe: string }) => [k.id, k]));

  const bobotRows = (bobotData || []).map((b: { prioritas: number; bobot: number | string; kriteria_id: number }) => {
    const k = kriteriaMap.get(b.kriteria_id);
    return {
      prioritas: b.prioritas,
      bobot: Number(b.bobot),
      kode: k?.kode || '',
      nama: k?.nama || '',
      tipe: k?.tipe || 'benefit',
    };
  });

  // Penjelasan AI
  const { data: aiRows } = await supabase
    .from('penjelasan_ai')
    .select('laptop_id, penjelasan')
    .eq('kuisioner_jawaban_id', jawabanId);
  const explanationsMap: Record<number, string> = {};
  for (const row of (aiRows || [])) {
    explanationsMap[row.laptop_id] = row.penjelasan;
  }

  // Hasil TOPSIS
  const { data: topsisRaw } = await supabase
    .from('hasil_topsis')
    .select('*')
    .eq('kuisioner_jawaban_id', jawabanId)
    .order('peringkat', { ascending: true });

  const { data: allLaptops } = await supabase.from('laptops').select('*');
  const laptopMap = new Map((allLaptops || []).map((l: { id: number }) => [l.id, l]));

  const topsisRows = (topsisRaw || []).map((ht: { laptop_id: number; id: number; peringkat: number; nilai_v: number; kondisi: string }) => {
    const l = (laptopMap.get(ht.laptop_id) || {}) as Record<string, any>;
    return {
      ...l,
      ...ht,
      laptop_condition: l.condition,
    };
  });

  function formatCard(item: any): LaptopResultCardProps {
    const performa = getLaptopPerforma(item);
    const imageUrl = getLaptopImageUrl(item);
    const searchQuery = encodeURIComponent(`${item.brand || ''} ${item.name || ''}`.trim());

    return {
      id: item.id,
      laptop_id: item.laptop_id,
      peringkat: item.peringkat,
      nilai_v: item.nilai_v,
      skor_persen: Number((item.nilai_v * 100).toFixed(2)),
      kondisi: item.kondisi,
      name: item.name,
      brand: item.brand || '',
      price: item.price,
      ram_gb: item.ram_gb,
      storage_gb: item.storage_gb,
      battery_hours: item.battery_hours,
      weight_kg: item.weight_kg,
      performa,
      image_url: imageUrl,
      shopee_url: `https://shopee.co.id/search?keyword=${searchQuery}`,
      tokopedia_url: `https://www.tokopedia.com/search?st=product&q=${searchQuery}`,
      facebook_url: `https://www.facebook.com/marketplace/search/?query=${searchQuery}`,
      blibli_url: `https://www.blibli.com/cari/${searchQuery}`,
      bukalapak_url: `https://www.bukalapak.com/products?search%5Bkeywords%5D=${searchQuery}`,
      narasi: explanationsMap[item.laptop_id],
    };
  }

  const hasilBaru = topsisRows.filter((r: any) => r.kondisi === 'baru').map(formatCard);
  const hasilSecond = topsisRows.filter((r: any) => r.kondisi === 'second').map(formatCard);

  const tanggalFormatted = jawaban.tanggal_pengisian
    ? new Date(jawaban.tanggal_pengisian).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date(jawaban.created_at || Date.now()).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  const judulSesi =
    jawaban.judul ||
    `Konsultasi ${jawaban.peruntukan.charAt(0).toUpperCase() + jawaban.peruntukan.slice(1)}`;

  const merekArr: string[] =
    typeof jawaban.merek_pilihan === 'string'
      ? JSON.parse(jawaban.merek_pilihan)
      : jawaban.merek_pilihan;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Header Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-950/50 text-emerald-400 border border-emerald-800/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Analisis TOPSIS & Narasi AI Selesai
            </span>
            <span className="text-xs text-cyan-300 font-mono flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40">
              <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Tanggal Pengisian: <strong>{tanggalFormatted}</strong></span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{judulSesi}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/riwayat"
            className="px-3.5 py-2 rounded-xl bg-[#0e0e15] hover:bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-medium transition flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Semua Riwayat ({totalHistory})</span>
          </Link>
          <Link
            href={`/questionnaire?copy_from=${jawaban.id}`}
            className="px-3.5 py-2 rounded-xl bg-[#0e0e15] hover:bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-medium transition flex items-center gap-1.5"
            title="Gunakan preferensi ini untuk kuisioner baru"
          >
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            <span>Pakai Preferensi Ini</span>
          </Link>
          <Link
            href="/questionnaire"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm transition"
          >
            Kuisioner Baru
          </Link>
          <Link
            href={`/recommendation/${jawaban.id}/pdf`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-xs transition shadow-sm active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Unduh Laporan PDF</span>
          </Link>
        </div>
      </div>

      {/* Parameter Profil & Filter Kuisioner Sesi Ini */}
      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm space-y-3">
        <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
          <span>Profil Kebutuhan & Filter Terpilih</span>
          <span className="text-zinc-500 font-mono">ID Sesi: #{jawaban.id}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block mb-0.5 font-mono">Rentang Budget</span>
            <span className="font-bold text-white font-mono">
              Rp {new Intl.NumberFormat('id-ID').format(jawaban.budget_min)} -{' '}
              {new Intl.NumberFormat('id-ID').format(jawaban.budget_max)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block mb-0.5 font-mono">Peruntukan (Label)</span>
            <span className="font-bold text-white">{jawaban.peruntukan}</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block mb-0.5 font-mono">Kondisi Diproses</span>
            <span className="font-bold text-white uppercase font-mono">{jawaban.kondisi_pilihan}</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block mb-0.5 font-mono">Filter Merek</span>
            <span className="font-bold text-white truncate block">
              {merekArr.includes('semua') ? 'Semua Merek' : merekArr.join(', ')}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block mb-0.5 font-mono">Frekuensi Bawa</span>
            <span className="font-bold text-white">{jawaban.frekuensi_membawa || 'Rutin'}</span>
          </div>
        </div>
      </div>

      {/* Bobot ROC Kriteria Transparan */}
      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Transparansi Perhitungan Bobot ROC (Rank Order Centroid)
            </h3>
            <p className="text-[11px] text-zinc-400">
              Dihitung otomatis dari urutan prioritas yang Anda tentukan: W_i = (1/K) * sum(1/j) • sum(W_i) = 1.0000
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          {bobotRows.map((b) => (
            <div key={b.kode} className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 relative overflow-hidden">
              <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between mb-1">
                <span>#{b.prioritas}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded ${
                    b.tipe === 'cost'
                      ? 'bg-amber-950/50 text-amber-300'
                      : 'bg-emerald-950/50 text-emerald-300'
                  }`}
                >
                  {b.tipe.toUpperCase()}
                </span>
              </div>
              <div className="text-xs font-bold text-white">{b.nama}</div>
              <div className="text-base font-extrabold text-blue-400 font-mono mt-1">
                {(b.bobot * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">w = {b.bobot.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hasil Rekomendasi Tabs */}
      <ResultTabs
        hasilBaru={hasilBaru}
        hasilSecond={hasilSecond}
        kondisiPilihan={jawaban.kondisi_pilihan}
      />
    </div>
  );
}
