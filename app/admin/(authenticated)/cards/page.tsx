'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input, { Select } from '@/app/components/ui/Input';
import Table, { Badge } from '@/app/components/ui/Table';
import Modal, { ConfirmModal } from '@/app/components/ui/Modal';
import Link from 'next/link';

interface CreditCard {
  id: string;
  card_number: string;
  card_type: 'Visa' | 'Mastercard';
  credit_limit: number;
  current_balance: number;
  available_credit: number;
  rewards_points: number;
  is_locked: boolean;
  expiry_date: string;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function AdminCardsPage() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Issuance State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [issueData, setIssueData] = useState({
    user_id: '',
    card_type: 'Visa',
    credit_limit: '5000'
  });
  const [isIssuing, setIsIssuing] = useState(false);

  // Management State
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [updateData, setUpdateData] = useState({
    credit_limit: '',
    rewards_points: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchCards();
    fetchUsers();
  }, []);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/cards');
      const result = await response.json();
      if (result.success) setCards(result.data);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    const response = await fetch('/api/admin/users');
    const result = await response.json();
    if (result.success) setUsers(result.data);
  };

  const handleIssueCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssuing(true);
    try {
      const response = await fetch('/api/admin/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueData)
      });
      if (response.ok) {
        fetchCards();
        setIsIssueModalOpen(false);
      }
    } finally {
      setIsIssuing(false);
    }
  };

  const handleUpdateCard = async () => {
    if (!selectedCard) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/cards/${selectedCard.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credit_limit: Number(updateData.credit_limit),
          rewards_points: Number(updateData.rewards_points)
        })
      });
      if (response.ok) {
        fetchCards();
        setSelectedCard(null);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleLock = async (card: CreditCard) => {
    await fetch(`/api/admin/cards/${card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_locked: !card.is_locked })
    });
    fetchCards();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-bofa-navy">Credit Portfolios</h2>
          <p className="text-bofa-gray-500 font-medium">Manage risk, rewards, and issuance for plastic assets.</p>
        </div>
        <Button variant="primary" onClick={() => setIsIssueModalOpen(true)} leftIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        }>
          Issue New Card
        </Button>
      </div>

      <Card>
        <CardBody className="p-0">
          <Table
            keyExtractor={(c) => c.id}
            data={cards}
            isLoading={isLoading}
            columns={[
              {
                header: 'Cardholder',
                key: 'user',
                render: (c) => (
                  <div>
                    <p className="font-bold text-bofa-navy">{c.user.first_name} {c.user.last_name}</p>
                    <p className="text-[10px] text-bofa-gray-400 font-black uppercase tracking-widest">{c.user.email}</p>
                  </div>
                )
              },
              {
                header: 'Card Asset',
                key: 'asset',
                render: (c) => (
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-6 rounded flex items-center justify-center text-[8px] font-black text-white ${c.card_type === 'Visa' ? 'bg-blue-800' : 'bg-orange-600'}`}>
                      {c.card_type.toUpperCase()}
                    </div>
                    <div className="font-mono text-xs">
                      <p className="text-bofa-navy font-bold">•••• {c.card_number.slice(-4)}</p>
                      <p className="text-bofa-gray-400">EXP: {c.expiry_date}</p>
                    </div>
                  </div>
                )
              },
              {
                header: 'Utilization',
                key: 'utilization',
                render: (c) => (
                  <div className="w-40">
                    <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                      <span className="text-bofa-gray-400">Used</span>
                      <span className="text-bofa-navy">{formatCurrency(c.current_balance)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-bofa-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-bofa-navy rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min((c.current_balance / c.credit_limit) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase mt-1">
                      <span className="text-bofa-gray-400">Limit</span>
                      <span className="text-bofa-gray-600">{formatCurrency(c.credit_limit)}</span>
                    </div>
                  </div>
                )
              },
              {
                header: 'Rewards',
                key: 'rewards',
                render: (c) => (
                  <div className="flex flex-col items-center">
                    <span className="font-mono font-black text-orange-600 text-sm">{c.rewards_points.toLocaleString()}</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter text-bofa-gray-400">Points</span>
                  </div>
                )
              },
              {
                header: 'Status',
                key: 'status',
                render: (c) => (
                  <button onClick={() => toggleLock(c)} className="transition-transform active:scale-95">
                    <Badge variant={c.is_locked ? 'error' : 'success'}>
                      {c.is_locked ? 'LOCKED' : 'ACTIVE'}
                    </Badge>
                  </button>
                )
              },
              {
                header: 'Actions',
                key: 'actions',
                align: 'right',
                render: (c) => (
                  <Button size="sm" variant="secondary" onClick={() => {
                    setSelectedCard(c);
                    setUpdateData({ credit_limit: c.credit_limit.toString(), rewards_points: c.rewards_points.toString() });
                  }}>
                    Configure
                  </Button>
                )
              }
            ]}
          />
        </CardBody>
      </Card>

      {/* Issuance Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Provision Credit Asset"
      >
        <form onSubmit={handleIssueCard} className="space-y-6">
          <Select
            label="Target Account Holder"
            options={[{ value: '', label: 'Select a customer...' }, ...users.map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}` }))]}
            value={issueData.user_id}
            onChange={(e) => setIssueData({ ...issueData, user_id: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Asset Class"
              options={[{ value: 'Visa', label: 'Visa Signature' }, { value: 'Mastercard', label: 'Mastercard World' }]}
              value={issueData.card_type}
              onChange={(e) => setIssueData({ ...issueData, card_type: e.target.value as 'Visa' | 'Mastercard' })}
              required
            />
            <Input
              label="Credit Line"
              type="number"
              value={issueData.credit_limit}
              onChange={(e) => setIssueData({ ...issueData, credit_limit: e.target.value })}
              required
              leftIcon={<span className="font-bold text-bofa-gray-400">$</span>}
            />
          </div>
          <Button type="submit" variant="primary" className="w-full" isLoading={isIssuing}>Issue Asset & Print Card</Button>
        </form>
      </Modal>

      {/* Configuration Modal */}
      <Modal
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        title="Configure Card Attributes"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="secondary" className="flex-1" onClick={() => setSelectedCard(null)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleUpdateCard} isLoading={isUpdating}>Commit Changes</Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="p-4 bg-bofa-gray-50 rounded-xl border border-bofa-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-bofa-gray-400 uppercase tracking-widest">Selected Card</p>
              <p className="font-bold text-bofa-navy">{selectedCard?.user.first_name} {selectedCard?.user.last_name}</p>
              <p className="font-mono text-xs text-bofa-gray-600">•••• {selectedCard?.card_number.slice(-4)}</p>
            </div>
            <div className={`w-12 h-8 rounded flex items-center justify-center text-[10px] font-black text-white ${selectedCard?.card_type === 'Visa' ? 'bg-blue-800' : 'bg-orange-600'}`}>
              {selectedCard?.card_type.toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="New Credit Limit"
              type="number"
              value={updateData.credit_limit}
              onChange={(e) => setUpdateData({ ...updateData, credit_limit: e.target.value })}
              leftIcon={<span className="font-bold text-bofa-gray-400">$</span>}
            />
            <Input
              label="Adjust Rewards"
              type="number"
              value={updateData.rewards_points}
              onChange={(e) => setUpdateData({ ...updateData, rewards_points: e.target.value })}
              leftIcon={<span className="font-bold text-bofa-orange-600">★</span>}
            />
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-[10px] text-yellow-800 font-black uppercase tracking-widest">Policy Note</p>
            <p className="text-xs text-bofa-gray-600 mt-1 font-medium">Changes to credit lines or rewards balances will be visible to the customer immediately upon their next dashboard synchronization.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
