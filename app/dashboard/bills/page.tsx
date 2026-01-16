'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input, { Select } from '@/app/components/ui/Input';
import Table, { Badge } from '@/app/components/ui/Table';
import { useRouter } from 'next/navigation';

export default function BillPayPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Form State
  const [selectedAccount, setSelectedAccount] = useState('');
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch accounts for dropdown
      const accountsRes = await fetch('/api/user/dashboard').then(res => res.json());
      if (accountsRes.success) {
        setAccounts(accountsRes.data.accounts);
        if (accountsRes.data.accounts.length > 0) {
            setSelectedAccount(accountsRes.data.accounts[0].id);
        }
      }

      // Fetch recent payments
      const billsRes = await fetch('/api/user/bills').then(res => res.json());
      if (billsRes.success) {
        setRecentPayments(billsRes.data);
      }
    } catch (err) {
      console.error('Error loading bill pay data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccount,
          payee,
          amount: parseFloat(amount),
          date: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: `Payment of $${amount} to ${payee} successful.` });
        setPayee('');
        setAmount('');
        fetchData(); // Refresh list and balances
      } else {
        setMessage({ type: 'error', text: result.error || 'Payment failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  if (isLoading) return <div className="p-8 text-center text-bofa-gray-500">Loading Bill Pay...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-bofa-navy">Bill Pay</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-bofa-navy">Pay a Bill</h3>
            </CardHeader>
            <CardBody>
              <form onSubmit={handlePayment} className="space-y-4">
                {message && (
                  <div className={`p-3 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                  </div>
                )}

                <div>
                    <label className="block text-sm font-bold text-bofa-gray-700 mb-1">Pay From</label>
                    <select 
                        className="w-full p-2 border border-bofa-gray-300 rounded-md focus:border-bofa-blue font-sans text-sm"
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        required
                    >
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                                {acc.account_type.toUpperCase()} (...{acc.account_number.slice(-4)}) - {formatCurrency(acc.balance)}
                            </option>
                        ))}
                    </select>
                </div>

                <Input
                  label="Pay To"
                  placeholder="Enter payee name (e.g. Verizon)"
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  required
                />

                <Input
                  label="Amount"
                  type="number"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />

                <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-full justify-center"
                    disabled={isSubmitting || accounts.length === 0}
                >
                  {isSubmitting ? 'Processing...' : 'Pay Bill'}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Recent Payments History */}
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <h3 className="font-bold text-bofa-navy">Recent Payments</h3>
                </CardHeader>
                <CardBody className="p-0">
                    <Table
                        data={recentPayments}
                        keyExtractor={(item) => item.id}
                        emptyMessage="No recent bill payments found."
                        columns={[
                            {
                                header: 'Payee',
                                key: 'description',
                                render: (item) => (
                                    <span className="font-medium text-bofa-navy">
                                        {item.description.replace('Bill Pay: ', '')}
                                    </span>
                                )
                            },
                            {
                                header: 'Date',
                                key: 'date',
                                render: (item) => new Date(item.date).toLocaleDateString()
                            },
                             {
                                header: 'From',
                                key: 'account',
                                render: (item) => (
                                    <span className="text-xs text-bofa-gray-500">
                                        {item.account?.account_type.toUpperCase()} (...{item.account?.account_number.slice(-4)})
                                    </span>
                                )
                            },
                            {
                                header: 'Amount',
                                key: 'amount',
                                align: 'right',
                                render: (item) => (
                                    <span className="font-mono font-bold text-bofa-navy">
                                        {formatCurrency(item.amount)}
                                    </span>
                                )
                            }
                        ]}
                    />
                </CardBody>
            </Card>
        </div>
      </div>
    </div>
  );
}
