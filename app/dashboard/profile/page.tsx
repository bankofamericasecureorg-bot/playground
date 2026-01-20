'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';

export default function UserProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        const result = await response.json();
        if (result.success) {
          setUser(result.data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="h-20 bg-white animate-pulse rounded border border-[#ddd]"></div>
      <div className="h-64 bg-white animate-pulse rounded border border-[#ddd]"></div>
    </div>
  );

  if (!user) return (
    <div className="max-w-3xl mx-auto p-8 text-center bg-white border border-[#ddd] rounded">
      <p className="text-sm text-[#666]">Unable to load profile information.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="mb-6">
        <div className="text-[16px] font-medium text-[#012169]">Profile & Preferences</div>
        <p className="text-[13px] text-[#666] mt-1 font-normal">Review your personal information and security settings.</p>
      </div>

      <div className="space-y-6">
        <Card variant="default" className="border-[#ddd]">
          <CardHeader className="border-b border-[#eee] bg-[#fdfdfd] py-3">
            <div className="text-[14px] font-normal text-[#333] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#012169] rounded-full"></div>
              Contact information
            </div>
          </CardHeader>
          <CardBody className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-1">
                <label className="text-[12px] text-[#666] font-normal">First name</label>
                <div className="text-[14px] text-[#333] font-medium">{user.first_name}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[12px] text-[#666] font-normal">Last name</label>
                <div className="text-[14px] text-[#333] font-medium">{user.last_name}</div>
              </div>
            </div>
            
            <div className="space-y-1 pt-2 border-t border-[#f8f8f8]">
              <label className="text-[12px] text-[#666] font-normal">Primary email</label>
              <div className="text-[14px] text-[#333] font-medium">{user.email}</div>
              <p className="text-[11px] text-[#999] mt-1 italic font-normal">
                This email is used for all security notifications and transaction alerts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-2 border-t border-[#f8f8f8]">
              <div className="space-y-1">
                <label className="text-[12px] text-[#666] font-normal">Phone number</label>
                <div className="text-[14px] text-[#333] font-medium">{user.phone || 'Not provided'}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[12px] text-[#666] font-normal">Residential address</label>
                <div className="text-[14px] text-[#333] font-medium leading-relaxed">{user.address || 'Not provided'}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="default" className="border-[#ddd]">
          <CardHeader className="border-b border-[#eee] bg-[#fdfdfd] py-3">
            <div className="text-[14px] font-normal text-[#333] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#c41230] rounded-full"></div>
              Security & passcode
            </div>
          </CardHeader>
          <CardBody className="space-y-6 pt-6 pb-2">
            <div className="p-4 bg-[#fcfcfc] border border-[#f0f0f0] rounded-lg border-l-4 border-l-[#c41230]">
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-[#c41230] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                   <p className="text-[13px] font-bold text-[#333]">Update online passcode</p>
                   <p className="text-[11px] text-[#666] font-normal leading-relaxed mt-1">
                     To update your passcode or other security credentials, please contact our support desk or visit a local financial center for identity verification.
                   </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-[#eee]">
              <span className="text-[12px] text-[#666]">Online ID</span>
              <span className="text-[13px] font-mono font-medium text-[#333]">•••• {user.online_id?.slice(-4) || '••••'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[12px] text-[#666]">Last login</span>
              <span className="text-[12px] text-[#333] font-medium">Recent</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
