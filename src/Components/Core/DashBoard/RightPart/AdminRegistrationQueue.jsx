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
  const [users, setUsers] = useState([]);
  const [familyApplications, setFamilyApplications] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeUserId, setActiveUserId] = useState(null);
  const [inviteForm, setInviteForm] = useState({ email: "", roles: ["CONTENT_ADMIN"] });

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

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const response = await apiConnector(
        "GET",
        adminEndpoints.ADMIN_INVITES_API,
        null,
        authConfig
      );
      setInvites(response.data?.data?.invites || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load admin invites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "invites") fetchInvites();
    else fetchQueue();
  }, [activeTab]);

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

  const createInvite = async (event) => {
    event.preventDefault();
    setActiveUserId("invite");
    try {
      await apiConnector(
        "POST",
        adminEndpoints.ADMIN_INVITES_API,
        { email: inviteForm.email.trim().toLowerCase(), roles: inviteForm.roles },
        authConfig
      );
      toast.success("Admin invite sent");
      setInviteForm({ email: "", roles: ["CONTENT_ADMIN"] });
      await fetchInvites();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send invite");
    } finally {
      setActiveUserId(null);
    }
  };

  const revokeInvite = async (inviteId) => {
    setActiveUserId(inviteId);
    try {
      await apiConnector(
        "PATCH",
        adminEndpoints.REVOKE_ADMIN_INVITE_API(inviteId),
        null,
        authConfig
      );
      toast.success("Invite revoked");
      await fetchInvites();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to revoke invite");
    } finally {
      setActiveUserId(null);
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
              { key: "invites", label: "प्रशासक आमंत्रण (Admin Invites)" },
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
              TAB 3: ADMIN INVITES
             ====================================================== */
          <div className="space-y-6">
            <form onSubmit={createInvite} className="ka-card p-6">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">प्रशासक आमंत्रण भेजें (Invite Admin)</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  required
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@samaj.org"
                  className="ka-input flex-1"
                />
                <button type="submit" className="btn-primary !py-2.5 !px-6 font-bold text-xs">
                  आमंत्रण भेजें
                </button>
              </div>
            </form>

            <div className="ka-card divide-y divide-[var(--border-subtle)]">
              {invites.map((inv) => (
                <div key={inv._id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{inv.email}</p>
                    <p className="text-xs text-[var(--text-muted)]">Roles: {inv.roles?.join(", ")}</p>
                  </div>
                  {inv.status === "PENDING" && (
                    <button
                      onClick={() => revokeInvite(inv._id)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
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
      </div>
    </div>
  );
};

export default AdminRegistrationQueue;
