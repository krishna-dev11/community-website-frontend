/**
 * DharamshalaBookingV2.jsx — Phase 4-5 Frontend Booking Flow
 *
 * Multi-step flow:
 *   Step 1: Select dates + rooms → fetch quote
 *   Step 2: Review pricing + enter guest details + terms
 *   Step 3: Razorpay payment (if advance > 0) OR booking confirmed
 *   Step 4: Confirmation screen
 */

import React, { useState, useEffect, useCallback } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar, FiUsers, FiHome, FiCheckCircle, FiAlertCircle,
  FiArrowRight, FiArrowLeft, FiTag, FiPhone, FiMail, FiMapPin,
  FiClock, FiShield, FiLoader, FiX, FiInfo, FiUpload, FiTrash2,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import toast from "react-hot-toast";
import { apiConnector as sendApiRequest } from "../../services/apiConnector";
import { dharamshalaBookingV2Endpoints as API, dharamshalaPublicEndpoints as PUBAPI } from "../../services/apis.jsx";
import { setGoogleLogin } from "../../services/Operations/authAPI";
import "./dharamshalaBooking.css";

// ─── Razorpay loader ────────────────────────────────────────────────────────
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (paise) =>
  paise === undefined || paise === null
    ? "—"
    : `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const apiConnector = (method, url, data, headers) => {
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    return sendApiRequest(method, url, data, headers);
  }
  if (typeof File !== "undefined" && data?.idDocument instanceof File) {
    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "idDocument") form.append(key, value);
      else form.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
    });
    return sendApiRequest(method, url, form, headers);
  }
  return sendApiRequest(method, url, data, headers);
};

const AADHAAR_ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf,application/pdf,image/jpeg,image/png,image/webp";
const AADHAAR_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
const AADHAAR_MAX_BYTES = 15 * 1024 * 1024;

const emptyGuest = (index, user, phone) => ({
  fullName: index === 0 ? [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.name || user?.displayName || "" : "",
  phone: index === 0 ? phone || user?.additionalDetails?.contactNumber || user?.phone || "" : "",
  aadhaar: null,
});

const STATUS_META = {
  PENDING_MEMBERSHIP: { label: "Membership Pending", color: "#f59e0b", bg: "#fef3c7" },
  PENDING_APPROVAL:   { label: "Awaiting Approval",  color: "#3b82f6", bg: "#eff6ff" },
  AWAITING_PAYMENT:   { label: "Payment Due",         color: "#ef4444", bg: "#fef2f2" },
  CONFIRMED:          { label: "Confirmed ✓",          color: "#10b981", bg: "#ecfdf5" },
  CHECKED_IN:         { label: "Checked In",           color: "#8b5cf6", bg: "#f5f3ff" },
  COMPLETED:          { label: "Completed",            color: "#6b7280", bg: "#f3f4f6" },
  REJECTED:           { label: "Rejected",             color: "#dc2626", bg: "#fef2f2" },
  EXPIRED:            { label: "Expired",              color: "#9ca3af", bg: "#f3f4f6" },
  CANCELLED:          { label: "Cancelled",            color: "#6b7280", bg: "#f3f4f6" },
  NO_SHOW:            { label: "No Show",              color: "#dc2626", bg: "#fef2f2" },
};

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || { label: status, color: "#6b7280", bg: "#f3f4f6" };
  return (
    <span style={{
      background: m.bg, color: m.color, border: `1px solid ${m.color}30`,
      borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600,
    }}>{m.label}</span>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const DharamshalaBookingV2 = ({ property, roomType, onClose }) => {
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.profile.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const availableRoomTypes = (property?.roomTypes || []).filter((item) => item?._id);
  if (availableRoomTypes.length === 0 && roomType?._id) availableRoomTypes.push(roomType);
  const [roomSelections, setRoomSelections] = useState(() => {
    const selectedId = String(roomType?._id || availableRoomTypes[0]?._id || "");
    const selected = availableRoomTypes.find((item) => String(item._id) === selectedId);
    return selected ? [{
      roomTypeId: selected._id,
      rooms: 1,
      guestsTotal: Math.max(1, selected.capacity?.base || 1),
    }] : [];
  });
  const selectedRoomTypes = availableRoomTypes.filter((item) =>
    roomSelections.some((selection) => String(selection.roomTypeId) === String(item._id) && selection.rooms > 0)
  );

  const [step, setStep] = useState(1);     // 1=dates, 2=details, 3=pay, 4=done
  const [dates, setDates] = useState({
    checkIn:  new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
  });
  const [quote, setQuote]           = useState(null);
  const [quoting, setQuoting]       = useState(false);
  const [priceChanged, setPriceChanged] = useState(false);

  const [guestDetails, setGuestDetails] = useState({
    purpose: "Pilgrimage / Family Yatra",
    specialRequests: "",
    phone: user?.additionalDetails?.contactNumber || user?.phone || "",
    termsAccepted: false,
  });
  const [guests, setGuests] = useState(() => [emptyGuest(0, user, user?.additionalDetails?.contactNumber || user?.phone || "")]);

  const [booking, setBooking]           = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [payProcessing, setPayProcessing] = useState(false);
  const totalRooms = roomSelections.reduce((sum, item) => sum + item.rooms, 0);
  const totalGuests = roomSelections.reduce((sum, item) => sum + item.guestsTotal, 0);

  useEffect(() => {
    setGuests((current) => {
      const target = Math.max(1, totalGuests || 1);
      const next = current.slice(0, target);
      while (next.length < target) {
        next.push(emptyGuest(next.length, user, guestDetails.phone));
      }
      return next;
    });
  }, [totalGuests, user, guestDetails.phone]);

  const validateAadhaarFile = (file) => {
    if (!file) return "Aadhaar file is required";
    const fileName = file.name || "";
    const ext = fileName.split(".").pop()?.toLowerCase();
    const mime = (file.type || "").toLowerCase();
    const allowed = AADHAAR_MIMES.includes(mime) || ["jpg", "jpeg", "png", "webp", "pdf"].includes(ext);
    if (!allowed) return "Upload Aadhaar as JPG, PNG, WEBP or PDF";
    if (file.size > AADHAAR_MAX_BYTES) return "Aadhaar file must be 15 MB or smaller";
    return "";
  };

  const updateGuest = (index, patch) => {
    setGuests((current) => current.map((guest, guestIndex) => (
      guestIndex === index ? { ...guest, ...patch } : guest
    )));
  };

  const handleGuestAadhaar = (index, file) => {
    const message = validateAadhaarFile(file);
    if (message) {
      toast.error(message);
      return;
    }
    updateGuest(index, { aadhaar: file });
  };

  const hasCompleteGuestDetails = guests.length === totalGuests && guests.every((guest) =>
    guest.fullName.trim() && guest.phone.trim() && !validateAadhaarFile(guest.aadhaar)
  );

  const updateRoomCount = (selectedType, countValue) => {
    const alreadySelectedElsewhere = roomSelections.reduce(
      (sum, item) => String(item.roomTypeId) === String(selectedType._id) ? sum : sum + item.rooms,
      0
    );
    const bookingRoomLimit = property?.bookingConfig?.maxRoomsPerBooking || Number.MAX_SAFE_INTEGER;
    const maxAllowed = Math.max(0, Math.min(
      selectedType.totalUnits || Number.MAX_SAFE_INTEGER,
      bookingRoomLimit - alreadySelectedElsewhere
    ));
    const requestedRooms = Math.max(0, Number(countValue) || 0);
    const rooms = Math.min(requestedRooms, maxAllowed);
    if (requestedRooms > maxAllowed) {
      toast.error(`Choose no more than ${maxAllowed} room(s) of this type within this booking`);
    }
    setRoomSelections((current) => {
      const existing = current.find((item) => String(item.roomTypeId) === String(selectedType._id));
      if (!rooms) return current.filter((item) => String(item.roomTypeId) !== String(selectedType._id));
      const maxGuests = Math.max(1, selectedType.capacity?.max || 1) * rooms;
      const defaultGuests = Math.max(1, selectedType.capacity?.base || 1) * rooms;
      const updated = {
        roomTypeId: selectedType._id,
        rooms,
        guestsTotal: Math.min(existing?.guestsTotal || defaultGuests, maxGuests),
      };
      return existing
        ? current.map((item) => String(item.roomTypeId) === String(selectedType._id) ? updated : item)
        : [...current, updated];
    });
  };

  const updateGuestCount = (selectedType, countValue) => {
    const selected = roomSelections.find((item) => String(item.roomTypeId) === String(selectedType._id));
    const guestsTotal = Math.min(
      Math.max(1, Number(countValue) || 1),
      Math.max(1, selectedType.capacity?.max || 1) * (selected?.rooms || 1)
    );
    setRoomSelections((current) => current.map((item) =>
      String(item.roomTypeId) === String(selectedType._id) ? { ...item, guestsTotal } : item
    ));
  };

  const handleGuestGoogleSuccess = (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error("Google authentication response is missing");
      return;
    }

    dispatch(setGoogleLogin(credentialResponse.credential, "guest", navigate, (userData) => {
      setGuestDetails((details) => ({
        ...details,
        phone: userData?.additionalDetails?.contactNumber || userData?.phone || details.phone,
      }));
      setStep(2);
    }));
  };

  // ── Step 1: fetch quote whenever inputs change ─────────────────────────────
  const fetchQuote = useCallback(async () => {
    if (!dates.checkIn || !dates.checkOut || roomSelections.length === 0) {
      setQuote(null);
      return;
    }
    setQuoting(true);
    setPriceChanged(false);
    try {
      const res = await apiConnector("POST", API.QUOTE_API, {
        checkIn:     dates.checkIn,
        checkOut:    dates.checkOut,
        roomSelections,
      }, token ? { Authorization: `Bearer ${token}` } : {});
      setQuote(res.data?.data);
    } catch (err) {
      setQuote(null);
      const msg = err.response?.data?.message || "Could not fetch quote";
      if (!msg.includes("checkOut")) toast.error(msg);
    } finally {
      setQuoting(false);
    }
  }, [dates.checkIn, dates.checkOut, roomSelections, token]);

  useEffect(() => { if (step === 1 || step === 2) fetchQuote(); }, [fetchQuote, step]);

  // ── Step 2 → 3: create booking ─────────────────────────────────────────────
  const handleCreateBooking = async () => {
    if (!token) { toast.error("Please login to book"); return; }
    if (!guestDetails.termsAccepted) { toast.error("Please accept terms and conditions"); return; }
    if (!guestDetails.phone) { toast.error("Phone number is required"); return; }
    if (roomSelections.length === 0) { toast.error("Select at least one room"); return; }
    if (!hasCompleteGuestDetails) { toast.error(`Enter full name, phone and Aadhaar for all ${totalGuests} guest(s)`); return; }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("checkIn", dates.checkIn);
      form.append("checkOut", dates.checkOut);
      form.append("roomSelections", JSON.stringify(roomSelections));
      form.append("phone", guestDetails.phone.trim());
      form.append("purpose", guestDetails.purpose);
      form.append("specialRequests", guestDetails.specialRequests);
      form.append("termsAccepted", "true");
      form.append("expectedTotalPaise", quote?.pricing?.totalPaise ?? "");
      form.append("idempotencyKey", `${roomSelections.map((item) => item.roomTypeId).join("-")}_${dates.checkIn}_${dates.checkOut}_${Date.now()}`);
      form.append("guestDetails", JSON.stringify(guests.map((guest) => ({
        fullName: guest.fullName.trim(),
        phone: guest.phone.trim(),
      }))));
      guests.forEach((guest, index) => {
        form.append(`guestAadhaar_${index}`, guest.aadhaar);
      });

      const res = await apiConnector("POST", API.CREATE_BOOKING_API, form, { Authorization: `Bearer ${token}` });

      const created = res.data?.data;
      setBooking(created);

      if (created.bookingStatus === "AWAITING_PAYMENT" && created.pricing?.advancePaise > 0) {
        setStep(3); // go to payment
      } else {
        setStep(4); // confirmed / pending approval
      }
    } catch (err) {
      if (err.response?.data?.code === "PRICE_CHANGED") {
        setPriceChanged(true);
        setQuote({ pricing: err.response.data.newQuote, bookingMode: quote?.bookingMode });
        toast.error("Price has changed. Please review the updated quote.");
      } else {
        toast.error(err.response?.data?.message || "Booking failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 3: Razorpay payment ───────────────────────────────────────────────
  const handlePay = async () => {
    if (!booking || payProcessing) return;
    setPayProcessing(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Payment gateway could not be loaded");

      const orderRes = await apiConnector("POST", API.CREATE_ORDER_API(booking._id), {}, {
        Authorization: `Bearer ${token}`,
      });
      const { orderId, amount, currency, keyId } = orderRes.data?.data || {};
      if (!orderId || !keyId) throw new Error("Payment configuration error");

      await new Promise((resolve, reject) => {
        const rz = new window.Razorpay({
          key:      keyId,
          amount,
          currency: currency || "INR",
          name:     property?.name || "Samaj Dharamshala",
          description: `${booking.bookingRef} — ${selectedRoomTypes.map((item) => item.name).join(", ")}`,
          order_id: orderId,
          prefill: {
            name:    booking.bookerName || "",
            email:   booking.bookerEmail || "",
            contact: booking.bookerPhone || guestDetails.phone || "",
          },
          theme: { color: "#7c3aed" },
          handler: async (response) => {
            try {
              const verifyRes = await apiConnector("POST", API.VERIFY_PAYMENT_API(booking._id), response, {
                Authorization: `Bearer ${token}`,
              });
              const updated = verifyRes.data?.data?.booking;
              if (updated) setBooking(updated);
              toast.success("Payment successful! Booking confirmed.");
              setStep(4);
              resolve();
            } catch (e) {
              reject(new Error(e.response?.data?.message || "Payment verification failed"));
            }
          },
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
        });
        rz.open();
      });
    } catch (err) {
      toast.error(err.message || "Payment failed");
    } finally {
      setPayProcessing(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const nights = (() => {
    try {
      const d1 = new Date(dates.checkIn), d2 = new Date(dates.checkOut);
      return Math.max(1, Math.round((d2 - d1) / 86400000));
    } catch { return 1; }
  })();

  const pricing = quote?.pricing;

  return (
    <div className="dhv2-overlay">
      <div className="dhv2-modal">
        {/* Header */}
        <div className="dhv2-header">
          <div>
            <h2 className="dhv2-title">Book your stay</h2>
            <p className="dhv2-subtitle">{property?.name}</p>
          </div>
          <button className="dhv2-close" onClick={onClose}><FiX size={20} /></button>
        </div>

        {/* Step indicator */}
        <div className="dhv2-steps">
          {["Dates", "Details", "Payment", "Done"].map((label, i) => (
            <div key={label} className={`dhv2-step ${step === i + 1 ? "active" : ""} ${step > i + 1 ? "done" : ""}`}>
              <div className="dhv2-step-dot">{step > i + 1 ? "✓" : i + 1}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* STEP 1 — Date & rooms selection */}
        {step === 1 && (
          <div className="dhv2-body">
            <div className="dhv2-grid2">
              <label className="dhv2-label">
                Check-in
                <input type="date" className="dhv2-input" value={dates.checkIn}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDates((d) => ({ ...d, checkIn: e.target.value }))} />
              </label>
              <label className="dhv2-label">
                Check-out
                <input type="date" className="dhv2-input" value={dates.checkOut}
                  min={dates.checkIn}
                  onChange={(e) => setDates((d) => ({ ...d, checkOut: e.target.value }))} />
              </label>
            </div>

            <div className="dhv2-room-list">
              <h3 className="dhv2-section-title">Choose room types and guests</h3>
              {availableRoomTypes.map((item) => {
                const selected = roomSelections.find((entry) => String(entry.roomTypeId) === String(item._id));
                const otherSelectedRooms = roomSelections.reduce(
                  (sum, entry) => String(entry.roomTypeId) === String(item._id) ? sum : sum + entry.rooms,
                  0
                );
                const roomLimit = property?.bookingConfig?.maxRoomsPerBooking || Number.MAX_SAFE_INTEGER;
                const maxRoomsForType = Math.max(0, Math.min(item.totalUnits || Number.MAX_SAFE_INTEGER, roomLimit - otherSelectedRooms));
                const cover = item.images?.find((image) => image.isCover) || item.images?.[0];
                return (
                  <div className="dhv2-room-option" key={item._id}>
                    {cover?.url && <img src={cover.url} alt={item.name} />}
                    <div className="dhv2-room-info">
                      <strong>{item.name}</strong>
                      <span>{item.capacity?.base || 1} base · {item.capacity?.max || 1} max per room · {item.totalUnits || 1} unit(s)</span>
                      <span>
                        Public {fmt(item.pricing?.publicPricePaise || 0)} · Member {fmt(item.pricing?.memberPricePaise || 0)}
                        {" / "}{item.pricing?.pricingUnit === "PER_EVENT" ? "event" : "night"}
                      </span>
                    </div>
                    <label className="dhv2-label dhv2-count-field">
                      Rooms
                      <input type="number" className="dhv2-input" min={0} max={maxRoomsForType}
                        value={selected?.rooms || 0} onChange={(e) => updateRoomCount(item, e.target.value)} />
                    </label>
                    {selected && (
                      <label className="dhv2-label dhv2-count-field">
                        Guests
                        <input type="number" className="dhv2-input" min={1}
                          max={(item.capacity?.max || 1) * selected.rooms} value={selected.guestsTotal}
                          onChange={(e) => updateGuestCount(item, e.target.value)} />
                      </label>
                    )}
                  </div>
                );
              })}
              {roomSelections.length === 0 && <p className="dhv2-empty-selection">Select one or more room types to see your quote.</p>}
            </div>

            {/* Price preview */}
            {quoting && <div className="dhv2-loading"><FiLoader className="spin" /> Calculating price…</div>}
            {pricing && !quoting && (
              <div className="dhv2-price-card">
                <div className="dhv2-price-row"><span>Room charges ({nights} night{nights > 1 ? "s" : ""} · {totalRooms} room{totalRooms > 1 ? "s" : ""})</span><strong>{fmt(pricing.basePaise)}</strong></div>
                {pricing.extraPaise > 0 && <div className="dhv2-price-row"><span>Extra guest charge</span><strong>{fmt(pricing.extraPaise)}</strong></div>}
                {pricing.taxPaise > 0 && <div className="dhv2-price-row"><span>Tax ({pricing.taxRatePercent}%)</span><strong>{fmt(pricing.taxPaise)}</strong></div>}
                <div className="dhv2-price-row total"><span>Total</span><strong>{fmt(pricing.totalPaise)}</strong></div>
                {pricing.advancePaise > 0 && <div className="dhv2-price-row advance"><span>Advance now ({pricing.advancePercent}%)</span><strong>{fmt(pricing.advancePaise)}</strong></div>}
                {pricing.balancePaise > 0 && <div className="dhv2-price-row"><span>Balance at {property?.bookingConfig?.balanceDueAt === "CHECK_OUT" ? "check-out" : "check-in"}</span><strong>{fmt(pricing.balancePaise)}</strong></div>}
                {pricing.advancePaise === 0 && <div className="dhv2-pill green">No advance payment required</div>}
                {pricing.tier === "MEMBER" && <div className="dhv2-pill purple">🏅 Member price applied</div>}
                {quote?.bookingMode === "REQUIRES_APPROVAL" && <div className="dhv2-pill blue">📋 Requires admin approval</div>}
              </div>
            )}

            <button className="dhv2-btn primary" disabled={!pricing || quoting || roomSelections.length === 0}
              onClick={() => setStep(2)}>
              Continue <FiArrowRight />
            </button>
          </div>
        )}

        {/* STEP 2 — Guest details */}
        {step === 2 && (
          <div className="dhv2-body">
            {!token ? (
              <div className="dhv2-form">
                <div className="dhv2-alert">
                  <strong>Continue with Dharamshala Booking</strong>
                  <p className="mt-1">
                    Google sign-in is available here only for Dharamshala guests. It does not create a Samaj membership.
                  </p>
                </div>
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGuestGoogleSuccess}
                    onError={() => toast.error("Google login failed")}
                    text="continue_with"
                    width="280"
                  />
                </div>
              </div>
            ) : (
            <>
            {priceChanged && (
              <div className="dhv2-alert warn">
                ⚠️ Price has updated. Please review before confirming.
              </div>
            )}
            {/* Booking summary */}
            {pricing && (
              <div className="dhv2-price-card compact">
                <div className="dhv2-price-row total"><span>{dates.checkIn} → {dates.checkOut} · {nights}N · {totalRooms}R · {totalGuests}G</span><strong>{fmt(pricing.totalPaise)}</strong></div>
                {quote?.roomQuotes?.map((row) => (
                  <div className="dhv2-price-row" key={row.roomTypeId}>
                    <span>{row.roomTypeName} · {row.rooms} room(s), {row.guestsTotal} guest(s)</span>
                    <strong>{fmt(row.pricing.totalPaise)}</strong>
                  </div>
                ))}
                {pricing.advancePaise > 0 && <div className="dhv2-price-row advance"><span>Advance due now ({pricing.advancePercent}%)</span><strong>{fmt(pricing.advancePaise)}</strong></div>}
                {pricing.balancePaise > 0 && <div className="dhv2-price-row"><span>Balance at {property?.bookingConfig?.balanceDueAt === "CHECK_OUT" ? "check-out" : "check-in"}</span><strong>{fmt(pricing.balancePaise)}</strong></div>}
              </div>
            )}

            <div className="dhv2-form">
              <label className="dhv2-label">
                Phone Number *
                <input type="tel" className="dhv2-input" placeholder="+91 XXXXX XXXXX"
                  value={guestDetails.phone}
                  onChange={(e) => setGuestDetails((d) => ({ ...d, phone: e.target.value }))} />
              </label>
              <label className="dhv2-label">
                Purpose of Visit
                <select className="dhv2-input" value={guestDetails.purpose}
                  onChange={(e) => setGuestDetails((d) => ({ ...d, purpose: e.target.value }))}>
                  <option>Pilgrimage / Family Yatra</option>
                  <option>Medical Treatment</option>
                  <option>Cultural Event</option>
                  <option>Community Meeting</option>
                  <option>Marriage / Function</option>
                  <option>Education / Employment</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="dhv2-label">
                Special Requests (optional)
                <textarea className="dhv2-input" rows={2} placeholder="Any special requirements…"
                  value={guestDetails.specialRequests}
                  onChange={(e) => setGuestDetails((d) => ({ ...d, specialRequests: e.target.value }))} />
              </label>

              <section className="dhv2-guest-section">
                <div className="dhv2-guest-heading">
                  <div>
                    <h3>Guest Details</h3>
                    <p>{totalGuests} guest{totalGuests > 1 ? "s" : ""} selected. Aadhaar is stored privately for booking verification.</p>
                  </div>
                  {pricing?.tier === "MEMBER" && <span className="dhv2-tier-chip">Member price</span>}
                </div>
                <div className="dhv2-guest-grid">
                  {guests.map((guest, index) => (
                    <div className="dhv2-guest-card" key={index}>
                      <div className="dhv2-guest-card-title">
                        <strong>Guest #{index + 1}</strong>
                        {guest.aadhaar && (
                          <button type="button" className="dhv2-icon-btn" onClick={() => updateGuest(index, { aadhaar: null })} aria-label={`Remove Aadhaar for guest ${index + 1}`}>
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                      <label className="dhv2-label">
                        Full Name *
                        <input type="text" className="dhv2-input" value={guest.fullName}
                          onChange={(e) => updateGuest(index, { fullName: e.target.value })} />
                      </label>
                      <label className="dhv2-label">
                        Phone Number *
                        <input type="tel" className="dhv2-input" value={guest.phone}
                          onChange={(e) => updateGuest(index, { phone: e.target.value })} />
                      </label>
                      <label className="dhv2-upload-box">
                        <input type="file" accept={AADHAAR_ACCEPT}
                          onChange={(e) => handleGuestAadhaar(index, e.target.files?.[0] || null)} />
                        <FiUpload />
                        <span>{guest.aadhaar ? "Replace Aadhaar" : "Upload Aadhaar *"}</span>
                      </label>
                      <p className="dhv2-file-note">
                        {guest.aadhaar ? guest.aadhaar.name : "JPG, PNG, WEBP or PDF up to 15 MB"}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <label className="dhv2-check">
                <input type="checkbox" checked={guestDetails.termsAccepted} required
                  onChange={(e) => setGuestDetails((d) => ({ ...d, termsAccepted: e.target.checked }))} />
                <span>I accept the <strong>terms, house rules</strong>, and <strong>cancellation policy</strong></span>
              </label>
            </div>

            <div className="dhv2-actions">
              <button className="dhv2-btn outline" onClick={() => setStep(1)}><FiArrowLeft /> Back</button>
              <button className="dhv2-btn primary" disabled={submitting || !guestDetails.termsAccepted || roomSelections.length === 0 || !hasCompleteGuestDetails} onClick={handleCreateBooking}>
                {submitting ? <><FiLoader className="spin" /> Processing…</> : "Confirm Booking"}
              </button>
            </div>
            </>
            )}
          </div>
        )}

        {/* STEP 3 — Payment */}
        {step === 3 && booking && (
          <div className="dhv2-body center">
            <div className="dhv2-pay-card">
              <div className="dhv2-pay-icon">💳</div>
              <h3>Complete Your Advance Payment</h3>
              <p>Booking <strong>{booking.bookingRef}</strong> is reserved for <strong>30 minutes</strong>.</p>
              <div className="dhv2-pay-amount">{fmt(booking.pricing?.advancePaise)}</div>
              <p className="dhv2-pay-sub">Balance of {fmt(booking.pricing?.balancePaise)} due at {property?.bookingConfig?.balanceDueAt === "CHECK_OUT" ? "check-out" : "check-in"}</p>
              <button className="dhv2-btn primary large" disabled={payProcessing} onClick={handlePay}>
                {payProcessing ? <><FiLoader className="spin" /> Opening Razorpay…</> : "Pay Now via Razorpay"}
              </button>
              <button className="dhv2-btn ghost" onClick={() => setStep(4)}>Pay later (booking stays pending)</button>
            </div>
          </div>
        )}

        {/* STEP 4 — Done */}
        {step === 4 && booking && (
          <div className="dhv2-body center">
            <div className="dhv2-success-card">
              {booking.bookingStatus === "CONFIRMED" ? (
                <><div className="dhv2-success-icon" style={{ color: "#10b981", fontSize: "3rem" }}>✅</div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>Booking Confirmed!</h3></>
              ) : booking.bookingStatus === "AWAITING_PAYMENT" ? (
                <><div className="dhv2-success-icon" style={{ color: "#f59e0b", fontSize: "3rem" }}>⏳</div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>Payment Pending</h3></>
              ) : (
                <><div className="dhv2-success-icon" style={{ color: "#38bdf8", fontSize: "3rem" }}>📋</div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>Request Submitted</h3></>
              )}

              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary, #94a3b8)", margin: 0 }}>
                Reference: <span className="dhv2-ref-badge">{booking.bookingRef}</span>
              </p>
              <StatusBadge status={booking.bookingStatus} />

              <div className="dhv2-details-grid">
                <div className="dhv2-details-item"><span>Check-in</span><strong>{booking.checkIn}</strong></div>
                <div className="dhv2-details-item"><span>Check-out</span><strong>{booking.checkOut}</strong></div>
                <div className="dhv2-details-item"><span>Rooms</span><strong>{booking.roomsRequested}</strong></div>
                <div className="dhv2-details-item"><span>Total</span><strong>{fmt(booking.pricing?.totalPaise)}</strong></div>
                <div className="dhv2-details-item"><span>Advance required</span><strong>{fmt(booking.pricing?.advancePaise)}</strong></div>
                <div className="dhv2-details-item"><span>Balance due</span><strong>{fmt(booking.pricing?.balancePaise)}</strong></div>
                <div className="dhv2-details-item"><span>Paid to date</span><strong>{fmt(booking.paidPaise || 0)}</strong></div>
              </div>
              <div className="dhv2-booking-allocation">
                {(booking.roomSelections || []).map((item) => (
                  <div key={item.roomTypeId}>
                    <span>{item.roomTypeName} · {item.rooms} room(s) · {item.guestsTotal} guest(s)</span>
                    <strong>{fmt(item.pricing?.totalPaise)}</strong>
                  </div>
                ))}
              </div>

              {booking.bookingStatus === "AWAITING_PAYMENT" && (
                <button className="dhv2-btn primary" onClick={() => setStep(3)}>Complete Payment</button>
              )}
              <button className="dhv2-btn outline" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>

      {/* Styles are loaded via dharamshalaBooking.css */}
    </div>
  );
};

export { StatusBadge };
export default DharamshalaBookingV2;
