import { ACCOUNT_TYPE, SAMAJ_ROLES } from "../Utilities/Constaints";

export const sidebarLinks = [
  {
    section: "ACCOUNT",
    accountTypes: [ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.STUDENT, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.MEMBER],
    links: [
      {
        name: "My Profile",
        path: "/dashboard/my-profile",
        icon: "FaUser",
      },
      {
        name: "Member Directory",
        path: "/dashboard/directory",
        icon: "FaAddressBook",
      },
      {
        name: "Family Hub",
        path: "/dashboard/family",
        icon: "FaUsers",
      },
      {
        name: "Community Hub",
        path: "/dashboard/community",
        icon: "FaComments",
      },
    ],
  },
  {
    section: "ADMIN",
    roles: [SAMAJ_ROLES.SUPER_ADMIN, "Admin"],
    links: [
      {
        name: "Registration Queue",
        path: "/dashboard/admin/registrations",
        icon: "FaUserCheck",
      },
    ],
  },
  {
    section: "OPERATIONS",
    roles: [SAMAJ_ROLES.SUPER_ADMIN, "Admin", SAMAJ_ROLES.MODERATOR, SAMAJ_ROLES.DHARAMSHALA_ADMIN],
    links: [
      {
        name: "Community Admin",
        path: "/dashboard/admin/community",
        icon: "FaShieldAlt",
      },
    ],
  },
  {
    section: "CONTENT",
    roles: [SAMAJ_ROLES.SUPER_ADMIN, "Admin", SAMAJ_ROLES.CONTENT_ADMIN],
    links: [
      {
        name: "Content Admin",
        path: "/dashboard/admin/content",
        icon: "FaEdit",
      },
    ],
  },
  {
    section: "FINANCE",
    roles: [SAMAJ_ROLES.SUPER_ADMIN, "Admin", SAMAJ_ROLES.TREASURER],
    links: [
      {
        name: "Finance Admin",
        path: "/dashboard/admin/finance",
        icon: "FaRupeeSign",
      },
    ],
  },
];
