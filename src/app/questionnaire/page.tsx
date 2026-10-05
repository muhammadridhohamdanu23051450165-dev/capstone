import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { supabase, KuisionerJawaban } from '@/lib/supabase';
import { QuestionnaireForm } from '@/components/QuestionnaireForm';

export default async function QuestionnairePage({
  searchParams,
}: {
  searchParams: Promise<{ copy_from?: string; info?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const params = await searchParams;
  const copyFromId = params.copy_from ? parseInt(params.copy_from) : undefined;
  const info = params.info;

  // Total history
  const { count: totalHistoryCount } = await supabase
    .from('kuisioner_jawaban')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.userId);
  const totalHistory = totalHistoryCount || 0;

  // Copy from previous
  let copyFrom: KuisionerJawaban | undefined;
  if (copyFromId) {
    const { data } = await supabase
      .from('kuisioner_jawaban')
      .select('*')
      .eq('id', copyFromId)
      .eq('user_id', session.userId)
      .single();
    if (data) copyFrom = data as KuisionerJawaban;
  }

  // Brands list
  const { data: brandRows } = await supabase
    .from('laptops')
    .select('brand')
    .not('brand', 'is', null)
    .neq('brand', '')
    .order('brand', { ascending: true });
  const brands = Array.from(new Set((brandRows || []).map((b: { brand: string }) => b.brand)));

  const initialData = copyFrom
    ? {
        judul: `Salinan dari ${copyFrom.judul || 'Konsultasi Sebelumnya'}`,
        tanggal_pengisian: new Date().toISOString().split('T')[0],
        budget_min: copyFrom.budget_min,
        budget_max: copyFrom.budget_max,
        peruntukan: copyFrom.peruntukan,
        ranking_kriteria:
          typeof copyFrom.ranking_kriteria === 'string'
            ? JSON.parse(copyFrom.ranking_kriteria)
            : copyFrom.ranking_kriteria,
        merek_pilihan:
          typeof copyFrom.merek_pilihan === 'string'
            ? JSON.parse(copyFrom.merek_pilihan)
            : copyFrom.merek_pilihan,
        kondisi_pilihan: copyFrom.kondisi_pilihan,
        frekuensi_membawa: copyFrom.frekuensi_membawa || 'Rutin Setiap Hari',
      }
    : undefined;

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-gradient-to-r from-violet-950/60 to-cyan-950/60 border border-violet-500/30 text-cyan-300 mb-3 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Kuisioner Preferensi & SPK TOPSIS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Kuisioner Kebutuhan{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">
            Laptop Mahasiswa
          </span>
        </h1>
        <p className="text-sm text-zinc-300 mt-2 leading-relaxed max-w-2xl">
          Isi preferensi penggunaan Anda. Sistem akan memproses perhitungan secara otomatis, menyaring katalog alternatif laptop, dan menyajikan rekomendasi terbaik lengkap dengan analisis <strong>AI</strong>.
        </p>
      </div>

      {info && (
        <div className="mb-6 p-4 rounded-xl bg-violet-950/40 border border-violet-800/60 flex items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3 text-xs text-violet-200">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
            <span>{info}</span>
          </div>
        </div>
      )}

      {copyFrom ? (
        <div className="mb-6 p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3 text-xs text-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>
              Preferensi dimuat dari:{' '}
              <strong>{copyFrom.judul || `Konsultasi #${copyFrom.id}`}</strong>. Anda dapat menyesuaikan pilihan lalu menyimpan sebagai riwayat baru.
            </span>
          </div>
          <Link href="/questionnaire" className="text-xs text-blue-400 hover:text-blue-300 font-medium whitespace-nowrap">
            Reset &times;
          </Link>
        </div>
      ) : totalHistory > 0 ? (
        <div className="mb-6 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>
              Anda memiliki <strong>{totalHistory} riwayat kuisioner</strong> tersimpan. Setiap pengisian baru akan tersimpan otomatis sebagai riwayat terpisah.
            </span>
          </div>
          <Link href="/riwayat" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium whitespace-nowrap">
            Buka Riwayat Kuisioner &rarr;
          </Link>
        </div>
      ) : null}

      <QuestionnaireForm
        initialData={initialData}
        brands={brands}
        totalHistory={totalHistory}
      />
    </div>
  );
}
