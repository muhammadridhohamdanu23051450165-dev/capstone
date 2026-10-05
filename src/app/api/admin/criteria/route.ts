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
    const id = parseInt(formData.get('id') as string);
    const nama = formData.get('nama') as string;
    const tipe = formData.get('tipe') as 'benefit' | 'cost';
    const bobot = parseFloat((formData.get('bobot') as string) || '0.1667');
    const deskripsi = (formData.get('deskripsi') as string) || '';

    db.prepare(`
      UPDATE kriteria 
      SET nama = ?, tipe = ?, bobot = ?, deskripsi = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(nama, tipe, bobot, deskripsi, id);

    return NextResponse.redirect(new URL('/admin/dashboard?tab=criteria&success=Kriteria berhasil diperbarui', req.url));
  } catch (error) {
    console.error('Update criteria error:', error);
    return NextResponse.redirect(new URL('/admin/dashboard?tab=criteria&error=Gagal memperbarui kriteria', req.url));
  }
}
