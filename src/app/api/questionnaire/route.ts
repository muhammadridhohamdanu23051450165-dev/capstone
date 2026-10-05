import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase, Laptop, Kriteria, KuisionerJawaban } from '@/lib/supabase';
import { calculateRocWeights } from '@/lib/services/roc';
import { calculateTopsis, TopsisRankedItem } from '@/lib/services/topsis';
import { generateForTopLaptops } from '@/lib/services/aiExplanation';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Harap masuk ke akun terlebih dahulu' }, { status: 401 });
    }

    const body = await req.json();
    const {
      judul,
      tanggal_pengisian,
      budget_min,
      budget_max,
      peruntukan,
      ranking_kriteria,
      merek_pilihan,
      kondisi_pilihan,
      frekuensi_membawa,
    } = body;

    if (!budget_min || !budget_max || !peruntukan || !ranking_kriteria || !kondisi_pilihan) {
      return NextResponse.json({ error: 'Parameter kuisioner tidak lengkap' }, { status: 400 });
    }

    const tgl = tanggal_pengisian || new Date().toISOString().split('T')[0];
    const generatedTitle =
      judul?.trim() ||
      `Konsultasi ${peruntukan.charAt(0).toUpperCase() + peruntukan.slice(1)} (${new Date().toLocaleDateString('id-ID')})`;

    // 1. Simpan KuisionerJawaban
    const { data: jawabanRow, error: jawabanError } = await supabase
      .from('kuisioner_jawaban')
      .insert({
        user_id: session.userId,
        budget_min: Number(budget_min),
        budget_max: Number(budget_max),
        peruntukan,
        ranking_kriteria: JSON.stringify(ranking_kriteria),
        merek_pilihan: JSON.stringify(merek_pilihan || ['semua']),
        kondisi_pilihan,
        frekuensi_membawa: frekuensi_membawa || 'Rutin Setiap Hari',
        judul: generatedTitle,
        tanggal_pengisian: tgl,
      })
      .select('id')
      .single();

    if (jawabanError || !jawabanRow) {
      throw new Error(jawabanError?.message || 'Gagal menyimpan jawaban');
    }

    const jawabanId = jawabanRow.id;

    const jawaban: KuisionerJawaban = {
      id: jawabanId,
      user_id: session.userId,
      budget_min: Number(budget_min),
      budget_max: Number(budget_max),
      peruntukan,
      ranking_kriteria,
      merek_pilihan: merek_pilihan || ['semua'],
      kondisi_pilihan,
      frekuensi_membawa: frekuensi_membawa || 'Rutin Setiap Hari',
      judul: generatedTitle,
      tanggal_pengisian: tgl,
    };

    // 2. TAHAP 1: Hitung Bobot ROC
    const rocWeights = calculateRocWeights(ranking_kriteria);
    const { data: criteriaDb } = await supabase.from('kriteria').select('*');
    const criteriaList = (criteriaDb || []) as Kriteria[];
    const criteriaByCode: Record<string, Kriteria> = {};
    for (const c of criteriaList) {
      criteriaByCode[c.kode] = c;
    }

    const rocWeightsMap: Record<string, number> = {};
    const bobotInserts: object[] = [];
    for (const [code, item] of Object.entries(rocWeights)) {
      const kModel = criteriaByCode[code];
      if (kModel) {
        bobotInserts.push({
          kuisioner_jawaban_id: jawabanId,
          kriteria_id: kModel.id,
          prioritas: item.prioritas,
          bobot: item.bobot,
        });
      }
      rocWeightsMap[code] = item.bobot;
    }

    if (bobotInserts.length > 0) {
      await supabase.from('bobot_kriteria_hasil').insert(bobotInserts);
    }

    // 3. TAHAP 2: Filter Data & Jalankan Algoritme TOPSIS
    const { data: allLaptopsRaw } = await supabase
      .from('laptops')
      .select('*')
      .not('price', 'is', null);
    const allLaptops = (allLaptopsRaw || []) as Laptop[];

    let filtered = allLaptops.filter((l) => l.price >= jawaban.budget_min && l.price <= jawaban.budget_max);

    const isAllBrands = !merekPilihanHasSpecific(jawaban.merek_pilihan);
    if (!isAllBrands) {
      const brandsList = (Array.isArray(jawaban.merek_pilihan) ? jawaban.merek_pilihan : []) as string[];
      filtered = filtered.filter((l) => brandsList.some((b) => b.toLowerCase() === (l.brand || '').toLowerCase()));
    }

    if (filtered.length === 0) {
      filtered = allLaptops.slice(0, 50);
    }

    const topsisInserts: object[] = [];
    let topLaptopsForAi: TopsisRankedItem[] = [];

    // 3A. Laptop Baru
    if (jawaban.kondisi_pilihan === 'baru' || jawaban.kondisi_pilihan === 'keduanya') {
      let laptopsBaru = filtered.filter((l) => (l.condition || 'baru').toLowerCase() === 'baru');
      if (laptopsBaru.length === 0) {
        laptopsBaru = allLaptops.filter((l) => (l.condition || 'baru').toLowerCase() === 'baru').slice(0, 30);
      }

      if (laptopsBaru.length > 0) {
        const topsisBaru = calculateTopsis(laptopsBaru, rocWeightsMap);
        for (const item of topsisBaru.ranked) {
          topsisInserts.push({
            kuisioner_jawaban_id: jawabanId,
            laptop_id: item.laptop_id,
            kondisi: 'baru',
            nilai_v: item.nilai_v,
            peringkat: item.peringkat,
          });
        }
        topLaptopsForAi = topLaptopsForAi.concat(topsisBaru.ranked.slice(0, 3));
      }
    }

    // 3B. Laptop Second
    if (jawaban.kondisi_pilihan === 'second' || jawaban.kondisi_pilihan === 'keduanya') {
      let laptopsSecond = filtered.filter((l) => (l.condition || '').toLowerCase() === 'second');
      if (laptopsSecond.length === 0) {
        laptopsSecond = allLaptops.filter((l) => (l.condition || '').toLowerCase() === 'second').slice(0, 30);
      }

      if (laptopsSecond.length > 0) {
        const topsisSecond = calculateTopsis(laptopsSecond, rocWeightsMap);
        for (const item of topsisSecond.ranked) {
          topsisInserts.push({
            kuisioner_jawaban_id: jawabanId,
            laptop_id: item.laptop_id,
            kondisi: 'second',
            nilai_v: item.nilai_v,
            peringkat: item.peringkat,
          });
        }
        topLaptopsForAi = topLaptopsForAi.concat(topsisSecond.ranked.slice(0, 3));
      }
    }

    if (topsisInserts.length > 0) {
      await supabase.from('hasil_topsis').insert(topsisInserts);
    }

    // 4. TAHAP 3: Generate AI Explanation Cache
    await generateForTopLaptops(jawaban, topLaptopsForAi, rocWeightsMap, 6);

    return NextResponse.json({ success: true, jawabanId });
  } catch (error) {
    console.error('Questionnaire error:', error);
    return NextResponse.json({ error: 'Gagal memproses kuisioner' }, { status: 500 });
  }
}

function merekPilihanHasSpecific(merek: string | string[]): boolean {
  if (Array.isArray(merek)) {
    return merek.length > 0 && !merek.includes('semua');
  }
  return false;
}
