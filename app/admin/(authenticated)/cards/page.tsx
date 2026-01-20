'use client';

import { useState, useEffect } from 'react';
import Button from '@/app/components/ui/Button';
import Input, { Select } from '@/app/components/ui/Input';
import Table, { Badge } from '@/app/components/ui/Table';
import Modal from '@/app/components/ui/Modal';

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[14px] font-normal text-[#333]">Credit Cards</div>
          <p className="text-[13px] text-[#666]">Manage credit cards, limits, and rewards.</p>
        </div>
        <Button variant="primary" onClick={() => setIsIssueModalOpen(true)} leftIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }>
          Issue New Card
        </Button>
      </div>

      <div className="bg-white border border-[#ddd] rounded overflow-hidden">
        <Table
          keyExtractor={(c) => c.id}
          data={cards}
          isLoading={isLoading}
          emptyMessage="No credit cards issued."
          columns={[
            {
              header: 'Cardholder',
              key: 'user',
              render: (c) => (
                <div>
                  <p className="text-[14px] text-[#333] font-medium">{c.user.first_name} {c.user.last_name}</p>
                  <p className="text-[12px] text-[#666]">{c.user.email}</p>
                </div>
              )
            },
            {
              header: 'Card',
              key: 'asset',
              render: (c) => (
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 rounded text-[11px] text-white ${c.card_type === 'Visa' ? 'bg-blue-700' : 'bg-orange-600'}`}>
                    {c.card_type}
                  </div>
                  <div>
                    <p className="text-[14px] text-[#333]">•••• {c.card_number.slice(-4)}</p>
                    <p className="text-[12px] text-[#666]">Exp: {c.expiry_date}</p>
                  </div>
                </div>
              )
            },
            {
              header: 'Balance / Limit',
              key: 'utilization',
              render: (c) => (
                <div>
                  <p className="text-[14px] text-[#333]">{formatCurrency(c.current_balance)}</p>
                  <p className="text-[12px] text-[#666]">of {formatCurrency(c.credit_limit)}</p>
                </div>
              )
            },
            {
              header: 'Rewards',
              key: 'rewards',
              render: (c) => (
                <span className="text-[14px] text-orange-600">{c.rewards_points.toLocaleString()} pts</span>
              )
            },
            {
              header: 'Status',
              key: 'status',
              render: (c) => (
                <button onClick={() => toggleLock(c)}>
                  <Badge variant={c.is_locked ? 'error' : 'success'}>
                    {c.is_locked ? 'Locked' : 'Active'}
                  </Badge>
                </button>
              )
            },
            {
              header: 'Actions',
              key: 'actions',
              align: 'right',
              render: (c) => (
                <button 
                  onClick={() => {
                    setSelectedCard(c);
                    setUpdateData({ credit_limit: c.credit_limit.toString(), rewards_points: c.rewards_points.toString() });
                  }}
                  className="text-[13px] text-[#0066b2] hover:underline"
                >
                  Configure
                </button>
              )
            }
          ]}
        />
      </div>

      {/* Issuance Modal */}
      <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} title="Issue New Card">
        <form onSubmit={handleIssueCard} className="space-y-4">
          <Select
            label="Customer"
            options={[{ value: '', label: 'Select a customer...' }, ...users.map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}` }))]}
            value={issueData.user_id}
            onChange={(e) => setIssueData({ ...issueData, user_id: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Card Type"
              options={[{ value: 'Visa', label: 'Visa' }, { value: 'Mastercard', label: 'Mastercard' }]}
              value={issueData.card_type}
              onChange={(e) => setIssueData({ ...issueData, card_type: e.target.value as 'Visa' | 'Mastercard' })}
              required
            />
            <Input
              label="Credit Limit"
              type="number"
              value={issueData.credit_limit}
              onChange={(e) => setIssueData({ ...issueData, credit_limit: e.target.value })}
              required
              leftIcon={<span className="text-[#666]">$</span>}
            />
          </div>
          <Button type="submit" variant="primary" className="w-full" isLoading={isIssuing}>Issue Card</Button>
        </form>
      </Modal>

      {/* Configuration Modal */}
      <Modal
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        title="Configure Card"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="secondary" className="flex-1" onClick={() => setSelectedCard(null)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleUpdateCard} isLoading={isUpdating}>Save Changes</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-[#f5f5f5] rounded">
            <p className="text-[12px] text-[#666]">Selected Card</p>
            <p className="text-[14px] text-[#333] font-medium">{selectedCard?.user.first_name} {selectedCard?.user.last_name}</p>
            <p className="text-[13px] text-[#666]">{selectedCard?.card_type} •••• {selectedCard?.card_number.slice(-4)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Credit Limit"
              type="number"
              value={updateData.credit_limit}
              onChange={(e) => setUpdateData({ ...updateData, credit_limit: e.target.value })}
              leftIcon={<span className="text-[#666]">$</span>}
            />
            <Input
              label="Rewards Points"
              type="number"
              value={updateData.rewards_points}
              onChange={(e) => setUpdateData({ ...updateData, rewards_points: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
