'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, AccountCard } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Table, { Badge } from '@/app/components/ui/Table';
import Link from 'next/link';

interface DashboardData {
  accounts: any[];
  cards: any[];
  recentTransactions: any[];
  summary: {
    totalBalance: number;
    accountCount: number;
    cardCount: number;
  };
}

export default function UserDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/user/dashboard');
        const result = await response.json();
        if (result.success) {
          setData(result.data);
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

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-bofa-gray-100 animate-pulse rounded-2xl shadow-sm"></div>
          ))}
        </div>
        <div className="h-96 bg-bofa-gray-100 animate-pulse rounded-2xl shadow-sm"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome & Global Balance */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-2xl border border-bofa-gray-100 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-bofa-blue/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-bofa-blue/10 transition-colors duration-700"></div>
        <div className="relative z-10">
          <h2 className="text-sm font-bold text-bofa-gray-400 uppercase tracking-widest mb-1">Total Relationship Balance</h2>
          <p className="text-4xl font-black text-bofa-navy font-mono tracking-tighter">
            {formatCurrency(data?.summary.totalBalance || 0)}
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Badge variant="info">{data?.summary.accountCount} Accounts</Badge>
            <Badge variant="success">{data?.summary.cardCount} Cards</Badge>
          </div>
        </div>
        <div className="flex gap-3 relative z-10">
          <Link href="/dashboard/transfers">
            <Button variant="primary" className="px-8 shadow-lg hover:shadow-xl transition-all">Move Money</Button>
          </Link>
          <Link href="/dashboard/statements">
            <Button variant="secondary" className="px-8">Statements</Button>
          </Link>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div>
        <h3 className="text-xl font-bold text-bofa-navy mb-6 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-bofa-red rounded-full"></div>
          Your Accounts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.accounts.map((acc: any) => (
            <Link key={acc.id} href={`/dashboard/account/${acc.id}`}>
              <AccountCard
                type={acc.account_type as 'checking' | 'savings'}
                accountNumber={`•••• ${acc.account_number.slice(-4)}`}
                balance={acc.balance}
                className="transform transition-transform hover:scale-[1.03] active:scale-[0.98]"
              />
            </Link>
          ))}
          {data?.cards.map((card: any) => (
            <Link key={card.id} href={`/dashboard/card/${card.id}`}>
              <AccountCard
                type="credit"
                accountNumber={`•••• ${card.card_number.slice(-4)}`}
                balance={card.current_balance}
                limit={card.credit_limit}
                className="transform transition-transform hover:scale-[1.03] active:scale-[0.98]"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader 
              action={
                <Link href="/dashboard/activity" className="text-sm text-bofa-blue font-bold hover:underline">
                  View full history
                </Link>
              }
            >
              <h3 className="font-bold text-bofa-navy">Recent Activity</h3>
            </CardHeader>
            <CardBody className="p-0">
              <Table
                keyExtractor={(t) => t.id}
                data={data?.recentTransactions || []}
                emptyMessage="No recent account activity."
                columns={[
                  {
                    header: 'Description',
                    key: 'description',
                    render: (t) => (
                      <div>
                        <p className="font-bold text-bofa-navy text-sm leading-tight">{t.description}</p>
                        <p className="text-[10px] text-bofa-gray-400 font-bold uppercase tracking-widest mt-0.5">
                          {t.account.account_type.toUpperCase()} • {t.account.account_number.slice(-4)}
                        </p>
                      </div>
                    )
                  },
                  {
                    header: 'Date',
                    key: 'date',
                    render: (t) => (
                      <span className="text-xs font-medium text-bofa-gray-500">
                        {new Date(t.date).toLocaleDateString()}
                      </span>
                    )
                  },
                  {
                    header: 'Amount',
                    key: 'amount',
                    align: 'right',
                    render: (t) => (
                      <span className={`font-mono font-bold text-base ${t.type === 'credit' ? 'text-green-600' : 'text-bofa-red'}`}>
                        {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                    )
                  }
                ]}
              />
            </CardBody>
          </Card>
        </div>

        {/* Quick Tools */}
        <div className="space-y-6">
          <Card padding="lg">
            <CardHeader>
              <h3 className="font-bold text-bofa-navy">Insights & Offers</h3>
            </CardHeader>
            <CardBody className="space-y-6 pt-2">
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-orange-800 uppercase tracking-widest">Rewards Update</h4>
                    <p className="font-mono text-xl font-black text-orange-600">
                      {data?.cards.reduce((sum, c) => sum + c.rewards_points, 0).toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-orange-700 font-bold leading-relaxed">
                  You&apos;ve earned significant points this month. Redeem for travel, cash back or gift cards.
                </p>
              </div>

              <div className="space-y-4">
                <Link href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-bofa-gray-50 transition-colors border border-transparent hover:border-bofa-gray-100 group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-bofa-navy text-white rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-bofa-navy">Security Center</span>
                  </div>
                  <svg className="w-4 h-4 text-bofa-gray-300 group-hover:text-bofa-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-bofa-gray-50 transition-colors border border-transparent hover:border-bofa-gray-100 group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-bofa-navy text-white rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-bofa-navy">Paperless Settings</span>
                  </div>
                  <svg className="w-4 h-4 text-bofa-gray-300 group-hover:text-bofa-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
