'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, CardFooter } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${id}`);
      const result = await response.json();
      if (result.success) {
        const { first_name, last_name, email, phone, address } = result.data;
        setFormData({ first_name, last_name, email, phone, address });
      } else {
        setError('Failed to load user data');
      }
    } catch (error) {
      setError('An error occurred while fetching user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to update user');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bofa-navy"></div>
      </div>
    );
  }

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
        <h2 className="text-3xl font-bold text-bofa-navy">Edit Customer Profile</h2>
        <p className="text-bofa-gray-500 font-medium">Update personal information for this client.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card variant="default">
          <CardHeader>
            <h3 className="font-bold text-bofa-navy uppercase tracking-wider text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-bofa-navy rounded-full"></div>
              Personal Details
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

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-slideUp">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm font-bold text-green-700">Profile updated successfully!</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="first_name"
                label="First Name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <Input
                id="last_name"
                label="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              id="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
              <Input
                id="address"
                label="Mailing Address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </CardBody>
          <CardFooter className="bg-bofa-gray-50 justify-end flex gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="px-10" 
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
