import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Sidebar from '@/app/components/Sidebar';

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
    <div className="flex h-screen bg-bofa-gray-50 overflow-hidden text-bofa-gray-900">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar variant="admin" />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Top Header for Dashboard */}
        <header className="bg-white border-b border-bofa-gray-200 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h1 className="text-lg font-bold text-bofa-navy flex items-center gap-2">
              <span className="md:hidden">
                <div className="w-6 h-6 rounded-sm overflow-hidden flex flex-col">
                  <div className="h-1/3 bg-bofa-red"></div>
                  <div className="h-1/3 bg-white border-y border-bofa-gray-200"></div>
                  <div className="h-1/3 bg-bofa-navy"></div>
                </div>
              </span>
              Admin Dashboard
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-bofa-navy">{session.name || 'Administrator'}</p>
                <p className="text-xs text-bofa-gray-500">{session.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-bofa-navy text-white flex items-center justify-center font-bold shadow-md">
                {(session.name?.[0] || session.email?.[0] || 'A').toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
