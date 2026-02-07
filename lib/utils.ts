import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "SAR"): string {
    return new Intl.NumberFormat("ar-SA", {
        style: "currency",
        currency,
    }).format(amount);
}

export function formatDate(date: Date | string, locale: string = "ar"): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(dateObj);
}
