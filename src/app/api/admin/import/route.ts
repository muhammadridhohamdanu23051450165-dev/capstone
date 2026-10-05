import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('csv_file') as File | null;

    if (!file) {
      return NextResponse.redirect(new URL('/admin/dashboard?tab=laptops&error=Berkas CSV belum dipilih', req.url));
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');

    if (lines.length < 2) {
      return NextResponse.redirect(new URL('/admin/dashboard?tab=laptops&error=Berkas CSV kosong atau tidak valid', req.url));
    }

    const firstLine = lines[0];
    const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';

    const header = firstLine.split(delimiter).map((c) => c.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().trim());

    const findCol = (keys: string[]) => {
      for (const k of keys) {
        const cleaned = k.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().trim();
        const idx = header.indexOf(cleaned);
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const idxNama = findCol(['nama', 'name', 'model', 'namalaptop', 'tipe']);
    const idxMerek = findCol(['brand', 'merek', 'merk', 'manufacturer']);
    const idxHarga = findCol(['harga', 'price', 'cost']);
    const idxRam = findCol(['ram', 'ramgb', 'memory']);
    const idxStorage = findCol(['storage', 'storagegb', 'ssd', 'hdd']);
    const idxBaterai = findCol(['baterai', 'battery', 'batteryhours']);
    const idxBerat = findCol(['berat', 'weight', 'weightkg', 'bobot']);
    const idxKondisi = findCol(['kondisi', 'condition', 'status']);
    const idxPerforma = findCol(['performa', 'performakomposit', 'performascore']);

    let importedCount = 0;
    const upsertStmt = db.prepare(`
      INSERT INTO laptops (name, brand, price, performa_komposit, processor_score, vga_score, ram_gb, storage_gb, battery_hours, weight_kg, condition, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(id) DO UPDATE SET 
        brand=excluded.brand, price=excluded.price, performa_komposit=excluded.performa_komposit,
        processor_score=excluded.processor_score, vga_score=excluded.vga_score, ram_gb=excluded.ram_gb,
        storage_gb=excluded.storage_gb, battery_hours=excluded.battery_hours, weight_kg=excluded.weight_kg,
        condition=excluded.condition, updated_at=datetime('now')
    `);

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(delimiter).map((s) => s.trim().replace(/^"|"$/g, ''));
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
        nama = row[idxNama] || '';
        if (!nama) continue;

        merek = idxMerek !== -1 ? row[idxMerek] : nama.split(' ')[0] || 'Generic';

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
        nama = row[0];
        merek = row[1] || nama.split(' ')[0] || 'Generic';
        harga = parseInt((row[2] || '').replace(/[^0-9]/g, '')) || 7000000;
        performa = parseInt((row[3] || '').replace(/[^0-9]/g, '')) || 60;
        ram = parseInt((row[4] || '').replace(/[^0-9]/g, '')) || 8;
        storage = parseInt((row[5] || '').replace(/[^0-9]/g, '')) || 512;
        baterai = parseFloat((row[6] || '').replace(',', '.')) || 6.0;
        berat = parseFloat((row[7] || '').replace(',', '.')) || 1.6;
        kondisi = (row[8] || '').toLowerCase().includes('second') ? 'second' : 'baru';
      }

      if (nama) {
        // Check if exists
        const existing = db.prepare('SELECT id FROM laptops WHERE name = ?').get(nama) as { id: number } | undefined;
        if (existing) {
          db.prepare(`
            UPDATE laptops 
            SET brand=?, price=?, performa_komposit=?, processor_score=?, vga_score=?, ram_gb=?, storage_gb=?, battery_hours=?, weight_kg=?, condition=?, updated_at=datetime('now')
            WHERE id=?
          `).run(merek, harga, performa, performa, performa, ram, storage, baterai, berat, kondisi, existing.id);
        } else {
          upsertStmt.run(nama, merek, harga, performa, performa, performa, ram, storage, baterai, berat, kondisi);
        }
        importedCount++;
      }
    }

    return NextResponse.redirect(new URL(`/admin/dashboard?tab=laptops&success=Berhasil mengimpor ${importedCount} data laptop`, req.url));
  } catch (error) {
    console.error('Import CSV error:', error);
    return NextResponse.redirect(new URL('/admin/dashboard?tab=laptops&error=Gagal mengimpor file CSV', req.url));
  }
}
