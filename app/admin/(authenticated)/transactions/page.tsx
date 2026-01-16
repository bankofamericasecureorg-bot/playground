'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import Table, { Badge } from '@/app/components/ui/Table';
import Input from '@/app/components/ui/Input';

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  category: string;
  date: string;
  account: {
    account_number: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    }
  }
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFilteredTransactions(
      transactions.filter(t => 
        t.description.toLowerCase().includes(term) || 
        t.account.user.first_name.toLowerCase().includes(term) ||
        t.account.user.last_name.toLowerCase().includes(term) ||
        t.account.account_number.includes(term)
      )
    );
  }, [search, transactions]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/transactions');
      const result = await response.json();
      if (result.success) setTransactions(result.data);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-bofa-navy">Audit Trail</h2>
        <p className="text-bofa-gray-500 font-medium tracking-tight">Comprehensive ledger of all institutional financial activity.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={
                  <svg className="w-5 h-5 text-bofa-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                className="bg-bofa-gray-50 border-0 focus:ring-0 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            keyExtractor={(t) => t.id}
            data={filteredTransactions}
            isLoading={isLoading}
            columns={[
              {
                header: 'Date/Timestamp',
                key: 'date',
                render: (t) => (
                  <div className="text-xs">
                    <p className="font-extrabold text-bofa-navy uppercase tracking-tighter">{new Date(t.date).toLocaleDateString()}</p>
                    <p className="text-bofa-gray-400 font-bold">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                  </div>
                )
              },
              {
                header: 'Entity / Asset',
                key: 'entity',
                render: (t) => (
                  <div>
                    <p className="font-bold text-bofa-navy text-xs">{t.account.user.first_name} {t.account.user.last_name}</p>
                    <p className="text-[10px] text-bofa-gray-400 font-black uppercase tracking-widest">ACCT: {t.account.account_number}</p>
                  </div>
                )
              },
              {
                header: 'Description',
                key: 'description',
                render: (t) => (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-bofa-gray-700">{t.description}</span>
                    <span className="text-[8px] font-black uppercase text-bofa-gray-400 tracking-widest">{t.category || 'GENERAL'}</span>
                  </div>
                )
              },
              {
                header: 'Type',
                key: 'type',
                render: (t) => (
                  <Badge variant={t.type === 'credit' ? 'success' : 'error'}>
                    {t.type.toUpperCase()}
                  </Badge>
                )
              },
              {
                header: 'Settlement Amount',
                key: 'amount',
                align: 'right',
                render: (t) => (
                  <span className={`font-mono font-black text-sm ${t.type === 'credit' ? 'text-green-600' : 'text-bofa-red'}`}>
                    {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                )
              }
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
