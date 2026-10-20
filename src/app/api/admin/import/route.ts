import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      if (inQuotes && line[i + 1] === char) {
        cur += char;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

function findColumnIndex(headers: string[], synonyms: string[]): number {
  // 1. Exact match on cleaned string
  for (const s of synonyms) {
    const cleanSyn = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const idx = headers.findIndex((h) => h === cleanSyn);
    if (idx !== -1) return idx;
  }
  // 2. Contains match
  for (const s of synonyms) {
    const cleanSyn = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const idx = headers.findIndex((h) => h.includes(cleanSyn) || (cleanSyn.length >= 3 && cleanSyn.includes(h)));
    if (idx !== -1) return idx;
  }
  return -1;
}

export async function POST(req: NextRequest) {
  const wantsJson =
    req.headers.get('accept')?.includes('application/json') ||
    req.headers.get('x-requested-with') === 'XMLHttpRequest';

  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      if (wantsJson) {
        return NextResponse.json({ error: 'Sesi berakhir atau Anda bukan admin' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/admin/dashboard?tab=laptops&error=Akses ditolak', req.url), 303);
    }

    const formData = await req.formData();
    const file = formData.get('csv_file') as File | null;

    if (!file || typeof file === 'string' || file.size === 0) {
      if (wantsJson) {
        return NextResponse.json({ error: 'Berkas CSV belum dipilih atau kosong' }, { status: 400 });
      }
      return NextResponse.redirect(new URL('/admin/dashboard?tab=laptops&error=Berkas CSV belum dipilih', req.url), 303);
    }

    let text = await file.text();
    // Strip UTF-8 BOM if present
    text = text.replace(/^\uFEFF/, '');

    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');

    if (lines.length < 2) {
      if (wantsJson) {
        return NextResponse.json({ error: 'Berkas CSV minimal harus memiliki header dan 1 baris data' }, { status: 400 });
      }
      return NextResponse.redirect(new URL('/admin/dashboard?tab=laptops&error=Berkas CSV kosong atau tidak valid', req.url), 303);
    }

    const firstLine = lines[0];
    const countCommas = (firstLine.match(/,/g) || []).length;
    const countSemicolons = (firstLine.match(/;/g) || []).length;
    const countTabs = (firstLine.match(/\t/g) || []).length;
    let delimiter = ',';
    if (countSemicolons > countCommas && countSemicolons > countTabs) delimiter = ';';
    else if (countTabs > countCommas && countTabs > countSemicolons) delimiter = '\t';

    const rawHeaders = parseCsvLine(firstLine, delimiter);
    const headerCleaned = rawHeaders.map((c) => c.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().trim());

    const idxNama = findColumnIndex(headerCleaned, ['nama', 'name', 'model', 'namalaptop', 'tipe', 'produk', 'laptop']);
    const idxMerek = findColumnIndex(headerCleaned, ['brand', 'merek', 'merk', 'manufacturer', 'vendor']);
    const idxHarga = findColumnIndex(headerCleaned, ['harga', 'price', 'cost', 'rp', 'rupiah', 'hargarp']);
    const idxRam = findColumnIndex(headerCleaned, ['ram', 'ramgb', 'memory', 'memori']);
    const idxStorage = findColumnIndex(headerCleaned, ['storage', 'storagegb', 'ssd', 'hdd', 'rom', 'penyimpanan', 'kapasitas']);
    const idxBaterai = findColumnIndex(headerCleaned, ['baterai', 'battery', 'batteryhours', 'bateraijam', 'daya', 'dayatahan']);
    const idxBerat = findColumnIndex(headerCleaned, ['berat', 'weight', 'weightkg', 'bobot', 'beratkg', 'bobotkg']);
    const idxKondisi = findColumnIndex(headerCleaned, ['kondisi', 'condition', 'status']);
    const idxPerforma = findColumnIndex(headerCleaned, ['performa', 'performakomposit', 'performascore', 'processor', 'skor', 'score', 'cpu']);

    // Fetch existing laptops for duplicate/update check
    const { data: existingLaptops, error: fetchErr } = await supabase.from('laptops').select('id, name');
    if (fetchErr) {
      console.error('Supabase fetch existing laptops error:', fetchErr);
    }
    const existingMap = new Map((existingLaptops || []).map((l: { id: number; name: string }) => [l.name.toLowerCase().trim(), l.id]));

    let importedCount = 0;
    const toInsert: object[] = [];
    const toUpdate: { id: number; data: object }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i], delimiter);
      if (!row || row.length === 0 || row.every((c) => c === '')) continue;

      let nama = '';
      let merek = '';
      let harga = 7000000;
      let performa = 60;
      let ram = 8;
      let storage = 512;
      let baterai = 6.0;
      let berat = 1.6;
      let kondisi = 'baru';

      if (idxNama !== -1) {
        nama = (row[idxNama] || '').replace(/^"|"$/g, '').trim();
        if (!nama) continue;

        merek = idxMerek !== -1 ? (row[idxMerek] || '').trim() : nama.split(' ')[0] || 'Generic';

        const rawHarga = idxHarga !== -1 ? row[idxHarga] : '0';
        const digits = parseInt(rawHarga.replace(/[^0-9]/g, '')) || 0;
        harga = digits < 1000 && digits > 0 ? digits * 1000000 : digits || 7000000;

        const rawRam = idxRam !== -1 ? row[idxRam] : '8';
        ram = parseInt(rawRam.replace(/[^0-9]/g, '')) || 8;

        const rawStorage = idxStorage !== -1 ? row[idxStorage] : '512';
        let sVal = parseInt(rawStorage.replace(/[^0-9]/g, '')) || 512;
        if (rawStorage.toLowerCase().includes('tb') && sVal < 10) sVal *= 1024;
        storage = sVal;

        const rawBat = idxBaterai !== -1 ? row[idxBaterai] : '6.0';
        baterai = parseFloat(rawBat.replace(',', '.').replace(/[^0-9.]/g, '')) || 6.0;

        const rawBerat = idxBerat !== -1 ? row[idxBerat] : '1.6';
        berat = parseFloat(rawBerat.replace(',', '.').replace(/[^0-9.]/g, '')) || 1.6;

        const rawKondisi = idxKondisi !== -1 ? row[idxKondisi].toLowerCase() : 'baru';
        kondisi = rawKondisi.includes('second') || rawKondisi.includes('bekas') ? 'second' : 'baru';

        const rawPerforma = idxPerforma !== -1 ? row[idxPerforma] : '';
        performa = parseInt(rawPerforma.replace(/[^0-9]/g, '')) || 60;
      } else if (row.length >= 8) {
        // Fallback default positional columns
        nama = (row[0] || '').trim();
        if (!nama) continue;
        merek = (row[1] || '').trim() || nama.split(' ')[0] || 'Generic';
        harga = parseInt((row[2] || '').replace(/[^0-9]/g, '')) || 7000000;
        performa = parseInt((row[3] || '').replace(/[^0-9]/g, '')) || 60;
        ram = parseInt((row[4] || '').replace(/[^0-9]/g, '')) || 8;
        storage = parseInt((row[5] || '').replace(/[^0-9]/g, '')) || 512;
        baterai = parseFloat((row[6] || '').replace(',', '.')) || 6.0;
        berat = parseFloat((row[7] || '').replace(',', '.')) || 1.6;
        kondisi = (row[8] || '').toLowerCase().includes('second') ? 'second' : 'baru';
      }

      if (nama) {
        const laptopData = {
          name: nama,
          brand: merek,
          price: harga,
          performa_komposit: performa,
          processor_score: performa,
          vga_score: performa,
          ram_gb: ram,
          storage_gb: storage,
          battery_hours: baterai,
          weight_kg: berat,
          condition: kondisi,
          updated_at: new Date().toISOString(),
        };

        const existingId = existingMap.get(nama.toLowerCase().trim());
        if (existingId) {
          toUpdate.push({ id: existingId, data: laptopData });
        } else {
          toInsert.push(laptopData);
        }
        importedCount++;
      }
    }

    if (importedCount === 0) {
      if (wantsJson) {
        return NextResponse.json({ error: 'Tidak ada baris data valid yang dapat diimpor dari file CSV' }, { status: 400 });
      }
      return NextResponse.redirect(new URL('/admin/dashboard?tab=laptops&error=Tidak ada baris data valid', req.url), 303);
    }

    // Batch insert new laptops in chunks
    if (toInsert.length > 0) {
      const CHUNK_SIZE = 50;
      for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
        const chunk = toInsert.slice(i, i + CHUNK_SIZE);
        const { error: insertErr } = await supabase.from('laptops').insert(chunk);
        if (insertErr) {
          console.error('Supabase batch insert error:', insertErr);
          throw new Error(`Gagal menyimpan data baru: ${insertErr.message}`);
        }
      }
    }

    // Update existing laptops in parallel chunks of 10
    if (toUpdate.length > 0) {
      const CHUNK_SIZE = 10;
      for (let i = 0; i < toUpdate.length; i += CHUNK_SIZE) {
        const chunk = toUpdate.slice(i, i + CHUNK_SIZE);
        await Promise.all(
          chunk.map(async ({ id, data }) => {
            const { error: updateErr } = await supabase.from('laptops').update(data).eq('id', id);
            if (updateErr) {
              console.error(`Supabase update error ID ${id}:`, updateErr);
            }
          })
        );
      }
    }

    // Invalidate Next.js cache so updates appear immediately on Vercel and local
    try {
      revalidatePath('/admin/dashboard');
      revalidatePath('/');
      revalidatePath('/questionnaire');
      revalidatePath('/riwayat');
    } catch (e) {
      console.warn('Revalidate path warning:', e);
    }

    const msg = `Berhasil mengimpor ${importedCount} data laptop (${toInsert.length} baru, ${toUpdate.length} diperbarui)`;

    if (wantsJson) {
      return NextResponse.json({
        success: true,
        count: importedCount,
        inserted: toInsert.length,
        updated: toUpdate.length,
        message: msg,
      });
    }

    return NextResponse.redirect(new URL(`/admin/dashboard?tab=laptops&success=${encodeURIComponent(msg)}`, req.url), 303);
  } catch (error: any) {
    console.error('Import CSV error:', error);
    const errMessage = error?.message || 'Terjadi kesalahan saat memproses file CSV';
    if (wantsJson) {
      return NextResponse.json({ error: errMessage }, { status: 500 });
    }
    return NextResponse.redirect(new URL(`/admin/dashboard?tab=laptops&error=${encodeURIComponent(errMessage)}`, req.url), 303);
  }
}
