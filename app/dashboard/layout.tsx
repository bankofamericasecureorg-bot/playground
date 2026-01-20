import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import DashboardHeader from '@/app/components/DashboardHeader';
import EricaChat from '@/app/components/EricaChat';
import Footer from '@/app/components/Footer';

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
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* New BoA-style Header with horizontal navigation */}
      <DashboardHeader userName={session.name} />

      {/* Main Content Area - Full width, no sidebar */}
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Floating Erica Chat */}
      <EricaChat />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
