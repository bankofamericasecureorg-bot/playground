'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Account {
  id: string;
  account_type: string;
  account_number: string;
  balance: number;
  available_balance?: number;
}

interface Card {
  id: string;
  card_number: string;
  current_balance: number;
  credit_limit: number;
  rewards_points: number;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  account: {
    account_type: string;
    account_number: string;
  };
}

interface DashboardData {
  accounts: Account[];
  cards: Card[];
  recentTransactions: Transaction[];
  summary: {
    totalBalance: number;
    accountCount: number;
    cardCount: number;
  };
}

export default function UserDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/user/dashboard', {
          cache: 'no-store'
        });
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          console.error('Fetch failed:', result.error);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatAccountNumber = (num: string) => `•••• ${num.slice(-4)}`;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white animate-pulse rounded border border-[#ddd]"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap gap-3">
        <Link 
          href="/dashboard/transfers" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#ddd] rounded text-[14px] text-[#0066b2] hover:bg-[#f5f5f5] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Transfer
        </Link>
        <Link 
          href="/dashboard/withdraw" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#ddd] rounded text-[14px] text-[#0066b2] hover:bg-[#f5f5f5] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Withdraw
        </Link>
      </div>

      {/* Accounts Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="text-[14px] font-normal text-[#333]">Bank accounts</div>
          <span className="text-[13px] text-[#666]">
            Total: <span className="font-medium text-[#333]">{formatCurrency(data?.summary.totalBalance || 0)}</span>
          </span>
        </div>

        <div className="bg-white border border-[#ddd] rounded overflow-hidden">
          {data?.accounts.map((account, index) => (
            <div key={account.id}>
              {index > 0 && <hr className="border-[#eee]" />}
              <Link
                href={`/dashboard/account/${account.id}`}
                className="flex items-center justify-between px-4 py-4 hover:bg-[#fafafa] transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Account Icon */}
                  <div className={`w-10 h-10 rounded flex items-center justify-center ${
                    account.account_type === 'checking' ? 'bg-[#012169]' : 'bg-[#0066b2]'
                  }`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {account.account_type === 'checking' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      )}
                    </svg>
                  </div>
                  <div>
                    <div className="text-[14px] text-[#333] font-medium capitalize">
                      {account.account_type} {formatAccountNumber(account.account_number)}
                    </div>
                    <div className="text-[12px] text-[#666]">
                      Available balance
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[18px] font-medium text-[#333] font-mono">
                    {formatCurrency(account.balance)}
                  </div>
                  <svg className="w-4 h-4 text-[#999] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Credit Cards Section */}
      {data?.cards && data.cards.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[14px] font-normal text-[#333]">Credit cards</div>
          </div>

          <div className="bg-white border border-[#ddd] rounded overflow-hidden">
            {data.cards.map((card, index) => (
              <div key={card.id}>
                {index > 0 && <hr className="border-[#eee]" />}
                <Link
                  href={`/dashboard/card/${card.id}`}
                  className="flex items-center justify-between px-4 py-4 hover:bg-[#fafafa] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Card Icon */}
                    <div className="w-10 h-10 rounded bg-[#c41230] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[14px] text-[#333] font-medium">
                        Cash Rewards {formatAccountNumber(card.card_number)}
                      </div>
                      <div className="text-[12px] text-[#666]">
                        Credit limit: {formatCurrency(card.credit_limit)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[18px] font-medium text-[#333] font-mono">
                      {formatCurrency(card.current_balance)}
                    </div>
                    <div className="text-[12px] text-[#0066b2]">
                      {card.rewards_points.toLocaleString()} rewards pts
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="text-[14px] font-normal text-[#333]">Recent activity</div>
          <Link href="/dashboard/activity" className="text-[13px] text-[#0066b2] hover:underline">
            View all activity
          </Link>
        </div>

        <div className="bg-white border border-[#ddd] rounded overflow-hidden">
          {data?.recentTransactions && data.recentTransactions.length > 0 ? (
            data.recentTransactions.slice(0, 5).map((transaction, index) => (
              <div key={transaction.id}>
                {index > 0 && <hr className="border-[#eee]" />}
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-[14px] text-[#333]">{transaction.description}</div>
                    <div className="text-[12px] text-[#666]">
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })} • {transaction.account.account_type} {transaction.account.account_number.slice(-4)}
                    </div>
                  </div>
                  <div className={`text-[16px] font-mono font-medium ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-[#333]'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-[14px] text-[#666]">
              No recent transactions
            </div>
          )}
        </div>
      </section>

      {/* Insights Panel */}
      <section className="bg-white border border-[#ddd] rounded p-4">
        <div className="text-[14px] font-normal text-[#333] mb-4">Insights & offers</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Security Tip */}
          <div className="p-4 bg-[#f5f5f5] rounded">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-[#012169]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-[13px] font-medium text-[#012169]">Security Center</span>
            </div>
            <p className="text-[12px] text-[#666]">Review your security settings and enable extra protection.</p>
          </div>

          {/* Rewards */}
          <div className="p-4 bg-[#fff8f0] rounded border border-[#ffe0c0]">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              <span className="text-[13px] font-medium text-orange-700">Rewards</span>
            </div>
            <p className="text-[20px] font-bold text-orange-600 font-mono">
              {data?.cards?.reduce((sum, c) => sum + c.rewards_points, 0).toLocaleString() || 0}
            </p>
            <p className="text-[12px] text-[#666]">Total reward points available</p>
          </div>

          {/* Paperless */}
          <div className="p-4 bg-[#f0f8ff] rounded border border-[#c0e0ff]">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-[#0066b2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-[13px] font-medium text-[#0066b2]">Go Paperless</span>
            </div>
            <p className="text-[12px] text-[#666]">Switch to paperless statements and help the environment.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
