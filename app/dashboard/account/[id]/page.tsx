'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import Table, { Badge } from '@/app/components/ui/Table';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  category: string;
  date: string;
}

interface Account {
  id: string;
  account_type: 'checking' | 'savings';
  account_number: string;
  routing_number: string;
  balance: number;
}

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    const term = search.toLowerCase();
    setFilteredTransactions(
      transactions.filter(t => 
        t.description.toLowerCase().includes(term) || 
        t.category?.toLowerCase().includes(term)
      )
    );
  }, [search, transactions]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/user/account/${id}`);
      const result = await response.json();
      if (result.success) {
        setAccount(result.data.account);
        setTransactions(result.data.transactions);
      }
    } catch (err) {
      console.error('Error fetching account details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="h-48 bg-bofa-gray-100 animate-pulse rounded-2xl shadow-sm"></div>
        <div className="h-96 bg-bofa-gray-100 animate-pulse rounded-2xl shadow-sm"></div>
      </div>
    );
  }

  if (!account) return <div className="text-center py-20 font-bold text-bofa-red">Account Not Found</div>;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Account Hero */}
      <div className="bg-white rounded-2xl p-8 border border-bofa-gray-100 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-bofa-navy/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <button 
            onClick={() => router.back()}
            className="text-xs font-bold text-bofa-gray-400 hover:text-bofa-navy flex items-center gap-1 mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
            Account Overview
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant={account.account_type === 'checking' ? 'info' : 'success'} className="text-[10px] py-1 px-3">
                  {account.account_type.toUpperCase()}
                </Badge>
                <span className="text-xs font-bold text-bofa-gray-400 tracking-widest font-mono">
                  •••• {account.account_number.slice(-4)}
                </span>
              </div>
              <h2 className="text-4xl font-black text-bofa-navy font-mono tracking-tighter">
                {formatCurrency(account.balance)}
              </h2>
              <p className="text-xs font-extrabold text-bofa-gray-400 uppercase tracking-widest mt-1">Available Balance</p>
            </div>

            <div className="grid grid-cols-2 gap-8 p-6 bg-bofa-gray-50 rounded-2xl border border-bofa-gray-100">
              <div>
                <p className="text-[10px] font-black text-bofa-gray-400 uppercase tracking-widest mb-1">Routing Number</p>
                <p className="font-mono text-sm font-bold text-bofa-navy">{account.routing_number}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-bofa-gray-400 uppercase tracking-widest mb-1">Full Account ID</p>
                <p className="font-mono text-sm font-bold text-bofa-navy">{account.account_number}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Ledger */}
      <Card>
        <CardHeader 
          action={
            <div className="w-64">
              <Input
                placeholder="Search history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={
                  <svg className="w-4 h-4 text-bofa-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                className="bg-bofa-gray-50 border-0 focus:ring-0 text-xs h-9"
              />
            </div>
          }
        >
          <h3 className="font-bold text-bofa-navy">Activity Detail</h3>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            keyExtractor={(t) => t.id}
            data={filteredTransactions}
            emptyMessage="No transactions found for this period."
            columns={[
              {
                header: 'Date',
                key: 'date',
                render: (t) => (
                  <span className="text-xs font-bold text-bofa-gray-400 uppercase tracking-tighter">
                    {new Date(t.date).toLocaleDateString()}
                  </span>
                )
              },
              {
                header: 'Description',
                key: 'description',
                render: (t) => (
                  <div>
                    <p className="font-bold text-bofa-navy text-sm leading-tight">{t.description}</p>
                    <p className="text-[8px] font-black text-bofa-gray-400 uppercase tracking-widest mt-0.5">{t.category || 'PENDING SETTLEMENT'}</p>
                  </div>
                )
              },
              {
                header: 'Status',
                key: 'status',
                render: () => <Badge variant="success" className="text-[8px]">SETTLED</Badge>
              },
              {
                header: 'Amount',
                key: 'amount',
                align: 'right',
                render: (t) => (
                  <span className={`font-mono font-black text-base ${t.type === 'credit' ? 'text-green-600' : 'text-bofa-red'}`}>
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
