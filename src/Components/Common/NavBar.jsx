// import React, { useState } from "react";
// import { NavbarLinks } from "../../data/navbar-links";
// import { Link, matchPath, useNavigate, useLocation } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { MdOutlineShoppingCart } from "react-icons/md";
// import { setLogOut } from "../../services/Operations/authAPI";
// import { RiDashboard2Line } from "react-icons/ri";
// import { IoLogOutOutline } from "react-icons/io5";
// import { CiLogin } from "react-icons/ci";
// import { FiMenu, FiX } from "react-icons/fi"; // Mobile Icons

// const NavBar = () => {
//   const { token } = useSelector((state) => state.auth);
//   const { user } = useSelector((state) => state.profile);
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   const conditionFormNavBarWholeStyle =
//     location.pathname.split("/").includes("EnrolledCourses") ||
//     location.pathname.split("/").includes("course");

//   function mathroute(route) {
//     if (!route) return false;
//     return matchPath({ path: route }, location.pathname);
//   }

//   return (
//     <div
//       className={`w-full h-[72px] fixed z-[1000] transition-all duration-300 ${
//         conditionFormNavBarWholeStyle ? "" : " "
//       }`}
//     >
//       <div className="flex justify-between items-center w-11/12 mx-auto h-full px-4 md:px-10">
        
        
//         <Link onClick={() => setIsMenuOpen(false)} to={"/"}>
//           <div className="flex items-center -translate-x-6 gap-3">
//             <div className="w-10 h-10 rounded-xl bg-[#6A0DAD]/20 flex items-center justify-center border border-[#6A0DAD]/30 shadow-lg shrink-0">
//               <span className="text-[#ffffff] font-black text-lg">V</span>
//             </div>
//             <div className="flex flex-col leading-tight">
//               <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#ffffff]">
//                 BOLD VOICE
//               </span>
//               <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#10b981]/80">
//                 Spoken English
//               </span>
//             </div>
//           </div>
//         </Link>

        
//         <ul className="hidden lg:flex gap-x-8 border border-[#ffffff]/10 bg-[#ffffff]/5 backdrop-blur-xl px-12 py-2.5 rounded-2xl">
//           {NavbarLinks.filter(
//             (link) => link?.title !== "Catalog" && link?.title !== "Category"
//           ).map((link, index) => (
//             <li key={index} className="relative group">
//               <Link
//                 to={link?.path}
//                 className={`text-sm font-medium transition-all ${
//                   mathroute(link?.path)
//                     ? "text-[#10b981]"
//                     : "text-[#ffffff] hover:text-[#10b981]"
//                 }`}
//               >
//                 {link.title}
//               </Link>
//             </li>
//           ))}
//         </ul>

        
//         <div className="flex items-center gap-x-4 md:gap-x-6">
          
          
//           {token && user?.accountType !== "Instructor" && (
//             <Link to={"/dashboard/wishlist"} className="relative">
//               <MdOutlineShoppingCart
//                 className={
//                   conditionFormNavBarWholeStyle
//                     ? "text-white"
//                     : "text-[#ffffff]"
//                 }
//                 size={24}
//               />
//               {user.cart?.length > 0 && (
//                 <span className="absolute -top-2 -right-2 h-4 w-4 bg-[#10b981] text-black text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
//                   {user.cart.length}
//                 </span>
//               )}
//             </Link>
//           )}

          
//           <div className="hidden md:flex items-center gap-x-4">
//             {token === null ? (
//               <>
//                 <Link
//                   to="/login"
//                   className="bg-[#ffffff]/5 border border-[#ffffff]/10 text-[#ffffff] px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#ffffff]/10 transition-all flex items-center gap-2"
//                 >
//                   <CiLogin size={18} /> Login
//                 </Link>
//                 <Link
//                   to="/signup"
//                   className="bg-[#ffffff] text-[#000000] px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#10b981] transition-all"
//                 >
//                   Sign Up
//                 </Link>
//               </>
//             ) : (
//               <div className="relative group">
//                 <img
//                   src={user?.imageUrl}
//                   className="h-9 w-9 rounded-full border border-[#10b981] cursor-pointer"
//                   alt="Profile"
//                 />
                
//                 <div className="absolute right-0 top-12 w-48 bg-[#0a0a0a] border border-[#ffffff]/10 rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 shadow-2xl z-50">
//                   <button
//                     onClick={() => navigate("/dashboard/my-profile")}
//                     className="w-full flex items-center gap-3 p-3 text-xs font-bold uppercase text-[#9ca3af] hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all"
//                   >
//                     <RiDashboard2Line size={18} /> Dashboard
//                   </button>
//                   <button
//                     onClick={() => dispatch(setLogOut(navigate))}
//                     className="w-full flex items-center gap-3 p-3 text-xs font-bold uppercase text-[#ef4444] hover:bg-[#ef4444]/10 rounded-xl transition-all"
//                   >
//                     <IoLogOutOutline size={18} /> Logout
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

          
//           <button
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//             className="lg:hidden text-[#ffffff] p-2 hover:bg-[#ffffff]/10 rounded-lg transition-all"
//           >
//             {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
//           </button>
//         </div>
//       </div>

      
//       <div
//         className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[999] lg:hidden transition-all duration-500 ${
//           isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
//         }`}
//         onClick={() => setIsMenuOpen(false)}
//       >
//         <div
//           className={`absolute right-0 top-0 h-full w-[300px] bg-[#050505] border-l border-white/10 p-8 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] transition-transform duration-500 ${
//             isMenuOpen ? "translate-x-0" : "translate-x-full"
//           }`}
//           onClick={(e) => e.stopPropagation()}
//         >
          
//           {token && (
//             <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 mb-6">
//               <img
//                 src={user?.imageUrl}
//                 className="h-10 w-10 rounded-full border border-[#10b981] object-cover"
//                 alt="User"
//               />
//               <div className="flex flex-col">
//                 <p className="text-sm font-bold text-white truncate w-32">
//                   {user?.firstName} {user?.lastName}
//                 </p>
//                 <Link
//                   to="/dashboard/my-profile"
//                   onClick={() => setIsMenuOpen(false)}
//                   className="text-[10px] text-[#10b981] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline"
//                 >
//                   <RiDashboard2Line size={12} /> Dashboard Entry
//                 </Link>
//               </div>
//             </div>
//           )}

          
//           <div className="flex flex-col gap-y-2 flex-1 overflow-y-auto custom-scrollbar">
//             <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#4b5563] mb-4">
//               Navigation Node
//             </p>

//             {NavbarLinks.filter(
//               (link) => link?.title !== "Catalog" && link?.title !== "Category"
//             ).map((link, i) => (
//               <div key={i} className="flex flex-col border-b border-white/5 pb-2">
//                 <Link
//                   to={link.path}
//                   onClick={() => setIsMenuOpen(false)}
//                   className={`text-xl font-bold tracking-tighter py-3 transition-colors ${
//                     mathroute(link.path)
//                       ? "text-[#10b981]"
//                       : "text-white hover:text-[#10b981]"
//                   }`}
//                 >
//                   {link.title}
//                 </Link>
//               </div>
//             ))}
//             {token && (
//               <Link
//                 to="/dashboard/my-profile"
//                 onClick={() => setIsMenuOpen(false)}
//                 className={`text-xl font-bold tracking-tighter flex items-center gap-3 ${
//                   mathroute("/dashboard/my-profile")
//                     ? "text-[#10b981]"
//                     : "text-white"
//                 }`}
//               >
//                 <RiDashboard2Line className="text-[#10b981]" size={22} />{" "}
//                 Dashboard
//               </Link>
//             )}
//           </div>

          
//           <div className="mt-auto flex flex-col gap-4 pt-8 border-t border-white/10">
//             {token === null ? (
//               <>
//                 <Link
//                   to="/login"
//                   onClick={() => setIsMenuOpen(false)}
//                   className="w-full py-4 text-center bg-white/5 rounded-2xl text-white font-bold uppercase tracking-widest text-xs border border-white/10"
//                 >
//                   Login Node
//                 </Link>
//                 <Link
//                   to="/signup"
//                   onClick={() => setIsMenuOpen(false)}
//                   className="w-full py-4 text-center bg-white rounded-2xl text-black font-bold uppercase tracking-widest text-xs hover:bg-[#10b981] transition-all"
//                 >
//                   Initialize Access
//                 </Link>
//               </>
//             ) : (
//               <button
//                 onClick={() => {
//                   dispatch(setLogOut(navigate));
//                   setIsMenuOpen(false);
//                 }}
//                 className="w-full py-4 bg-[#ef4444]/10 text-[#ef4444] rounded-2xl font-bold uppercase tracking-widest text-xs border border-red-500/20 flex items-center justify-center gap-2"
//               >
//                 <IoLogOutOutline /> Logout Terminal
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NavBar;










import React, { useState } from "react";
import {
  Link,
  matchPath,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { setLogOut } from "../../services/Operations/authAPI";

// ============================================================
// ICONS
// ============================================================

import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiSearch,
  FiHeart,
  FiBell,
  FiUser,
  FiHome,
  FiInfo,
  FiUsers,
  FiCalendar,
  FiBriefcase,
  FiBookOpen,
  FiLifeBuoy, // Community/Help ke liye valid icon
  FiCreditCard,
  FiLogOut,
  FiSettings,
  FiMoreHorizontal,
} from "react-icons/fi";

// ============================================================
// MAIN NAVIGATION DATA
// ============================================================

const navigationItems = [
  {
    title: "Home",
    path: "/",
    type: "link",
    icon: FiHome,
  },
  {
    title: "About",
    type: "dropdown",
    icon: FiInfo,
    items: [
      { title: "About Samaj", path: "/about" },
      { title: "Samaj History", path: "/about/history" },
      { title: "Leadership", path: "/committee" },
      { title: "Committee", path: "/committee" },
      { title: "Digital Archive", path: "/archive" },
      { title: "Contact Us", path: "/contact" },
    ],
  },
  {
    title: "Members",
    type: "dropdown",
    icon: FiUsers,
    items: [
      { title: "Member Directory", path: "/members" },
      { title: "Family Directory", path: "/families" },
      { title: "Family Tree", path: "/family-tree" },
      { title: "Community Groups", path: "/groups" },
      { title: "Digital ID Card", path: "/member-id" },
      { title: "Blood Donor Directory", path: "/blood-donors" },
    ],
  },
{
    title: "Community",
    type: "dropdown",
    icon: FiLifeBuoy, // FiHeartHandshake ki jagah FiLifeBuoy
    items: [
      { title: "Community Help", path: "/community-help" },
      { title: "Medical Help", path: "/medical" },
      { title: "Senior Citizen Support", path: "/senior-citizen" },
      { title: "Problem / Grievance", path: "/grievances" },
      { title: "Community Discussion", path: "/discussion" },
      { title: "Condolence / श्रद्धांजलि", path: "/condolence" },
      { title: "Notifications", path: "/notifications" },
    ],
  },
  {
    title: "Events",
    type: "dropdown",
    icon: FiCalendar,
    items: [
      { title: "Upcoming Events", path: "/events" },
      { title: "Past Events", path: "/events/past" },
      { title: "My Registrations", path: "/my-registrations" },
    ],
  },
  {
    title: "Opportunities",
    type: "dropdown",
    icon: FiBriefcase,
    items: [
      { title: "Jobs & Careers", path: "/jobs" },
      { title: "Scholarships", path: "/scholarships" },
      { title: "Business Directory", path: "/businesses" },
      { title: "Matrimonial", path: "/matrimonial" },
      { title: "Achievements", path: "/achievements" },
    ],
  },
  {
    title: "Resources",
    type: "dropdown",
    icon: FiBookOpen,
    items: [
      { title: "Notices & Announcements", path: "/notices" },
      { title: "Samaj News", path: "/news" },
      { title: "Photo & Video Gallery", path: "/gallery" },
      { title: "Samaj Magazine", path: "/publications" },
      { title: "Community Facilities", path: "/facilities" },
    ],
  },
  {
    title: "More",
    type: "dropdown",
    icon: FiMoreHorizontal,
    items: [
      { title: "Financial Transparency", path: "/transparency" },
      { title: "Samaj Archive", path: "/archive" },
      { title: "Important Contacts", path: "/contacts" },
      { title: "Samaj Groups", path: "/groups" },
      { title: "Ask Samaj AI", path: "/ai-assistant" },
    ],
  },
];

// ============================================================
// DESKTOP DROPDOWN COMPONENT
// ============================================================

const DesktopDropdown = ({
  item,
  isOpen,
  setOpenDropdown,
  closeMenus,
  isDropdownActive,
}) => {
  const active = isDropdownActive(item);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpenDropdown(item.title)}
      onMouseLeave={() => setOpenDropdown(null)}
    >
      <button
        type="button"
        className={`flex items-center gap-1.5 py-3 text-sm font-medium transition-all duration-200 ${
          isOpen || active
            ? "text-emerald-400"
            : "text-white/90 hover:text-emerald-400"
        }`}
      >
        {item.title}
        <FiChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`absolute left-1/2 top-full z-[1100] mt-1 min-w-[245px] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#080808]/95 p-2 shadow-[0_25px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-all duration-200 ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        {item.items.map((subItem) => (
          <Link
            key={subItem.path}
            to={subItem.path}
            onClick={closeMenus}
            className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-white/70 transition-all hover:bg-white/5 hover:text-white"
          >
            <span>{subItem.title}</span>
            <FiChevronRight size={14} className="text-white/30" />
          </Link>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// NAVBAR COMPONENT
// ============================================================

const NavBar = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openMobileSection, setOpenMobileSection] = useState(null);

  const isRouteActive = (route) => {
    if (!route) return false;
    return (
      matchPath(
        {
          path: route,
          end: route === "/",
        },
        location.pathname
      ) !== null
    );
  };

  const isDropdownActive = (item) => {
    if (!item.items) return false;
    return item.items.some((subItem) =>
      location.pathname.startsWith(subItem.path)
    );
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
    setOpenMobileSection(null);
  };

  const handleLogout = () => {
    dispatch(setLogOut(navigate));
    closeMenus();
  };

  const toggleMobileSection = (title) => {
    setOpenMobileSection((prev) => (prev === title ? null : title));
  };

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-[1000] h-[76px] w-full border-b border-white/10 bg-[#050505]/85 backdrop-blur-2xl">
        <div className="mx-auto flex h-full w-[94%] max-w-[1600px] items-center justify-between gap-5 xl:w-[90%]">
          {/* LOGO */}
          <Link to="/" onClick={closeMenus} className="shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 shadow-lg">
                <span className="text-xl font-black text-emerald-400">
                  S
                </span>
              </div>
              <div className="hidden flex-col leading-tight sm:flex">
                <span className="text-[12px] font-bold uppercase tracking-[0.25em] text-white">
                  SAMAJ
                </span>
                <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                  Community Portal
                </span>
              </div>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden flex-1 items-center justify-center lg:flex">
            <div className="flex items-center gap-x-5 xl:gap-x-7">
              {navigationItems.map((item) => {
                if (item.type === "link") {
                  return (
                    <Link
                      key={item.title}
                      to={item.path}
                      className={`text-sm font-medium transition-all duration-200 ${
                        isRouteActive(item.path)
                          ? "text-emerald-400"
                          : "text-white/90 hover:text-emerald-400"
                      }`}
                    >
                      {item.title}
                    </Link>
                  );
                }

                return (
                  <DesktopDropdown
                    key={item.title}
                    item={item}
                    isOpen={openDropdown === item.title}
                    setOpenDropdown={setOpenDropdown}
                    closeMenus={closeMenus}
                    isDropdownActive={isDropdownActive}
                  />
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <Link
              to="/search"
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-emerald-400 md:flex"
              title="Search"
            >
              <FiSearch size={18} />
            </Link>

            {/* Notification */}
            {token && (
              <Link
                to="/notifications"
                className="relative hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-emerald-400 md:flex"
                title="Notifications"
              >
                <FiBell size={18} />
              </Link>
            )}

            {/* Donate Button */}
            <Link
              to="/donate"
              className="hidden items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-emerald-400 xl:flex"
            >
              <FiHeart size={15} />
              Support Samaj
            </Link>

            {/* LOGGED IN / LOGGED OUT */}
            {token ? (
              <div className="group relative hidden md:block">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1.5 transition-all hover:bg-white/10"
                >
                  <img
                    src={user?.imageUrl || "https://api.dicebear.com/7.x/initials/svg?seed=User"}
                    alt="Profile"
                    className="h-9 w-9 rounded-lg border border-emerald-400/50 object-cover"
                  />
                  <div className="hidden max-w-[110px] flex-col items-start xl:flex">
                    <span className="w-full truncate text-xs font-bold text-white">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400">
                      Member
                    </span>
                  </div>
                  <FiChevronDown size={14} className="mr-1 text-white/50" />
                </button>

                {/* Profile Dropdown */}
                <div className="invisible absolute right-0 top-[calc(100%+10px)] w-60 translate-y-2 rounded-2xl border border-white/10 bg-[#080808]/95 p-2 opacity-0 shadow-2xl backdrop-blur-2xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="mb-1 border-b border-white/10 px-4 py-3">
                    <p className="text-sm font-bold text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-white/40">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    to="/dashboard/my-profile"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 transition-all hover:bg-white/5 hover:text-white"
                  >
                    <FiUser size={16} /> My Profile
                  </Link>

                  <Link
                    to="/dashboard/my-family"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 transition-all hover:bg-white/5 hover:text-white"
                  >
                    <FiUsers size={16} /> My Family
                  </Link>

                  <Link
                    to="/dashboard/my-id"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 transition-all hover:bg-white/5 hover:text-white"
                  >
                    <FiCreditCard size={16} /> Digital ID
                  </Link>

                  <Link
                    to="/dashboard/my-events"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 transition-all hover:bg-white/5 hover:text-white"
                  >
                    <FiCalendar size={16} /> My Events
                  </Link>

                  <Link
                    to="/dashboard/my-donations"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 transition-all hover:bg-white/5 hover:text-white"
                  >
                    <FiHeart size={16} /> My Donations
                  </Link>

                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 transition-all hover:bg-white/5 hover:text-white"
                  >
                    <FiSettings size={16} /> Settings
                  </Link>

                  <div className="mt-1 border-t border-white/10 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-red-400 transition-all hover:bg-red-500/10"
                    >
                      <FiLogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  to="/login"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-emerald-400"
                >
                  Join Samaj
                </Link>
              </div>
            )}

            {/* MOBILE MENU TOGGLE BUTTON */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition-all hover:bg-white/10 lg:hidden"
            >
              {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ======================================================
          MOBILE MENU DRAWER
      ====================================================== */}
      <div
        className={`fixed inset-0 z-[999] bg-black/80 backdrop-blur-md transition-opacity duration-300 lg:hidden ${
          isMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenus}
      />

      <div
        className={`fixed bottom-0 right-0 top-[76px] z-[999] w-[85%] max-w-[360px] overflow-y-auto border-l border-white/10 bg-[#080808] p-5 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* User Card (If logged in) */}
        {token && user && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <img
                src={user?.imageUrl || "https://api.dicebear.com/7.x/initials/svg?seed=User"}
                alt="Profile"
                className="h-11 w-11 rounded-xl border border-emerald-400/50 object-cover"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-white/50">{user?.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex flex-col gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            if (item.type === "link") {
              return (
                <Link
                  key={item.title}
                  to={item.path}
                  onClick={closeMenus}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isRouteActive(item.path)
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.title}
                </Link>
              );
            }

            const isExpanded = openMobileSection === item.title;

            return (
              <div key={item.title} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => toggleMobileSection(item.title)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-all hover:bg-white/5 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.title}</span>
                  </div>
                  <FiChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Sub items Accordion */}
                {isExpanded && (
                  <div className="ml-6 mt-1 flex flex-col border-l border-white/10 pl-3">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        onClick={closeMenus}
                        className="rounded-lg px-3 py-2 text-xs font-medium text-white/60 transition-all hover:text-emerald-400"
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Auth / Logout Actions */}
        <div className="mt-8 border-t border-white/10 pt-5">
          {token ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 py-3 text-sm font-bold text-red-400 transition-all hover:bg-red-500/20"
            >
              <FiLogOut size={16} /> Logout
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={closeMenus}
                className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold uppercase tracking-wider text-white"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={closeMenus}
                className="flex w-full items-center justify-center rounded-xl bg-emerald-500 py-3 text-xs font-black uppercase tracking-wider text-black"
              >
                Join Samaj
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NavBar;