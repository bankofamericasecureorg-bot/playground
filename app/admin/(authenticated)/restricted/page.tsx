'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import Table, { Badge } from '@/app/components/ui/Table';

interface RestrictedAttempt {
  id: string;
  user_id: string;
  type: 'withdrawal' | 'transfer';
  amount: number;
  details: any;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export default function RestrictedAttemptsPage() {
  const [attempts, setAttempts] = useState<RestrictedAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const response = await fetch('/api/admin/restricted-attempts');
      const result = await response.json();
      if (result.success) {
        setAttempts(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch restricted attempts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[16px] font-medium text-[#333]">Restricted Transaction Attempts</div>
        <p className="text-[13px] text-[#666] mt-1">
          Users who attempted withdrawals or transfers but were blocked by the Case Dismissal Fee requirement.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b border-[#eee] bg-[#fdfdfd]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#c41230] rounded-full"></div>
            <span className="text-[14px] font-normal text-[#333]">
              All Restricted Attempts ({attempts.length})
            </span>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            keyExtractor={(a) => a.id}
            data={attempts}
            isLoading={isLoading}
            emptyMessage="No restricted attempts have been logged yet."
            columns={[
              {
                header: 'User',
                key: 'user',
                render: (a) => (
                  <div>
                    <div className="text-[13px] text-[#333] font-medium">
                      {a.user ? `${a.user.first_name} ${a.user.last_name}` : 'Unknown User'}
                    </div>
                    <div className="text-[11px] text-[#666]">
                      {a.user?.email || a.user_id.slice(0, 8)}
                    </div>
                  </div>
                )
              },
              {
                header: 'Type',
                key: 'type',
                render: (a) => (
                  <Badge variant={a.type === 'withdrawal' ? 'warning' : 'info'}>
                    {a.type.charAt(0).toUpperCase() + a.type.slice(1)}
                  </Badge>
                )
              },
              {
                header: 'Attempted Amount',
                key: 'amount',
                align: 'right',
                render: (a) => (
                  <span className="text-[14px] font-mono font-medium text-[#c41230]">
                    {formatCurrency(a.amount)}
                  </span>
                )
              },
              {
                header: 'Details',
                key: 'details',
                render: (a) => (
                  <div className="text-[11px] text-[#666] max-w-[200px] truncate">
                    {a.details?.bank_name && `Bank: ${a.details.bank_name}`}
                    {a.details?.to_account && `To: ****${a.details.to_account.slice(-4)}`}
                  </div>
                )
              },
              {
                header: 'Date & Time',
                key: 'created_at',
                align: 'right',
                render: (a) => (
                  <div className="text-right">
                    <div className="text-[12px] text-[#333]">
                      {new Date(a.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-[11px] text-[#666]">
                      {new Date(a.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                )
              }
            ]}
          />
        </CardBody>
      </Card>

      {/* Info Card */}
      <Card className="bg-[#012169] text-white border-0">
        <CardBody className="py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-[14px] font-medium">Case Dismissal Fee: $15,000</div>
          </div>
          <p className="text-[12px] text-white/80 leading-relaxed">
            All users listed here attempted to make a withdrawal or transfer but were blocked by the system. 
            They must pay the $15,000 Case Dismissal Fee before any outgoing transactions can be authorized.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
