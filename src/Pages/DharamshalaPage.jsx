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
import { useLanguage } from "../i18n/LanguageContext";
import { formatDharamshalaPrice, getDharamshalaPrice } from "../Utilities/dharamshalaPricing";

const {
  DHARAMSHALAS_API,
  DHARAMSHALA_DETAIL_API,
  DHARAMSHALA_BOOKINGS_API,
  DHARAMSHALA_AVAILABILITY_API,
  MY_DHARAMSHALA_BOOKINGS_API,
  CANCEL_DHARAMSHALA_BOOKING_API,
  CREATE_DHARAMSHALA_PAYMENT_ORDER_API,
  VERIFY_DHARAMSHALA_PAYMENT_API,
} = communityEndpoints;

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const DharamshalaPage = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { t, isHindi } = useLanguage();

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
  const [processingPayment, setProcessingPayment] = useState(null);
  const [bookingRequestKey, setBookingRequestKey] = useState("");

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

  const FALLBACK_DHARAMSHALAS = [
    {
      _id: "ujjain-halba-dharmshala",
      name: "हल्बा समाज धर्मशाला, उज्जैन",
      slug: "halba-samaj-dharmshala-ujjain",
      tagline: "श्री विट्ठल मंदिर परिसर, नरसिंह घाट रोड, कालिका माता मंदिर के पीछे, उज्जैन",
      description:
        "आदिवासी हल्बा/हल्बी समाज कल्याण समिति, उज्जैन द्वारा संचालित अधिकृत धर्मशाला। कुल 05 डबल कमरे (अधिकतम क्षमता 4 व्यक्ति प्रति कमरा) एवं 01 विशाल हॉल। सभी अतिथियों के लिए समान मानक दरें लागू हैं।",
      location: {
        address: "श्री विट्ठल मंदिर, नरसिंह घाट रोड, कालिका माता मंदिर के पीछे",
        city: "Ujjain",
        state: "Madhya Pradesh",
        pincode: "456006",
        landmark: "कालिका माता मंदिर के पीछे, नरसिंह घाट",
      },
      mainImage: "https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&w=1200&q=80",
      roomTypes: [
        {
          name: "AC Double Room (Attached Toilet)",
          description: "02 AC कमरे — अटैच्ड टॉयलेट युक्त। अधिकतम क्षमता 04 व्यक्ति।",
          capacity: 4,
          totalRooms: 2,
          pricePerNight: 1200,
          amenities: ["Air Conditioning", "Attached Toilet", "Double Bed", "Clean Water", "Geyser"],
        },
        {
          name: "Non-AC Double Room (Non-Attached Toilet)",
          description: "03 Non-AC कमरे — नॉन-अटैच्ड टॉयलेट युक्त। अधिकतम क्षमता 04 व्यक्ति।",
          capacity: 4,
          totalRooms: 3,
          pricePerNight: 800,
          amenities: ["Ceiling Fan", "Non-Attached Toilet", "Double Bed", "Clean Water"],
        },
        {
          name: "Community Hall",
          description: "01 विशाल सामुदायिक हॉल। बड़े समूहों और सामुदायिक आयोजनों के लिए।",
          capacity: 25,
          totalRooms: 1,
          pricePerNight: 3000,
          amenities: ["Spacious Hall", "Clean Facilities"],
        },
      ],
      facilities: [
        "श्री विट्ठल-रुक्मिणी मंदिर परिसर",
        "नरसिंह घाट व पवित्र क्षिप्रा तट के निकट",
        "24 घंटे जल एवं प्रकाश व्यवस्था",
        "शांत एवं सुरक्षित आध्यात्मिक वातावरण",
      ],
      rules: [
        "ओरिजिनल आईडी (Original ID) के बिना प्रवेश की अनुमति नहीं दी जाएगी।",
        "धूम्रपान (Smoking) परिसर में पूर्णतः वर्जित है।",
        "मद्यपान / शराब (Drinking) पूर्णतः प्रतिबंधित है।",
        "मांसाहार (Non-veg) परिसर में सख्त मना है।",
        "यात्री अपने कीमती सामान की सुरक्षा के लिए स्वयं जिम्मेदार हैं।",
        "चेक-इन: 12:00 AM (क्लाइंट द्वारा प्रेषित — पुष्टि हेतु चिन्हित) | चेक-आउट: 10:00 AM",
        "24 घंटे पूर्व निरस्तीकरण पर रिफंड नियम लागू | 24 घंटे के बाद कोई रिफंड नहीं",
      ],
      checkInTime: "12:00 AM",
      checkOutTime: "10:00 AM",
      contactPhone: "+91 99260 18058",
      contactEmail: "halbahalbiujjain79@gmail.com",
    },
  ];

  const fetchDharamshalas = async () => {
    try {
      setLoading(true);
      const res = await apiConnector("GET", DHARAMSHALAS_API);
      const list = res.data?.data?.dharamshalas;
      if (Array.isArray(list) && list.length > 0) {
        setDharamshalas(list);
      } else {
        setDharamshalas(FALLBACK_DHARAMSHALAS);
      }
    } catch (err) {
      console.error("Failed to fetch dharamshalas, using official fallback:", err);
      setDharamshalas(FALLBACK_DHARAMSHALAS);
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
    if (submittingBooking || checkingAvailability) return;
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

  const handleDharamshalaPayment = async (booking) => {
    if (!token || processingPayment) return;
    setProcessingPayment(booking._id);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay checkout could not be loaded.");
      const authHeaders = { Authorization: `Bearer ${token}` };
      const orderResponse = await apiConnector("POST", CREATE_DHARAMSHALA_PAYMENT_ORDER_API(booking._id), null, authHeaders);
      const { order, key } = orderResponse.data?.data || {};
      if (!order?.id || !key) throw new Error("Payment gateway is not configured.");

      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key,
          amount: order.amount,
          currency: order.currency || "INR",
          name: booking.dharamshalaName || "Halba Samaj Dharamshala",
          description: `${booking.bookingReference || "Dharamshala booking"} - ${booking.roomType}`,
          order_id: order.id,
          prefill: { name: booking.guestName || "", email: booking.guestEmail || user?.email || "", contact: booking.guestPhone || "" },
          handler: async (response) => {
            try {
              await apiConnector("POST", VERIFY_DHARAMSHALA_PAYMENT_API, response, authHeaders);
              toast.success("Payment verified. Your Dharamshala booking is confirmed.");
              await fetchMyBookings();
              resolve();
            } catch (error) {
              reject(new Error(error.response?.data?.message || "Payment verification failed"));
            }
          },
          modal: { ondismiss: () => reject(new Error("Payment was cancelled")) },
        });
        checkout.open();
      });
    } catch (error) {
      toast.error(error.message || "Payment could not be completed");
    } finally {
      setProcessingPayment(null);
    }
  };

  const openBookingModal = (dharamshala, defaultRoom = null) => {
    setBookingModalItem(dharamshala);
    const room = defaultRoom || dharamshala.roomTypes?.[0] || null;
    setSelectedRoomType(room);
    setAvailabilityStatus(null);
    setBookingSuccessData(null);
    setBookingRequestKey(window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);

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
    const rate = getDharamshalaPrice(selectedRoomType);
    if (!rate) return null;
    return nights * Number(bookingForm.roomsRequested) * rate;
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
        `${DHARAMSHALA_AVAILABILITY_API}?startDate=${bookingForm.startDate}&endDate=${bookingForm.endDate}&dharamshalaId=${bookingModalItem._id}&roomType=${encodeURIComponent(selectedRoomType.name)}&roomsRequested=${Number(bookingForm.roomsRequested)}`
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
    if (submittingBooking) return;
    if (!bookingModalItem || !selectedRoomType) return;

    if (!getDharamshalaPrice(selectedRoomType)) {
      toast.error("Pricing is unavailable. Please contact the Dharamshala team.");
      return;
    }

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
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Idempotency-Key": bookingRequestKey,
      };

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
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300  pb-20 ">
      {/* Background Decor Contained */}
      <div className="overflow-hidden pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] max-w-[100vw] h-[350px] bg-[var(--accent-primary)]/10 blur-[140px] rounded-full" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
          <div className="eyebrow-badge mb-3">
            <FiHome size={13} />
            <span>{isHindi ? "समाज अतिथि गृह एवं विश्राम स्थल" : "Samaj Atithi Griha & Yatri Niwas"}</span>
          </div>
          <h1 className="heading-hero text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)]">
            {isHindi ? "धर्मशाला " : "Dharamshala "}<span className="text-gradient">{isHindi ? "बुकिंग सेवा" : "Bookings"}</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {isHindi
              ? "देशभर के प्रमुख तीर्थ स्थलों पर समाज बंधुओं एवं आगंतुक तीर्थयात्रियों हेतु स्वच्छ, सुरक्षित एवं व्यवस्थित आवास व्यवस्था।"
              : "Comfortable and secure accommodations in holy pilgrimage hubs across India for community members and visiting pilgrims."}
          </p>

          {/* Standard Pricing Banner */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-4 py-2 text-xs font-semibold text-[var(--text-primary)]">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              {isHindi ? "सभी अतिथियों के लिए समान दरें लागू" : "Standard room rates apply to all guests"}
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
                <span>{isHindi ? "धर्मशाला सूची देखें" : "Browse Dharamshalas"}</span>
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
                <span>{isHindi ? `मेरी बुकिंग्स (${myBookings.length})` : `My Bookings (${myBookings.length})`}</span>
              </button>
            </div>
          )}
        </div>

        {/* ===================== VIEW 1: MY BOOKINGS ===================== */}
        {activeTab === "my-bookings" && token && (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {isHindi ? "आपकी पूर्व बुकिंग का विवरण" : "Your Booking History"}
              </h2>
              <button
                onClick={fetchMyBookings}
                className="btn-secondary !py-1.5 !px-3 !text-xs"
              >
                {isHindi ? "ताज़ा करें" : "Refresh"}
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
                            ["APPROVED", "PAYMENT_PENDING"].includes(b.status)
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : b.status === "PENDING"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : b.status === "CANCELLED"
                              ? "bg-gray-500/15 text-gray-400 border border-gray-500/30"
                              : "bg-red-500/15 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {b.status === "PAYMENT_PENDING" ? "PAYMENT REQUIRED" : b.status}
                        </span>
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
                            {formatDharamshalaPrice(b.totalAmount, "Contact for pricing")}
                          </strong>
                        </span>
                      </div>
                      {/* Pending Status Guidance */}
                      {b.status === "PENDING" && (
                        <p className="text-[11px] text-amber-500/90 dark:text-amber-300/90 font-medium pt-1">
                          ⏳ {isHindi ? "आपकी बुकिंग अनुरोध प्रशासक समीक्षा की प्रतीक्षा में है।" : "Your booking request is waiting for admin review."}
                        </p>
                      )}
                      {["APPROVED", "PAYMENT_PENDING"].includes(b.status) && (
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <p className="text-[11px] font-semibold text-amber-500">Payment required to confirm this booking.</p>
                          <button type="button" onClick={() => handleDharamshalaPayment(b)} disabled={processingPayment === b._id} className="btn-primary !py-2 !px-4 !text-xs disabled:opacity-50">
                            {processingPayment === b._id ? "Opening payment..." : "Pay Now"}
                          </button>
                        </div>
                      )}

                      {/* Admin Review Note / Rejection Reason / Cancellation Reason */}
                      {((b.status === "REJECTED" && (b.reviewNote || b.reviewMessage)) ||
                        (b.status === "APPROVED" && (b.reviewNote || b.reviewMessage)) ||
                        (b.status === "CANCELLED" && b.cancellationReason)) && (
                        <div
                          className={`mt-4 rounded-2xl border p-3.5 text-xs ${
                            b.status === "REJECTED"
                              ? "border-red-500/30 bg-red-500/10 dark:bg-red-950/30 text-red-500 dark:text-red-300"
                              : b.status === "APPROVED"
                              ? "border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-300"
                              : "border-gray-500/30 bg-gray-500/10 text-gray-500 dark:text-gray-300"
                          }`}
                        >
                          <p className="font-bold uppercase tracking-wider text-[10px]">
                            {b.status === "CANCELLED"
                              ? isHindi ? "रद्दीकरण का कारण" : "Cancellation Reason"
                              : b.status === "APPROVED"
                              ? isHindi ? "प्रशासक टिप्पणी" : "Admin Note"
                              : isHindi ? "प्रशासक समीक्षा / अस्वीकृति का कारण" : "Admin Review / Rejection Reason"}
                          </p>
                          <p className="mt-1 leading-relaxed text-[var(--text-primary)] font-normal text-xs">
                            {b.status === "CANCELLED" ? b.cancellationReason : (b.reviewNote || b.reviewMessage)}
                          </p>
                        </div>
                      )}
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
                  const roomPrices = (dharamshala.roomTypes || [])
                    .map(getDharamshalaPrice)
                    .filter((price) => price !== null);
                  const lowestPrice = roomPrices.length ? Math.min(...roomPrices) : null;

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
                                    <span className="font-bold text-emerald-400">{formatDharamshalaPrice(getDharamshalaPrice(room))}</span>
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
                                {formatDharamshalaPrice(lowestPrice, "Contact for pricing")}
                              </span>
                              {lowestPrice && <span className="text-xs text-[var(--text-secondary)]">/ night</span>}
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
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden">
    <div className="ka-card w-full max-w-4xl h-[92dvh] sm:h-auto sm:max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl border-t sm:border border-[var(--border-strong)] bg-[var(--surface-card)] shadow-2xl overflow-hidden">
      
      {/* Mobile Visual Drag Handle */}
      <div className="w-12 h-1 bg-[var(--border-subtle)] rounded-full mx-auto mt-2 sm:hidden shrink-0" />

      {/* Fixed Header */}
      <div className="relative flex items-start justify-between p-4 sm:p-6 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]/50 shrink-0">
        <div className="pr-10 max-w-full">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 max-w-full">
            <FiMapPin size={12} className="shrink-0" />
            <span className="truncate">{detailsModalItem.location?.address}, {detailsModalItem.location?.city}</span>
          </div>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-[var(--text-primary)] leading-snug break-words">
            {detailsModalItem.name}
          </h2>
          {detailsModalItem.tagline && (
            <p className="text-xs text-[var(--accent-primary)] font-medium mt-0.5 line-clamp-1">
              {detailsModalItem.tagline}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDetailsModalItem(null)}
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors shrink-0"
        >
          <FiX size={16} />
        </button>
      </div>

      {/* Main Scrollable Body */}
      <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1 custom-scrollbar">
        
        {/* Responsive Grid: Image + Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-start">
          <div className="md:col-span-5 h-40 sm:h-56 md:h-full min-h-[160px] w-full rounded-xl sm:rounded-2xl bg-[var(--surface-elevated)] overflow-hidden shrink-0">
            {detailsModalItem.mainImage ? (
              <img src={detailsModalItem.mainImage} alt={detailsModalItem.name} className="h-full w-full object-cover" />
            ) : (
              <ImageSkeleton aspectRatio="landscape" className="h-full w-full rounded-xl sm:rounded-2xl" caption={detailsModalItem.name} />
            )}
          </div>
          
          <div className="md:col-span-7 flex flex-col justify-between space-y-3 sm:space-y-4">
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                About This Dharamshala
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {detailsModalItem.description}
              </p>
            </div>

            {/* Timings & Rules */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 rounded-xl bg-[var(--surface-elevated)] p-2.5 sm:p-3 border border-[var(--border-subtle)]">
              <div>
                <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1 flex items-center gap-1">
                  <FiClock size={11} className="text-[var(--accent-primary)] shrink-0" />
                  Timings
                </h4>
                <p className="text-[11px] sm:text-xs text-[var(--text-secondary)]"><strong>In:</strong> {detailsModalItem.checkInTime || "12:00 PM"}</p>
                <p className="text-[11px] sm:text-xs text-[var(--text-secondary)]"><strong>Out:</strong> {detailsModalItem.checkOutTime || "10:00 AM"}</p>
              </div>

              <div>
                <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1 flex items-center gap-1">
                  <FiShield size={11} className="text-emerald-400 shrink-0" />
                  Rules
                </h4>
                <ul className="space-y-0.5 text-[11px] sm:text-xs text-[var(--text-secondary)]">
                  {detailsModalItem.rules?.slice(0, 2).map((rule, rIdx) => (
                    <li key={rIdx} className="truncate">• {rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Room Types & Pricing Section */}
        <div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
            Room Options & Tariffs
          </h3>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {detailsModalItem.roomTypes?.map((room, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3 sm:p-3.5 flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">{room.name}</h4>
                    <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shrink-0">
                      Cap: {room.capacity}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{room.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {room.amenities?.map((amenity, aIdx) => (
                      <span key={aIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-muted)]">
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-emerald-400">
                      {formatDharamshalaPrice(getDharamshalaPrice(room))} {getDharamshalaPrice(room) && <span className="text-[9px] text-[var(--text-muted)] font-normal">/ night</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDetailsModalItem(null);
                      openBookingModal(detailsModalItem, room);
                    }}
                    className="btn-primary !py-1.5 !px-3 !text-xs shrink-0"
                  >
                    Book Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities Section */}
        <div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Facilities & Amenities
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {detailsModalItem.facilities?.map((facility, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[var(--text-secondary)] bg-[var(--surface-elevated)]/40 p-1.5 sm:p-2 rounded-lg border border-[var(--border-subtle)]">
                <FiCheck className="text-emerald-400 shrink-0" size={12} />
                <span className="truncate">{facility}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Fixed Sticky Footer */}
      <div className="p-3 sm:p-4 border-t border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-end gap-2.5 shrink-0">
        <button
          type="button"
          onClick={() => setDetailsModalItem(null)}
          className="btn-secondary !py-2.5 sm:!py-2 !px-4 !text-xs flex-1 sm:flex-none"
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
          className="btn-primary !py-2.5 sm:!py-2 !px-6 !text-xs flex-1 sm:flex-none"
        >
          Proceed to Book
        </button>
      </div>

    </div>
  </div>
)}

      {/* ========================================================================= */}
      {/* 2. BOOKING MODAL (MEMBERS & GUESTS) */}
      {/* ========================================================================= */}
      {bookingModalItem && (
<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden">
  <div className="ka-card max-w-2xl w-full h-[90dvh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl border-t sm:border border-[var(--border-strong)] bg-[var(--surface-card)] shadow-2xl overflow-hidden">
    
    {/* Fixed Header with Close Button */}
    <div className="relative flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]/50 shrink-0">
      <div>
        <div className="eyebrow-badge mb-1 flex items-center gap-1.5 text-xs">
          <FiCalendar size={12} />
          <span>Reservation Request</span>
        </div>
        <h2 className="text-lg sm:text-2xl font-black text-[var(--text-primary)] leading-tight">
          Book Room at {bookingModalItem?.name}
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          {bookingModalItem?.location?.city}, {bookingModalItem?.location?.state}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setBookingModalItem(null)}
        className="h-8 w-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors shrink-0"
      >
        <FiX size={16} />
      </button>
    </div>

    {/* Scrollable Form Body */}
    <div className="overflow-y-auto p-4 sm:p-6 flex-1 custom-scrollbar">
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
                {formatDharamshalaPrice(bookingSuccessData.booking?.totalAmount, "Contact for pricing")}
              </strong>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              type="button"
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
          {/* Booking Information Callout */}
          <div
            className="rounded-xl p-3.5 border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <FiShield size={16} />
              <div>
                <p className="font-bold">
                  Reservation Request
                </p>
                <p className="text-[11px] opacity-80">
                  Standard room rates apply for all guests and requests are reviewed by the Dharamshala team.
                </p>
              </div>
            </div>
            {!user && (
              <Link
                to="/login"
                className="text-[11px] font-bold underline hover:opacity-80 shrink-0 ml-2"
              >
                Login
              </Link>
            )}
          </div>

          {/* Room Selection */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
              Select Room Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {bookingModalItem?.roomTypes?.map((room, rIdx) => {
                const isSelected = selectedRoomType?.name === room.name;
                const price = getDharamshalaPrice(room);

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
                        {formatDharamshalaPrice(price)}{price && "/night"}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          {/* Price Breakdown */}
          <div className="rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-muted)]">
                Rate Per Night:
              </span>
              <span className="font-semibold text-[var(--text-primary)]">
                {formatDharamshalaPrice(getDharamshalaPrice(selectedRoomType))}
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
                {calculateTotal() ? formatDharamshalaPrice(calculateTotal()) : "Contact for pricing"}
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
</div>
      )}
    </div>
  );
};

export default DharamshalaPage;
