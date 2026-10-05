import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { hasPermission } from "../../../Utilities/permissions";
import { FaLock } from "react-icons/fa";

/**
 * PermissionRoute
 *
 * Wraps an admin dashboard page and ensures the currently authenticated user
 * holds at least one of the required permissions before rendering the child.
 *
 * If the user is not authenticated → redirect to /login.
 * If the user is authenticated but lacks permission → show Access Denied page.
 *
 * Props:
 *   permission   {string}   Single permission string.
 *   permissions  {string[]} Array — user must hold ANY ONE of these (OR logic).
 *
 * Usage (single):
 *   <PermissionRoute permission="matrimonial:review">
 *     <MatrimonialAdmin />
 *   </PermissionRoute>
 *
 * Usage (multiple/OR):
 *   <PermissionRoute permissions={["job:moderate", "scholarship:read"]}>
 *     <OpportunityAdmin />
 *   </PermissionRoute>
 *
 * Passing permission="*" means SUPER_ADMIN (or legacy Admin) only.
 */
const PermissionRoute = ({ children, permission, permissions }) => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const location = useLocation();

  // Not logged in → go to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRoles = user?.roles || [];
  const accountType = user?.accountType || "";

  // Build the list of permissions to check
  const permsToCheck = permissions || (permission ? [permission] : []);

  // If no permission required, just render
  if (permsToCheck.length === 0) {
    return children;
  }

  // User must hold ANY ONE of the listed permissions (OR logic)
  const allowed = permsToCheck.some((perm) =>
    hasPermission(userRoles, accountType, perm)
  );

  if (!allowed) {
    return <AccessDenied />;
  }

  return children;
};

// ── Clean Access Denied UI ─────────────────────────────────────────────────

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-400/10 border border-red-400/20 flex items-center justify-center">
        <FaLock className="text-red-400" size={24} />
      </div>
      <div className="max-w-sm">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Access Restricted</h2>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          You don't have permission to access this administrative section.
          Please contact a Super Admin if you believe this is an error.
        </p>
      </div>
      <a
        href="/dashboard/my-profile"
        className="btn-secondary !py-2.5 !px-6 !text-sm"
      >
        Go to Dashboard
      </a>
    </div>
  );
}

export default PermissionRoute;
