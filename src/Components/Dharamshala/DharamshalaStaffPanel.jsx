/**
 * DharamshalaStaffPanel.jsx — Enhanced Phase 6-7 Staff Panel
 *
 * Functionality preserved:
 * - Today board: arriving / departing / in-house
 * - Check-in / check-out / no-show
 * - Cash balance collection
 * - Booking search + status filter
 * - Revenue reports + filters
 * - Booking CSV export
 * - Audit log
 *
 * UI upgraded only — API endpoints and existing business actions are preserved.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import {
  FiRefreshCw,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiDownload,
  FiBarChart2,
  FiUser,
  FiClock,
  FiAlertTriangle,
  FiHome,
  FiCalendar,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import toast from "react-hot-toast";
import { apiConnector } from "../../services/apiConnector";
import {
  dharamshalaAdminEndpoints,
  dharamshalaBookingV2Endpoints as API,
} from "../../services/apis.jsx";
import { StatusBadge } from "./DharamshalaBookingV2";

const fmt = (p) =>
  p == null
    ? "—"
    : `₹${(p / 100).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}`;

const safeNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

const formatStatus = (status = "") => status.replace(/_/g, " ");

const getInitials = (name = "Guest") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "G";

const getGuestBalance = (booking) =>
  Math.max(
    0,
    safeNumber(booking?.pricing?.totalPaise) - safeNumber(booking?.paidPaise)
  );

/* ─────────────────────────────────────────────────────────────────────────────
 * Booking card
 * ──────────────────────────────────────────────────────────────────────────── */
const BookingCard = ({
  booking,
  onCheckIn,
  onCheckOut,
  onNoShow,
  onCollectBalance,
  busyId,
}) => {
  const busy = busyId === booking._id;
  const balancePaise = getGuestBalance(booking);
  const guestName = booking.bookerName || "Guest";

  return (
    <article className="sp-booking-card">
      <div className="sp-booking-top">
        <div className="sp-booking-identity">
          <div className="sp-avatar" aria-hidden="true">
            {getInitials(guestName)}
          </div>

          <div className="sp-booking-main">
            <div className="sp-booking-ref">{booking.bookingRef || "NO-REF"}</div>
            <div className="sp-booking-name">{guestName}</div>
            <div className="sp-booking-meta">
              {booking.roomTypeName || "Room"} · {booking.roomsRequested || 0}R ·{" "}
              {booking.guestsTotal || 0}G
            </div>
            {booking.bookerPhone && (
              <div className="sp-booking-phone">{booking.bookerPhone}</div>
            )}
          </div>
        </div>

        <StatusBadge status={booking.bookingStatus} />
      </div>

      <div className="sp-booking-finance">
        <div>
          <span>Check-in</span>
          <strong>{booking.checkIn || "—"}</strong>
        </div>
        <div>
          <span>Check-out</span>
          <strong>{booking.checkOut || "—"}</strong>
        </div>
        <div>
          <span>Paid</span>
          <strong className="sp-money-positive">{fmt(booking.paidPaise)}</strong>
        </div>
        <div>
          <span>Balance</span>
          <strong className={balancePaise > 0 ? "sp-money-warning" : "sp-money-positive"}>
            {fmt(balancePaise)}
          </strong>
        </div>
      </div>

      <div className="sp-booking-actions">
        {booking.bookingStatus === "CONFIRMED" && (
          <>
            <button
              type="button"
              className="sp-action-btn sp-action-green"
              disabled={busy}
              onClick={() => onCheckIn(booking)}
            >
              {busy ? <FiLoader className="spin" /> : <FiCheckCircle size={14} />}
              Check In
            </button>

            <button
              type="button"
              className="sp-action-btn sp-action-red"
              disabled={busy}
              onClick={() => onNoShow(booking)}
            >
              {busy ? <FiLoader className="spin" /> : <FiXCircle size={14} />}
              No Show
            </button>
          </>
        )}

        {booking.bookingStatus === "CHECKED_IN" && (
          <>
            {balancePaise > 0 && (
              <button
                type="button"
                className="sp-action-btn sp-action-green"
                disabled={busy}
                onClick={() => onCollectBalance(booking, balancePaise)}
              >
                {busy ? <FiLoader className="spin" /> : <FaRupeeSign size={12} />}
                Collect Balance
              </button>
            )}

            <button
              type="button"
              className="sp-action-btn sp-action-purple"
              disabled={busy || balancePaise > 0}
              onClick={() => onCheckOut(booking)}
            >
              {busy ? <FiLoader className="spin" /> : <FiCheckCircle size={14} />}
              Check Out
            </button>
          </>
        )}

        {booking.bookingStatus === "CONFIRMED" && balancePaise > 0 && (
          <button
            type="button"
            className="sp-action-btn sp-action-green"
            disabled={busy}
            onClick={() => onCollectBalance(booking, balancePaise)}
          >
            {busy ? <FiLoader className="spin" /> : <FaRupeeSign size={12} />}
            Collect Balance
          </button>
        )}
      </div>
    </article>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
 * Revenue card
 * ──────────────────────────────────────────────────────────────────────────── */
const RevCard = ({ label, value, sub, color }) => (
  <div className="sp-rev-card" style={{ "--accent": color }}>
    <div className="sp-rev-accent" />
    <div className="sp-rev-label">{label}</div>
    <div className="sp-rev-value" style={{ color }}>
      {value}
    </div>
    {sub && <div className="sp-rev-sub">{sub}</div>}
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
 * Main Staff Panel
 * ──────────────────────────────────────────────────────────────────────────── */
export default function DharamshalaStaffPanel({ refreshKey = 0 }) {
  const token = useSelector((s) => s.auth.token);
  const authH = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const [tab, setTab] = useState("today");
  const [busyId, setBusyId] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Today board
  const [todayData, setTodayData] = useState(null);
  const [todayLoading, setTodayLoading] = useState(false);

  // Search
  const [searchQ, setSearchQ] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  // Revenue
  const [revenue, setRevenue] = useState(null);
  const [revLoading, setRevLoading] = useState(false);
  const [revenueFilters, setRevenueFilters] = useState({
    dateFrom: "",
    dateTo: "",
    dharamshalaId: "",
    roomTypeId: "",
    paymentMethod: "",
    status: "",
    tier: "",
    source: "",
  });
  const [reportProperties, setReportProperties] = useState([]);
  const [reportRoomTypes, setReportRoomTypes] = useState([]);

  // Audit
  const [auditEntries, setAuditEntries] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditQ, setAuditQ] = useState("");

  const getRevenueQuery = useCallback(() => {
    const params = new URLSearchParams();

    Object.entries(revenueFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    return params.toString();
  }, [revenueFilters]);

  useEffect(() => {
    if (tab !== "revenue" || !token || reportProperties.length) return;

    let active = true;

    apiConnector(
      "GET",
      dharamshalaAdminEndpoints.LIST_PROPERTIES_API,
      null,
      authH
    )
      .then((res) => {
        if (active) {
          setReportProperties(res.data?.data?.dharamshalas || []);
        }
      })
      .catch((err) => {
        if (active) {
          toast.error(
            err.response?.data?.message ||
              "Could not load properties for revenue filters"
          );
        }
      });

    return () => {
      active = false;
    };
  }, [tab, token, reportProperties.length, authH]);

  const handleReportPropertyChange = async (propertyId) => {
    setRevenueFilters((filters) => ({
      ...filters,
      dharamshalaId: propertyId,
      roomTypeId: "",
    }));

    setReportRoomTypes([]);

    if (!propertyId) return;

    try {
      const res = await apiConnector(
        "GET",
        dharamshalaAdminEndpoints.GET_PROPERTY_API(propertyId),
        null,
        authH
      );

      setReportRoomTypes(res.data?.data?.roomTypes || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not load room types"
      );
    }
  };

  const loadTodayBoard = useCallback(async () => {
    setTodayLoading(true);

    try {
      const res = await apiConnector(
        "GET",
        API.STAFF_TODAY_API,
        null,
        authH
      );

      setTodayData(res.data?.data || null);
      setLastRefreshed(new Date());
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load today board"
      );
    } finally {
      setTodayLoading(false);
    }
  }, [authH]);

  const loadRevenue = useCallback(async () => {
    setRevLoading(true);

    try {
      const query = getRevenueQuery();

      const res = await apiConnector(
        "GET",
        `${API.REPORT_REVENUE_API}${query ? `?${query}` : ""}`,
        null,
        authH
      );

      setRevenue(res.data?.data || null);
      setLastRefreshed(new Date());
    } catch (err) {
      toast.error(err.response?.data?.message || "Revenue load failed");
    } finally {
      setRevLoading(false);
    }
  }, [authH, getRevenueQuery]);

  const loadAudit = useCallback(async () => {
    setAuditLoading(true);

    try {
      const url = auditQ
        ? `${API.REPORT_AUDIT_API}?bookingRef=${encodeURIComponent(auditQ)}`
        : API.REPORT_AUDIT_API;

      const res = await apiConnector("GET", url, null, authH);

      setAuditEntries(res.data?.data?.entries || []);
      setLastRefreshed(new Date());
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Audit log load failed"
      );
    } finally {
      setAuditLoading(false);
    }
  }, [auditQ, authH]);

  useEffect(() => {
    if (tab === "today") loadTodayBoard();
    if (tab === "revenue") loadRevenue();
    if (tab === "audit") loadAudit();
  }, [tab, refreshKey, loadTodayBoard, loadRevenue, loadAudit]);

  useEffect(() => {
    if (tab !== "search") return;

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setSearching(true);

      try {
        const params = new URLSearchParams();

        if (searchQ) params.set("q", searchQ);
        if (searchStatus) params.set("status", searchStatus);

        const res = await apiConnector(
          "GET",
          `${API.STAFF_SEARCH_API}?${params.toString()}`,
          null,
          authH
        );

        setSearchResults(res.data?.data || []);
        setLastRefreshed(new Date());
      } catch (err) {
        toast.error(err.response?.data?.message || "Search failed");
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [searchQ, searchStatus, tab, authH]);

  const doAction = async (booking, action) => {
    setBusyId(booking._id);

    try {
      const urlMap = {
        checkin: API.STAFF_CHECKIN_API(booking._id),
        checkout: API.STAFF_CHECKOUT_API(booking._id),
        noshow: API.STAFF_NOSHOW_API(booking._id),
      };

      await apiConnector("POST", urlMap[action], {}, authH);

      toast.success(
        `${action.charAt(0).toUpperCase() + action.slice(1)} recorded!`
      );

      if (tab === "today") await loadTodayBoard();

      if (tab === "search") {
        setSearchResults((previous) =>
          previous.map((bookingItem) =>
            bookingItem._id === booking._id
              ? {
                  ...bookingItem,
                  bookingStatus:
                    action === "checkin"
                      ? "CHECKED_IN"
                      : action === "checkout"
                      ? "COMPLETED"
                      : "NO_SHOW",
                }
              : bookingItem
          )
        );
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || `${action} failed`
      );
    } finally {
      setBusyId(null);
    }
  };

  const collectBalance = async (booking, amountPaise) => {
    const amount = fmt(amountPaise);

    if (
      !window.confirm(
        `Record ${amount} cash balance collection for ${booking.bookingRef}?`
      )
    ) {
      return;
    }

    setBusyId(booking._id);

    try {
      const randomId =
        window.crypto?.randomUUID?.() ||
        `${Date.now()}_${Math.random().toString(36).slice(2)}`;

      await apiConnector(
        "POST",
        API.ADMIN_COLLECT_API(booking._id),
        {
          amountPaise,
          note: "Cash balance collected at Dharamshala",
          idempotencyKey: `CASH_${booking._id}_${randomId}`,
        },
        authH
      );

      toast.success(`${amount} cash payment recorded`);

      if (tab === "today") {
        await loadTodayBoard();
      }

      if (tab === "search") {
        setSearchResults((current) =>
          current.map((item) =>
            item._id === booking._id
              ? {
                  ...item,
                  paidPaise:
                    safeNumber(item.paidPaise) + amountPaise,
                }
              : item
          )
        );
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Could not record cash collection"
      );
    } finally {
      setBusyId(null);
    }
  };

  const downloadCSV = async () => {
    try {
      const params = new URLSearchParams(getRevenueQuery());
      params.set("format", "csv");

      const res = await apiConnector(
        "GET",
        `${API.REPORT_BOOKINGS_API}?${params.toString()}`,
        null,
        authH
      );

      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `dharamshala-bookings-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("CSV downloaded");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "CSV download failed"
      );
    }
  };

  const todayLists = useMemo(
    () => ({
      arriving: todayData?.arriving || [],
      departing: todayData?.departing || [],
      inHouse: todayData?.inHouse || [],
    }),
    [todayData]
  );

  const todayStats = useMemo(() => {
    const all = [
      ...todayLists.arriving,
      ...todayLists.departing,
      ...todayLists.inHouse,
    ];

    const unique = new Map(all.map((booking) => [booking._id, booking]));

    const pendingBalance = [...unique.values()].reduce(
      (sum, booking) => sum + getGuestBalance(booking),
      0
    );

    return {
      arriving: todayLists.arriving.length,
      departing: todayLists.departing.length,
      inHouse: todayLists.inHouse.length,
      pendingBalance,
    };
  }, [todayLists]);

  const TABS = [
    {
      key: "today",
      label: "Today Board",
      icon: <FiClock size={15} />,
    },
    {
      key: "search",
      label: "Search Bookings",
      icon: <FiSearch size={15} />,
    },
    {
      key: "revenue",
      label: "Revenue",
      icon: <FiBarChart2 size={15} />,
    },
    {
      key: "audit",
      label: "Audit Log",
      icon: <FiUser size={15} />,
    },
  ];

  const renderBookingCard = (booking) => (
    <BookingCard
      key={booking._id}
      booking={booking}
      busyId={busyId}
      onCheckIn={(bk) => doAction(bk, "checkin")}
      onCheckOut={(bk) => doAction(bk, "checkout")}
      onNoShow={(bk) => doAction(bk, "noshow")}
      onCollectBalance={collectBalance}
    />
  );

  return (
    <div className="sp-root">
      <div className="sp-shell">
        {/* Header */}
        <header className="sp-header">
          <div className="sp-header-copy">
            <div className="sp-eyebrow">
              <span className="sp-live-dot" />
              Dharamshala Staff Console
            </div>

            <h2 className="sp-title">Operations Dashboard</h2>

            <p className="sp-subtitle">
              Manage today&apos;s guests, bookings, collections and operational
              reports from one place.
            </p>
          </div>

          <div className="sp-header-meta">
            <div className="sp-secure-badge">
              <span className="sp-secure-icon">✓</span>
              Staff Access
            </div>

            {lastRefreshed && (
              <span className="sp-last-refresh">
                Updated {lastRefreshed.toLocaleTimeString("en-IN")}
              </span>
            )}
          </div>
        </header>

        {/* Navigation */}
        <nav className="sp-tabs" aria-label="Staff panel sections">
          <div className="sp-tab-scroll">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`sp-tab ${tab === t.key ? "active" : ""}`}
                onClick={() => setTab(t.key)}
              >
                <span className="sp-tab-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="sp-export-btn"
            onClick={downloadCSV}
            title="Download bookings CSV"
          >
            <FiDownload size={15} />
            <span>Export CSV</span>
          </button>
        </nav>

        {/* ───────────────────────── Today ───────────────────────── */}
        {tab === "today" && (
          <section className="sp-section">
            <div className="sp-section-head">
              <div>
                <div className="sp-section-kicker">
                  <FiCalendar size={12} />
                  OPERATIONS
                </div>
                <h3 className="sp-section-title">
                  Today&apos;s Stay Board
                </h3>
                <p className="sp-section-description">
                  Live overview of arrivals, departures and guests currently
                  staying.
                </p>
              </div>

              <button
                type="button"
                className="sp-refresh"
                onClick={loadTodayBoard}
                disabled={todayLoading}
              >
                <FiRefreshCw
                  className={todayLoading ? "spin" : ""}
                  size={14}
                />
                Refresh
              </button>
            </div>

            <div className="sp-date-strip">
              <div className="sp-date-icon">
                <FiCalendar size={17} />
              </div>
              <div>
                <span>Business date</span>
                <strong>
                  {todayData?.date ||
                    new Date().toISOString().split("T")[0]}
                </strong>
              </div>
              <div className="sp-date-divider" />
              <div className="sp-date-status">
                <span className="sp-live-dot" />
                Live operations
              </div>
            </div>

            <div className="sp-kpi-grid">
              <div className="sp-kpi-card">
                <div className="sp-kpi-icon sp-kpi-green">
                  <FiCalendar size={17} />
                </div>
                <div>
                  <span>Arrivals</span>
                  <strong>{todayStats.arriving}</strong>
                  <small>Expected today</small>
                </div>
              </div>

              <div className="sp-kpi-card">
                <div className="sp-kpi-icon sp-kpi-amber">
                  <FiClock size={17} />
                </div>
                <div>
                  <span>Departures</span>
                  <strong>{todayStats.departing}</strong>
                  <small>Checkout today</small>
                </div>
              </div>

              <div className="sp-kpi-card">
                <div className="sp-kpi-icon sp-kpi-purple">
                  <FiHome size={17} />
                </div>
                <div>
                  <span>In House</span>
                  <strong>{todayStats.inHouse}</strong>
                  <small>Currently staying</small>
                </div>
              </div>

              <div className="sp-kpi-card">
                <div className="sp-kpi-icon sp-kpi-orange">
                  <FaRupeeSign size={15} />
                </div>
                <div>
                  <span>Pending Balance</span>
                  <strong>{fmt(todayStats.pendingBalance)}</strong>
                  <small>Across today&apos;s board</small>
                </div>
              </div>
            </div>

            {todayLoading && (
              <div className="sp-state-card">
                <div className="sp-loader-ring">
                  <FiLoader className="spin" size={18} />
                </div>
                <div>
                  <strong>Loading today&apos;s board</strong>
                  <span>Fetching the latest booking information…</span>
                </div>
              </div>
            )}

            {!todayLoading && todayData && (
              <div className="sp-today-grid">
                {[
                  {
                    key: "arriving",
                    label: "Arriving Today",
                    helper: "Guests expected to check in",
                    color: "#10b981",
                    soft: "#ecfdf5",
                    list: todayLists.arriving,
                  },
                  {
                    key: "departing",
                    label: "Departing Today",
                    helper: "Guests scheduled to check out",
                    color: "#f59e0b",
                    soft: "#fffbeb",
                    list: todayLists.departing,
                  },
                  {
                    key: "inHouse",
                    label: "In House",
                    helper: "Guests currently staying",
                    color: "#7c3aed",
                    soft: "#f5f3ff",
                    list: todayLists.inHouse,
                  },
                ].map(({ key, label, helper, color, soft, list }) => (
                  <div key={key} className="sp-today-col">
                    <div
                      className="sp-col-header"
                      style={{
                        "--col-color": color,
                        "--col-soft": soft,
                      }}
                    >
                      <div className="sp-col-title-wrap">
                        <span className="sp-col-dot" />
                        <div>
                          <strong>{label}</strong>
                          <small>{helper}</small>
                        </div>
                      </div>
                      <span
                        className="sp-col-count"
                        style={{ background: color }}
                      >
                        {list.length}
                      </span>
                    </div>

                    {!list.length && (
                      <div className="sp-col-empty">
                        <div className="sp-empty-icon">
                          <FiCheckCircle size={18} />
                        </div>
                        <strong>All clear</strong>
                        <span>No guests in this queue.</span>
                      </div>
                    )}

                    {list.map(renderBookingCard)}
                  </div>
                ))}
              </div>
            )}

            {!todayLoading && !todayData && (
              <div className="sp-state-card sp-state-error">
                <div className="sp-loader-ring">
                  <FiAlertTriangle size={18} />
                </div>
                <div>
                  <strong>Today board unavailable</strong>
                  <span>Try refreshing to load the latest data.</span>
                </div>
                <button type="button" onClick={loadTodayBoard}>
                  Try again
                </button>
              </div>
            )}
          </section>
        )}

        {/* ───────────────────────── Search ───────────────────────── */}
        {tab === "search" && (
          <section className="sp-section">
            <div className="sp-section-head">
              <div>
                <div className="sp-section-kicker">
                  <FiSearch size={12} />
                  BOOKING LOOKUP
                </div>
                <h3 className="sp-section-title">Search Bookings</h3>
                <p className="sp-section-description">
                  Find a booking using reference, guest name, phone or email.
                </p>
              </div>
            </div>

            <div className="sp-search-panel">
              <div className="sp-search-main">
                <FiSearch className="sp-search-icon" size={17} />
                <input
                  className="sp-search-input"
                  placeholder="Search by reference, name, phone or email…"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  aria-label="Search bookings"
                />
                {searchQ && (
                  <button
                    type="button"
                    className="sp-clear-search"
                    onClick={() => setSearchQ("")}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <select
                className="sp-select"
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
                aria-label="Booking status"
              >
                <option value="">All statuses</option>
                {[
                  "CONFIRMED",
                  "CHECKED_IN",
                  "AWAITING_PAYMENT",
                  "PENDING_APPROVAL",
                  "COMPLETED",
                  "CANCELLED",
                  "EXPIRED",
                  "NO_SHOW",
                ].map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </div>

            <div className="sp-result-bar">
              <div>
                <strong>
                  {searching ? "Searching…" : `${searchResults.length} result${searchResults.length === 1 ? "" : "s"}`}
                </strong>
                <span>
                  {searchQ
                    ? ` for “${searchQ}”`
                    : " · showing latest matching bookings"}
                </span>
              </div>

              {searching && <FiLoader className="spin" size={16} />}
            </div>

            {searching && (
              <div className="sp-state-card">
                <div className="sp-loader-ring">
                  <FiLoader className="spin" size={18} />
                </div>
                <div>
                  <strong>Searching bookings</strong>
                  <span>Please wait while we fetch matching records…</span>
                </div>
              </div>
            )}

            {!searching && (
              <div className="sp-search-results">
                {searchResults.length === 0 && (
                  <div className="sp-empty-large">
                    <div className="sp-empty-icon sp-empty-icon-large">
                      <FiSearch size={22} />
                    </div>
                    <strong>
                      {searchQ ? "No bookings found" : "No search results"}
                    </strong>
                    <span>
                      {searchQ
                        ? "Try another reference, guest name, phone number or status."
                        : "Start typing above to search the booking database."}
                    </span>
                  </div>
                )}

                {searchResults.map(renderBookingCard)}
              </div>
            )}
          </section>
        )}

        {/* ───────────────────────── Revenue ───────────────────────── */}
        {tab === "revenue" && (
          <section className="sp-section">
            <div className="sp-section-head">
              <div>
                <div className="sp-section-kicker">
                  <FiBarChart2 size={12} />
                  FINANCIAL REPORTING
                </div>
                <h3 className="sp-section-title">
                  Revenue Summary
                  {revenue?.financialYear
                    ? ` · FY ${revenue.financialYear}`
                    : ""}
                </h3>
                <p className="sp-section-description">
                  Review collections, booking value and payment breakdowns.
                </p>
              </div>

              <button
                type="button"
                className="sp-refresh"
                onClick={loadRevenue}
                disabled={revLoading}
              >
                <FiRefreshCw
                  className={revLoading ? "spin" : ""}
                  size={14}
                />
                Refresh report
              </button>
            </div>

            <div className="sp-filter-panel">
              <div className="sp-filter-heading">
                <div>
                  <strong>Report filters</strong>
                  <span>Refine the report without changing booking data.</span>
                </div>
              </div>

              <div className="sp-rev-filters">
                <label>
                  Date from
                  <input
                    type="date"
                    value={revenueFilters.dateFrom}
                    onChange={(e) =>
                      setRevenueFilters((f) => ({
                        ...f,
                        dateFrom: e.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Date to
                  <input
                    type="date"
                    value={revenueFilters.dateTo}
                    onChange={(e) =>
                      setRevenueFilters((f) => ({
                        ...f,
                        dateTo: e.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Property
                  <select
                    value={revenueFilters.dharamshalaId}
                    onChange={(e) =>
                      handleReportPropertyChange(e.target.value)
                    }
                  >
                    <option value="">All properties</option>
                    {reportProperties.map((property) => (
                      <option key={property._id} value={property._id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Room type
                  <select
                    value={revenueFilters.roomTypeId}
                    onChange={(e) =>
                      setRevenueFilters((f) => ({
                        ...f,
                        roomTypeId: e.target.value,
                      }))
                    }
                  >
                    <option value="">All room types</option>
                    {reportRoomTypes.map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Payment method
                  <select
                    value={revenueFilters.paymentMethod}
                    onChange={(e) =>
                      setRevenueFilters((f) => ({
                        ...f,
                        paymentMethod: e.target.value,
                      }))
                    }
                  >
                    <option value="">All methods</option>
                    <option value="ONLINE">Online</option>
                    <option value="CASH">Cash</option>
                  </select>
                </label>

                <label>
                  Booking status
                  <select
                    value={revenueFilters.status}
                    onChange={(e) =>
                      setRevenueFilters((f) => ({
                        ...f,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="">All statuses</option>
                    {[
                      "PENDING_MEMBERSHIP",
                      "PENDING_APPROVAL",
                      "AWAITING_PAYMENT",
                      "CONFIRMED",
                      "CHECKED_IN",
                      "COMPLETED",
                      "REJECTED",
                      "EXPIRED",
                      "CANCELLED",
                      "NO_SHOW",
                    ].map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Price tier
                  <select
                    value={revenueFilters.tier}
                    onChange={(e) =>
                      setRevenueFilters((f) => ({
                        ...f,
                        tier: e.target.value,
                      }))
                    }
                  >
                    <option value="">All tiers</option>
                    <option value="PUBLIC">Public</option>
                    <option value="MEMBER">Member</option>
                  </select>
                </label>

                <label>
                  Booking source
                  <select
                    value={revenueFilters.source}
                    onChange={(e) =>
                      setRevenueFilters((f) => ({
                        ...f,
                        source: e.target.value,
                      }))
                    }
                  >
                    <option value="">All sources</option>
                    <option value="ONLINE">Online</option>
                    <option value="WALK_IN">Walk-in</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </label>
              </div>
            </div>

            {revLoading && (
              <div className="sp-state-card">
                <div className="sp-loader-ring">
                  <FiLoader className="spin" size={18} />
                </div>
                <div>
                  <strong>Loading financial report</strong>
                  <span>Calculating the latest filtered figures…</span>
                </div>
              </div>
            )}

            {revenue && !revLoading && (
              <>
                <div className="sp-revenue-highlight">
                  <div>
                    <span>Net Collected</span>
                    <strong>{fmt(revenue.netCollectedPaise)}</strong>
                    <small>
                      From {revenue.totalBookings || 0} total bookings
                    </small>
                  </div>

                  <div className="sp-revenue-highlight-grid">
                    <div>
                      <span>Total value</span>
                      <strong>{fmt(revenue.totalBookingValuePaise)}</strong>
                    </div>
                    <div>
                      <span>Pending</span>
                      <strong>{fmt(revenue.pendingBalancePaise)}</strong>
                    </div>
                    <div>
                      <span>Refunded</span>
                      <strong>{fmt(revenue.totalRefundedPaise)}</strong>
                    </div>
                  </div>
                </div>

                <div className="sp-rev-grid">
                  <RevCard
                    label="Total Bookings"
                    value={revenue.totalBookings}
                    color="#7c3aed"
                  />
                  <RevCard
                    label="Total Booking Value"
                    value={fmt(revenue.totalBookingValuePaise)}
                    color="#10b981"
                  />
                  <RevCard
                    label="Total Collected"
                    value={fmt(revenue.totalCollectedPaise)}
                    color="#2563eb"
                  />
                  <RevCard
                    label="Online Collected"
                    value={fmt(revenue.onlineCollectedPaise)}
                    color="#0891b2"
                  />
                  <RevCard
                    label="Cash Collected"
                    value={fmt(revenue.cashCollectedPaise)}
                    color="#059669"
                  />
                  <RevCard
                    label="Pending Balance"
                    value={fmt(revenue.pendingBalancePaise)}
                    color="#f59e0b"
                  />
                  <RevCard
                    label="Refunded"
                    value={fmt(revenue.totalRefundedPaise)}
                    color="#ef4444"
                  />
                  <RevCard
                    label="Net Collected"
                    value={fmt(revenue.netCollectedPaise)}
                    color="#4f46e5"
                  />
                  <RevCard
                    label="Partially Paid"
                    value={revenue.partiallyPaidBookings}
                    color="#d97706"
                  />
                  <RevCard
                    label="Fully Paid"
                    value={revenue.fullyPaidBookings}
                    color="#16a34a"
                  />
                  <RevCard
                    label="Confirmed"
                    value={revenue.confirmedBookings}
                    color="#10b981"
                  />
                  <RevCard
                    label="Checked In"
                    value={revenue.checkedInBookings}
                    color="#7c3aed"
                  />
                  <RevCard
                    label="Completed"
                    value={revenue.completedBookings}
                    color="#2563eb"
                  />
                  <RevCard
                    label="Cancelled"
                    value={revenue.cancelledBookings}
                    color="#ef4444"
                  />
                  <RevCard
                    label="No Show"
                    value={revenue.noShowBookings}
                    color="#6b7280"
                  />
                </div>

                <div className="sp-breakdown-grid">
                  {[
                    ["By Status", revenue.byStatus],
                    ["By Price Tier", revenue.byTier],
                    ["By Booking Source", revenue.bySource],
                  ].map(([title, rows]) => (
                    <div className="sp-breakdown-card" key={title}>
                      <div className="sp-breakdown-title">
                        <span>{title}</span>
                        <FiBarChart2 size={14} />
                      </div>

                      <div className="sp-rev-status-grid">
                        {Object.entries(rows || {}).map(([label, count]) => (
                          <div
                            key={label}
                            className="sp-rev-status-item"
                          >
                            <span>{formatStatus(label)}</span>
                            <strong>{count}</strong>
                          </div>
                        ))}

                        {!Object.keys(rows || {}).length && (
                          <span className="sp-no-data">No breakdown data.</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="sp-btn-csv"
                  onClick={downloadCSV}
                >
                  <FiDownload size={15} />
                  Download filtered bookings CSV
                </button>
              </>
            )}
          </section>
        )}

        {/* ───────────────────────── Audit ───────────────────────── */}
        {tab === "audit" && (
          <section className="sp-section">
            <div className="sp-section-head">
              <div>
                <div className="sp-section-kicker">
                  <FiUser size={12} />
                  ACTIVITY & SECURITY
                </div>
                <h3 className="sp-section-title">Audit Log</h3>
                <p className="sp-section-description">
                  Review operational changes made to bookings.
                </p>
              </div>

              <button
                type="button"
                className="sp-refresh"
                onClick={loadAudit}
                disabled={auditLoading}
              >
                <FiRefreshCw
                  className={auditLoading ? "spin" : ""}
                  size={14}
                />
                Refresh
              </button>
            </div>

            <div className="sp-audit-toolbar">
              <div className="sp-search-main sp-audit-search-wrap">
                <FiSearch className="sp-search-icon" size={16} />
                <input
                  className="sp-search-input"
                  placeholder="Filter by booking reference…"
                  value={auditQ}
                  onChange={(e) => setAuditQ(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="sp-search-btn"
                onClick={loadAudit}
                disabled={auditLoading}
              >
                {auditLoading ? (
                  <FiLoader className="spin" size={15} />
                ) : (
                  <FiSearch size={15} />
                )}
                Search
              </button>
            </div>

            {auditLoading && (
              <div className="sp-state-card">
                <div className="sp-loader-ring">
                  <FiLoader className="spin" size={18} />
                </div>
                <div>
                  <strong>Loading audit activity</strong>
                  <span>Fetching the latest audit records…</span>
                </div>
              </div>
            )}

            {!auditLoading && (
              <div className="sp-audit-list">
                {!auditEntries.length && (
                  <div className="sp-empty-large">
                    <div className="sp-empty-icon sp-empty-icon-large">
                      <FiCheckCircle size={22} />
                    </div>
                    <strong>No audit entries found</strong>
                    <span>
                      No activity matches the current booking reference filter.
                    </span>
                  </div>
                )}

                {auditEntries.map((entry, i) => {
                  const actor =
                    entry.actor && typeof entry.actor === "object"
                      ? [entry.actor.firstName, entry.actor.lastName]
                          .filter(Boolean)
                          .join(" ") || entry.actor.email
                      : entry.actor;

                  const changes = [
                    entry.before &&
                      `Before: ${JSON.stringify(entry.before)}`,
                    entry.after &&
                      `After: ${JSON.stringify(entry.after)}`,
                  ]
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <div
                      key={`${entry.bookingRef}-${entry.action}-${entry.at}-${i}`}
                      className="sp-audit-row"
                    >
                      <div className="sp-audit-top">
                        <div>
                          <span className="sp-audit-ref">
                            {entry.bookingRef || "—"}
                          </span>
                          <strong className="sp-audit-action">
                            {formatStatus(entry.action || "ACTIVITY")}
                          </strong>
                        </div>

                        <span className="sp-audit-date">
                          {entry.at
                            ? new Date(entry.at).toLocaleString("en-IN")
                            : ""}
                        </span>
                      </div>

                      <div className="sp-audit-meta">
                        <span>
                          <FiUser size={12} />
                          {actor || "System"}
                        </span>
                        <span>
                          Role: {entry.actorRole || "—"}
                        </span>
                      </div>

                      {entry.note && (
                        <div className="sp-audit-note">
                          <strong>Reason:</strong> {entry.note}
                        </div>
                      )}

                      {changes && (
                        <div className="sp-audit-change">
                          {changes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>

      <style>{`
        .sp-root{
          width:100%;min-width:0;color:var(--text);
          font-family:var(--font-display,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);
        }
        .sp-shell{width:100%;min-width:0;display:flex;flex-direction:column;gap:14px}
        .sp-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:18px;border:1px solid var(--line);border-radius:14px;background:var(--surface-raised);box-shadow:var(--shadow-card);}
        .sp-header-copy{min-width:0}.sp-eyebrow{display:flex;align-items:center;gap:7px;width:max-content;max-width:100%;margin-bottom:6px;padding:4px 8px;border:1px solid var(--brand-glow);border-radius:999px;background:var(--brand-glow);color:var(--brand);font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
        .sp-live-dot{width:7px;height:7px;flex:0 0 7px;border-radius:50%;background:var(--success);box-shadow:0 0 0 4px rgba(16,185,129,.10)}
        .sp-title{margin:0;font-size:20px;line-height:1.2;font-weight:800;letter-spacing:-.02em;color:var(--text)}
        .sp-subtitle{margin:5px 0 0;max-width:720px;color:var(--text-muted);font-size:11px;line-height:1.5}
        .sp-header-meta{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex:0 0 auto}
        .sp-secure-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border:1px solid rgba(16,185,129,.25);border-radius:999px;background:rgba(16,185,129,.08);color:var(--success);font-size:10px;font-weight:800;white-space:nowrap}
        .sp-secure-icon{display:grid;place-items:center;width:16px;height:16px;border-radius:50%;background:var(--success);color:#fff;font-size:9px}.sp-last-refresh{color:var(--text-faint);font-size:9px;white-space:nowrap}

        .sp-tabs{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px;border:1px solid var(--line);border-radius:11px;background:var(--surface-raised);box-shadow:var(--shadow-card)}
        .sp-tab-scroll{display:flex;align-items:center;gap:3px;min-width:0;overflow-x:auto;scrollbar-width:none}.sp-tab-scroll::-webkit-scrollbar{display:none}
        .sp-tab{display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:0 0 auto;min-height:34px;padding:7px 11px;border:1px solid transparent;border-radius:9px;background:transparent;color:var(--text-soft);font:inherit;font-size:11px;font-weight:700;cursor:pointer;transition:all .18s ease;white-space:nowrap}
        .sp-tab:hover{color:var(--brand);background:var(--brand-glow)}.sp-tab.active{color:#fff;background:var(--brand);border-color:var(--brand);box-shadow:0 4px 12px var(--brand-shadow)}.sp-tab-icon{display:inline-flex;align-items:center}
        .sp-export-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:0 0 auto;min-height:34px;padding:7px 11px;border:1px solid rgba(16,185,129,.25);border-radius:9px;background:rgba(16,185,129,.08);color:var(--success);font:inherit;font-size:11px;font-weight:800;cursor:pointer;transition:all .18s ease}.sp-export-btn:hover{background:rgba(16,185,129,.14);transform:translateY(-1px)}

        .sp-section{display:flex;flex-direction:column;gap:12px;min-width:0}.sp-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:14px}.sp-section-kicker{display:flex;align-items:center;gap:5px;margin-bottom:4px;color:var(--brand);font-size:8px;font-weight:900;letter-spacing:.13em}.sp-section-title{margin:0;color:var(--text);font-size:17px;line-height:1.2;font-weight:800;letter-spacing:-.015em}.sp-section-description{margin:4px 0 0;color:var(--text-muted);font-size:10px;line-height:1.5}
        .sp-refresh{display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:0 0 auto;min-height:34px;padding:7px 11px;border:1px solid var(--brand-glow);border-radius:9px;background:var(--brand-glow);color:var(--brand);font:inherit;font-size:10px;font-weight:800;cursor:pointer;transition:all .18s ease}.sp-refresh:hover:not(:disabled){filter:brightness(.97);transform:translateY(-1px)}.sp-refresh:disabled{cursor:not-allowed;opacity:.55}

        .sp-date-strip{display:flex;align-items:center;gap:9px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--surface-raised);box-shadow:var(--shadow-card)}.sp-date-icon{display:grid;place-items:center;width:32px;height:32px;flex:0 0 32px;border-radius:9px;background:var(--brand-glow);color:var(--brand)}.sp-date-strip div:nth-child(2){display:flex;flex-direction:column;gap:2px}.sp-date-strip span{color:var(--text-faint);font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.07em}.sp-date-strip strong{color:var(--text);font-size:11px;font-weight:800}.sp-date-divider{width:1px;height:25px;margin-left:4px;background:var(--line)}.sp-date-status{display:flex;align-items:center;gap:6px;margin-left:auto;color:var(--success);font-size:9px;font-weight:800}

        .sp-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.sp-kpi-card{display:flex;align-items:center;gap:10px;min-width:0;padding:11px;border:1px solid var(--line);border-radius:10px;background:var(--surface-raised);box-shadow:var(--shadow-card);transition:transform .18s ease,box-shadow .18s ease}.sp-kpi-card:hover{transform:translateY(-1px)}.sp-kpi-icon{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;border-radius:9px}.sp-kpi-green{background:rgba(16,185,129,.10);color:var(--success)}.sp-kpi-amber{background:rgba(245,158,11,.10);color:var(--warning)}.sp-kpi-purple{background:var(--brand-glow);color:var(--brand)}.sp-kpi-orange{background:rgba(249,115,22,.10);color:#ea580c}.sp-kpi-card div:last-child{display:flex;flex-direction:column;min-width:0}.sp-kpi-card span{color:var(--text-muted);font-size:9px;font-weight:700}.sp-kpi-card strong{margin-top:2px;color:var(--text);font-size:15px;line-height:1.2;font-weight:850;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sp-kpi-card small{margin-top:2px;color:var(--text-faint);font-size:8px}

        .sp-today-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;align-items:start}.sp-today-col{display:flex;flex-direction:column;gap:8px;min-width:0}.sp-col-header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 11px;border:1px solid var(--line);border-left:3px solid var(--col-color);border-radius:9px;background:var(--col-soft)}.sp-col-title-wrap{display:flex;align-items:center;gap:8px;min-width:0}.sp-col-dot{width:7px;height:7px;flex:0 0 7px;border-radius:50%;background:var(--col-color)}.sp-col-title-wrap div{display:flex;flex-direction:column;min-width:0}.sp-col-title-wrap strong{color:var(--text);font-size:10px;font-weight:850}.sp-col-title-wrap small{margin-top:2px;color:var(--text-faint);font-size:8px}.sp-col-count{display:grid;place-items:center;min-width:23px;height:23px;padding:0 6px;border-radius:999px;color:#fff;font-size:9px;font-weight:900}

        .sp-booking-card{display:flex;flex-direction:column;gap:9px;min-width:0;padding:11px;border:1px solid var(--line);border-radius:10px;background:var(--surface-raised);box-shadow:var(--shadow-card);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}.sp-booking-card:hover{transform:translateY(-1px);border-color:var(--brand);box-shadow:var(--shadow-card)}.sp-booking-top{display:flex;align-items:flex-start;justify-content:space-between;gap:9px}.sp-booking-identity{display:flex;gap:8px;min-width:0}.sp-avatar{display:grid;place-items:center;width:32px;height:32px;flex:0 0 32px;border:1px solid var(--brand-glow);border-radius:8px;background:var(--brand-glow);color:var(--brand);font-size:9px;font-weight:900}.sp-booking-main{min-width:0}.sp-booking-ref{overflow:hidden;color:var(--brand);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:8px;font-weight:800;text-overflow:ellipsis;white-space:nowrap}.sp-booking-name{margin-top:2px;overflow:hidden;color:var(--text);font-size:11px;font-weight:850;text-overflow:ellipsis;white-space:nowrap}.sp-booking-meta{margin-top:2px;color:var(--text-muted);font-size:8px}.sp-booking-phone{margin-top:3px;color:var(--text-soft);font-size:8px;font-weight:700}
        .sp-booking-finance{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;overflow:hidden;border:1px solid var(--line);border-radius:8px;background:var(--line)}.sp-booking-finance div{display:flex;flex-direction:column;gap:3px;min-width:0;padding:6px 7px;background:var(--surface)}.sp-booking-finance span{color:var(--text-faint);font-size:7px;font-weight:700;text-transform:uppercase}.sp-booking-finance strong{overflow:hidden;color:var(--text);font-size:8px;font-weight:800;text-overflow:ellipsis;white-space:nowrap}.sp-money-positive{color:var(--success)!important}.sp-money-warning{color:var(--warning)!important}
        .sp-booking-actions{display:flex;flex-wrap:wrap;gap:5px}.sp-action-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:29px;padding:5px 8px;border:1px solid transparent;border-radius:7px;font:inherit;font-size:8px;font-weight:800;cursor:pointer;transition:all .16s ease}.sp-action-btn:hover:not(:disabled){transform:translateY(-1px)}.sp-action-btn:disabled{opacity:.55;cursor:not-allowed}.sp-action-green{border-color:rgba(16,185,129,.25);background:rgba(16,185,129,.08);color:var(--success)}.sp-action-red{border-color:rgba(239,68,68,.22);background:rgba(239,68,68,.07);color:var(--danger)}.sp-action-purple{border-color:var(--brand-glow);background:var(--brand-glow);color:var(--brand)}
        .sp-col-empty,.sp-empty-large{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:135px;padding:18px;border:1px dashed var(--line);border-radius:10px;background:var(--surface);text-align:center}.sp-col-empty strong,.sp-empty-large strong{color:var(--text-soft);font-size:10px;font-weight:800}.sp-col-empty span,.sp-empty-large span{color:var(--text-faint);font-size:8px}.sp-empty-icon{display:grid;place-items:center;width:33px;height:33px;margin-bottom:2px;border-radius:9px;background:var(--surface-raised);color:var(--text-faint)}
        .sp-state-card{display:flex;align-items:center;gap:10px;padding:13px;border:1px solid var(--line);border-radius:10px;background:var(--surface-raised)}.sp-state-card>div:nth-child(2){display:flex;flex-direction:column;min-width:0}.sp-state-card strong{color:var(--text-soft);font-size:10px;font-weight:800}.sp-state-card span{margin-top:2px;color:var(--text-faint);font-size:8px}.sp-loader-ring{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;border:1px solid var(--brand-glow);border-radius:9px;background:var(--brand-glow);color:var(--brand)}.sp-state-error{border-color:rgba(245,158,11,.3);background:rgba(245,158,11,.06)}.sp-state-error button{margin-left:auto;padding:6px 9px;border:1px solid rgba(245,158,11,.3);border-radius:7px;background:var(--surface-raised);color:var(--warning);font:inherit;font-size:8px;font-weight:800;cursor:pointer}

        .sp-search-panel,.sp-audit-toolbar{display:flex;gap:8px;align-items:center;padding:9px;border:1px solid var(--line);border-radius:10px;background:var(--surface-raised)}.sp-search-main{position:relative;flex:1;min-width:0}.sp-search-icon{position:absolute;left:11px;top:50%;z-index:1;transform:translateY(-50%);color:var(--text-faint)}.sp-search-input{width:100%;min-height:36px;box-sizing:border-box;padding:8px 34px;border:1px solid var(--line);border-radius:8px;outline:none;background:var(--surface);color:var(--text);font:inherit;font-size:10px}.sp-search-input::placeholder{color:var(--text-faint)}.sp-search-input:focus{border-color:var(--brand);box-shadow:0 0 0 3px var(--brand-glow)}.sp-clear-search{position:absolute;right:6px;top:50%;width:23px;height:23px;transform:translateY(-50%);border:0;border-radius:6px;background:var(--surface-raised);color:var(--text-muted);font-size:16px;line-height:1;cursor:pointer}.sp-select{min-height:36px;min-width:145px;padding:7px 9px;border:1px solid var(--line);border-radius:8px;outline:none;background:var(--surface);color:var(--text-soft);font:inherit;font-size:9px;font-weight:700}.sp-select:focus{border-color:var(--brand);box-shadow:0 0 0 3px var(--brand-glow)}.sp-result-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 2px;color:var(--text-faint);font-size:8px}.sp-result-bar strong{color:var(--text-soft);font-size:9px}

        .sp-filter-panel{overflow:hidden;border:1px solid var(--line);border-radius:10px;background:var(--surface-raised)}.sp-filter-heading{padding:10px 12px;border-bottom:1px solid var(--line);background:var(--surface)}.sp-filter-heading div{display:flex;flex-direction:column;gap:2px}.sp-filter-heading strong{color:var(--text-soft);font-size:10px;font-weight:850}.sp-filter-heading span{color:var(--text-faint);font-size:8px}.sp-rev-filters{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:11px}.sp-rev-filters label{display:flex;flex-direction:column;gap:4px;min-width:0;color:var(--text-muted);font-size:8px;font-weight:800}.sp-rev-filters input,.sp-rev-filters select{width:100%;min-width:0;box-sizing:border-box;min-height:32px;padding:6px 7px;border:1px solid var(--line);border-radius:7px;outline:none;background:var(--surface);color:var(--text);font:inherit;font-size:9px}.sp-rev-filters input:focus,.sp-rev-filters select:focus{border-color:var(--brand);box-shadow:0 0 0 3px var(--brand-glow)}

        .sp-revenue-highlight{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:15px;border:1px solid var(--brand-glow);border-radius:11px;background:var(--brand-glow)}.sp-revenue-highlight>div:first-child{display:flex;flex-direction:column}.sp-revenue-highlight span{color:var(--brand);font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.07em}.sp-revenue-highlight strong{margin-top:3px;color:var(--text);font-size:22px;font-weight:900;letter-spacing:-.03em}.sp-revenue-highlight small{margin-top:2px;color:var(--text-faint);font-size:8px}.sp-revenue-highlight-grid{display:grid!important;grid-template-columns:repeat(3,minmax(100px,1fr));gap:6px}.sp-revenue-highlight-grid div{display:flex;flex-direction:column;gap:3px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface-raised)}.sp-revenue-highlight-grid span{color:var(--text-faint);font-size:7px;letter-spacing:.02em}.sp-revenue-highlight-grid strong{margin:0;color:var(--text-soft);font-size:11px;letter-spacing:0}
        .sp-rev-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.sp-rev-card{position:relative;overflow:hidden;display:flex;flex-direction:column;gap:3px;min-width:0;padding:11px;border:1px solid var(--line);border-radius:9px;background:var(--surface-raised);box-shadow:var(--shadow-card)}.sp-rev-accent{position:absolute;left:0;top:0;width:100%;height:2px;background:var(--accent)}.sp-rev-label{margin-top:2px;overflow:hidden;color:var(--text-muted);font-size:7px;font-weight:800;text-overflow:ellipsis;text-transform:uppercase;white-space:nowrap}.sp-rev-value{overflow:hidden;font-size:14px;font-weight:900;line-height:1.2;text-overflow:ellipsis;white-space:nowrap}.sp-rev-sub{color:var(--text-faint);font-size:7px}.sp-breakdown-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.sp-breakdown-card{padding:11px;border:1px solid var(--line);border-radius:9px;background:var(--surface-raised)}.sp-breakdown-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;color:var(--text-soft);font-size:9px;font-weight:850}.sp-breakdown-title svg{color:var(--brand)}.sp-rev-status-grid{display:flex;flex-wrap:wrap;gap:5px}.sp-rev-status-item{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:95px;padding:5px 7px;border:1px solid var(--line);border-radius:6px;background:var(--surface)}.sp-rev-status-item span{overflow:hidden;color:var(--text-muted);font-size:7px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}.sp-rev-status-item strong{color:var(--text);font-size:9px;font-weight:900}.sp-no-data{color:var(--text-faint);font-size:8px}.sp-btn-csv{display:inline-flex;align-items:center;justify-content:center;gap:7px;width:max-content;max-width:100%;min-height:34px;padding:7px 11px;border:1px solid var(--success);border-radius:8px;background:var(--success);color:#fff;font:inherit;font-size:9px;font-weight:850;cursor:pointer;box-shadow:0 4px 12px rgba(16,185,129,.14);transition:all .18s ease}.sp-btn-csv:hover{transform:translateY(-1px)}

        .sp-audit-search-wrap{min-width:0}.sp-search-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:36px;padding:7px 11px;border:1px solid var(--brand);border-radius:8px;background:var(--brand);color:#fff;font:inherit;font-size:9px;font-weight:850;cursor:pointer}.sp-search-btn:hover:not(:disabled){filter:brightness(.94)}.sp-search-btn:disabled{opacity:.55;cursor:not-allowed}.sp-audit-list{display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--line);border-radius:10px;background:var(--surface-raised)}.sp-audit-row{padding:11px 12px;border-bottom:1px solid var(--line);transition:background .16s ease}.sp-audit-row:last-child{border-bottom:0}.sp-audit-row:hover{background:var(--surface)}.sp-audit-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.sp-audit-top>div:first-child{display:flex;align-items:center;gap:7px;min-width:0;flex-wrap:wrap}.sp-audit-ref{padding:3px 5px;border:1px solid var(--brand-glow);border-radius:5px;background:var(--brand-glow);color:var(--brand);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:7px;font-weight:850}.sp-audit-action{color:var(--text-soft);font-size:9px;font-weight:850;text-transform:uppercase}.sp-audit-date{flex:0 0 auto;color:var(--text-faint);font-size:7px}.sp-audit-meta{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:6px;color:var(--text-muted);font-size:7px}.sp-audit-meta span{display:inline-flex;align-items:center;gap:4px}.sp-audit-note{margin-top:7px;padding:7px 8px;border-left:2px solid var(--brand);border-radius:0 6px 6px 0;background:var(--brand-glow);color:var(--text-muted);font-size:8px;line-height:1.5}.sp-audit-note strong{color:var(--text-soft)}.sp-audit-change{margin-top:6px;overflow-wrap:anywhere;padding:7px 8px;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--text-muted);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:7px;line-height:1.5}
        .sp-empty-large{min-height:190px}.sp-empty-icon-large{width:42px;height:42px;margin-bottom:6px}.spin{animation:sp-spin .8s linear infinite}@keyframes sp-spin{to{transform:rotate(360deg)}}

        @media(max-width:1100px){.sp-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sp-today-grid{grid-template-columns:1fr}.sp-rev-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.sp-rev-filters{grid-template-columns:repeat(3,minmax(0,1fr))}.sp-breakdown-grid{grid-template-columns:1fr}}
        @media(max-width:760px){.sp-header{flex-direction:column;padding:14px}.sp-header-meta{align-items:flex-start}.sp-title{font-size:18px}.sp-tabs{align-items:stretch;flex-direction:column}.sp-tab-scroll{width:100%}.sp-export-btn{width:100%}.sp-section-head{align-items:flex-start;flex-direction:column}.sp-refresh{width:100%}.sp-kpi-grid{grid-template-columns:1fr 1fr}.sp-search-panel,.sp-audit-toolbar{flex-direction:column;align-items:stretch}.sp-select,.sp-search-btn{width:100%}.sp-rev-filters{grid-template-columns:1fr 1fr}.sp-rev-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sp-revenue-highlight{align-items:stretch;flex-direction:column}.sp-revenue-highlight-grid{grid-template-columns:1fr 1fr!important}}
        @media(max-width:480px){.sp-shell{gap:11px}.sp-kpi-grid{grid-template-columns:1fr}.sp-rev-filters{grid-template-columns:1fr}.sp-rev-grid{grid-template-columns:1fr 1fr}.sp-revenue-highlight-grid{grid-template-columns:1fr!important}.sp-date-status{display:none}.sp-date-divider{display:none}.sp-booking-actions{display:grid;grid-template-columns:1fr 1fr}.sp-action-btn{width:100%}.sp-audit-top{flex-direction:column}}
      `}</style>
    </div>
  );
}
