'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import Table, { Badge } from '@/app/components/ui/Table';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  category: string;
  date: string;
}

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
}

export default function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [card, setCard] = useState<CreditCard | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocking, setIsLocking] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/user/card/${id}`);
      const result = await response.json();
      if (result.success) {
        setCard(result.data.card);
        setTransactions(result.data.transactions);
      }
    } catch (err) {
      console.error('Error fetching card details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLock = async () => {
    if (!card) return;
    setIsLocking(true);
    try {
      const response = await fetch(`/api/user/card/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_locked: !card.is_locked })
      });
      const result = await response.json();
      if (result.success) {
        setCard(result.data);
      }
    } finally {
      setIsLocking(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-64 bg-bofa-gray-100 rounded-2xl"></div>
      <div className="h-96 bg-bofa-gray-100 rounded-2xl"></div>
    </div>;
  }

  if (!card) return <div className="text-center py-20 font-bold text-bofa-red">Asset Not Found</div>;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Immersive Card Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visa/Mastercard Graphic Card */}
        <div className={`relative h-64 rounded-3xl p-8 text-white shadow-2xl overflow-hidden transition-all duration-500 transform hover:scale-[1.02] ${card.card_type === 'Visa' ? 'bg-gradient-to-br from-bofa-navy via-bofa-navy-dark to-black' : 'bg-gradient-to-br from-red-900 to-black'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex justify-between items-start mb-12">
            <span className="text-sm font-black uppercase tracking-[0.3em] italic opacity-80">Bank of America</span>
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</span>
                <Badge variant={card.is_locked ? 'error' : 'success'} className="ml-auto mt-1 border-white/20">
                  {card.is_locked ? 'LOCKED' : 'ACTIVE'}
                </Badge>
            </div>
          </div>

          <div className="mb-8">
            <p className="font-mono text-2xl font-black tracking-[0.2em] drop-shadow-lg">
              •••• •••• •••• {card.card_number.slice(-4)}
            </p>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1">Expiration</p>
              <p className="font-mono font-bold">{card.expiry_date}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black italic italic-display tracking-tighter">
                {card.card_type}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats & Controls */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4">
            <Card padding="lg" variant="elevated">
              <p className="text-[10px] font-black text-bofa-gray-400 uppercase tracking-widest mb-1">Available Credit</p>
              <p className="text-2xl font-black text-bofa-navy font-mono">{formatCurrency(card.available_credit)}</p>
            </Card>
            <Card padding="lg" variant="elevated">
              <p className="text-[10px] font-black text-bofa-gray-400 uppercase tracking-widest mb-1">Current Balance</p>
              <p className="text-2xl font-black text-bofa-red font-mono">{formatCurrency(card.current_balance)}</p>
            </Card>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-black text-orange-800 uppercase tracking-widest">Rewards Points</p>
                <p className="text-2xl font-black text-orange-600 font-mono">{card.rewards_points.toLocaleString()}</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">Redeem</Button>
          </div>

          <div className="flex gap-4">
            <Button 
                variant={card.is_locked ? "primary" : "danger"} 
                className="flex-1 py-4 font-black uppercase tracking-widest"
                onClick={handleToggleLock}
                isLoading={isLocking}
            >
              {card.is_locked ? 'Unlock Asset' : 'Lock Account'}
            </Button>
            <Button variant="secondary" className="flex-1 py-4 font-black uppercase tracking-widest">
              Report Lost
            </Button>
          </div>
        </div>
      </div>

      {/* Card Activity */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-bofa-navy">Recent Activity</h3>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            keyExtractor={(t) => t.id}
            data={transactions}
            emptyMessage="No recent account activity for this credit asset."
            columns={[
              {
                header: 'Date',
                key: 'date',
                render: (t) => <span className="text-xs font-bold text-bofa-gray-400">{new Date(t.date).toLocaleDateString()}</span>
              },
              {
                header: 'Transaction Detail',
                key: 'description',
                render: (t) => (
                  <div>
                    <p className="font-bold text-bofa-navy text-sm leading-tight">{t.description}</p>
                    <p className="text-[9px] font-black text-bofa-gray-400 uppercase tracking-widest mt-0.5">{t.category || 'RETAIL SETTLEMENT'}</p>
                  </div>
                )
              },
              {
                header: 'Status',
                key: 'status',
                render: () => <Badge variant="success" className="text-[10px]">SETTLED</Badge>
              },
              {
                header: 'Amount',
                key: 'amount',
                align: 'right',
                render: (t) => (
                  <span className={`font-mono font-black text-base ${t.type === 'credit' ? 'text-green-600' : 'text-bofa-red'}`}>
                    {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                )
              }
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
