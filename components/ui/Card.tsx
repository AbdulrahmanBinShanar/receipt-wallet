import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "elevated" | "glass";
    hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "default", hoverable, children, ...props }, ref) => {
        const baseStyles = "rounded-lg shadow-card transition-smooth";

        const variantStyles = {
            default: "bg-background-card border border-border",
            elevated: "bg-background-elevated border border-border shadow-md",
            glass: "glass",
        };

        const hoverStyles = hoverable
            ? "hover:shadow-card-hover hover:scale-[1.02] cursor-pointer"
            : "";

        return (
            <div
                ref={ref}
                className={cn(baseStyles, variantStyles[variant], hoverStyles, className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

export default Card;
