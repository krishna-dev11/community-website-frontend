import { ACCOUNT_TYPE } from "../Utilities/Constaints";

export const sidebarLinks = [
  {
    section: "ACCOUNT",
    roles: [ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.STUDENT, ACCOUNT_TYPE.ADMIN],
    links: [
      {
        name: "My Profile",
        path: "/dashboard/my-profile",
        icon: "FaUser",
      },
    ],
  },
];
