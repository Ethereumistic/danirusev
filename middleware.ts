import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will also refresh the session if it's expired
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 1. Redirect authenticated users away from auth pages
  if (user && (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up') || pathname.startsWith('/forgot-password'))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. Protect the /account page
  if (!user && pathname.startsWith('/account')) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // 3. Protect the /dash route (Admin only)
  if (pathname.startsWith('/dash')) {
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // Check if the user is the Payload admin
    const { data: adminUser, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single()

    if (error || !adminUser) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Only allow test routes in development
  if (pathname.startsWith('/api/test-') && process.env.NODE_ENV === 'production') {
    return new NextResponse('Not Found', { status: 404 });
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};