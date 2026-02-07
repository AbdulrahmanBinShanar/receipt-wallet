"use client";

interface TopUsersTableProps {
    users: {
        userId: string;
        userName: string;
        receiptCount: number;
    }[];
}

export default function TopUsersTable({ users }: TopUsersTableProps) {
    if (users.length === 0) {
        return (
            <div className="text-center py-12 text-foreground-muted">
                No users found
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="border-b border-border">
                    <tr>
                        <th className="text-left py-3 px-4 text-sm font-medium text-foreground-muted">
                            Rank
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-foreground-muted">
                            User
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-foreground-muted">
                            Receipts
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {users.map((user, index) => (
                        <tr
                            key={user.userId}
                            className="hover:bg-background-elevated transition-smooth"
                        >
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                        ${index === 0 ? 'bg-yellow-500/20 text-yellow-600' : ''}
                                        ${index === 1 ? 'bg-gray-400/20 text-gray-600' : ''}
                                        ${index === 2 ? 'bg-orange-500/20 text-orange-600' : ''}
                                        ${index > 2 ? 'bg-background-elevated text-foreground-muted' : ''}
                                    `}>
                                        {index + 1}
                                    </div>
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <div className="font-medium text-foreground">
                                    {user.userName}
                                </div>
                                <div className="text-xs text-foreground-muted truncate max-w-xs">
                                    {user.userId}
                                </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <span className="text-lg font-bold text-foreground">
                                    {user.receiptCount}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
