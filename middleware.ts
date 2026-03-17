/**
 * Next.js Edge Middleware — Auth-aware routing & Gatekeeper (PRD §8.1–8.3)
 *
 * Rules:
 *  - `/`              → logged-out → /signup; logged-in → /command-center
 *  - PROTECTED_ROUTES → must have uid cookie or → redirect /login?next=<path>
 *  - AUTH_ONLY_PAGES  → already logged-in → redirect /command-center
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const UID_COOKIE = 'uid'

const PROTECTED_ROUTES = [
  '/command-center',
  '/selection-hub',
  '/surgical-drill',
  '/nta-test',
  '/diagnosis',
  '/store',
  '/admin',
  '/onboarding',
  '/guardian',
  '/analytics',
  '/settings',
  '/pre-test',
]

const AUTH_ONLY_PAGES = ['/login', '/signup', '/forgot-password']

function isProtected(pathname: string): boolean {
  return PROTECTED_ROUTES.some(p => pathname === p || pathname.startsWith(p + '/'))
}

function isAuthOnly(pathname: string): boolean {
  return AUTH_ONLY_PAGES.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const uid = request.cookies.get(UID_COOKIE)?.value

  // Root: redirect based on auth state
  if (pathname === '/') {
    return uid
      ? NextResponse.redirect(new URL('/command-center', request.url))
      : NextResponse.redirect(new URL('/signup', request.url))
  }

  // Auth pages: already logged-in → dashboard
  if (isAuthOnly(pathname) && uid) {
    return NextResponse.redirect(new URL('/command-center', request.url))
  }

  // Protected routes: require auth
  if (isProtected(pathname) && !uid) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
