'use client';

import { useState, useEffect } from 'react';
import Button from '@/app/components/ui/Button';
import Table, { Badge } from '@/app/components/ui/Table';
import Modal from '@/app/components/ui/Modal';
import Pagination from '@/app/components/ui/Pagination';
import { createClient } from '@/lib/supabase/client';

const ITEMS_PER_PAGE = 10;

interface TransferRequest {
  id: string;
  from_account: string;
  to_account: string;
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function AdminTransfersPage() {
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Decision State
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState<'approved' | 'rejected' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTransfers();
    
    // Realtime subscription for new and updated transfers
    const supabase = createClient();
    const channel = supabase
      .channel('admin_transfer_updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'transfer_requests'
        },
        () => {
          // Refetch all transfers on any change
          fetchTransfers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTransfers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/transfers');
      const result = await response.json();
      if (result.success) {
        setTransfers(result.data);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (!selectedTransfer) return;
    setIsProcessing(status);
    try {
      const response = await fetch(`/api/admin/transfers/${selectedTransfer.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: adminNotes })
      });
      if (response.ok) {
        fetchTransfers();
        setSelectedTransfer(null);
        setAdminNotes('');
      } else {
        const err = await response.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error('Error processing transfer:', error);
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

  const pendingCount = transfers.filter(t => t.status === 'pending').length;
  
  // Pagination
  const totalItems = transfers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedTransfers = transfers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[14px] font-normal text-[#333]">Transfer Requests</div>
          <p className="text-[13px] text-[#666]">Review and process outgoing transfer requests.</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="warning">{pendingCount} Pending</Badge>
        )}
      </div>

      <div className="bg-white border border-[#ddd] rounded overflow-hidden">
        <Table
          keyExtractor={(t) => t.id}
          data={paginatedTransfers}
          isLoading={isLoading}
          emptyMessage="No transfer requests."
          columns={[
            {
              header: 'Requestor',
              key: 'user',
              render: (t) => (
                <div>
                  <p className="text-[14px] text-[#333] font-medium">{t.user.first_name} {t.user.last_name}</p>
                  <p className="text-[12px] text-[#666]">{t.user.email}</p>
                </div>
              )
            },
            {
              header: 'From → To',
              key: 'path',
              render: (t) => (
                <div className="flex items-center gap-2">
                  <span className="text-[14px] text-[#333]">{t.from_account}</span>
                  <svg className="w-4 h-4 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="text-[14px] text-[#333]">{t.to_account}</span>
                </div>
              )
            },
            {
              header: 'Amount',
              key: 'amount',
              align: 'right',
              render: (t) => (
                <span className="text-[16px] font-medium text-[#333]">
                  {formatCurrency(t.amount)}
                </span>
              )
            },
            {
              header: 'Status',
              key: 'status',
              render: (t) => (
                <Badge variant={t.status === 'approved' ? 'success' : t.status === 'rejected' ? 'error' : 'warning'}>
                  {t.status === 'pending' ? 'Pending' : t.status === 'approved' ? 'Approved' : 'Rejected'}
                </Badge>
              )
            },
            {
              header: 'Actions',
              key: 'actions',
              align: 'right',
              render: (t) => (
                t.status === 'pending' ? (
                  <button 
                    onClick={() => setSelectedTransfer(t)}
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
        isOpen={!!selectedTransfer}
        onClose={() => setSelectedTransfer(null)}
        title="Review Transfer Request"
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
              <p className="text-[13px] text-[#333] font-medium">{selectedTransfer?.user.first_name} {selectedTransfer?.user.last_name}</p>
            </div>
            <div className="p-4 bg-[#f5f5f5] rounded sm:text-right">
              <p className="text-[11px] text-[#666] mb-1">Amount</p>
              <p className="text-[16px] text-[#333] font-medium">{selectedTransfer ? formatCurrency(selectedTransfer.amount) : '$0'}</p>
            </div>
          </div>

          <div className="p-4 bg-[#f5f5f5] rounded">
            <p className="text-[11px] text-[#666] mb-1">Transfer Details</p>
            <p className="text-[13px] text-[#333]">
              From <span className="font-medium">{selectedTransfer?.from_account}</span> to <span className="font-medium">{selectedTransfer?.to_account}</span>
            </p>
            {selectedTransfer?.description && (
              <p className="text-[12px] text-[#666] mt-2">"{selectedTransfer.description}"</p>
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
