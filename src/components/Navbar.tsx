import Link from 'next/link';
import Image from 'next/image';
import { AuthSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface NavbarProps {
  user: AuthSession | null;
}

export async function Navbar({ user }: NavbarProps) {
  let historyCount = 0;
  if (user) {
    const { count } = await supabase
      .from('kuisioner_jawaban')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.userId);
    historyCount = count || 0;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#09090d]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(124,58,237,0.35)] group-hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition duration-300 bg-[#070719] flex items-center justify-center p-0.5">
              <Image
                src="/logo-relap.png"
                alt="ReLap Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain group-hover:scale-105 transition"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-violet-200 group-hover:to-cyan-300 transition">
                  ReLap
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  SMART AI
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 hidden sm:inline">Laptop Yang Tepat, Dengan Cara Yang Tepat</span>
            </div>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] transition"
              >
                Dashboard
              </Link>
              <Link
                href="/questionnaire"
                className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] transition"
              >
                Kuisioner
              </Link>
              <Link
                href="/riwayat"
                className="px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
              >
                <span>Riwayat Kuisioner</span>
                {historyCount > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-zinc-800 text-cyan-300 border border-cyan-500/30">
                    {historyCount}
                  </span>
                )}
              </Link>
              {user.role === 'admin' && (
                <Link
                  href="/admin/dashboard"
                  className="px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 text-amber-400/90 hover:text-amber-300 hover:bg-amber-950/20"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 p-[1px] shadow-sm">
                  <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-xs font-mono font-bold text-violet-300">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-medium text-zinc-200 truncate max-w-[120px]">{user.name}</span>
                  <span className="text-[10px] text-zinc-400 code-font capitalize flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'admin' ? 'bg-amber-400' : 'bg-cyan-400'}`}></span>
                    {user.role}
                  </span>
                </div>
              </div>
              <form action="/api/auth/logout" method="POST" className="inline">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-300 hover:bg-rose-950/30 border border-white/10 hover:border-rose-800/50 transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Keluar</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-medium text-zinc-300 hover:text-white px-3.5 py-1.5 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(124,58,237,0.35)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition active:scale-[0.98]"
              >
                <span>Daftar Akun</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
