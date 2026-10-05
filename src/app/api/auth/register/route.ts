import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
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
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.redirect(
        new URL('/register?error=Email tersebut sudah terdaftar', req.url)
      );
    }

    const hashed = hashPassword(password);
    const stmt = db.prepare(
      'INSERT INTO users (name, email, phone, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))'
    );
    const result = stmt.run(name, email, phone, hashed, 'mahasiswa');
    const newUserId = Number(result.lastInsertRowid);

    await setSession({
      id: newUserId,
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
