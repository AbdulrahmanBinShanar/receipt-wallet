"use client";

import { RetentionCohort } from '@/types/database';

interface RetentionChartProps {
    data: RetentionCohort[];
}

export default function RetentionChart({ data }: RetentionChartProps) {
    const weeks = Array.from({ length: 13 }, (_, i) => i);

    // Color scale for heatmap (percentage-based)
    const getColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-600';
        if (percentage >= 60) return 'bg-green-500';
        if (percentage >= 40) return 'bg-yellow-500';
        if (percentage >= 20) return 'bg-orange-500';
        if (percentage > 0) return 'bg-red-500';
        return 'bg-gray-700';
    };

    if (data.length === 0) {
        return (
            <div className="text-center py-12 text-foreground-muted">
                No retention data available yet
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr>
                        <th className="text-left py-2 px-3 text-foreground-muted font-medium sticky left-0 bg-background-card z-10">
                            Cohort
                        </th>
                        <th className="text-center py-2 px-3 text-foreground-muted font-medium">
                            Users
                        </th>
                        {weeks.map(week => (
                            <th key={week} className="text-center py-2 px-3 text-foreground-muted font-medium">
                                W{week}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((cohort) => (
                        <tr key={cohort.cohort} className="border-t border-border">
                            <td className="py-2 px-3 font-medium text-foreground sticky left-0 bg-background-card z-10">
                                {cohort.cohort}
                            </td>
                            <td className="text-center py-2 px-3 text-foreground-muted">
                                {cohort.users}
                            </td>
                            {weeks.map(week => {
                                const percentage = cohort.retention[`week${week}`] || 0;
                                return (
                                    <td key={week} className="p-1">
                                        <div
                                            className={`
                                                ${getColor(percentage)} 
                                                rounded px-2 py-1 text-white text-center font-medium
                                                transition-transform hover:scale-110
                                            `}
                                            title={`Week ${week}: ${percentage}%`}
                                        >
                                            {percentage}%
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-6 text-xs">
                <span className="text-foreground-muted">Retention Rate:</span>
                <div className="flex items-center gap-2">
                    <div className="bg-red-500 w-4 h-4 rounded"></div>
                    <span className="text-foreground-muted">0-20%</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-orange-500 w-4 h-4 rounded"></div>
                    <span className="text-foreground-muted">20-40%</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-yellow-500 w-4 h-4 rounded"></div>
                    <span className="text-foreground-muted">40-60%</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-green-500 w-4 h-4 rounded"></div>
                    <span className="text-foreground-muted">60-80%</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-green-600 w-4 h-4 rounded"></div>
                    <span className="text-foreground-muted">80-100%</span>
                </div>
            </div>
        </div>
    );
}
