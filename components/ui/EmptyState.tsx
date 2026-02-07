import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";

export interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
    };
    className?: string;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
            <div className="mb-4 p-4 rounded-full bg-background-elevated border border-neutral-700">
                <Icon className="h-12 w-12 text-foreground-muted" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
            {description && (
                <p className="text-foreground-muted max-w-sm mb-6">{description}</p>
            )}
            {action && (
                <Button
                    variant="primary"
                    size="md"
                    icon={action.icon}
                    onClick={action.onClick}
                >
                    {action.label}
                </Button>
            )}
        </div>
    );
}
