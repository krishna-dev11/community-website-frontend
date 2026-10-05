import React, { useMemo } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { formatDharamshalaPrice } from "../../../../../Utilities/dharamshalaPricing";
import {
  Button,
  StatusBadge,
  SummaryCards,
  ModuleFilters,
  ModuleEmptyState,
  DONE_STATUSES,
  formatDate,
  inputClass,
} from "./common";

export const BOOKING_STATUS_CONFIG = [
  { key: "PENDING", label: "Pending" },
  { key: "PAYMENT_PENDING", label: "Awaiting Payment" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "CHECKED_IN", label: "Checked In" },
  { key: "COMPLETED", label: "Completed" },
  { key: "REJECTED", label: "Rejected" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "ALL", label: "All" },
];

const DharamshalaBookingsAdmin = ({
  bookings = [],
  statusFilter = "PENDING",
  onStatusFilterChange,
  searchQuery = "",
  onSearchChange,
  bookingDrafts = {},
  setBookingDrafts,
  busyId,
  reviewBooking,
  cancelBooking,
  updateBookingLifecycle,
  refundBooking,
}) => {
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchStatus = statusFilter === "ALL" || booking.status === statusFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        [
          booking.bookingReference,
          booking.guestName,
          booking.guestEmail,
          booking.guestPhone,
          booking.roomType,
          booking.dharamshalaName,
          booking.dharamshala?.name,
          booking.purpose,
        ]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(query));
      return matchStatus && matchSearch;
    });
  }, [bookings, statusFilter, searchQuery]);

  return (
    <section className="grid gap-4">
      <SummaryCards data={bookings} config={BOOKING_STATUS_CONFIG} />

      <ModuleFilters
        data={bookings}
        config={BOOKING_STATUS_CONFIG}
        activeKey={statusFilter}
        onTabChange={onStatusFilterChange}
        searchValue={searchQuery}
        onSearch={onSearchChange}
        searchPlaceholder="Search booking ref, guest name, email, room..."
      />

      {filteredBookings.length === 0 ? (
        <ModuleEmptyState statusKey={statusFilter} moduleLabel="booking" />
      ) : (
        <div className="grid gap-3">
          {filteredBookings.map((booking) => {
            const isDone = DONE_STATUSES.has(booking.status);
            return (
              <article
                key={booking._id}
                className={`rounded-2xl border p-5 transition ${
                  isDone
                    ? "border-white/5 bg-white/[0.01] opacity-75"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">
                        {booking.bookingReference || booking._id?.slice(-8)}
                      </span>
                      <StatusBadge value={booking.status} />
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          booking.isMember
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {booking.isMember ? "MEMBER" : "GUEST"}
                      </span>
                    </div>
                    <h2
                      className={`text-sm font-bold ${
                        isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"
                      }`}
                    >
                      {booking.dharamshalaName || booking.dharamshala?.name || "Samaj Dharamshala"} —{" "}
                      {booking.roomType || "Standard"}
                    </h2>
                    <p className="text-xs text-gray-400">
                      <strong>Purpose:</strong> {booking.purpose}
                    </p>
                    <p className="text-xs text-gray-500">
                      📅 {formatDate(booking.startDate)} to {formatDate(booking.endDate)} ·{" "}
                      {booking.roomsRequested || 1} room(s) · {booking.numberOfGuests || 1} guest(s)
                    </p>
                    <p className="text-xs text-gray-400">
                      👤 <strong>Applicant:</strong>{" "}
                      {booking.guestName ||
                        `${booking.requester?.firstName || ""} ${booking.requester?.lastName || ""}`}{" "}
                      ({booking.guestPhone || "No Phone"}) ·{" "}
                      {booking.guestEmail || booking.requester?.email || ""}
                    </p>
                    <p className="text-xs font-bold text-emerald-400">
                      💰 Total: {formatDharamshalaPrice(booking.totalAmount, "Price unavailable")}{" "}
                      ({booking.paymentStatus || "NOT_REQUIRED"})
                    </p>
                  </div>
                </div>

                {(booking.reviewNote || booking.reviewMessage || booking.cancellationReason) && (
                  <div
                    className={`mt-3 rounded-xl border p-3 text-xs ${
                      booking.status === "REJECTED"
                        ? "border-red-500/30 bg-red-500/10 text-red-300"
                        : ["APPROVED", "PAYMENT_PENDING"].includes(booking.status)
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-gray-500/30 bg-gray-500/10 text-gray-300"
                    }`}
                  >
                    <p className="font-bold uppercase tracking-wider text-[10px]">
                      {booking.status === "CANCELLED"
                        ? "Cancellation Reason"
                        : ["APPROVED", "PAYMENT_PENDING"].includes(booking.status)
                        ? "Admin Note"
                        : "Rejection Reason"}
                    </p>
                    <p className="mt-1 leading-relaxed text-[var(--text-primary)] text-xs">
                      {booking.status === "CANCELLED"
                        ? booking.cancellationReason
                        : booking.reviewNote || booking.reviewMessage}
                    </p>
                  </div>
                )}

                {booking.status === "PENDING" && (
                  <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 lg:grid-cols-[1fr_auto_auto_auto]">
                    <input
                      className={inputClass}
                      value={bookingDrafts[booking._id]?.reviewMessage || ""}
                      onChange={(e) =>
                        setBookingDrafts((c) => ({
                          ...c,
                          [booking._id]: { reviewMessage: e.target.value },
                        }))
                      }
                      placeholder="Review message / Rejection reason"
                      disabled={Boolean(busyId && busyId.startsWith(booking._id))}
                    />
                    <Button
                      icon={FaCheck}
                      tone="success"
                      onClick={() => reviewBooking(booking._id, "APPROVE")}
                      disabled={Boolean(busyId)}
                    >
                      {busyId === `${booking._id}-APPROVE` ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      icon={FaTimes}
                      tone="danger"
                      onClick={() => reviewBooking(booking._id, "REJECT")}
                      disabled={Boolean(busyId)}
                    >
                      {busyId === `${booking._id}-REJECT` ? "Rejecting..." : "Reject"}
                    </Button>
                    <Button
                      tone="warning"
                      onClick={() => cancelBooking(booking._id)}
                      disabled={Boolean(busyId)}
                    >
                      {busyId === `${booking._id}-CANCEL` ? "Cancelling..." : "Cancel"}
                    </Button>
                  </div>
                )}

                {booking.status === "CONFIRMED" && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <Button
                      icon={FaCheck}
                      tone="success"
                      onClick={() => updateBookingLifecycle(booking._id, "CHECK_IN")}
                      disabled={Boolean(busyId)}
                    >
                      {busyId === `${booking._id}-CHECK_IN` ? "Checking in..." : "Check In"}
                    </Button>
                  </div>
                )}

                {booking.status === "CHECKED_IN" && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <Button
                      icon={FaCheck}
                      tone="success"
                      onClick={() => updateBookingLifecycle(booking._id, "COMPLETE")}
                      disabled={Boolean(busyId)}
                    >
                      {busyId === `${booking._id}-COMPLETE` ? "Completing..." : "Mark Completed"}
                    </Button>
                  </div>
                )}

                {booking.status === "CANCELLED" &&
                  booking.paymentStatus === "REFUND_PENDING" &&
                  booking.paymentId && (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <Button
                        icon={FaCheck}
                        tone="warning"
                        onClick={() => refundBooking(booking)}
                        disabled={Boolean(busyId)}
                      >
                        {busyId === `${booking._id}-REFUND` ? "Refunding..." : "Process Refund"}
                      </Button>
                    </div>
                  )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default DharamshalaBookingsAdmin;
