import React from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import * as IoIcons from "react-icons/io";
import * as RiIcons from "react-icons/ri";

const SlideBarButton = ({ icon, path, name, onClick, isSidebarOpen }) => {
  const Icon = FaIcons[icon] || IoIcons[icon] || RiIcons[icon];
  const location = useLocation();
  const isActive = matchPath({ path }, location.pathname);

  return (
    <Link to={path} className="relative group block" onClick={onClick}>
      <div
        className={`w-full flex items-center gap-x-3 px-3 py-2.5 rounded-2xl transition-all duration-200 relative ${
          isSidebarOpen ? "justify-start" : "justify-center md:justify-start"
        } ${
          isActive
            ? "bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]"
        }`}
      >
        <div className={`absolute left-0 w-[3px] h-4 bg-[var(--accent-primary)] rounded-r-full transition-all duration-200 ${isActive ? "opacity-100" : "opacity-0"}`}></div>

        {Icon ? (
          <Icon
            className={`${
              isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
            } ${isSidebarOpen ? "text-[1.1rem]" : "text-[1.3rem] md:text-[1.05rem]"} transition-colors flex-shrink-0`}
          />
        ) : (
          <span className="text-red-500">⚠️</span>
        )}

        {/* Show text label: always on md+, also on mobile when sidebar is open */}
        <span
          className={`${
            isSidebarOpen ? "block" : "hidden md:block"
          } text-xs font-semibold tracking-wide transition-all truncate ${isActive ? "text-[var(--text-primary)] font-bold" : "group-hover:translate-x-0.5"}`}
        >
          {name}
        </span>
      </div>
    </Link>
  );
};

export default SlideBarButton;