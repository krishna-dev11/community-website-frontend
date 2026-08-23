import React, { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import {
  FaCalendarCheck,
  FaCheck,
  FaComments,
  FaExclamationCircle,
  FaAward,
  FaHeart,
  FaIdCard,
  FaPaperPlane,
  FaPoll,
  FaSyncAlt,
  FaDownload,
} from "react-icons/fa";
import {
  FiCheckCircle,
  FiShield,
  FiUserCheck,
  FiDownload,
  FiAward,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";
import QRCode from "react-qr-code";
import { jsPDF } from "jspdf";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { communityEndpoints } from "../../../../services/apis";
import FileUploadWithPreview from "../../../Common/FileUploadWithPreview";
import { generateCardImage } from "../../../Common/MembershipCardModal";

const tabs = [
  { key: "card", label: "Membership Card", icon: FaIdCard },
  { key: "issues", label: "Issues", icon: FaExclamationCircle },
  { key: "bookings", label: "Bookings", icon: FaCalendarCheck },
  { key: "polls", label: "Polls", icon: FaPoll },
  { key: "posts", label: "Posts", icon: FaComments },
  { key: "achievements", label: "Achievements", icon: FaAward },
  { key: "shradhanjali", label: "Tribute / Shradhanjali", icon: FaHeart },
];

const inputClass = "ka-input";
const textareaClass = "ka-input !min-h-24 resize-none !py-3";

const Button = ({ children, icon: Icon, tone = "neutral", className = "", ...props }) => {
  const toneClasses = {
    neutral: "btn-secondary !py-2 !px-4 !text-xs",
    success: "btn-primary !py-2 !px-5 !text-xs",
    warning: "inline-flex items-center justify-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 font-bold text-xs uppercase tracking-wider px-4 py-2 transition-all hover:bg-amber-400/20 disabled:opacity-50 cursor-pointer",
  };

  return (
    <button
      {...props}
      className={`${toneClasses[tone] || toneClasses.neutral} ${className} cursor-pointer`}
    >
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </button>
  );
};


const Field = ({ label, children }) => (
  <label className="grid gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
    {children}
  </label>
);

const Status = ({ value }) => {
  const styles = {
    PUBLISHED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    ACTIVE: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    APPROVED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    UNDER_REVIEW: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    REJECTED: "border-red-400/30 bg-red-400/10 text-red-200",
    ARCHIVED: "border-gray-400/30 bg-gray-400/10 text-gray-200",
  };

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
        styles[value] || "border-white/10 bg-white/[0.03] text-gray-300"
      }`}
    >
      {value}
    </span>
  );
};

const Empty = ({ text }) => (
  <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-xs text-gray-500">
    {text}
  </div>
);

const formatDate = (value) => {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const CommunityHub = () => {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("card");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [card, setCard] = useState(null);
  const [downloadingCard, setDownloadingCard] = useState(false);
  const cardRef = useRef(null);

  const [issues, setIssues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [polls, setPolls] = useState([]);
  const [posts, setPosts] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [shradhanjalis, setShradhanjalis] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});

  const [issueForm, setIssueForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    priority: "MEDIUM",
  });
  const [bookingForm, setBookingForm] = useState({
    startDate: "",
    endDate: "",
    purpose: "",
    roomsRequested: 1,
  });
  const [availability, setAvailability] = useState(null);
  const [postForm, setPostForm] = useState({ title: "", body: "", category: "" });

  // Achievements & Shradhanjali with actual file uploads
  const [achievementForm, setAchievementForm] = useState({
    title: "",
    achieverName: "",
    category: "",
    description: "",
  });
  const [achievementImageFile, setAchievementImageFile] = useState(null);

  const [shradhanjaliForm, setShradhanjaliForm] = useState({
    personName: "",
    message: "",
    dateOfBirth: "",
    dateOfPassing: "",
  });
  const [shradhanjaliPhotoFile, setShradhanjaliPhotoFile] = useState(null);

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  const loadCard = async () => {
    try {
      const response = await apiConnector("GET", communityEndpoints.MEMBERSHIP_CARD_API, null, authConfig);
      setCard(response.data?.data?.card || null);
    } catch {
      setCard(null);
    }
  };

  const loadIssues = async () => {
    const response = await apiConnector("GET", communityEndpoints.ISSUES_API, null, authConfig, {
      mine: "true",
      limit: 20,
    });
    setIssues(response.data?.data?.issues || []);
  };

  const loadBookings = async () => {
    const response = await apiConnector("GET", communityEndpoints.MY_DHARAMSHALA_BOOKINGS_API, null, authConfig, {
      limit: 20,
    });
    setBookings(response.data?.data?.bookings || []);
  };

  const loadPolls = async () => {
    const response = await apiConnector("GET", communityEndpoints.POLLS_API, null, authConfig, { limit: 20 });
    setPolls(response.data?.data?.polls || []);
  };

  const loadPosts = async () => {
    const response = await apiConnector("GET", communityEndpoints.POSTS_API, null, authConfig, { limit: 20 });
    setPosts(response.data?.data?.posts || []);
  };

  const loadAchievements = async () => {
    const response = await apiConnector("GET", communityEndpoints.ACHIEVEMENTS_API, null, authConfig, { limit: 20 });
    setAchievements(response.data?.data?.achievements || []);
  };

  const loadShradhanjalis = async () => {
    const response = await apiConnector("GET", communityEndpoints.SHRADHANJALIS_API, null, authConfig, { limit: 20 });
    setShradhanjalis(response.data?.data?.shradhanjalis || []);
  };

  const refreshActive = async () => {
    setLoading(true);
    try {
      if (activeTab === "card") await loadCard();
      if (activeTab === "issues") await loadIssues();
      if (activeTab === "bookings") await loadBookings();
      if (activeTab === "polls") await loadPolls();
      if (activeTab === "posts") await loadPosts();
      if (activeTab === "achievements") await loadAchievements();
      if (activeTab === "shradhanjali") await loadShradhanjalis();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load community data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshActive();
  }, [activeTab]);

  const updateIssue = (key, value) => setIssueForm((current) => ({ ...current, [key]: value }));
  const updateBooking = (key, value) => setBookingForm((current) => ({ ...current, [key]: value }));
  const updatePost = (key, value) => setPostForm((current) => ({ ...current, [key]: value }));
  const updateAchievement = (key, value) => setAchievementForm((current) => ({ ...current, [key]: value }));
  const updateShradhanjali = (key, value) => setShradhanjaliForm((current) => ({ ...current, [key]: value }));

  const handleDownloadCard = async () => {
    if (!card) return;
    try {
      setDownloadingCard(true);
      const verificationUrl = card?.memberId
        ? `${window.location.origin}/verify-member/${card.memberId}`
        : `${window.location.origin}/verify-member/sample`;

      const formattedMemberId = card?.memberId
        ? `SMJ-${String(card.memberId).slice(-8).toUpperCase()}`
        : "SMJ-MEMBER";

      const imageBase64 = await generateCardImage(card, verificationUrl, formattedMemberId);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [148, 105],
      });

      pdf.addImage(imageBase64, "PNG", 4, 4, 140, 97);
      const cleanName = (card?.name || "Member").replace(/\s+/g, "_");
      pdf.save(`Samaj_Membership_Card_${cleanName}.pdf`);
      toast.success("Membership card PDF downloaded!");
    } catch (err) {
      console.error("Card download error:", err);
      toast.error("Failed to generate PDF card");
    } finally {
      setDownloadingCard(false);
    }
  };

  const submitIssue = async (event) => {
    event.preventDefault();
    setBusyId("issue");
    try {
      await apiConnector("POST", communityEndpoints.ISSUES_API, issueForm, authConfig);
      toast.success("Issue submitted");
      setIssueForm({ title: "", description: "", category: "", location: "", priority: "MEDIUM" });
      await loadIssues();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit issue");
    } finally {
      setBusyId(null);
    }
  };

  const checkAvailability = async () => {
    if (!bookingForm.startDate || !bookingForm.endDate) {
      toast.error("Select start and end dates first");
      return;
    }
    setBusyId("availability");
    try {
      const response = await apiConnector("GET", communityEndpoints.DHARAMSHALA_AVAILABILITY_API, null, authConfig, {
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate,
      });
      setAvailability(response.data?.data || null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to check availability");
    } finally {
      setBusyId(null);
    }
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setBusyId("booking");
    try {
      await apiConnector("POST", communityEndpoints.DHARAMSHALA_BOOKINGS_API, bookingForm, authConfig);
      toast.success("Dharamshala booking request submitted");
      setBookingForm({ startDate: "", endDate: "", purpose: "", roomsRequested: 1 });
      setAvailability(null);
      await loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit booking");
    } finally {
      setBusyId(null);
    }
  };

  const submitVote = async (pollId, optionId) => {
    setBusyId(`vote-${pollId}`);
    try {
      await apiConnector("POST", communityEndpoints.VOTE_API(pollId), { optionId }, authConfig);
      toast.success("Vote recorded");
      await loadPolls();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit vote");
    } finally {
      setBusyId(null);
    }
  };

  const submitPost = async (event) => {
    event.preventDefault();
    setBusyId("post");
    try {
      await apiConnector("POST", communityEndpoints.POSTS_API, postForm, authConfig);
      toast.success("Discussion post published");
      setPostForm({ title: "", body: "", category: "" });
      await loadPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to publish post");
    } finally {
      setBusyId(null);
    }
  };

  const loadComments = async (postId) => {
    setBusyId(`comments-${postId}`);
    try {
      const response = await apiConnector("GET", communityEndpoints.POST_COMMENTS_API(postId), null, authConfig, {
        limit: 30,
      });
      setCommentsByPost((current) => ({ ...current, [postId]: response.data?.data?.comments || [] }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load comments");
    } finally {
      setBusyId(null);
    }
  };

  const addComment = async (postId) => {
    const body = commentDrafts[postId]?.trim();
    if (!body) return;
    setBusyId(`comment-${postId}`);
    try {
      await apiConnector("POST", communityEndpoints.POST_COMMENTS_API(postId), { body }, authConfig);
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
      await loadComments(postId);
      await loadPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to add comment");
    } finally {
      setBusyId(null);
    }
  };

  // Submit Achievement with actual Image File
  const submitAchievement = async (event) => {
    event.preventDefault();
    setBusyId("achievement");
    try {
      const formData = new FormData();
      formData.append("title", achievementForm.title);
      formData.append("achieverName", achievementForm.achieverName);
      formData.append("category", achievementForm.category || "General");
      formData.append("description", achievementForm.description);

      if (achievementImageFile instanceof File) {
        formData.append("image", achievementImageFile);
      }

      await apiConnector("POST", communityEndpoints.ACHIEVEMENTS_API, formData, authConfig);
      toast.success("Achievement submitted for review");
      setAchievementForm({ title: "", achieverName: "", category: "", description: "" });
      setAchievementImageFile(null);
      await loadAchievements();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit achievement");
    } finally {
      setBusyId(null);
    }
  };

  // Submit Shradhanjali with actual Photo File
  const submitShradhanjali = async (event) => {
    event.preventDefault();
    setBusyId("shradhanjali");
    try {
      const formData = new FormData();
      formData.append("personName", shradhanjaliForm.personName);
      formData.append("message", shradhanjaliForm.message);
      if (shradhanjaliForm.dateOfBirth) formData.append("dateOfBirth", shradhanjaliForm.dateOfBirth);
      formData.append("dateOfPassing", shradhanjaliForm.dateOfPassing);

      if (shradhanjaliPhotoFile instanceof File) {
        formData.append("photo", shradhanjaliPhotoFile);
      }

      await apiConnector("POST", communityEndpoints.SHRADHANJALIS_API, formData, authConfig);
      toast.success("Shradhanjali tribute submitted for review");
      setShradhanjaliForm({ personName: "", message: "", dateOfBirth: "", dateOfPassing: "" });
      setShradhanjaliPhotoFile(null);
      await loadShradhanjalis();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit tribute");
    } finally {
      setBusyId(null);
    }
  };

  const verificationUrl = card?.memberId
    ? `${window.location.origin}/verify-member/${card.memberId}`
    : `${window.location.origin}/verify-member/sample`;

  return (
    <div className="min-h-screen bg-[var(--bg)] px-3 py-6 text-[var(--text-primary)] md:px-6 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Hub Header */}
        <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow-badge mb-2">Member Space</div>
              <h1 className="heading-hero text-[var(--text-primary)]">Community <span className="text-gradient">Hub</span></h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
                View your official membership card, submit achievements & tributes, raise community issues, and participate in voting.
              </p>
            </div>
            <Button icon={FaSyncAlt} onClick={refreshActive} disabled={loading}>
              Refresh
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex h-10 items-center justify-center gap-2 rounded-full px-4 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    active
                      ? "bg-[var(--accent-primary)] text-[#070707] shadow-md"
                      : "border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
          </div>
        ) : (

          <>
            {/* TAB 1: MEMBERSHIP CARD */}
            {activeTab === "card" && (
              <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl sm:p-8">
                {card ? (
                  <div className="flex flex-col items-center gap-8">
                    {/* Rendered Digital Card Container */}
                    <div
                      ref={cardRef}
                      className="relative w-full max-w-xl overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-[#0c1c16] via-[#06120d] to-[#040806] p-7 text-white shadow-2xl"
                    >
                      {/* Decorative background effects */}
                      <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-500/20 blur-3xl" />
                      <div className="pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-teal-500/15 blur-3xl" />
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

                      {/* Header */}
                      <div className="relative flex items-center justify-between border-b border-emerald-500/30 pb-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-tr from-amber-500/20 to-emerald-500/30 shadow-md">
                            <span className="text-lg font-black text-amber-300">ॐ</span>
                          </div>
                          <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-amber-300">
                              SHRI SAMAJ COMMUNITY TRUST
                            </h3>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                              Official Verified Identity Card
                            </p>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                          <FiCheckCircle size={11} /> Active
                        </div>
                      </div>

                      {/* Body */}
                      <div className="relative mt-5 grid grid-cols-[1fr_auto] items-center gap-5">
                        <div className="flex items-start gap-4">
                          {/* Photo */}
                          <div className="relative shrink-0">
                            <img
                              src={
                                card.photo ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${card.name || "Member"}`
                              }
                              alt={card.name}
                              crossOrigin="anonymous"
                              className="h-24 w-24 rounded-2xl border-2 border-emerald-400/60 object-cover shadow-xl"
                            />
                            <div className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-black bg-emerald-400 text-black">
                              <FiUserCheck size={12} />
                            </div>
                          </div>

                          <div className="space-y-1.5 text-left">
                            <div>
                              <h4 className="text-xl font-black tracking-tight text-white">{card.name}</h4>
                              <p className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                                {card.memberId
                                  ? `SMJ-${String(card.memberId).slice(-8).toUpperCase()}`
                                  : "SMJ-MEMBER"}
                              </p>
                            </div>

                            {card.family?.familyName && (
                              <p className="text-xs text-gray-300">
                                Family: <span className="font-bold text-white">{card.family.familyName}</span>
                              </p>
                            )}

                            <div className="flex flex-wrap gap-x-3 text-[10px] text-gray-400">
                              <span>Issued: {card.issuedAt ? new Date(card.issuedAt).toLocaleDateString("en-IN") : "Active"}</span>
                              <span>·</span>
                              <span className="font-semibold text-emerald-300">Lifetime Verified</span>
                            </div>
                          </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex flex-col items-center rounded-2xl border border-emerald-500/30 bg-white p-2.5 shadow-xl">
                          <div className="h-20 w-20">
                            <QRCode
                              value={verificationUrl}
                              size={80}
                              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                              viewBox={`0 0 80 80`}
                            />
                          </div>
                          <span className="mt-1 text-[8px] font-black uppercase tracking-wider text-black">
                            Scan To Verify
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="relative mt-5 flex items-center justify-between border-t border-emerald-500/20 pt-2.5 text-[9px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiShield size={10} className="text-emerald-400" /> Digital Credential Standard
                        </span>
                        <span className="font-mono font-bold tracking-widest text-emerald-400">
                          SMJ-SECURITY-AUTHENTICATED
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <button
                        onClick={handleDownloadCard}
                        disabled={downloadingCard}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-xl shadow-emerald-500/25 transition-all hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50"
                      >
                        <FiDownload size={15} />
                        {downloadingCard ? "Generating High-Res Card..." : "Download Digital Membership Card"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <Empty text="Membership card will be generated automatically once your application is approved by the Super Admin." />
                )}
              </section>
            )}

            {/* TAB 2: ISSUES */}
            {activeTab === "issues" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submitIssue} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Submit Community Issue</h2>
                  <Field label="Title">
                    <input className={inputClass} value={issueForm.title} onChange={(event) => updateIssue("title", event.target.value)} required />
                  </Field>
                  <Field label="Description">
                    <textarea className={textareaClass} value={issueForm.description} onChange={(event) => updateIssue("description", event.target.value)} required />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Category">
                      <input className={inputClass} value={issueForm.category} onChange={(event) => updateIssue("category", event.target.value)} placeholder="Water, road, event" />
                    </Field>
                    <Field label="Priority">
                      <select className={inputClass} value={issueForm.priority} onChange={(event) => updateIssue("priority", event.target.value)}>
                        <option value="LOW" className="bg-gray-900">Low</option>
                        <option value="MEDIUM" className="bg-gray-900">Medium</option>
                        <option value="HIGH" className="bg-gray-900">High</option>
                        <option value="URGENT" className="bg-gray-900">Urgent</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Location / Area">
                    <input className={inputClass} value={issueForm.location} onChange={(event) => updateIssue("location", event.target.value)} />
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "issue"}>
                    Submit Issue
                  </Button>
                </form>

                <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Your Submitted Issues</h2>
                  <div className="mt-4 divide-y divide-white/10">
                    {issues.map((issue) => (
                      <article key={issue._id} className="py-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="font-bold text-white">{issue.title}</h3>
                            <p className="mt-1 text-xs text-gray-500">{issue.category || "General"} · {formatDate(issue.createdAt)}</p>
                          </div>
                          <Status value={issue.status} />
                        </div>
                        <p className="mt-2 text-xs text-gray-400">{issue.description}</p>
                      </article>
                    ))}
                    {issues.length === 0 && <Empty text="No community issues submitted yet." />}
                  </div>
                </section>
              </div>
            )}

            {/* TAB 3: DHARAMSHALA BOOKINGS */}
            {activeTab === "bookings" && (
              <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <form onSubmit={submitBooking} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Request Dharamshala Booking</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Check-in Date">
                      <input type="date" className={inputClass} value={bookingForm.startDate} onChange={(event) => updateBooking("startDate", event.target.value)} required />
                    </Field>
                    <Field label="Check-out Date">
                      <input type="date" className={inputClass} value={bookingForm.endDate} onChange={(event) => updateBooking("endDate", event.target.value)} required />
                    </Field>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Rooms Requested">
                      <input type="number" min="1" max="10" className={inputClass} value={bookingForm.roomsRequested} onChange={(event) => updateBooking("roomsRequested", event.target.value)} />
                    </Field>
                    <div className="flex items-end">
                      <Button type="button" onClick={checkAvailability} disabled={busyId === "availability"} className="w-full">
                        Check Availability
                      </Button>
                    </div>
                  </div>

                  {availability && (
                    <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-xs text-emerald-200">
                      {availability.isAvailable
                        ? `Dates are available. Estimated price: ₹${availability.estimatedPrice || 0}`
                        : "Selected dates overlap with an existing booking or blocked date."}
                    </div>
                  )}

                  <Field label="Purpose of Stay">
                    <textarea className={textareaClass} value={bookingForm.purpose} onChange={(event) => updateBooking("purpose", event.target.value)} required />
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "booking"}>
                    Submit Booking Request
                  </Button>
                </form>

                <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Your Bookings</h2>
                  <div className="mt-4 divide-y divide-white/10">
                    {bookings.map((booking) => (
                      <article key={booking._id} className="py-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="font-bold text-white">{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</h3>
                            <p className="mt-1 text-xs text-gray-500">{booking.roomsRequested || 1} room(s) · {booking.purpose}</p>
                          </div>
                          <Status value={booking.status} />
                        </div>
                      </article>
                    ))}
                    {bookings.length === 0 && <Empty text="No Dharamshala bookings recorded." />}
                  </div>
                </section>
              </div>
            )}

            {/* TAB 4: POLLS */}
            {activeTab === "polls" && (
              <div className="grid gap-4 md:grid-cols-2">
                {polls.map((poll) => (
                  <article key={poll._id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-white">{poll.question}</h3>
                        <p className="mt-1 text-xs text-gray-500">Closes on {formatDate(poll.endDate)}</p>
                      </div>
                      <Status value={poll.status} />
                    </div>

                    <div className="mt-4 grid gap-2">
                      {poll.options?.map((option) => (
                        <button
                          key={option._id}
                          onClick={() => submitVote(poll._id, option._id)}
                          disabled={busyId === `vote-${poll._id}` || poll.status !== "ACTIVE"}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-xs text-white transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span>{option.text}</span>
                          <span className="font-mono text-gray-400">{option.votes || 0} votes</span>
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
                {polls.length === 0 && <Empty text="No active polls right now." />}
              </div>
            )}

            {/* TAB 5: POSTS */}
            {activeTab === "posts" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submitPost} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Create Discussion Post</h2>
                  <Field label="Title">
                    <input className={inputClass} value={postForm.title} onChange={(event) => updatePost("title", event.target.value)} required />
                  </Field>
                  <Field label="Category">
                    <input className={inputClass} value={postForm.category} onChange={(event) => updatePost("category", event.target.value)} placeholder="Youth, seniors, business, general" />
                  </Field>
                  <Field label="Content">
                    <textarea className={textareaClass} value={postForm.body} onChange={(event) => updatePost("body", event.target.value)} required />
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "post"}>
                    Publish Post
                  </Button>
                </form>

                <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Community Discussion Feed</h2>
                  <div className="mt-4 divide-y divide-white/10">
                    {posts.map((post) => (
                      <article key={post._id} className="py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-white">{post.title}</h3>
                            <p className="mt-1 text-xs text-gray-500">
                              By {post.author?.firstName || "Member"} · {post.category || "General"}
                            </p>
                          </div>
                          <Status value={post.status || "PUBLISHED"} />
                        </div>
                        <p className="mt-2 text-xs text-gray-300">{post.body}</p>

                        <div className="mt-3 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => loadComments(post._id)}
                            className="text-xs font-semibold text-emerald-400 hover:underline"
                          >
                            View Comments
                          </button>
                        </div>

                        {commentsByPost[post._id] && (
                          <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-3">
                            <div className="space-y-2">
                              {commentsByPost[post._id].map((comment) => (
                                <p key={comment._id} className="text-xs text-gray-300">
                                  <span className="font-bold text-white">{comment.author?.firstName || "Member"}:</span> {comment.body}
                                </p>
                              ))}
                            </div>
                            <div className="mt-3 flex gap-2">
                              <input
                                value={commentDrafts[post._id] || ""}
                                onChange={(event) =>
                                  setCommentDrafts((current) => ({ ...current, [post._id]: event.target.value }))
                                }
                                placeholder="Add a reply..."
                                className="h-8 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-xs text-white outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => addComment(post._id)}
                                className="rounded-lg bg-emerald-400 px-3 text-xs font-bold text-black hover:bg-emerald-300"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        )}
                      </article>
                    ))}
                    {posts.length === 0 && <Empty text="No discussion posts published yet." />}
                  </div>
                </section>
              </div>
            )}

            {/* TAB 6: ACHIEVEMENTS (ACTUAL IMAGE UPLOAD) */}
            {activeTab === "achievements" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submitAchievement} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div>
                    <h2 className="text-lg font-black text-white">Submit Community Achievement</h2>
                    <p className="mt-1 text-xs text-gray-400">
                      Share community achievements, awards, or educational milestones with an actual photo.
                    </p>
                  </div>

                  <Field label="Achievement Title *">
                    <input
                      className={inputClass}
                      value={achievementForm.title}
                      onChange={(event) => updateAchievement("title", event.target.value)}
                      placeholder="e.g. UPSC Examination Cleared / National Sports Gold"
                      required
                    />
                  </Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Achiever Full Name *">
                      <input
                        className={inputClass}
                        value={achievementForm.achieverName}
                        onChange={(event) => updateAchievement("achieverName", event.target.value)}
                        placeholder="Name of achiever"
                        required
                      />
                    </Field>
                    <Field label="Category">
                      <input
                        className={inputClass}
                        value={achievementForm.category}
                        onChange={(event) => updateAchievement("category", event.target.value)}
                        placeholder="Education, Business, Sports, Civil"
                      />
                    </Field>
                  </div>

                  <Field label="Achievement Description *">
                    <textarea
                      className={textareaClass}
                      value={achievementForm.description}
                      onChange={(event) => updateAchievement("description", event.target.value)}
                      placeholder="Describe the milestone, rank, institution, or achievement details..."
                      required
                    />
                  </Field>

                  {/* Actual File Upload for Achievement */}
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                    <FileUploadWithPreview
                      label="Achievement / Award Image"
                      required={false}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      maxSizeMB={10}
                      helperText="Certificate, medal or award photo"
                      file={achievementImageFile}
                      onFileSelect={(file) => setAchievementImageFile(file)}
                    />
                  </div>

                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "achievement"}>
                    Submit For Committee Review
                  </Button>
                </form>

                <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <h2 className="text-lg font-black text-white">Community Achievements</h2>
                  <div className="mt-4 divide-y divide-white/10">
                    {achievements.map((achievement) => (
                      <article key={achievement._id} className="py-4">
                        <div className="flex gap-3.5">
                          {achievement.image?.url ? (
                            <img
                              src={achievement.image.url}
                              alt={achievement.title}
                              className="h-20 w-24 shrink-0 rounded-xl border border-white/10 object-cover shadow-md"
                            />
                          ) : (
                            <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-amber-300">
                              <FiAward size={28} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1.5 md:flex-row md:items-start md:justify-between">
                              <div>
                                <h3 className="font-bold text-white">{achievement.title}</h3>
                                <p className="text-xs text-emerald-400">
                                  {achievement.achieverName} · {achievement.category || "General"}
                                </p>
                              </div>
                              <Status value={achievement.status} />
                            </div>
                            <p className="mt-2 line-clamp-2 text-xs text-gray-400">{achievement.description}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                    {achievements.length === 0 && <Empty text="No achievement submissions recorded yet." />}
                  </div>
                </section>
              </div>
            )}

            {/* TAB 7: SHRADHANJALI (ACTUAL PHOTO UPLOAD) */}
            {activeTab === "shradhanjali" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submitShradhanjali} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div>
                    <h2 className="text-lg font-black text-white">Submit Shradhanjali Tribute</h2>
                    <p className="mt-1 text-xs text-gray-400">
                      Submit condolence tribute with an actual memorial photograph for verified publication.
                    </p>
                  </div>

                  <Field label="Deceased Person Full Name *">
                    <input
                      className={inputClass}
                      value={shradhanjaliForm.personName}
                      onChange={(event) => updateShradhanjali("personName", event.target.value)}
                      placeholder="Full name of departed soul"
                      required
                    />
                  </Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Date Of Birth">
                      <input
                        type="date"
                        className={inputClass}
                        value={shradhanjaliForm.dateOfBirth}
                        onChange={(event) => updateShradhanjali("dateOfBirth", event.target.value)}
                      />
                    </Field>
                    <Field label="Date Of Demise *">
                      <input
                        type="date"
                        className={inputClass}
                        value={shradhanjaliForm.dateOfPassing}
                        onChange={(event) => updateShradhanjali("dateOfPassing", event.target.value)}
                        required
                      />
                    </Field>
                  </div>

                  <Field label="Condolence Message / Tribute *">
                    <textarea
                      className={textareaClass}
                      value={shradhanjaliForm.message}
                      onChange={(event) => updateShradhanjali("message", event.target.value)}
                      placeholder="Condolence message, memories, or funeral service details..."
                      required
                    />
                  </Field>

                  {/* Actual File Upload for Shradhanjali */}
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                    <FileUploadWithPreview
                      label="Memorial Photo"
                      required={false}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      maxSizeMB={10}
                      helperText="Clear portrait photo of departed soul"
                      file={shradhanjaliPhotoFile}
                      onFileSelect={(file) => setShradhanjaliPhotoFile(file)}
                    />
                  </div>

                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "shradhanjali"}>
                    Submit For Verification
                  </Button>
                </form>

                <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <h2 className="text-lg font-black text-white">Recent Tributes & Condolences</h2>
                  <div className="mt-4 divide-y divide-white/10">
                    {shradhanjalis.map((item) => (
                      <article key={item._id} className="py-4">
                        <div className="flex gap-3.5">
                          {item.photo?.url ? (
                            <img
                              src={item.photo.url}
                              alt={item.personName}
                              className="h-20 w-20 shrink-0 rounded-xl border border-white/10 object-cover shadow-md"
                            />
                          ) : (
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-500">
                              <FaHeart size={24} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1.5 md:flex-row md:items-start md:justify-between">
                              <div>
                                <h3 className="font-bold text-white">{item.personName}</h3>
                                <p className="text-xs text-gray-500">
                                  Demise: {formatDate(item.dateOfPassing)}
                                </p>
                              </div>
                              <Status value={item.status} />
                            </div>
                            <p className="mt-2 line-clamp-2 text-xs text-gray-400">{item.message}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                    {shradhanjalis.length === 0 && <Empty text="No condolence tributes recorded yet." />}
                  </div>
                </section>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommunityHub;
