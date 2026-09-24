import { ACCOUNT_TYPE, SAMAJ_ROLES } from "../Utilities/Constaints";

export const sidebarLinks = [
  {
    section: "ACCOUNT",
    sectionHi: "खाता व सेवाएं",
    accountTypes: [ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.STUDENT, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.MEMBER],
    links: [
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
    ],
  },
  {
    section: "ADMIN",
    sectionHi: "प्रशासन केंद्र",
    roles: [SAMAJ_ROLES.SUPER_ADMIN, "Admin"],
    links: [
      {
        name: "Registration Queue",
        nameHi: "पंजीकरण सत्यापन",
        path: "/dashboard/admin/registrations",
        icon: "FaUserCheck",
      },
    ],
  },
  {
    section: "OPERATIONS",
    sectionHi: "संचालन एवं प्रबंधन",
    roles: [
      SAMAJ_ROLES.SUPER_ADMIN,
      "Admin",
      SAMAJ_ROLES.MODERATOR,
      SAMAJ_ROLES.DHARAMSHALA_ADMIN,
      SAMAJ_ROLES.MATRIMONIAL_ADMIN,
      SAMAJ_ROLES.SCHOLARSHIP_ADMIN,
      SAMAJ_ROLES.JOB_ADMIN,
    ],
    links: [
      {
        name: "Community Admin",
        nameHi: "समुदाय प्रबंधन",
        path: "/dashboard/admin/community",
        icon: "FaShieldAlt",
      },
      {
        name: "Matrimonial Admin",
        nameHi: "वैवाहिक प्रबंधन",
        path: "/dashboard/admin/matrimonial",
        icon: "FaHeart",
      },
      {
        name: "Opportunity Admin",
        nameHi: "रोजगार व छात्रवृत्ति",
        path: "/dashboard/admin/opportunities",
        icon: "FaGraduationCap",
      },
    ],
  },
  {
    section: "CONTENT",
    sectionHi: "सामग्री प्रबंधन",
    roles: [SAMAJ_ROLES.SUPER_ADMIN, "Admin", SAMAJ_ROLES.CONTENT_ADMIN],
    links: [
      {
        name: "Content Admin",
        nameHi: "सामग्री व सूचनाएं",
        path: "/dashboard/admin/content",
        icon: "FaEdit",
      },
    ],
  },
  {
    section: "FINANCE",
    sectionHi: "वित्त प्रबंधन",
    roles: [SAMAJ_ROLES.SUPER_ADMIN, "Admin", SAMAJ_ROLES.TREASURER],
    links: [
      {
        name: "Finance Admin",
        nameHi: "वित्त व दान प्रबंधन",
        path: "/dashboard/admin/finance",
        icon: "FaRupeeSign",
      },
    ],
  },
];
