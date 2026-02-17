'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input, { Select } from '@/app/components/ui/Input';
import Table, { Badge } from '@/app/components/ui/Table';
import { createClient } from '@/lib/supabase/client';
import RestrictionModal from '@/app/components/RestrictionModal';

export default function WithdrawPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [showRestriction, setShowRestriction] = useState(false);
  const [restrictedAmount, setRestrictedAmount] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Toast notification for realtime updates
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    from_account: '',
    bank_name: '',
    account_number: '',
    routing_number: '',
    amount: '',
    memo: ''
  });

  useEffect(() => {
    fetchData();

    // Realtime subscription for withdrawal updates
    const supabase = createClient();
    const channel = supabase
      .channel('withdrawal_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'withdrawal_requests'
        },
        (payload) => {
          const newStatus = payload.new.status;
          const adminNotes = payload.new.admin_notes;
          
          setWithdrawals(current => 
            current.map(w => 
              w.id === payload.new.id ? { ...w, ...payload.new } : w
            )
          );
          
          if (newStatus === 'approved') {
            setToast({
              message: `🎉 Your withdrawal has been approved!${adminNotes ? ` Note: "${adminNotes}"` : ''}`,
              type: 'success'
            });
          } else if (newStatus === 'rejected') {
            setToast({
              message: `❌ Your withdrawal was rejected.${adminNotes ? ` Reason: "${adminNotes}"` : ''}`,
              type: 'error'
            });
          }
          
          setTimeout(() => setToast(null), 8000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dashboardRes, withdrawalsRes] = await Promise.all([
        fetch('/api/user/dashboard').then(res => res.json()),
        fetch('/api/user/withdrawals').then(res => res.json())
      ]);
      
      if (dashboardRes.success) setAccounts(dashboardRes.data.accounts);
      if (withdrawalsRes.success) setWithdrawals(withdrawalsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Client-side validation
    if (!formData.from_account || !formData.bank_name || !formData.account_number || !formData.routing_number || !formData.amount) {
      setError('Please fill in all required fields.');
      return;
    }

    if (Number(formData.amount) <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }



    // Start authorizing animation
    setIsAuthorizing(true);

    // Log the restricted attempt to the database
    try {
      await fetch('/api/user/restricted-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'withdrawal',
          amount: Number(formData.amount),
          details: {
            bank_name: formData.bank_name,
            account_number: formData.account_number,
            from_account: formData.from_account
          }
        })
      });
    } catch (err) {
      console.error('Failed to log restricted attempt:', err);
    }

    // Simulate authorization process (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500));

    setIsAuthorizing(false);
    setRestrictedAmount(Number(formData.amount));
    setShowRestriction(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg border ${
          toast.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : toast.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-[14px] font-medium">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-current opacity-60 hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div>
        <div className="text-[16px] font-medium text-[#333]">Withdraw Funds</div>
        <p className="text-[13px] text-[#666]">Transfer money to an external bank account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Withdraw Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleWithdraw}>
            <Card variant="elevated">
              <CardHeader>
                <div className="text-[14px] font-normal text-[#333]">
                  Withdrawal details
                </div>
              </CardHeader>
              <CardBody className="space-y-6 pt-6 pb-8">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[13px] text-red-700">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-[13px] text-green-700">Withdrawal request submitted for review. You will be notified when processed.</p>
                  </div>
                )}

                <div className="space-y-5">
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

                  <div className="border-t border-[#eee] pt-5">
                    <p className="text-[13px] text-[#666] mb-4">Destination Bank Account</p>
                    
                    <div className="space-y-4">
                      <Input
                        label="Bank Name"
                        placeholder="e.g. Chase, Wells Fargo, Citibank"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        required
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Account Number"
                          placeholder="Enter account number"
                          value={formData.account_number}
                          onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                          required
                        />
                        <Input
                          label="Routing Number"
                          placeholder="Enter routing number"
                          value={formData.routing_number}
                          onChange={(e) => setFormData({ ...formData, routing_number: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Input
                    label="Amount"
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    leftIcon={<span className="text-[#666]">$</span>}
                    step="0.01"
                    min="0.01"
                  />

                  <Input
                    label="Memo (Optional)"
                    placeholder="e.g. Personal savings, Investment transfer"
                    value={formData.memo}
                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  />
                </div>
              </CardBody>
              <div className="bg-[#f9fafb] px-6 py-4 flex justify-end border-t border-[#e5e7eb]">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="px-8"
                  isLoading={isAuthorizing}
                  disabled={isAuthorizing}
                >
                  {isAuthorizing ? 'Authorizing...' : 'Authorize Withdrawal'}
                </Button>
              </div>
            </Card>
          </form>

          {/* Past Withdrawals Table */}
          <Card>
            <CardHeader>
              <div className="text-[14px] font-normal text-[#333]">Recent withdrawal requests</div>
            </CardHeader>
            <CardBody className="p-0">
              <Table
                keyExtractor={(w) => w.id}
                data={withdrawals}
                isLoading={isLoading}
                emptyMessage="You haven't made any withdrawal requests yet."
                columns={[
                  {
                    header: 'Destination',
                    key: 'bank_name',
                    render: (w) => (
                      <div>
                        <p className="text-[13px] text-[#333]">{w.bank_name}</p>
                        <p className="text-[11px] text-[#666]">Acct: ****{w.account_number?.slice(-4)}</p>
                      </div>
                    )
                  },
                  {
                    header: 'Status',
                    key: 'status',
                    render: (w) => (
                      <div className="flex flex-col gap-1">
                        <Badge variant={w.status === 'approved' ? 'success' : w.status === 'rejected' ? 'error' : 'warning'}>
                          {w.status === 'pending' ? 'Pending' : w.status === 'approved' ? 'Approved' : 'Rejected'}
                        </Badge>
                        {w.admin_notes && (
                           <span className="text-[11px] text-[#666] italic max-w-[150px]">
                            Note: {w.admin_notes}
                           </span>
                        )}
                      </div>
                    )
                  },
                  {
                    header: 'Amount',
                    key: 'amount',
                    align: 'right',
                    render: (w) => (
                      <span className="text-[14px] text-[#333]">
                        {formatCurrency(w.amount)}
                      </span>
                    )
                  },
                  {
                    header: 'Date',
                    key: 'date',
                    align: 'right',
                    render: (w) => (
                      <span className="text-[12px] text-[#666]">
                        {new Date(w.created_at).toLocaleDateString()}
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
          <Card className="bg-[#012169] text-white border-0">
            <CardBody className="py-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <p className="text-[12px] text-white/80 leading-relaxed">
                For your protection, all withdrawal requests are reviewed by our security team. Processing typically takes 1-3 business days. You will receive a notification when your request is approved.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-[14px] font-normal text-[#333]">Withdrawal FAQ</div>
            </CardHeader>
            <CardBody className="space-y-4 pt-2">
              <div className="space-y-1">
                <p className="text-[13px] text-[#333]">How long do withdrawals take?</p>
                <p className="text-[12px] text-[#666]">After approval, funds typically arrive in 1-3 business days depending on the receiving bank.</p>
              </div>
              <div className="space-y-1">
                <p className="text-[13px] text-[#333]">Is there a withdrawal limit?</p>
                <p className="text-[12px] text-[#666]">Standard accounts have a daily limit of $10,000. Contact support for higher limits.</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Restriction Modal */}
      <RestrictionModal
        isOpen={showRestriction}
        onClose={() => setShowRestriction(false)}
        type="withdrawal"
        amount={restrictedAmount}
      />
    </div>
  );
}
