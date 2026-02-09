/**
 * Super-admin allowlist based on Internet Identity principals.
 * These principals are always treated as admins regardless of backend approval status.
 * 
 * Note: Internet Identity does not provide verified email addresses to canisters.
 * This allowlist is based on the deterministic principal derived from the user's
 * Internet Identity anchor.
 * 
 * To find your principal:
 * 1. Log in with Internet Identity
 * 2. Check the browser console or your profile page for your principal ID
 * 3. Add it to the array below
 */

// Replace this with the actual principal(s) you want to grant super-admin access
// Example format: "xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxx"
const SUPER_ADMIN_PRINCIPALS: string[] = [
  // Add your principal here after logging in with Internet Identity
  // The email chresthaxakxham@gmail.com does not map to a principal - you must log in first
];

/**
 * Check if a given principal string is in the super-admin allowlist
 */
export function isSuperAdminPrincipal(principal: string | undefined): boolean {
  if (!principal) return false;
  return SUPER_ADMIN_PRINCIPALS.includes(principal);
}

/**
 * Get the list of super-admin principals (for debugging/display purposes)
 */
export function getSuperAdminPrincipals(): readonly string[] {
  return SUPER_ADMIN_PRINCIPALS;
}
