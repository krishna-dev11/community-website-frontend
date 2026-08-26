import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
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
  FiExternalLink,
  FiClock,
  FiFileText,
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
  { key: "issues", label: "Issues & Solutions", icon: FaExclamationCircle },
  { key: "dharamshala", label: "Dharamshala Booking", icon: FaCalendarCheck, isExternalLink: true, link: "/dharamshala" },
  { key: "polls", label: "Polls & Voting", icon: FaPoll },
  { key: "posts", label: "Discussion Feed", icon: FaComments },
  { key: "achievements", label: "Samaj Pride", icon: FaAward },
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
    RESOLVED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    IN_PROGRESS: "border-blue-400/30 bg-blue-400/10 text-blue-200",
    PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    UNDER_REVIEW: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    REJECTED: "border-red-400/30 bg-red-400/10 text-red-200",
    CLOSED: "border-gray-400/30 bg-gray-400/10 text-gray-200",
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

const storyStatusMessage = (status, type) => {
  if (status === "PUBLISHED") return "Approved and visible to the community.";
  if (status === "REJECTED") return "Reviewed by the committee. Please check the reason below.";
  return type === "achievement"
    ? "Your achievement is waiting for committee verification."
    : "Your tribute has been submitted and is waiting for committee review.";
};

const CommunityHub = () => {
  const { token } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const queryTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    queryTab && tabs.some((t) => t.key === queryTab && !t.isExternalLink) ? queryTab : "card"
  );
  
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [card, setCard] = useState(null);
  const [downloadingCard, setDownloadingCard] = useState(false);
  const cardRef = useRef(null);

  const [issues, setIssues] = useState([]);
  const [polls, setPolls] = useState([]);
  const [selectedPollOptions, setSelectedPollOptions] = useState({});
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
  const [postForm, setPostForm] = useState({ title: "", body: "", category: "" });

  // Achievements & Shradhanjali with actual file uploads
  const [achievementForm, setAchievementForm] = useState({
    title: "",
    achieverName: "",
    category: "",
    organization: "",
    year: new Date().getFullYear().toString(),
    description: "",
  });
  const [achievementImageFile, setAchievementImageFile] = useState(null);
  const [achievementDocFile, setAchievementDocFile] = useState(null);

  const [shradhanjaliForm, setShradhanjaliForm] = useState({
    personName: "",
    dateOfBirth: "",
    dateOfPassing: "",
    familyInfo: "",
    biography: "",
    message: "",
  });
  const [shradhanjaliPhotoFile, setShradhanjaliPhotoFile] = useState(null);
  const [shradhanjaliDocFile, setShradhanjaliDocFile] = useState(null);

  const authConfig = useMemo(
    () => ({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true,
    }),
    [token]
  );

  // Sync tab with URL search parameter
  useEffect(() => {
    if (queryTab && tabs.some((t) => t.key === queryTab && !t.isExternalLink) && queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const handleTabChange = (key) => {
    const target = tabs.find((t) => t.key === key);
    if (target?.isExternalLink) {
      navigate(target.link);
      return;
    }
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

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
      limit: 20,
    });
    setIssues(response.data?.data?.issues || []);
  };

  const loadPolls = async () => {
    const response = await apiConnector("GET", communityEndpoints.POLLS_API, null, authConfig, { limit: 20 });
    const pollList = response.data?.data?.polls || [];
    setPolls(pollList);
    // Initialize selected options map
    const initialSelected = {};
    pollList.forEach((poll) => {
      if (poll.userSelectedOptions && poll.userSelectedOptions.length > 0) {
        initialSelected[poll._id] = poll.userSelectedOptions;
      }
    });
    setSelectedPollOptions(initialSelected);
  };

  const loadPosts = async () => {
    const response = await apiConnector("GET", communityEndpoints.POSTS_API, null, authConfig, { limit: 20 });
    setPosts(response.data?.data?.posts || []);
  };

  const loadAchievements = async () => {
    const response = await apiConnector("GET", communityEndpoints.MY_ACHIEVEMENTS_API, null, authConfig, { limit: 20 });
    setAchievements(response.data?.data?.achievements || []);
  };

  const loadShradhanjalis = async () => {
    const response = await apiConnector("GET", communityEndpoints.MY_SHRADHANJALIS_API, null, authConfig, { limit: 20 });
    setShradhanjalis(response.data?.data?.shradhanjalis || []);
  };

  const refreshActive = async () => {
    setLoading(true);
    try {
      if (activeTab === "card") await loadCard();
      if (activeTab === "issues") await loadIssues();
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
      toast.success("Issue submitted successfully");
      setIssueForm({ title: "", description: "", category: "", location: "", priority: "MEDIUM" });
      await loadIssues();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit issue");
    } finally {
      setBusyId(null);
    }
  };

  const togglePollOption = (poll, optionId) => {
    const pollId = poll._id;
    const current = selectedPollOptions[pollId] || [];
    if (poll.isMultipleChoice) {
      if (current.includes(optionId)) {
        setSelectedPollOptions({ ...selectedPollOptions, [pollId]: current.filter((id) => id !== optionId) });
      } else {
        if (current.length >= (poll.maxSelections || 2)) {
          toast.error(`You can select at most ${poll.maxSelections || 2} options`);
          return;
        }
        setSelectedPollOptions({ ...selectedPollOptions, [pollId]: [...current, optionId] });
      }
    } else {
      setSelectedPollOptions({ ...selectedPollOptions, [pollId]: [optionId] });
    }
  };

  const submitVote = async (poll) => {
    const pollId = poll._id;
    const selected = selectedPollOptions[pollId] || [];
    if (!selected.length) {
      toast.error("Please select an option before voting");
      return;
    }
    setBusyId(`vote-${pollId}`);
    try {
      await apiConnector(
        "POST",
        communityEndpoints.VOTE_API(pollId),
        { optionIds: selected, optionId: selected[0] },
        authConfig
      );
      toast.success("Vote recorded successfully");
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

  // Submit Achievement with actual Photo & Document
  const submitAchievement = async (event) => {
    event.preventDefault();
    if (busyId === "achievement") return;
    setBusyId("achievement");
    try {
      const formData = new FormData();
      formData.append("title", achievementForm.title);
      formData.append("achieverName", achievementForm.achieverName);
      formData.append("category", achievementForm.category || "General");
      formData.append("organization", achievementForm.organization || "");
      formData.append("year", achievementForm.year || "");
      formData.append("description", achievementForm.description);

      if (achievementImageFile instanceof File) {
        formData.append("recipientPhoto", achievementImageFile);
      }
      if (achievementDocFile instanceof File) {
        formData.append("supportingDocument", achievementDocFile);
      }

      const response = await apiConnector("POST", communityEndpoints.ACHIEVEMENTS_API, formData, authConfig);
      const created = response.data?.data?.achievement;
      toast.success("Achievement submitted successfully. It is now pending committee review.");
      setAchievementForm({
        title: "",
        achieverName: "",
        category: "",
        organization: "",
        year: new Date().getFullYear().toString(),
        description: "",
      });
      setAchievementImageFile(null);
      setAchievementDocFile(null);
      if (created) setAchievements((current) => [created, ...current.filter((item) => item._id !== created._id)]);
      else await loadAchievements();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit achievement");
    } finally {
      setBusyId(null);
    }
  };

  // Submit Shradhanjali with actual Photo & Document
  const submitShradhanjali = async (event) => {
    event.preventDefault();
    if (busyId === "shradhanjali") return;
    setBusyId("shradhanjali");
    try {
      const formData = new FormData();
      formData.append("personName", shradhanjaliForm.personName);
      formData.append("message", shradhanjaliForm.message);
      if (shradhanjaliForm.dateOfBirth) formData.append("dateOfBirth", shradhanjaliForm.dateOfBirth);
      formData.append("dateOfPassing", shradhanjaliForm.dateOfPassing);
      formData.append("familyInfo", shradhanjaliForm.familyInfo || "");
      formData.append("biography", shradhanjaliForm.biography || "");

      if (shradhanjaliPhotoFile instanceof File) {
        formData.append("photo", shradhanjaliPhotoFile);
      }
      if (shradhanjaliDocFile instanceof File) {
        formData.append("supportingDocument", shradhanjaliDocFile);
      }

      const response = await apiConnector("POST", communityEndpoints.SHRADHANJALIS_API, formData, authConfig);
      const created = response.data?.data?.shradhanjali;
      toast.success("Tribute submitted successfully. It is now pending verification.");
      setShradhanjaliForm({
        personName: "",
        message: "",
        dateOfBirth: "",
        dateOfPassing: "",
        familyInfo: "",
        biography: "",
      });
      setShradhanjaliPhotoFile(null);
      setShradhanjaliDocFile(null);
      if (created) setShradhanjalis((current) => [created, ...current.filter((item) => item._id !== created._id)]);
      else await loadShradhanjalis();
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
              Refresh Hub
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto pt-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? "bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/20"
                      : "border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {tab.isExternalLink && <FiExternalLink size={11} className="opacity-70" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent" />
          </div>
        ) : (
          <>
            {/* TAB 1: MEMBERSHIP CARD */}
            {activeTab === "card" && (
              <section className="flex flex-col items-center">
                {card ? (
                  <div className="w-full max-w-xl flex flex-col items-center">
                    {/* Proportional Card Container */}
                    <div className="w-full overflow-hidden flex justify-center py-2">
                      <div
                        ref={cardRef}
                        data-membership-card="true"
                        className="w-full relative rounded-2xl border-2 border-[#00DFA5] p-5 sm:p-6 text-white shadow-2xl overflow-hidden"
                        style={{
                          background: "linear-gradient(135deg, #0d221a 0%, #06140e 60%, #030a07 100%)",
                          maxWidth: "540px",
                        }}
                      >
                        {/* Glows */}
                        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#00DFA5] opacity-20 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#19C9C0] opacity-15 blur-3xl" />

                        {/* Top Header */}
                        <div className="relative flex items-center justify-between border-b border-[#00DFA5]/30 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-amber-400/70 bg-gradient-to-br from-amber-500/30 to-[#00DFA5]/20 shadow-md">
                              <span className="text-lg font-black text-amber-400">ॐ</span>
                            </div>
                            <div>
                              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 leading-tight">
                                SHRI SAMAJ COMMUNITY TRUST
                              </h3>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-[#00DFA5]">
                                Official Verified Identity Card
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#00DFA5]/40 bg-[#00DFA5]/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                            <FiCheckCircle size={10} /> Active
                          </span>
                        </div>

                        {/* Card Body */}
                        <div className="relative mt-4 flex items-center justify-between gap-3 sm:gap-4">
                          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                            <div className="relative shrink-0">
                              <img
                                src={
                                  card.photo ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(card.name || "Member")}`
                                }
                                alt={card.name}
                                crossOrigin="anonymous"
                                className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl border-2 border-[#00DFA5] object-cover shadow-lg"
                              />
                              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-gray-900 bg-[#00DFA5] text-black">
                                <FiUserCheck size={11} />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                              <h4 className="text-sm sm:text-base font-black text-white truncate">{card.name}</h4>
                              <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#00DFA5]">
                                {card?.memberId ? `SMJ-${String(card.memberId).slice(-8).toUpperCase()}` : "SMJ-MEMBER"}
                              </p>
                              {card.family?.familyName && (
                                <p className="text-[11px] text-gray-300 mt-1 truncate">
                                  Family: <strong className="text-white">{card.family.familyName}</strong>
                                </p>
                              )}
                              <p className="text-[10px] text-gray-400 mt-1">
                                Issued: {card.issuedAt ? formatDate(card.issuedAt) : "Active"} · Lifetime
                              </p>
                            </div>
                          </div>

                          {/* QR Code */}
                          <div className="flex shrink-0 flex-col items-center rounded-xl border border-[#00DFA5]/40 bg-white p-2 shadow-lg">
                            <div className="h-14 w-14 sm:h-16 sm:w-16">
                              <QRCode
                                value={verificationUrl}
                                size={64}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 64 64`}
                              />
                            </div>
                            <span className="mt-1 text-[7px] font-black uppercase tracking-wider text-black">
                              SCAN TO VERIFY
                            </span>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="relative mt-4 flex items-center justify-between border-t border-[#00DFA5]/25 pt-2 text-[9px] text-gray-400">
                          <span className="flex items-center gap-1 text-[#00DFA5]">
                            <FiShield size={10} /> Digital Credential Standard
                          </span>
                          <span className="font-mono font-bold tracking-wider text-[#00DFA5]">
                            SMJ-SECURITY-AUTHENTICATED
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Download PDF Action */}
                    <div className="mt-5 flex justify-center">
                      <button
                        onClick={handleDownloadCard}
                        disabled={downloadingCard}
                        className="btn-primary flex items-center gap-2 !py-2.5 !px-6 !text-xs cursor-pointer shadow-lg"
                      >
                        <FiDownload size={14} />
                        <span>{downloadingCard ? "Generating PDF..." : "Download Official PDF Card"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <Empty text="Membership card will be available automatically once your member application is approved by the Super Admin." />
                )}
              </section>
            )}

            {/* TAB 2: ISSUES & PUBLIC SOLUTIONS */}
            {activeTab === "issues" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submitIssue} className="grid gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-5">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">Submit Community Issue</h2>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Report community issues or civic concerns for management committee review.
                    </p>
                  </div>
                  <Field label="Title *">
                    <input className={inputClass} value={issueForm.title} onChange={(event) => updateIssue("title", event.target.value)} placeholder="Summary of the issue" required />
                  </Field>
                  <Field label="Description *">
                    <textarea className={textareaClass} value={issueForm.description} onChange={(event) => updateIssue("description", event.target.value)} placeholder="Detailed explanation..." required />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Category">
                      <input className={inputClass} value={issueForm.category} onChange={(event) => updateIssue("category", event.target.value)} placeholder="e.g. Water, Civic, Education" />
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
                    <input className={inputClass} value={issueForm.location} onChange={(event) => updateIssue("location", event.target.value)} placeholder="City, ward, or community center" />
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "issue"}>
                    {busyId === "issue" ? "Submitting Issue..." : "Submit Issue"}
                  </Button>
                </form>

                <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">Your Submitted Issues</h2>
                    <Link to="/solutions" className="text-xs font-bold text-[var(--brand)] hover:underline flex items-center gap-1">
                      <span>Public Solutions Hub</span>
                      <FiExternalLink size={11} />
                    </Link>
                  </div>
                  <div className="mt-4 divide-y divide-[var(--border-subtle)]">
                    {issues.map((issue) => (
                      <article key={issue._id} className="py-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="font-bold text-[var(--text-primary)]">{issue.title}</h3>
                            <p className="mt-1 text-xs text-[var(--text-secondary)]">
                              {issue.category || "General"} · {formatDate(issue.createdAt)} {issue.location ? `· ${issue.location}` : ""}
                            </p>
                          </div>
                          <Status value={issue.status} />
                        </div>
                        <p className="mt-2 text-xs text-[var(--text-secondary)]">{issue.description}</p>
                        
                        {/* Admin Status Note Callout */}
                        {issue.adminStatusNote && (
                          <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                            <strong className="block font-bold text-emerald-200 mb-0.5">Admin Response & Resolution Note:</strong>
                            {issue.adminStatusNote}
                          </div>
                        )}
                        {issue.moderationReason && !issue.adminStatusNote && (
                          <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                            <strong className="block font-bold text-red-200 mb-0.5">Committee Review Note:</strong>
                            {issue.moderationReason}
                          </div>
                        )}
                      </article>
                    ))}
                    {issues.length === 0 && <Empty text="No community issues submitted yet." />}
                  </div>
                </section>
              </div>
            )}

            {/* TAB 3: POLLS & VOTING */}
            {activeTab === "polls" && (
              <div className="grid gap-5 md:grid-cols-2">
                {polls.map((poll) => {
                  const hasVoted = poll.hasVoted;
                  const isClosed = poll.status === "CLOSED" || new Date(poll.endsAt) <= new Date();
                  const currentSelected = selectedPollOptions[poll._id] || [];

                  return (
                    <article key={poll._id} className="flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-5">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand)]">
                              {poll.isMultipleChoice ? `Multi-Choice (Up to ${poll.maxSelections || 2})` : "Single Choice"}
                            </span>
                            <h3 className="text-base font-bold text-[var(--text-primary)] mt-1">{poll.title}</h3>
                            {poll.description && (
                              <p className="mt-1 text-xs text-[var(--text-secondary)]">{poll.description}</p>
                            )}
                          </div>
                          <Status value={isClosed ? "CLOSED" : poll.status} />
                        </div>

                        <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                          <span className="flex items-center gap-1">
                            <FiClock size={11} />
                            {isClosed ? "Voting Closed" : `Closes on ${formatDate(poll.endsAt)}`}
                          </span>
                          <span>·</span>
                          <span>{poll.totalVotes || 0} votes recorded</span>
                        </div>

                        {/* Options List */}
                        <div className="mt-4 grid gap-2.5">
                          {poll.options?.map((option) => {
                            const isSelected = currentSelected.includes(option._id);
                            const percent = poll.totalVotes > 0 ? Math.round(((option.voteCount || 0) / poll.totalVotes) * 100) : 0;

                            return (
                              <div
                                key={option._id}
                                onClick={() => {
                                  if (!hasVoted && !isClosed) togglePollOption(poll, option._id);
                                }}
                                className={`relative overflow-hidden rounded-xl border p-3 text-xs transition cursor-pointer ${
                                  isSelected
                                    ? "border-[var(--brand)] bg-[var(--brand)]/10 text-white font-bold"
                                    : "border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-[var(--text-secondary)] hover:border-white/20"
                                } ${hasVoted || isClosed ? "cursor-default" : ""}`}
                              >
                                {/* Percentage bar background */}
                                {(hasVoted || isClosed) && (
                                  <div
                                    className="absolute inset-y-0 left-0 bg-[var(--brand)]/15 transition-all duration-500 pointer-events-none"
                                    style={{ width: `${percent}%` }}
                                  />
                                )}
                                <div className="relative flex items-center justify-between gap-2 z-10">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`flex h-4 w-4 shrink-0 items-center justify-center border text-[10px] ${
                                        poll.isMultipleChoice ? "rounded" : "rounded-full"
                                      } ${
                                        isSelected
                                          ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                                          : "border-gray-500 bg-transparent"
                                      }`}
                                    >
                                      {isSelected && <FaCheck size={8} />}
                                    </div>
                                    <span className="text-[var(--text-primary)]">{option.label}</span>
                                  </div>
                                  {(hasVoted || isClosed) && (
                                    <span className="font-mono font-bold text-[var(--brand)]">
                                      {percent}% ({option.voteCount || 0})
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Vote Action Footer */}
                      <div className="mt-5 border-t border-[var(--border-subtle)] pt-3 flex items-center justify-between">
                        {hasVoted ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                            <FiCheckCircle size={13} /> Vote Recorded
                          </span>
                        ) : isClosed ? (
                          <span className="text-xs text-[var(--text-muted)]">Voting is now closed</span>
                        ) : (
                          <button
                            onClick={() => submitVote(poll)}
                            disabled={busyId === `vote-${poll._id}` || currentSelected.length === 0}
                            className="btn-primary !py-2 !px-5 !text-xs cursor-pointer shadow-md disabled:opacity-50"
                          >
                            {busyId === `vote-${poll._id}` ? "Submitting Vote..." : "Cast Your Vote"}
                          </button>
                        )}
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {poll.isAnonymous ? "Anonymous Ballot" : "Verified Vote"}
                        </span>
                      </div>
                    </article>
                  );
                })}
                {polls.length === 0 && <Empty text="No active polls right now." />}
              </div>
            )}

            {/* TAB 4: DISCUSSION FEED */}
            {activeTab === "posts" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submitPost} className="grid gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-5">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Create Discussion Post</h2>
                  <Field label="Title *">
                    <input className={inputClass} value={postForm.title} onChange={(event) => updatePost("title", event.target.value)} placeholder="Topic headline" required />
                  </Field>
                  <Field label="Category">
                    <input className={inputClass} value={postForm.category} onChange={(event) => updatePost("category", event.target.value)} placeholder="e.g. Youth, Culture, Business" />
                  </Field>
                  <Field label="Content *">
                    <textarea className={textareaClass} value={postForm.body} onChange={(event) => updatePost("body", event.target.value)} placeholder="Share your message or idea with the community..." required />
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "post"}>
                    {busyId === "post" ? "Publishing Post..." : "Publish Post"}
                  </Button>
                </form>

                <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-5">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Community Discussion Feed</h2>
                  <div className="mt-4 divide-y divide-[var(--border-subtle)]">
                    {posts.map((post) => (
                      <article key={post._id} className="py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-[var(--text-primary)]">{post.title}</h3>
                            <p className="mt-1 text-xs text-[var(--text-secondary)]">
                              By {post.author?.firstName || "Member"} · {post.category || "General"} · {formatDate(post.createdAt)}
                            </p>
                          </div>
                          <Status value={post.status || "PUBLISHED"} />
                        </div>
                        <p className="mt-2 text-xs text-[var(--text-secondary)]">{post.body}</p>

                        <div className="mt-3 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => loadComments(post._id)}
                            className="text-xs font-semibold text-[var(--brand)] hover:underline flex items-center gap-1"
                          >
                            <FaComments size={12} />
                            <span>View Comments</span>
                          </button>
                        </div>

                        {commentsByPost[post._id] && (
                          <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-3">
                            <div className="space-y-2">
                              {commentsByPost[post._id].map((comment) => (
                                <p key={comment._id} className="text-xs text-[var(--text-secondary)]">
                                  <span className="font-bold text-[var(--text-primary)]">{comment.author?.firstName || "Member"}:</span> {comment.body}
                                </p>
                              ))}
                              {commentsByPost[post._id].length === 0 && (
                                <p className="text-[11px] text-[var(--text-muted)] italic">No comments yet. Be the first to reply!</p>
                              )}
                            </div>
                            <div className="mt-3 flex gap-2">
                              <input
                                value={commentDrafts[post._id] || ""}
                                onChange={(event) =>
                                  setCommentDrafts((current) => ({ ...current, [post._id]: event.target.value }))
                                }
                                placeholder="Add a reply..."
                                className="h-8 flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-2.5 text-xs text-[var(--text-primary)] outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => addComment(post._id)}
                                className="rounded-lg bg-[var(--brand)] px-3 text-xs font-bold text-white hover:bg-[var(--brand-deep)] cursor-pointer"
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

            {/* TAB 5: SAMAJ PRIDE / ACHIEVEMENTS */}
            {activeTab === "achievements" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submitAchievement} className="grid gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-6">
                  <div>
                    <h2 className="text-lg font-black text-[var(--text-primary)]">Submit Samaj Achievement</h2>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Share community achievements, academic honors, or national awards with photo & document verification.
                    </p>
                  </div>

                  <Field label="Achievement Title *">
                    <input
                      className={inputClass}
                      value={achievementForm.title}
                      onChange={(event) => updateAchievement("title", event.target.value)}
                      placeholder="e.g. UPSC Cleared / National Sports Gold"
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
                        placeholder="Civil, Sports, Education, Business"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Institution / Organization">
                      <input
                        className={inputClass}
                        value={achievementForm.organization}
                        onChange={(event) => updateAchievement("organization", event.target.value)}
                        placeholder="e.g. IIT Delhi, Government of India"
                      />
                    </Field>
                    <Field label="Year / Date">
                      <input
                        className={inputClass}
                        value={achievementForm.year}
                        onChange={(event) => updateAchievement("year", event.target.value)}
                        placeholder="2026"
                      />
                    </Field>
                  </div>

                  <Field label="Achievement Description *">
                    <textarea
                      className={textareaClass}
                      value={achievementForm.description}
                      onChange={(event) => updateAchievement("description", event.target.value)}
                      placeholder="Describe the achievement, rank, or notable details..."
                      required
                    />
                  </Field>

                  {/* Recipient Photo Upload */}
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-3.5">
                    <FileUploadWithPreview
                      label="Recipient / Medal Photo"
                      required={false}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      maxSizeMB={10}
                      helperText="Clear photo of the achiever or award ceremony"
                      file={achievementImageFile}
                      onFileSelect={(file) => setAchievementImageFile(file)}
                    />
                  </div>

                  {/* Supporting Document Upload */}
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-3.5">
                    <FileUploadWithPreview
                      label="Supporting Certificate / Document (PDF or Image)"
                      required={false}
                      accept="image/jpeg,image/png,application/pdf"
                      maxSizeMB={10}
                      helperText="Official certificate, mark sheet, or news clipping"
                      file={achievementDocFile}
                      onFileSelect={(file) => setAchievementDocFile(file)}
                    />
                  </div>

                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "achievement"}>
                    {busyId === "achievement" ? "Submitting Achievement..." : "Submit For Committee Review"}
                  </Button>
                </form>

                <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-6">
                  <h2 className="text-lg font-black text-[var(--text-primary)]">Community Pride & Achievements</h2>
                  <div className="mt-4 divide-y divide-[var(--border-subtle)]">
                    {achievements.map((achievement) => (
                      <article key={achievement._id} className="py-4">
                        <div className="flex gap-3.5">
                          {achievement.recipientPhoto?.url || achievement.image?.url ? (
                            <img
                              src={achievement.recipientPhoto?.url || achievement.image?.url}
                              alt={achievement.title}
                              className="h-20 w-24 shrink-0 rounded-xl border border-[var(--border-subtle)] object-cover shadow-md"
                            />
                          ) : (
                            <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-amber-300">
                              <FiAward size={28} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1.5 md:flex-row md:items-start md:justify-between">
                              <div>
                                <h3 className="font-bold text-[var(--text-primary)]">{achievement.title}</h3>
                                <p className="text-xs text-[var(--brand)]">
                                  {achievement.achieverName} {achievement.organization ? `· ${achievement.organization}` : ""} · {achievement.year || ""}
                                </p>
                              </div>
                              <Status value={achievement.status} />
                            </div>
                            <p className="mt-2 line-clamp-2 text-xs text-[var(--text-secondary)]">{achievement.description}</p>
                            <div
                              className={`mt-3 rounded-xl border px-3 py-2 text-[11px] ${
                                achievement.status === "REJECTED"
                                  ? "border-red-400/30 bg-red-400/10 text-red-200"
                                  : achievement.status === "PUBLISHED"
                                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                                  : "border-amber-400/30 bg-amber-400/10 text-amber-200"
                              }`}
                            >
                              <p className="font-bold uppercase tracking-wider">
                                {achievement.status === "PENDING" ? "Pending Review" : achievement.status}
                              </p>
                              <p className="mt-1 text-[var(--text-primary)]">{storyStatusMessage(achievement.status, "achievement")}</p>
                              {achievement.status === "REJECTED" && achievement.reviewReason && (
                                <p className="mt-2 text-[var(--text-primary)]">
                                  <strong>Reason:</strong> {achievement.reviewReason}
                                </p>
                              )}
                              <p className="mt-1 text-[var(--text-muted)]">Submitted on: {formatDate(achievement.createdAt)}</p>
                            </div>
                            {achievement.supportingDocument?.url && (
                              <a
                                href={achievement.supportingDocument.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--brand)] hover:underline"
                              >
                                <FiFileText size={12} /> View Attached Certificate
                              </a>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                    {achievements.length === 0 && <Empty text="No achievement submissions recorded yet." />}
                  </div>
                </section>
              </div>
            )}

            {/* TAB 6: SHRADHANJALI / MEMORIAL TRIBUTE */}
            {activeTab === "shradhanjali" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submitShradhanjali} className="grid gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-6">
                  <div>
                    <h2 className="text-lg font-black text-[var(--text-primary)]">Submit Shradhanjali Tribute</h2>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Submit respectful condolence tributes and memorial details with portrait photograph.
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

                  <Field label="Family Information / Roots">
                    <input
                      className={inputClass}
                      value={shradhanjaliForm.familyInfo}
                      onChange={(event) => updateShradhanjali("familyInfo", event.target.value)}
                      placeholder="e.g. S/o Late Shri..., Native of..."
                    />
                  </Field>

                  <Field label="Short Biography / Life Legacy">
                    <textarea
                      className={textareaClass}
                      value={shradhanjaliForm.biography}
                      onChange={(event) => updateShradhanjali("biography", event.target.value)}
                      placeholder="Brief life journey, noble contributions to Samaj..."
                    />
                  </Field>

                  <Field label="Condolence Message / Tribute *">
                    <textarea
                      className={textareaClass}
                      value={shradhanjaliForm.message}
                      onChange={(event) => updateShradhanjali("message", event.target.value)}
                      placeholder="Heartfelt tribute or prayer for the departed soul..."
                      required
                    />
                  </Field>

                  {/* Memorial Photo Upload */}
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-3.5">
                    <FileUploadWithPreview
                      label="Memorial Photo"
                      required={false}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      maxSizeMB={10}
                      helperText="Clear portrait photo of the departed soul"
                      file={shradhanjaliPhotoFile}
                      onFileSelect={(file) => setShradhanjaliPhotoFile(file)}
                    />
                  </div>

                  {/* Supporting Document Upload */}
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-3.5">
                    <FileUploadWithPreview
                      label="Supporting Document / Memorial Notice"
                      required={false}
                      accept="image/jpeg,image/png,application/pdf"
                      maxSizeMB={10}
                      helperText="Memorial card or news notice"
                      file={shradhanjaliDocFile}
                      onFileSelect={(file) => setShradhanjaliDocFile(file)}
                    />
                  </div>

                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "shradhanjali"}>
                    {busyId === "shradhanjali" ? "Submitting Tribute..." : "Submit For Verification"}
                  </Button>
                </form>

                <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-6">
                  <h2 className="text-lg font-black text-[var(--text-primary)]">Recent Tributes & Condolences</h2>
                  <div className="mt-4 divide-y divide-[var(--border-subtle)]">
                    {shradhanjalis.map((item) => (
                      <article key={item._id} className="py-4">
                        <div className="flex gap-3.5">
                          {item.photo?.url ? (
                            <img
                              src={item.photo.url}
                              alt={item.personName}
                              className="h-20 w-20 shrink-0 rounded-xl border border-[var(--border-subtle)] object-cover shadow-md"
                            />
                          ) : (
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-gray-500">
                              <FaHeart size={24} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1.5 md:flex-row md:items-start md:justify-between">
                              <div>
                                <h3 className="font-bold text-[var(--text-primary)]">{item.personName}</h3>
                                <p className="text-xs text-[var(--text-secondary)]">
                                  {item.dateOfBirth ? `${formatDate(item.dateOfBirth)} - ` : ""}
                                  Demise: {formatDate(item.dateOfPassing)}
                                </p>
                              </div>
                              <Status value={item.status} />
                            </div>
                            {item.familyInfo && (
                              <p className="mt-1 text-xs text-[var(--brand)] font-medium">{item.familyInfo}</p>
                            )}
                            <p className="mt-2 text-xs text-[var(--text-secondary)]">{item.message}</p>
                            <div
                              className={`mt-3 rounded-xl border px-3 py-2 text-[11px] ${
                                item.status === "REJECTED"
                                  ? "border-red-400/30 bg-red-400/10 text-red-200"
                                  : item.status === "PUBLISHED"
                                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                                  : "border-amber-400/30 bg-amber-400/10 text-amber-200"
                              }`}
                            >
                              <p className="font-bold uppercase tracking-wider">
                                {item.status === "PENDING" ? "Pending Verification" : item.status}
                              </p>
                              <p className="mt-1 text-[var(--text-primary)]">{storyStatusMessage(item.status, "shradhanjali")}</p>
                              {item.status === "REJECTED" && item.reviewReason && (
                                <p className="mt-2 text-[var(--text-primary)]">
                                  <strong>Reason:</strong> {item.reviewReason}
                                </p>
                              )}
                              <p className="mt-1 text-[var(--text-muted)]">Submitted on: {formatDate(item.createdAt)}</p>
                            </div>
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
