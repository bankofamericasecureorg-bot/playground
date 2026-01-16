'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Table, { Badge } from '@/app/components/ui/Table';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalBalance: number;
  pendingTransfers: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  date: string;
  account: {
    account_number: string;
    user: {
      first_name: string;
      last_name: string;
    }
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const result = await response.json();
        if (result.success) {
          setStats(result.data.stats);
          setRecentTransactions(result.data.recentTransactions);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Active Users',
      value: stats?.totalUsers || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-blue-500',
    },
    {
      title: 'Accumulated Balance',
      value: formatCurrency(stats?.totalBalance || 0),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-500',
    },
    {
      title: 'Pending Transfers',
      value: stats?.pendingTransfers || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      color: 'bg-bofa-red',
      badge: stats?.pendingTransfers && stats.pendingTransfers > 0 ? 'Urgent' : null,
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-bofa-navy">Dashboard Overview</h2>
          <p className="text-bofa-gray-500">Welcome back. Here is what&apos;s happening across your accounts.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/users">
            <Button variant="secondary" size="md">Manage Users</Button>
          </Link>
          <Link href="/admin/transfers">
            <Button variant="primary" size="md">Review Transfers</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <Card key={index} padding="lg" variant="elevated" className="relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl ${card.color} text-white opacity-10 group-hover:opacity-20 transition-opacity`}>
              {card.icon}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-bofa-gray-500 uppercase tracking-wider">{card.title}</p>
                {card.badge && <Badge variant="error">{card.badge}</Badge>}
              </div>
              {isLoading ? (
                <div className="h-10 w-32 bg-bofa-gray-100 animate-pulse rounded mt-2"></div>
              ) : (
                <p className="text-3xl font-extrabold text-bofa-navy font-mono tracking-tighter mt-1">{card.value}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader 
              action={
                <Link href="/admin/transactions" className="text-sm text-bofa-blue hover:underline font-bold">
                  View All
                </Link>
              }
            >
              <h3 className="font-bold text-bofa-navy">Recent Global Transactions</h3>
            </CardHeader>
            <CardBody className="p-0">
              <Table
                keyExtractor={(item) => item.id}
                data={recentTransactions}
                isLoading={isLoading}
                columns={[
                  {
                    header: 'User',
                    key: 'user',
                    render: (item) => (
                      <div>
                        <p className="font-bold text-bofa-navy">{item.account.user.first_name} {item.account.user.last_name}</p>
                        <p className="text-xs text-bofa-gray-500">Acct: ••••{item.account.account_number.slice(-4)}</p>
                      </div>
                    )
                  },
                  {
                    header: 'Description',
                    key: 'description',
                    render: (item) => <span className="text-xs font-medium">{item.description}</span>
                  },
                  {
                    header: 'Amount',
                    key: 'amount',
                    align: 'right',
                    render: (item) => (
                      <span className={`font-mono font-bold ${item.type === 'credit' ? 'text-green-600' : 'text-bofa-red'}`}>
                        {item.type === 'credit' ? '+' : '-'}{formatCurrency(item.amount)}
                      </span>
                    )
                  },
                  {
                    header: 'Date',
                    key: 'date',
                    align: 'right',
                    render: (item) => <span className="text-xs text-bofa-gray-400">{new Date(item.date).toLocaleDateString()}</span>
                  }
                ]}
              />
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions / System Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-bofa-navy">Quick Actions</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <Link href="/admin/users/new" className="flex items-center gap-3 p-3 rounded-xl border border-bofa-gray-100 hover:bg-bofa-navy hover:text-white transition-all group">
                <div className="p-2 bg-bofa-navy text-white rounded-lg group-hover:bg-white group-hover:text-bofa-navy transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <span className="font-bold text-sm">Create New User</span>
              </Link>
              
              <Link href="/admin/accounts/search" className="flex items-center gap-3 p-3 rounded-xl border border-bofa-gray-100 hover:bg-bofa-navy hover:text-white transition-all group">
                <div className="p-2 bg-bofa-navy text-white rounded-lg group-hover:bg-white group-hover:text-bofa-navy transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className="font-bold text-sm">Lookup Account</span>
              </Link>

              <Link href="/admin/settings" className="flex items-center gap-3 p-3 rounded-xl border border-bofa-gray-100 hover:bg-bofa-navy hover:text-white transition-all group">
                <div className="p-2 bg-bofa-navy text-white rounded-lg group-hover:bg-white group-hover:text-bofa-navy transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-bold text-sm">System Settings</span>
              </Link>
            </CardBody>
          </Card>

          {/* System Health */}
          <Card className="bg-gradient-to-br from-bofa-navy to-bofa-navy-dark text-white border-0">
            <CardBody className="py-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-glow"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">System Status: Online</span>
              </div>
              <h4 className="text-lg font-bold mb-2 text-white">Security Integrity Active</h4>
              <p className="text-xs text-white/60 leading-relaxed font-medium">
                The banking engine is operating at 100% capacity. Encryption layers are monitoring all incoming requests.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
