'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleClientAccess = () => {
    // Programmatic navigation to hidden login route
    // Scanners won't easily find this link as it's not in the HTML href
    router.push('/user/login?secure_access=v1');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <span className="text-2xl font-serif text-slate-800 tracking-tight">
                RADIUS <span className="text-slate-400 font-light">WEALTH</span>
              </span>
            </div>
            <div className="flex items-center space-x-8">
              <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
                <a href="#" className="hover:text-slate-900 transition-colors">Expertise</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Our Firm</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Insights</a>
              </div>
              <button 
                onClick={handleClientAccess}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
                id="client-login-btn"
              >
                Client Access
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-slate-900 py-24 sm:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-serif tracking-tight !text-white sm:text-6xl mb-6">
            Preserving Wealth.<br />
            Securing Legacies.
          </h1>
          <p className="mt-6 text-lg leading-8 !text-slate-300 max-w-2xl mx-auto">
            Radius Wealth Partners provides bespoke investment strategies and strategic advisory services for ultra-high-net-worth individuals, families, and foundations.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a href="#" className="text-sm font-semibold leading-6 !text-white border-b border-slate-500 pb-1 hover:border-white transition-colors">
              Explore Our Philosophy <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 sm:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-16 gap-x-8 lg:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold leading-8 text-slate-900">Strategic Advisory</h3>
              <p className="mt-4 text-base leading-7 text-slate-600">
                We simplify the complexities of wealth through comprehensive planning, tax optimization, and generational transfer strategies.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold leading-8 text-slate-900">Investment Management</h3>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Data-driven portfolio construction tailored to specific liquidity needs, risk tolerance, and long-term objectives.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold leading-8 text-slate-900">Private Banking</h3>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Exclusive access to credit solutions, cash management, and capital markets through our global banking partners.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-lg font-serif text-slate-800">RADIUS <span className="text-slate-400 font-light">WEALTH</span></span>
            <p className="text-sm text-slate-500 mt-1">© {new Date().getFullYear()} Radius Wealth Partners, LLC. All rights reserved.</p>
          </div>
          <div className="flex space-x-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900">Terms of Service</a>
            <a href="#" className="hover:text-slate-900">Disclosures</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

