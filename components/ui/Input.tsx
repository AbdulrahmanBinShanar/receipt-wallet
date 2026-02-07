import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, type = "text", ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-10 w-full rounded-lg border bg-background-elevated px-4 py-2 text-sm",
                        "text-foreground placeholder:text-foreground-subtle",
                        "transition-smooth",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        error
                            ? "border-error focus:ring-error"
                            : "border-neutral-700 hover:border-neutral-600",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-xs text-error">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-xs text-foreground-subtle">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
