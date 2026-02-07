"use client";

import { useState } from 'react';
import { UserWithStats } from '@/types/database';
import { format } from 'date-fns';
import { ShieldOff, ShieldCheck, Eye, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface UserTableProps {
    users: UserWithStats[];
    onBlockUser: (userId: string, reason?: string) => void;
    onUnblockUser: (userId: string) => void;
    loading: boolean;
}

export default function UserTable({ users, onBlockUser, onUnblockUser, loading }: UserTableProps) {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    if (users.length === 0) {
        return (
            <div className="bg-background-card rounded-lg border border-border p-12 text-center">
                <p className="text-foreground-muted">No users found</p>
            </div>
        );
    }

    return (
        <div className="bg-background-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-background-elevated border-b border-border">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                                Locale
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                                Receipts
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                                Joined
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="hover:bg-background-elevated transition-smooth"
                            >
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="font-medium text-foreground">
                                            {user.full_name || 'No name'}
                                        </div>
                                        <div className="text-sm text-foreground-muted truncate max-w-xs">
                                            {user.id}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={cn(
                                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                        user.status === 'active' && 'bg-green-100 text-green-800',
                                        user.status === 'blocked' && 'bg-red-100 text-red-800',
                                        user.status === 'suspended' && 'bg-yellow-100 text-yellow-800'
                                    )}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                                    {user.locale.toUpperCase()}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                                    {user.receipts_count}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground-muted">
                                    {format(new Date(user.created_at), 'MMM dd, yyyy')}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex items-center justify-end gap-2">
                                        {user.status === 'active' ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const reason = prompt('Enter reason for blocking (optional):');
                                                    onBlockUser(user.id, reason || undefined);
                                                }}
                                                disabled={loading}
                                                icon={ShieldOff}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                Block
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onUnblockUser(user.id)}
                                                disabled={loading}
                                                icon={ShieldCheck}
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                            >
                                                Unblock
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
