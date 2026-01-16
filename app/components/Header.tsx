'use client';

import Link from 'next/link';
import { useState } from 'react';

interface HeaderProps {
  variant?: 'public' | 'user' | 'admin';
  userName?: string;
  isLoginPage?: boolean;
}

export default function Header({ variant = 'public', userName, isLoginPage = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full">
      {/* Dark Purple Bar - Only on login page */}
      {isLoginPage && (
        <div className="bg-[#4A148C] h-0.5 w-full"></div>
      )}

      {/* FDIC Notice Banner - Required since April 2024 */}
      <div className={`${isLoginPage ? 'bg-[#F5F5F5]' : 'bg-bofa-gray-100'} border-b border-bofa-gray-200`}>
        <div className="container flex items-center justify-center py-1.5">
          <span className={`${isLoginPage ? 'text-[10px]' : 'text-xs'} text-bofa-gray-600`}>
            Bank of America deposit products: <strong className="text-bofa-blue underline">FDIC</strong> FDIC-Insured - Backed by the full faith and credit of the U.S. Government
          </span>
        </div>
      </div>

      {/* Utility Navigation */}
      {!isLoginPage && (
      <div className="bg-bofa-gray-50 border-b border-bofa-gray-200">
        <div className="container flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-bofa-gray-600 hover:text-bofa-navy transition-colors">
              Locations
            </Link>
            <Link href="#" className="text-xs text-bofa-gray-600 hover:text-bofa-navy transition-colors">
              Contact Us
            </Link>
            <Link href="#" className="text-xs text-bofa-gray-600 hover:text-bofa-navy transition-colors">
              Help
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-bofa-gray-600 hover:text-bofa-navy transition-colors">
              En español
            </Link>
            {variant === 'public' && (
              <Link href="/admin/login" className="text-xs text-bofa-blue hover:text-bofa-blue-dark transition-colors font-medium">
                Admin Portal
              </Link>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Main Header */}
      <div className="bg-white border-b border-bofa-gray-200">
        <div className={`container flex items-center justify-between ${isLoginPage ? 'py-3' : 'py-4'}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <h1 className={`${isLoginPage ? 'text-base' : 'text-xl'} font-bold text-bofa-navy group-hover:text-bofa-navy-dark transition-colors tracking-tight`}>
              {isLoginPage ? 'BANK OF AMERICA' : 'Bank of America'}
            </h1>
            {/* Bank of America Flag Logo - After text on login page */}
            <div className="relative">
              <div className={`${isLoginPage ? 'w-6 h-6' : 'w-10 h-10'} rounded-sm overflow-hidden flex flex-col`}>
                <div className="h-1/3 bg-bofa-red"></div>
                <div className="h-1/3 bg-white border-y border-bofa-gray-200"></div>
                <div className="h-1/3 bg-bofa-navy"></div>
              </div>
            </div>
            {isLoginPage && (
              <span className="ml-3 text-sm font-normal text-bofa-navy">Log In</span>
            )}
            {variant === 'admin' && (
              <p className="ml-3 text-xs text-bofa-gray-600">Admin Portal</p>
            )}
            {variant === 'user' && (
              <p className="ml-3 text-xs text-bofa-gray-600">Online Banking</p>
            )}
          </Link>

          {/* Desktop Navigation */}
          {!isLoginPage && (
          <nav className="hidden md:flex items-center gap-6">
            {variant === 'public' && (
              <>
                <Link href="#" className="text-sm font-medium text-bofa-navy hover:text-bofa-blue transition-colors">
                  Personal
                </Link>
                <Link href="#" className="text-sm font-medium text-bofa-navy hover:text-bofa-blue transition-colors">
                  Small Business
                </Link>
                <Link href="#" className="text-sm font-medium text-bofa-navy hover:text-bofa-blue transition-colors">
                  Wealth Management
                </Link>
                <Link href="#" className="text-sm font-medium text-bofa-navy hover:text-bofa-blue transition-colors">
                  Businesses & Institutions
                </Link>
                <Link href="#" className="text-sm font-medium text-bofa-navy hover:text-bofa-blue transition-colors">
                  Security
                </Link>
                <Link href="#" className="text-sm font-medium text-bofa-navy hover:text-bofa-blue transition-colors">
                  About Us
                </Link>
              </>
            )}
          </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {isLoginPage ? (
              <>
                <div className="flex items-center gap-2 text-xs text-bofa-gray-600">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure Area</span>
                </div>
                <span className="text-bofa-gray-300">|</span>
                <Link href="#" className="text-xs text-bofa-blue hover:underline">
                  En español
                </Link>
              </>
            ) : (
              <>
                {/* Search */}
                <button className="p-2 text-bofa-gray-600 hover:text-bofa-navy transition-colors" aria-label="Search">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* User Menu / Sign In */}
                {variant === 'public' ? (
                  <Link href="/user/login" className="btn btn-primary text-sm py-2 px-4">
                    Sign In
                  </Link>
                ) : (
              <div className="flex items-center gap-3">
                {userName && (
                  <span className="text-sm text-bofa-gray-700">
                    Welcome, <strong>{userName}</strong>
                  </span>
                )}
                <button className="p-2 text-bofa-gray-600 hover:text-bofa-navy transition-colors" aria-label="Notifications">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <button className="p-2 text-bofa-gray-600 hover:text-bofa-navy transition-colors" aria-label="Account">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              </div>
                )}
              </>
            )}

            {/* Mobile Menu Toggle */}
            {!isLoginPage && (
              <button 
                className="md:hidden p-2 text-bofa-gray-600 hover:text-bofa-navy transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && variant === 'public' && (
          <div className="md:hidden border-t border-bofa-gray-200 bg-white animate-slideUp">
            <nav className="container py-4 space-y-4">
              <Link href="#" className="block text-sm font-medium text-bofa-navy hover:text-bofa-blue transition-colors">
                Personal
              </Link>
              <Link href="#" className="block text-sm font-medium text-bofa-navy hover:text-bofa-blue transition-colors">
                Small Business
              </Link>
              <Link href="#" className="block text-sm font-medium text-bofa-navy hover:text-bofa-blue transition-colors">
                Wealth Management
              </Link>
              <Link href="#" className="block text-sm font-medium text-bofa-navy hover:text-bofa-blue transition-colors">
                Businesses & Institutions
              </Link>
              <Link href="#" className="block text-sm font-medium text-bofa-navy hover:text-bofa-blue transition-colors">
                Security
              </Link>
              <Link href="#" className="block text-sm font-medium text-bofa-navy hover:text-bofa-blue transition-colors">
                About Us
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
