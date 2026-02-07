import { createClient } from '@/lib/supabase/server';
import { ExtractedReceiptData } from '@/lib/ai/gemini';

export interface Receipt {
    id: string;
    user_id: string;
    file_path: string;
    file_url: string;
    merchant?: string;
    date?: string;
    total?: number;
    currency?: string;
    category?: string;
    warranty_months?: number;
    extracted_json?: any;
    status: 'active' | 'archived';
    created_at: string;
    updated_at: string;
}

export interface CreateReceiptData {
    userId: string;
    filePath: string;
    fileUrl: string;
    extractedData?: ExtractedReceiptData;
}

/**
 * Create a new receipt record
 */
export async function createReceipt(data: CreateReceiptData): Promise<Receipt> {
    const supabase = await createClient();

    const receiptData = {
        user_id: data.userId,
        file_path: data.filePath,
        file_url: data.fileUrl,
        merchant: data.extractedData?.merchant,
        date: data.extractedData?.date,
        total: data.extractedData?.total,
        currency: data.extractedData?.currency || 'SAR',
        category: data.extractedData?.category,
        warranty_months: data.extractedData?.warrantyMonths,
        extracted_json: data.extractedData,
        status: 'active' as const
    };

    const { data: receipt, error } = await supabase
        .from('receipts')
        .insert(receiptData)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create receipt: ${error.message}`);
    }

    return receipt;
}

/**
 * Get receipts for a user with optional filters
 */
export async function getReceipts(
    userId: string,
    filters?: {
        search?: string;
        category?: string;
        status?: 'active' | 'archived';
        dateFrom?: string;
        dateTo?: string;
    }
): Promise<Receipt[]> {
    const supabase = await createClient();

    let query = supabase
        .from('receipts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.status) {
        query = query.eq('status', filters.status);
    }

    if (filters?.category) {
        query = query.eq('category', filters.category);
    }

    if (filters?.search) {
        query = query.or(`merchant.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
    }

    if (filters?.dateFrom) {
        query = query.gte('date', filters.dateFrom);
    }

    if (filters?.dateTo) {
        query = query.lte('date', filters.dateTo);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch receipts: ${error.message}`);
    }

    return data || [];
}

/**
 * Get single receipt by ID
 */
export async function getReceiptById(id: string, userId: string): Promise<Receipt | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(`Failed to fetch receipt: ${error.message}`);
    }

    return data;
}

/**
 * Update receipt data
 */
export async function updateReceipt(
    id: string,
    userId: string,
    updates: Partial<Receipt>
): Promise<Receipt> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('receipts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update receipt: ${error.message}`);
    }

    return data;
}

/**
 * Delete receipt
 */
export async function deleteReceipt(id: string, userId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

    if (error) {
        throw new Error(`Failed to delete receipt: ${error.message}`);
    }
}

/**
 * Get receipt statistics for user
 */
export async function getReceiptStats(userId: string) {
    const supabase = await createClient();

    const { count: total } = await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    const { count: active } = await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active');

    const { count: archived } = await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'archived');

    return {
        total: total || 0,
        active: active || 0,
        archived: archived || 0
    };
}
