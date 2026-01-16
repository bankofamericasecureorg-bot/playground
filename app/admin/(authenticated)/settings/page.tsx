'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    name: 'Administrator',
    email: 'admin@bankofamerica.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Placeholder for actual update logic
    setTimeout(() => {
      setIsSaving(false);
      setMessage('Security profile updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-bofa-navy">System Settings</h2>
        <p className="text-bofa-gray-500 font-medium">Configure administrative permissions and security protocols.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card variant="elevated">
          <CardHeader>
            <h3 className="font-bold text-bofa-navy uppercase tracking-wider text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-bofa-navy rounded-full"></div>
              Administrator Profile
            </h3>
          </CardHeader>
          <CardBody className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </CardBody>
        </Card>

        <Card variant="default">
          <CardHeader>
            <h3 className="font-bold text-bofa-navy uppercase tracking-wider text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-bofa-red rounded-full"></div>
              Security Credentials
            </h3>
          </CardHeader>
          <CardBody className="space-y-6 pt-6">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </CardBody>
          <CardFooter className="bg-bofa-gray-50 justify-end flex">
            <Button type="submit" variant="primary" isLoading={isSaving} className="px-8">
              Update Credentials
            </Button>
          </CardFooter>
        </Card>

        {message && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-bold text-center animate-slideUp">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
