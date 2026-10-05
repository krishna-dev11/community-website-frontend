/**
 * dashboard-links.jsx
 *
 * Each admin link carries a `permission` field.
 * The SideBar renders a link ONLY when the logged-in user holds that permission.
 * Member links (no `permission`) are always visible to any authenticated user.
 *
 * Permission strings must match backend constants/permissions.js exactly.
 */

// ─── Member / Account section ─────────────────────────────────────────────
export const memberLinks = [
  {
    name: "My Profile",
    nameHi: "मेरी प्रोफ़ाइल",
    path: "/dashboard/my-profile",
    icon: "FaUser",
  },
  {
    name: "My Dues",
    nameHi: "मासिक अंशदान (Dues)",
    path: "/dashboard/my-dues",
    icon: "FaFileInvoiceDollar",
  },
  {
    name: "My Job Posts",
    nameHi: "मेरे जॉब पोस्ट",
    path: "/dashboard/my-jobs",
    icon: "FaBriefcase",
  },
  {
    name: "Member Directory",
    nameHi: "सदस्य निर्देशिका",
    path: "/dashboard/directory",
    icon: "FaAddressBook",
  },
  {
    name: "Family Hub",
    nameHi: "पारिवारिक केंद्र",
    path: "/dashboard/family",
    icon: "FaUsers",
  },
  {
    name: "Community Hub",
    nameHi: "समुदाय केंद्र व मुद्दे",
    path: "/dashboard/community",
    icon: "FaComments",
  },
  {
    name: "My Suggestions",
    nameHi: "मेरे सुझाव",
    path: "/dashboard/suggestions",
    icon: "FaLightbulb",
  },
];

// ─── Admin links — each requires a specific permission ────────────────────
// permission: string — matched against hasPermission(userRoles, accountType, permission)
export const adminLinks = [
  // ── SUPER ADMIN / MODERATOR: member verification
  {
    name: "Registration Queue",
    nameHi: "पंजीकरण सत्यापन",
    path: "/dashboard/admin/registrations",
    icon: "FaUserCheck",
    permission: "member:verify",
    section: "ADMINISTRATION",
    sectionHi: "प्रशासन",
  },
  // ── SUPER ADMIN: family lifecycle
  {
    name: "Family Lifecycle Queue",
    nameHi: "परिवार जीवनचक्र अनुरोध",
    path: "/dashboard/admin/family-lifecycle",
    icon: "FaHeartbeat",
    permission: "*",          // SUPER_ADMIN only
    section: "ADMINISTRATION",
    sectionHi: "प्रशासन",
  },
  // ── MODERATOR / SUPER_ADMIN: community moderation
  {
    name: "Community Admin",
    nameHi: "समुदाय प्रबंधन",
    path: "/dashboard/admin/community",
    icon: "FaShieldAlt",
    permission: "community:moderate",
    section: "OPERATIONS",
    sectionHi: "संचालन",
  },
  // ── MATRIMONIAL_ADMIN / SUPER_ADMIN
  {
    name: "Dharamshala Staff Panel",
    nameHi: "Dharamshala Staff Panel",
    path: "/dashboard/admin/community?tab=staff",
    icon: "FaHotel",
    permission: "dharamshala:staff",
    section: "OPERATIONS",
    sectionHi: "Operations",
  },
  {
    name: "Matrimonial Admin",
    nameHi: "वैवाहिक प्रबंधन",
    path: "/dashboard/admin/matrimonial",
    icon: "FaHeart",
    permission: "matrimonial:review",
    section: "OPERATIONS",
    sectionHi: "संचालन",
  },
  // ── JOB_ADMIN / SUPER_ADMIN
  {
    name: "Jobs Admin",
    nameHi: "रोजगार प्रबंधन",
    path: "/dashboard/admin/opportunities?tab=jobs",
    icon: "FaBriefcase",
    permission: "job:moderate",
    section: "OPERATIONS",
    sectionHi: "संचालन",
  },
  // ── SCHOLARSHIP_ADMIN / SUPER_ADMIN
  {
    name: "Scholarship Admin",
    nameHi: "छात्रवृत्ति प्रबंधन",
    path: "/dashboard/admin/opportunities?tab=scholarships",
    icon: "FaGraduationCap",
    permission: "scholarship:read",
    section: "OPERATIONS",
    sectionHi: "संचालन",
  },
  // ── CONTENT_ADMIN / SUPER_ADMIN
  {
    name: "Content Admin",
    nameHi: "सामग्री व सूचनाएं",
    path: "/dashboard/admin/content",
    icon: "FaEdit",
    permission: "notice:read",
    section: "CONTENT",
    sectionHi: "सामग्री प्रबंधन",
  },
  // ── TREASURER / SUPER_ADMIN
  {
    name: "Finance Admin",
    nameHi: "वित्त व दान प्रबंधन",
    path: "/dashboard/admin/finance",
    icon: "FaRupeeSign",
    permission: "contribution:read",
    section: "FINANCE",
    sectionHi: "वित्त प्रबंधन",
  },
  // ── MODERATOR / SUPER_ADMIN: suggestion management
  {
    name: "Suggestions Admin",
    nameHi: "सुझाव प्रबंधन",
    path: "/dashboard/admin/suggestions",
    icon: "FaLightbulb",
    permission: "suggestion:*",
    section: "OPERATIONS",
    sectionHi: "संचालन",
  },
];

/**
 * Route-level permission map.
 * Used by PermissionRoute to guard /dashboard/admin/* paths.
 *
 * key   = route path prefix
 * value = permission required
 */
export const ADMIN_ROUTE_PERMISSIONS = {
  "/dashboard/admin/registrations":   "member:verify",
  "/dashboard/admin/family-lifecycle": "*",
  "/dashboard/admin/community":       ["community:moderate", "dharamshala:staff"],
  "/dashboard/admin/matrimonial":     "matrimonial:review",
  "/dashboard/admin/opportunities":   "job:moderate",        // checked further inside by tab
  "/dashboard/admin/content":         "notice:read",
  "/dashboard/admin/finance":         "contribution:read",
  "/dashboard/admin/suggestions":     "suggestion:*",
};
