import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "text" | "card" | "circle" | "rect";
}

export default function Skeleton({ variant = "rect", className, ...props }: SkeletonProps) {
    const variantStyles = {
        text: "h-4 w-full rounded",
        card: "h-48 w-full rounded-lg",
        circle: "h-12 w-12 rounded-full",
        rect: "h-full w-full rounded-lg",
    };

    return (
        <div
            className={cn("skeleton bg-background-elevated", variantStyles[variant], className)}
            {...props}
        />
    );
}
