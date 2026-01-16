'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Table, { Badge } from '@/app/components/ui/Table';
import Modal from '@/app/components/ui/Modal';

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
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchTransfers();
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
    setIsProcessing(true);
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
      setIsProcessing(false);
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-bofa-navy">Transfer Authority</h2>
        <p className="text-bofa-gray-500 font-medium tracking-tight">Review and process outgoing wire and transfer requests.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-bofa-navy">Global Queue</h3>
            <Badge variant="pending">{transfers.filter(t => t.status === 'pending').length} Pending</Badge>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            keyExtractor={(t) => t.id}
            data={transfers}
            isLoading={isLoading}
            emptyMessage="The transfer queue is currently empty."
            columns={[
              {
                header: 'Requestor',
                key: 'user',
                render: (t) => (
                  <div>
                    <p className="font-bold text-bofa-navy">{t.user.first_name} {t.user.last_name}</p>
                    <p className="text-[10px] text-bofa-gray-400 font-bold uppercase">{t.user.email}</p>
                  </div>
                )
              },
              {
                header: 'Routing Path',
                key: 'path',
                render: (t) => (
                  <div className="flex items-center gap-2">
                    <div className="text-xs">
                      <p className="text-bofa-gray-400 font-bold uppercase tracking-tighter">Source</p>
                      <p className="font-mono font-bold text-bofa-navy">{t.from_account}</p>
                    </div>
                    <svg className="w-4 h-4 text-bofa-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <div className="text-xs">
                      <p className="text-bofa-gray-400 font-bold uppercase tracking-tighter">Target</p>
                      <p className="font-mono font-bold text-bofa-navy">{t.to_account}</p>
                    </div>
                  </div>
                )
              },
              {
                header: 'Amount',
                key: 'amount',
                align: 'right',
                render: (t) => (
                  <span className="font-mono font-black text-bofa-red text-base">
                    {formatCurrency(t.amount)}
                  </span>
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
                header: 'Actions',
                key: 'actions',
                align: 'right',
                render: (t) => (
                  t.status === 'pending' ? (
                    <button 
                      onClick={() => setSelectedTransfer(t)}
                      className="px-4 py-2 bg-bofa-navy text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-bofa-navy-dark transition-all shadow-md"
                    >
                      Process
                    </button>
                  ) : (
                    <span className="text-xs text-bofa-gray-400 font-bold italic">Closed</span>
                  )
                )
              }
            ]}
          />
        </CardBody>
      </Card>

      {/* Process Modal */}
      <Modal
        isOpen={!!selectedTransfer}
        onClose={() => setSelectedTransfer(null)}
        title="Administrative Transfer Review"
        size="md"
        footer={
          <div className="flex gap-3 w-full">
            <Button 
              variant="danger" 
              className="flex-1 font-black" 
              onClick={() => handleDecision('rejected')}
              isLoading={isProcessing}
            >
              Reject Request
            </Button>
            <Button 
              variant="primary" 
              className="flex-1 font-black" 
              onClick={() => handleDecision('approved')}
              isLoading={isProcessing}
            >
              Approve Transfer
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-bofa-gray-50 rounded-xl border border-bofa-gray-100">
              <p className="text-[10px] font-black text-bofa-gray-400 uppercase tracking-widest mb-1">Debiting Agent</p>
              <p className="font-bold text-bofa-navy">{selectedTransfer?.user.first_name} {selectedTransfer?.user.last_name}</p>
            </div>
            <div className="p-4 bg-bofa-red/5 rounded-xl border border-bofa-red/10 text-right">
              <p className="text-[10px] font-black text-bofa-red uppercase tracking-widest mb-1">Total Payload</p>
              <p className="text-xl font-black text-bofa-red font-mono">{selectedTransfer ? formatCurrency(selectedTransfer.amount) : '0'}</p>
            </div>
          </div>

          <div className="p-4 bg-bofa-gray-50 rounded-xl border border-bofa-gray-100">
            <p className="text-[10px] font-black text-bofa-gray-400 uppercase tracking-widest mb-1">Routing Instructions</p>
            <p className="text-sm font-medium text-bofa-navy leading-relaxed">
              Transfer funds from <span className="font-mono font-bold underline decoration-bofa-red">{selectedTransfer?.from_account}</span> to target destination identifier <span className="font-mono font-bold underline decoration-bofa-navy">{selectedTransfer?.to_account}</span>.
            </p>
            {selectedTransfer?.description && (
              <p className="mt-3 text-xs italic text-bofa-gray-500 font-medium">
                Ref: &ldquo;{selectedTransfer.description}&rdquo;
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-bofa-navy uppercase tracking-widest">Internal Review Notes</label>
            <textarea
              className="w-full p-4 bg-bofa-gray-50 border border-bofa-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-bofa-navy focus:border-bofa-navy outline-none min-h-[100px] transition-all"
              placeholder="Enter rational for approval or rejection (visible to client)..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
             <div className="flex gap-3">
               <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
               <p className="text-[10px] font-bold text-yellow-800 leading-normal">
                 AUTHORIZATION REQUIRED: Approval will immediately debit the client&apos;s source account and create immutable ledger entries. Rejection will notify the client with the reason provided.
               </p>
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
