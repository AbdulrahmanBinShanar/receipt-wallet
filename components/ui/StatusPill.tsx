import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { WarrantyStatus } from "@/types/database";

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
    status: WarrantyStatus;
    label?: string;
}

export default function StatusPill({ status, label, className, ...props }: StatusPillProps) {
    const statusConfig = {
        active: {
            bg: "bg-success/10",
            text: "text-success",
            border: "border-success/30",
            defaultLabel: "نشط",
        },
        expiring: {
            bg: "bg-warning/10",
            text: "text-warning",
            border: "border-warning/30",
            defaultLabel: "ينتهي قريباً",
        },
        expired: {
            bg: "bg-error/10",
            text: "text-error",
            border: "border-error/30",
            defaultLabel: "منتهي",
        },
        unknown: {
            bg: "bg-neutral-800/50",
            text: "text-foreground-muted",
            border: "border-neutral-700",
            defaultLabel: "غير محدد",
        },
    };

    const config = statusConfig[status];

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                config.bg,
                config.text,
                config.border,
                className
            )}
            {...props}
        >
            {label || config.defaultLabel}
        </span>
    );
}
