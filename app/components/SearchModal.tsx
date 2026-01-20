'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  type: 'account' | 'transaction' | 'page';
  title: string;
  subtitle?: string;
  href: string;
  icon: 'account' | 'transaction' | 'page';
}

const quickLinks: SearchResult[] = [
  { type: 'page', title: 'Transfer Money', subtitle: 'Send funds to another account', href: '/dashboard/transfers', icon: 'page' },
  { type: 'page', title: 'Withdraw Funds', subtitle: 'Request a withdrawal', href: '/dashboard/withdraw', icon: 'page' },
  { type: 'page', title: 'View Activity', subtitle: 'See all transactions', href: '/dashboard/activity', icon: 'page' },
  { type: 'page', title: 'Profile Settings', subtitle: 'Manage your account', href: '/dashboard/profile', icon: 'page' },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      setResults([]);
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search transactions and accounts
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchData = async () => {
      setIsLoading(true);
      try {
        // Search accounts and transactions from dashboard API
        const response = await fetch('/api/user/dashboard');
        const result = await response.json();
        
        if (result.success) {
          const searchResults: SearchResult[] = [];
          const lowerQuery = query.toLowerCase();

          // Search accounts
          result.data.accounts?.forEach((account: any) => {
            if (
              account.account_type.toLowerCase().includes(lowerQuery) ||
              account.account_number.includes(query)
            ) {
              searchResults.push({
                type: 'account',
                title: `${account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)} Account`,
                subtitle: `****${account.account_number.slice(-4)} • $${Number(account.balance).toLocaleString()}`,
                href: `/dashboard/account/${account.id}`,
                icon: 'account'
              });
            }
          });

          // Search transactions
          result.data.recentTransactions?.slice(0, 20).forEach((tx: any) => {
            if (
              tx.description.toLowerCase().includes(lowerQuery) ||
              tx.category?.toLowerCase()?.includes(lowerQuery)
            ) {
              searchResults.push({
                type: 'transaction',
                title: tx.description,
                subtitle: `${tx.type === 'credit' ? '+' : '-'}$${Number(tx.amount).toLocaleString()} • ${new Date(tx.date).toLocaleDateString()}`,
                href: '/dashboard/activity',
                icon: 'transaction'
              });
            }
          });

          // Filter quick links
          quickLinks.forEach(link => {
            if (
              link.title.toLowerCase().includes(lowerQuery) ||
              link.subtitle?.toLowerCase().includes(lowerQuery)
            ) {
              searchResults.push(link);
            }
          });

          setResults(searchResults.slice(0, 8));
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchData, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!isOpen) return null;

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'account':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'transaction':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#eee]">
          <svg className="w-5 h-5 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search accounts, transactions, or actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-[15px] text-[#333] placeholder:text-[#999] outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#999] hover:text-[#666]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Results or Quick Links */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center text-[13px] text-[#666]">Searching...</div>
          ) : query && results.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-[#666]">
              No results found for "{query}"
            </div>
          ) : query && results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <Link 
                  key={index} 
                  href={result.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f5] transition-colors"
                >
                  <div className="p-2 bg-[#f0f0f0] rounded-lg text-[#666]">
                    {getIcon(result.icon)}
                  </div>
                  <div>
                    <p className="text-[14px] text-[#333]">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-[12px] text-[#666]">{result.subtitle}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-2">
              <p className="px-4 py-2 text-[11px] text-[#999] uppercase font-medium">Quick Actions</p>
              {quickLinks.map((link, index) => (
                <Link 
                  key={index} 
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f5] transition-colors"
                >
                  <div className="p-2 bg-[#f0f0f0] rounded-lg text-[#666]">
                    {getIcon(link.icon)}
                  </div>
                  <div>
                    <p className="text-[14px] text-[#333]">{link.title}</p>
                    <p className="text-[12px] text-[#666]">{link.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#f9f9f9] border-t border-[#eee] flex items-center justify-between text-[11px] text-[#999]">
          <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-[#ddd] rounded text-[10px]">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
