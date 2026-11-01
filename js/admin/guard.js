// Muhun Leather — Admin Route Guard
// Prevents consumers and unauthenticated visitors from accessing admin views.
import { getSession, getProfile } from '../api/auth.js';

/**
 * Checks if the current user has a valid active session.
 * If not authenticated, immediately redirects to /admin/login.html.
 * @returns {Promise<Object|null>} Profile data or redirects
 */
export async function guardAdmin() {
  const session = await getSession();

  if (!session) {
    window.location.replace('login.html');
    return null;
  }

  const profile = await getProfile();

  if (!profile || !profile.is_active) {
    window.location.replace('login.html');
    return null;
  }

  return profile;
}

/**
 * Checks if the current user has the 'owner' role.
 * If only 'admin', redirects to /admin/index.html.
 * @returns {Promise<Object|null>}
 */
export async function guardOwner() {
  const profile = await guardAdmin();
  if (!profile) return null;

  if (profile.role !== 'owner') {
    window.location.replace('index.html');
    return null;
  }

  return profile;
}
