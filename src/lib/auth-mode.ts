/**
 * Auth Mode Configuration
 * 
 * Determines whether authentication is enforced based on deployment environment.
 * - Production (VERCEL_ENV === "production"): Auth is enforced
 * - Preview/Development: Auth is bypassed for easier testing
 */

export function isAuthEnforced(): boolean {
  return process.env.VERCEL_ENV === 'production';
}

/**
 * Check if current environment is production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
}
