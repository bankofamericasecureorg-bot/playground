'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, AccountCard } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Link from 'next/link';

export default function UserCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch('/api/user/dashboard');
        const result = await response.json();
        if (result.success) {
          setCards(result.data.cards);
        }
      } catch (err) {
        console.error('Error fetching cards:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCards();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-bofa-gray-500">Loading your cards...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-bofa-navy">Credit Cards</h1>
        <Button variant="primary">Apply for a Card</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <Link key={card.id} href={`/dashboard/card/${card.id}`}>
            <AccountCard
              type="credit"
              accountNumber={`•••• ${card.card_number.slice(-4)}`}
              balance={card.current_balance}
              limit={card.credit_limit}
              className="hover:scale-[1.02] transition-transform"
            />
          </Link>
        ))}
      </div>

      {cards.length === 0 && (
        <Card>
            <CardBody className="text-center py-12">
                <p className="text-bofa-gray-600 mb-4">You don't have any credit cards with us.</p>
                <Button variant="primary">View Card Offers</Button>
            </CardBody>
        </Card>
      )}
    </div>
  );
}
