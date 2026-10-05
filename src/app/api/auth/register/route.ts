import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, setSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim() || null;
    const password = formData.get('password') as string;
    const password_confirmation = formData.get('password_confirmation') as string;

    if (!name || !email || !password) {
      return NextResponse.redirect(new URL('/register?error=Semua bidang wajib diisi', req.url));
    }

    if (password.length < 8) {
      return NextResponse.redirect(
        new URL('/register?error=Kata sandi minimal 8 karakter', req.url)
      );
    }

    if (password !== password_confirmation) {
      return NextResponse.redirect(
        new URL('/register?error=Konfirmasi kata sandi tidak cocok', req.url)
      );
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.redirect(
        new URL('/register?error=Email tersebut sudah terdaftar', req.url)
      );
    }

    const hashed = hashPassword(password);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ name, email, phone, password: hashed, role: 'mahasiswa' })
      .select('id')
      .single();

    if (error || !newUser) {
      throw new Error(error?.message || 'Gagal membuat akun');
    }

    await setSession({
      id: newUser.id,
      name,
      email,
      role: 'mahasiswa',
    });

    return NextResponse.redirect(new URL('/dashboard?success=Akun berhasil didaftarkan!', req.url));
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.redirect(new URL('/register?error=Terjadi kesalahan saat pendaftaran', req.url));
  }
}
