import { type NextRequest, NextResponse } from 'next/server';

const YEAR = 60 * 60 * 24 * 365;

// `/` is English and `/es` Spanish. A visitor whose browser asks for Spanish lands on /es, unless
// they chose English (?hl=en sets the cookie). Crawlers send no Spanish preference, so they index both.
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const hl = searchParams.get('hl');
  if (hl === 'en' || hl === 'es') {
    const url = req.nextUrl.clone();
    url.search = '';
    url.pathname = hl === 'es' ? '/es' : '/';
    const res = NextResponse.redirect(url);
    res.cookies.set('lang', hl, { path: '/', maxAge: YEAR, sameSite: 'lax' });
    return res;
  }
  const chosen = req.cookies.get('lang')?.value;
  if (pathname === '/') {
    const asks = /^es\b/i.test(req.headers.get('accept-language') ?? '');
    if (chosen === 'es' || (!chosen && asks)) return NextResponse.redirect(new URL('/es', req.url));
  }
  if (pathname === '/es' && chosen !== 'es') {
    const res = NextResponse.next();
    res.cookies.set('lang', 'es', { path: '/', maxAge: YEAR, sameSite: 'lax' });
    return res;
  }
  return NextResponse.next();
}

export const config = { matcher: ['/', '/es'] };
