import { NextRequest, NextResponse } from 'next/server';
import { db, User } from '@/lib/db';
import { verifyPassword, setSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;

    if (!email || !password) {
      return NextResponse.redirect(new URL('/login?error=Email dan kata sandi wajib diisi', req.url));
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.redirect(new URL('/login?error=Email atau kata sandi tidak cocok', req.url));
    }

    await setSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const targetUrl = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(targetUrl, req.url));
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.redirect(new URL('/login?error=Terjadi kesalahan saat masuk', req.url));
  }
}
