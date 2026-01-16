'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, CardFooter } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Modal from '@/app/components/ui/Modal';

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Success State
  const [createdUser, setCreatedUser] = useState<any>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setCreatedUser(result.data);
        setIsSuccessModalOpen(true);
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          address: ''
        });
      } else {
        setError(result.error || 'Failed to create user');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="mb-8">
        <button 
          onClick={() => router.back()}
          className="text-sm font-bold text-bofa-gray-400 hover:text-bofa-navy transition-colors flex items-center gap-1 mb-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to User List
        </button>
        <h2 className="text-3xl font-bold text-bofa-navy">Onboard New Customer</h2>
        <p className="text-bofa-gray-500 font-medium">Create a new banking profile. Credentials will be generated automatically.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card variant="elevated">
          <CardHeader>
            <h3 className="font-bold text-bofa-navy uppercase tracking-wider text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-bofa-red rounded-full"></div>
              Personal Information
            </h3>
          </CardHeader>
          <CardBody className="space-y-6 pt-8 pb-10">
            {error && (
              <div className="p-4 bg-bofa-red/5 border border-bofa-red/20 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 text-bofa-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-bold text-bofa-red">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="first_name"
                label="First Name"
                placeholder="Jane"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="bg-bofa-gray-50"
              />
              <Input
                id="last_name"
                label="Last Name"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="bg-bofa-gray-50"
              />
            </div>

            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="jane.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              helperText="This email will be used for professional notifications."
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                </svg>
              }
              className="bg-bofa-gray-50"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="phone"
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
                className="bg-bofa-gray-50"
              />
              <Input
                id="address"
                label="Mailing Address"
                placeholder="123 Financial St, NY"
                value={formData.address}
                onChange={handleChange}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                className="bg-bofa-gray-50"
              />
            </div>
          </CardBody>
          <CardFooter className="bg-bofa-gray-50/50 justify-end flex">
            <Button 
              type="submit" 
              variant="primary" 
              className="px-10" 
              isLoading={isLoading}
            >
              Generate Credentials & Create User
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Account Created Successfully"
        size="md"
      >
        <div className="space-y-6">
          <div className="p-5 bg-green-50 border border-green-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-green-800">Registration Complete</h4>
                <p className="text-xs text-green-600 font-bold uppercase tracking-tight">Email notification dispatched</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-green-700 uppercase mb-1">Generated Online ID</p>
                <div className="p-3 bg-white border border-green-200 rounded-xl font-mono text-xl font-black text-bofa-navy tracking-widest text-center shadow-inner">
                  {createdUser?.raw_online_id}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-green-700 uppercase mb-1">Confidential Passcode</p>
                <div className="p-3 bg-white border border-green-200 rounded-xl font-mono text-xl font-black text-bofa-red tracking-widest text-center shadow-inner">
                  {createdUser?.raw_passcode}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-bofa-navy text-white rounded-xl text-center">
            <p className="text-sm font-bold">Important Security Notice</p>
            <p className="text-[10px] text-white/60 mt-1 uppercase tracking-wider font-bold">
              Please provide these credentials to the customer securely. They will be prompted to change their passcode upon first login.
            </p>
          </div>

          <Button 
            className="w-full py-4 text-xs font-black uppercase tracking-[0.2em]" 
            variant="secondary"
            onClick={() => setIsSuccessModalOpen(false)}
          >
            Acknowledge & Dismiss
          </Button>
        </div>
      </Modal>
    </div>
  );
}
