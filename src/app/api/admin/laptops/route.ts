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
    const action = (formData.get('_method') as string)?.toUpperCase();

    if (action === 'DELETE') {
      const id = parseInt(formData.get('id') as string);
      db.prepare('DELETE FROM hasil_topsis WHERE laptop_id = ?').run(id);
      db.prepare('DELETE FROM penjelasan_ai WHERE laptop_id = ?').run(id);
      db.prepare('DELETE FROM laptops WHERE id = ?').run(id);
      return NextResponse.redirect(new URL('/admin/dashboard?tab=laptops&success=Laptop berhasil dihapus', req.url));
    }

    if (action === 'PUT') {
      const id = parseInt(formData.get('id') as string);
      const name = formData.get('name') as string;
      const brand = formData.get('brand') as string;
      const price = parseInt(formData.get('price') as string);
      const performa = parseInt(formData.get('performa_komposit') as string);
      const ram_gb = parseInt(formData.get('ram_gb') as string);
      const storage_gb = parseInt(formData.get('storage_gb') as string);
      const battery_hours = parseFloat(formData.get('battery_hours') as string);
      const weight_kg = parseFloat(formData.get('weight_kg') as string);
      const condition = (formData.get('condition') as string) || 'baru';

      db.prepare(`
        UPDATE laptops 
        SET name = ?, brand = ?, price = ?, performa_komposit = ?, processor_score = ?, vga_score = ?, 
            ram_gb = ?, storage_gb = ?, battery_hours = ?, weight_kg = ?, condition = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(
        name,
        brand,
        price,
        performa,
        performa,
        performa,
        ram_gb,
        storage_gb,
        battery_hours,
        weight_kg,
        condition,
        id
      );

      return NextResponse.redirect(new URL('/admin/dashboard?tab=laptops&success=Data laptop berhasil diperbarui', req.url));
    }

    // Default: Insert new laptop
    const name = formData.get('name') as string;
    const brand = formData.get('brand') as string;
    const price = parseInt(formData.get('price') as string);
    const performa = parseInt(formData.get('performa_komposit') as string);
    const ram_gb = parseInt(formData.get('ram_gb') as string);
    const storage_gb = parseInt(formData.get('storage_gb') as string);
    const battery_hours = parseFloat(formData.get('battery_hours') as string);
    const weight_kg = parseFloat(formData.get('weight_kg') as string);
    const condition = (formData.get('condition') as string) || 'baru';

    db.prepare(`
      INSERT INTO laptops 
      (name, brand, price, performa_komposit, processor_score, vga_score, ram_gb, storage_gb, battery_hours, weight_kg, condition, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      name,
      brand,
      price,
      performa,
      performa,
      performa,
      ram_gb,
      storage_gb,
      battery_hours,
      weight_kg,
      condition
    );

    return NextResponse.redirect(new URL('/admin/dashboard?tab=laptops&success=Data laptop berhasil ditambahkan', req.url));
  } catch (error) {
    console.error('Admin laptop error:', error);
    return NextResponse.redirect(new URL('/admin/dashboard?tab=laptops&error=Terjadi kesalahan pemrosesan', req.url));
  }
}
