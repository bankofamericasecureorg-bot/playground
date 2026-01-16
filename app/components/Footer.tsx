import Link from 'next/link';

interface FooterProps {
  isLoginPage?: boolean;
}

export default function Footer({ isLoginPage = false }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Minimal footer for login page
  if (isLoginPage) {
    return (
      <footer className="bg-[#F5F5F5] border-t border-bofa-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-xs text-bofa-gray-600">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure area</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Link href="#" className="text-bofa-blue hover:underline">
                Privacy
              </Link>
              <span className="text-bofa-gray-300">|</span>
              <Link href="#" className="text-bofa-blue hover:underline">
                Security
              </Link>
              <span className="ml-1 text-bofa-gray-600">Your Privacy Choices</span>
              <svg className="w-3 h-3 text-bofa-blue ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-bofa-gray-50 border-t border-bofa-gray-200">
      {/* Main Footer Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Products */}
          <div>
            <h3 className="text-sm font-semibold text-bofa-navy mb-4">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Checking
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Savings & CDs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Credit Cards
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Home Loans
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Auto Loans
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Investing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div>
            <h3 className="text-sm font-semibold text-bofa-navy mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Better Money Habits®
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Financial Education
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Security Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Mobile Banking
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Online Banking
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: About Us */}
          <div>
            <h3 className="text-sm font-semibold text-bofa-navy mb-4">About Us</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Newsroom
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Community Commitment
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Environmental Sustainability
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Investor Relations
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Help & Contact */}
          <div>
            <h3 className="text-sm font-semibold text-bofa-navy mb-4">Help & Contact</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Schedule an Appointment
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Accessible Banking
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-bofa-gray-600 hover:text-bofa-blue transition-colors">
                  Share Your Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Connect */}
          <div>
            <h3 className="text-sm font-semibold text-bofa-navy mb-4">Connect With Us</h3>
            <div className="flex items-center gap-3 mb-4">
              {/* Social Icons */}
              <a href="#" className="w-8 h-8 bg-bofa-gray-200 hover:bg-bofa-navy hover:text-white rounded-full flex items-center justify-center transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-bofa-gray-200 hover:bg-bofa-navy hover:text-white rounded-full flex items-center justify-center transition-colors" aria-label="X (Twitter)">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-bofa-gray-200 hover:bg-bofa-navy hover:text-white rounded-full flex items-center justify-center transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-bofa-gray-200 hover:bg-bofa-navy hover:text-white rounded-full flex items-center justify-center transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-bofa-gray-200 hover:bg-bofa-navy hover:text-white rounded-full flex items-center justify-center transition-colors" aria-label="YouTube">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
            <p className="text-xs text-bofa-gray-500">
              Download our mobile app
            </p>
            <div className="flex gap-2 mt-2">
              <a href="#" className="inline-block">
                <div className="bg-black text-white text-xs px-3 py-2 rounded flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  App Store
                </div>
              </a>
              <a href="#" className="inline-block">
                <div className="bg-black text-white text-xs px-3 py-2 rounded flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  Google Play
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Links Bar */}
      <div className="border-t border-bofa-gray-200 bg-white">
        <div className="container py-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-bofa-gray-600">
            <Link href="#" className="hover:text-bofa-blue transition-colors">
              Privacy
            </Link>
            <span className="text-bofa-gray-300">|</span>
            <Link href="#" className="hover:text-bofa-blue transition-colors">
              Security
            </Link>
            <span className="text-bofa-gray-300">|</span>
            <Link href="#" className="hover:text-bofa-blue transition-colors">
              Site Map
            </Link>
            <span className="text-bofa-gray-300">|</span>
            <Link href="#" className="hover:text-bofa-blue transition-colors">
              Advertising Practices
            </Link>
            <span className="text-bofa-gray-300">|</span>
            <Link href="#" className="hover:text-bofa-blue transition-colors">
              Manage Cookies
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Legal Section */}
      <div className="border-t border-bofa-gray-200 bg-bofa-gray-50">
        <div className="container py-6">
          <div className="text-center space-y-3">
            {/* FDIC and Equal Housing */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-bofa-navy rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">F</span>
                </div>
                <span className="text-xs text-bofa-gray-700 font-medium">Member FDIC</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-bofa-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L4 9v12h16V9l-8-6zm0 2.236L18 9.764V19H6V9.764l6-4.528zM12 11a2 2 0 100 4 2 2 0 000-4z"/>
                </svg>
                <span className="text-xs text-bofa-gray-700 font-medium">Equal Housing Lender</span>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-xs text-bofa-gray-500">
              © {currentYear} Bank of America Corporation. All rights reserved.
            </p>

            {/* Legal Disclaimer */}
            <p className="text-xs text-bofa-gray-500 max-w-4xl mx-auto leading-relaxed">
              Bank of America, N.A. Member FDIC. Equal Housing Lender. 
              Bank of America and the Bank of America logo are registered trademarks of Bank of America Corporation.
              This is a demonstration application and is not affiliated with or endorsed by Bank of America Corporation.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
