/**
 * Wanderer South India - Role Helpers
 * Single source of truth for which role slugs count as "admin" on the frontend.
 * Must match the roles actually seeded in database/seeds.sql.
 */

export const ADMIN_ROLES = ['super_admin', 'admin', 'editor', 'moderator'];

export function isAdminRole(role) {
  return Boolean(role && ADMIN_ROLES.includes(role));
}
