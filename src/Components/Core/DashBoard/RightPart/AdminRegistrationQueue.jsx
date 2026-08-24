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
} from "react-icons/fa";
import { FiX, FiCheckCircle, FiAlertTriangle, FiFileText, FiShield } from "react-icons/fi";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { adminEndpoints } from "../../../../services/apis";

const statusStyles = {
  PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  CORRECTION_REQUESTED: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  ACTIVE: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  REJECTED: "border-red-400/30 bg-red-400/10 text-red-200",
  ACCEPTED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  REVOKED: "border-red-400/30 bg-red-400/10 text-red-200",
  EXPIRED: "border-gray-400/30 bg-gray-400/10 text-gray-200",
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
    neutral: "btn-secondary !py-2 !px-3.5 !text-xs",
    success: "btn-primary !py-2 !px-4 !text-xs",
    warning: "inline-flex items-center justify-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 font-bold text-xs uppercase tracking-wider px-3.5 py-2 transition-all hover:bg-amber-400/20 disabled:opacity-50 cursor-pointer",
    danger: "inline-flex items-center justify-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 text-red-300 font-bold text-xs uppercase tracking-wider px-3.5 py-2 transition-all hover:bg-red-400/20 disabled:opacity-50 cursor-pointer",
    info: "inline-flex items-center justify-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-300 font-bold text-xs uppercase tracking-wider px-3.5 py-2 transition-all hover:bg-sky-400/20 disabled:opacity-50 cursor-pointer",
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


const EmptyState = () => (
  <div className="border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
    <p className="text-sm font-semibold text-white">No pending registrations</p>
    <p className="mt-1 text-xs text-gray-500">New member applications will appear here for review.</p>
  </div>
);

const AdminRegistrationQueue = () => {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("registrations");
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeUserId, setActiveUserId] = useState(null);
  const [reasonByUser, setReasonByUser] = useState({});
  const [inviteForm, setInviteForm] = useState({ email: "", roles: ["CONTENT_ADMIN"] });

  // Document Inspection Modal State
  const [selectedUserForDoc, setSelectedUserForDoc] = useState(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docData, setDocData] = useState(null);
  const [docError, setDocError] = useState(null);

  const authConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  }), [token]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await apiConnector("GET", adminEndpoints.PENDING_REGISTRATIONS_API, null, authConfig);
      setUsers(response.data?.data?.users || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load registration queue");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const response = await apiConnector("GET", adminEndpoints.ADMIN_INVITES_API, null, authConfig);
      setInvites(response.data?.data?.invites || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load admin invites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "registrations") fetchQueue();
    else fetchInvites();
  }, [activeTab]);

  const filteredUsers = users.filter((user) => {
    const searchText = `${user.firstName || ""} ${user.lastName || ""} ${user.email || ""} ${user.additionalDetails?.currentCity || ""}`.toLowerCase();
    return searchText.includes(query.trim().toLowerCase());
  });

  const reviewUser = async (userId, action) => {
    setActiveUserId(userId);
    try {
      await apiConnector(
        "PATCH",
        adminEndpoints.REVIEW_REGISTRATION_API(userId),
        { action, reason: reasonByUser[userId] || undefined },
        authConfig
      );
      toast.success(
        action === "APPROVE"
          ? "Member application approved & activated"
          : action === "REQUEST_CORRECTION"
          ? "Correction requested from applicant"
          : "Application rejected"
      );
      setUsers((current) => current.filter((user) => user._id !== userId));
      if (selectedUserForDoc?._id === userId) {
        setSelectedUserForDoc(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Review action failed");
    } finally {
      setActiveUserId(null);
    }
  };

  const openDocumentModal = async (user) => {
    setSelectedUserForDoc(user);
    setDocLoading(true);
    setDocData(null);
    setDocError(null);

    try {
      const res = await apiConnector("GET", adminEndpoints.REGISTRATION_DOCUMENT_API(user._id), null, authConfig);
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

  const toggleInviteRole = (role) => {
    setInviteForm((current) => {
      const exists = current.roles.includes(role);
      const roles = exists ? current.roles.filter((item) => item !== role) : [...current.roles, role];
      return { ...current, roles: roles.length > 0 ? roles : current.roles };
    });
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
      toast.error(error.response?.data?.message || "Unable to create admin invite");
    } finally {
      setActiveUserId(null);
    }
  };

  const revokeInvite = async (inviteId) => {
    setActiveUserId(inviteId);
    try {
      await apiConnector("PATCH", adminEndpoints.REVOKE_ADMIN_INVITE_API(inviteId), null, authConfig);
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
                <span>Admin Queue</span>
              </div>
              <h1 className="heading-hero text-[var(--text-primary)]">Verification & <span className="text-gradient">Access</span></h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
                Inspect applicant details, review uploaded verification document images, and approve membership.
              </p>
            </div>

            {activeTab === "registrations" ? (
              <label className="flex h-11 min-w-0 items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 md:w-80">
                <FaSearch className="text-[var(--text-muted)] shrink-0" size={13} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, email, city"
                  className="min-w-0 flex-1 bg-transparent text-xs sm:text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] border-none shadow-none focus:ring-0"
                />
              </label>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: "registrations", label: `Member Registrations (${users.length})` },
              { key: "invites", label: "Admin Invites" },
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


        {/* Content */}
        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : activeTab === "registrations" && filteredUsers.length === 0 ? (
          <EmptyState />
        ) : activeTab === "registrations" ? (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.01]">
            <div className="hidden grid-cols-[1.4fr_1fr_1fr_1.3fr] gap-4 border-b border-white/10 bg-white/[0.03] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 md:grid">
              <span>Applicant</span>
              <span>Community Info</span>
              <span>Verification Document</span>
              <span>Review Action</span>
            </div>

            <div className="divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="grid gap-4 bg-black/40 px-4 py-5 transition hover:bg-white/[0.02] md:grid-cols-[1.4fr_1fr_1fr_1.3fr] md:px-5"
                >
                  {/* Column 1: Applicant Profile */}
                  <div className="flex min-w-0 items-start gap-3">
                    <img
                      src={
                        user.imageUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName || "User"}`
                      }
                      alt={`${user.firstName || "Member"} profile`}
                      className="h-12 w-12 shrink-0 rounded-xl border border-white/10 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="truncate text-xs text-gray-400">{user.email}</p>
                      {user.additionalDetails?.contactNumber && (
                        <p className="text-[11px] text-emerald-400/90">{user.additionalDetails.contactNumber}</p>
                      )}
                      <span
                        className={`mt-2 inline-flex rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          statusStyles[user.accountStatus] || "border-white/10 bg-white/[0.03] text-gray-300"
                        }`}
                      >
                        {user.accountStatus}
                      </span>
                    </div>
                  </div>

                  {/* Column 2: Community Details */}
                  <div className="space-y-1 text-xs text-gray-400">
                    <p>
                      <span className="font-bold text-gray-500">City:</span>{" "}
                      <span className="text-gray-200">{user.additionalDetails?.currentCity || "Not set"}</span>
                    </p>
                    <p>
                      <span className="font-bold text-gray-500">Native:</span>{" "}
                      <span className="text-gray-200">{user.additionalDetails?.nativePlace || "Not set"}</span>
                    </p>
                    <p>
                      <span className="font-bold text-gray-500">Profession:</span>{" "}
                      <span className="text-gray-200">{user.additionalDetails?.profession || "Not set"}</span>
                    </p>
                    <p>
                      <span className="font-bold text-gray-500">Gotra:</span>{" "}
                      <span className="text-gray-200">{user.additionalDetails?.gotra || "Not set"}</span>
                    </p>
                  </div>

                  {/* Column 3: Verification Document Button */}
                  <div className="flex flex-col justify-center">
                    <button
                      type="button"
                      onClick={() => openDocumentModal(user)}
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-emerald-300 transition-all hover:bg-emerald-500/20 hover:text-emerald-200"
                    >
                      <FaEye size={13} /> View Document
                    </button>
                    <p className="mt-1.5 text-[10px] text-gray-500">
                      Private & Encrypted Asset
                    </p>
                  </div>

                  {/* Column 4: Review Actions */}
                  <div className="flex flex-col gap-2.5">
                    <input
                      value={reasonByUser[user._id] || ""}
                      onChange={(event) =>
                        setReasonByUser((current) => ({ ...current, [user._id]: event.target.value }))
                      }
                      placeholder="Reason or reviewer note..."
                      className="h-9 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/50"
                    />
                    <div className="grid grid-cols-3 gap-1.5">
                      <ActionButton
                        icon={FaCheck}
                        tone="success"
                        disabled={activeUserId === user._id}
                        onClick={() => reviewUser(user._id, "APPROVE")}
                      >
                        Approve
                      </ActionButton>
                      <ActionButton
                        icon={FaRedo}
                        tone="warning"
                        disabled={activeUserId === user._id}
                        onClick={() => reviewUser(user._id, "REQUEST_CORRECTION")}
                      >
                        Fix
                      </ActionButton>
                      <ActionButton
                        icon={FaTimes}
                        tone="danger"
                        disabled={activeUserId === user._id}
                        onClick={() => reviewUser(user._id, "REJECT")}
                      >
                        Reject
                      </ActionButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Admin Invites Tab */
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <form onSubmit={createInvite} className="ka-card p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
                <FaShieldAlt className="text-[var(--accent-primary)]" size={18} />
                <h2 className="text-base font-bold text-[var(--text-primary)]">Invite New Administrator</h2>
              </div>

              <label className="grid gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Administrator Email</span>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="admin@samajportal.org"
                  className="ka-input"
                  required
                />
              </label>

              <div className="grid gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  Select Administrative Permissions
                </span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {adminRoleOptions
                    .filter((opt) => !opt.superAdminOnly || user?.roles?.includes("SUPER_ADMIN"))
                    .map((opt) => {
                      const selected = inviteForm.roles.includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          onClick={() => toggleInviteRole(opt.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-2.5 ${
                            selected
                              ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)] shadow-sm"
                              : "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            readOnly
                            className="mt-0.5 h-3.5 w-3.5 accent-[var(--accent-primary)] rounded cursor-pointer"
                          />
                          <div className="overflow-hidden">
                            <p className={`text-xs font-bold ${selected ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
                              {opt.label}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 mt-0.5 leading-tight">
                              {opt.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <ActionButton icon={FaPaperPlane} tone="success" disabled={activeUserId === "invite"}>
                {activeUserId === "invite" ? "Generating Invite..." : "Send Admin Invitation Link"}
              </ActionButton>
            </form>

            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Issued Administrator Invitations ({invites.length})
              </h2>
              {invites.map((invite) => (
                <article key={invite._id} className="ka-card p-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[var(--text-primary)]">{invite.email}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {invite.roles?.map((r, i) => (
                          <span
                            key={i}
                            className="inline-flex rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--accent-primary)]"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                        Invited by {invite.invitedBy?.firstName || "Admin"} • Expires {new Date(invite.expiresAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        statusStyles[invite.status] || "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-muted)]"
                      }`}
                    >
                      {invite.status}
                    </span>
                  </div>

                  {invite.status === "PENDING" ? (
                    <div className="mt-3 border-t border-[var(--border-subtle)] pt-3 flex justify-end">
                      <ActionButton
                        icon={FaTimes}
                        tone="danger"
                        disabled={activeUserId === invite._id}
                        onClick={() => revokeInvite(invite._id)}
                      >
                        Revoke Invitation
                      </ActionButton>
                    </div>
                  ) : null}
                </article>
              ))}
              {invites.length === 0 && <EmptyState />}
            </section>
          </div>
        )}
      </div>

      {/* DOCUMENT INSPECTION MODAL */}
      {selectedUserForDoc && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-white/10 bg-[#0a0f0d] p-6 shadow-2xl sm:p-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                  <FiShield size={12} /> Confidential Document Review
                </div>
                <h2 className="mt-2 text-xl font-black text-white">
                  {selectedUserForDoc.firstName} {selectedUserForDoc.lastName}'s Document
                </h2>
                <p className="text-xs text-gray-400">
                  {selectedUserForDoc.email} · {selectedUserForDoc.additionalDetails?.currentCity || "City not set"}
                </p>
              </div>
              <button
                onClick={() => setSelectedUserForDoc(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-5">
              {docLoading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-400 border-t-transparent" />
                  <p className="text-xs text-gray-400">Generating short-lived secure document link...</p>
                </div>
              ) : docError || !docData?.signedUrl ? (
                <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 p-6 text-center">
                  <FiAlertTriangle size={32} className="mx-auto mb-2 text-red-400" />
                  <p className="text-sm font-bold text-red-300">{docError || "Verification document not found."}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Applicant may need to resubmit their application with an uploaded identity document.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Document Meta */}
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3 text-xs">
                    <span className="font-semibold text-gray-300">
                      📄 {docData.documentMeta?.name || "Uploaded Document"}
                    </span>
                    <a
                      href={docData.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      <FaExternalLinkAlt size={10} /> Open Full Size
                    </a>
                  </div>

                  {/* Document Image Display */}
                  <div className="relative flex max-h-[50vh] items-center justify-center overflow-hidden rounded-2xl border border-emerald-500/30 bg-black p-2 shadow-inner">
                    <img
                      src={docData.signedUrl}
                      alt="Verification Document"
                      className="max-h-[46vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
                    />
                  </div>
                </div>
              )}

              {/* Reviewer Note Input inside modal */}
              <div className="mt-5 border-t border-white/10 pt-4">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Reviewer Decision Note (Optional)
                </label>
                <input
                  value={reasonByUser[selectedUserForDoc._id] || ""}
                  onChange={(event) =>
                    setReasonByUser((current) => ({
                      ...current,
                      [selectedUserForDoc._id]: event.target.value,
                    }))
                  }
                  placeholder="Note to applicant / approval remark..."
                  className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-xs text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/50"
                />
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <button
                onClick={() => setSelectedUserForDoc(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  disabled={activeUserId === selectedUserForDoc._id}
                  onClick={() => reviewUser(selectedUserForDoc._id, "REJECT")}
                  className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  disabled={activeUserId === selectedUserForDoc._id}
                  onClick={() => reviewUser(selectedUserForDoc._id, "REQUEST_CORRECTION")}
                  className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-50"
                >
                  Request Correction
                </button>
                <button
                  disabled={activeUserId === selectedUserForDoc._id}
                  onClick={() => reviewUser(selectedUserForDoc._id, "APPROVE")}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50"
                >
                  Approve Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegistrationQueue;
