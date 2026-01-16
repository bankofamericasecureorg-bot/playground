'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, AccountCard } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/user/dashboard');
        const result = await response.json();
        if (result.success) {
          setAccounts(result.data.accounts);
        }
      } catch (err) {
        console.error('Error fetching accounts:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-bofa-gray-500">Loading your accounts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-bofa-navy">Your Accounts</h1>
        <Button variant="primary" onClick={() => router.push('/dashboard/transfers')}>
          Make a Transfer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((acc) => (
          <Link key={acc.id} href={`/dashboard/account/${acc.id}`}>
            <AccountCard
              type={acc.account_type}
              accountNumber={`•••• ${acc.account_number.slice(-4)}`}
              balance={acc.balance}
              className="hover:scale-[1.02] transition-transform"
            />
          </Link>
        ))}
      </div>

      {accounts.length === 0 && (
        <Card>
            <CardBody className="text-center py-12">
                <p className="text-bofa-gray-600 mb-4">You don't have any deposit accounts yet.</p>
                <Button variant="primary" onClick={() => {}}>Open an Account</Button>
            </CardBody>
        </Card>
      )}
    </div>
  );
}
