import { createClient } from '@/lib/supabase/server';

/**
 * Get receipt processing statistics
 */
export async function getReceiptStats() {
    const supabase = await createClient();

    // Total receipts
    const { count: totalReceipts } = await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true });

    // Receipts by status
    const { count: activeReceipts } = await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    const { count: archivedReceipts } = await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'archived');

    // Receipts uploaded today
    const today = new Date().toISOString().split('T')[0];
    const { count: todayReceipts } = await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

    // Total receipt pages
    const { count: totalPages } = await supabase
        .from('receipt_pages')
        .select('*', { count: 'exact', head: true });

    // Total receipt items
    const { count: totalItems } = await supabase
        .from('receipt_items')
        .select('*', { count: 'exact', head: true });

    // Get receipts with extracted data count
    const { data: receiptsWithData } = await supabase
        .from('receipts')
        .select('extracted_json')
        .not('extracted_json', 'is', null);

    const extractedCount = receiptsWithData?.filter(
        r => Object.keys(r.extracted_json || {}).length > 0
    ).length || 0;

    // Average items per receipt
    const avgItemsPerReceipt = totalReceipts && totalReceipts > 0
        ? Math.round((totalItems || 0) / totalReceipts)
        : 0;

    return {
        totalReceipts: totalReceipts || 0,
        activeReceipts: activeReceipts || 0,
        archivedReceipts: archivedReceipts || 0,
        todayReceipts: todayReceipts || 0,
        totalPages: totalPages || 0,
        totalItems: totalItems || 0,
        extractedCount,
        avgItemsPerReceipt,
        extractionRate: totalReceipts && totalReceipts > 0
            ? Math.round((extractedCount / totalReceipts) * 100)
            : 0
    };
}

/**
 * Get receipt upload trends (last 30 days)
 */
export async function getReceiptUploadTrends(days: number = 30) {
    const supabase = await createClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: receipts } = await supabase
        .from('receipts')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

    if (!receipts) return [];

    // Group by date
    const grouped = receipts.reduce((acc, receipt) => {
        const date = new Date(receipt.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Fill in missing dates
    const result = [];
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        const dateStr = date.toISOString().split('T')[0];

        result.push({
            date: dateStr,
            value: grouped[dateStr] || 0,
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
    }

    return result;
}

/**
 * Get top users by receipt count
 */
export async function getTopUsersByReceipts(limit: number = 10) {
    const supabase = await createClient();

    const { data } = await supabase
        .from('profiles')
        .select(`
            id,
            full_name,
            receipts:receipts(count)
        `)
        .order('receipts(count)', { ascending: false })
        .limit(limit);

    if (!data) return [];

    return data.map(user => ({
        userId: user.id,
        userName: user.full_name || 'Unknown',
        receiptCount: user.receipts?.[0]?.count || 0
    }));
}

/**
 * Get receipt processing errors
 */
export async function getReceiptProcessingErrors() {
    const supabase = await createClient();

    // Receipts with no extracted data (potential processing failures)
    const { count: failedExtractions } = await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true })
        .or('extracted_json.is.null,extracted_json.eq.{}');

    // Receipts with no pages
    const { data: receiptsWithoutPages } = await supabase
        .from('receipts')
        .select(`
            id,
            receipt_pages:receipt_pages(count)
        `);

    const noPages = receiptsWithoutPages?.filter(
        r => !r.receipt_pages || r.receipt_pages.length === 0 || r.receipt_pages[0]?.count === 0
    ).length || 0;

    return {
        failedExtractions: failedExtractions || 0,
        receiptsWithoutPages: noPages,
        totalErrors: (failedExtractions || 0) + noPages
    };
}
