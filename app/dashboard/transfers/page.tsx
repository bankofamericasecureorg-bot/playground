'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input, { Select } from '@/app/components/ui/Input';
import Table, { Badge } from '@/app/components/ui/Table';
import Modal from '@/app/components/ui/Modal';

export default function UserTransfersPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    from_account: '',
    to_account: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const dashboard = await fetch('/api/user/dashboard').then(res => res.json());
      const transferList = await fetch('/api/user/transfers').then(res => res.json());
      
      if (dashboard.success) setAccounts(dashboard.data.accounts);
      if (transferList.success) setTransfers(transferList.data);
    } catch (err) {
      console.error('Error fetching transfer data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/user/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setFormData({ ...formData, to_account: '', amount: '', description: '' });
        fetchData();
      } else {
        setError(result.error || 'Transfer request failed.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-bofa-navy">Transfer & Pay</h2>
        <p className="text-bofa-gray-500 font-medium tracking-tight">Safely move funds between your accounts or send to someone else.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transfer Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleTransfer}>
            <Card variant="elevated">
              <CardHeader>
                <h3 className="font-bold text-bofa-navy uppercase tracking-wider text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-bofa-red rounded-full"></div>
                  Transfer Details
                </h3>
              </CardHeader>
              <CardBody className="space-y-6 pt-6 pb-8">
                {error && (
                  <div className="p-4 bg-bofa-red/5 border border-bofa-red/20 rounded-xl flex items-center gap-3">
                    <svg className="w-5 h-5 text-bofa-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-bold text-bofa-red">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-slideUp">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm font-bold text-green-700">Request submitted for administrative review.</p>
                  </div>
                )}

                <div className="space-y-6">
                  <Select
                    label="From Account"
                    options={[
                      { value: '', label: 'Select account' },
                      ...accounts.map(a => ({
                        value: a.account_number,
                        label: `${a.account_type.toUpperCase()} • ${a.account_number.slice(-4)} (${formatCurrency(a.balance)} available)`
                      }))
                    ]}
                    value={formData.from_account}
                    onChange={(e) => setFormData({ ...formData, from_account: e.target.value })}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="To Account Number"
                      placeholder="Recipient account or routing"
                      value={formData.to_account}
                      onChange={(e) => setFormData({ ...formData, to_account: e.target.value })}
                      required
                      className="bg-bofa-gray-50 font-mono"
                    />
                    <Input
                      label="Amount"
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      leftIcon={<span className="font-bold text-bofa-gray-400">$</span>}
                      className="font-mono font-bold"
                    />
                  </div>

                  <Input
                    label="Description (Optional)"
                    placeholder="e.g. Monthly Rent, Invoice #123"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-bofa-gray-50"
                  />
                </div>
              </CardBody>
              <CardBody className="bg-bofa-gray-50/50 flex justify-end p-6 border-t border-bofa-gray-100">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="px-12 py-5 text-sm font-black uppercase tracking-widest shadow-xl"
                  isLoading={isSubmitting}
                >
                  Authorize Transfer
                </Button>
              </CardBody>
            </Card>
          </form>

          {/* Past Transfers Table */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-bofa-navy">Recent Transfer Requests</h3>
            </CardHeader>
            <CardBody className="p-0">
              <Table
                keyExtractor={(t) => t.id}
                data={transfers}
                isLoading={isLoading}
                emptyMessage="You haven't made any transfer requests yet."
                columns={[
                  {
                    header: 'Recipient',
                    key: 'to_account',
                    render: (t) => (
                      <div>
                        <p className="font-bold text-bofa-navy text-xs">Acct: {t.to_account}</p>
                        <p className="text-[10px] text-bofa-gray-400 font-bold uppercase">{t.description || 'No memo'}</p>
                      </div>
                    )
                  },
                  {
                    header: 'Status',
                    key: 'status',
                    render: (t) => (
                      <Badge variant={t.status === 'approved' ? 'success' : t.status === 'rejected' ? 'error' : 'warning'}>
                        {t.status.toUpperCase()}
                      </Badge>
                    )
                  },
                  {
                    header: 'Amount',
                    key: 'amount',
                    align: 'right',
                    render: (t) => (
                      <span className="font-mono font-bold text-sm text-bofa-navy">
                        {formatCurrency(t.amount)}
                      </span>
                    )
                  },
                  {
                    header: 'Date',
                    key: 'date',
                    align: 'right',
                    render: (t) => (
                      <span className="text-[10px] font-bold text-bofa-gray-400">
                        {new Date(t.created_at).toLocaleDateString()}
                      </span>
                    )
                  }
                ]}
              />
            </CardBody>
          </Card>
        </div>

        {/* Security & Info */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-bofa-navy to-bofa-navy-dark text-white border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardBody className="py-8 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="font-bold">Security Notice</h4>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-medium">
                For your protection, all outgoing transfers undergo an administrative review process. Most requests are processed within 24 business hours. You will receive an email notification once the status of your request has been updated.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-bofa-navy text-sm uppercase tracking-wider">Transfer FAQ</h3>
            </CardHeader>
            <CardBody className="space-y-4 pt-2">
              <div className="space-y-1">
                <p className="text-xs font-bold text-bofa-navy">When will my funds move?</p>
                <p className="text-[10px] text-bofa-gray-500 font-medium">Transfers approved by 5 PM ET are typically settled by the next business day.</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-bofa-navy">What is a routing number?</p>
                <p className="text-[10px] text-bofa-gray-500 font-medium">A nine-digit code that identifies specific financial institutions in the US.</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
