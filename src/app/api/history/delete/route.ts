import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

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

    const { data: item } = await supabase
      .from('kuisioner_jawaban')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (!item) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    if (item.user_id !== session.userId && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete cascading (FK constraints handle children, but explicit for safety)
    await supabase.from('hasil_topsis').delete().eq('kuisioner_jawaban_id', id);
    await supabase.from('bobot_kriteria_hasil').delete().eq('kuisioner_jawaban_id', id);
    await supabase.from('penjelasan_ai').delete().eq('kuisioner_jawaban_id', id);
    await supabase.from('kuisioner_jawaban').delete().eq('id', id);

    return NextResponse.redirect(new URL('/riwayat?success=Riwayat berhasil dihapus', req.url));
  } catch (error) {
    console.error('Delete history error:', error);
    return NextResponse.redirect(new URL('/riwayat?error=Gagal menghapus riwayat', req.url));
  }
}
