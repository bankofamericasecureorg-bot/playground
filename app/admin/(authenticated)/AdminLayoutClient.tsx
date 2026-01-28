'use client';

import { useState, useEffect } from 'react';
import { redirect, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  session: {
    name?: string;
    email?: string;
    role?: string;
  };
}

// Admin Navigation Items
const adminNavItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
  { label: 'Users', href: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Accounts', href: '/admin/accounts', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { label: 'Credit Cards', href: '/admin/cards', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { label: 'Transfers', href: '/admin/transfers', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', badge: 'New' },
  { label: 'Withdrawals', href: '/admin/withdrawals', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
  { label: 'Transactions', href: '/admin/transactions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { label: 'Settings', href: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

export default function AdminLayoutClient({ children, session }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="flex h-screen bg-[#f9fafb] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile (slide-in) */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#e5e7eb] flex flex-col
          transform transition-transform duration-300 ease-in-out md:hidden
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Sidebar Header */}
        <div className="p-4 border-b border-[#e5e7eb] flex items-center justify-between">
          <img src="/asset-v1-h.png" alt="Bank of America" className="h-5 w-auto" />
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 hover:bg-[#f3f4f6] rounded"
          >
            <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded transition-colors
                      ${isActive ? 'bg-[#012169] text-white' : 'text-[#333] hover:bg-[#f3f4f6]'}
                    `}
                  >
                    <svg className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#666]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span className="text-[13px]">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-[#c41230] text-white rounded-full">{item.badge}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile Sidebar Footer */}
        <div className="p-4 border-t border-[#e5e7eb]">
          <Link href="/admin/login" className="flex items-center gap-2 text-[13px] text-[#666] hover:text-[#c41230]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-56 bg-white border-r border-[#e5e7eb]">
        {/* Desktop Sidebar Header */}
        <div className="p-4 border-b border-[#e5e7eb] flex items-center justify-between text-white">
          <img src="/asset-v1-h.png" alt="Bank of America" className="h-5 w-auto" />
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded transition-colors
                      ${isActive ? 'bg-[#012169] text-white' : 'text-[#333] hover:bg-[#f3f4f6]'}
                    `}
                  >
                    <svg className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#666]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span className="text-[13px]">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-[#c41230] text-white rounded-full">{item.badge}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Desktop Sidebar Footer */}
        <div className="p-4 border-t border-[#e5e7eb]">
          <Link href="/admin/login" className="flex items-center gap-2 text-[13px] text-[#666] hover:text-[#c41230]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </Link>
          <p className="text-[11px] text-[#999] mt-2">© 2024 Bank of America</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-[#e5e7eb] z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Left: Mobile menu button + Title */}
            <div className="flex items-center gap-3">
              {/* Hamburger Menu - Mobile Only */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1.5 hover:bg-[#f3f4f6] rounded md:hidden"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="text-[13px] text-[#333]">Admin Dashboard</span>
            </div>
            
            {/* Right: User info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[12px] text-[#333]">{session.name || 'System Administrator'}</p>
                <p className="text-[11px] text-[#666]">{session.email}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#012169] text-white flex items-center justify-center text-[12px]">
                {(session.name?.[0] || session.email?.[0] || 'A').toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
