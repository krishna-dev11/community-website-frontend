import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCheck,
  FaPaperPlane,
  FaRedo,
  FaSearch,
  FaShieldAlt,
  FaTimes,
  FaEye,
  FaFileAlt,
  FaExternalLinkAlt,
  FaDownload,
  FaCrown,
} from "react-icons/fa";
import {
  FiX,
  FiCheckCircle,
  FiAlertTriangle,
  FiFileText,
  FiShield,
  FiUsers,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiSlash,
  FiUserCheck,
  FiSend,
  FiMail,
  FiUserX,
  FiRefreshCw,
  FiUser,
  FiSearch,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { adminEndpoints } from "../../../../services/apis";

const REJECTION_CATEGORIES = [
  "धुंधला या अस्पष्ट दस्तावेज़ (Blurred / Unclear Document)",
  "नाम / जन्मतिथि में विसंगति (Name / DOB Mismatch)",
  "पहचान पत्र संख्या गलत या अधूरी है (Incorrect Identity Number)",
  "अवैध दस्तावेज़ प्रकार (Invalid Document Type)",
  "डुप्लिकेट प्रविष्टि की आशंका (Suspected Duplicate Entry)",
  "परिवार संबंध सत्यापन आवश्यक (Family Relationship Verification Needed)",
  "अन्य (Other Reason)",
];

const AFFECTED_FIELDS = [
  { value: "identityDocument", label: "पहचान दस्तावेज़ (Identity Document)" },
  { value: "name", label: "नाम (Name)" },
  { value: "dateOfBirth", label: "जन्मतिथि (Date of Birth)" },
  { value: "gender", label: "लिंग (Gender)" },
  { value: "address", label: "पता / निवास स्थान (Address)" },
  { value: "gotra", label: "गोत्र (Gotra)" },
  { value: "other", label: "अन्य विवरण (Other)" },
];

const statusStyles = {
  PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  CORRECTION_REQUESTED: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  RESUBMISSION_PENDING: "border-purple-400/30 bg-purple-400/10 text-purple-300",
  ACTIVE: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  APPROVED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  REJECTED: "border-red-400/30 bg-red-400/10 text-red-300",
  ACCEPTED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  REVOKED: "border-red-400/30 bg-red-400/10 text-red-300",
  EXPIRED: "border-gray-400/30 bg-gray-400/10 text-gray-300",
};

const adminRoleOptions = [
  { id: "SUPER_ADMIN", label: "Super Admin", desc: "Full platform permissions & system access", superAdminOnly: true },
  { id: "MODERATOR", label: "Community Moderator", desc: "Moderate posts, discussions, and reported content" },
  { id: "TREASURER", label: "Treasurer", desc: "Manage donations, funds, and financial records" },
  { id: "MATRIMONIAL_ADMIN", label: "Matrimonial Admin", desc: "Verify matrimony profiles and contact requests" },
  { id: "SCHOLARSHIP_ADMIN", label: "Scholarship Admin", desc: "Review education aid and grant applications" },
  { id: "JOB_ADMIN", label: "Job Admin", desc: "Manage career opportunities and applications" },
  { id: "DHARAMSHALA_ADMIN", label: "Dharamshala Admin", desc: "Manage Samaj Bhawan & room bookings" },
  { id: "CONTENT_ADMIN", label: "Content Admin", desc: "Manage notices, circulars, magazine & media" },
];

const ActionButton = ({ children, icon: Icon, tone = "neutral", ...props }) => {
  const toneClasses = {
    neutral: "btn-secondary !py-1.5 !px-3 !text-xs",
    success: "btn-primary !py-1.5 !px-3.5 !text-xs",
    warning:
      "inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 font-bold text-xs uppercase tracking-wider px-3 py-1.5 transition-all hover:bg-amber-400/20 disabled:opacity-50 cursor-pointer",
    danger:
      "inline-flex items-center justify-center gap-1.5 rounded-full border border-red-400/30 bg-red-400/10 text-red-300 font-bold text-xs uppercase tracking-wider px-3 py-1.5 transition-all hover:bg-red-400/20 disabled:opacity-50 cursor-pointer",
  };

  return (
    <button
      {...props}
      className={`${toneClasses[tone] || toneClasses.neutral} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </button>
  );
};

const AdminRegistrationQueue = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [activeTab, setActiveTab] = useState("familyApplications");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeUserId, setActiveUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [familyApplications, setFamilyApplications] = useState([]);
  // Direct Role Management State (Replaces Email Invitations)
  const [eligibleMembers, setEligibleMembers] = useState([]);
  const [eligibleTotal, setEligibleTotal] = useState(0);
  const [eligiblePage, setEligiblePage] = useState(1);
  const [eligibleSearch, setEligibleSearch] = useState("");
  const [eligibleLoading, setEligibleLoading] = useState(false);

  const [activeAdministrators, setActiveAdministrators] = useState([]);
  const [adminRoleFilter, setAdminRoleFilter] = useState("ALL");
  const [adminSearch, setAdminSearch] = useState("");
  const [adminsLoading, setAdminsLoading] = useState(false);

  const [roleHistory, setRoleHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState("ALL");
  const [historyLoading, setHistoryLoading] = useState(false);

  // Sub-tabs under Admin Role Management: "members" | "active" | "history"
  const [adminRoleSubTab, setAdminRoleSubTab] = useState("members");

  // Role Assignment / Edit Modal State
  const [roleModalMember, setRoleModalMember] = useState(null);
  const [modalSelectedRoles, setModalSelectedRoles] = useState([]);
  const [modalReason, setModalReason] = useState("");
  const [isSavingRoles, setIsSavingRoles] = useState(false);

  // Revoke All Access Confirmation Modal State
  const [revokeAccessMember, setRevokeAccessMember] = useState(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [isRevokingAccess, setIsRevokingAccess] = useState(false);

  const isSuperAdmin = user?.accountType === "Admin" && (user?.roles || []).includes("SUPER_ADMIN");

  // Assignable administrative roles — SUPER_ADMIN is explicitly protected and excluded
  const ASSIGNABLE_ADMIN_ROLES = useMemo(() => [
    { key: "CONTENT_ADMIN", label: "Content Admin", desc: "सूचनाएं, पत्रिका, गैलरी व मीडिया (Notices, gallery & news)" },
    { key: "MODERATOR", label: "Moderator", desc: "सदस्य सत्यापन व सामग्री मॉडरेशन (Member verification & moderation)" },
    { key: "TREASURER", label: "Treasurer", desc: "दान, वित्तीय लेखा-जोखा व रसीदें (Donations & financial records)" },
    { key: "MATRIMONIAL_ADMIN", label: "Matrimonial Admin", desc: "वैवाहिक प्रोफाइल व संपर्क अनुरोध (Matrimonial listings)" },
    { key: "SCHOLARSHIP_ADMIN", label: "Scholarship Admin", desc: "शिक्षा सहायता व छात्रवृत्ति आवेदन (Educational aid & awards)" },
    { key: "JOB_ADMIN", label: "Job Admin", desc: "रोजगार अवसर व आवेदन प्रबंधन (Employment & career postings)" },
    { key: "DHARAMSHALA_ADMIN", label: "Dharamshala Admin", desc: "समाज भवन व कक्ष आरक्षण (Room bookings & facilities)" },
  ], []);

  // Rejection / Correction Modal State
  const [rejectingUser, setRejectingUser] = useState(null);
  const [rejectAction, setRejectAction] = useState("REQUEST_CORRECTION");
  const [rejectCategory, setRejectCategory] = useState("धुंधला या अस्पष्ट दस्तावेज़ (Blurred / Unclear Document)");
  const [affectedField, setAffectedField] = useState("identityDocument");
  const [rejectionReason, setRejectionReason] = useState("");

  // Document Inspection Modal State
  const [selectedUserForDoc, setSelectedUserForDoc] = useState(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docData, setDocData] = useState(null);
  const [docError, setDocError] = useState(null);

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await apiConnector(
        "GET",
        adminEndpoints.PENDING_REGISTRATIONS_API,
        null,
        authConfig
      );
      setUsers(response.data?.data?.users || []);
      setFamilyApplications(response.data?.data?.familyApplications || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load registration queue");
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleMembers = async (search = eligibleSearch, page = 1) => {
    setEligibleLoading(true);
    try {
      const q = search.trim();
      const url = `${adminEndpoints.ELIGIBLE_MEMBERS_API}?page=${page}&limit=20${q ? `&q=${encodeURIComponent(q)}` : ""}`;
      const response = await apiConnector("GET", url, null, authConfig);
      setEligibleMembers(response.data?.data?.members || []);
      setEligibleTotal(response.data?.meta?.total || 0);
      setEligiblePage(page);
    } catch (error) {
      toast.error(error.response?.data?.message || "सत्यापित सदस्यों की सूची लोड नहीं हो सकी");
    } finally {
      setEligibleLoading(false);
    }
  };

  const fetchActiveAdministrators = async (roleFilter = adminRoleFilter, search = adminSearch) => {
    setAdminsLoading(true);
    try {
      let url = adminEndpoints.ACTIVE_ADMINISTRATORS_API;
      const params = [];
      if (roleFilter && roleFilter !== "ALL") params.push(`role=${encodeURIComponent(roleFilter)}`);
      if (search?.trim()) params.push(`q=${encodeURIComponent(search.trim())}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const response = await apiConnector("GET", url, null, authConfig);
      setActiveAdministrators(response.data?.data?.administrators || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "सक्रिय प्रशासकों की सूची लोड नहीं हो सकी");
    } finally {
      setAdminsLoading(false);
    }
  };

  const fetchRoleHistory = async (actionFilter = historyFilter) => {
    setHistoryLoading(true);
    try {
      let url = adminEndpoints.ROLE_HISTORY_API;
      if (actionFilter && actionFilter !== "ALL") url += `?action=${encodeURIComponent(actionFilter)}`;
      const response = await apiConnector("GET", url, null, authConfig);
      setRoleHistory(response.data?.data?.logs || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "भूमिका इतिहास लोड नहीं हो सका");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "invites") {
      if (adminRoleSubTab === "members") fetchEligibleMembers();
      else if (adminRoleSubTab === "active") fetchActiveAdministrators();
      else if (adminRoleSubTab === "history") fetchRoleHistory();
    } else {
      fetchQueue();
    }
  }, [activeTab, adminRoleSubTab]);

  const filteredUsers = users.filter((u) => {
    const searchText = `${u.firstName || ""} ${u.lastName || ""} ${u.email || ""} ${
      u.memberId || ""
    } ${u.additionalDetails?.currentCity || ""}`.toLowerCase();
    return searchText.includes(query.trim().toLowerCase());
  });

  const reviewUser = async (userId, action, customReason = null, category = null, affField = null) => {
    if ((action === "REJECT" || action === "REQUEST_CORRECTION") && !customReason) {
      setRejectAction(action);
      setRejectingUser(userId);
      return;
    }

    setActiveUserId(userId);
    try {
      await apiConnector(
        "PATCH",
        adminEndpoints.REVIEW_REGISTRATION_API(userId),
        {
          action,
          reason: customReason || undefined,
          category: category || undefined,
          affectedField: affField || undefined,
          correctionRequired: action === "REQUEST_CORRECTION" ? customReason : undefined,
        },
        authConfig
      );
      toast.success(
        action === "APPROVE"
          ? "Member application approved & activated"
          : action === "REQUEST_CORRECTION"
          ? "Correction requested from applicant"
          : "Member application rejected"
      );

      // Refresh queue
      await fetchQueue();
      if (selectedUserForDoc?._id === userId) {
        setSelectedUserForDoc(null);
      }
      setRejectingUser(null);
      setRejectionReason("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Review action failed");
    } finally {
      setActiveUserId(null);
    }
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error("कारण लिखना अनिवार्य है (Reason is required)");
      return;
    }
    reviewUser(rejectingUser, rejectAction, rejectionReason, rejectCategory, affectedField);
  };

  const openDocumentModal = async (targetUser) => {
    setSelectedUserForDoc(targetUser);
    setDocLoading(true);
    setDocData(null);
    setDocError(null);

    try {
      const res = await apiConnector(
        "GET",
        adminEndpoints.REGISTRATION_DOCUMENT_API(targetUser._id),
        null,
        authConfig
      );
      if (res?.data?.success && res?.data?.data?.signedUrl) {
        setDocData(res.data.data);
      } else {
        setDocError("Could not retrieve document");
      }
    } catch (err) {
      console.error("Document fetch error:", err);
      setDocError(err.response?.data?.message || "No uploaded document found or access expired");
    } finally {
      setDocLoading(false);
    }
  };

  // Direct Role Modal Handlers
  const openAssignRoleModal = (member) => {
    setRoleModalMember(member);
    setModalSelectedRoles(member.adminRoles || []);
    setModalReason("");
  };

  const toggleModalRole = (roleKey) => {
    setModalSelectedRoles((prev) =>
      prev.includes(roleKey) ? prev.filter((r) => r !== roleKey) : [...prev, roleKey]
    );
  };

  const handleSaveRoles = async (e) => {
    e.preventDefault();
    if (!roleModalMember) return;
    setIsSavingRoles(true);
    try {
      const response = await apiConnector(
        "PUT",
        adminEndpoints.ASSIGN_MEMBER_ROLES_API(roleModalMember._id),
        {
          roles: modalSelectedRoles,
          reason: modalReason.trim() || undefined,
        },
        authConfig
      );
      toast.success(response.data?.message || "प्रशासनिक भूमिकाएँ सफलतापूर्वक अद्यतन की गईं");
      setRoleModalMember(null);
      fetchEligibleMembers(eligibleSearch, eligiblePage);
      fetchActiveAdministrators();
      fetchRoleHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || "भूमिका सौंपने में त्रुटि हुई");
    } finally {
      setIsSavingRoles(false);
    }
  };

  const openRevokeAccessModal = (admin) => {
    setRevokeAccessMember(admin);
    setRevokeReason("");
  };

  const handleConfirmRevokeAccess = async () => {
    if (!revokeAccessMember) return;
    setIsRevokingAccess(true);
    try {
      const response = await apiConnector(
        "DELETE",
        adminEndpoints.REVOKE_MEMBER_ACCESS_API(revokeAccessMember._id),
        {
          reason: revokeReason.trim() || undefined,
        },
        authConfig
      );
      toast.success(response.data?.message || "प्रशासनिक अधिकार सफलतापूर्वक हटा दिए गए");
      setRevokeAccessMember(null);
      fetchEligibleMembers(eligibleSearch, eligiblePage);
      fetchActiveAdministrators();
      fetchRoleHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || "अधिकार हटाने में त्रुटि हुई");
    } finally {
      setIsRevokingAccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] px-3 py-6 text-[var(--text-primary)] md:px-6 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow-badge mb-2">
                <FaShieldAlt size={12} />
                <span>Admin Portal</span>
              </div>
              <h1 className="heading-hero text-[var(--text-primary)]">
                पारिवारिक सदस्यता <span className="text-gradient">सत्यापन मंच</span>
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
                पारिवारिक आवेदनों की स्वतंत्र रूप से समीक्षा करें। प्रत्येक सदस्य के पहचान दस्तावेज़ की जांच कर स्वीकृति या अस्वीकृति प्रदान करें।
              </p>
            </div>

            {activeTab !== "invites" && (
              <label className="flex h-11 min-w-0 items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 md:w-80">
                <FaSearch className="text-[var(--text-muted)] shrink-0" size={13} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="नाम, ईमेल, शहर या Member ID खोजें..."
                  className="min-w-0 flex-1 bg-transparent text-xs sm:text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] border-none shadow-none focus:ring-0"
                />
              </label>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              {
                key: "familyApplications",
                label: `पारिवारिक आवेदन (${familyApplications.length})`,
              },
              {
                key: "registrations",
                label: `व्यक्तिगत कतार (${users.length})`,
              },
              { key: "invites", label: "प्रशासक भूमिका प्रबंधन (Admin Roles)" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`h-10 rounded-full px-5 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-[var(--accent-primary)] text-[#070707] shadow-md"
                    : "border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
          </div>
        ) : activeTab === "familyApplications" ? (
          /* =====================================================
              TAB 1: FAMILY APPLICATIONS VIEW (CORE CLIENT REQUIREMENT)
             ====================================================== */
          <div>
            {familyApplications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center bg-[var(--surface-elevated)]/50">
                <FiUsers size={36} className="mx-auto text-[var(--text-muted)] mb-2" />
                <p className="text-sm font-bold text-[var(--text-primary)]">कोई लंबित पारिवारिक आवेदन नहीं है</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  नए परिवारों के पंजीकरण आवेदन यहां दिखाई देंगे।
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {familyApplications.map((app) => {
                  const fam = app.family;
                  const stats = app.stats;
                  const head = fam.currentHeadMemberId || fam.currentFamilyAdmin;

                  return (
                    <article
                      key={fam._id}
                      className="rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] overflow-hidden shadow-xl"
                    >
                      {/* Family Header Banner */}
                      <div className="border-b border-[var(--border-subtle)] p-6 bg-[var(--surface)]/60">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                                {fam.familyName}
                              </h2>
                              <span className="font-mono text-xs font-bold text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2.5 py-1 rounded-full border border-[var(--accent-primary)]/30">
                                {fam.familyCode}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                              समग्र / राशन आईडी: <strong className="text-[var(--text-secondary)]">{fam.sssmId}</strong> · राज्य/शहर:{" "}
                              <strong className="text-[var(--text-secondary)]">
                                {fam.state}, {fam.currentCity || "Not set"}
                              </strong>
                            </p>
                          </div>

                          {/* Stats Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                              ✓ {stats.approved} Approved
                            </span>
                            {stats.pending > 0 && (
                              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
                                ⏳ {stats.pending} Pending
                              </span>
                            )}
                            {stats.rejected > 0 && (
                              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400 border border-red-500/30">
                                ✕ {stats.rejected} Rejected
                              </span>
                            )}
                            <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                              कुल: {stats.total} सदस्य
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Members Cards List */}
                      <div className="p-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-4 flex items-center gap-2">
                          <FiUsers size={14} />
                          <span>परिवार के सदस्य एवं सत्यापन दस्तावेज़ (Individual Verification)</span>
                        </h3>

                        <div className="grid gap-4 lg:grid-cols-2">
                          {app.memberships.map((membership) => {
                            const member = membership.member;
                            if (!member) return null;
                            const isHead = membership.role === "FAMILY_ADMIN" || member.familyRole === "FAMILY_HEAD";
                            const isApproved = membership.verificationStatus === "APPROVED" || member.accountStatus === "ACTIVE";
                            const isRejected = membership.verificationStatus === "REJECTED" || member.accountStatus === "REJECTED";
                            const isPending = !isApproved && !isRejected;

                            return (
                              <div
                                key={membership._id}
                                className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between ${
                                  isApproved
                                    ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                                    : isRejected
                                    ? "border-red-500/30 bg-red-500/[0.02]"
                                    : "border-[var(--border-subtle)] bg-[var(--surface)]"
                                }`}
                              >
                                <div>
                                  {/* Member Info */}
                                  <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="relative">
                                        <img
                                          src={
                                            member.imageUrl ||
                                            `https://api.dicebear.com/7.x/initials/svg?seed=${member.firstName || "Member"}`
                                          }
                                          alt={member.firstName}
                                          className="h-12 w-12 rounded-xl object-cover border border-[var(--border)]"
                                        />
                                        {isHead && (
                                          <div
                                            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-black shadow-md"
                                            title="Family Head"
                                          >
                                            <FaCrown size={10} />
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-bold text-[var(--text-primary)]">
                                          {member.firstName} {member.lastName}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <span className="font-mono text-[10px] text-[var(--accent-primary)] font-bold">
                                            {member.memberId || "SMJ-MEMBER"}
                                          </span>
                                          <span className="text-[10px] text-[var(--text-muted)]">·</span>
                                          <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                                            {membership.relationship || (isHead ? "मुखिया (Head)" : "सदस्य")}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Verification Status Badge */}
                                    <span
                                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                        isApproved
                                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                          : isRejected
                                          ? "bg-red-500/10 text-red-400 border border-red-500/30"
                                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                      }`}
                                    >
                                      {membership.verificationStatus || member.accountStatus}
                                    </span>
                                  </div>

                                  {/* Contact & Meta */}
                                  <div className="mt-3 space-y-1 text-xs text-[var(--text-secondary)]">
                                    <p>
                                      <span className="text-[var(--text-muted)]">संपर्क:</span>{" "}
                                      {member.email} · {member.additionalDetails?.contactNumber || "N/A"}
                                    </p>
                                    {member.additionalDetails?.currentCity && (
                                      <p>
                                        <span className="text-[var(--text-muted)]">शहर:</span>{" "}
                                        {member.additionalDetails.currentCity}
                                      </p>
                                    )}

                                    {/* Rejection Reason display if rejected */}
                                    {isRejected && (membership.rejectionReason || member.reviewHistory?.[member.reviewHistory.length - 1]?.reason) && (
                                      <div className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
                                        <strong>अस्वीकृति कारण:</strong>{" "}
                                        {membership.rejectionReason ||
                                          member.reviewHistory?.[member.reviewHistory.length - 1]?.reason}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3">
                                  <button
                                    onClick={() => openDocumentModal(member)}
                                    className="btn-secondary !py-1.5 !px-3 !text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <FaEye size={12} />
                                    <span>दस्तावेज़ देखें (View Document)</span>
                                  </button>

                                  <div className="flex items-center gap-2">
                                    <ActionButton
                                      tone="success"
                                      icon={FaCheck}
                                      disabled={activeUserId === member._id || isApproved}
                                      onClick={() => reviewUser(member._id, "APPROVE")}
                                    >
                                      Approve
                                    </ActionButton>
                                    <ActionButton
                                      tone="warning"
                                      icon={FaRedo}
                                      disabled={activeUserId === member._id || isApproved}
                                      onClick={() => {
                                        setRejectAction("REQUEST_CORRECTION");
                                        setRejectingUser(member._id);
                                      }}
                                    >
                                      Correction
                                    </ActionButton>
                                    <ActionButton
                                      tone="danger"
                                      icon={FaTimes}
                                      disabled={activeUserId === member._id || isRejected}
                                      onClick={() => {
                                        setRejectAction("REJECT");
                                        setRejectingUser(member._id);
                                      }}
                                    >
                                      Reject
                                    </ActionButton>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === "registrations" ? (
          /* =====================================================
              TAB 2: INDIVIDUAL REGISTRATION QUEUE (LEGACY COMPATIBILITY)
             ====================================================== */
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]">
            <div className="hidden grid-cols-[1.4fr_1fr_1fr_1.3fr] gap-4 border-b border-[var(--border-subtle)] bg-[var(--surface)] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] md:grid">
              <span>Applicant</span>
              <span>Community Info</span>
              <span>Verification Document</span>
              <span>Review Action</span>
            </div>

            <div className="divide-y divide-[var(--border-subtle)]">
              {filteredUsers.map((applicant) => (
                <div
                  key={applicant._id}
                  className="flex flex-col gap-4 p-5 md:grid md:grid-cols-[1.4fr_1fr_1fr_1.3fr]"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={applicant.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${applicant.firstName || "Member"}`}
                      alt={applicant.firstName}
                      className="h-11 w-11 rounded-xl object-cover border border-[var(--border)]"
                    />
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {applicant.firstName} {applicant.lastName}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] font-mono">{applicant.memberId || "SMJ-MEMBER"}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{applicant.email}</p>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${statusStyles[applicant.accountStatus]}`}>
                        {applicant.accountStatus}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-[var(--text-secondary)]">
                    <p>शहर: {applicant.additionalDetails?.currentCity || "Not set"}</p>
                    <p>गोत्र: {applicant.additionalDetails?.gotra || "Not set"}</p>
                  </div>

                  <div>
                    <button
                      onClick={() => openDocumentModal(applicant)}
                      className="btn-secondary !py-1.5 !px-3 !text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <FaEye size={12} />
                      <span>View Document</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <ActionButton
                      tone="success"
                      icon={FaCheck}
                      disabled={activeUserId === applicant._id}
                      onClick={() => reviewUser(applicant._id, "APPROVE")}
                    >
                      Approve
                    </ActionButton>
                    <ActionButton
                      tone="danger"
                      icon={FaTimes}
                      disabled={activeUserId === applicant._id}
                      onClick={() => reviewUser(applicant._id, "REJECT")}
                    >
                      Reject
                    </ActionButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* =====================================================
              TAB 3: DIRECT ADMIN ROLE MANAGEMENT (NO EMAIL INVITES)
             ====================================================== */
          <div className="space-y-6">
            {/* Header / Intro Card */}
            <div className="ka-card p-6 shadow-xl border border-[var(--border-subtle)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="eyebrow-badge mb-1.5 flex items-center gap-1.5">
                    <FiShield size={12} />
                    <span>Role-Based Access Control</span>
                  </div>
                  <h3 className="text-lg font-black text-[var(--text-primary)]">
                    प्रशासक भूमिका प्रबंधन
                  </h3>
                  <p className="mt-1 text-xs text-[var(--text-secondary)] font-normal">
                    सत्यापित समाज सदस्यों को सीधे प्रशासनिक भूमिकाएँ प्रदान करें। कोई ईमेल आमंत्रण या टोकन की आवश्यकता नहीं है।
                  </p>
                </div>

                {/* Sub-tab Navigation */}
                <div className="flex flex-wrap items-center gap-2 bg-[var(--surface)] p-1.5 rounded-2xl border border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setAdminRoleSubTab("members")}
                    className={`h-9 rounded-xl px-4 text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                      adminRoleSubTab === "members"
                        ? "bg-[var(--accent-primary)] text-black shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <FiUsers size={13} />
                    <span>सत्यापित सदस्य ({eligibleTotal})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminRoleSubTab("active")}
                    className={`h-9 rounded-xl px-4 text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                      adminRoleSubTab === "active"
                        ? "bg-[var(--accent-primary)] text-black shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <FiUserCheck size={13} />
                    <span>सक्रिय प्रशासक ({activeAdministrators.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminRoleSubTab("history")}
                    className={`h-9 rounded-xl px-4 text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                      adminRoleSubTab === "history"
                        ? "bg-[var(--accent-primary)] text-black shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <FiFileText size={13} />
                    <span>भूमिका इतिहास ({roleHistory.length})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* =====================================================
                SUB-TAB 1: VERIFIED MEMBERS (ELIGIBLE FOR ROLE ASSIGNMENT)
               ====================================================== */}
            {adminRoleSubTab === "members" && (
              <div className="space-y-4">
                {/* Search Bar & Stats */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-96">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={15} />
                    <input
                      type="text"
                      value={eligibleSearch}
                      onChange={(e) => {
                        setEligibleSearch(e.target.value);
                        fetchEligibleMembers(e.target.value, 1);
                      }}
                      placeholder="सत्यापित सदस्य खोजें (नाम या Member ID)..."
                      className="ka-input !pl-10 text-xs sm:text-sm w-full"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchEligibleMembers(eligibleSearch, eligiblePage)}
                    className="btn-secondary !h-9 !py-0 !px-3 text-xs flex items-center gap-1.5 shrink-0"
                    title="Refresh list"
                  >
                    <FiRefreshCw size={12} className={eligibleLoading ? "animate-spin" : ""} />
                    <span>रिफ्रेश</span>
                  </button>
                </div>

                {eligibleLoading ? (
                  <div className="flex h-48 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--accent-primary)] border-t-transparent" />
                  </div>
                ) : eligibleMembers.length === 0 ? (
                  <div className="ka-card p-12 text-center border-dashed border-[var(--border-subtle)]">
                    <FiUsers size={36} className="mx-auto text-[var(--text-muted)] mb-3" />
                    <p className="text-sm font-bold text-[var(--text-primary)]">कोई सत्यापित सदस्य नहीं मिला</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {eligibleSearch ? "खोज परिणाम के लिए कोई सदस्य नहीं मिला।" : "सत्यापित सक्रिय सदस्य यहां दिखाई देंगे।"}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                    {eligibleMembers.map((member) => (
                      <div
                        key={member._id}
                        className="ka-card p-4 sm:p-5 flex flex-col justify-between border border-[var(--border-subtle)] shadow-md hover:border-[var(--border-strong)] transition-all"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={
                                  member.imageUrl ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                    member.name || "Member"
                                  )}`
                                }
                                alt=""
                                className="h-12 w-12 rounded-2xl border border-[var(--border-subtle)] object-cover shadow-sm shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                    member.firstName || "Member"
                                  )}`;
                                }}
                              />
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                                  {member.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-[11px] text-[var(--accent-primary)] font-bold">
                                    {member.memberId || "SMJ-MEMBER"}
                                  </span>
                                  <span className="text-[10px] text-[var(--text-muted)]">·</span>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                    <FiCheckCircle size={10} />
                                    सत्यापित सदस्य
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Admin Status Pill */}
                            {member.isAdmin ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 px-2.5 py-0.5 text-[10px] font-bold text-[var(--accent-primary)] shrink-0">
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
                                प्रशासक
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-400/10 border border-gray-400/20 px-2.5 py-0.5 text-[10px] font-bold text-[var(--text-muted)] shrink-0">
                                सदस्य
                              </span>
                            )}
                          </div>

                          {/* Roles Display */}
                          <div className="mb-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                              प्रशासनिक भूमिकाएँ (Roles):
                            </p>
                            {member.adminRoles && member.adminRoles.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {member.adminRoles.map((r) => (
                                  <span
                                    key={r}
                                    className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 px-2 py-0.5 text-[10px] font-bold text-[var(--accent-primary)]"
                                  >
                                    <FiShield size={9} />
                                    {r.replace(/_/g, " ")}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[var(--text-muted)] italic">
                                कोई प्रशासनिक भूमिका नहीं सौंपी गई है
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Card Action Footer */}
                        <div className="border-t border-[var(--border-subtle)] pt-3 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-[var(--text-muted)]">
                            जुड़े: {new Date(member.joinedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>

                          <button
                            type="button"
                            onClick={() => openAssignRoleModal(member)}
                            className={`btn-primary !h-8 !py-0 !px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                              member.isAdmin ? "!bg-amber-500 hover:!bg-amber-400 !text-black" : ""
                            }`}
                          >
                            <FiShield size={12} />
                            <span>{member.isAdmin ? "भूमिकाएँ बदलें" : "भूमिका सौंपें"}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {eligibleTotal > 20 && (
                  <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                    <span className="text-xs text-[var(--text-muted)]">
                      कुल {eligibleTotal} में से {(eligiblePage - 1) * 20 + 1} - {Math.min(eligiblePage * 20, eligibleTotal)} सदस्य
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={eligiblePage <= 1}
                        onClick={() => fetchEligibleMembers(eligibleSearch, eligiblePage - 1)}
                        className="btn-secondary !h-8 !py-0 !px-3 text-xs font-bold disabled:opacity-40"
                      >
                        पिछला
                      </button>
                      <button
                        type="button"
                        disabled={eligiblePage * 20 >= eligibleTotal}
                        onClick={() => fetchEligibleMembers(eligibleSearch, eligiblePage + 1)}
                        className="btn-secondary !h-8 !py-0 !px-3 text-xs font-bold disabled:opacity-40"
                      >
                        अगला
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =====================================================
                SUB-TAB 2: ACTIVE ADMINISTRATORS
               ====================================================== */}
            {adminRoleSubTab === "active" && (
              <div className="space-y-4">
                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-[var(--text-muted)]">भूमिका फ़िल्टर:</span>
                    <select
                      value={adminRoleFilter}
                      onChange={(e) => {
                        setAdminRoleFilter(e.target.value);
                        fetchActiveAdministrators(e.target.value, adminSearch);
                      }}
                      className="ka-input !h-9 text-xs !py-0 !px-3"
                    >
                      <option value="ALL">सभी भूमिकाएँ (All Roles)</option>
                      {ASSIGNABLE_ADMIN_ROLES.map((r) => (
                        <option key={r.key} value={r.key}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={13} />
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => {
                          setAdminSearch(e.target.value);
                          fetchActiveAdministrators(adminRoleFilter, e.target.value);
                        }}
                        placeholder="प्रशासक खोजें..."
                        className="ka-input !pl-9 !h-9 text-xs w-full"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => fetchActiveAdministrators(adminRoleFilter, adminSearch)}
                      className="btn-secondary !h-9 !py-0 !px-3 text-xs flex items-center gap-1.5 shrink-0"
                    >
                      <FiRefreshCw size={12} className={adminsLoading ? "animate-spin" : ""} />
                      <span>रिफ्रेश</span>
                    </button>
                  </div>
                </div>

                {adminsLoading ? (
                  <div className="flex h-48 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--accent-primary)] border-t-transparent" />
                  </div>
                ) : activeAdministrators.length === 0 ? (
                  <div className="ka-card p-12 text-center border-dashed border-[var(--border-subtle)]">
                    <FiUserCheck size={36} className="mx-auto text-[var(--text-muted)] mb-3" />
                    <p className="text-sm font-bold text-[var(--text-primary)]">कोई सक्रिय प्रशासक नहीं मिला</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      सत्यापित सदस्य टैब से सदस्यों को प्रशासनिक भूमिकाएँ प्रदान करें।
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                    {activeAdministrators.map((admin) => (
                      <div
                        key={admin._id}
                        className="ka-card p-4 sm:p-5 flex flex-col justify-between border border-[var(--border-subtle)] shadow-md hover:border-[var(--border-strong)] transition-all"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={
                                  admin.imageUrl ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                    admin.name || "Admin"
                                  )}`
                                }
                                alt=""
                                className="h-11 w-11 rounded-2xl border border-[var(--border-subtle)] object-cover shadow-sm shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                    admin.firstName || "Admin"
                                  )}`;
                                }}
                              />
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                                  {admin.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-[11px] text-[var(--accent-primary)] font-bold">
                                    {admin.memberId || "SMJ-ADMIN"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {admin.isSuperAdmin ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-bold text-purple-400 shrink-0">
                                <FaCrown size={10} />
                                SUPER ADMIN
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 shrink-0">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                ACTIVE ADMIN
                              </span>
                            )}
                          </div>

                          <div className="mb-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                              सक्रिय भूमिकाएँ (Active Roles):
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {(admin.roles || []).map((r) => {
                                if (r === "MEMBER") return null;
                                const isSuper = r === "SUPER_ADMIN";
                                return (
                                  <span
                                    key={r}
                                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold ${
                                      isSuper
                                        ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                                        : "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30 text-[var(--accent-primary)]"
                                    }`}
                                  >
                                    <FiShield size={9} />
                                    {r.replace(/_/g, " ")}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="border-t border-[var(--border-subtle)] pt-3 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-[var(--text-muted)]">
                            अद्यतन: {new Date(admin.assignedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openAssignRoleModal(admin)}
                              className="btn-secondary !h-8 !py-0 !px-3 text-xs font-bold text-[var(--accent-primary)] cursor-pointer"
                            >
                              भूमिकाएँ बदलें
                            </button>

                            {!admin.isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => openRevokeAccessModal(admin)}
                                className="btn-secondary !h-8 !py-0 !px-3 text-xs font-bold text-red-400 hover:text-red-300 hover:border-red-400/40 cursor-pointer"
                                title="सभी प्रशासनिक अधिकार समाप्त करें"
                              >
                                अधिकार हटाएं
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* =====================================================
                SUB-TAB 3: ROLE CHANGE HISTORY (AUDIT TRAIL)
               ====================================================== */}
            {adminRoleSubTab === "history" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-muted)]">कार्रवाई फ़िल्टर:</span>
                    <select
                      value={historyFilter}
                      onChange={(e) => {
                        setHistoryFilter(e.target.value);
                        fetchRoleHistory(e.target.value);
                      }}
                      className="ka-input !h-9 text-xs !py-0 !px-3"
                    >
                      <option value="ALL">सभी कार्रवाइयाँ (All Actions)</option>
                      <option value="ADMIN_ROLE_ASSIGNED">भूमिका सौंपी गई (Role Assigned)</option>
                      <option value="ADMIN_ROLES_UPDATED">भूमिकाएँ अद्यतन (Roles Updated)</option>
                      <option value="ADMIN_ACCESS_REVOKED">अधिकार हटाए गए (Access Revoked)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchRoleHistory(historyFilter)}
                    className="btn-secondary !h-9 !py-0 !px-3 text-xs flex items-center gap-1.5"
                  >
                    <FiRefreshCw size={12} className={historyLoading ? "animate-spin" : ""} />
                    <span>रिफ्रेश</span>
                  </button>
                </div>

                {historyLoading ? (
                  <div className="flex h-48 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--accent-primary)] border-t-transparent" />
                  </div>
                ) : roleHistory.length === 0 ? (
                  <div className="ka-card p-12 text-center border-dashed border-[var(--border-subtle)]">
                    <FiFileText size={36} className="mx-auto text-[var(--text-muted)] mb-3" />
                    <p className="text-sm font-bold text-[var(--text-primary)]">कोई भूमिका इतिहास उपलब्ध नहीं है</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      भूमिका आवंटन या निरस्तीकरण की प्रत्येक कार्रवाई यहाँ ऑडिट रिकॉर्ड के रूप में दर्ज होगी।
                    </p>
                  </div>
                ) : (
                  <div className="ka-card divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] shadow-md overflow-hidden">
                    {roleHistory.map((log) => {
                      const isRevoke = log.action === "ADMIN_ACCESS_REVOKED" || log.action === "admin.access.revoked";
                      const isAssigned = log.action === "ADMIN_ROLE_ASSIGNED" || log.action === "admin.role.assigned";

                      return (
                        <div key={log._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                                  isRevoke
                                    ? "bg-red-400/10 text-red-400 border-red-400/30"
                                    : isAssigned
                                    ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
                                    : "bg-sky-400/10 text-sky-400 border-sky-400/30"
                                }`}
                              >
                                {isRevoke ? "ACCESS REVOKED" : isAssigned ? "ROLE ASSIGNED" : "ROLES UPDATED"}
                              </span>

                              <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                                सदस्य: {log.target?.firstName ? `${log.target.firstName} ${log.target.lastName || ""}` : log.metadata?.name || "Member"}
                                {log.target?.memberId && (
                                  <span className="ml-2 font-mono text-xs text-[var(--accent-primary)]">
                                    ({log.target.memberId})
                                  </span>
                                )}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                              <span>
                                कर्ता (By): {log.actor?.firstName ? `${log.actor.firstName} ${log.actor.lastName || ""}` : "Super Admin"}
                              </span>
                              <span>•</span>
                              <span>
                                समय: {new Date(log.createdAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {log.reason && (
                                <>
                                  <span>•</span>
                                  <span className="italic text-[var(--text-secondary)]">कारण: "{log.reason}"</span>
                                </>
                              )}
                            </div>

                            {/* New Roles summary */}
                            {log.newValue?.assignedRoles && (
                              <div className="mt-2 flex items-center gap-1.5">
                                <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">भूमिकाएँ:</span>
                                <div className="flex flex-wrap gap-1">
                                  {log.newValue.assignedRoles.map((r) => (
                                    <span
                                      key={r}
                                      className="inline-flex items-center rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--accent-primary)]"
                                    >
                                      {r.replace(/_/g, " ")}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            STRUCTURED REJECTION / CORRECTION MODAL (MANDATORY REQUIREMENT)
           ====================================================== */}
        {rejectingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${rejectAction === "REQUEST_CORRECTION" ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" : "bg-red-400/10 text-red-400 border border-red-400/20"}`}>
                  <FiAlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {rejectAction === "REQUEST_CORRECTION" ? "सुधार का अनुरोध (Request Correction)" : "आवेदन अस्वीकृत करें (Reject Application)"}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    सदस्य को स्पष्ट कारण व निर्देश भेजे जाएंगे ताकि वे सुधार कर पुनः जमा कर सकें।
                  </p>
                </div>
              </div>

              {/* Action Toggle */}
              <div className="mb-4 flex rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setRejectAction("REQUEST_CORRECTION")}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                    rejectAction === "REQUEST_CORRECTION"
                      ? "bg-amber-400 text-black shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  सुधार का अनुरोध (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setRejectAction("REJECT")}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                    rejectAction === "REJECT"
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  अस्वीकृत करें (Reject)
                </button>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    श्रेणी चुनें (Rejection / Correction Category) *
                  </label>
                  <select
                    value={rejectCategory}
                    onChange={(e) => setRejectCategory(e.target.value)}
                    className="ka-input w-full p-2.5 text-xs"
                    required
                  >
                    {REJECTION_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    संबंधित फ़ील्ड (Affected Field)
                  </label>
                  <select
                    value={affectedField}
                    onChange={(e) => setAffectedField(e.target.value)}
                    className="ka-input w-full p-2.5 text-xs"
                  >
                    {AFFECTED_FIELDS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    विस्तृत कारण एवं आवश्यक निर्देश (Mandatory Detailed Reason) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={
                      rejectAction === "REQUEST_CORRECTION"
                        ? "आवेदक को क्या सुधार करना है लिखें (उदा. कृपया आधार कार्ड की दोनों तरफ की स्पष्ट प्रति अपलोड करें)..."
                        : "अस्वीकृति का सटीक कारण दर्ज करें..."
                    }
                    className="ka-input w-full resize-none p-3 text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingUser(null);
                      setRejectionReason("");
                    }}
                    className="btn-secondary !py-2 !px-4 text-xs font-bold"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className={`btn-primary !py-2 flex-1 text-xs font-bold text-white cursor-pointer ${
                      rejectAction === "REQUEST_CORRECTION" ? "!bg-amber-500 hover:!bg-amber-400 text-black" : "!bg-red-600 hover:!bg-red-500"
                    }`}
                  >
                    {rejectAction === "REQUEST_CORRECTION" ? "सुधार का अनुरोध भेजें (Send Correction)" : "अस्वीकृति पुष्टि करें (Confirm Reject)"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================
            DOCUMENT INSPECTION MODAL
           ====================================================== */}
        {selectedUserForDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
            <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    दस्तावेज़ सत्यापन: {selectedUserForDoc.firstName} {selectedUserForDoc.lastName}
                  </h3>
                  <p className="text-xs text-[var(--accent-primary)] font-mono">
                    Member ID: {selectedUserForDoc.memberId || "SMJ-MEMBER"}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedUserForDoc(null)}
                  className="rounded-full p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                {docLoading ? (
                  <div className="flex h-56 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent" />
                  </div>
                ) : docError ? (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-xs text-red-300">
                    {docError}
                  </div>
                ) : docData?.signedUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span>📄 {docData.documentMeta?.name || "Uploaded Document"}</span>
                      <a
                        href={docData.signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--accent-primary)] font-bold inline-flex items-center gap-1 hover:underline"
                      >
                        <FaExternalLinkAlt size={10} /> पूर्ण आकार में खोलें
                      </a>
                    </div>
                    <div className="flex max-h-[55vh] items-center justify-center overflow-hidden rounded-2xl bg-black/50 p-2 border border-[var(--border-subtle)]">
                      <img
                        src={docData.signedUrl}
                        alt="Verification Document"
                        className="max-h-[50vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Modal Decision Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-4">
                <button
                  onClick={() => reviewUser(selectedUserForDoc._id, "APPROVE")}
                  className="btn-primary !py-2 !px-5 text-xs font-bold"
                >
                  स्वीकृत करें (Approve)
                </button>
                <button
                  onClick={() => {
                    const uId = selectedUserForDoc._id;
                    setSelectedUserForDoc(null);
                    setRejectAction("REQUEST_CORRECTION");
                    setRejectingUser(uId);
                  }}
                  className="btn-secondary !py-2 !px-4 text-xs font-bold text-amber-400 hover:text-amber-300"
                >
                  सुधार का अनुरोध (Correction)
                </button>
                <button
                  onClick={() => {
                    const uId = selectedUserForDoc._id;
                    setSelectedUserForDoc(null);
                    setRejectAction("REJECT");
                    setRejectingUser(uId);
                  }}
                  className="btn-secondary !py-2 !px-4 text-xs font-bold text-red-400 hover:text-red-300"
                >
                  अस्वीकृत करें (Reject)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            ROLE ASSIGNMENT / EDIT MODAL (SUPER ADMIN ONLY)
           ====================================================== */}
        {roleModalMember && (
<div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
  <div
    className="
      relative w-full max-w-2xl
      max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)]
      overflow-y-auto
      rounded-2xl sm:rounded-3xl
      border border-[var(--border-subtle)]
      bg-[var(--surface-elevated)]
      shadow-2xl
      my-1 sm:my-4
    "
  >
    {/* ========================================================= */}
    {/* MODAL HEADER */}
    {/* ========================================================= */}
    <div
      className="
        sticky top-0 z-10
        flex items-start justify-between gap-3
        border-b border-[var(--border-subtle)]
        bg-[var(--surface-elevated)]
        px-4 py-4
        sm:px-6 sm:py-5
      "
    >
      <div className="min-w-0 flex-1">
        <div className="eyebrow-badge mb-1.5 flex w-fit items-center gap-1.5">
          <FiShield size={12} />
          <span>Direct Role Assignment</span>
        </div>

        <h3 className="text-sm sm:text-lg font-black leading-tight text-[var(--text-primary)]">
          प्रशासनिक भूमिकाएँ प्रबंधित करें
        </h3>

        <p className="mt-1 text-[10px] sm:text-xs leading-relaxed text-[var(--text-muted)]">
          सत्यापित सदस्य के लिए एक या अधिक प्रशासनिक भूमिकाएँ चुनें।
        </p>
      </div>

      <button
        type="button"
        onClick={() => setRoleModalMember(null)}
        className="
          shrink-0 rounded-xl p-2
          text-[var(--text-muted)]
          hover:bg-[var(--surface)]
          hover:text-[var(--text-primary)]
          active:scale-95
          transition
          cursor-pointer
        "
        aria-label="Close"
      >
        <FiX size={18} />
      </button>
    </div>

    {/* ========================================================= */}
    {/* MODAL BODY */}
    {/* ========================================================= */}
    <div className="px-4 py-4 sm:px-6 sm:py-5">

      {/* ======================================================= */}
      {/* TARGET MEMBER BANNER */}
      {/* ======================================================= */}
      <div
        className="
          flex items-center gap-3
          rounded-2xl
          border border-[var(--border-subtle)]
          bg-[var(--surface)]
          p-3
          sm:p-3.5
          mb-5
        "
      >
        <img
          src={
            roleModalMember.imageUrl ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              roleModalMember.name || "Member"
            )}`
          }
          alt=""
          className="
            h-11 w-11
            sm:h-12 sm:w-12
            shrink-0
            rounded-xl
            object-cover
            border border-[var(--border-subtle)]
            bg-[var(--surface-elevated)]
          "
        />

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm sm:text-base font-bold text-[var(--text-primary)]">
            {roleModalMember.name}
          </h4>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-[10px] sm:text-xs font-bold text-[var(--accent-primary)]">
              {roleModalMember.memberId || "SMJ-MEMBER"}
            </span>

            <span className="hidden xs:inline text-[10px] text-[var(--text-muted)]">
              ·
            </span>

            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-400">
              <FiCheckCircle size={10} />
              <span>सत्यापित सदस्य</span>
              <span className="hidden sm:inline">(Verified)</span>
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* ROLES FORM */}
      {/* ======================================================= */}
      <form onSubmit={handleSaveRoles} className="space-y-5">

        {/* ===================================================== */}
        {/* ROLES SELECTION */}
        {/* ===================================================== */}
        <div>
          <div className="mb-2.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[var(--text-muted)]">
              प्रशासनिक भूमिकाएँ चुनें (Select Roles)
            </label>

            <span className="w-fit rounded-full bg-[var(--accent-primary)]/10 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-[var(--accent-primary)]">
              {modalSelectedRoles.length} चयनित
              <span className="hidden sm:inline">
                {" "}({modalSelectedRoles.length} Selected)
              </span>
            </span>
          </div>

          {/* Role Grid */}
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-2.5
              max-h-[320px]
              sm:max-h-72
              overflow-y-auto
              pr-1
              overscroll-contain
            "
          >
            {ASSIGNABLE_ADMIN_ROLES.map((role) => {
              const isSelected = modalSelectedRoles.includes(role.key);

              return (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => toggleModalRole(role.key)}
                  className={`
                    group
                    flex flex-col items-start
                    min-h-[82px]
                    p-3 sm:p-3.5
                    rounded-2xl
                    border
                    text-left
                    transition-all
                    cursor-pointer
                    active:scale-[0.99]

                    ${
                      isSelected
                        ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-sm ring-1 ring-[var(--accent-primary)]/30"
                        : "border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                    }
                  `}
                >
                  <div className="mb-1.5 flex w-full items-start justify-between gap-2">
                    <span className="min-w-0 text-[10px] sm:text-xs font-black uppercase tracking-wider leading-tight">
                      {role.label}
                    </span>

                    <div
                      className={`
                        flex h-5 w-5 shrink-0 items-center justify-center
                        rounded-full
                        text-[10px]
                        transition
                        ${
                          isSelected
                            ? "bg-[var(--accent-primary)] text-black font-bold"
                            : "border border-[var(--border-subtle)] bg-transparent"
                        }
                      `}
                    >
                      {isSelected ? "✓" : ""}
                    </div>
                  </div>

                  <span className="text-[9px] sm:text-[10px] leading-relaxed text-[var(--text-muted)]">
                    {role.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===================================================== */}
        {/* REASON */}
        {/* ===================================================== */}
        <div>
          <label className="mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[var(--text-muted)]">
            टिप्पणी / कारण
            <span className="ml-1 normal-case tracking-normal opacity-70">
              (Optional Reason for Audit Log)
            </span>
          </label>

          <input
            type="text"
            value={modalReason}
            onChange={(e) => setModalReason(e.target.value)}
            placeholder="उदा. समाज कार्यकारिणी के निर्णयानुसार दायित्व सौंपा गया..."
            className="
              ka-input
              w-full
              text-xs
              min-h-[42px]
              sm:min-h-[44px]
            "
          />
        </div>

        {/* ===================================================== */}
        {/* ACTION BUTTONS */}
        {/* ===================================================== */}
        <div
          className="
            flex flex-col-reverse
            sm:flex-row
            sm:items-center
            sm:justify-end
            gap-2.5 sm:gap-3
            border-t border-[var(--border-subtle)]
            pt-4
          "
        >
          <button
            type="button"
            onClick={() => setRoleModalMember(null)}
            className="
              btn-secondary
              w-full sm:w-auto
              !py-2.5
              !px-5
              text-xs
              font-bold
              cursor-pointer
              active:scale-[0.98]
              transition
            "
          >
            रद्द करें (Cancel)
          </button>

          <button
            type="submit"
            disabled={isSavingRoles}
            className="
              btn-primary
              w-full sm:w-auto
              !py-2.5
              !px-5 sm:!px-6
              text-xs
              font-bold
              flex items-center justify-center gap-2
              cursor-pointer
              disabled:cursor-not-allowed
              disabled:opacity-60
              active:scale-[0.98]
              transition
            "
          >
            {isSavingRoles ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                <span>सहेज रहे हैं...</span>
              </>
            ) : (
              <>
                <FiCheckCircle size={13} />
                <span>भूमिकाएँ लागू करें (Assign Roles)</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  </div>
</div>
        )}

        {/* =====================================================
            REVOKE ALL ADMINISTRATIVE ACCESS CONFIRMATION MODAL
           ====================================================== */}
        {revokeAccessMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-400/10 text-red-400 border border-red-400/20">
                  <FiAlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    प्रशासनिक अधिकार समाप्त करें?
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    क्या आप वाकई इस सदस्य के सभी प्रशासनिक अधिकार हटाना चाहते हैं?
                  </p>
                </div>
              </div>

              <div className="my-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 space-y-2 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">सदस्य (Member)</p>
                  <p className="font-bold text-[var(--text-primary)]">
                    {revokeAccessMember.name} ({revokeAccessMember.memberId || "SMJ-MEMBER"})
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">हटाए जाने वाले अधिकार</p>
                  <p className="text-red-400 font-semibold">
                    {(revokeAccessMember.adminRoles || []).join(", ") || "सभी प्रशासनिक भूमिकाएँ"}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-[11px] text-emerald-300">
                  ✓ सदस्य का सामान्य समाज खाता, परिवार व सभी व्यक्तिगत रिकॉर्ड यथावत सक्रिय रहेंगे।
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  हटाने का कारण (Reason)
                </label>
                <input
                  type="text"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="उदा. कार्यकाल समाप्त / दायित्व परिवर्तन"
                  className="ka-input text-xs w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-4">
                <button
                  type="button"
                  onClick={() => setRevokeAccessMember(null)}
                  className="btn-secondary !py-2 !px-4 text-xs font-bold cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  disabled={isRevokingAccess}
                  onClick={handleConfirmRevokeAccess}
                  className="btn-primary !py-2 !px-5 text-xs font-bold !bg-red-600 hover:!bg-red-500 !text-white cursor-pointer"
                >
                  {isRevokingAccess ? "हटा रहे हैं..." : "अधिकार समाप्त करें"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRegistrationQueue;
