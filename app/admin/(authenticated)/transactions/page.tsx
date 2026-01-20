'use client';

import { useState, useEffect } from 'react';
import Table, { Badge } from '@/app/components/ui/Table';
import Input from '@/app/components/ui/Input';
import Pagination from '@/app/components/ui/Pagination';

const ITEMS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);

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
    setCurrentPage(1);
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

  // Pagination
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[14px] font-normal text-[#333]">Transaction History</div>
        <p className="text-[13px] text-[#666]">Comprehensive ledger of all financial activity.</p>
      </div>

      <div className="bg-white border border-[#ddd] rounded overflow-hidden">
        <div className="px-4 py-3 border-b border-[#eee]">
          <div className="max-w-sm">
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={
                <svg className="w-4 h-4 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              className="text-[14px]"
            />
          </div>
        </div>
        <Table
          keyExtractor={(t) => t.id}
          data={paginatedTransactions}
          isLoading={isLoading}
          emptyMessage="No transactions found."
          columns={[
            {
              header: 'Date',
              key: 'date',
              render: (t) => (
                <div>
                  <p className="text-[14px] text-[#333]">{new Date(t.date).toLocaleDateString()}</p>
                  <p className="text-[12px] text-[#666]">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              )
            },
            {
              header: 'Customer',
              key: 'entity',
              render: (t) => (
                <div>
                  <p className="text-[14px] text-[#333] font-medium">{t.account.user.first_name} {t.account.user.last_name}</p>
                  <p className="text-[12px] text-[#666]">Acct: {t.account.account_number}</p>
                </div>
              )
            },
            {
              header: 'Description',
              key: 'description',
              render: (t) => (
                <div>
                  <span className="text-[14px] text-[#333]">{t.description}</span>
                  <p className="text-[12px] text-[#666]">{t.category || 'General'}</p>
                </div>
              )
            },
            {
              header: 'Type',
              key: 'type',
              render: (t) => (
                <Badge variant={t.type === 'credit' ? 'success' : 'error'}>
                  {t.type === 'credit' ? 'Credit' : 'Debit'}
                </Badge>
              )
            },
            {
              header: 'Amount',
              key: 'amount',
              align: 'right',
              render: (t) => (
                <span className={`text-[16px] font-medium ${t.type === 'credit' ? 'text-green-600' : 'text-[#333]'}`}>
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
      </div>
    </div>
  );
}
