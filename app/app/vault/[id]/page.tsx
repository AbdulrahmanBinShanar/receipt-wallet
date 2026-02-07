import { createClient } from '@/lib/supabase/server';
import { getReceiptById } from '@/lib/services/receiptService';
import { notFound, redirect } from 'next/navigation';
import ReceiptDetailClient from './ReceiptDetailClient';

export default async function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const receipt = await getReceiptById(id, user.id);

    if (!receipt) {
        notFound();
    }

    return <ReceiptDetailClient receipt={receipt} />;
}
