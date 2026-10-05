import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db, Laptop, Kriteria, User } from '@/lib/db';
import { AdminPanelTabs } from '@/components/AdminPanelTabs';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; success?: string; error?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const currentTab = params.tab || 'laptops';
  const success = params.success;
  const error = params.error;

  // Stats
  const totalUsersRow = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  const totalMahasiswaRow = db
    .prepare("SELECT count(*) as count FROM users WHERE role = 'mahasiswa'")
    .get() as { count: number };
  const totalLaptopsRow = db.prepare('SELECT count(*) as count FROM laptops').get() as { count: number };
  const totalBaruRow = db
    .prepare("SELECT count(*) as count FROM laptops WHERE condition = 'baru'")
    .get() as { count: number };
  const totalSecondRow = db
    .prepare("SELECT count(*) as count FROM laptops WHERE condition = 'second'")
    .get() as { count: number };
  const totalKuisionerRow = db
    .prepare('SELECT count(*) as count FROM kuisioner_jawaban')
    .get() as { count: number };

  // Data (converted to plain objects for Client Components)
  const laptopsRaw = (db.prepare('SELECT * FROM laptops ORDER BY id DESC').all() as Laptop[]) || [];
  const laptops = laptopsRaw.map((l) => ({ ...l }));

  const criteriaRaw = (db.prepare('SELECT * FROM kriteria ORDER BY id ASC').all() as Kriteria[]) || [];
  const criteria = criteriaRaw.map((c) => ({ ...c }));

  const usersRaw = (db
    .prepare(
      `SELECT u.*, (SELECT count(*) FROM kuisioner_jawaban kj WHERE kj.user_id = u.id) as kuisioner_count 
       FROM users u 
       ORDER BY u.id DESC`
    )
    .all() as (User & { kuisioner_count: number })[]) || [];
  const users = usersRaw.map((u) => ({ ...u }));

  return (
    <div className="max-w-7xl mx-auto py-4">
      <AdminPanelTabs
        initialTab={currentTab}
        totalUsers={totalUsersRow?.count || 0}
        totalMahasiswa={totalMahasiswaRow?.count || 0}
        totalLaptops={totalLaptopsRow?.count || 0}
        totalLaptopsBaru={totalBaruRow?.count || 0}
        totalLaptopsSecond={totalSecondRow?.count || 0}
        totalKuisioner={totalKuisionerRow?.count || 0}
        laptops={laptops}
        criteria={criteria}
        users={users}
        success={success}
        error={error}
      />
    </div>
  );
}
