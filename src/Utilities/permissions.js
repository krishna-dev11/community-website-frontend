/**
 * Frontend Permission Utility
 *
 * Mirrors the backend constants/permissions.js logic so that
 * the sidebar, route guards, and UI components can all use the
 * same deterministic permission check without trusting any
 * mutable frontend state as the authority.
 *
 * NOTE: The backend is ALWAYS the final authority. This utility
 * is used only to drive UI rendering (hide/show items). API
 * requests will still be rejected by the server if the user
 * doesn't hold the required permission.
 */

// ─── Role → Permission Map ─────────────────────────────────────────────────
// Must stay in sync with backend: constants/permissions.js
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ["*"],

  COMMUNITY_ADMIN: [
    "issue:*",
    "dharamshala:*",
    "poll:*",
    "community:*",
    "achievement:*",
    "shradhanjali:*",
    "member:verify",
    "report:*",
  ],

  TREASURER: ["donation:*", "contribution:*", "report:financial"],

  MATRIMONIAL_ADMIN: [
    "matrimonial:*",
    // Admin-specific sub-permissions (review, moderate) are covered by matrimonial:*
  ],

  SCHOLARSHIP_ADMIN: ["scholarship:*"],

  JOB_ADMIN: ["job:*"],

  DHARAMSHALA_ADMIN: ["dharamshala:*"],

  DHARAMSHALA_STAFF: ["dharamshala:staff"],

  CONTENT_ADMIN: [
    "notice:*",
    "publication:*",
    "gallery:*",
    "video:*",
    "management:*",
    "cms:*",
  ],

  MODERATOR: [
    "community:moderate",
    "issue:read",
    "issue:moderate",
    "shradhanjali:review",
    "achievement:review",
    "member:verify",
    "suggestion:*",
  ],

  MEMBER: [
    "profile:self",
    "directory:read",
    "family:create",
    "family:join",
    "job:create",
    "job:apply",
    "scholarship:apply",
    "matrimonial:create",
    "matrimonial:read",
    "matrimonial:interest",
    "matrimonial:contact",
    "matrimonial:report",
    "matrimonial:block",
    "issue:create",
    "issue:read",
    "issue:respond",
    "dharamshala:book",
    "community:create",
    "community:read",
    "community:comment",
    "community:report",
    "poll:read",
    "poll:vote",
    "achievement:create",
    "shradhanjali:create",
    "suggestion:create",
    "suggestion:read",
    "suggestion:respond",
  ],

  // Legacy compatibility
  Admin: ["*"],
};

// ─── Core permission check ─────────────────────────────────────────────────

/**
 * Checks whether a user (identified by their roles + accountType)
 * holds a given permission.
 *
 * @param {string[]} roles        Array of role strings from Redux/token
 * @param {string}   accountType  accountType string (e.g. "Member", "Admin")
 * @param {string}   permission   Permission to check (e.g. "matrimonial:review")
 * @returns {boolean}
 */
export function hasPermission(roles = [], accountType = "", permission) {
  const raw = Array.isArray(roles) ? [...roles] : (roles ? [roles] : []);

  const normalizedRoles = raw
    .filter(Boolean)
    .map((r) => String(r).toUpperCase().trim());

  const specificAdminRoles = [
    "SUPER_ADMIN",
    "COMMUNITY_ADMIN",
    "DHARAMSHALA_STAFF",
    "MODERATOR",
    "TREASURER",
    "MATRIMONIAL_ADMIN",
    "SCHOLARSHIP_ADMIN",
    "JOB_ADMIN",
    "DHARAMSHALA_ADMIN",
    "CONTENT_ADMIN",
  ];

  const hasAnySpecificAdminRole = normalizedRoles.some((r) =>
    specificAdminRoles.includes(r) || r === "ADMIN"
  );

  // If a legacy account has accountType "Admin" but NO specific admin roles assigned in roles array,
  // treat them as legacy SUPER_ADMIN.
  // BUT if they have specific roles (like MATRIMONIAL_ADMIN, TREASURER, etc.), DO NOT elevate to SUPER_ADMIN!
  if ((accountType === "Admin" || accountType === "ADMIN") && !hasAnySpecificAdminRole) {
    normalizedRoles.push("SUPER_ADMIN");
  }

  // Ensure MEMBER baseline is always present for logged-in users
  if (!normalizedRoles.includes("MEMBER")) {
    normalizedRoles.push("MEMBER");
  }

  const userPermissions = normalizedRoles.flatMap((role) => {
    if (role === "ADMIN") return ROLE_PERMISSIONS["SUPER_ADMIN"] || [];
    return ROLE_PERMISSIONS[role] || [];
  });

  const [resource] = permission.split(":");

  return (
    userPermissions.includes("*") ||
    userPermissions.includes(permission) ||
    userPermissions.includes(`${resource}:*`)
  );
}

/**
 * Returns true if the user has ANY admin role (not just MEMBER).
 */
export function isAnyAdmin(roles = [], accountType = "") {
  const norm = (Array.isArray(roles) ? roles : (roles ? [roles] : []))
    .filter(Boolean)
    .map((r) => String(r).toUpperCase().trim());
  const adminRoles = [
    "SUPER_ADMIN",
    "ADMIN",
    "COMMUNITY_ADMIN",
    "DHARAMSHALA_STAFF",
    "MODERATOR",
    "TREASURER",
    "MATRIMONIAL_ADMIN",
    "SCHOLARSHIP_ADMIN",
    "JOB_ADMIN",
    "DHARAMSHALA_ADMIN",
    "CONTENT_ADMIN",
  ];
  return norm.some((r) => adminRoles.includes(r)) || accountType === "Admin" || accountType === "ADMIN";
}

/**
 * Returns true if the user is a SUPER_ADMIN or legacy "Admin" accountType without specific sub-roles.
 */
export function isSuperAdmin(roles = [], accountType = "") {
  const norm = (Array.isArray(roles) ? roles : (roles ? [roles] : []))
    .filter(Boolean)
    .map((r) => String(r).toUpperCase().trim());
  if (norm.includes("SUPER_ADMIN") || norm.includes("ADMIN")) return true;

  const specificAdminRoles = [
    "COMMUNITY_ADMIN",
    "DHARAMSHALA_STAFF",
    "MODERATOR",
    "TREASURER",
    "MATRIMONIAL_ADMIN",
    "SCHOLARSHIP_ADMIN",
    "JOB_ADMIN",
    "DHARAMSHALA_ADMIN",
    "CONTENT_ADMIN",
  ];
  const hasSpecific = norm.some((r) => specificAdminRoles.includes(r));
  return (accountType === "Admin" || accountType === "ADMIN") && !hasSpecific;
}

/**
 * Returns true for a user whose only elevated role is DHARAMSHALA_STAFF.
 * MEMBER is allowed because scoped admin accounts often retain the member baseline.
 */
export function isOnlyDharamshalaStaff(roles = []) {
  const norm = (Array.isArray(roles) ? roles : (roles ? [roles] : []))
    .filter(Boolean)
    .map((r) => String(r).toUpperCase().trim());

  if (!norm.includes("DHARAMSHALA_STAFF")) return false;

  const elevatedRoles = norm.filter((role) => !["MEMBER", "DHARAMSHALA_STAFF"].includes(role));
  return elevatedRoles.length === 0;
}
