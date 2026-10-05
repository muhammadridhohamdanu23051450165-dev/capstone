'use client';

import { useState } from 'react';
import Link from 'next/link';

export interface LaptopItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  condition: string;
  ram_gb: number;
  storage_gb: number;
  battery_hours: number;
  weight_kg: number;
  performa: number;
  image_url: string;
}

interface Props {
  featured: LaptopItem[];
  gaming: LaptopItem[];
  portable: LaptopItem[];
  budget: LaptopItem[];
}

export function FeaturedLaptopsSection({ featured, gaming, portable, budget }: Props) {
  const [activeTab, setActiveTab] = useState<'all' | 'gaming' | 'portable' | 'budget'>('all');

  const currentList =
    activeTab === 'gaming'
      ? gaming
      : activeTab === 'portable'
      ? portable
      : activeTab === 'budget'
      ? budget
      : featured;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-950/50 text-cyan-300 border border-cyan-800/60 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Katalog Pilihan Terkini
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Rekomendasi Laptop Terbaru & Terbaik
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Koleksi laptop dengan nilai performa komposit unggulan yang siap dihitung kecocokannya dengan TOPSIS.
          </p>
        </div>

        {/* Kategori Tabs Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0e0e15] p-1.5 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Semua ({featured.length})
          </button>
          {gaming.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('gaming')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'gaming'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🎮 Gaming & 3D
            </button>
          )}
          {portable.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('portable')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'portable'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🎒 Portabel & Baterai
            </button>
          )}
          {budget.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('budget')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'budget'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              💰 Hemat Anggaran
            </button>
          )}
        </div>
      </div>

      {/* Grid Laptop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentList.map((laptop) => (
          <div
            key={laptop.id}
            className="group relative rounded-3xl bg-[#0e0e15]/80 border border-white/10 hover:border-violet-500/50 transition-all duration-300 overflow-hidden backdrop-blur-md flex flex-col justify-between shadow-lg hover:shadow-[0_0_30px_rgba(124,58,237,0.25)] hover:-translate-y-1"
          >
            {/* Image with overlay tags */}
            <div className="relative h-48 w-full overflow-hidden bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={laptop.image_url}
                alt={laptop.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500 filter brightness-95 group-hover:brightness-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e15] via-transparent to-black/30"></div>

              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/20">
                  {laptop.brand}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono capitalize ${
                    laptop.condition === 'second'
                      ? 'bg-amber-500/80 text-zinc-950 font-bold'
                      : 'bg-emerald-500/80 text-white font-bold'
                  }`}
                >
                  {laptop.condition || 'Baru'}
                </span>
              </div>

              {/* Performa Badge */}
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-mono font-bold bg-violet-950/80 backdrop-blur-md text-violet-300 border border-violet-500/40">
                  <svg className="w-3 h-3 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                  </svg>
                  <span>{laptop.performa} / 100</span>
                </span>
              </div>
            </div>

            {/* Laptop Body Info */}
            <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition line-clamp-2 leading-snug">
                  {laptop.name}
                </h3>
                <div className="text-base font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                  Rp {new Intl.NumberFormat('id-ID').format(laptop.price)}
                </div>
              </div>

              {/* 4 Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2 rounded-xl bg-zinc-950/70 border border-white/5 flex items-center gap-1.5 text-zinc-300">
                  <span className="text-violet-400 font-mono">RAM</span>
                  <span className="font-bold">{laptop.ram_gb} GB</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/70 border border-white/5 flex items-center gap-1.5 text-zinc-300">
                  <span className="text-indigo-400 font-mono">SSD</span>
                  <span className="font-bold">{laptop.storage_gb} GB</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/70 border border-white/5 flex items-center gap-1.5 text-zinc-300">
                  <span className="text-amber-400 font-mono">Bat</span>
                  <span className="font-bold">{laptop.battery_hours} Jam</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/70 border border-white/5 flex items-center gap-1.5 text-zinc-300">
                  <span className="text-cyan-400 font-mono">Bobot</span>
                  <span className="font-bold">{laptop.weight_kg} Kg</span>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="/questionnaire"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-gradient-to-r hover:from-violet-600 hover:to-cyan-500 text-zinc-200 hover:text-white font-semibold text-xs border border-white/10 hover:border-transparent transition duration-200"
              >
                <span>Hitung Kecocokan</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
