import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import EricaChat from '@/app/components/EricaChat';

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.getSession();

  // Redirect to login if not authenticated or not a user
  if (!session || session.role !== 'user') {
    redirect('/user/login');
  }

  return (
    <div className="flex h-screen bg-bofa-gray-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar variant="user" />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden relative">
        <Header variant="authenticated" />
        
        {/* Scrollable Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto pb-20">
            {children}
          </div>
        </main>

        <EricaChat />
      </div>
    </div>
  );
}
