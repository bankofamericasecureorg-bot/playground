'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Table';
import Button from '@/app/components/ui/Button';
import Pagination from '@/app/components/ui/Pagination';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const ITEMS_PER_PAGE = 5;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Pagination logic
  const totalItems = notifications.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[16px] font-medium text-[#012169]">Security & Alerts</div>
          <p className="text-[13px] text-[#666] mt-1 font-normal">Stay informed about your accounts and recent transactions.</p>
        </div>
        <div className="bg-[#e8f3fb] text-[#0066b2] text-[12px] font-medium px-3 py-1 rounded-full border border-[#d1e5f5]">
          {notifications.filter(n => !n.is_read).length} New Alerts
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-24 bg-white border border-[#eee] animate-pulse rounded"></div>)
        ) : notifications.length === 0 ? (
          <Card padding="lg" className="text-center py-20 border-[#ddd]">
            <div className="w-12 h-12 bg-[#fdfdfd] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#eee]">
               <svg className="w-6 h-6 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
               </svg>
            </div>
            <div className="text-[14px] text-[#666] font-normal">You have no recent notifications.</div>
          </Card>
        ) : (
          <>
            <div className="bg-white border border-[#ddd] rounded overflow-hidden">
              {paginatedNotifications.map((n, index) => (
                <div 
                  key={n.id} 
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={`px-6 py-5 flex items-start gap-4 transition-colors cursor-pointer border-b border-[#eee] last:border-b-0 hover:bg-[#fafafa] ${!n.is_read ? 'bg-[#fdfdfd]' : ''}`}
                >
                  <div className={`p-2 rounded mt-0.5 ${!n.is_read ? 'bg-[#e8f3fb] text-[#0066b2]' : 'bg-[#f5f5f5] text-[#999]'}`}>
                    {n.type === 'transfer' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className={`text-[14px] font-medium ${!n.is_read ? 'text-[#333]' : 'text-[#666]'}`}>
                        {n.title}
                      </div>
                      <div className="text-[12px] text-[#999] font-normal">
                        {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <p className={`text-[13px] leading-relaxed ${!n.is_read ? 'text-[#333]' : 'text-[#666]'}`}>
                      {n.message}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 bg-[#0066b2] rounded-full self-center"></div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={totalItems}
              />
            </div>
          </>
        )}
      </div>

      <div className="p-6 bg-[#012169] rounded border border-[#001a4d] text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="text-[16px] font-medium mb-2">Paperless statements</div>
          <p className="text-[13px] text-white/80 max-w-lg mb-6 leading-relaxed font-normal">
            Enroll in paperless delivery to receive secure digital statements. You&apos;ll get an email alert as soon as your statement is ready.
          </p>
          <button className="px-6 py-2.5 bg-white text-[#012169] rounded font-medium text-[13px] hover:bg-white/90 transition-colors">
            Update preferences
          </button>
        </div>
      </div>
    </div>
  );
}
