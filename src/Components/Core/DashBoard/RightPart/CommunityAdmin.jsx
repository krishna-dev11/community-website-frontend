import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArchive,
  FaAward,
  FaCalendarCheck,
  FaCheck,
  FaCalendarTimes,
  FaClipboardList,
  FaExclamationCircle,
  FaFlag,
  FaHeart,
  FaPaperPlane,
  FaPoll,
  FaSyncAlt,
  FaTimes,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { communityEndpoints } from "../../../../services/apis";

const tabs = [
  { key: "issues", label: "Issues", icon: FaExclamationCircle },
  { key: "bookings", label: "Bookings", icon: FaCalendarCheck },
  { key: "blocks", label: "Blocks", icon: FaCalendarTimes },
  { key: "polls", label: "Polls", icon: FaPoll },
  { key: "reports", label: "Reports", icon: FaFlag },
  { key: "achievements", label: "Pride", icon: FaAward },
  { key: "shradhanjali", label: "Tribute", icon: FaHeart },
];

const inputClass =
  "h-11 border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/40";
const textareaClass =
  "min-h-24 resize-none border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/40";

const Button = ({ children, icon: Icon, tone = "neutral", className = "", ...props }) => {
  const tones = {
    neutral: "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20",
    warning: "border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20",
    danger: "border-red-400/30 bg-red-400/10 text-red-200 hover:bg-red-400/20",
  };

  return (
    <button
      {...props}
      className={`inline-flex h-11 items-center justify-center gap-2 border px-4 text-[11px] font-bold uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      {Icon && <Icon size={12} />}
      {children}
    </button>
  );
};

const Field = ({ label, children }) => (
  <label className="flex min-w-0 flex-col gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
    {children}
  </label>
);

const Status = ({ value }) => (
  <span className="inline-flex w-fit border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-300">
    {value || "UNKNOWN"}
  </span>
);

const Empty = ({ text }) => (
  <div className="border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-gray-500">{text}</div>
);

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const CommunityAdmin = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [activeTab, setActiveTab] = useState("issues");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [issues, setIssues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [polls, setPolls] = useState([]);
  const [reports, setReports] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [shradhanjalis, setShradhanjalis] = useState([]);
  const [issueDrafts, setIssueDrafts] = useState({});
  const [bookingDrafts, setBookingDrafts] = useState({});
  const [blockDrafts, setBlockDrafts] = useState({});
  const [reportDrafts, setReportDrafts] = useState({});
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [pollForm, setPollForm] = useState({ title: "", description: "", options: "Yes\nNo", endsAt: "", status: "DRAFT" });
  const [blockForm, setBlockForm] = useState({ startDate: "", endDate: "", reason: "" });

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  const userRoles = user?.roles || [];
  const isPlatformAdmin = userRoles.some((role) => ["SUPER_ADMIN", "Admin"].includes(role)) || user?.accountType === "Admin";
  const canModerateCommunity = isPlatformAdmin || userRoles.includes("MODERATOR");
  const canReviewStories = canModerateCommunity;
  const canManageBookings = isPlatformAdmin || userRoles.includes("DHARAMSHALA_ADMIN");
  const canManagePolls = isPlatformAdmin;

  const visibleTabs = useMemo(() => tabs.filter((tab) => {
    if (tab.key === "issues" || tab.key === "reports") return canModerateCommunity;
    if (tab.key === "achievements" || tab.key === "shradhanjali") return canReviewStories;
    if (tab.key === "bookings" || tab.key === "blocks") return canManageBookings;
    if (tab.key === "polls") return canManagePolls;
    return false;
  }), [canModerateCommunity, canManageBookings, canManagePolls, canReviewStories]);

  const loadIssues = async () => {
    const response = await apiConnector("GET", communityEndpoints.ISSUES_API, null, authConfig, { limit: 30 });
    setIssues(response.data?.data?.issues || []);
  };

  const loadBookings = async () => {
    const response = await apiConnector("GET", communityEndpoints.DHARAMSHALA_BOOKINGS_API, null, authConfig, { limit: 30 });
    setBookings(response.data?.data?.bookings || []);
  };

  const loadBlockedDates = async () => {
    const response = await apiConnector("GET", communityEndpoints.DHARAMSHALA_BLOCKED_DATES_API, null, authConfig, { limit: 30 });
    setBlockedDates(response.data?.data?.blockedDates || []);
  };

  const loadPolls = async () => {
    const response = await apiConnector("GET", communityEndpoints.POLLS_API, null, authConfig, {
      admin: "true",
      limit: 30,
    });
    setPolls(response.data?.data?.polls || []);
  };

  const loadReports = async () => {
    const response = await apiConnector("GET", communityEndpoints.COMMUNITY_REPORTS_API, null, authConfig, { limit: 30 });
    setReports(response.data?.data?.reports || []);
  };

  const loadAchievements = async () => {
    const response = await apiConnector("GET", communityEndpoints.ADMIN_ACHIEVEMENTS_API, null, authConfig, { limit: 30 });
    setAchievements(response.data?.data?.achievements || []);
  };

  const loadShradhanjalis = async () => {
    const response = await apiConnector("GET", communityEndpoints.ADMIN_SHRADHANJALIS_API, null, authConfig, { limit: 30 });
    setShradhanjalis(response.data?.data?.shradhanjalis || []);
  };

  const loaders = useMemo(
    () => ({
      issues: loadIssues,
      bookings: loadBookings,
      blocks: loadBlockedDates,
      polls: loadPolls,
      reports: loadReports,
      achievements: loadAchievements,
      shradhanjali: loadShradhanjalis,
    }),
    [authConfig]
  );

  const refreshActive = async () => {
    setLoading(true);
    try {
      await loaders[activeTab]();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some((tab) => tab.key === activeTab)) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [visibleTabs, activeTab]);

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.key === activeTab)) return;
    refreshActive();
  }, [activeTab]);

  const updateIssueStatus = async (issueId, status) => {
    const draft = issueDrafts[issueId] || {};
    setBusyId(issueId);
    try {
      await apiConnector(
        "PATCH",
        communityEndpoints.UPDATE_ISSUE_STATUS_API(issueId),
        { status, note: draft.note || undefined, reason: draft.reason || undefined },
        authConfig
      );
      toast.success("Issue updated");
      await loadIssues();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update issue");
    } finally {
      setBusyId(null);
    }
  };

  const reviewBooking = async (bookingId, action) => {
    const draft = bookingDrafts[bookingId] || {};
    setBusyId(bookingId);
    try {
      await apiConnector(
        "PATCH",
        communityEndpoints.REVIEW_DHARAMSHALA_BOOKING_API(bookingId),
        { action, reviewMessage: draft.reviewMessage || undefined },
        authConfig
      );
      toast.success("Booking reviewed");
      await loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to review booking");
    } finally {
      setBusyId(null);
    }
  };

  const cancelBooking = async (bookingId) => {
    const draft = bookingDrafts[bookingId] || {};
    setBusyId(bookingId);
    try {
      await apiConnector(
        "PATCH",
        communityEndpoints.CANCEL_DHARAMSHALA_BOOKING_API(bookingId),
        { reason: draft.reviewMessage || "Cancelled from dashboard" },
        authConfig
      );
      toast.success("Booking cancelled");
      await loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to cancel booking");
    } finally {
      setBusyId(null);
    }
  };

  const createBlockedDate = async (event) => {
    event.preventDefault();
    setBusyId("block-create");
    try {
      await apiConnector("POST", communityEndpoints.DHARAMSHALA_BLOCKED_DATES_API, blockForm, authConfig);
      toast.success("Dates blocked");
      setBlockForm({ startDate: "", endDate: "", reason: "" });
      await loadBlockedDates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to block dates");
    } finally {
      setBusyId(null);
    }
  };

  const archiveBlockedDate = async (blockId) => {
    const draft = blockDrafts[blockId] || {};
    setBusyId(blockId);
    try {
      await apiConnector(
        "PATCH",
        communityEndpoints.ARCHIVE_DHARAMSHALA_BLOCKED_DATE_API(blockId),
        { reason: draft.reason || "Archived from dashboard" },
        authConfig
      );
      toast.success("Blocked dates archived");
      await loadBlockedDates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to archive blocked dates");
    } finally {
      setBusyId(null);
    }
  };

  const createPoll = async (event) => {
    event.preventDefault();
    const options = pollForm.options
      .split("\n")
      .map((option) => option.trim())
      .filter(Boolean);
    if (options.length < 2) {
      toast.error("Add at least two options");
      return;
    }

    setBusyId("poll-create");
    try {
      await apiConnector(
        "POST",
        communityEndpoints.POLLS_API,
        { ...pollForm, options },
        authConfig
      );
      toast.success("Poll created");
      setPollForm({ title: "", description: "", options: "Yes\nNo", endsAt: "", status: "DRAFT" });
      await loadPolls();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create poll");
    } finally {
      setBusyId(null);
    }
  };

  const updatePollStatus = async (pollId, status) => {
    setBusyId(pollId);
    try {
      await apiConnector("PATCH", communityEndpoints.UPDATE_POLL_STATUS_API(pollId), { status }, authConfig);
      toast.success("Poll status updated");
      await loadPolls();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update poll");
    } finally {
      setBusyId(null);
    }
  };

  const reviewReport = async (reportId, status) => {
    const draft = reportDrafts[reportId] || {};
    setBusyId(reportId);
    try {
      await apiConnector(
        "PATCH",
        communityEndpoints.REVIEW_COMMUNITY_REPORT_API(reportId),
        {
          status,
          resolution: draft.resolution || undefined,
          targetStatus: draft.targetStatus || undefined,
        },
        authConfig
      );
      toast.success("Report reviewed");
      await loadReports();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to review report");
    } finally {
      setBusyId(null);
    }
  };

  const reviewStory = async (type, itemId, status) => {
    const draft = reviewDrafts[itemId] || {};
    setBusyId(itemId);
    try {
      const endpoint = type === "achievement"
        ? communityEndpoints.REVIEW_ACHIEVEMENT_API(itemId)
        : communityEndpoints.REVIEW_SHRADHANJALI_API(itemId);
      await apiConnector("PATCH", endpoint, { status, reason: draft.reason || undefined }, authConfig);
      toast.success("Review updated");
      if (type === "achievement") await loadAchievements();
      else await loadShradhanjalis();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update review");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black px-3 py-8 text-white md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">Operations</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Community Admin</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                Review member requests, resolve issues, manage dharamshala bookings, run polls, and handle reports.
              </p>
            </div>
            <Button icon={FaSyncAlt} onClick={refreshActive} disabled={loading}>
              Refresh
            </Button>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-7">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex h-11 items-center justify-center gap-2 border px-3 text-[11px] font-bold uppercase tracking-widest transition ${
                    selected
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                      : "border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {visibleTabs.length === 0 ? (
          <Empty text="No community admin permissions are assigned to this account." />
        ) : loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {activeTab === "issues" && (
              <section className="grid gap-4">
                {issues.map((issue) => (
                  <article key={issue._id} className="border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-white">{issue.title}</h2>
                        <p className="mt-1 text-sm text-gray-500">{issue.description}</p>
                        <p className="mt-2 text-xs text-gray-600">
                          {issue.category || "General"} - {issue.priority} - {formatDate(issue.createdAt)}
                        </p>
                      </div>
                      <Status value={issue.status} />
                    </div>
                    <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 lg:grid-cols-[1fr_1fr_auto]">
                      <input
                        className={inputClass}
                        value={issueDrafts[issue._id]?.note || ""}
                        onChange={(event) =>
                          setIssueDrafts((current) => ({
                            ...current,
                            [issue._id]: { ...current[issue._id], note: event.target.value },
                          }))
                        }
                        placeholder="Status note"
                      />
                      <input
                        className={inputClass}
                        value={issueDrafts[issue._id]?.reason || ""}
                        onChange={(event) =>
                          setIssueDrafts((current) => ({
                            ...current,
                            [issue._id]: { ...current[issue._id], reason: event.target.value },
                          }))
                        }
                        placeholder="Reason, if rejecting or archiving"
                      />
                      <div className="grid gap-2 sm:grid-cols-4 lg:w-[520px]">
                        <Button onClick={() => updateIssueStatus(issue._id, "UNDER_REVIEW")} disabled={busyId === issue._id}>
                          Review
                        </Button>
                        <Button tone="warning" onClick={() => updateIssueStatus(issue._id, "IN_PROGRESS")} disabled={busyId === issue._id}>
                          Progress
                        </Button>
                        <Button tone="success" onClick={() => updateIssueStatus(issue._id, "RESOLVED")} disabled={busyId === issue._id}>
                          Resolve
                        </Button>
                        <Button tone="danger" onClick={() => updateIssueStatus(issue._id, "REJECTED")} disabled={busyId === issue._id}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
                {issues.length === 0 && <Empty text="No issues found." />}
              </section>
            )}

            {activeTab === "bookings" && (
              <section className="grid gap-4">
                {bookings.map((booking) => (
                  <article key={booking._id} className="border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-white">{booking.purpose}</h2>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatDate(booking.startDate)} to {formatDate(booking.endDate)} - {booking.roomsRequested || 1} room(s)
                        </p>
                        <p className="mt-2 text-xs text-gray-600">
                          Requested by {booking.requester?.firstName || booking.guestName || "Member"}
                        </p>
                      </div>
                      <Status value={booking.status} />
                    </div>
                    <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 lg:grid-cols-[1fr_auto_auto_auto]">
                      <input
                        className={inputClass}
                        value={bookingDrafts[booking._id]?.reviewMessage || ""}
                        onChange={(event) =>
                          setBookingDrafts((current) => ({
                            ...current,
                            [booking._id]: { reviewMessage: event.target.value },
                          }))
                        }
                        placeholder="Review message"
                      />
                      <Button icon={FaCheck} tone="success" onClick={() => reviewBooking(booking._id, "APPROVE")} disabled={booking.status !== "PENDING" || busyId === booking._id}>
                        Approve
                      </Button>
                      <Button icon={FaTimes} tone="danger" onClick={() => reviewBooking(booking._id, "REJECT")} disabled={booking.status !== "PENDING" || busyId === booking._id}>
                        Reject
                      </Button>
                      <Button tone="warning" onClick={() => cancelBooking(booking._id)} disabled={["CANCELLED", "ARCHIVED", "COMPLETED"].includes(booking.status) || busyId === booking._id}>
                        Cancel
                      </Button>
                    </div>
                  </article>
                ))}
                {bookings.length === 0 && <Empty text="No dharamshala booking requests found." />}
              </section>
            )}

            {activeTab === "blocks" && (
              <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={createBlockedDate} className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex items-center gap-2">
                    <FaCalendarTimes className="text-emerald-300" size={14} />
                    <h2 className="text-lg font-bold text-white">Block Dharamshala Dates</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Start Date">
                      <input
                        type="date"
                        className={inputClass}
                        value={blockForm.startDate}
                        onChange={(event) => setBlockForm((current) => ({ ...current, startDate: event.target.value }))}
                        required
                      />
                    </Field>
                    <Field label="End Date">
                      <input
                        type="date"
                        className={inputClass}
                        value={blockForm.endDate}
                        onChange={(event) => setBlockForm((current) => ({ ...current, endDate: event.target.value }))}
                        required
                      />
                    </Field>
                  </div>
                  <Field label="Reason">
                    <textarea
                      className={textareaClass}
                      value={blockForm.reason}
                      onChange={(event) => setBlockForm((current) => ({ ...current, reason: event.target.value }))}
                      required
                    />
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "block-create"}>
                    Block Dates
                  </Button>
                </form>

                <section className="grid gap-4">
                  {blockedDates.map((block) => (
                    <article key={block._id} className="border border-white/10 bg-white/[0.02] p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-white">{formatDate(block.startDate)} to {formatDate(block.endDate)}</h2>
                          <p className="mt-1 text-sm text-gray-500">{block.reason}</p>
                          <p className="mt-2 text-xs text-gray-600">
                            Created by {block.createdBy?.firstName || "Admin"} {block.createdBy?.lastName || ""}
                          </p>
                        </div>
                        <Status value={block.status} />
                      </div>
                      <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-[1fr_auto]">
                        <input
                          className={inputClass}
                          value={blockDrafts[block._id]?.reason || ""}
                          onChange={(event) =>
                            setBlockDrafts((current) => ({
                              ...current,
                              [block._id]: { reason: event.target.value },
                            }))
                          }
                          placeholder="Archive reason"
                        />
                        <Button
                          icon={FaArchive}
                          tone="danger"
                          onClick={() => archiveBlockedDate(block._id)}
                          disabled={block.status !== "ACTIVE" || busyId === block._id}
                        >
                          Archive
                        </Button>
                      </div>
                    </article>
                  ))}
                  {blockedDates.length === 0 && <Empty text="No active blocked dates found." />}
                </section>
              </div>
            )}

            {activeTab === "polls" && (
              <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={createPoll} className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex items-center gap-2">
                    <FaClipboardList className="text-emerald-300" size={14} />
                    <h2 className="text-lg font-bold text-white">Create Poll</h2>
                  </div>
                  <Field label="Title">
                    <input className={inputClass} value={pollForm.title} onChange={(event) => setPollForm((current) => ({ ...current, title: event.target.value }))} required />
                  </Field>
                  <Field label="Description">
                    <textarea className={textareaClass} value={pollForm.description} onChange={(event) => setPollForm((current) => ({ ...current, description: event.target.value }))} />
                  </Field>
                  <Field label="Options">
                    <textarea className={textareaClass} value={pollForm.options} onChange={(event) => setPollForm((current) => ({ ...current, options: event.target.value }))} required />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Ends At">
                      <input type="datetime-local" className={inputClass} value={pollForm.endsAt} onChange={(event) => setPollForm((current) => ({ ...current, endsAt: event.target.value }))} required />
                    </Field>
                    <Field label="Initial Status">
                      <select className={inputClass} value={pollForm.status} onChange={(event) => setPollForm((current) => ({ ...current, status: event.target.value }))}>
                        <option value="DRAFT">Draft</option>
                        <option value="ACTIVE">Active</option>
                      </select>
                    </Field>
                  </div>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "poll-create"}>
                    Create Poll
                  </Button>
                </form>

                <section className="grid gap-4">
                  {polls.map((poll) => (
                    <article key={poll._id} className="border border-white/10 bg-white/[0.02] p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h2 className="font-bold text-white">{poll.title}</h2>
                          <p className="mt-1 text-sm text-gray-500">{poll.description}</p>
                          <p className="mt-2 text-xs text-gray-600">{poll.totalVotes || 0} votes - ends {formatDate(poll.endsAt)}</p>
                        </div>
                        <Status value={poll.status} />
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        <Button tone="success" onClick={() => updatePollStatus(poll._id, "ACTIVE")} disabled={busyId === poll._id || poll.status === "ACTIVE"}>
                          Activate
                        </Button>
                        <Button tone="warning" onClick={() => updatePollStatus(poll._id, "CLOSED")} disabled={busyId === poll._id || poll.status === "CLOSED"}>
                          Close
                        </Button>
                        <Button tone="danger" onClick={() => updatePollStatus(poll._id, "ARCHIVED")} disabled={busyId === poll._id || poll.status === "ARCHIVED"}>
                          Archive
                        </Button>
                      </div>
                    </article>
                  ))}
                  {polls.length === 0 && <Empty text="No polls found." />}
                </section>
              </div>
            )}

            {activeTab === "reports" && (
              <section className="grid gap-4">
                {reports.map((report) => (
                  <article key={report._id} className="border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-white">{report.targetType} Report</h2>
                        <p className="mt-1 text-sm text-gray-500">{report.reason}</p>
                        <p className="mt-2 text-xs text-gray-600">
                          {report.post?.title || report.comment?.body || "Target unavailable"} - by {report.reportedBy?.firstName || "Member"}
                        </p>
                      </div>
                      <Status value={report.status} />
                    </div>
                    <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 lg:grid-cols-[1fr_220px_auto_auto]">
                      <input
                        className={inputClass}
                        value={reportDrafts[report._id]?.resolution || ""}
                        onChange={(event) =>
                          setReportDrafts((current) => ({
                            ...current,
                            [report._id]: { ...current[report._id], resolution: event.target.value },
                          }))
                        }
                        placeholder="Resolution note"
                      />
                      <select
                        className={inputClass}
                        value={reportDrafts[report._id]?.targetStatus || ""}
                        onChange={(event) =>
                          setReportDrafts((current) => ({
                            ...current,
                            [report._id]: { ...current[report._id], targetStatus: event.target.value },
                          }))
                        }
                      >
                        <option value="">Leave target unchanged</option>
                        <option value="PUBLISHED">Publish</option>
                        <option value="HIDDEN">Hide</option>
                        <option value="ARCHIVED">Archive</option>
                      </select>
                      <Button tone="success" onClick={() => reviewReport(report._id, "RESOLVED")} disabled={busyId === report._id}>
                        Resolve
                      </Button>
                      <Button onClick={() => reviewReport(report._id, "DISMISSED")} disabled={busyId === report._id}>
                        Dismiss
                      </Button>
                    </div>
                  </article>
                ))}
                {reports.length === 0 && <Empty text="No community reports found." />}
              </section>
            )}

            {activeTab === "achievements" && (
              <section className="grid gap-4">
                {achievements.map((achievement) => (
                  <article key={achievement._id} className="border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex min-w-0 gap-3">
                        {achievement.image?.url ? <img src={achievement.image.url} alt={achievement.title} className="h-16 w-20 object-cover" /> : null}
                        <div className="min-w-0">
                          <h2 className="text-lg font-bold text-white">{achievement.title}</h2>
                          <p className="mt-1 text-sm text-gray-500">{achievement.achieverName} - {achievement.category || "General"}</p>
                          <p className="mt-2 line-clamp-2 text-xs text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                      <Status value={achievement.status} />
                    </div>
                    <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 lg:grid-cols-[1fr_auto_auto_auto]">
                      <input
                        className={inputClass}
                        value={reviewDrafts[achievement._id]?.reason || ""}
                        onChange={(event) =>
                          setReviewDrafts((current) => ({
                            ...current,
                            [achievement._id]: { reason: event.target.value },
                          }))
                        }
                        placeholder="Review reason"
                      />
                      <Button tone="success" onClick={() => reviewStory("achievement", achievement._id, "PUBLISHED")} disabled={busyId === achievement._id}>
                        Publish
                      </Button>
                      <Button tone="warning" onClick={() => reviewStory("achievement", achievement._id, "REJECTED")} disabled={busyId === achievement._id}>
                        Reject
                      </Button>
                      <Button tone="danger" onClick={() => reviewStory("achievement", achievement._id, "ARCHIVED")} disabled={busyId === achievement._id}>
                        Archive
                      </Button>
                    </div>
                  </article>
                ))}
                {achievements.length === 0 && <Empty text="No achievement submissions found." />}
              </section>
            )}

            {activeTab === "shradhanjali" && (
              <section className="grid gap-4">
                {shradhanjalis.map((item) => (
                  <article key={item._id} className="border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex min-w-0 gap-3">
                        {item.photo?.url ? <img src={item.photo.url} alt={item.personName} className="h-16 w-20 object-cover" /> : null}
                        <div className="min-w-0">
                          <h2 className="text-lg font-bold text-white">{item.personName}</h2>
                          <p className="mt-1 text-sm text-gray-500">Passed on {formatDate(item.dateOfPassing)}</p>
                          <p className="mt-2 line-clamp-2 text-xs text-gray-600">{item.message}</p>
                        </div>
                      </div>
                      <Status value={item.status} />
                    </div>
                    <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 lg:grid-cols-[1fr_auto_auto_auto]">
                      <input
                        className={inputClass}
                        value={reviewDrafts[item._id]?.reason || ""}
                        onChange={(event) =>
                          setReviewDrafts((current) => ({
                            ...current,
                            [item._id]: { reason: event.target.value },
                          }))
                        }
                        placeholder="Review reason"
                      />
                      <Button tone="success" onClick={() => reviewStory("shradhanjali", item._id, "PUBLISHED")} disabled={busyId === item._id}>
                        Publish
                      </Button>
                      <Button tone="warning" onClick={() => reviewStory("shradhanjali", item._id, "REJECTED")} disabled={busyId === item._id}>
                        Reject
                      </Button>
                      <Button tone="danger" onClick={() => reviewStory("shradhanjali", item._id, "ARCHIVED")} disabled={busyId === item._id}>
                        Archive
                      </Button>
                    </div>
                  </article>
                ))}
                {shradhanjalis.length === 0 && <Empty text="No shradhanjali submissions found." />}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommunityAdmin;
