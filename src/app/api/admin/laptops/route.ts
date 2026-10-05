import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

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
      await supabase.from('hasil_topsis').delete().eq('laptop_id', id);
      await supabase.from('penjelasan_ai').delete().eq('laptop_id', id);
      await supabase.from('laptops').delete().eq('id', id);
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

      await supabase
        .from('laptops')
        .update({
          name, brand, price,
          performa_komposit: performa,
          processor_score: performa,
          vga_score: performa,
          ram_gb, storage_gb, battery_hours, weight_kg, condition,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

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

    await supabase.from('laptops').insert({
      name, brand, price,
      performa_komposit: performa,
      processor_score: performa,
      vga_score: performa,
      ram_gb, storage_gb, battery_hours, weight_kg, condition,
    });

    return NextResponse.redirect(new URL('/admin/dashboard?tab=laptops&success=Data laptop berhasil ditambahkan', req.url));
  } catch (error) {
    console.error('Admin laptop error:', error);
    return NextResponse.redirect(new URL('/admin/dashboard?tab=laptops&error=Terjadi kesalahan pemrosesan', req.url));
  }
}
