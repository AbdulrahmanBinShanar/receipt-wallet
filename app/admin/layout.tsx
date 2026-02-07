import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin/permissions';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    // Check if user is authenticated and is admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const userIsAdmin = await isAdmin(user.id);
    if (!userIsAdmin) {
        redirect('/app');
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <AdminSidebar />
            </div>

            {/* Main Content */}
            <div className="lg:pl-64 flex flex-col flex-1">
                <AdminHeader />

                <main className="flex-1 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
