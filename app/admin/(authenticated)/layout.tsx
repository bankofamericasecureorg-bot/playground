import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminLayoutClient from './AdminLayoutClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.getSession();

  // Redirect to login if not authenticated or not an admin
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  return (
    <AdminLayoutClient session={session}>
      {children}
    </AdminLayoutClient>
  );
}
