// Muhun Leather — Auth API Layer
// Handles sign-in, sign-out, session retrieval, and profile lookup.
import { supabase } from '../supabase-client.js';

/**
 * Sign in with email or username + password.
 * Username login requires an email lookup via the profiles table.
 * @param {string} emailOrUsername
 * @param {string} password
 * @returns {Promise<Object>} Supabase auth data
 */
export async function signIn(emailOrUsername, password) {
  let email = emailOrUsername.trim();

  // If the input doesn't look like an email, treat it as a username
  if (!email.includes('@')) {
    const { data: resolvedEmail, error: rpcError } = await supabase.rpc('get_email_by_username', {
      p_username: email.toLowerCase()
    });

    if (rpcError || !resolvedEmail) {
      throw new Error('Username atau password salah.');
    }
    email = resolvedEmail;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current session (or null if not authenticated).
 * @returns {Promise<Object|null>}
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Get the profile row for the currently authenticated user.
 * @returns {Promise<Object|null>}
 */
export async function getProfile() {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) return null;
  return data;
}

/**
 * Subscribe to auth state changes.
 * @param {Function} callback - Receives (event, session)
 * @returns {{ data: { subscription } }}
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
