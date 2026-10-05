import React from "react";
import { FiCheckCircle, FiClock, FiSearch } from "react-icons/fi";

export const inputClass = "ka-input";
export const textareaClass = "ka-input !min-h-24 resize-none !py-3";

export const Button = ({ children, icon: Icon, tone = "neutral", className = "", ...props }) => {
  const toneClasses = {
    neutral: "btn-secondary !py-2 !px-4 !text-xs",
    success: "btn-primary !py-2 !px-5 !text-xs",
    warning:
      "inline-flex items-center justify-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 font-bold text-xs uppercase tracking-wider px-4 py-2 transition-all hover:bg-amber-400/20 disabled:opacity-50 cursor-pointer",
    danger:
      "inline-flex items-center justify-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 text-red-300 font-bold text-xs uppercase tracking-wider px-4 py-2 transition-all hover:bg-red-400/20 disabled:opacity-50 cursor-pointer",
  };
  return (
    <button
      {...props}
      className={`${toneClasses[tone] || toneClasses.neutral} ${className} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </button>
  );
};

export const Field = ({ label, children }) => (
  <label className="flex min-w-0 flex-col gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
      {label}
    </span>
    {children}
  </label>
);

export const StatusBadge = ({ value }) => {
  const colorMap = {
    SUBMITTED: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    UNDER_REVIEW: "border-sky-400/40 bg-sky-400/10 text-sky-300",
    IN_PROGRESS: "border-blue-400/40 bg-blue-400/10 text-blue-300",
    PENDING: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    PAYMENT_PENDING: "border-orange-400/40 bg-orange-400/10 text-orange-300",
    CONFIRMED: "border-teal-400/40 bg-teal-400/10 text-teal-300",
    CHECKED_IN: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
    DRAFT: "border-purple-400/40 bg-purple-400/10 text-purple-300",
    ACTIVE: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    PUBLISHED: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    RESOLVED: "border-green-400/40 bg-green-400/10 text-green-300",
    COMPLETED: "border-green-400/40 bg-green-400/10 text-green-300",
    CLOSED: "border-slate-400/40 bg-slate-400/10 text-slate-300",
    REJECTED: "border-red-400/40 bg-red-400/10 text-red-300",
    CANCELLED: "border-red-400/40 bg-red-400/10 text-red-300",
    ARCHIVED: "border-gray-500/40 bg-gray-500/10 text-gray-400",
    DISMISSED: "border-gray-500/40 bg-gray-500/10 text-gray-400",
  };
  return (
    <span
      className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        colorMap[value] || "border-white/10 bg-white/5 text-gray-400"
      }`}
    >
      {value || "UNKNOWN"}
    </span>
  );
};

export const formatDate = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const DONE_STATUSES = new Set([
  "RESOLVED",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
  "DISMISSED",
]);

export const SummaryCards = ({ data = [], config = [] }) => {
  const counts = {};
  data.forEach((r) => {
    counts[r.status] = (counts[r.status] || 0) + 1;
  });

  const actionKey = config[0]?.key;
  const midKeys = config
    .slice(1, -1)
    .filter((c) => !DONE_STATUSES.has(c.key) && c.key !== "ALL")
    .map((c) => c.key);
  const doneKeys = config.filter((c) => DONE_STATUSES.has(c.key)).map((c) => c.key);

  const cards = [
    {
      label: "Total",
      value: data.length,
      textColor: "text-[var(--text-primary)]",
      border: "border-[var(--border-subtle)]",
    },
    {
      label: "Needs Action",
      value: actionKey ? counts[actionKey] || 0 : 0,
      textColor: "text-amber-300",
      border: "border-amber-400/20",
    },
    {
      label: "In Progress",
      value: midKeys.reduce((s, k) => s + (counts[k] || 0), 0),
      textColor: "text-sky-300",
      border: "border-sky-400/20",
    },
    {
      label: "Completed",
      value: doneKeys.reduce((s, k) => s + (counts[k] || 0), 0),
      textColor: "text-emerald-300",
      border: "border-emerald-400/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-2xl border ${card.border} bg-[var(--surface-elevated)] px-4 py-3`}
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            {card.label}
          </p>
          <p className={`mt-0.5 text-2xl font-black ${card.textColor}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export const StatusTabBar = ({ data = [], config = [], activeKey, onChange }) => {
  const counts = { ALL: data.length };
  data.forEach((r) => {
    counts[r.status] = (counts[r.status] || 0) + 1;
  });

  return (
    <div
      className="flex w-full min-w-0 flex-wrap gap-1.5 pb-1"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {config.map((tab) => {
        const count = tab.key === "ALL" ? data.length : counts[tab.key] || 0;
        const isActive = activeKey === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex shrink-0 rounded-full px-3 py-2 text-[10px] sm:h-8 sm:px-3.5 sm:py-0 font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
              isActive
                ? "bg-[var(--accent-primary)] text-[#070707] shadow-sm"
                : "border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label} ({count})
          </button>
        );
      })}
    </div>
  );
};

export const ModuleEmptyState = ({ statusKey, moduleLabel }) => {
  const isActionable = !DONE_STATUSES.has(statusKey) && statusKey !== "ALL";
  if (isActionable) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/5 py-12 text-center">
        <FiCheckCircle size={26} className="text-emerald-400" />
        <p className="text-sm font-semibold text-emerald-300">Everything is up to date</p>
        <p className="text-xs text-[var(--text-muted)]">
          No {moduleLabel} items require your attention right now.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] py-12 text-center">
      <FiClock size={26} className="text-[var(--text-muted)]" />
      <p className="text-sm font-semibold text-[var(--text-secondary)]">No records found</p>
      <p className="text-xs text-[var(--text-muted)]">
        No {moduleLabel} records{statusKey !== "ALL" ? " with this status" : ""} yet.
      </p>
    </div>
  );
};

export const SearchBar = ({ value, onChange, placeholder = "Search..." }) => (
  <div className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3">
    <FiSearch size={13} className="text-[var(--text-muted)] shrink-0" />
    <input
      className="h-9 min-w-0 flex-1 border-none bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export const ModuleFilters = ({
  data = [],
  config = [],
  activeKey,
  onTabChange,
  searchValue,
  onSearch,
  searchPlaceholder,
}) => (
  <div className="flex flex-col gap-2">
    <StatusTabBar data={data} config={config} activeKey={activeKey} onChange={onTabChange} />
    <SearchBar value={searchValue} onChange={onSearch} placeholder={searchPlaceholder} />
  </div>
);
