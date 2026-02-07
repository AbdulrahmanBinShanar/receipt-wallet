import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get password from request body for verification
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json(
                { error: "Password confirmation is required to delete account" },
                { status: 400 }
            );
        }

        // CRITICAL SECURITY: Verify password before allowing account deletion
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: password,
        });

        if (signInError || !signInData.user) {
            return NextResponse.json(
                { error: "Password is incorrect" },
                { status: 401 }
            );
        }

        // Delete all user data from related tables
        // Order matters due to foreign key constraints

        // 1. Delete receipts (will cascade to receipt_items if you have that table)
        const { error: receiptsError } = await supabase
            .from("receipts")
            .delete()
            .eq("user_id", user.id);

        if (receiptsError) {
            console.error("Error deleting receipts:", receiptsError);
            return NextResponse.json(
                { error: "Failed to delete receipts" },
                { status: 500 }
            );
        }

        // 2. Delete reminders
        const { error: remindersError } = await supabase
            .from("reminders")
            .delete()
            .eq("user_id", user.id);

        if (remindersError) {
            console.error("Error deleting reminders:", remindersError);
        }

        // 3. Delete preferences
        const { error: preferencesError } = await supabase
            .from("preferences")
            .delete()
            .eq("user_id", user.id);

        if (preferencesError) {
            console.error("Error deleting preferences:", preferencesError);
        }

        // 4. Delete the user account from Supabase Auth
        const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
            user.id
        );

        if (deleteUserError) {
            console.error("Error deleting user account:", deleteUserError);
            return NextResponse.json(
                { error: "Failed to delete user account. Please contact support." },
                { status: 500 }
            );
        }

        // Sign out the user
        await supabase.auth.signOut();

        return NextResponse.json(
            { message: "Account deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Unexpected error during account deletion:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
