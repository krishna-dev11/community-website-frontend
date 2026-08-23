import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FiMapPin,
  FiHome,
  FiCalendar,
  FiUsers,
  FiCheck,
  FiShield,
  FiInfo,
  FiClock,
  FiPhone,
  FiMail,
  FiArrowRight,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiTag,
} from "react-icons/fi";
import { FaRupeeSign, FaBed, FaUtensils, FaParking, FaWifi, FaCoffee } from "react-icons/fa";
import toast from "react-hot-toast";
import { apiConnector } from "../services/apiConnector";
import { communityEndpoints } from "../services/apis";
import ImageSkeleton from "../Components/Common/ImageSkeleton";

const {
  DHARAMSHALAS_API,
  DHARAMSHALA_DETAIL_API,
  DHARAMSHALA_BOOKINGS_API,
  DHARAMSHALA_AVAILABILITY_API,
  MY_DHARAMSHALA_BOOKINGS_API,
  CANCEL_DHARAMSHALA_BOOKING_API,
} = communityEndpoints;

const DharamshalaPage = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);

  const [dharamshalas, setDharamshalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [detailsModalItem, setDetailsModalItem] = useState(null);
  const [bookingModalItem, setBookingModalItem] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState(null);

  // My bookings state for logged-in members
  const [myBookings, setMyBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("browse"); // "browse" | "my-bookings"
  const [loadingMyBookings, setLoadingMyBookings] = useState(false);

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    startDate: "",
    endDate: "",
    roomsRequested: 1,
    numberOfGuests: 2,
    purpose: "Pilgrimage / Family Yatra",
    guestName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
    guestEmail: user?.email || "",
    guestPhone: user?.additionalDetails?.contactNumber || "",
    guestAddress: user?.additionalDetails?.address || "",
    specialRequests: "",
  });

  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // Backend strictly determines member status, but UI gives friendly visual cues
  const isMember = Boolean(user && user.accountStatus === "ACTIVE");

  useEffect(() => {
    fetchDharamshalas();
  }, []);

  useEffect(() => {
    if (token && activeTab === "my-bookings") {
      fetchMyBookings();
    }
  }, [token, activeTab]);

  const fetchDharamshalas = async () => {
    try {
      setLoading(true);
      const res = await apiConnector("GET", DHARAMSHALAS_API);
      if (res.data?.data?.dharamshalas) {
        setDharamshalas(res.data.data.dharamshalas);
      }
    } catch (err) {
      console.error("Failed to fetch dharamshalas:", err);
      toast.error("Could not load Dharamshala listings");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      setLoadingMyBookings(true);
      const res = await apiConnector("GET", MY_DHARAMSHALA_BOOKINGS_API, null, {
        Authorization: `Bearer ${token}`,
      });
      if (res.data?.data?.bookings) {
        setMyBookings(res.data.data.bookings);
      }
    } catch (err) {
      console.error("Failed to fetch my bookings:", err);
    } finally {
      setLoadingMyBookings(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking request?")) return;
    try {
      await apiConnector(
        "PATCH",
        CANCEL_DHARAMSHALA_BOOKING_API(bookingId),
        { reason: "Cancelled by user" },
        { Authorization: `Bearer ${token}` }
      );
      toast.success("Booking cancelled successfully");
      fetchMyBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  const openBookingModal = (dharamshala, defaultRoom = null) => {
    setBookingModalItem(dharamshala);
    const room = defaultRoom || dharamshala.roomTypes?.[0] || null;
    setSelectedRoomType(room);
    setAvailabilityStatus(null);
    setBookingSuccessData(null);

    // Pre-populate today & tomorrow as default dates
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);

    const startStr = today.toISOString().split("T")[0];
    const endStr = tomorrow.toISOString().split("T")[0];

    setBookingForm({
      startDate: startStr,
      endDate: endStr,
      roomsRequested: 1,
      numberOfGuests: room?.capacity || 2,
      purpose: "Pilgrimage / Family Yatra",
      guestName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
      guestEmail: user?.email || "",
      guestPhone: user?.additionalDetails?.contactNumber || "",
      guestAddress: user?.additionalDetails?.address || "",
      specialRequests: "",
    });
  };

  const calculateTotal = () => {
    if (!selectedRoomType || !bookingForm.startDate || !bookingForm.endDate) return 0;
    const start = new Date(bookingForm.startDate);
    const end = new Date(bookingForm.endDate);
    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const rate = isMember ? selectedRoomType.memberPricePerNight : selectedRoomType.nonMemberPricePerNight;
    return nights * bookingForm.roomsRequested * rate;
  };

  const getNumberOfNights = () => {
    if (!bookingForm.startDate || !bookingForm.endDate) return 1;
    const start = new Date(bookingForm.startDate);
    const end = new Date(bookingForm.endDate);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  };

  const handleCheckAvailability = async () => {
    if (!bookingModalItem || !selectedRoomType || !bookingForm.startDate || !bookingForm.endDate) {
      toast.error("Please select valid dates");
      return;
    }

    try {
      setCheckingAvailability(true);
      const res = await apiConnector(
        "GET",
        `${DHARAMSHALA_AVAILABILITY_API}?startDate=${bookingForm.startDate}&endDate=${bookingForm.endDate}&dharamshalaId=${bookingModalItem._id}&roomType=${encodeURIComponent(selectedRoomType.name)}`
      );

      if (res.data?.data?.available) {
        setAvailabilityStatus("AVAILABLE");
        toast.success("Rooms are available for selected dates!");
      } else {
        setAvailabilityStatus("UNAVAILABLE");
        toast.error("Dates unavailable due to maintenance or prior booking");
      }
    } catch (err) {
      setAvailabilityStatus("ERROR");
      toast.error(err.response?.data?.message || "Could not verify availability");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingModalItem || !selectedRoomType) return;

    if (!bookingForm.guestName || !bookingForm.guestPhone) {
      toast.error("Please provide guest contact details");
      return;
    }

    const start = new Date(bookingForm.startDate);
    const end = new Date(bookingForm.endDate);
    if (end <= start) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    try {
      setSubmittingBooking(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        dharamshalaId: bookingModalItem._id,
        roomType: selectedRoomType.name,
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate,
        roomsRequested: Number(bookingForm.roomsRequested),
        numberOfGuests: Number(bookingForm.numberOfGuests),
        purpose: bookingForm.purpose,
        guestName: bookingForm.guestName,
        guestEmail: bookingForm.guestEmail,
        guestPhone: bookingForm.guestPhone,
        guestAddress: bookingForm.guestAddress,
        specialRequests: bookingForm.specialRequests,
      };

      const res = await apiConnector("POST", DHARAMSHALA_BOOKINGS_API, payload, headers);

      if (res.data?.success) {
        setBookingSuccessData(res.data.data);
        toast.success("Dharamshala booking request submitted successfully!");
        if (token) fetchMyBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit booking request");
    } finally {
      setSubmittingBooking(false);
    }
  };

  const cities = ["ALL", ...new Set(dharamshalas.map((d) => d.location?.city).filter(Boolean))];

  const filteredDharamshalas = dharamshalas.filter((d) => {
    const matchesCity = selectedCity === "ALL" || d.location?.city === selectedCity;
    const matchesSearch =
      !searchQuery ||
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location?.state?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="relative min-h-screen w-full bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300 pb-20">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[var(--accent-primary)]/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 pb-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
          <div className="eyebrow-badge mb-3">
            <FiHome size={13} />
            <span>Samaj Atithi Griha & Yatri Niwas</span>
          </div>
          <h1 className="heading-hero text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)]">
            Dharamshala <span className="text-gradient">Bookings</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Comfortable, subsidized, and secure accommodations in holy pilgrimage hubs across India. Dedicated service for Samaj members and welcoming pilgrim guests.
          </p>

          {/* Member Pricing Banner */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-4 py-2 text-xs font-semibold text-[var(--text-primary)]">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              {isMember
                ? "✨ Active Samaj Member — Exclusive Member Rates Automatically Applied"
                : "Open to both Samaj Members (Subsidized) and Guest Pilgrims"}
            </span>
          </div>

          {/* Tabs: Browse vs My Bookings */}
          {token && (
            <div className="mt-8 flex rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-1.5 shadow-sm">
              <button
                onClick={() => setActiveTab("browse")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition ${
                  activeTab === "browse"
                    ? "bg-[var(--accent-primary)] text-white shadow"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <FiHome size={14} />
                <span>Browse Dharamshalas</span>
              </button>
              <button
                onClick={() => setActiveTab("my-bookings")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition ${
                  activeTab === "my-bookings"
                    ? "bg-[var(--accent-primary)] text-white shadow"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <FiCalendar size={14} />
                <span>My Bookings ({myBookings.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* ===================== VIEW 1: MY BOOKINGS ===================== */}
        {activeTab === "my-bookings" && token && (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Your Booking History</h2>
              <button
                onClick={fetchMyBookings}
                className="btn-secondary !py-1.5 !px-3 !text-xs"
              >
                Refresh
              </button>
            </div>

            {loadingMyBookings ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent" />
              </div>
            ) : myBookings.length === 0 ? (
              <div className="ka-card p-12 text-center">
                <FiCalendar className="mx-auto h-12 w-12 text-[var(--text-muted)] mb-3" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">No Bookings Found</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 mb-5">
                  You haven't requested any Dharamshala bookings yet.
                </p>
                <button
                  onClick={() => setActiveTab("browse")}
                  className="btn-primary !py-2.5 !px-5 !text-xs"
                >
                  Book a Room Now
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {myBookings.map((b) => (
                  <div
                    key={b._id}
                    className="ka-card p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-[var(--text-primary)]">
                          {b.dharamshalaName || b.dharamshala?.name || "Samaj Dharamshala"}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            b.status === "APPROVED"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : b.status === "PENDING"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : b.status === "CANCELLED"
                              ? "bg-gray-500/15 text-gray-400 border border-gray-500/30"
                              : "bg-red-500/15 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {b.status}
                        </span>
                        {b.isMember && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
                            Member Rate
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[var(--text-secondary)]">
                        <strong>Room Type:</strong> {b.roomType} · <strong>Rooms:</strong> {b.roomsRequested || 1} · <strong>Guests:</strong> {b.numberOfGuests || 1}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] pt-1">
                        <span>
                          📅 Check-in:{" "}
                          <strong className="text-[var(--text-primary)]">
                            {new Date(b.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </strong>
                        </span>
                        <span>
                          📅 Check-out:{" "}
                          <strong className="text-[var(--text-primary)]">
                            {new Date(b.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </strong>
                        </span>
                        <span>
                          💰 Total Amount:{" "}
                          <strong className="text-emerald-400 font-bold">
                            ₹{b.totalAmount || 0}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {["PENDING", "APPROVED"].includes(b.status) && (
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          className="btn-secondary !py-2 !px-4 !text-xs !border-red-500/30 hover:!bg-red-500/10 !text-red-400"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== VIEW 2: BROWSE LISTING ===================== */}
        {activeTab === "browse" && (
          <>
            {/* Filter & Search Bar */}
            <div className="ka-card p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] shrink-0 mr-1">
                  City:
                </span>
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      selectedCity === city
                        ? "bg-[var(--accent-primary)] text-white shadow-sm"
                        : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                    }`}
                  >
                    {city === "ALL" ? "All Locations" : city}
                  </button>
                ))}
              </div>

              <div className="w-full md:w-72">
                <input
                  type="text"
                  placeholder="Search Dharamshala or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ka-input !py-2 !text-xs"
                />
              </div>
            </div>

            {/* Listings Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2].map((n) => (
                  <div key={n} className="ka-card overflow-hidden animate-pulse">
                    <div className="h-56 bg-white/5" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-white/10 rounded w-2/3" />
                      <div className="h-4 bg-white/5 rounded w-1/2" />
                      <div className="h-20 bg-white/5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredDharamshalas.length === 0 ? (
              <div className="ka-card p-12 text-center">
                <FiHome className="mx-auto h-12 w-12 text-[var(--text-muted)] mb-3" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">No Dharamshalas Found</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Try adjusting your city filter or search query.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredDharamshalas.map((dharamshala) => {
                  const lowestMemberPrice = Math.min(
                    ...(dharamshala.roomTypes?.map((r) => r.memberPricePerNight) || [400])
                  );
                  const lowestNonMemberPrice = Math.min(
                    ...(dharamshala.roomTypes?.map((r) => r.nonMemberPricePerNight) || [900])
                  );

                  return (
                    <article
                      key={dharamshala._id}
                      className="ka-card overflow-hidden flex flex-col group border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/40 transition-all duration-300 shadow-md"
                    >
                      {/* Image / Skeleton Placeholder */}
                      <div className="relative h-56 w-full bg-[var(--surface-elevated)] overflow-hidden">
                        {dharamshala.mainImage ? (
                          <img
                            src={dharamshala.mainImage}
                            alt={dharamshala.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <ImageSkeleton
                            aspectRatio="landscape"
                            className="h-full w-full rounded-none"
                            caption={dharamshala.name}
                          />
                        )}

                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                            <FiMapPin size={11} className="text-emerald-400" />
                            {dharamshala.location?.city}, {dharamshala.location?.state}
                          </span>
                        </div>

                        <div className="absolute bottom-3 right-3">
                          <span className="px-3 py-1 rounded-xl bg-emerald-500/90 text-white text-xs font-bold shadow-lg">
                            Active & Open
                          </span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                        <div className="space-y-3">
                          <div>
                            <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
                              {dharamshala.name}
                            </h2>
                            {dharamshala.tagline && (
                              <p className="text-xs font-medium text-[var(--accent-primary)] mt-0.5">
                                {dharamshala.tagline}
                              </p>
                            )}
                          </div>

                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                            {dharamshala.description}
                          </p>

                          {/* Facilities preview */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {dharamshala.facilities?.slice(0, 4).map((facility, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[10px] font-semibold text-[var(--text-secondary)]"
                              >
                                {facility}
                              </span>
                            ))}
                            {dharamshala.facilities?.length > 4 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-[var(--surface-elevated)] text-[10px] font-semibold text-[var(--text-muted)]">
                                +{dharamshala.facilities.length - 4} more
                              </span>
                            )}
                          </div>

                          {/* Room Types summary */}
                          <div className="rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                              Available Accommodations
                            </p>
                            <div className="space-y-1.5">
                              {dharamshala.roomTypes?.map((room, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                  <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                                    <FaBed size={11} className="text-[var(--accent-primary)]" />
                                    {room.name}
                                  </span>
                                  <div className="text-right">
                                    <span className="font-bold text-emerald-400">₹{room.memberPricePerNight}</span>
                                    <span className="text-[10px] text-[var(--text-muted)]"> (Member) / </span>
                                    <span className="text-[11px] text-[var(--text-secondary)]">₹{room.nonMemberPricePerNight}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer: Pricing & CTAs */}
                        <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                              Starts from
                            </p>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-black text-emerald-400">
                                ₹{lowestMemberPrice}
                              </span>
                              <span className="text-xs text-[var(--text-secondary)]">/ night</span>
                              <span className="text-[10px] text-[var(--text-muted)]">
                                (Non-member: ₹{lowestNonMemberPrice})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => setDetailsModalItem(dharamshala)}
                              className="btn-secondary !py-2.5 !px-4 !text-xs flex-1 sm:flex-initial"
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => openBookingModal(dharamshala)}
                              className="btn-primary !py-2.5 !px-5 !text-xs flex-1 sm:flex-initial"
                            >
                              <span>Book Now</span>
                              <FiArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. DHARAMSHALA DETAILS MODAL */}
      {/* ========================================================================= */}
      {detailsModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="ka-card max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative">
            <button
              onClick={() => setDetailsModalItem(null)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white"
            >
              <FiX size={16} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                <FiMapPin size={12} />
                <span>{detailsModalItem.location?.address}, {detailsModalItem.location?.city}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">
                {detailsModalItem.name}
              </h2>
              {detailsModalItem.tagline && (
                <p className="text-xs text-[var(--accent-primary)] font-medium mt-0.5">
                  {detailsModalItem.tagline}
                </p>
              )}
            </div>

            {/* Overview Image */}
            <div className="h-64 w-full rounded-2xl bg-[var(--surface-elevated)] overflow-hidden mb-6">
              {detailsModalItem.mainImage ? (
                <img src={detailsModalItem.mainImage} alt={detailsModalItem.name} className="h-full w-full object-cover" />
              ) : (
                <ImageSkeleton aspectRatio="landscape" className="h-full w-full rounded-2xl" caption={detailsModalItem.name} />
              )}
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  About This Dharamshala
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {detailsModalItem.description}
                </p>
              </div>

              {/* Room Types & Pricing */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Room Options & Tariffs
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {detailsModalItem.roomTypes?.map((room, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-[var(--text-primary)]">{room.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                            Capacity: {room.capacity} Guests
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{room.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {room.amenities?.map((amenity, aIdx) => (
                            <span key={aIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-muted)]">
                              ✓ {amenity}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-emerald-400">
                            ₹{room.memberPricePerNight} <span className="text-[10px] text-[var(--text-muted)] font-normal">/ Member</span>
                          </div>
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            ₹{room.nonMemberPricePerNight} <span className="text-[9px] text-[var(--text-muted)] font-normal">/ Guest</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDetailsModalItem(null);
                            openBookingModal(detailsModalItem, room);
                          }}
                          className="btn-primary !py-1.5 !px-3 !text-xs"
                        >
                          Book Room
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Facilities & Amenities
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {detailsModalItem.facilities?.map((facility, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <FiCheck className="text-emerald-400 shrink-0" size={13} />
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules & Check-in info */}
              <div className="grid sm:grid-cols-2 gap-4 rounded-2xl bg-[var(--surface-elevated)] p-4 border border-[var(--border-subtle)]">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2 flex items-center gap-1.5">
                    <FiClock size={13} className="text-[var(--accent-primary)]" />
                    Timing & Schedule
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    <strong>Check-in:</strong> {detailsModalItem.checkInTime || "12:00 PM"}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    <strong>Check-out:</strong> {detailsModalItem.checkOutTime || "10:00 AM"}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-2">
                    {detailsModalItem.cancellationPolicy}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2 flex items-center gap-1.5">
                    <FiShield size={13} className="text-emerald-400" />
                    Premises Rules
                  </h4>
                  <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
                    {detailsModalItem.rules?.map((rule, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setDetailsModalItem(null)}
                  className="btn-secondary !py-2.5 !px-5 !text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const item = detailsModalItem;
                    setDetailsModalItem(null);
                    openBookingModal(item);
                  }}
                  className="btn-primary !py-2.5 !px-7 !text-xs"
                >
                  Proceed to Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BOOKING MODAL (MEMBERS & GUESTS) */}
      {/* ========================================================================= */}
      {bookingModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="ka-card max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-8 relative">
            <button
              onClick={() => setBookingModalItem(null)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white"
            >
              <FiX size={16} />
            </button>

            {/* If Booking Was Successfully Created */}
            {bookingSuccessData ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <FiCheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-black text-[var(--text-primary)]">
                  Booking Request Submitted!
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                  Your reservation request has been created and sent to the Samaj Dharamshala Administration for confirmation.
                </p>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 text-left space-y-2 max-w-md mx-auto text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Booking Reference:</span>
                    <strong className="text-[var(--text-primary)]">
                      {bookingSuccessData.booking?._id?.slice(-8).toUpperCase()}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Dharamshala:</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {bookingSuccessData.booking?.dharamshalaName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Room Type:</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {bookingSuccessData.booking?.roomType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Check-in:</span>
                    <span>
                      {new Date(bookingSuccessData.booking?.startDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Check-out:</span>
                    <span>
                      {new Date(bookingSuccessData.booking?.endDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[var(--border-subtle)]">
                    <span className="font-bold text-[var(--text-primary)]">Total Amount:</span>
                    <strong className="text-emerald-400 font-bold text-sm">
                      ₹{bookingSuccessData.booking?.totalAmount}
                    </strong>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-4">
                  <button
                    onClick={() => {
                      setBookingModalItem(null);
                      if (token) setActiveTab("my-bookings");
                    }}
                    className="btn-primary !py-2.5 !px-6 !text-xs"
                  >
                    {token ? "View in My Bookings" : "Done"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                {/* Modal Title */}
                <div>
                  <div className="eyebrow-badge mb-1">
                    <FiCalendar size={12} />
                    <span>Reservation Request</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
                    Book Room at {bookingModalItem.name}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {bookingModalItem.location?.city}, {bookingModalItem.location?.state}
                  </p>
                </div>

                {/* Membership Detection Callout */}
                <div
                  className={`rounded-xl p-3.5 border text-xs flex items-center justify-between ${
                    isMember
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiShield size={16} />
                    <div>
                      <p className="font-bold">
                        {isMember ? "Verified Samaj Member" : "Guest / Non-Member Booking"}
                      </p>
                      <p className="text-[11px] opacity-80">
                        {isMember
                          ? "Your member discount is automatically applied by the backend."
                          : "Non-members are welcome to book at standard guest rates."}
                      </p>
                    </div>
                  </div>
                  {!user && (
                    <Link
                      to="/login"
                      className="text-[11px] font-bold underline hover:opacity-80 shrink-0 ml-2"
                    >
                      Member Login
                    </Link>
                  )}
                </div>

                {/* Room Selection */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                    Select Room Type *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {bookingModalItem.roomTypes?.map((room, rIdx) => {
                      const isSelected = selectedRoomType?.name === room.name;
                      const price = isMember ? room.memberPricePerNight : room.nonMemberPricePerNight;

                      return (
                        <div
                          key={rIdx}
                          onClick={() => setSelectedRoomType(room)}
                          className={`cursor-pointer rounded-xl border p-3 transition-all ${
                            isSelected
                              ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 shadow-sm"
                              : "border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:border-white/20"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-[var(--text-primary)]">
                              {room.name}
                            </span>
                            <span className="font-bold text-xs text-emerald-400">
                              ₹{price}/night
                            </span>
                          </div>
                          <p className="text-[10px] text-[var(--text-muted)] mt-1">
                            Up to {room.capacity} Guests · {room.totalRooms} Total Rooms
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dates & Rooms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                      Check-in Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={bookingForm.startDate}
                      onChange={(e) => {
                        setBookingForm({ ...bookingForm, startDate: e.target.value });
                        setAvailabilityStatus(null);
                      }}
                      className="ka-input !text-xs !py-2"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                      Check-out Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={bookingForm.startDate || new Date().toISOString().split("T")[0]}
                      value={bookingForm.endDate}
                      onChange={(e) => {
                        setBookingForm({ ...bookingForm, endDate: e.target.value });
                        setAvailabilityStatus(null);
                      }}
                      className="ka-input !text-xs !py-2"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                      No. of Rooms
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedRoomType?.totalRooms || 5}
                      value={bookingForm.roomsRequested}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, roomsRequested: e.target.value })
                      }
                      className="ka-input !text-xs !py-2"
                    />
                  </div>
                </div>

                {/* Guest Contact Details */}
                <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Guest & Contact Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Guest Name"
                        value={bookingForm.guestName}
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, guestName: e.target.value })
                        }
                        className="ka-input !text-xs !py-2"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        value={bookingForm.guestPhone}
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, guestPhone: e.target.value })
                        }
                        className="ka-input !text-xs !py-2"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="guest@example.com"
                        value={bookingForm.guestEmail}
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, guestEmail: e.target.value })
                        }
                        className="ka-input !text-xs !py-2"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">
                        Number of Total Guests
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={bookingForm.numberOfGuests}
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, numberOfGuests: e.target.value })
                        }
                        className="ka-input !text-xs !py-2"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">
                        Purpose of Visit / Yatra *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pilgrimage, Family Function, Medical Visit"
                        value={bookingForm.purpose}
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, purpose: e.target.value })
                        }
                        className="ka-input !text-xs !py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Price Breakdown & Availability Check */}
                <div className="rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--text-muted)]">
                      Rate Per Night ({isMember ? "Member Tariff" : "Guest Tariff"}):
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      ₹
                      {isMember
                        ? selectedRoomType?.memberPricePerNight
                        : selectedRoomType?.nonMemberPricePerNight}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--text-muted)]">Duration & Rooms:</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {getNumberOfNights()} Nights × {bookingForm.roomsRequested} Room(s)
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between items-center">
                    <span className="font-bold text-sm text-[var(--text-primary)]">
                      Total Estimated Amount:
                    </span>
                    <strong className="text-emerald-400 font-bold text-base">
                      ₹{calculateTotal()}
                    </strong>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCheckAvailability}
                    disabled={checkingAvailability}
                    className="btn-secondary !py-2.5 !px-4 !text-xs"
                  >
                    {checkingAvailability ? "Checking..." : "Verify Availability"}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBooking}
                    className="btn-primary !py-2.5 !px-8 !text-xs disabled:opacity-50"
                  >
                    <span>{submittingBooking ? "Submitting..." : "Confirm & Submit Booking"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DharamshalaPage;
