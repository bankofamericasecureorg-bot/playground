'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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
        // Redirect to admin dashboard
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
    <div className="min-h-screen flex flex-col bg-bofa-navy">
      {/* Admin Landing Header (Simplified) */}
      <div className="bg-bofa-navy-dark border-b border-white/10 shadow-lg">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-sm overflow-hidden flex flex-col shadow-inner">
              <div className="h-1/3 bg-bofa-red"></div>
              <div className="h-1/3 bg-white border-y border-bofa-gray-200"></div>
              <div className="h-1/3 bg-bofa-navy"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white group-hover:text-bofa-red-light transition-colors">
                Bank of America
              </h1>
              <p className="text-xs text-white/50 font-medium uppercase tracking-widest">
                Admin Portal
              </p>
            </div>
          </Link>
          <Link 
            href="/user/login" 
            className="text-sm font-semibold text-white/70 hover:text-white transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Online Banking
          </Link>
        </div>
      </div>
      
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">
            {/* Header / Accent */}
            <div className="h-2 bg-gradient-to-r from-bofa-red via-bofa-navy to-bofa-red"></div>
            
            <div className="px-8 pt-10 pb-12">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-bofa-navy mb-2">Admin Sign In</h2>
                <p className="text-bofa-gray-600 font-medium">
                  Enter your administrative credentials.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-bofa-red/5 border border-bofa-red/20 rounded-xl animate-shake">
                    <svg className="w-6 h-6 text-bofa-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm font-semibold text-bofa-red">{error}</p>
                  </div>
                )}

                <Input
                  label="Administrative Email"
                  type="email"
                  placeholder="admin@bankofamerica.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                  }
                  className="bg-bofa-gray-50 border-bofa-gray-200 focus:bg-white"
                />

                <Input
                  label="Secure Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  showPasswordToggle
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                  className="bg-bofa-gray-50 border-bofa-gray-200 focus:bg-white"
                />

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-md border-bofa-gray-300 text-bofa-navy focus:ring-bofa-navy transition-all" 
                    />
                    <span className="text-sm text-bofa-gray-600 group-hover:text-bofa-navy transition-colors">
                      Remember this workstation
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-4 text-lg shadow-lg hover:shadow-xl transform transition-all active:scale-[0.98]"
                  isLoading={isLoading}
                >
                  Authorize Sign In
                </Button>
              </form>

              <div className="mt-10 p-5 bg-bofa-navy/5 border border-bofa-navy/10 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-bofa-navy text-white rounded-lg shadow-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-bofa-navy uppercase tracking-wider">
                      Security Protocol
                    </h4>
                    <p className="text-xs text-bofa-gray-600 leading-relaxed mt-1 font-medium">
                      Unauthorized access attempts are strictly monitored and logged. Use of this portal constitutes agreement to all corporate security policies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Minimal Sub-Footer */}
            <div className="px-8 py-5 bg-bofa-gray-50 border-t border-bofa-gray-100 text-center">
              <p className="text-[10px] text-bofa-gray-400 font-bold uppercase tracking-[0.2em]">
                Bank of America Security Architecture v4.2.0
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center text-white/40 text-xs">
            © 2024 Bank of America Corporation. For authorized internal use only.
          </div>
        </div>
      </main>
    </div>
  );
}
