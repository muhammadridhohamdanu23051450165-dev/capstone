import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db, KuisionerJawaban } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const id = parseInt(formData.get('id') as string);

    if (!id) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const item = db.prepare('SELECT * FROM kuisioner_jawaban WHERE id = ?').get(id) as
      | KuisionerJawaban
      | undefined;

    if (!item) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    if (item.user_id !== session.userId && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete cascading
    db.prepare('DELETE FROM hasil_topsis WHERE kuisioner_jawaban_id = ?').run(id);
    db.prepare('DELETE FROM bobot_kriteria_hasil WHERE kuisioner_jawaban_id = ?').run(id);
    db.prepare('DELETE FROM penjelasan_ai WHERE kuisioner_jawaban_id = ?').run(id);
    db.prepare('DELETE FROM kuisioner_jawaban WHERE id = ?').run(id);

    return NextResponse.redirect(new URL('/riwayat?success=Riwayat berhasil dihapus', req.url));
  } catch (error) {
    console.error('Delete history error:', error);
    return NextResponse.redirect(new URL('/riwayat?error=Gagal menghapus riwayat', req.url));
  }
}
