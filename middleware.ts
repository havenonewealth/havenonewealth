import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()

    // Create a Supabase client bound to the middleware request
    const supabase = createMiddlewareClient({ req, res })

    // Get the user session
    const {
        data: { session }
    } = await supabase.auth.getSession()

    const pathname = req.nextUrl.pathname

    // --------------------------------------------------------------------
    // 1. ROUTE: /dashboard/* — requires login
    // --------------------------------------------------------------------
    if (pathname.startsWith('/dashboard')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url))
        }
        return res
    }

    // --------------------------------------------------------------------
    // 2. ROUTE: /admin-dashboard/* — requires admin role
    // --------------------------------------------------------------------
    if (pathname.startsWith('/admin-dashboard')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url))
        }

        // Look up user role
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

        if (!profile || profile.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }

        return res
    }

    // --------------------------------------------------------------------
    // 3. Let everything else proceed normally
    // --------------------------------------------------------------------
    return res
}

// ----------------------------------------------------------------------
// Limit middleware to only the required routes (performance optimization)
// ----------------------------------------------------------------------
export const config = {
    matcher: ['/dashboard/:path*', '/admin-dashboard/:path*']
}
