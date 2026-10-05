/**
 * MyDharamshalaBookings.jsx — Phase 4-5 Frontend: User Booking History
 * Shows the current user's v2 bookings with status, cancel, pay-now.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  FiCalendar, FiHome, FiUsers, FiLoader, FiX, FiRefreshCw,
  FiAlertCircle, FiCheckCircle, FiClock, FiDollarSign,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import toast from "react-hot-toast";
import { apiConnector } from "../../services/apiConnector";
import { dharamshalaBookingV2Endpoints as API } from "../../services/apis.jsx";
import { StatusBadge } from "./DharamshalaBookingV2";
import { downloadDharamshalaReceipt } from "./dharamshalaReceiptPdf";

const fmt = (p) =>
  p === undefined || p === null ? "—" : `₹${(p / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const loadRazorpay = () =>
  new Promise((res) => {
    if (window.Razorpay) return res(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res(true);
    s.onerror = () => res(false);
    document.body.appendChild(s);
  });

export default function MyDharamshalaBookings() {
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.profile.user);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [busyId, setBusyId]     = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [ledger, setLedger]     = useState({});
  const [ledgerLoading, setLedgerLoading] = useState({});
  const [payingId, setPayingId] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState("");

  const authH = { Authorization: `Bearer ${token}` };

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiConnector("GET", API.MY_BOOKINGS_API, null, authH);
      setBookings(res.data?.data?.bookings || res.data?.data || []);
    } catch (err) {
      toast.error("Could not load bookings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const fetchLedger = async (bookingId, force = false) => {
    if ((!force && ledger[bookingId]) || ledgerLoading[bookingId]) return;
    setLedgerLoading((state) => ({ ...state, [bookingId]: true }));
    try {
      const res = await apiConnector("GET", API.GET_LEDGER_API(bookingId), null, authH);
      setLedger((l) => ({ ...l, [bookingId]: res.data?.data?.ledger || [] }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load payment history");
    } finally {
      setLedgerLoading((state) => ({ ...state, [bookingId]: false }));
    }
  };

  const handleExpand = (id) => {
    const next = expandedId === id ? null : id;
    setExpandedId(next);
    if (next) fetchLedger(next);
  };

  const handleCancel = async (booking) => {
    if (!window.confirm(`Cancel booking ${booking.bookingRef}? This cannot be undone.`)) return;
    setBusyId(booking._id);
    try {
      await apiConnector("POST", API.CANCEL_BOOKING_API(booking._id), { reason: "Cancelled by user" }, authH);
      toast.success("Booking cancelled");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed");
    } finally {
      setBusyId(null);
    }
  };

  const handlePayNow = async (booking) => {
    if (payingId) return;
    setPayingId(booking._id);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Payment gateway could not load");

      const orderRes = await apiConnector("POST", API.CREATE_ORDER_API(booking._id), {}, authH);
      const { orderId, amount, currency, keyId } = orderRes.data?.data || {};
      if (!orderId || !keyId) throw new Error("Payment not configured");

      await new Promise((resolve, reject) => {
        const rz = new window.Razorpay({
          key: keyId,
          amount,
          currency: currency || "INR",
          name:        booking.dharamshalaName || "Samaj Dharamshala",
          description: `${booking.bookingRef}`,
          order_id:    orderId,
          prefill: {
            name:    booking.bookerName || user?.firstName || "",
            email:   booking.bookerEmail || user?.email || "",
            contact: booking.bookerPhone || "",
          },
          theme: { color: "#7c3aed" },
          handler: async (response) => {
            try {
              await apiConnector("POST", API.VERIFY_PAYMENT_API(booking._id), response, authH);
              toast.success("✅ Payment confirmed! Booking is now active.");
              await fetchBookings();
              await fetchLedger(booking._id, true);
              resolve();
            } catch (e) {
              reject(new Error(e.response?.data?.message || "Verification failed"));
            }
          },
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
        });
        rz.open();
      });
    } catch (err) {
      toast.error(err.message || "Payment failed");
    } finally {
      setPayingId(null);
    }
  };

  const handleDownloadReceipt = async (booking, ledgerRow = null) => {
    const key = `${booking._id}:${ledgerRow?._id || "booking"}`;
    setReceiptLoading(key);
    try {
      const res = await apiConnector(
        "GET",
        API.GET_RECEIPT_API(booking._id, ledgerRow?._id),
        null,
        authH
      );
      downloadDharamshalaReceipt(res.data?.data?.receipt);
    } catch (err) {
      toast.error(err.message || err.response?.data?.message || "Could not download receipt");
    } finally {
      setReceiptLoading("");
    }
  };

  const outstanding = (booking) =>
    Math.max(0, (booking.pricing?.totalPaise || 0) - (booking.paidPaise || 0));
  const successfulPayments = (bookingId) =>
    (ledger[bookingId] || []).filter((row) =>
      row.status === "SUCCESS" && ["PAYMENT", "CASH_COLLECTION", "REFUND", "CASH_REFUND"].includes(row.type)
    );

  const canCancel = (b) =>
    !["COMPLETED", "REJECTED", "EXPIRED", "CANCELLED", "NO_SHOW", "CHECKED_IN"].includes(b.bookingStatus);

  if (!token) {
    return (
      <div className="mybk-empty">
        <FiAlertCircle size={40} className="mybk-empty-icon" />
        <p>Please log in to see your bookings.</p>
      </div>
    );
  }

  return (
    <div className="mybk-root">
      <div className="mybk-header">
        <h2 className="mybk-title">My Bookings</h2>
        <button className="mybk-refresh" onClick={fetchBookings} disabled={loading}>
          <FiRefreshCw className={loading ? "spin" : ""} size={16} />
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {loading && (
        <div className="mybk-loading">
          <FiLoader className="spin" size={24} /> Loading your bookings…
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="mybk-empty">
          <FiHome size={48} className="mybk-empty-icon" />
          <p>No bookings yet. Browse dharamshalas to make your first booking!</p>
        </div>
      )}

      {!loading && bookings.map((b) => (
        <div key={b._id} className={`mybk-card ${expandedId === b._id ? "expanded" : ""}`}>
          {/* Card Header */}
          <div className="mybk-card-top" onClick={() => handleExpand(b._id)}>
            <div className="mybk-card-info">
              <div className="mybk-ref">{b.bookingRef}</div>
              <div className="mybk-property">{b.dharamshalaName || "Dharamshala"} · {b.roomTypeName || "Room"}</div>
              <div className="mybk-dates">
                <FiCalendar size={12} /> {b.checkIn} → {b.checkOut} · {b.roomsRequested || 1} room · {b.guestsTotal || 1} guest
              </div>
            </div>
            <div className="mybk-card-right">
              <StatusBadge status={b.bookingStatus} />
              <div className="mybk-amount">{fmt(b.pricing?.totalPaise)}</div>
              {b.pricing?.advancePaise > 0 && (
                <div className="mybk-advance">Advance: {fmt(b.pricing?.advancePaise)}</div>
              )}
            </div>
          </div>

          {/* Expanded detail */}
          {expandedId === b._id && (
            <div className="mybk-detail">
              <div className="mybk-detail-grid">
                <div><span>Nights</span><strong>{b.pricing?.nights || "—"}</strong></div>
                <div><span>Tier</span><strong>{b.pricing?.tier || "—"}</strong></div>
                <div><span>Paid</span><strong className="green">{fmt(b.paidPaise)}</strong></div>
                <div><span>Balance</span><strong className="purple">{fmt(outstanding(b))}</strong></div>
                {b.refundedPaise > 0 && <div><span>Refunded</span><strong className="blue">{fmt(b.refundedPaise)}</strong></div>}
                {b.confirmedAt && <div><span>Confirmed</span><strong>{new Date(b.confirmedAt).toLocaleDateString("en-IN")}</strong></div>}
                <div><span>Payment status</span><strong>{outstanding(b) === 0 ? "PAID" : (b.paidPaise > 0 ? "PARTIALLY PAID" : "UNPAID")}</strong></div>
                <div><span>Booking source</span><strong>{b.bookingSource || "ONLINE"}</strong></div>
                <div><span>Mobile</span><strong>{b.bookerPhone || "—"}</strong></div>
                <div><span>Email</span><strong>{b.bookerEmail || "—"}</strong></div>
                {b.purpose && <div className="span2"><span>Purpose</span><strong>{b.purpose}</strong></div>}
                {b.specialRequests && <div className="span2"><span>Special requests</span><strong>{b.specialRequests}</strong></div>}
              </div>

              {/* Ledger */}
              {ledgerLoading[b._id] && <div className="mybk-ledger-loading">Loading payment history…</div>}
              {successfulPayments(b._id).length > 0 && (
                <div className="mybk-ledger">
                  <div className="mybk-ledger-title">Transaction History</div>
                  {successfulPayments(b._id).map((row) => (
                    <div key={row._id} className="mybk-ledger-row">
                      <div className="mybk-ledger-type">{row.type === "REFUND" || row.type === "CASH_REFUND"
                        ? "REFUND"
                        : `${row.paymentPurpose || (row.type === "CASH_COLLECTION" ? "BALANCE" : "PAYMENT")} ${row.mode === "CASH" || row.gateway === "CASH" ? "CASH" : "PAYMENT"}`}</div>
                      <div className="mybk-ledger-note">{row.note || row.gateway || ""}</div>
                      <div className={`mybk-ledger-amount ${["PAYMENT","CASH_COLLECTION"].includes(row.type) ? "green" : "red"}`}>
                        {["PAYMENT","CASH_COLLECTION"].includes(row.type) ? "+" : "-"}{fmt(row.amountPaise)}
                      </div>
                      <div className="mybk-ledger-date">{new Date(row.createdAt).toLocaleString("en-IN")}</div>
                      {["PAYMENT", "CASH_COLLECTION"].includes(row.type) && (
                        <button
                          className="mybk-receipt-link"
                          disabled={receiptLoading === `${b._id}:${row._id}`}
                          onClick={() => handleDownloadReceipt(b, row)}
                        >
                          {receiptLoading === `${b._id}:${row._id}` ? "Preparing…" : `Download receipt${row.receiptNumber ? ` ${row.receiptNumber}` : ""}`}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="mybk-actions">
                {(b.bookingStatus === "AWAITING_PAYMENT" || ["CONFIRMED", "CHECKED_IN"].includes(b.bookingStatus)) &&
                  outstanding(b) > 0 && (
                  <button
                    className="mybk-btn pay"
                    disabled={payingId === b._id}
                    onClick={() => handlePayNow(b)}
                  >
                    {payingId === b._id ? <><FiLoader className="spin" /> Processing…</> : b.bookingStatus === "AWAITING_PAYMENT" ? "💳 Pay Advance Now" : "💳 Pay Balance"}
                  </button>
                )}
                <button
                  className="mybk-btn receipt"
                  disabled={receiptLoading === `${b._id}:booking`}
                  onClick={() => handleDownloadReceipt(b)}
                >
                  {receiptLoading === `${b._id}:booking` ? "Preparing…" : "Download Booking Receipt"}
                </button>
                {canCancel(b) && (
                  <button
                    className="mybk-btn cancel"
                    disabled={busyId === b._id}
                    onClick={() => handleCancel(b)}
                  >
                    {busyId === b._id ? <FiLoader className="spin" /> : <FiX size={14} />}
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      <style>{`
        .mybk-root{display:flex;flex-direction:column;gap:12px;padding:16px 0}
        .mybk-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
        .mybk-title{font-size:18px;font-weight:700;color:#111;margin:0}
        .mybk-refresh{display:flex;align-items:center;gap:6px;background:#f5f3ff;color:#7c3aed;border:1px solid #e9d5ff;border-radius:8px;padding:6px 12px;font-size:13px;font-weight:600;cursor:pointer;transition:.2s}
        .mybk-refresh:hover:not(:disabled){background:#ede9fe}
        .mybk-loading{display:flex;align-items:center;gap:10px;color:#7c3aed;padding:32px;justify-content:center}
        .mybk-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:48px;color:#9ca3af;text-align:center}
        .mybk-empty-icon{color:#d1d5db}
        .mybk-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;overflow:hidden;transition:.2s}
        .mybk-card.expanded{border-color:#e9d5ff;box-shadow:0 4px 20px #7c3aed15}
        .mybk-card-top{display:flex;justify-content:space-between;align-items:flex-start;padding:16px;cursor:pointer;gap:12px}
        .mybk-card-top:hover{background:#fafafa}
        .mybk-card-info{flex:1;min-width:0}
        .mybk-ref{font-family:monospace;font-size:13px;font-weight:700;color:#7c3aed}
        .mybk-property{font-size:15px;font-weight:600;color:#111;margin:2px 0}
        .mybk-dates{display:flex;align-items:center;gap:6px;font-size:12px;color:#6b7280}
        .mybk-card-right{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0}
        .mybk-amount{font-size:16px;font-weight:700;color:#111}
        .mybk-advance{font-size:11px;color:#7c3aed;font-weight:600}
        .mybk-detail{padding:0 16px 16px;border-top:1px solid #f3f4f6;display:flex;flex-direction:column;gap:14px}
        .mybk-detail-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;padding-top:12px}
        .mybk-detail-grid div{background:#f9fafb;border-radius:8px;padding:8px 10px;display:flex;flex-direction:column;gap:2px}
        .mybk-detail-grid div.span2{grid-column:span 2}
        .mybk-detail-grid span{font-size:10px;color:#9ca3af;text-transform:uppercase;font-weight:600}
        .mybk-detail-grid strong{font-size:13px;color:#111;font-weight:700}
        .mybk-detail-grid strong.green{color:#059669}
        .mybk-detail-grid strong.purple{color:#7c3aed}
        .mybk-detail-grid strong.blue{color:#2563eb}
        .mybk-ledger{background:#f9fafb;border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:6px}
        .mybk-ledger-loading{font-size:12px;color:#6b7280;padding:8px}
        .mybk-ledger-title{font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;margin-bottom:4px}
        .mybk-ledger-row{display:grid;grid-template-columns:110px 1fr 80px 130px;gap:6px;align-items:center;font-size:12px;border-bottom:1px solid #e5e7eb;padding-bottom:6px}
        .mybk-ledger-row:last-child{border-bottom:none;padding-bottom:0}
        .mybk-ledger-type{font-weight:600;color:#374151;font-size:11px;text-transform:uppercase}
        .mybk-ledger-note{color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .mybk-ledger-amount{font-weight:700;text-align:right}
        .mybk-ledger-amount.green{color:#059669}
        .mybk-ledger-amount.red{color:#dc2626}
        .mybk-ledger-date{color:#9ca3af;font-size:11px;text-align:right}
        .mybk-receipt-link{grid-column:2/-1;justify-self:start;background:none;border:none;color:#6d28d9;text-decoration:underline;font-size:11px;cursor:pointer;padding:0}
        .mybk-actions{display:flex;gap:10px;flex-wrap:wrap}
        .mybk-btn{display:flex;align-items:center;gap:6px;border:none;border-radius:8px;padding:10px 16px;font-size:14px;font-weight:600;cursor:pointer;transition:.2s;font-family:inherit}
        .mybk-btn.pay{background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;box-shadow:0 2px 10px #7c3aed30}
        .mybk-btn.pay:hover:not(:disabled){filter:brightness(1.1)}
        .mybk-btn.cancel{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}
        .mybk-btn.cancel:hover:not(:disabled){background:#fee2e2}
        .mybk-btn.receipt{background:#f5f3ff;color:#5b21b6;border:1px solid #ddd6fe}
        .mybk-btn:disabled{opacity:.6;cursor:not-allowed}
        .spin{animation:spin .8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:480px){.mybk-ledger-row{grid-template-columns:1fr 1fr}}
      `}</style>
    </div>
  );
}
