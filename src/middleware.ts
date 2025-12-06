import { NextRequest, NextResponse } from 'next/server';

const REALM = 'Secure Area';
const BASIC_USER = process.env.BASIC_AUTH_USER;
const BASIC_PASS = process.env.BASIC_AUTH_PASS;

const BYPASS_PATH_PREFIXES = [
  '/_next/static',
  '/_next/image',
];

const BYPASS_PATHS = new Set([
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]);

const unauthorizedResponse = () =>
  new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}"`,
      'Content-Type': 'text/plain',
    },
  });

const misconfiguredResponse = () =>
  new NextResponse('Basic authentication is not configured.', {
    status: 500,
    headers: {
      'Content-Type': 'text/plain',
    },
  });

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log('[mw]', pathname);

  // Skip static and framework assets
  if (
    BYPASS_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    BYPASS_PATHS.has(pathname)
  ) {
    return NextResponse.next();
  }

  // Fail closed if credentials are missing
  if (!BASIC_USER || !BASIC_PASS) {
    return misconfiguredResponse();
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return unauthorizedResponse();
  }

  const base64 = authHeader.split(' ')[1] ?? '';
  let decoded = '';
  try {
    if (typeof atob === 'function') {
      decoded = atob(base64);
    } else {
      decoded = Buffer.from(base64, 'base64').toString('binary');
    }
  } catch {
    return unauthorizedResponse();
  }

  const [user, pass] = decoded.split(':');
  if (user === BASIC_USER && pass === BASIC_PASS) {
    return NextResponse.next();
  }

  return unauthorizedResponse();
}

export const config = {
  // Run on all paths; static assets are bypassed in code above.
  matcher: ['/:path*'],
};

