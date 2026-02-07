"use client";

import { useState } from 'react';
import { UserWithStats } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { Search, Filter, Download } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import UserTable from '@/components/admin/UserTable';
import { exportToCSV, downloadCSV } from '@/lib/utils/export';

interface UserManagementClientProps {
    initialUsers: UserWithStats[];
}

export default function UserManagementClient({ initialUsers }: UserManagementClientProps) {
    const [users, setUsers] = useState<UserWithStats[]>(initialUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
    const [loading, setLoading] = useState(false);

    const supabase = createClient();

    // Filter users based on search and status
    const filteredUsers = users.filter(user => {
        const matchesSearch = !searchTerm ||
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleBlockUser = async (userId: string, reason?: string) => {
        setLoading(true);
        try {
            const { error } = await supabase.rpc('block_user', {
                target_user_id: userId,
                reason: reason || 'Blocked by admin'
            });

            if (error) throw error;

            // Update local state
            setUsers(prev => prev.map(u =>
                u.id === userId
                    ? { ...u, status: 'blocked' as const }
                    : u
            ));
        } catch (error: any) {
            console.error('Error blocking user:', error);
            alert('Failed to block user: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUnblockUser = async (userId: string) => {
        setLoading(true);
        try {
            const { error } = await supabase.rpc('unblock_user', {
                target_user_id: userId
            });

            if (error) throw error;

            // Update local state
            setUsers(prev => prev.map(u =>
                u.id === userId
                    ? { ...u, status: 'active' as const }
                    : u
            ));
        } catch (error: any) {
            console.error('Error unblocking user:', error);
            alert('Failed to unblock user: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const csv = exportToCSV(
            filteredUsers.map(u => ({
                id: u.id,
                name: u.full_name || 'N/A',
                status: u.status,
                locale: u.locale,
                receipts: u.receipts_count,
                created_at: u.created_at
            }))
        );

        // Download CSV
        const filename = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        downloadCSV(csv, filename);
    };

    return (
        <div className="space-y-4">
            {/* Filters and Actions */}
            <div className="bg-background-card rounded-lg border border-border p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted pointer-events-none" />
                        <Input
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-smooth ${statusFilter === 'all'
                                ? 'bg-primary-600 text-white'
                                : 'bg-background-elevated text-foreground-muted hover:text-foreground'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStatusFilter('active')}
                            className={`px-4 py-2 rounded-lg font-medium transition-smooth ${statusFilter === 'active'
                                ? 'bg-green-600 text-white'
                                : 'bg-background-elevated text-foreground-muted hover:text-foreground'
                                }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setStatusFilter('blocked')}
                            className={`px-4 py-2 rounded-lg font-medium transition-smooth ${statusFilter === 'blocked'
                                ? 'bg-red-600 text-white'
                                : 'bg-background-elevated text-foreground-muted hover:text-foreground'
                                }`}
                        >
                            Blocked
                        </button>
                    </div>

                    {/* Export */}
                    <Button
                        variant="secondary"
                        onClick={handleExport}
                        icon={Download}
                    >
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-foreground-muted">
                Showing {filteredUsers.length} of {users.length} users
            </div>

            {/* User Table */}
            <UserTable
                users={filteredUsers}
                onBlockUser={handleBlockUser}
                onUnblockUser={handleUnblockUser}
                loading={loading}
            />
        </div>
    );
}
