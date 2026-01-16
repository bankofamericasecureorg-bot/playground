'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Table';
import Button from '@/app/components/ui/Button';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/user/notifications');
      const result = await response.json();
      if (result.success) setNotifications(result.data);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await fetch('/api/user/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_read: true })
    });
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-bofa-navy">Security & Alerts</h2>
          <p className="text-bofa-gray-500 font-medium">Stay informed about your accounts and recent transactions.</p>
        </div>
        <Badge variant="info" className="px-4 py-2 text-sm">
          {notifications.filter(n => !n.is_read).length} New Alerts
        </Badge>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-24 bg-bofa-gray-100 animate-pulse rounded-2xl"></div>)
        ) : notifications.length === 0 ? (
          <Card padding="lg" className="text-center py-20">
            <div className="w-16 h-16 bg-bofa-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-bofa-gray-100">
               <svg className="w-8 h-8 text-bofa-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
               </svg>
            </div>
            <p className="text-bofa-gray-500 font-bold">You have no recent notifications.</p>
          </Card>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer group hover:shadow-lg ${n.is_read ? 'bg-white border-bofa-gray-100 opacity-70' : 'bg-white border-bofa-blue/30 shadow-sm ring-1 ring-bofa-blue/5'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${n.is_read ? 'bg-bofa-gray-50 text-bofa-gray-400' : 'bg-bofa-blue/10 text-bofa-blue shadow-inner'}`}>
                  {n.type === 'transfer' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-black text-sm uppercase tracking-wider ${n.is_read ? 'text-bofa-gray-500' : 'text-bofa-navy'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] font-bold text-bofa-gray-400">
                      {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-sm font-medium leading-relaxed ${n.is_read ? 'text-bofa-gray-400' : 'text-bofa-gray-600'}`}>
                    {n.message}
                  </p>
                </div>
                {!n.is_read && (
                  <div className="w-2 h-2 bg-bofa-blue rounded-full shadow-glow animate-pulse self-center"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-8 bg-bofa-navy rounded-3xl text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-500"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Paperless Statements</h3>
          <p className="text-sm text-white/70 max-w-lg mb-6 leading-relaxed font-medium">
            Enroll in paperless delivery to receive secure digital statements and reduce your carbon footprint. You&apos;ll get an email alert as soon as your statement is ready.
          </p>
          <Button variant="secondary" className="px-8 py-4 font-black text-xs uppercase tracking-widest">Update Preferences</Button>
        </div>
      </div>
    </div>
  );
}
