'use client';

import { useState } from 'react';
import { Laptop, Kriteria, User } from '@/lib/db';

interface Props {
  initialTab: string;
  totalUsers: number;
  totalMahasiswa: number;
  totalLaptops: number;
  totalLaptopsBaru: number;
  totalLaptopsSecond: number;
  totalKuisioner: number;
  laptops: Laptop[];
  criteria: Kriteria[];
  users: (User & { kuisioner_count?: number })[];
  success?: string;
  error?: string;
}

export function AdminPanelTabs({
  initialTab,
  totalUsers,
  totalMahasiswa,
  totalLaptops,
  totalLaptopsBaru,
  totalLaptopsSecond,
  totalKuisioner,
  laptops,
  criteria,
  users,
  success,
  error,
}: Props) {
  const [tab, setTab] = useState<'laptops' | 'criteria' | 'users'>(
    (initialTab as 'laptops' | 'criteria' | 'users') || 'laptops'
  );

  const [modalLaptop, setModalLaptop] = useState<Partial<Laptop> | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [modalCsv, setModalCsv] = useState(false);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
              ADMIN CONTROL PANEL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pengelolaan Data & Parameter SPK
          </h1>
          <p className="text-xs text-zinc-400">
            Kelola master katalog laptop, 6 kriteria acuan pembobotan, dan data pengguna sistem.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalCsv(true)}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Impor CSV</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setModalLaptop({
                name: '',
                brand: '',
                price: 8000000,
                performa_komposit: 70,
                ram_gb: 8,
                storage_gb: 512,
                battery_hours: 6.0,
                weight_kg: 1.6,
                condition: 'baru',
              });
              setIsEdit(false);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah Laptop Manual</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200 text-xs">
          {error}
        </div>
      )}

      {/* 4 Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5">
          <span className="text-[10px] text-zinc-400 uppercase font-mono block">Total Laptop</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{totalLaptops} Unit</div>
          <span className="text-[10px] text-zinc-500 font-mono">
            {totalLaptopsBaru} Baru &bull; {totalLaptopsSecond} Second
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5">
          <span className="text-[10px] text-zinc-400 uppercase font-mono block">Total Pengguna</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{totalUsers} Akun</div>
          <span className="text-[10px] text-cyan-400 font-mono">{totalMahasiswa} Mahasiswa</span>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5">
          <span className="text-[10px] text-zinc-400 uppercase font-mono block">Total Kuisioner</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{totalKuisioner} Sesi</div>
          <span className="text-[10px] text-violet-400 font-mono">Riwayat Rekomendasi</span>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5">
          <span className="text-[10px] text-zinc-400 uppercase font-mono block">Kriteria Keputusan</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{criteria.length} Kriteria</div>
          <span className="text-[10px] text-emerald-400 font-mono">Metode ROC + TOPSIS</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-1">
        <button
          type="button"
          onClick={() => setTab('laptops')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            tab === 'laptops'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Katalog Laptop ({laptops.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('criteria')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            tab === 'criteria'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          6 Kriteria Keputusan ({criteria.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            tab === 'users'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Daftar Pengguna ({users.length})
        </button>
      </div>

      {/* TAB 1: LAPTOPS */}
      {tab === 'laptops' && (
        <div className="rounded-3xl bg-[#0e0e15]/80 border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-zinc-400 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Nama & Brand</th>
                  <th className="py-3 px-4">Harga</th>
                  <th className="py-3 px-4">Performa</th>
                  <th className="py-3 px-4">RAM</th>
                  <th className="py-3 px-4">Storage</th>
                  <th className="py-3 px-4">Baterai</th>
                  <th className="py-3 px-4">Berat</th>
                  <th className="py-3 px-4">Kondisi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {laptops.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{l.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono uppercase">{l.brand}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                      Rp {new Intl.NumberFormat('id-ID').format(l.price)}
                    </td>
                    <td className="py-3 px-4 font-mono">{l.performa_komposit || 60}/100</td>
                    <td className="py-3 px-4">{l.ram_gb} GB</td>
                    <td className="py-3 px-4">{l.storage_gb} GB</td>
                    <td className="py-3 px-4">{l.battery_hours} Jam</td>
                    <td className="py-3 px-4">{l.weight_kg} Kg</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                          l.condition === 'second'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        {l.condition || 'baru'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setModalLaptop(l);
                            setIsEdit(true);
                          }}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs cursor-pointer"
                        >
                          Ubah
                        </button>
                        <form
                          action="/api/admin/laptops"
                          method="POST"
                          onSubmit={(e) => {
                            if (!confirm(`Hapus laptop "${l.name}"?`)) e.preventDefault();
                          }}
                        >
                          <input type="hidden" name="_method" value="DELETE" />
                          <input type="hidden" name="id" value={l.id} />
                          <button
                            type="submit"
                            className="px-2.5 py-1 rounded bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 text-xs border border-rose-800/40 cursor-pointer"
                          >
                            Hapus
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CRITERIA */}
      {tab === 'criteria' && (
        <div className="rounded-3xl bg-[#0e0e15]/80 border border-white/10 p-6 space-y-6">
          <div className="text-xs text-zinc-400">
            6 Kriteria Acuan Keputusan SPK TOPSIS. Anda dapat menyesuaikan tipe benefit/cost dan nama tampilan.
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {criteria.map((c) => (
              <form
                key={c.id}
                action="/api/admin/criteria"
                method="POST"
                className="p-5 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-3"
              >
                <input type="hidden" name="id" value={c.id} />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-cyan-300">{c.kode}</span>
                  <select
                    name="tipe"
                    defaultValue={c.tipe}
                    className="px-2 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs font-mono uppercase"
                  >
                    <option value="benefit">BENEFIT</option>
                    <option value="cost">COST</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Nama Kriteria</label>
                  <input
                    type="text"
                    name="nama"
                    defaultValue={c.nama}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Deskripsi</label>
                  <textarea
                    name="deskripsi"
                    defaultValue={c.deskripsi || ''}
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-300"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </form>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: USERS */}
      {tab === 'users' && (
        <div className="rounded-3xl bg-[#0e0e15]/80 border border-white/10 overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-zinc-400 font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Nama</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Peran</th>
                <th className="py-3 px-4">Total Kuisioner</th>
                <th className="py-3 px-4">Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-white">{u.name}</td>
                  <td className="py-3 px-4 text-zinc-300">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize ${
                        u.role === 'admin' ? 'bg-amber-400/20 text-amber-300' : 'bg-cyan-400/20 text-cyan-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{u.kuisioner_count || 0} Sesi</td>
                  <td className="py-3 px-4 text-zinc-400">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL LAPTOP FORM */}
      {modalLaptop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0e0e15] border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">
                {isEdit ? 'Ubah Data Laptop' : 'Tambah Laptop Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setModalLaptop(null)}
                className="text-zinc-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form action="/api/admin/laptops" method="POST" className="space-y-3 text-xs">
              {isEdit && <input type="hidden" name="_method" value="PUT" />}
              {isEdit && <input type="hidden" name="id" value={modalLaptop.id} />}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Nama Laptop</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={modalLaptop.name || ''}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Brand / Merek</label>
                  <input
                    type="text"
                    name="brand"
                    defaultValue={modalLaptop.brand || ''}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={modalLaptop.price || 7000000}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Skor Performa (1-100)</label>
                  <input
                    type="number"
                    name="performa_komposit"
                    defaultValue={modalLaptop.performa_komposit || 65}
                    min={1}
                    max={100}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Kondisi</label>
                  <select
                    name="condition"
                    defaultValue={modalLaptop.condition || 'baru'}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
                  >
                    <option value="baru">Baru</option>
                    <option value="second">Second</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">RAM (GB)</label>
                  <input
                    type="number"
                    name="ram_gb"
                    defaultValue={modalLaptop.ram_gb || 8}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">SSD (GB)</label>
                  <input
                    type="number"
                    name="storage_gb"
                    defaultValue={modalLaptop.storage_gb || 512}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Baterai (Jam)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="battery_hours"
                    defaultValue={modalLaptop.battery_hours || 6.0}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Berat (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight_kg"
                    defaultValue={modalLaptop.weight_kg || 1.6}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalLaptop(null)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold cursor-pointer"
                >
                  Simpan Laptop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CSV IMPORT */}
      {modalCsv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0e0e15] border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Impor Data Laptop dari CSV</h3>
              <button
                type="button"
                onClick={() => setModalCsv(false)}
                className="text-zinc-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form
              action="/api/admin/import"
              method="POST"
              encType="multipart/form-data"
              className="space-y-4 text-xs"
            >
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Unggah file CSV dengan header (Nama, Brand, Harga, RAM, Storage, Baterai, Berat, Kondisi, Performa).
              </p>
              <input
                type="file"
                name="csv_file"
                accept=".csv,.txt"
                required
                className="w-full p-2.5 rounded-xl bg-zinc-950 border border-white/10 text-zinc-300"
              />
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalCsv(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Upload & Impor CSV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
