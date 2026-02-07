"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    showCloseButton?: boolean;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    showCloseButton = true,
}: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeStyles = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
    };

    return createPortal(
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose();
            }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className={cn(
                    "relative w-full bg-background-card border border-neutral-700 rounded-xl shadow-card-hover animate-slide-in",
                    sizeStyles[size]
                )}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                        {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg hover:bg-background-elevated transition-smooth"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5 text-foreground-muted" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-6">{children}</div>
            </div>
        </div>,
        document.body
    );
}
