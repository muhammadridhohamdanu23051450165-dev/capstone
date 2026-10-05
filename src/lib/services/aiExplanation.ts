import { db, Laptop, KuisionerJawaban, getLaptopPerforma } from '../db';
import { TopsisRankedItem } from './topsis';

export async function generateForTopLaptops(
  jawaban: KuisionerJawaban,
  topRankedLaptops: TopsisRankedItem[],
  rocWeights: Record<string, number> = {},
  limit = 6
): Promise<Record<number, string>> {
  const selectedItems = topRankedLaptops.slice(0, limit);
  const explanations: Record<number, string> = {};

  const rankingKriteria: string[] = Array.isArray(jawaban.ranking_kriteria)
    ? (jawaban.ranking_kriteria as string[])
    : JSON.parse(jawaban.ranking_kriteria || '[]');

  let topCriteriaName = 'Spesifikasi Seimbang';
  if (rankingKriteria.length > 0) {
    const code = rankingKriteria[0];
    const map: Record<string, string> = {
      C1: 'Efisiensi Anggaran (Harga)',
      C2: 'Performa Komputasi Tinggi',
      C3: 'Kapasitas RAM Multitasking',
      C4: 'Kecepatan & Kapasitas Storage SSD',
      C5: 'Daya Tahan Baterai Seharian',
      C6: 'Portabilitas & Bobot Ringan',
    };
    topCriteriaName = map[code] ?? code;
  }

  for (const item of selectedItems) {
    const laptopId = item.laptop_id;
    const laptop = item.laptop;
    if (!laptop) continue;

    // Check cached explanation in database
    const cached = db
      .prepare('SELECT penjelasan FROM penjelasan_ai WHERE kuisioner_jawaban_id = ? AND laptop_id = ?')
      .get(jawaban.id, laptop.id) as { penjelasan: string } | undefined;

    if (cached) {
      explanations[laptop.id] = cached.penjelasan;
      continue;
    }

    const narasi = await generateNarrative(laptop, jawaban, item, topCriteriaName);

    try {
      db.prepare(
        `INSERT INTO penjelasan_ai (kuisioner_jawaban_id, laptop_id, penjelasan, created_at, updated_at) VALUES (?, ?, ?, datetime('now'), datetime('now'))`
      ).run(jawaban.id, laptop.id, narasi);
    } catch {
      // ignore insert error if already exists
    }

    explanations[laptop.id] = narasi;
  }

  return explanations;
}

async function generateNarrative(
  laptop: Laptop,
  jawaban: KuisionerJawaban,
  item: TopsisRankedItem,
  topCriteriaName: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const rank = item.peringkat || 1;
  const scorePct = item.nilai_v ? (item.nilai_v * 100).toFixed(1) : '95.0';
  const performaScore = getLaptopPerforma(laptop);

  if (apiKey) {
    try {
      const prompt = `Hasil dari Sistem Rekomendasi Laptop Mahasiswa (SPK TOPSIS), buat penjelasan ringkas (2-3 kalimat lugas) mengapa laptop berikut cocok untuk mahasiswa:\n- Nama Laptop: ${laptop.name} (${laptop.condition})\n- Harga: Rp ${new Intl.NumberFormat('id-ID').format(laptop.price)}\n- Spesifikasi: RAM ${laptop.ram_gb}GB, SSD ${laptop.storage_gb}GB, Baterai ${laptop.battery_hours} jam, Berat ${laptop.weight_kg} kg, Skor Performa: ${performaScore}\n- Peringkat Rekomendasi: Peringkat ${rank} (Skor TOPSIS: ${scorePct}%)\n- Kebutuhan Mahasiswa: Peruntukan ${jawaban.peruntukan}, Frekuensi bawa: ${jawaban.frekuensi_membawa}, Prioritas Utama: ${topCriteriaName}\nGunakan bahasa Indonesia yang profesional, ramah, dan solutif.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return text.trim();
        }
      }
    } catch {
      // Fallback below
    }
  }

  // Generator Cerdas Kontekstual (High-fidelity narrative fallback)
  const kondisiLabel = laptop.condition === 'second' ? 'kondisi second berkualitas' : 'kondisi baru bergaransi resmi';
  const hargaFormatted = `Rp ${new Intl.NumberFormat('id-ID').format(laptop.price)}`;
  const peruntukan = (jawaban.peruntukan || 'Kuliah').charAt(0).toUpperCase() + (jawaban.peruntukan || 'Kuliah').slice(1);

  const highlights: string[] = [];
  if (laptop.ram_gb >= 16) {
    highlights.push(`RAM ${laptop.ram_gb}GB yang sangat lapang untuk multitasking`);
  } else {
    highlights.push(`RAM ${laptop.ram_gb}GB yang responsif untuk komputasi harian`);
  }

  if (laptop.storage_gb >= 512) {
    highlights.push(`penyimpanan SSD ${laptop.storage_gb}GB berkecepatan tinggi`);
  }

  if (laptop.weight_kg && laptop.weight_kg <= 1.6) {
    highlights.push(
      `bobot ultra-ringan ${laptop.weight_kg} kg yang sangat nyaman dibawa (${(
        jawaban.frekuensi_membawa || 'rutin'
      ).toLowerCase()})`
    );
  } else if (laptop.battery_hours && laptop.battery_hours >= 7) {
    highlights.push(`daya tahan baterai hingga ${laptop.battery_hours} jam pemakaian`);
  }

  const highlightText = highlights.join(', didukung ');

  if (rank === 1) {
    return `Laptop ini merupakan pilihan terbaik (Peringkat 1) dengan skor preferensi TOPSIS tertinggi sebesar ${scorePct}%. Ditenagai ${highlightText}, laptop ${kondisiLabel} seharga ${hargaFormatted} ini sangat optimal dalam mengakomodasi prioritas utama Anda pada ${topCriteriaName} untuk kebutuhan ${peruntukan}.`;
  }

  return `Direkomendasikan pada Peringkat ${rank} dengan skor kecocokan ${scorePct}%. Menawarkan kombinasi seimbang antara ${highlightText}, menjadikannya alternatif yang sangat layak dipertimbangkan untuk kebutuhan ${peruntukan} dengan banderol ${hargaFormatted}.`;
}
