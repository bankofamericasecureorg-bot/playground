'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, CardFooter } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input, { Select } from '@/app/components/ui/Input';
import Modal from '@/app/components/ui/Modal';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function LinkAccountPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    user_id: '',
    account_type: 'checking',
    initial_balance: '0'
  });

  // Success State
  const [createdAccount, setCreatedAccount] = useState<any>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        const result = await response.json();
        if (result.success) {
          setUsers(result.data);
        }
      } catch (err) {
        setError('Failed to load user list');
      } finally {
        setIsFetchingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_id) {
      setError('Please select a target customer');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          initial_balance: Number(formData.initial_balance)
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCreatedAccount(result.data);
        setIsSuccessModalOpen(true);
        setFormData({
          user_id: '',
          account_type: 'checking',
          initial_balance: '0'
        });
      } else {
        setError(result.error || 'Failed to link account');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="mb-8">
        <button 
          onClick={() => router.back()}
          className="text-sm font-bold text-bofa-gray-400 hover:text-bofa-navy transition-colors flex items-center gap-1 mb-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Ledger
        </button>
        <div className="text-sm font-normal text-[#333]">Link New Product</div>
        <p className="text-sm font-normal text-[#333]">Allocate a new financial account to an existing customer profile.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card variant="elevated">
          <CardHeader>
            <div className="text-sm font-normal text-[#333] flex items-center gap-2">
              <div className="w-2 h-2 bg-bofa-red rounded-full"></div>
              Account Provisioning
            </div>
          </CardHeader>
          <CardBody className="space-y-8 pt-10 pb-12">
            {error && (
              <div className="p-4 bg-bofa-red/5 border border-bofa-red/20 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 text-bofa-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-bold text-bofa-red">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <Select
                label="Target Customer"
                options={[{ value: '', label: 'Select a customer...' }, ...users.map(u => ({
                  value: u.id,
                  label: `${u.first_name} ${u.last_name} (${u.email})`
                }))]}
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                required
                disabled={isFetchingUsers}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Select
                  label="Product Type"
                  options={[
                    { value: 'checking', label: 'Checking Account' },
                    { value: 'savings', label: 'Savings Account' }
                  ]}
                  value={formData.account_type}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                  required
                />
                
                <Input
                  label="Initial Book Balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.initial_balance}
                  onChange={(e) => setFormData({ ...formData, initial_balance: e.target.value })}
                  leftIcon={<span className="font-bold text-bofa-gray-400">$</span>}
                  className="font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-5 bg-bofa-blue/5 border border-bofa-blue/10 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-bofa-blue text-white rounded-lg shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-black text-bofa-blue uppercase tracking-widest">Automation Engine</h4>
                  <p className="text-[11px] text-bofa-gray-600 leading-relaxed mt-1 font-medium">
                    Account and Routing numbers will be generated based on Bank of America ABA standards. A professional balance update notification will be automatically dispatched to the customer.
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
          <CardFooter className="bg-bofa-gray-50/50 justify-end flex">
            <Button 
              type="submit" 
              variant="primary" 
              className="px-10 py-5 text-sm uppercase tracking-widest font-black" 
              isLoading={isLoading}
            >
              Post & Provision Account
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Product Provisioned"
        size="md"
      >
        <div className="space-y-6">
          <div className="p-6 bg-bofa-navy text-white rounded-2xl relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-extrabold text-white uppercase tracking-widest text-xs">New Asset Linked</h4>
                  <p className="text-[10px] text-white/50 font-bold">{createdAccount?.account_type.toUpperCase()} ACCOUNT</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Account Number</p>
                  <p className="font-mono text-xl font-black tracking-widest">{createdAccount?.account_number}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Routing Number</p>
                  <p className="font-mono text-xl font-black tracking-tight">{createdAccount?.routing_number}</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Initial Position</p>
                <p className="text-3xl font-black font-mono">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(createdAccount?.balance || 0)}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-bofa-gray-500 text-center font-medium px-4 leading-relaxed">
            The customer, <span className="font-bold text-bofa-navy">{createdAccount?.user.first_name} {createdAccount?.user.last_name}</span>, has been notified of their new available balance via the professional email channel.
          </p>

          <Button 
            className="w-full py-4 text-xs font-black uppercase tracking-[0.2em]" 
            variant="secondary"
            onClick={() => setIsSuccessModalOpen(false)}
          >
            Acknowledge Entry
          </Button>
        </div>
      </Modal>
    </div>
  );
}
