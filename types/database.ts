export interface Profile {
    id: string;
    full_name: string | null;
    locale: "ar" | "en";
    status: "active" | "blocked" | "suspended";
    blocked_at: string | null;
    blocked_by: string | null;
    block_reason: string | null;
    created_at: string;
}

export interface Receipt {
    id: string;
    user_id: string;
    merchant_name: string | null;
    receipt_date: string | null;
    total_amount: number | null;
    currency: string;
    status: "active" | "archived";
    extracted_json: Record<string, any>;
    created_at: string;
}

export interface ReceiptPage {
    id: string;
    receipt_id: string;
    user_id: string;
    storage_path: string;
    page_no: number;
    created_at: string;
}

export interface ReceiptItem {
    id: string;
    receipt_id: string;
    user_id: string;
    item_name: string;
    qty: number;
    price: number | null;
    serial_no: string | null;
    created_at: string;
}

export interface Reminder {
    id: string;
    user_id: string;
    receipt_id: string | null;
    title: string;
    remind_at: string;
    channel: "push" | "email" | "whatsapp";
    done: boolean;
    created_at: string;
}

export interface Pack {
    id: string;
    user_id: string;
    title: string | null;
    share_token: string | null;
    share_expires_at: string | null;
    created_at: string;
}

export interface PackReceipt {
    pack_id: string;
    receipt_id: string;
}

// UI-specific types
export type WarrantyStatus = "active" | "expiring" | "expired" | "unknown";

export interface ExtractionField {
    value: string | number | null;
    confidence: number; // 0-1
    editable: boolean;
}

export interface WarrantyInfo {
    start_date: string | null;
    duration_months: number | null;
    end_date: string | null;
    retailer_preset: string | null;
    category: string | null;
}

// ====================================
// Admin & Analytics Types
// ====================================

export type AdminRoleLevel = "super_admin" | "admin" | "moderator";
export type UserStatus = "active" | "blocked" | "suspended";
export type ActivityType =
    | "login"
    | "logout"
    | "receipt_upload"
    | "receipt_delete"
    | "reminder_create"
    | "pack_create"
    | "profile_update"
    | "blocked"
    | "unblocked";

export interface AdminRole {
    id: string;
    user_id: string;
    role_level: AdminRoleLevel;
    permissions: string[];
    created_at: string;
    created_by: string | null;
}

export interface UserSession {
    id: string;
    user_id: string;
    login_at: string;
    logout_at: string | null;
    ip_address: string | null;
    user_agent: string | null;
    session_duration_minutes: number | null;
    created_at: string;
}

export interface UserActivityLog {
    id: string;
    user_id: string;
    activity_type: ActivityType;
    activity_details: Record<string, any>;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

export interface UserAnalytics {
    id: string;
    user_id: string;
    date: string;
    receipts_uploaded: number;
    receipts_deleted: number;
    reminders_created: number;
    packs_created: number;
    sessions_count: number;
    total_session_minutes: number;
    engagement_score: number;
    created_at: string;
    updated_at: string;
}

export interface SystemAnalytics {
    id: string;
    date: string;
    total_users: number;
    new_users: number;
    active_users: number;
    blocked_users: number;
    total_receipts: number;
    new_receipts: number;
    total_sessions: number;
    avg_session_minutes: number;
    metrics: Record<string, any>;
    created_at: string;
    updated_at: string;
}

// Admin Dashboard Types
export interface UserWithStats extends Profile {
    receipts_count: number;
    last_login: string | null;
    engagement_score: number;
}

export interface DashboardMetrics {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    totalReceipts: number;
    newUsersToday: number;
    activeUsersNow: number;
}

export interface AnalyticsChartData {
    date: string;
    value: number;
    label?: string;
}

export interface RetentionCohort {
    cohort: string;
    users: number;
    retention: Record<string, number>; // week0, week1, week2, etc.
}
