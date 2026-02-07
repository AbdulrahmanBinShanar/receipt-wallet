import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg" | "xl";
    icon?: LucideIcon;
    iconPosition?: "left" | "right";
    loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "primary",
            size = "md",
            icon: Icon,
            iconPosition = "left",
            loading,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-smooth focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";

        const variantStyles = {
            primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg glow",
            secondary: "bg-background-elevated hover:bg-neutral-700 text-foreground border border-neutral-600 hover:border-neutral-500",
            ghost: "hover:bg-background-elevated text-foreground-muted hover:text-foreground",
            danger: "bg-error hover:bg-red-600 text-white shadow-md",
        };

        const sizeStyles = {
            sm: "h-8 px-3 text-sm",
            md: "h-10 px-4 text-base",
            lg: "h-12 px-6 text-lg",
            xl: "h-14 px-8 text-xl font-bold",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variantStyles[variant],
                    sizeStyles[size],
                    className
                )}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {!loading && Icon && iconPosition === "left" && <Icon className="h-5 w-5" />}
                {children}
                {!loading && Icon && iconPosition === "right" && <Icon className="h-5 w-5" />}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
