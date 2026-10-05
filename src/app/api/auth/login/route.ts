import { NextRequest, NextResponse } from 'next/server';
import { supabase, User } from '@/lib/supabase';
import { verifyPassword, setSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;

    if (!email || !password) {
      return NextResponse.redirect(new URL('/login?error=Email dan kata sandi wajib diisi', req.url));
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user || !verifyPassword(password, (user as User).password)) {
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
