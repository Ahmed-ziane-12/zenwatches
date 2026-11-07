import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['ar', 'en', 'fr']
// Arabic is the storefront default. Other languages stay available at their prefixed URLs.
const defaultLocale = 'ar'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  request.nextUrl.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|images|logos|.*\\..*).*)',
  ],
}
