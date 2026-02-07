import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes
    if (!user && request.nextUrl.pathname.startsWith('/app')) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        return NextResponse.redirect(url)
    }

    // Redirect authenticated users from auth pages to app
    if (user && (request.nextUrl.pathname.startsWith('/auth/login'))) {
        // Check if user is admin
        const { data: adminRole } = await supabase
            .from('admin_roles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        const url = request.nextUrl.clone()
        url.pathname = adminRole ? '/admin' : '/app'
        return NextResponse.redirect(url)
    }

    // Admin-only routes protection
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            // Not logged in, redirect to login
            const url = request.nextUrl.clone()
            url.pathname = '/auth/login'
            return NextResponse.redirect(url)
        }

        // Check if user is admin
        const { data: adminRole } = await supabase
            .from('admin_roles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!adminRole) {
            // Not an admin, redirect to regular app
            const url = request.nextUrl.clone()
            url.pathname = '/app'
            return NextResponse.redirect(url)
        }
    }

    // Check if user is blocked
    if (user && !request.nextUrl.pathname.startsWith('/auth')) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('status')
            .eq('id', user.id)
            .single();

        if (profile?.status === 'blocked' || profile?.status === 'suspended') {
            // User is blocked, sign them out and redirect
            await supabase.auth.signOut();
            const url = request.nextUrl.clone()
            url.pathname = '/auth/login'
            url.searchParams.set('error', 'account_blocked')
            return NextResponse.redirect(url)
        }
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse
}
