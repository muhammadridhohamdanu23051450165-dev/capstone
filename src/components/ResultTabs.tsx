'use client';

import { useState } from 'react';

export interface LaptopResultCardProps {
  id: number;
  laptop_id: number;
  peringkat: number;
  nilai_v: number;
  skor_persen: number;
  kondisi: string;
  name: string;
  brand: string;
  price: number;
  ram_gb: number;
  storage_gb: number;
  battery_hours: number;
  weight_kg: number;
  performa: number;
  image_url: string;
  shopee_url: string;
  tokopedia_url: string;
  facebook_url: string;
  blibli_url: string;
  bukalapak_url: string;
  narasi?: string;
}

interface Props {
  hasilBaru: LaptopResultCardProps[];
  hasilSecond: LaptopResultCardProps[];
  kondisiPilihan: string;
}

export function ResultTabs({ hasilBaru, hasilSecond, kondisiPilihan }: Props) {
  const showTwoTabs = kondisiPilihan === 'keduanya';
  const [activeTab, setActiveTab] = useState<'baru' | 'second'>(
    kondisiPilihan === 'second' ? 'second' : 'baru'
  );

  const renderCard = (item: LaptopResultCardProps) => {
    const isTop = item.peringkat === 1;

    return (
      <div
        key={`${item.kondisi}-${item.laptop_id}-${item.peringkat}`}
        className={`group relative rounded-3xl border ${
          isTop
            ? 'bg-gradient-to-br from-violet-950/30 via-[#0e0e15] to-[#09090d] border-violet-500/50 shadow-[0_0_40px_rgba(124,58,237,0.25)] ring-1 ring-violet-500/30'
            : 'bg-[#0e0e15]/80 border-white/10 hover:border-violet-500/40'
        } p-6 sm:p-7 backdrop-blur-xl transition duration-300 space-y-6`}
      >
        {/* Main Card Header with Image and Details */}
        <div className="flex flex-col md:flex-row items-stretch gap-6">
          {/* Laptop Image with overlays */}
          <div className="relative w-full md:w-64 h-52 md:h-auto min-h-[190px] rounded-2xl overflow-hidden bg-zinc-950 flex-shrink-0 border border-white/10 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500 filter brightness-95 group-hover:brightness-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/20">
                {item.brand}
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                  item.kondisi === 'second' ? 'bg-amber-500 text-zinc-950' : 'bg-emerald-500 text-white'
                }`}
              >
                {item.kondisi === 'second' ? 'Second Pilihan' : 'Baru Resmi'}
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-300 bg-black/70 px-2 py-0.5 rounded-lg border border-white/10">
                ⚡ Skor: {item.performa}/100
              </span>
              <span className="text-cyan-300 font-bold">#{item.peringkat}</span>
            </div>
          </div>

          {/* Information & Score */}
          <div className="flex-grow flex flex-col justify-between space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs font-mono font-bold ${
                      isTop
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {isTop ? '⭐ Peringkat #1 (Pilihan Terbaik)' : `Peringkat #${item.peringkat}`}
                  </span>
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    {item.brand}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{item.name}</h2>
                <div className="text-2xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 pt-1">
                  Rp {new Intl.NumberFormat('id-ID').format(item.price)}
                </div>
              </div>

              {/* Skor Kecocokan TOPSIS (Vi) */}
              <div className="p-4 rounded-2xl bg-zinc-950/90 border border-white/10 text-center sm:min-w-[170px] self-start shadow-inner">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-0.5">
                  Kecocokan TOPSIS
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">{item.skor_persen}%</div>
                <div className="mt-2 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, item.skor_persen)}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-zinc-400 mt-1.5 block font-mono">
                  Nilai V: {item.nilai_v.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Spesifikasi Ringkas 5 Kolom */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5 text-xs">
                <span className="text-[10px] text-zinc-400 block font-mono">Performa CPU+GPU</span>
                <span className="font-bold text-zinc-200 font-mono">{item.performa} / 100</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5 text-xs">
                <span className="text-[10px] text-zinc-400 block font-mono">RAM Multitasking</span>
                <span className="font-bold text-zinc-200 font-mono">{item.ram_gb} GB</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5 text-xs">
                <span className="text-[10px] text-zinc-400 block font-mono">Storage SSD</span>
                <span className="font-bold text-zinc-200 font-mono">{item.storage_gb} GB</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5 text-xs">
                <span className="text-[10px] text-zinc-400 block font-mono">Daya Baterai</span>
                <span className="font-bold text-zinc-200 font-mono">{item.battery_hours} Jam</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5 text-xs">
                <span className="text-[10px] text-zinc-400 block font-mono">Berat Portabilitas</span>
                <span className="font-bold text-zinc-200 font-mono">{item.weight_kg} Kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Penjelasan Naratif AI */}
        {item.narasi && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/30 via-zinc-950/80 to-cyan-950/20 border border-violet-500/30 space-y-2 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                <svg className="w-4 h-4 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Analisis Rekomendasi Cerdas (AI Generated):</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                AI Assisted
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">{item.narasi}</p>
          </div>
        )}

        {/* Link Pembelian Marketplace */}
        <div className="pt-3.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="font-semibold text-white">Cek Ketersediaan / Beli:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={item.shopee_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#ee4d2d]/15 text-[#ff6740] hover:bg-[#ee4d2d] hover:text-white border border-[#ee4d2d]/30 transition shadow-sm"
              title={`Cari '${item.brand} ${item.name}' di Shopee`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 7.5h-2.25a5.25 5.25 0 0 0-10.5 0H4.5A1.5 1.5 0 0 0 3 9v11.25A2.25 2.25 0 0 0 5.25 22.5h13.5A2.25 2.25 0 0 0 21 20.25V9a1.5 1.5 0 0 0-1.5-1.5zm-7.5-3.75a3.75 3.75 0 0 1 3.75 3.75h-7.5a3.75 3.75 0 0 1 3.75-3.75z" />
              </svg>
              <span>Shopee</span>
            </a>

            <a
              href={item.tokopedia_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#03ac0e]/15 text-[#42d14e] hover:bg-[#03ac0e] hover:text-white border border-[#03ac0e]/30 transition shadow-sm"
              title={`Cari '${item.brand} ${item.name}' di Tokopedia`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z" />
              </svg>
              <span>Tokopedia</span>
            </a>

            <a
              href={item.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1877f2]/15 text-[#4c9eff] hover:bg-[#1877f2] hover:text-white border border-[#1877f2]/30 transition shadow-sm"
              title={`Cari '${item.brand} ${item.name}' di Facebook Marketplace`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </a>

            <a
              href={item.blibli_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0095da]/15 text-[#38bdf8] hover:bg-[#0095da] hover:text-white border border-[#0095da]/30 transition shadow-sm"
              title={`Cari '${item.brand} ${item.name}' di Blibli`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>Blibli</span>
            </a>

            <a
              href={item.bukalapak_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#e31e52]/15 text-[#fb7185] hover:bg-[#e31e52] hover:text-white border border-[#e31e52]/30 transition shadow-sm"
              title={`Cari '${item.brand} ${item.name}' di Bukalapak`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
              </svg>
              <span>Bukalapak</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {showTwoTabs ? (
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('baru')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'baru'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <span>Laptop Baru</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                activeTab === 'baru' ? 'bg-zinc-900 text-white' : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {hasilBaru.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('second')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'second'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <span>Laptop Second</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                activeTab === 'second' ? 'bg-zinc-900 text-white' : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {hasilSecond.length}
            </span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono bg-zinc-900 border border-zinc-800 text-zinc-200 capitalize">
            Kategori Hasil: Laptop {kondisiPilihan} (
            {kondisiPilihan === 'second' ? hasilSecond.length : hasilBaru.length} unit)
          </span>
        </div>
      )}

      {/* Tab Baru */}
      {(kondisiPilihan === 'baru' || (showTwoTabs && activeTab === 'baru')) && (
        <div className="space-y-6">
          {hasilBaru.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0e0e15]/60 border border-white/10 text-zinc-400 text-xs">
              Tidak ada laptop baru yang memenuhi rentang harga dan filter merek yang dipilih.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">{hasilBaru.map(renderCard)}</div>
          )}
        </div>
      )}

      {/* Tab Second */}
      {(kondisiPilihan === 'second' || (showTwoTabs && activeTab === 'second')) && (
        <div className="space-y-6">
          {hasilSecond.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0e0e15]/60 border border-white/10 text-zinc-400 text-xs">
              Tidak ada laptop second yang memenuhi rentang harga dan filter merek yang dipilih.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">{hasilSecond.map(renderCard)}</div>
          )}
        </div>
      )}
    </div>
  );
}
