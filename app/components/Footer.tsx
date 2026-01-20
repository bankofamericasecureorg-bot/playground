import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#f5f0eb] py-6 px-4 border-t border-[#e2e2e2] mt-auto">
      <div className="max-w-[1200px] mx-auto w-full">
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
          <p className="mt-1">© {currentYear} Bank of America Corporation.</p>
        </div>
      </div>
    </footer>
  );
}
