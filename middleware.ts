import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for conditional auth enforcement
 * 
 * - If NOT in production: Allow all requests (bypass auth)
 * - If in production: Enforce existing auth behavior through getServerSession
 */

export function middleware(request: NextRequest) {
  // Check if auth should be enforced
  const isProduction = process.env.VERCEL_ENV === 'production';

  // Bypass auth completely in non-production environments
  if (!isProduction) {
    return NextResponse.next();
  }

  // In production, allow the request to proceed
  // Auth is enforced at the layout level (src/app/admin/layout.tsx)
  // and in individual API routes using getServerSession
  return NextResponse.next();
}

/**
 * Configure which routes this middleware applies to
 * 
 * We need to protect:
 * - /admin/* - Admin dashboard and pages
 * - /api/admin/* - Admin API routes
 */
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
