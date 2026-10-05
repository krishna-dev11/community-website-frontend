import React, { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaSyncAlt,
  FaCrown,
  FaHome,
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";
import {
  FiUsers,
  FiUser,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiMapPin,
  FiPhone,
  FiMail,
  FiShield,
  FiBriefcase,
  FiCalendar,
  FiExternalLink,
  FiEye,
  FiCheck,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiConnector } from "../../../../services/apiConnector";
import { profileEndpoints } from "../../../../services/apis";

const DirectoryField = ({ label, value, icon: Icon }) => (
  <div className="min-w-0">
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
      {Icon && <Icon size={11} className="text-[var(--accent-primary)] shrink-0" />}
      <span className="truncate">{label}</span>
    </div>
    <p className="mt-0.5 truncate text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
      {value || <span className="text-[var(--text-muted)] italic font-normal text-xs">Not Provided</span>}
    </p>
  </div>
);

const MemberDirectory = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const { familyId: urlFamilyId } = useParams();

  const isAdmin =
    user?.accountType === "Admin" ||
    (user?.roles || []).some((role) =>
      ["SUPER_ADMIN", "Admin", "MODERATOR", "COMMUNITY_ADMIN"].includes(role)
    );

  // Active view: "FAMILIES" vs "UNLINKED" (for admins)
  const [activeTab, setActiveTab] = useState("FAMILIES");

  // Family directory data (Admin)
  const [families, setFamilies] = useState([]);
  const [familyMeta, setFamilyMeta] = useState({ page: 1, pages: 1, total: 0 });

  // Unlinked members data (Admin)
  const [unlinkedMembers, setUnlinkedMembers] = useState([]);
  const [unlinkedMeta, setUnlinkedMeta] = useState({ page: 1, pages: 1, total: 0 });

  // Normal members data (Non-Admin)
  const [normalMembers, setNormalMembers] = useState([]);
  const [normalMeta, setNormalMeta] = useState({ page: 1, pages: 1, total: 0 });

  // Selected Family Detail View state (Admin)
  const [selectedFamilyId, setSelectedFamilyId] = useState(urlFamilyId || null);
  const [familyDetail, setFamilyDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [loading, setLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState({
    q: "",
    city: "",
    gotra: "",
    status: "ALL",
    page: 1,
    limit: 12,
  });

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  // Fetch Family Directory List
  const fetchFamilies = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.q?.trim()) params.q = filters.q.trim();
      if (filters.city?.trim()) params.city = filters.city.trim();
      if (filters.gotra?.trim()) params.gotra = filters.gotra.trim();
      if (filters.status && filters.status !== "ALL") params.status = filters.status;

      const response = await apiConnector(
        "GET",
        profileEndpoints.FAMILY_DIRECTORY_API,
        null,
        authConfig,
        params
      );

      setFamilies(response.data?.data?.families || []);
      setFamilyMeta(response.data?.meta || { page: filters.page, pages: 1, total: 0 });
    } catch (error) {
      console.error("Error loading family directory:", error);
      toast.error(error.response?.data?.message || "Unable to load family directory");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filters, authConfig]);

  // Fetch Unlinked Members List
  const fetchUnlinkedMembers = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.q?.trim()) params.q = filters.q.trim();
      if (filters.city?.trim()) params.city = filters.city.trim();

      const response = await apiConnector(
        "GET",
        profileEndpoints.UNLINKED_DIRECTORY_API,
        null,
        authConfig,
        params
      );

      setUnlinkedMembers(response.data?.data?.members || []);
      setUnlinkedMeta(response.data?.meta || { page: filters.page, pages: 1, total: 0 });
    } catch (error) {
      console.error("Error loading unlinked members:", error);
      toast.error(error.response?.data?.message || "Unable to load unlinked members");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filters, authConfig]);

  // Fetch Family Detail Data
  const fetchFamilyDetail = useCallback(
    async (targetId) => {
      if (!targetId || !isAdmin) return;
      setLoadingDetail(true);
      try {
        const response = await apiConnector(
          "GET",
          profileEndpoints.FAMILY_DIRECTORY_DETAIL_API(targetId),
          null,
          authConfig
        );
        setFamilyDetail(response.data?.data || null);
      } catch (error) {
        console.error("Error loading family detail:", error);
        toast.error(error.response?.data?.message || "Unable to load family detail");
        setFamilyDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    },
    [isAdmin, authConfig]
  );

  // Fetch Normal Member Directory (Non-admin strictly public view)
  const fetchNormalMembers = useCallback(async () => {
    if (isAdmin) return;
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.q?.trim()) params.q = filters.q.trim();

      const response = await apiConnector(
        "GET",
        profileEndpoints.MEMBER_DIRECTORY_API,
        null,
        authConfig,
        params
      );

      setNormalMembers(response.data?.data?.members || []);
      setNormalMeta(response.data?.meta || { page: filters.page, pages: 1, total: 0 });
    } catch (error) {
      console.error("Error loading member directory:", error);
      toast.error(error.response?.data?.message || "Unable to load member directory");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filters, authConfig]);

  // Sync with URL parameter
  useEffect(() => {
    if (urlFamilyId) {
      setSelectedFamilyId(urlFamilyId);
      fetchFamilyDetail(urlFamilyId);
    } else {
      setSelectedFamilyId(null);
      setFamilyDetail(null);
    }
  }, [urlFamilyId, fetchFamilyDetail]);

  // Trigger main data load
  useEffect(() => {
    if (!selectedFamilyId) {
      if (isAdmin) {
        if (activeTab === "FAMILIES") {
          fetchFamilies();
        } else {
          fetchUnlinkedMembers();
        }
      } else {
        fetchNormalMembers();
      }
    }
  }, [isAdmin, activeTab, selectedFamilyId, filters.page, fetchFamilies, fetchUnlinkedMembers, fetchNormalMembers]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  };

  const submitSearch = (event) => {
    event.preventDefault();
    if (isAdmin) {
      if (activeTab === "FAMILIES") fetchFamilies();
      else fetchUnlinkedMembers();
    } else {
      fetchNormalMembers();
    }
  };

  const resetFilters = () => {
    setFilters({
      q: "",
      city: "",
      gotra: "",
      status: "ALL",
      page: 1,
      limit: 12,
    });
  };

  const handleOpenFamily = (family) => {
    const fId = family.familyCode || family._id;
    setSelectedFamilyId(fId);
    navigate(`/dashboard/directory/family/${fId}`);
    fetchFamilyDetail(fId);
  };

  const handleBackToDirectory = () => {
    setSelectedFamilyId(null);
    setFamilyDetail(null);
    navigate("/dashboard/directory");
  };

  const currentMeta = isAdmin
    ? activeTab === "FAMILIES"
      ? familyMeta
      : unlinkedMeta
    : normalMeta;

  const changePage = (nextPage) => {
    const targetPage = Math.min(Math.max(nextPage, 1), Math.max(currentMeta.pages || 1, 1));
    setFilters((current) => ({
      ...current,
      page: targetPage,
    }));
  };

  // ══════════════════════════════════════════════════════
  // RENDER: ADMIN FAMILY DETAIL VIEW
  // ══════════════════════════════════════════════════════
  if (isAdmin && selectedFamilyId) {
    return (
      <div className="min-h-screen bg-[var(--bg)] px-3 py-6 text-[var(--text-primary)] md:px-8 transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          {/* Back button */}
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <button
              type="button"
              onClick={handleBackToDirectory}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-2 text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all cursor-pointer shadow-sm"
            >
              <FiArrowLeft size={16} />
              <span>Back to Family Directory</span>
            </button>
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Family ID: <strong className="text-[var(--text-primary)] font-mono">{familyDetail?.family?.familyId || selectedFamilyId}</strong>
            </span>
          </div>

          {loadingDetail ? (
            <div className="space-y-6">
              <div className="h-44 animate-pulse rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)]" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-64 animate-pulse rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)]" />
                <div className="h-64 animate-pulse rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)]" />
              </div>
            </div>
          ) : !familyDetail ? (
            <div className="ka-card border-dashed px-6 py-16 text-center">
              <FaTimesCircle className="mx-auto text-rose-400" size={36} />
              <h2 className="mt-3 text-lg font-bold text-[var(--text-primary)]">Family Details Not Found</h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                The requested family record could not be loaded or may have been archived.
              </p>
              <button
                type="button"
                onClick={handleBackToDirectory}
                className="btn-primary mt-4 !h-10 !px-5 !text-xs inline-flex items-center gap-2"
              >
                <FiArrowLeft size={14} />
                <span>Return to Directory</span>
              </button>
            </div>
          ) : (
            <>
              {/* Family Header Banner */}
              <div className="ka-card p-6 border-l-4 border-l-[var(--accent-primary)] relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 text-xs font-bold uppercase tracking-wider">
                        <FaHome size={12} />
                        {familyDetail.family.familyId}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          familyDetail.family.verificationStatus === "VERIFIED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                            : familyDetail.family.verificationStatus === "ACTION_REQUIRED"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                        }`}
                      >
                        {familyDetail.family.verificationStatus || "UNDER_REVIEW"}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25 text-[11px] font-bold uppercase tracking-wider">
                        {familyDetail.family.lifecycleStatus || "ACTIVE"}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
                      {familyDetail.family.familyName}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1.5">
                        <FaCrown className="text-amber-400" size={13} />
                        Family Head: <strong className="text-[var(--text-primary)]">{familyDetail.family.familyHead?.name || "Not Designated"}</strong>
                      </span>
                      {familyDetail.family.currentCity && (
                        <span className="flex items-center gap-1">
                          <FiMapPin className="text-[var(--accent-primary)]" size={13} />
                          {familyDetail.family.currentCity}
                          {familyDetail.family.state ? `, ${familyDetail.family.state}` : ""}
                        </span>
                      )}
                      {familyDetail.family.gotra && (
                        <span>
                          Gotra: <strong className="text-[var(--text-primary)]">{familyDetail.family.gotra}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Verification Stats Summary Cards */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
                    <div className="flex min-h-[72px] min-w-[90px] flex-col justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Members</span>
                      <span className="mt-1 text-xl font-black text-[var(--text-primary)]">{familyDetail.stats?.total || 0}</span>
                    </div>
                    <div className="flex min-h-[72px] min-w-[90px] flex-col justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Verified</span>
                      <span className="mt-1 text-xl font-black text-emerald-400">{familyDetail.stats?.verified || 0}</span>
                    </div>
                    <div className="flex min-h-[72px] min-w-[90px] flex-col justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending</span>
                      <span className="mt-1 text-xl font-black text-amber-400">{familyDetail.stats?.pending || 0}</span>
                    </div>
                    {familyDetail.stats?.actionRequired > 0 && (
                      <div className="flex min-h-[72px] min-w-[90px] flex-col justify-center rounded-2xl border border-rose-500/25 bg-rose-500/10 p-3 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Action Req</span>
                        <span className="mt-1 text-xl font-black text-rose-400">{familyDetail.stats.actionRequired}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Family Administrative Information Section */}
              <div className="ka-card p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
                  <FiShield size={16} className="text-[var(--accent-primary)]" />
                  <h2 className="text-base font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                    Family Information & Administration
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <DirectoryField label="Family ID" value={familyDetail.family.familyId} />
                  <DirectoryField label="Current City" value={familyDetail.family.currentCity} icon={FiMapPin} />
                  <DirectoryField label="Native Place" value={familyDetail.family.nativePlace} />
                  <DirectoryField label="Gotra" value={familyDetail.family.gotra} />
                  <DirectoryField label="SSSM ID" value={familyDetail.family.sssmId} />
                  <DirectoryField
                    label="Registration Date"
                    value={familyDetail.family.createdAt ? new Date(familyDetail.family.createdAt).toLocaleDateString("en-IN") : "—"}
                    icon={FiCalendar}
                  />
                </div>

                {/* Contact and Head Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[var(--border-subtle)]">
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-3.5 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <FaCrown size={12} />
                      Current Family Head Contact
                    </p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{familyDetail.family.familyHead?.name || "None"}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
                      {familyDetail.family.familyHead?.contactNumber && (
                        <span className="flex items-center gap-1">
                          <FiPhone size={12} className="text-[var(--accent-primary)]" />
                          {familyDetail.family.familyHead.contactNumber}
                        </span>
                      )}
                      {familyDetail.family.familyHead?.email && (
                        <span className="flex items-center gap-1">
                          <FiMail size={12} className="text-[var(--accent-primary)]" />
                          {familyDetail.family.familyHead.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {familyDetail.family.successor && (
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-3.5 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                        Designated Successor / Nominee
                      </p>
                      <p className="text-sm font-bold text-[var(--text-primary)]">{familyDetail.family.successor.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] font-mono">{familyDetail.family.successor.memberId || "—"}</p>
                    </div>
                  )}
                </div>

                {/* Head Succession History if any */}
                {familyDetail.family.headHistory && familyDetail.family.headHistory.length > 0 && (
                  <div className="pt-3 border-t border-[var(--border-subtle)]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                      Head Succession & Leadership History
                    </p>
                    <div className="space-y-2">
                      {familyDetail.family.headHistory.map((hist, idx) => (
                        <div
                          key={idx}
                          className="flex flex-wrap items-center justify-between text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-2.5 text-[var(--text-secondary)]"
                        >
                          <span className="font-semibold text-[var(--text-primary)]">
                            {hist.headName} ({hist.headMemberId || "No ID"})
                          </span>
                          <span>
                            {hist.from ? new Date(hist.from).toLocaleDateString("en-IN") : "—"} to{" "}
                            {hist.to ? new Date(hist.to).toLocaleDateString("en-IN") : "Present"}
                          </span>
                          {hist.reason && <span className="text-[var(--text-muted)] italic">Reason: {hist.reason}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Family Members Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                      <FiUsers size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black tracking-tight text-[var(--text-primary)]">Family Members</h2>
                      <p className="text-xs text-[var(--text-muted)]">
                        Showing all {familyDetail.members?.length || 0} registered members in this family
                      </p>
                    </div>
                  </div>
                </div>

                {familyDetail.members?.length === 0 ? (
                  <div className="ka-card border-dashed px-6 py-12 text-center">
                    <p className="text-sm font-bold text-[var(--text-primary)]">Family has no currently linked members.</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">This record may require data verification.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {familyDetail.members.map((member) => {
                      const isHead = member.familyRole === "FAMILY_HEAD";
                      const isVerified = ["VERIFIED", "APPROVED"].includes(member.verificationStatus);
                      const isRejected = ["REJECTED", "REQUIRES_CORRECTION", "ACTION_REQUIRED"].includes(member.verificationStatus);

                      return (
                        <div
                          key={member._id}
                          className={`ka-card p-5 transition-all space-y-4 ${
                            isHead
                              ? "border-amber-500/40 shadow-md ring-1 ring-amber-500/20"
                              : "hover:border-[var(--border-strong)]"
                          }`}
                        >
                          {/* Top Member Identity */}
                          <div className="flex items-start gap-3.5 border-b border-[var(--border-subtle)] pb-4">
                            <img
                              src={
                                member.imageUrl ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name || "Member")}`
                              }
                              alt={`${member.name} photo`}
                              className="h-14 w-14 rounded-2xl border border-[var(--border-subtle)] object-cover shadow-sm shrink-0"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name || "Member")}`;
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {isHead && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                                    <FaCrown size={10} />
                                    Family Head
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[10px] font-mono font-bold text-[var(--accent-primary)]">
                                  {member.memberId || "SMJ-UNASSIGNED"}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isVerified
                                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                                      : isRejected
                                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/25"
                                      : "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                                  }`}
                                >
                                  {isVerified ? "✓ Verified" : isRejected ? "! Action Required" : "◷ Pending"}
                                </span>
                              </div>

                              <h3 className="mt-1 truncate text-base font-black text-[var(--text-primary)]">
                                {member.name}
                              </h3>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
                                <span>Relation: <strong className="text-[var(--text-primary)] font-semibold">{member.relationship || "MEMBER"}</strong></span>
                                {member.accountStatus && (
                                  <span className="text-[var(--text-muted)]">Status: {member.accountStatus}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Member Details Grid */}
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <DirectoryField label="Phone" value={member.profile?.contactNumber} icon={FiPhone} />
                            <DirectoryField label="Email" value={member.profile?.email} icon={FiMail} />
                            <DirectoryField label="Profession" value={member.profile?.profession} icon={FiBriefcase} />
                            <DirectoryField label="Education" value={member.profile?.education} />
                            <DirectoryField label="Gotra" value={member.profile?.gotra} />
                            <DirectoryField label="Native Place" value={member.profile?.nativePlace} />
                            <DirectoryField label="Current City" value={member.profile?.currentCity} icon={FiMapPin} />
                            <DirectoryField
                              label="Date of Birth"
                              value={member.profile?.dateOfBirth ? new Date(member.profile.dateOfBirth).toLocaleDateString("en-IN") : null}
                              icon={FiCalendar}
                            />
                          </div>

                          {/* Rejection / Correction notice if applicable */}
                          {isRejected && (member.rejectionReason || member.correctionRequired) && (
                            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs space-y-1">
                              <p className="font-bold text-rose-400 flex items-center gap-1.5">
                                <FiAlertTriangle size={13} />
                                Rejection / Action Required Reason
                              </p>
                              <p className="text-[var(--text-secondary)]">
                                {member.rejectionReason || member.correctionRequired}
                              </p>
                            </div>
                          )}

                          {/* System Admin Roles if any */}
                          {member.roles && member.roles.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--border-subtle)]">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mr-1">
                                System Roles:
                              </span>
                              {member.roles.map((r, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-md bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-secondary)]"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Documents Preview for Admin */}
                          {member.documents && member.documents.length > 0 && (
                            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                Verification Documents
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {member.documents.map((doc, docIdx) => (
                                  <div
                                    key={docIdx}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[11px] font-medium text-[var(--text-secondary)]"
                                  >
                                    <span>{doc.name || "ID Document"}</span>
                                    <span
                                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                        doc.status === "APPROVED"
                                          ? "bg-emerald-500/20 text-emerald-400"
                                          : "bg-amber-500/20 text-amber-400"
                                      }`}
                                    >
                                      {doc.status || "PENDING"}
                                    </span>
                                    {doc.url && (
                                      <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[var(--accent-primary)] hover:underline ml-1 inline-flex items-center gap-0.5"
                                        title="View Verification Document"
                                      >
                                        <FiEye size={12} />
                                        <span>View</span>
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // RENDER: DIRECTORY MAIN LIST (FAMILY / UNLINKED / MEMBER)
  // ══════════════════════════════════════════════════════
  const renderDirectoryContent = () => {
    if (loading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)]"
            />
          ))}
        </div>
      );
    }

    if (!isAdmin) {
      if (normalMembers.length === 0) {
        return (
          <div className="ka-card border-dashed px-6 py-12 text-center">
            <p className="text-sm font-bold text-[var(--text-primary)]">No members found</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Try searching with a different name.</p>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {normalMembers.map((member) => (
            <article
              key={member._id}
              className="ka-card p-6 flex flex-col items-center justify-center text-center transition-all border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/40 shadow-md"
            >
              <div className="relative mb-4">
                <img
                  src={
                    member.profilePhoto ||
                    member.imageUrl ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name || "Member")}`
                  }
                  alt={member.name}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-[var(--accent-primary)]/40 object-cover shadow-lg ring-4 ring-[var(--surface-elevated)]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name || "Member")}`;
                  }}
                />
              </div>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-[var(--text-primary)] max-w-full break-words">
                {member.name}
              </h2>
            </article>
          ))}
        </div>
      );
    }

    if (activeTab === "FAMILIES") {
      if (families.length === 0) {
        return (
          <div className="ka-card border-dashed px-6 py-16 text-center">
            <FaHome className="mx-auto text-[var(--text-muted)]" size={36} />
            <p className="mt-3 text-base font-bold text-[var(--text-primary)]">No families found</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Try searching with a different family name, family ID, head name, or clear the filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="btn-secondary mt-4 !h-9 !px-4 !text-xs"
            >
              Reset Filters
            </button>
          </div>
        );
      }
      return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {families.map((family) => {
            const isVerified = family.verificationStatus === "VERIFIED";
            const isActionRequired = family.verificationStatus === "ACTION_REQUIRED";

            return (
              <article
                key={family._id}
                className="ka-card p-5 transition-all hover:border-[var(--accent-primary)]/40 hover:shadow-xl flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-3.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded-md border border-[var(--accent-primary)]/20">
                          {family.familyId}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isVerified
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                              : isActionRequired
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/25"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                          }`}
                        >
                          {family.verificationStatus || "UNDER_REVIEW"}
                        </span>
                      </div>
                      <h2 className="mt-1.5 truncate text-lg font-black text-[var(--text-primary)] tracking-tight">
                        {family.familyName}
                      </h2>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-sm font-black text-[var(--text-primary)]">
                        {family.memberCount}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Members
                      </span>
                    </div>
                  </div>

                  {family.matchedMemberName && (
                    <div className="mt-2.5 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 px-2.5 py-1 text-[11px] font-semibold text-[var(--accent-primary)]">
                      🔍 Matched member: <strong>{family.matchedMemberName}</strong>
                    </div>
                  )}

                  <div className="mt-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-3 flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={
                          family.familyHead?.imageUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(family.familyHead?.name || "Head")}`
                        }
                        alt={`${family.familyHead?.name || "Head"} photo`}
                        className="h-10 w-10 rounded-xl border border-amber-500/30 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(family.familyHead?.name || "Head")}`;
                        }}
                      />
                      <div className="absolute -top-1.5 -right-1.5 rounded-full bg-amber-500 p-0.5 text-black">
                        <FaCrown size={9} />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">
                          👑 Family Head
                        </span>
                      </div>
                      <p className="truncate text-xs font-bold text-[var(--text-primary)]">
                        {family.familyHead?.name || "Not Designated"}
                      </p>
                      <p className="truncate text-[11px] text-[var(--text-muted)]">
                        {family.familyHead?.contactNumber || family.familyHead?.email || "No contact"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)] truncate">
                      <FiMapPin className="text-[var(--accent-primary)] shrink-0" size={13} />
                      <span className="truncate">{family.currentCity || family.nativePlace || "Location —"}</span>
                    </div>
                    <div className="text-[var(--text-secondary)] text-right truncate">
                      Gotra: <strong className="text-[var(--text-primary)]">{family.gotra || "—"}</strong>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-2.5">
                    <span className="text-emerald-400 flex items-center gap-1">
                      ✓ {family.stats?.verified || 0} Verified
                    </span>
                    {family.stats?.pending > 0 && (
                      <span className="text-amber-400 flex items-center gap-1">
                        ◷ {family.stats.pending} Pending
                      </span>
                    )}
                    {family.stats?.actionRequired > 0 && (
                      <span className="text-rose-400 flex items-center gap-1">
                        ! {family.stats.actionRequired} Action Req
                      </span>
                    )}
                  </div>

                  {family.memberPreview && family.memberPreview.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <div className="flex -space-x-2 overflow-hidden py-1">
                        {family.memberPreview.map((mem, idx) => (
                          <img
                            key={mem._id || idx}
                            src={
                              mem.imageUrl ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mem.name || "Member")}`
                            }
                            alt={mem.name}
                            title={`${mem.name} (${mem.role || "Member"})`}
                            className="inline-block h-7 w-7 rounded-full ring-2 ring-[var(--surface)] object-cover border border-[var(--border-subtle)]"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mem.name || "Member")}`;
                            }}
                          />
                        ))}
                      </div>
                      {family.memberCount > family.memberPreview.length && (
                        <span className="text-[10px] font-bold text-[var(--text-muted)] pl-1">
                          +{family.memberCount - family.memberPreview.length} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenFamily(family)}
                    className="btn-primary w-full !h-10 !text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <FiEye size={14} />
                    <span>View Family & Members</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      );
    }

    // Unlinked members
    if (unlinkedMembers.length === 0) {
      return (
        <div className="ka-card border-dashed px-6 py-16 text-center">
          <FaUsers className="mx-auto text-[var(--text-muted)]" size={36} />
          <p className="mt-3 text-base font-bold text-[var(--text-primary)]">No unlinked members found</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            All community members are currently attached to verified or draft families.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {unlinkedMembers.map((member) => (
          <article
            key={member._id}
            className="ka-card p-5 transition-all hover:border-[var(--border-strong)] space-y-4"
          >
            <div className="flex items-center gap-3.5 border-b border-[var(--border-subtle)] pb-3.5">
              <img
                src={
                  member.imageUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name || "Member")}`
                }
                alt={`${member.name} profile`}
                className="h-12 w-12 rounded-2xl border border-[var(--border-subtle)] object-cover shadow-sm shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name || "Member")}`;
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-[var(--accent-primary)] bg-[var(--surface-raised)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                    {member.memberId || "SMJ-UNASSIGNED"}
                  </span>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Individual
                  </span>
                </div>
                <h2 className="mt-1 truncate text-base font-bold text-[var(--text-primary)]">
                  {member.name}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <DirectoryField label="City" value={member.profile?.currentCity} icon={FiMapPin} />
              <DirectoryField label="Profession" value={member.profile?.profession} icon={FiBriefcase} />
              <DirectoryField label="Phone" value={member.profile?.contactNumber} icon={FiPhone} />
              <DirectoryField label="Email" value={member.profile?.email} icon={FiMail} />
              <DirectoryField label="Gotra" value={member.profile?.gotra} />
              <DirectoryField label="Native Place" value={member.profile?.nativePlace} />
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] px-3 py-6 text-[var(--text-primary)] md:px-8 transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header & Page Title */}
        <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="eyebrow-badge mb-2">
                <FiUsers size={13} />
                <span>{isAdmin ? "Admin Family-Wise Directory" : "Verified Samaj Directory"}</span>
              </div>
              <h1 className="heading-hero text-[var(--text-primary)]">
                {isAdmin ? (
                  <>
                    Family <span className="text-gradient">Directory</span>
                  </>
                ) : (
                  <>
                    Member <span className="text-gradient">Directory</span>
                  </>
                )}
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
                {isAdmin
                  ? "Family-Centric Samaj Management: Members grouped by family unit with administrative details, verification status, and head leadership."
                  : "Search Samaj community members by name."}
              </p>
            </div>

            {/* Admin Tab Switching between Families and Unlinked */}
            {isAdmin && (
              <div className="flex items-center gap-2 self-start md:self-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("FAMILIES");
                    setFilters((f) => ({ ...f, page: 1 }));
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "FAMILIES"
                      ? "bg-[var(--accent-primary)] text-black shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <FaHome size={13} />
                  <span>Families ({familyMeta.total || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("UNLINKED");
                    setFilters((f) => ({ ...f, page: 1 }));
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "UNLINKED"
                      ? "bg-[var(--accent-primary)] text-black shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <FiUser size={13} />
                  <span>Individual / Unlinked ({unlinkedMeta.total || 0})</span>
                </button>
              </div>
            )}
          </div>

          {/* Search & Filters Bar */}
          <form
            onSubmit={submitSearch}
            className={`grid gap-3 ${
              isAdmin
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto_auto]"
                : "sm:grid-cols-[1fr_auto]"
            }`}
          >
            {/* Search Input */}
            <label className="flex h-11 min-w-0 items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4">
              <FaSearch className="text-[var(--text-muted)] shrink-0" size={13} />
              <input
                value={filters.q}
                onChange={(event) => updateFilter("q", event.target.value)}
                placeholder={
                  isAdmin
                    ? "Search family, head, member name, ID, phone..."
                    : "Search member by name..."
                }
                className="min-w-0 flex-1 bg-transparent text-xs sm:text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] border-none shadow-none focus:ring-0"
              />
            </label>

            {isAdmin && (
              <>
                <input
                  value={filters.city}
                  onChange={(event) => updateFilter("city", event.target.value)}
                  placeholder="Filter City"
                  className="ka-input !h-11 !py-0 text-xs sm:text-sm"
                />

                {activeTab === "FAMILIES" && (
                  <>
                    <input
                      value={filters.gotra}
                      onChange={(event) => updateFilter("gotra", event.target.value)}
                      placeholder="Filter Gotra"
                      className="ka-input !h-11 !py-0 text-xs sm:text-sm"
                    />

                    <select
                      value={filters.status}
                      onChange={(event) => updateFilter("status", event.target.value)}
                      className="ka-input !h-11 !py-0 text-xs sm:text-sm cursor-pointer"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="ACTIVE">Active</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="ACTION_REQUIRED">Action Required</option>
                    </select>
                  </>
                )}
              </>
            )}

            <button type="submit" className="btn-primary !h-11 !py-0 !px-5 !text-xs">
              <FaSyncAlt size={12} />
              <span>Search</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn-secondary !h-11 !py-0 !px-4 !text-xs"
                title="Reset Filters"
              >
                <span>Reset</span>
              </button>
            )}
          </form>
        </div>

        {/* Content Section */}
        {renderDirectoryContent()}

        {/* Pagination Controls */}
        <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-4 text-xs font-medium text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
          <p>
            {currentMeta.total || 0}{" "}
            {isAdmin ? (activeTab === "FAMILIES" ? "families" : "unlinked members") : "members"} found
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changePage((currentMeta.page || filters.page) - 1)}
              disabled={(currentMeta.page || 1) <= 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <FaChevronLeft size={11} />
            </button>
            <span className="px-3 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Page {currentMeta.page || filters.page} of {Math.max(currentMeta.pages || 1, 1)}
            </span>
            <button
              type="button"
              onClick={() => changePage((currentMeta.page || filters.page) + 1)}
              disabled={(currentMeta.page || 1) >= Math.max(currentMeta.pages || 1, 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <FaChevronRight size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDirectory;
