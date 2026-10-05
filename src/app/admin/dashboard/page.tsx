import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { supabase, Laptop, Kriteria, User } from '@/lib/supabase';
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
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  const { count: totalMahasiswa } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'mahasiswa');

  const { count: totalLaptops } = await supabase
    .from('laptops')
    .select('*', { count: 'exact', head: true });

  const { count: totalBaru } = await supabase
    .from('laptops')
    .select('*', { count: 'exact', head: true })
    .eq('condition', 'baru');

  const { count: totalSecond } = await supabase
    .from('laptops')
    .select('*', { count: 'exact', head: true })
    .eq('condition', 'second');

  const { count: totalKuisioner } = await supabase
    .from('kuisioner_jawaban')
    .select('*', { count: 'exact', head: true });

  // Data
  const { data: laptopsRaw } = await supabase
    .from('laptops')
    .select('*')
    .order('id', { ascending: false });
  const laptops = ((laptopsRaw || []) as Laptop[]).map((l) => ({ ...l }));

  const { data: criteriaRaw } = await supabase
    .from('kriteria')
    .select('*')
    .order('id', { ascending: true });
  const criteria = ((criteriaRaw || []) as Kriteria[]).map((c) => ({ ...c }));

  const { data: usersData } = await supabase
    .from('users')
    .select('*')
    .order('id', { ascending: false });

  const { data: kjData } = await supabase
    .from('kuisioner_jawaban')
    .select('user_id');

  const userKjMap = new Map<number, number>();
  (kjData || []).forEach((row: { user_id: number }) => {
    userKjMap.set(row.user_id, (userKjMap.get(row.user_id) || 0) + 1);
  });

  const users = ((usersData || []) as User[]).map((u) => ({
    ...u,
    kuisioner_count: userKjMap.get(u.id) || 0,
  }));

  return (
    <div className="max-w-7xl mx-auto py-4">
      <AdminPanelTabs
        initialTab={currentTab}
        totalUsers={totalUsers || 0}
        totalMahasiswa={totalMahasiswa || 0}
        totalLaptops={totalLaptops || 0}
        totalLaptopsBaru={totalBaru || 0}
        totalLaptopsSecond={totalSecond || 0}
        totalKuisioner={totalKuisioner || 0}
        laptops={laptops}
        criteria={criteria}
        users={users}
        success={success}
        error={error}
      />
    </div>
  );
}
