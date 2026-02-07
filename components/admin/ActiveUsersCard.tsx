"use client";

import { useEffect, useState } from 'react';
import { subscribeToActiveUsers } from '@/lib/analytics/realtime';
import { Activity } from 'lucide-react';

interface ActiveUsersCardProps {
    initialCount: number;
}

export default function ActiveUsersCard({ initialCount }: ActiveUsersCardProps) {
    const [count, setCount] = useState(initialCount);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToActiveUsers((newCount) => {
            setCount(newCount);
            setIsLive(true);
            setTimeout(() => setIsLive(false), 2000);
        });

        return unsubscribe;
    }, []);

    return (
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-5 w-5" />
                        <span className="text-sm font-medium">Active Users (Live)</span>
                        {isLive && (
                            <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                        )}
                    </div>
                    <p className="text-4xl font-bold">{count}</p>
                    <p className="text-sm opacity-80 mt-1">Users active in last 30 minutes</p>
                </div>

                <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Activity className="h-8 w-8" />
                </div>
            </div>
        </div>
    );
}
