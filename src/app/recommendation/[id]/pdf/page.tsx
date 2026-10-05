import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db, KuisionerJawaban, Laptop } from '@/lib/db';
import { PrintButton } from '@/components/PrintButton';

export default async function PdfReportPage({
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

  const jawaban = db
    .prepare('SELECT * FROM kuisioner_jawaban WHERE id = ?')
    .get(jawabanId) as KuisionerJawaban | undefined;

  if (!jawaban) {
    notFound();
  }

  if (jawaban.user_id !== session.userId && session.role !== 'admin') {
    redirect('/dashboard');
  }

  const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(jawaban.user_id) as
    | { name: string; email: string }
    | undefined;

  const bobotRows = (db
    .prepare(
      'SELECT bkh.*, k.kode, k.nama, k.tipe FROM bobot_kriteria_hasil bkh JOIN kriteria k ON bkh.kriteria_id = k.id WHERE bkh.kuisioner_jawaban_id = ? ORDER BY bkh.prioritas ASC'
    )
    .all(jawabanId) as {
    prioritas: number;
    bobot: number;
    kode: string;
    nama: string;
    tipe: string;
  }[]) || [];

  const aiRows = (db
    .prepare('SELECT laptop_id, penjelasan FROM penjelasan_ai WHERE kuisioner_jawaban_id = ?')
    .all(jawabanId) as { laptop_id: number; penjelasan: string }[]) || [];
  const explanationsMap: Record<number, string> = {};
  for (const row of aiRows) {
    explanationsMap[row.laptop_id] = row.penjelasan;
  }

  const topsisRows = (db
    .prepare(
      `SELECT ht.*, l.name, l.brand, l.price, l.ram_gb, l.storage_gb, l.battery_hours, l.weight_kg, 
              l.condition as laptop_condition 
       FROM hasil_topsis ht 
       JOIN laptops l ON ht.laptop_id = l.id 
       WHERE ht.kuisioner_jawaban_id = ? 
       ORDER BY ht.peringkat ASC`
    )
    .all(jawabanId) as (Laptop & {
    laptop_condition: string;
    laptop_id: number;
    nilai_v: number;
    peringkat: number;
    kondisi: string;
  })[]) || [];

  const topBaru = topsisRows.find((r) => r.kondisi === 'baru' && r.peringkat === 1);
  const topSecond = topsisRows.find((r) => r.kondisi === 'second' && r.peringkat === 1);

  const tanggalFormatted = jawaban.tanggal_pengisian
    ? new Date(jawaban.tanggal_pengisian).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  return (
    <div className="bg-white text-zinc-900 min-h-screen p-8 max-w-4xl mx-auto font-sans text-xs">
      <div className="no-print flex items-center justify-between mb-6 pb-4 border-b border-zinc-200">
        <div className="text-zinc-600 font-mono">
          Pratinjau Laporan Hasil Rekomendasi (Tekan Cetak untuk menyimpan PDF)
        </div>
        <PrintButton />
      </div>

      <div className="border-b-2 border-zinc-900 pb-3 mb-4">
        <h1 className="text-lg font-extrabold uppercase tracking-wide text-zinc-900">
          Laporan Rekomendasi Pemilihan Laptop Mahasiswa
        </h1>
        <div className="text-xs text-zinc-600 mt-1">
          Sistem Pendukung Keputusan Berbasis Metode TOPSIS & Pembobotan Rank Order Centroid (ROC)
        </div>
      </div>

      <table className="w-full text-xs mb-4">
        <tbody>
          <tr>
            <td className="text-zinc-500 py-1 w-36">ID Sesi Kuisioner:</td>
            <td className="font-semibold text-zinc-900">
              #{String(jawaban.id).padStart(5, '0')} ({jawaban.judul || 'Konsultasi'})
            </td>
            <td className="text-zinc-500 py-1 w-32">Tanggal Pengisian:</td>
            <td className="font-semibold text-zinc-900">{tanggalFormatted}</td>
          </tr>
          <tr>
            <td className="text-zinc-500 py-1">Nama Mahasiswa:</td>
            <td className="font-semibold text-zinc-900">
              {user?.name} ({user?.email})
            </td>
            <td className="text-zinc-500 py-1">Rentang Anggaran:</td>
            <td className="font-semibold text-zinc-900">
              Rp {new Intl.NumberFormat('id-ID').format(jawaban.budget_min)} - Rp{' '}
              {new Intl.NumberFormat('id-ID').format(jawaban.budget_max)}
            </td>
          </tr>
          <tr>
            <td className="text-zinc-500 py-1">Peruntukan Utama:</td>
            <td className="font-semibold text-zinc-900">{jawaban.peruntukan}</td>
            <td className="text-zinc-500 py-1">Kondisi Diproses:</td>
            <td className="font-semibold text-zinc-900 uppercase">
              {jawaban.kondisi_pilihan} • {jawaban.frekuensi_membawa || 'Rutin'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tabel Bobot ROC */}
      <div className="font-bold text-zinc-900 mb-1.5">
        Hasil Perhitungan Bobot Kriteria ROC (Rank Order Centroid):
      </div>
      <table className="w-full border-collapse border border-zinc-200 text-xs mb-4">
        <thead>
          <tr className="bg-zinc-100 text-zinc-800 text-[10px] uppercase font-bold">
            <th className="border border-zinc-200 p-1.5 text-center w-12">Prioritas</th>
            <th className="border border-zinc-200 p-1.5 text-left">Kriteria</th>
            <th className="border border-zinc-200 p-1.5 text-center w-16">Tipe</th>
            <th className="border border-zinc-200 p-1.5 text-right w-24">Bobot Desimal</th>
            <th className="border border-zinc-200 p-1.5 text-right w-24">Persentase (%)</th>
          </tr>
        </thead>
        <tbody>
          {bobotRows.map((b) => (
            <tr key={b.kode} className="border border-zinc-200">
              <td className="border border-zinc-200 p-1.5 text-center">#{b.prioritas}</td>
              <td className="border border-zinc-200 p-1.5">
                {b.nama} ({b.kode})
              </td>
              <td className="border border-zinc-200 p-1.5 text-center">
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    b.tipe === 'cost' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {b.tipe}
                </span>
              </td>
              <td className="border border-zinc-200 p-1.5 text-right font-mono">{b.bobot.toFixed(4)}</td>
              <td className="border border-zinc-200 p-1.5 text-right font-bold font-mono">
                {(b.bobot * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Top Baru Card */}
      {topBaru && (
        <div className="bg-zinc-50 border border-zinc-300 border-l-4 border-l-blue-600 p-3.5 rounded mb-4">
          <div className="text-[10px] uppercase font-bold text-blue-600 tracking-wide">
            Rekomendasi Utama: Kategori Laptop Baru (Peringkat #1)
          </div>
          <div className="text-base font-bold text-zinc-900 mt-0.5">
            {topBaru.name} - Rp {new Intl.NumberFormat('id-ID').format(topBaru.price)}
          </div>
          <div className="text-xs text-zinc-700 mt-1">
            RAM: <strong>{topBaru.ram_gb}GB</strong> &nbsp;|&nbsp; SSD:{' '}
            <strong>{topBaru.storage_gb}GB</strong> &nbsp;|&nbsp; Baterai:{' '}
            <strong>{topBaru.battery_hours} Jam</strong> &nbsp;|&nbsp; Berat:{' '}
            <strong>{topBaru.weight_kg} Kg</strong> &nbsp;|&nbsp; Skor TOPSIS (Vi):{' '}
            <strong>
              {topBaru.nilai_v.toFixed(4)} ({(topBaru.nilai_v * 100).toFixed(2)}%)
            </strong>
          </div>
          {explanationsMap[topBaru.laptop_id] && (
            <div className="bg-blue-50 border border-dashed border-blue-300 p-2 rounded mt-2 text-xs text-blue-900 leading-relaxed">
              <strong>Penjelasan AI:</strong> {explanationsMap[topBaru.laptop_id]}
            </div>
          )}
        </div>
      )}

      {/* Top Second Card */}
      {topSecond && (
        <div className="bg-amber-50/50 border border-amber-300 border-l-4 border-l-amber-500 p-3.5 rounded mb-4">
          <div className="text-[10px] uppercase font-bold text-amber-700 tracking-wide">
            Rekomendasi Utama: Kategori Laptop Second (Peringkat #1)
          </div>
          <div className="text-base font-bold text-zinc-900 mt-0.5">
            {topSecond.name} - Rp {new Intl.NumberFormat('id-ID').format(topSecond.price)}
          </div>
          <div className="text-xs text-zinc-700 mt-1">
            RAM: <strong>{topSecond.ram_gb}GB</strong> &nbsp;|&nbsp; SSD:{' '}
            <strong>{topSecond.storage_gb}GB</strong> &nbsp;|&nbsp; Baterai:{' '}
            <strong>{topSecond.battery_hours} Jam</strong> &nbsp;|&nbsp; Berat:{' '}
            <strong>{topSecond.weight_kg} Kg</strong> &nbsp;|&nbsp; Skor TOPSIS (Vi):{' '}
            <strong>
              {topSecond.nilai_v.toFixed(4)} ({(topSecond.nilai_v * 100).toFixed(2)}%)
            </strong>
          </div>
          {explanationsMap[topSecond.laptop_id] && (
            <div className="bg-amber-100/60 border border-dashed border-amber-300 p-2 rounded mt-2 text-xs text-amber-900 leading-relaxed">
              <strong>Penjelasan AI:</strong> {explanationsMap[topSecond.laptop_id]}
            </div>
          )}
        </div>
      )}

      {/* Tabel Hasil TOPSIS */}
      <div className="font-bold text-zinc-900 mb-1.5">
        Tabel Hasil Pemeringkatan TOPSIS (Top 10 Rekomendasi):
      </div>
      <table className="w-full border-collapse border border-zinc-200 text-xs mb-4">
        <thead>
          <tr className="bg-zinc-100 text-zinc-800 text-[10px] uppercase font-bold">
            <th className="border border-zinc-200 p-1.5 text-center w-10">Rank</th>
            <th className="border border-zinc-200 p-1.5 text-left">Nama Laptop</th>
            <th className="border border-zinc-200 p-1.5 text-center w-14">Kondisi</th>
            <th className="border border-zinc-200 p-1.5 text-right w-24">Harga</th>
            <th className="border border-zinc-200 p-1.5 text-center w-12">RAM</th>
            <th className="border border-zinc-200 p-1.5 text-center w-14">Storage</th>
            <th className="border border-zinc-200 p-1.5 text-center w-14">Baterai</th>
            <th className="border border-zinc-200 p-1.5 text-center w-12">Berat</th>
            <th className="border border-zinc-200 p-1.5 text-right w-20">Skor TOPSIS</th>
          </tr>
        </thead>
        <tbody>
          {topsisRows.slice(0, 10).map((item) => (
            <tr
              key={`${item.kondisi}-${item.laptop_id}`}
              className={item.peringkat === 1 ? 'bg-blue-50/70 font-semibold' : ''}
            >
              <td className="border border-zinc-200 p-1.5 text-center">#{item.peringkat}</td>
              <td className="border border-zinc-200 p-1.5">
                {item.name}
                {item.peringkat === 1 && (
                  <span className="text-blue-600 text-[9px] font-bold ml-1">[BEST]</span>
                )}
              </td>
              <td className="border border-zinc-200 p-1.5 text-center uppercase text-[10px]">
                {item.kondisi}
              </td>
              <td className="border border-zinc-200 p-1.5 text-right font-mono">
                Rp {new Intl.NumberFormat('id-ID').format(item.price)}
              </td>
              <td className="border border-zinc-200 p-1.5 text-center">{item.ram_gb} GB</td>
              <td className="border border-zinc-200 p-1.5 text-center">{item.storage_gb} GB</td>
              <td className="border border-zinc-200 p-1.5 text-center">{item.battery_hours} Jam</td>
              <td className="border border-zinc-200 p-1.5 text-center">{item.weight_kg} Kg</td>
              <td className="border border-zinc-200 p-1.5 text-right font-mono font-bold">
                {(item.nilai_v * 100).toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 pt-2 border-t border-zinc-200 text-zinc-500 text-[10px] text-right">
        Dicetak otomatis oleh SPK Rekomendasi Laptop Mahasiswa (Metode ROC & TOPSIS) •{' '}
        {new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>
    </div>
  );
}
