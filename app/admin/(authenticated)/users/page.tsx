'use client';

import { useState, useEffect } from 'react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Table, { Badge } from '@/app/components/ui/Table';
import Pagination from '@/app/components/ui/Pagination';
import { ConfirmModal } from '@/app/components/ui/Modal';
import Link from 'next/link';

const ITEMS_PER_PAGE = 10;

interface User {
  id: string;
  online_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Selection/Actions state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFilteredUsers(
      users.filter(u => 
        u.first_name.toLowerCase().includes(term) || 
        u.last_name.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term) ||
        u.online_id?.toLowerCase().includes(term)
      )
    );
    setCurrentPage(1); // Reset to page 1 when search changes
  }, [search, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[14px] font-normal text-[#333]">User Management</div>
          <p className="text-[13px] text-[#666]">View and manage all banking customers.</p>
        </div>
        <Link href="/admin/users/new">
          <Button variant="primary" leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }>
            Create New Customer
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-[#ddd] rounded overflow-hidden">
        <div className="px-4 py-3 border-b border-[#eee] flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by name, email, or Online ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={
                <svg className="w-4 h-4 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              className="text-[14px]"
            />
          </div>
          <Badge variant="info">{filteredUsers.length} Total Users</Badge>
        </div>
        <Table
          keyExtractor={(u) => u.id}
          data={paginatedUsers}
          isLoading={isLoading}
          emptyMessage="No users found matching your search."
          columns={[
            {
              header: 'Customer Information',
              key: 'name',
              render: (u) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#012169] text-white flex items-center justify-center text-[12px] font-medium">
                    {u.first_name?.[0]}{u.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-[14px] text-[#333] font-medium">{u.first_name} {u.last_name}</p>
                    <p className="text-[12px] text-[#666]">{u.email}</p>
                  </div>
                </div>
              )
            },
            {
              header: 'Online ID',
              key: 'online_id',
              render: (u) => <span className="text-[14px] text-[#333]">{u.online_id || 'N/A'}</span>
            },
            {
              header: 'Registration',
              key: 'created_at',
              render: (u) => (
                <div>
                  <p className="text-[14px] text-[#333]">{new Date(u.created_at).toLocaleDateString()}</p>
                  <p className="text-[12px] text-[#666]">{new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              )
            },
            {
              header: 'Actions',
              key: 'actions',
              align: 'right',
              render: (u) => (
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/users/${u.id}`}>
                    <button className="p-2 text-[#666] hover:text-[#0066b2] transition-colors rounded hover:bg-[#f5f5f5]" title="Edit User">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </Link>
                  <button 
                    onClick={() => setUserToDelete(u)}
                    className="p-2 text-[#666] hover:text-[#c41230] transition-colors rounded hover:bg-red-50" 
                    title="Delete User"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )
            }
          ]}
        />
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={totalItems}
        />
      </div>

      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Customer?"
        message={`Are you sure you want to delete ${userToDelete?.first_name} ${userToDelete?.last_name}? This action will permanently remove all credentials and associated records.`}
        confirmText="Delete Permanently"
      />
    </div>
  );
}
