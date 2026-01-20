'use client';

import { useState, useEffect } from 'react';
import Button from '@/app/components/ui/Button';
import Table, { Badge } from '@/app/components/ui/Table';
import Modal from '@/app/components/ui/Modal';
import Pagination from '@/app/components/ui/Pagination';
import { createClient } from '@/lib/supabase/client';

const ITEMS_PER_PAGE = 10;

interface WithdrawalRequest {
  id: string;
  from_account: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  amount: number;
  memo: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Decision State
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState<'approved' | 'rejected' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchWithdrawals();
    
    // Realtime subscription for new and updated withdrawals
    const supabase = createClient();
    const channel = supabase
      .channel('admin_withdrawal_updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'withdrawal_requests'
        },
        () => {
          // Refetch all withdrawals on any change
          fetchWithdrawals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/withdrawals');
      const result = await response.json();
      if (result.success) {
        setWithdrawals(result.data);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (!selectedWithdrawal) return;
    setIsProcessing(status);
    try {
      const response = await fetch(`/api/admin/withdrawals/${selectedWithdrawal.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: adminNotes })
      });
      if (response.ok) {
        fetchWithdrawals();
        setSelectedWithdrawal(null);
        setAdminNotes('');
      } else {
        const err = await response.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
  
  // Pagination
  const totalItems = withdrawals.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedWithdrawals = withdrawals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[14px] font-normal text-[#333]">Withdrawal Requests</div>
          <p className="text-[13px] text-[#666]">Review and process withdrawal requests.</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="warning">{pendingCount} Pending</Badge>
        )}
      </div>

      <div className="bg-white border border-[#ddd] rounded overflow-hidden">
        <Table
          keyExtractor={(w) => w.id}
          data={paginatedWithdrawals}
          isLoading={isLoading}
          emptyMessage="No withdrawal requests."
          columns={[
            {
              header: 'Requestor',
              key: 'user',
              render: (w) => (
                <div>
                  <p className="text-[14px] text-[#333] font-medium">{w.user?.first_name} {w.user?.last_name}</p>
                  <p className="text-[12px] text-[#666]">{w.user?.email}</p>
                </div>
              )
            },
            {
              header: 'Destination',
              key: 'bank',
              render: (w) => (
                <div>
                  <p className="text-[14px] text-[#333]">{w.bank_name}</p>
                  <p className="text-[12px] text-[#666]">****{w.account_number?.slice(-4)}</p>
                </div>
              )
            },
            {
              header: 'Amount',
              key: 'amount',
              align: 'right',
              render: (w) => (
                <span className="text-[16px] font-medium text-[#333]">
                  {formatCurrency(w.amount)}
                </span>
              )
            },
            {
              header: 'Status',
              key: 'status',
              render: (w) => (
                <Badge variant={w.status === 'approved' ? 'success' : w.status === 'rejected' ? 'error' : 'warning'}>
                  {w.status === 'pending' ? 'Pending' : w.status === 'approved' ? 'Approved' : 'Rejected'}
                </Badge>
              )
            },
            {
              header: 'Actions',
              key: 'actions',
              align: 'right',
              render: (w) => (
                w.status === 'pending' ? (
                  <button 
                    onClick={() => setSelectedWithdrawal(w)}
                    className="px-3 py-1.5 bg-[#0066b2] text-white rounded text-[13px] hover:bg-[#005299] transition-colors"
                  >
                    Review
                  </button>
                ) : (
                  <span className="text-[13px] text-[#999]">Processed</span>
                )
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

      {/* Process Modal */}
      <Modal
        isOpen={!!selectedWithdrawal}
        onClose={() => setSelectedWithdrawal(null)}
        title="Review Withdrawal Request"
        size="md"
        footer={
          <div className="flex gap-3 w-full">
            <Button 
              variant="danger" 
              className="flex-1" 
              onClick={() => handleDecision('rejected')}
              isLoading={isProcessing === 'rejected'}
              disabled={!!isProcessing}
            >
              Reject
            </Button>
            <Button 
              variant="primary" 
              className="flex-1" 
              onClick={() => handleDecision('approved')}
              isLoading={isProcessing === 'approved'}
              disabled={!!isProcessing}
            >
              Approve
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#f5f5f5] rounded">
              <p className="text-[11px] text-[#666] mb-1">Requestor</p>
              <p className="text-[13px] text-[#333] font-medium">{selectedWithdrawal?.user?.first_name} {selectedWithdrawal?.user?.last_name}</p>
            </div>
            <div className="p-4 bg-[#f5f5f5] rounded sm:text-right">
              <p className="text-[11px] text-[#666] mb-1">Amount</p>
              <p className="text-[16px] text-[#333] font-medium">{selectedWithdrawal ? formatCurrency(selectedWithdrawal.amount) : '$0'}</p>
            </div>
          </div>

          <div className="p-4 bg-[#f5f5f5] rounded">
            <p className="text-[11px] text-[#666] mb-1">Destination Bank</p>
            <p className="text-[13px] text-[#333] font-medium">{selectedWithdrawal?.bank_name}</p>
            <p className="text-[12px] text-[#666]">
              Account: ****{selectedWithdrawal?.account_number?.slice(-4)} | Routing: {selectedWithdrawal?.routing_number}
            </p>
          </div>

          <div className="p-4 bg-[#f5f5f5] rounded">
            <p className="text-[11px] text-[#666] mb-1">Source Account</p>
            <p className="text-[13px] text-[#333]">{selectedWithdrawal?.from_account}</p>
            {selectedWithdrawal?.memo && (
              <p className="text-[12px] text-[#666] mt-2">Memo: "{selectedWithdrawal.memo}"</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[12px] text-[#333]">Notes (optional)</label>
            <textarea
              className="w-full p-3 border border-[#ddd] rounded text-[13px] focus:border-[#0066b2] outline-none min-h-[80px]"
              placeholder="Add notes for this decision..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
