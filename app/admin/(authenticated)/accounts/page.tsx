'use client';

import { useState, useEffect } from 'react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Table, { Badge } from '@/app/components/ui/Table';
import Pagination from '@/app/components/ui/Pagination';
import Modal, { ConfirmModal } from '@/app/components/ui/Modal';
import Link from 'next/link';

const ITEMS_PER_PAGE = 10;

interface Account {
  id: string;
  account_type: 'checking' | 'savings';
  account_number: string;
  routing_number: string;
  balance: number;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Balance Update State
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [newBalance, setNewBalance] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Deletion State
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFilteredAccounts(
      accounts.filter(a => 
        a.user.first_name.toLowerCase().includes(term) || 
        a.user.last_name.toLowerCase().includes(term) || 
        a.account_number.includes(term)
      )
    );
    setCurrentPage(1);
  }, [search, accounts]);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/accounts');
      const result = await response.json();
      if (result.success) {
        setAccounts(result.data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBalance = async () => {
    if (!selectedAccount || isNaN(Number(newBalance))) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/accounts/${selectedAccount.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: Number(newBalance) })
      });
      if (response.ok) {
        fetchAccounts();
        setSelectedAccount(null);
        setNewBalance('');
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!accountToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/accounts/${accountToDelete.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setAccounts(accounts.filter(a => a.id !== accountToDelete.id));
        setAccountToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Pagination
  const totalItems = filteredAccounts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[14px] font-normal text-[#333]">Account Ledger</div>
          <p className="text-[13px] text-[#666]">System-wide monitoring of all checking and savings assets.</p>
        </div>
        <Link href="/admin/accounts/new">
          <Button variant="primary" leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }>
            Link New Account
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-[#ddd] rounded overflow-hidden">
        <div className="px-4 py-3 border-b border-[#eee] flex items-center justify-between gap-4">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Search by holder name or account number..."
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
          <span className="text-[13px] text-[#666]">
            Total: <span className="font-medium text-[#333]">{formatCurrency(accounts.reduce((s, a) => s + Number(a.balance), 0))}</span>
          </span>
        </div>
        <Table
          keyExtractor={(a) => a.id}
          data={paginatedAccounts}
          isLoading={isLoading}
          emptyMessage="No accounts found."
          columns={[
            {
              header: 'Account Holder',
              key: 'holder',
              render: (a) => (
                <div>
                  <p className="text-[14px] text-[#333] font-medium">{a.user.first_name} {a.user.last_name}</p>
                  <p className="text-[12px] text-[#666]">{a.user.email}</p>
                </div>
              )
            },
            {
              header: 'Type',
              key: 'account_type',
              render: (a) => (
                <Badge variant={a.account_type === 'checking' ? 'info' : 'success'}>
                  {a.account_type === 'checking' ? 'Checking' : 'Savings'}
                </Badge>
              )
            },
            {
              header: 'Account Details',
              key: 'numbers',
              render: (a) => (
                <div>
                  <p className="text-[14px] text-[#333]">•••• {a.account_number.slice(-4)}</p>
                  <p className="text-[12px] text-[#666]">Routing: {a.routing_number}</p>
                </div>
              )
            },
            {
              header: 'Balance',
              key: 'balance',
              align: 'right',
              render: (a) => (
                <span className="text-[16px] font-medium text-[#333]">
                  {formatCurrency(a.balance)}
                </span>
              )
            },
            {
              header: 'Actions',
              key: 'actions',
              align: 'right',
              render: (a) => (
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => { setSelectedAccount(a); setNewBalance(a.balance.toString()); }}
                    className="px-3 py-1.5 bg-[#0066b2] text-white rounded text-[13px] hover:bg-[#005299] transition-colors"
                  >
                    Adjust
                  </button>
                  <button 
                    onClick={() => setAccountToDelete(a)}
                    className="p-2 text-[#666] hover:text-[#c41230] transition-colors rounded hover:bg-red-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
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

      {/* Balance Update Modal */}
      <Modal
        isOpen={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        title="Adjust Account Balance"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setSelectedAccount(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleUpdateBalance} isLoading={isUpdating}>Post Adjustment</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-[#f5f5f5] rounded">
            <p className="text-[12px] text-[#666] mb-1">Target Account</p>
            <p className="text-[14px] text-[#333] font-medium">{selectedAccount?.user.first_name} {selectedAccount?.user.last_name}</p>
            <p className="text-[13px] text-[#666]">{selectedAccount?.account_type === 'checking' ? 'Checking' : 'Savings'} • {selectedAccount?.account_number}</p>
          </div>
          
          <Input
            label="New Balance"
            type="number"
            step="0.01"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            leftIcon={<span className="text-[#666]">$</span>}
            className="text-[16px]"
          />
          
          <div className="p-4 bg-[#fff5f5] border border-[#fdd] rounded">
            <p className="text-[12px] text-[#c41230] font-medium">Warning</p>
            <p className="text-[13px] text-[#666] mt-1">Updating this balance will trigger an email notification to the customer.</p>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!accountToDelete}
        onClose={() => setAccountToDelete(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Close Account?"
        message={`Are you sure you want to close account ${accountToDelete?.account_number}? This action cannot be undone.`}
        confirmText="Close Account"
      />
    </div>
  );
}
