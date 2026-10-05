export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.08] bg-[#09090d]/80 backdrop-blur-xl py-8 text-xs text-zinc-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse"></span>
            <span className="code-font text-xs font-semibold text-zinc-200">LaptopSPK &bull; Algoritme TOPSIS & ROC</span>
          </div>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="text-zinc-400">Sistem Pendukung Keputusan Pemilihan Laptop Mahasiswa Berbasis AI</span>
        </div>

        {/* Kontak No HP / WhatsApp & Facebook */}
        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/50 hover:border-emerald-600 transition shadow-sm"
          >
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.825 2.791.826 3.182 0 5.768-2.587 5.768-5.766-.001-3.181-2.587-5.767-5.768-5.767zm3.393 8.163c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.128-.521-1.615-.669-2.716-2.316-2.799-2.427-.083-.111-.663-.882-.663-1.682s.421-1.194.571-1.357c.149-.163.328-.204.437-.204.108 0 .217.001.312.006.101.005.236-.038.37.284.144.344.492 1.197.535 1.285.043.088.072.19.014.305-.058.115-.088.187-.174.288-.087.101-.183.226-.261.304-.088.087-.18.181-.077.357.103.176.458.756.983 1.224.675.602 1.244.788 1.42.875.176.087.279.073.383-.044.103-.118.444-.517.562-.693.118-.176.236-.147.397-.088.161.059 1.02.481 1.196.569.176.088.293.132.337.206.044.073.044.425-.1.83z" />
            </svg>
            <span>No WhatsApp / Bantuan</span>
          </a>

          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 border border-blue-800/50 hover:border-blue-600 transition shadow-sm"
          >
            <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
