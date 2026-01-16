'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Table, { Badge } from '@/app/components/ui/Table';
import Modal, { ConfirmModal } from '@/app/components/ui/Modal';
import Link from 'next/link';

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

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-bofa-navy">Account Ledger</h2>
          <p className="text-bofa-gray-500 font-medium tracking-tight">System-wide monitoring of all checking and savings assets.</p>
        </div>
        <Link href="/admin/accounts/new">
          <Button variant="primary" leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          }>
            Link New Account
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search by holder name or account number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={
                  <svg className="w-4 h-4 text-bofa-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                className="bg-bofa-gray-50 border-0 focus:ring-0 text-xs"
              />
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="success">Total Assets: {formatCurrency(accounts.reduce((s, a) => s + Number(a.balance), 0))}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            keyExtractor={(a) => a.id}
            data={filteredAccounts}
            isLoading={isLoading}
            columns={[
              {
                header: 'Account Holder',
                key: 'holder',
                render: (a) => (
                  <div>
                    <p className="font-bold text-bofa-navy">{a.user.first_name} {a.user.last_name}</p>
                    <p className="text-[10px] text-bofa-gray-400 font-bold uppercase tracking-widest">{a.user.email}</p>
                  </div>
                )
              },
              {
                header: 'Type',
                key: 'account_type',
                render: (a) => (
                  <Badge variant={a.account_type === 'checking' ? 'info' : 'success'}>
                    {a.account_type.toUpperCase()}
                  </Badge>
                )
              },
              {
                header: 'Identification',
                key: 'numbers',
                render: (a) => (
                  <div className="font-mono text-xs">
                    <p className="text-bofa-gray-600">Acct: <span className="font-bold text-bofa-navy">{a.account_number}</span></p>
                    <p className="text-bofa-gray-400">Rout: {a.routing_number}</p>
                  </div>
                )
              },
              {
                header: 'Available Balance',
                key: 'balance',
                align: 'right',
                render: (a) => (
                  <span className="font-mono font-black text-bofa-navy text-base">
                    {formatCurrency(a.balance)}
                  </span>
                )
              },
              {
                header: 'Operation',
                key: 'actions',
                align: 'right',
                render: (a) => (
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => { setSelectedAccount(a); setNewBalance(a.balance.toString()); }}
                      className="px-3 py-1.5 bg-bofa-navy text-white rounded-lg text-xs font-bold hover:bg-bofa-navy-dark transition-all"
                    >
                      Adjust
                    </button>
                    <button 
                      onClick={() => setAccountToDelete(a)}
                      className="p-2 text-bofa-gray-400 hover:text-bofa-red transition-colors rounded-lg hover:bg-bofa-red/5"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )
              }
            ]}
          />
        </CardBody>
      </Card>

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
          <div className="p-4 bg-bofa-gray-50 rounded-xl">
            <p className="text-xs font-bold text-bofa-gray-400 uppercase mb-1">Target Account</p>
            <p className="font-bold text-bofa-navy">{selectedAccount?.user.first_name} {selectedAccount?.user.last_name}</p>
            <p className="font-mono text-sm text-bofa-gray-600">{selectedAccount?.account_type.toUpperCase()} • {selectedAccount?.account_number}</p>
          </div>
          
          <Input
            label="New Book Balance"
            type="number"
            step="0.01"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            leftIcon={<span className="font-bold text-bofa-gray-400">$</span>}
            className="text-lg font-mono font-bold"
          />
          
          <div className="p-4 bg-bofa-red/5 border border-bofa-red/20 rounded-xl">
            <p className="text-[10px] text-bofa-red font-black uppercase tracking-wider">Warning: Financial Entry</p>
            <p className="text-xs text-bofa-gray-600 mt-1 font-medium">Updating this balance will trigger an immediate automated email notification to the customer. This action is irreversible once posted.</p>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!accountToDelete}
        onClose={() => setAccountToDelete(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Close Financial Account?"
        message={`Are you sure you want to permanently close account ${accountToDelete?.account_number}? All transaction history for this account will be detached and login access to this specific account asset will be revoked.`}
        confirmText="Proceed with Closure"
      />
    </div>
  );
}
