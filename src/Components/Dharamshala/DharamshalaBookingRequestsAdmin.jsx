import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FiRefreshCw } from "react-icons/fi";
import { FaCheck, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import { apiConnector } from "../../services/apiConnector";
import { dharamshalaBookingV2Endpoints as API } from "../../services/apis.jsx";
import { Button, StatusBadge } from "../Core/DashBoard/RightPart/DharamshalaAdmin/common.jsx";
import { downloadDharamshalaReceipt } from "./dharamshalaReceiptPdf.js";

const STATUS_FILTERS = [
  { value: "PENDING_REVIEW", label: "Needs Review" },
  { value: "PENDING_MEMBERSHIP", label: "Membership Review" },
  { value: "AWAITING_PAYMENT", label: "Awaiting Payment" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "ALL", label: "All Requests" },
];

const formatMoney = (paise) =>
  paise == null ? "—" : `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function DharamshalaBookingRequestsAdmin() {
  const token = useSelector((state) => state.auth.token);
  const [status, setStatus] = useState("PENDING_REVIEW");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [ledgerById, setLedgerById] = useState({});
  const [detailLoadingId, setDetailLoadingId] = useState(null);

  const loadBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = status === "ALL" ? { limit: 100 } : { status, limit: 100 };
      const response = await apiConnector("GET", API.ADMIN_LIST_BOOKINGS_API, null, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setBookings(response.data?.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Could not load new Dharamshala booking requests"
      );
    } finally {
      setLoading(false);
    }
  }, [status, token]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const toggleDetails = async (booking) => {
    if (detailId === booking._id) {
      setDetailId(null);
      return;
    }
    setDetailId(booking._id);
    if (ledgerById[booking._id]) return;
    setDetailLoadingId(booking._id);
    try {
      const response = await apiConnector("GET", API.GET_LEDGER_API(booking._id), null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLedgerById((current) => ({
        ...current,
        [booking._id]: response.data?.data?.ledger || [],
      }));
    } catch (error) {
      setDetailId(null);
      toast.error(error.response?.data?.message || "Could not load booking transactions");
    } finally {
      setDetailLoadingId(null);
    }
  };

  const downloadReceipt = async (booking, ledgerId) => {
    try {
      const response = await apiConnector("GET", API.GET_RECEIPT_API(booking._id, ledgerId), null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      downloadDharamshalaReceipt(response.data?.data);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Could not download receipt");
    }
  };

  const review = async (booking, action) => {
    const rejectionReason = action === "reject"
      ? window.prompt("Enter a reason for rejecting this booking:")
      : null;
    if (action === "reject" && !rejectionReason?.trim()) {
      if (rejectionReason !== null) toast.error("A rejection reason is required");
      return;
    }

    setBusyId(booking._id);
    try {
      const endpoint = action === "approve"
        ? API.ADMIN_APPROVE_BOOKING_API(booking._id)
        : API.ADMIN_REJECT_BOOKING_API(booking._id);
      await apiConnector("POST", endpoint, action === "reject" ? { reason: rejectionReason.trim() } : {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(action === "approve" ? "Booking request approved" : "Booking request rejected");
      await loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || `Could not ${action} booking request`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mb-5 grid gap-4 rounded-2xl border border-[var(--accent-primary)]/25 bg-[var(--surface-elevated)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-[var(--text-primary)]">New Booking Requests</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Requests submitted through the updated room-booking flow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="ka-input !w-auto !py-2 text-xs"
            aria-label="Filter new booking requests by status"
          >
            {STATUS_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>
          <Button icon={FiRefreshCw} onClick={loadBookings} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">Loading booking requests…</p>
      ) : bookings.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-[var(--text-muted)]">
          No requests in this status.
        </p>
      ) : (
        <div className="grid gap-3">
          {bookings.map((booking) => {
            const canApprove = booking.bookingStatus === "PENDING_APPROVAL";
            const canReject = ["PENDING_APPROVAL", "PENDING_MEMBERSHIP"].includes(booking.bookingStatus);
            return (
              <article key={booking._id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="font-mono text-xs text-[var(--text-secondary)]">
                        {booking.bookingRef || booking._id}
                      </strong>
                      <StatusBadge value={booking.bookingStatus} />
                    </div>
                    <h3 className="mt-2 font-bold text-[var(--text-primary)]">
                      {booking.dharamshalaName || "Dharamshala"} — {booking.roomTypeName || "Room"}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {booking.bookerName || "Guest"}{booking.bookerEmail ? ` · ${booking.bookerEmail}` : ""}
                      {booking.bookerPhone ? ` · ${booking.bookerPhone}` : ""}
                    </p>
                  </div>
                  <div className="text-right text-xs text-[var(--text-secondary)]">
                    <p>{formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}</p>
                    <p className="mt-1">{booking.roomsRequested} room(s) · {booking.guestsTotal} guest(s)</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-3">
                  <div className="text-xs text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)]">Total: {formatMoney(booking.pricing?.totalPaise)}</span>
                    <span> · Paid: {formatMoney(booking.paidPaise || 0)}</span>
                    <span> · Balance: {formatMoney(Math.max(0, (booking.pricing?.totalPaise || 0) - (booking.paidPaise || 0)))}</span>
                    {booking.purpose && <span> · Purpose: {booking.purpose}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => toggleDetails(booking)} disabled={detailLoadingId === booking._id}>
                      {detailLoadingId === booking._id ? "Loading…" : detailId === booking._id ? "Hide details" : "Booking details"}
                    </Button>
                    {(canApprove || canReject) && (
                    <>
                      {canApprove && (
                        <Button
                          icon={FaCheck}
                          tone="success"
                          disabled={Boolean(busyId)}
                          onClick={() => review(booking, "approve")}
                        >
                          {busyId === booking._id ? "Processing…" : "Approve"}
                        </Button>
                      )}
                      {canReject && (
                        <Button
                          icon={FaTimes}
                          tone="danger"
                          disabled={Boolean(busyId)}
                          onClick={() => review(booking, "reject")}
                        >
                          Reject
                        </Button>
                      )}
                    </>
                    )}
                  </div>
                </div>
                {detailId === booking._id && (
                  <div className="mt-4 grid gap-4 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--text-secondary)] lg:grid-cols-2">
                    <div className="grid content-start gap-2">
                      <h4 className="font-bold text-[var(--text-primary)]">Booking & pricing</h4>
                      <p>Source: {booking.bookingSource || "ONLINE"} · Tier: {booking.pricing?.tier || "PUBLIC"}</p>
                      <p>Subtotal: {formatMoney(booking.pricing?.subtotalPaise)} · Tax: {formatMoney(booking.pricing?.taxPaise || 0)}</p>
                      <p>Advance required: {formatMoney(booking.pricing?.advancePaise)} · Nights: {booking.pricing?.nights ?? "—"}</p>
                      <p>Special requests: {booking.specialRequests || "None"}</p>
                      <button className="w-fit rounded-lg border border-[var(--border-subtle)] px-3 py-2 font-semibold text-[var(--text-primary)] hover:border-[var(--accent-primary)]"
                        onClick={() => downloadReceipt(booking)}>
                        Download booking receipt
                      </button>
                    </div>
                    <div className="grid content-start gap-2">
                      <h4 className="font-bold text-[var(--text-primary)]">Payment ledger</h4>
                      {(ledgerById[booking._id] || []).length === 0 ? (
                        <p>No transaction entries recorded.</p>
                      ) : (ledgerById[booking._id] || []).map((entry) => (
                        <div key={entry._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] p-2">
                          <span>{entry.type?.replace(/_/g, " ")} · {entry.status}</span>
                          <span>{formatMoney(entry.amountPaise)}</span>
                          {entry.status === "SUCCESS" && ["PAYMENT", "CASH_COLLECTION"].includes(entry.type) && (
                            <button className="font-semibold text-[var(--accent-primary)]" onClick={() => downloadReceipt(booking, entry._id)}>
                              Receipt
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="grid content-start gap-2 lg:col-span-2">
                      <h4 className="font-bold text-[var(--text-primary)]">Status history</h4>
                      {(booking.statusHistory || []).length === 0 ? <p>No status history available.</p> : (
                        <ol className="grid gap-2 sm:grid-cols-2">
                          {booking.statusHistory.map((item, index) => (
                            <li key={`${item.status}-${item.changedAt}-${index}`} className="rounded-lg border border-[var(--border-subtle)] p-2">
                              <strong className="text-[var(--text-primary)]">{item.status?.replace(/_/g, " ")}</strong>
                              <span> · {item.changedAt ? new Date(item.changedAt).toLocaleString("en-IN") : "Date unavailable"}</span>
                              {item.note && <p className="mt-1">{item.note}</p>}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
