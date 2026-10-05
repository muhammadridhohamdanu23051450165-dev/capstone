import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { getSession } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sistem Rekomendasi Laptop - SPK TOPSIS & ROC',
  description: 'Sistem Pendukung Keputusan Pemilihan Laptop Mahasiswa Berbasis AI',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="id" className={`dark ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100 antialiased selection:bg-violet-500 selection:text-white relative">
        {/* Ambient 21st.dev colorful glow backdrops */}
        <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-80 z-0"></div>
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-violet-600/15 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none z-0"></div>
        <div className="fixed top-20 right-0 w-[500px] h-[350px] bg-gradient-to-bl from-cyan-500/15 via-blue-600/10 to-transparent blur-[110px] pointer-events-none z-0"></div>
        <div className="fixed top-60 left-0 w-[450px] h-[350px] bg-gradient-to-tr from-pink-500/10 via-purple-600/10 to-transparent blur-[110px] pointer-events-none z-0"></div>

        <Navbar user={session} />

        <main className="relative z-10 flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
