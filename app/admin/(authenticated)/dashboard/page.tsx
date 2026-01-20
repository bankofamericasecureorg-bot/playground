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
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-[#012169]',
    },
    {
      title: 'Accumulated Balance',
      value: formatCurrency(stats?.totalBalance || 0),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-[#0066b2]',
    },
    {
      title: 'Pending Transfers',
      value: stats?.pendingTransfers || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      color: 'bg-[#c41230]',
      badge: stats?.pendingTransfers && stats.pendingTransfers > 0 ? 'New' : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[14px] font-normal text-[#333]">Dashboard Overview</div>
          <p className="text-[13px] text-[#666]">Welcome back. Here is what&apos;s happening across your accounts.</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white border border-[#ddd] rounded p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#666]">{card.title}</span>
                  {card.badge && <Badge variant="error">{card.badge}</Badge>}
                </div>
                {isLoading ? (
                  <div className="h-8 w-24 bg-gray-100 animate-pulse rounded mt-2"></div>
                ) : (
                  <p className="text-[20px] font-medium text-[#333] mt-1">{card.value}</p>
                )}
              </div>
              <div className={`w-10 h-10 ${card.color} rounded flex items-center justify-center text-white`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#ddd] rounded overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#eee]">
              <span className="text-[14px] font-normal text-[#333]">Recent Global Transactions</span>
              <Link href="/admin/transactions" className="text-[13px] text-[#0066b2] hover:underline">
                View all activity
              </Link>
            </div>
            <Table
              keyExtractor={(item) => item.id}
              data={recentTransactions}
              isLoading={isLoading}
              emptyMessage="No recent transactions"
              columns={[
                {
                  header: 'User',
                  key: 'user',
                  render: (item) => (
                    <div>
                      <p className="text-[14px] text-[#333] font-medium">{item.account.user.first_name} {item.account.user.last_name}</p>
                      <p className="text-[12px] text-[#666]">Acct: ••••{item.account.account_number.slice(-4)}</p>
                    </div>
                  )
                },
                {
                  header: 'Description',
                  key: 'description',
                  render: (item) => <span className="text-[14px] text-[#333]">{item.description}</span>
                },
                {
                  header: 'Amount',
                  key: 'amount',
                  align: 'right',
                  render: (item) => (
                    <span className={`text-[16px] font-medium ${item.type === 'credit' ? 'text-green-600' : 'text-[#333]'}`}>
                      {item.type === 'credit' ? '+' : '-'}{formatCurrency(item.amount)}
                    </span>
                  )
                },
                {
                  header: 'Date',
                  key: 'date',
                  align: 'right',
                  render: (item) => <span className="text-[13px] text-[#666]">{new Date(item.date).toLocaleDateString()}</span>
                }
              ]}
            />
          </div>
        </div>

        {/* Quick Actions / System Status */}
        <div className="space-y-4">
          <div className="bg-white border border-[#ddd] rounded overflow-hidden">
            <div className="px-4 py-3 border-b border-[#eee]">
              <span className="text-[14px] font-normal text-[#333]">Quick Actions</span>
            </div>
            <div className="p-4 space-y-3">
              <Link href="/admin/users/new" className="flex items-center gap-3 p-3 rounded border border-[#ddd] hover:bg-[#f5f5f5] transition-colors">
                <div className="w-8 h-8 bg-[#012169] text-white rounded flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <span className="text-[14px] text-[#333]">Create New User</span>
              </Link>
              
              <Link href="/admin/accounts" className="flex items-center gap-3 p-3 rounded border border-[#ddd] hover:bg-[#f5f5f5] transition-colors">
                <div className="w-8 h-8 bg-[#0066b2] text-white rounded flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className="text-[14px] text-[#333]">Account Ledger</span>
              </Link>

              <Link href="/admin/settings" className="flex items-center gap-3 p-3 rounded border border-[#ddd] hover:bg-[#f5f5f5] transition-colors">
                <div className="w-8 h-8 bg-[#666] text-white rounded flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-[14px] text-[#333]">System Settings</span>
              </Link>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white border border-[#ddd] rounded p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[13px] text-[#666]">System Status: Online</span>
            </div>
            <p className="text-[14px] text-[#333] font-medium mb-1">Security Integrity Active</p>
            <p className="text-[12px] text-[#666]">
              The banking engine is operating at 100% capacity. Encryption layers are monitoring all incoming requests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
