import React, { useState, useRef, useEffect } from "react";
import { Link, matchPath, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLogOut } from "../../services/Operations/authAPI";
import { useTheme } from "../../Utilities/useTheme";

// Icons
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiHeart,
  FiBell,
  FiUser,
  FiHome,
  FiInfo,
  FiUsers,
  FiBriefcase,
  FiBookOpen,
  FiPhone,
  FiLogOut,
  FiSettings,
  FiShield,
  FiGrid,
  FiMessageSquare,
  FiImage,
  FiLayers,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { FaGraduationCap, FaHeart as FaHeartSolid, FaRupeeSign } from "react-icons/fa";

// Navigation menu structure aligned with platform routes
const navigationItems = [
  {
    title: "Home",
    path: "/",
    type: "link",
    icon: FiHome,
  },
  {
    title: "About",
    path: "/about",
    type: "link",
    icon: FiInfo,
  },
  {
    title: "Community",
    type: "dropdown",
    icon: FiUsers,
    items: [
      { title: "Dharamshala Booking", path: "/dharamshala", desc: "Samaj guest houses & yatri niwas" },
      { title: "Member Directory", path: "/dashboard/directory", desc: "Connect with verified Samaj members" },
      { title: "Family Hub", path: "/dashboard/family", desc: "Household profiles & SSSM ID tree" },
      { title: "Community Hub & Issues", path: "/dashboard/community", desc: "Raise issues & track solutions" },
      { title: "Discussion Forum", path: "/discussion", desc: "Open talks, youth & senior forums" },
    ],
  },
  {
    title: "Opportunities",
    type: "dropdown",
    icon: FiBriefcase,
    items: [
      { title: "Jobs & Careers", path: "/jobs", desc: "Employment & hiring in the community" },
      { title: "Scholarships", path: "/scholarships", desc: "Financial aid for student education" },
      { title: "Matrimonial Portal", path: "/matrimonial", desc: "Verified matchmaking & alliances" },
      { title: "Achievements", path: "/achievements", desc: "Celebrating member milestones" },
    ],
  },
  {
    title: "Media & Resources",
    type: "dropdown",
    icon: FiBookOpen,
    items: [
      { title: "Notices & Announcements", path: "/notices", desc: "Official circulars & updates" },
      { title: "Samaj Patrika / Magazine", path: "/publications", desc: "Download monthly editions" },
      { title: "Photo & Video Gallery", path: "/gallery", desc: "Event albums & community memories" },
      { title: "Shradhanjali / Condolence", path: "/condolence", desc: "In loving memory & tributes" },
    ],
  },
  {
    title: "Contact",
    path: "/contact",
    type: "link",
    icon: FiPhone,
  },
];

/* ======================================================
   Theme Toggle Button
   ====================================================== */
const ThemeToggle = ({ isDark, toggleTheme, compact = false }) => (
  <button
    type="button"
    onClick={toggleTheme}
    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    aria-label="Toggle theme"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: compact ? 36 : 38,
      height: compact ? 36 : 38,
      borderRadius: 10,
      border: "1px solid var(--line-strong)",
      background: "var(--surface-raised)",
      color: "var(--text-soft)",
      transition: "all 200ms ease",
      cursor: "pointer",
      flexShrink: 0,
    }}
  >
    {isDark ? <FiSun size={compact ? 15 : 16} /> : <FiMoon size={compact ? 15 : 16} />}
  </button>
);

/* ======================================================
   Desktop Dropdown
   ====================================================== */
const DesktopDropdown = ({ item, isOpen, setOpenDropdown, closeMenus, isDropdownActive }) => {
  const active = isDropdownActive(item);
  const Icon = item.icon;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpenDropdown(item.title)}
      onMouseLeave={() => setOpenDropdown(null)}
    >
      <button
        type="button"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "6px 10px",
          fontSize: 12.5,
          fontWeight: 500,
          borderRadius: 10,
          border: "none",
          background: isOpen || active ? "var(--brand-glow)" : "transparent",
          color: isOpen || active ? "var(--brand)" : "var(--text-soft)",
          transition: "all 200ms ease",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <Icon size={14} />
        <span>{item.title}</span>
        <FiChevronDown
          size={12}
          style={{
            transition: "transform 200ms ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            opacity: 0.6,
          }}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "calc(100% + 8px)",
          zIndex: 1100,
          width: 280,
          transform: `translateX(-50%) translateY(${isOpen ? 0 : -8}px)`,
          borderRadius: 18,
          border: "1px solid var(--glass-border)",
          background: "var(--glass-bg)",
          backdropFilter: "var(--glass-backdrop)",
          WebkitBackdropFilter: "var(--glass-backdrop)",
          padding: 8,
          boxShadow: "var(--shadow-modal)",
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? "visible" : "hidden",
          pointerEvents: isOpen ? "auto" : "none",
          transition: "all 200ms ease",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {item.items.map((subItem) => (
            <Link
              key={subItem.path}
              to={subItem.path}
              onClick={closeMenus}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "10px 14px",
                borderRadius: 12,
                transition: "all 180ms ease",
                textDecoration: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}
                >
                  {subItem.title}
                </span>
                <FiChevronRight size={12} style={{ color: "var(--text-faint)" }} />
              </div>
              {subItem.desc && (
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  {subItem.desc}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ======================================================
   NavBar Component
   ====================================================== */
const NavBar = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { isDark, toggleTheme } = useTheme();

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openMobileSection, setOpenMobileSection] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileDropdownRef = useRef(null);

  const userRoles = Array.isArray(user?.roles) ? user.roles : [];
  const isAdmin = userRoles.some((r) =>
    ["SUPER_ADMIN", "Admin", "MODERATOR", "TREASURER", "CONTENT_ADMIN", "MATRIMONIAL_ADMIN", "SCHOLARSHIP_ADMIN", "JOB_ADMIN", "DHARAMSHALA_ADMIN"].includes(r)
  );

  // Detect scroll for enhanced navbar style
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isRouteActive = (route) => {
    if (!route) return false;
    return matchPath({ path: route, end: route === "/" }, location.pathname) !== null;
  };

  const isDropdownActive = (item) => {
    if (!item.items) return false;
    return item.items.some((subItem) => location.pathname === subItem.path || location.pathname.startsWith(subItem.path));
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
    setOpenMobileSection(null);
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    closeMenus();
    dispatch(setLogOut(navigate));
  };

  const toggleMobileSection = (title) => {
    setOpenMobileSection((prev) => (prev === title ? null : title));
  };

  return (
    <>
      <nav
        id="main-navbar"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          top: 0,
          zIndex: 1000,
          height: 64,
          width: "100%",
          borderBottom: `1px solid var(--nav-border)`,
          background: "var(--nav-bg)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: scrolled ? "var(--shadow-card)" : "none",
          transition: "box-shadow 260ms ease, background 220ms ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            height: "100%",
            width: "100%",
            maxWidth: 1600,
            margin: "0 auto",
            padding: "0 12px",
            boxSizing: "border-box",
          }}
        >
          {/* BRAND LOGO */}
          <Link
            to="/"
            onClick={closeMenus}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                height: 36,
                width: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                border: "1px solid rgba(16,185,129,0.4)",
                background: "var(--brand-glow)",
                boxShadow: "0 0 16px var(--brand-glow)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "var(--brand)",
                  fontFamily: "var(--font-display)",
                }}
              >
                S
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--text)",
                  fontFamily: "var(--font-display)",
                }}
              >
                SAMAJ
              </span>
              <span
                className="logo-subtitle"
                style={{
                  fontSize: 8.5,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--brand)",
                }}
              >
                Community Portal
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION MENU (VISIBLE ONLY ON DESKTOP 960px+) */}
          <div
            style={{ display: "none", flex: 1, alignItems: "center", justifyContent: "center" }}
            className="desktop-nav"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {navigationItems.map((item) => {
                if (item.type === "link") {
                  const active = isRouteActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      to={item.path}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "6px 10px",
                        fontSize: 12.5,
                        fontWeight: active ? 600 : 500,
                        borderRadius: 10,
                        background: active ? "var(--brand-glow)" : "transparent",
                        color: active ? "var(--brand)" : "var(--text-soft)",
                        textDecoration: "none",
                        transition: "all 200ms ease",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Icon size={14} />
                      <span>{item.title}</span>
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
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {/* Theme Toggle - always visible & compact */}
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} compact={true} />

            {/* Donate Button */}
            <Link
              to="/donate"
              className="navbar-donate-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                borderRadius: 10,
                background: "linear-gradient(135deg, var(--brand), var(--brand-deep))",
                padding: "6px 10px",
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#fff",
                textDecoration: "none",
                boxShadow: "0 0 16px var(--brand-shadow)",
                transition: "all 220ms ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <FiHeart size={12} />
              <span>Donate</span>
            </Link>

            {/* Desktop Only: Logged-in Avatar & Notifications */}
            {token ? (
              <div
                style={{ display: "none", alignItems: "center", gap: 6 }}
                className="desktop-auth-actions"
              >
                {/* Notifications Bell */}
                <Link
                  to="/notifications"
                  title="Notifications"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface-raised)",
                    color: "var(--text-soft)",
                    textDecoration: "none",
                    transition: "all 200ms ease",
                    flexShrink: 0,
                  }}
                >
                  <FiBell size={15} />
                </Link>

                {/* Profile Avatar & Dropdown */}
                <div style={{ position: "relative" }} ref={profileDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      borderRadius: 10,
                      border: "1px solid var(--line-strong)",
                      background: "var(--surface-raised)",
                      padding: "3px 6px 3px 3px",
                      cursor: "pointer",
                      transition: "all 200ms ease",
                    }}
                  >
                    <img
                      src={user?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName || "Member"}`}
                      alt="Profile"
                      style={{ height: 28, width: 28, borderRadius: 8, border: "1px solid rgba(16,185,129,0.3)", objectFit: "cover" }}
                    />
                    <FiChevronDown
                      size={11}
                      style={{
                        color: "var(--text-muted)",
                        transition: "transform 200ms ease",
                        transform: isProfileOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 8px)",
                        zIndex: 1200,
                        width: 260,
                        borderRadius: 16,
                        border: "1px solid var(--glass-border)",
                        background: "var(--glass-bg)",
                        backdropFilter: "var(--glass-backdrop)",
                        WebkitBackdropFilter: "var(--glass-backdrop)",
                        padding: 8,
                        boxShadow: "var(--shadow-modal)",
                      }}
                    >
                      <div style={{ borderBottom: "1px solid var(--line)", padding: "8px 10px 10px", marginBottom: 6 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 10.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {user?.email}
                        </p>
                      </div>

                      {[
                        { to: "/dashboard/my-profile", icon: <FiUser size={13} style={{ color: "var(--brand)" }} />, label: "My Profile" },
                        { to: "/dashboard/directory", icon: <FiUsers size={13} style={{ color: "var(--info)" }} />, label: "Member Directory" },
                        { to: "/dashboard/family", icon: <FiLayers size={13} style={{ color: "#22d3ee" }} />, label: "Family Hub" },
                        { to: "/dashboard/community", icon: <FiMessageSquare size={13} style={{ color: "#7dd3fc" }} />, label: "Community Hub" },
                        { to: "/matrimonial", icon: <FaHeartSolid size={12} style={{ color: "#f472b6" }} />, label: "Matrimonial Portal" },
                      ].map(({ to, icon, label }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={closeMenus}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, fontSize: 11.5, fontWeight: 500, color: "var(--text)", textDecoration: "none" }}
                        >
                          {icon}
                          <span>{label}</span>
                        </Link>
                      ))}

                      {isAdmin && (
                        <div style={{ marginTop: 6, borderTop: "1px solid var(--line)", paddingTop: 6 }}>
                          <p style={{ margin: "0 0 4px", padding: "0 10px", fontSize: 8.5, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brand)" }}>
                            Admin Center
                          </p>
                          {[
                            { to: "/dashboard/admin/registrations", icon: <FiShield size={12} style={{ color: "var(--brand)" }} />, label: "Registration Queue" },
                            { to: "/dashboard/admin/content", icon: <FiImage size={12} style={{ color: "var(--info)" }} />, label: "Content & Notices" },
                            { to: "/dashboard/admin/community", icon: <FiMessageSquare size={12} style={{ color: "#c084fc" }} />, label: "Community Admin" },
                            { to: "/dashboard/admin/matrimonial", icon: <FaHeartSolid size={11} style={{ color: "#fb7185" }} />, label: "Matrimonial Admin" },
                            { to: "/dashboard/admin/opportunities", icon: <FaGraduationCap size={12} style={{ color: "#fbbf24" }} />, label: "Opportunities Admin" },
                            { to: "/dashboard/admin/finance", icon: <FaRupeeSign size={12} style={{ color: "var(--brand)" }} />, label: "Finance Admin" },
                          ].map(({ to, icon, label }) => (
                            <Link
                              key={to}
                              to={to}
                              onClick={closeMenus}
                              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, fontSize: 11.5, fontWeight: 500, color: "var(--text-soft)", textDecoration: "none" }}
                            >
                              {icon}
                              <span>{label}</span>
                            </Link>
                          ))}
                        </div>
                      )}

                      <div style={{ marginTop: 6, borderTop: "1px solid var(--line)", paddingTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
                        <Link
                          to="/dashboard/setting"
                          onClick={closeMenus}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, fontSize: 11.5, fontWeight: 500, color: "var(--text-soft)", textDecoration: "none" }}
                        >
                          <FiSettings size={13} style={{ color: "var(--text-muted)" }} />
                          <span>Account Settings</span>
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, fontSize: 11.5, fontWeight: 600, color: "var(--danger)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}
                        >
                          <FiLogOut size={13} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Desktop Logged-out Auth buttons */
              <div
                style={{ display: "none", alignItems: "center", gap: 6 }}
                className="desktop-auth-actions"
              >
                <Link
                  to="/login"
                  style={{
                    borderRadius: 10,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface-raised)",
                    padding: "6px 12px",
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--text)",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  style={{
                    borderRadius: 10,
                    background: "var(--brand)",
                    padding: "6px 12px",
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#fff",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Join Samaj
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              style={{
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "1px solid var(--line-strong)",
                background: "var(--surface-raised)",
                color: "var(--text-soft)",
                cursor: "pointer",
                transition: "all 200ms ease",
                flexShrink: 0,
              }}
              className="mobile-hamburger"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE NAVIGATION DRAWER ================= */}
      {/* Overlay */}
      <div
        onClick={closeMenus}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 998,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          opacity: isMenuOpen ? 1 : 0,
          pointerEvents: isMenuOpen ? "auto" : "none",
          transition: "opacity 280ms ease",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          top: 64,
          zIndex: 999,
          width: "88%",
          maxWidth: 320,
          overflowY: "auto",
          borderLeft: "1px solid var(--line)",
          background: "var(--surface)",
          padding: 16,
          boxShadow: "var(--shadow-modal)",
          transform: isMenuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          boxSizing: "border-box",
        }}
      >
        {/* User Card in Mobile Drawer */}
        {token && user ? (
          <div style={{ marginBottom: 16, borderRadius: 14, border: "1px solid var(--line)", background: "var(--surface-raised)", padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={user?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName || "Member"}`}
                alt="Profile"
                style={{ height: 40, width: 40, borderRadius: 10, border: "1px solid rgba(16,185,129,0.3)", objectFit: "cover", flexShrink: 0 }}
              />
              <div style={{ overflow: "hidden" }}>
                <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.firstName} {user?.lastName}
                </span>
                <span style={{ display: "block", fontSize: 10.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Nav Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {navigationItems.map((item) => {
            const Icon = item.icon;

            if (item.type === "link") {
              const active = isRouteActive(item.path);
              return (
                <Link
                  key={item.title}
                  to={item.path}
                  onClick={closeMenus}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 500,
                    background: active ? "var(--brand-glow)" : "transparent",
                    color: active ? "var(--brand)" : "var(--text-soft)",
                    textDecoration: "none",
                    transition: "all 160ms ease",
                  }}
                >
                  <Icon size={16} />
                  <span>{item.title}</span>
                </Link>
              );
            }

            const isExpanded = openMobileSection === item.title;

            return (
              <div key={item.title}>
                <button
                  type="button"
                  onClick={() => toggleMobileSection(item.title)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontSize: 12.5,
                    fontWeight: 500,
                    background: "transparent",
                    color: "var(--text-soft)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 160ms ease",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon size={16} />
                    <span>{item.title}</span>
                  </div>
                  <FiChevronDown
                    size={14}
                    style={{
                      transition: "transform 200ms ease",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      color: "var(--text-faint)",
                    }}
                  />
                </button>

                {isExpanded && (
                  <div style={{ marginLeft: 16, paddingLeft: 12, borderLeft: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 2, marginBottom: 4 }}>
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        onClick={closeMenus}
                        style={{ display: "block", borderRadius: 8, padding: "7px 10px", fontSize: 11.5, fontWeight: 500, color: "var(--text-muted)", textDecoration: "none" }}
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

        {/* Mobile Bottom Actions */}
        <div style={{ marginTop: 20, borderTop: "1px solid var(--line)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <Link
            to="/donate"
            onClick={closeMenus}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, background: "linear-gradient(135deg, var(--brand), var(--brand-deep))", padding: "10px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", textDecoration: "none", boxShadow: "0 4px 16px var(--brand-shadow)" }}
          >
            <FiHeart size={13} />
            <span>Donate & Support</span>
          </Link>

          {token ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Link
                to="/dashboard/my-profile"
                onClick={closeMenus}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, border: "1px solid var(--line-strong)", background: "var(--surface-raised)", padding: "9px 0", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text)", textDecoration: "none" }}
              >
                <FiGrid size={13} />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, background: "var(--danger-soft)", padding: "9px 0", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--danger)", border: "none", cursor: "pointer" }}
              >
                <FiLogOut size={13} />
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Link
                to="/login"
                onClick={closeMenus}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, border: "1px solid var(--line-strong)", background: "var(--surface-raised)", padding: "9px 0", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text)", textDecoration: "none" }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={closeMenus}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "var(--brand)", padding: "9px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", textDecoration: "none" }}
              >
                Join Samaj
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (min-width: 960px) {
          .desktop-nav { display: flex !important; }
          .desktop-auth-actions { display: flex !important; }
          .mobile-hamburger { display: none !important; }
        }
        @media (max-width: 959px) {
          .desktop-nav { display: none !important; }
          .desktop-auth-actions { display: none !important; }
          .mobile-hamburger { display: flex !important; }
        }
        @media (max-width: 360px) {
          .logo-subtitle { display: none !important; }
          .navbar-donate-btn span { display: none !important; }
          .navbar-donate-btn { padding: 6px !important; }
        }
      `}</style>
    </>
  );
};

export default NavBar;