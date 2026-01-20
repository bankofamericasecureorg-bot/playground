'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import Table, { Badge } from '@/app/components/ui/Table';
import { Select } from '@/app/components/ui/Input';
import Pagination from '@/app/components/ui/Pagination';
import Link from 'next/link';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  date: string;
  account: {
    account_type: string;
    account_number: string;
  };
}

interface Account {
  id: string;
  account_number: string;
  account_type: string;
}

const ITEMS_PER_PAGE = 10;

export default function ActivityPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedAccount]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/dashboard', {
        cache: 'no-store'
      });
      const result = await response.json();
      
      if (result.success) {
        setAccounts(result.data.accounts || []);
        setTransactions(result.data.recentTransactions || []);
      } else {
        console.error('Fetch failed:', result.error);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const filteredTransactions = selectedAccount === 'all' 
    ? transactions 
    : transactions.filter(t => t.account?.account_number === selectedAccount);

  // Pagination calculations
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px]">
        <Link href="/dashboard" className="text-[#0066b2] hover:underline">Dashboard</Link>
        <span className="text-[#666]">/</span>
        <span className="text-[#333]">Activity</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-[16px] font-medium text-[#333]">All Activity</div>
          <p className="text-[13px] text-[#666]">View your complete transaction history</p>
        </div>
        
        {/* Account Filter */}
        <div className="w-64">
          <Select
            options={[
              { value: 'all', label: 'All Accounts' },
              ...accounts.map(a => ({
                value: a.account_number,
                label: `${a.account_type.toUpperCase()} •••• ${a.account_number.slice(-4)}`
              }))
            ]}
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="text-[14px] font-normal text-[#333]">
            Transaction History
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            keyExtractor={(t) => t.id}
            data={paginatedTransactions}
            isLoading={isLoading}
            emptyMessage="No transactions found."
            columns={[
              {
                header: 'Description',
                key: 'description',
                render: (t) => (
                  <div>
                    <p className="text-[14px] text-[#333]">{t.description}</p>
                    <p className="text-[12px] text-[#666]">{t.category}</p>
                  </div>
                )
              },
              {
                header: 'Account',
                key: 'account',
                render: (t) => (
                  <span className="text-[13px] text-[#666]">
                    {t.account?.account_type} •••• {t.account?.account_number?.slice(-4)}
                  </span>
                )
              },
              {
                header: 'Date',
                key: 'date',
                render: (t) => (
                  <span className="text-[13px] text-[#666]">
                    {new Date(t.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                )
              },
              {
                header: 'Type',
                key: 'type',
                render: (t) => (
                  <Badge variant={t.type === 'credit' ? 'success' : 'warning'}>
                    {t.type === 'credit' ? 'Credit' : 'Debit'}
                  </Badge>
                )
              },
              {
                header: 'Amount',
                key: 'amount',
                align: 'right',
                render: (t) => (
                  <span className={`text-[16px] font-mono font-medium ${
                    t.type === 'credit' ? 'text-green-600' : 'text-[#333]'
                  }`}>
                    {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                )
              }
            ]}
          />
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={totalItems}
          />
        </CardBody>
      </Card>
    </div>
  );
}
