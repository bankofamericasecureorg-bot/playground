'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';

export default function UserProfilePage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // We would typically fetch user data here
    // For this replica, we'll simulate it using the session name or a mock call
    const fetchUser = async () => {
      // In a real app, we'd hit /api/user/me
      // For now, let's just populate with session-like data
      setFormData({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        address: '789 Banking Way, New York, NY 10001'
      });
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setMessage('Profile updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  if (isLoading) return <div className="h-96 bg-bofa-gray-100 animate-pulse rounded-2xl"></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-bofa-navy">Profile & Preferences</h2>
        <p className="text-bofa-gray-500 font-medium">Manage your personal information and security settings.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <Card variant="elevated">
          <CardHeader>
            <h3 className="font-bold text-bofa-navy uppercase tracking-wider text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-bofa-navy rounded-full"></div>
              Contact Information
            </h3>
          </CardHeader>
          <CardBody className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                className="bg-bofa-gray-50"
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                className="bg-bofa-gray-50"
              />
            </div>
            
            <Input
              label="Primary Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-bofa-gray-50"
              helperText="This email is used for all security notifications and transaction alerts."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-bofa-gray-50"
              />
              <Input
                label="Residental Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-bofa-gray-50"
              />
            </div>
          </CardBody>
          <CardFooter className="bg-bofa-gray-50/50 justify-end flex">
            <Button type="submit" variant="primary" isLoading={isSaving} className="px-10">
              Save Profile Changes
            </Button>
          </CardFooter>
        </Card>

        <Card variant="default" className="border-bofa-red/10">
          <CardHeader>
            <h3 className="font-bold text-bofa-navy uppercase tracking-wider text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-bofa-red rounded-full"></div>
              Security & Passcode
            </h3>
          </CardHeader>
          <CardBody className="space-y-6 pt-6">
            <div className="p-4 bg-bofa-red/5 border border-bofa-red/20 rounded-2xl flex items-start gap-3">
              <svg className="w-5 h-5 text-bofa-red mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                 <p className="text-xs font-bold text-bofa-navy">Update Online Passcode</p>
                 <p className="text-[10px] text-bofa-gray-500 font-medium leading-relaxed mt-1">
                   You will be required to verify your identity via email before a new passcode can be established. This is an essential security measure.
                 </p>
              </div>
            </div>
            
            <Button variant="secondary" className="w-full py-4 font-black uppercase tracking-widest text-xs">Begin Passcode Reset</Button>
          </CardBody>
        </Card>

        {message && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-black text-center animate-slideUp text-xs uppercase tracking-tighter shadow-sm">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
