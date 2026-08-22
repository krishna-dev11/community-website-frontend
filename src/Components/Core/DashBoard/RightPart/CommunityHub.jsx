import React, { useEffect, useMemo, useState } from "react";
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
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { communityEndpoints } from "../../../../services/apis";

const tabs = [
  { key: "card", label: "Card", icon: FaIdCard },
  { key: "issues", label: "Issues", icon: FaExclamationCircle },
  { key: "bookings", label: "Bookings", icon: FaCalendarCheck },
  { key: "polls", label: "Polls", icon: FaPoll },
  { key: "posts", label: "Posts", icon: FaComments },
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

const Empty = ({ text }) => (
  <div className="border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-gray-500">{text}</div>
);

const Status = ({ value }) => (
  <span className="inline-flex w-fit border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-300">
    {value}
  </span>
);

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const CommunityHub = () => {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("card");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [card, setCard] = useState(null);
  const [issues, setIssues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [polls, setPolls] = useState([]);
  const [posts, setPosts] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [shradhanjalis, setShradhanjalis] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [issueForm, setIssueForm] = useState({ title: "", description: "", category: "", location: "", priority: "MEDIUM" });
  const [bookingForm, setBookingForm] = useState({ startDate: "", endDate: "", purpose: "", roomsRequested: 1 });
  const [availability, setAvailability] = useState(null);
  const [postForm, setPostForm] = useState({ title: "", body: "", category: "" });
  const [achievementForm, setAchievementForm] = useState({ title: "", achieverName: "", category: "", description: "", imageUrl: "" });
  const [shradhanjaliForm, setShradhanjaliForm] = useState({ personName: "", message: "", dateOfBirth: "", dateOfPassing: "", photoUrl: "" });

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  const loadCard = async () => {
    const response = await apiConnector("GET", communityEndpoints.MEMBERSHIP_CARD_API, null, authConfig);
    setCard(response.data?.data?.card || null);
  };

  const loadIssues = async () => {
    const response = await apiConnector("GET", communityEndpoints.ISSUES_API, null, authConfig, { mine: "true", limit: 20 });
    setIssues(response.data?.data?.issues || []);
  };

  const loadBookings = async () => {
    const response = await apiConnector("GET", communityEndpoints.MY_DHARAMSHALA_BOOKINGS_API, null, authConfig, { limit: 20 });
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

  const loaders = useMemo(
    () => ({
      card: loadCard,
      issues: loadIssues,
      bookings: loadBookings,
      polls: loadPolls,
      posts: loadPosts,
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
      toast.error("Select start and end dates");
      return;
    }
    setBusyId("availability");
    try {
      const response = await apiConnector("GET", communityEndpoints.DHARAMSHALA_AVAILABILITY_API, null, authConfig, {
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate,
      });
      setAvailability(response.data?.data || null);
      toast.success(response.data?.data?.available ? "Dates are available" : "Dates have conflicts");
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
      toast.success("Booking request submitted");
      setBookingForm({ startDate: "", endDate: "", purpose: "", roomsRequested: 1 });
      setAvailability(null);
      await loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to request booking");
    } finally {
      setBusyId(null);
    }
  };

  const castVote = async (pollId, optionId) => {
    setBusyId(`${pollId}-${optionId}`);
    try {
      await apiConnector("POST", communityEndpoints.CAST_VOTE_API(pollId), { optionId }, authConfig);
      toast.success("Vote recorded");
      await loadPolls();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to vote");
    } finally {
      setBusyId(null);
    }
  };

  const submitPost = async (event) => {
    event.preventDefault();
    setBusyId("post");
    try {
      await apiConnector("POST", communityEndpoints.POSTS_API, postForm, authConfig);
      toast.success("Post published");
      setPostForm({ title: "", body: "", category: "" });
      await loadPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create post");
    } finally {
      setBusyId(null);
    }
  };

  const loadComments = async (postId) => {
    setBusyId(`comments-${postId}`);
    try {
      const response = await apiConnector("GET", communityEndpoints.POST_COMMENTS_API(postId), null, authConfig, { limit: 30 });
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

  const submitAchievement = async (event) => {
    event.preventDefault();
    setBusyId("achievement");
    try {
      await apiConnector(
        "POST",
        communityEndpoints.ACHIEVEMENTS_API,
        {
          title: achievementForm.title,
          achieverName: achievementForm.achieverName,
          category: achievementForm.category,
          description: achievementForm.description,
          image: achievementForm.imageUrl.trim() ? { url: achievementForm.imageUrl.trim(), name: `${achievementForm.title} image` } : undefined,
        },
        authConfig
      );
      toast.success("Achievement submitted for review");
      setAchievementForm({ title: "", achieverName: "", category: "", description: "", imageUrl: "" });
      await loadAchievements();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit achievement");
    } finally {
      setBusyId(null);
    }
  };

  const submitShradhanjali = async (event) => {
    event.preventDefault();
    setBusyId("shradhanjali");
    try {
      await apiConnector(
        "POST",
        communityEndpoints.SHRADHANJALIS_API,
        {
          personName: shradhanjaliForm.personName,
          message: shradhanjaliForm.message,
          dateOfBirth: shradhanjaliForm.dateOfBirth || undefined,
          dateOfPassing: shradhanjaliForm.dateOfPassing,
          photo: shradhanjaliForm.photoUrl.trim() ? { url: shradhanjaliForm.photoUrl.trim(), name: `${shradhanjaliForm.personName} photo` } : undefined,
        },
        authConfig
      );
      toast.success("Shradhanjali submitted for review");
      setShradhanjaliForm({ personName: "", message: "", dateOfBirth: "", dateOfPassing: "", photoUrl: "" });
      await loadShradhanjalis();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit shradhanjali");
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
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">Community</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Community Hub</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                Handle member services, issues, bookings, polls, and discussion from one workspace.
              </p>
            </div>
            <Button icon={FaSyncAlt} onClick={refreshActive} disabled={loading}>
              Refresh
            </Button>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-7">
            {tabs.map((tab) => {
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

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {activeTab === "card" && (
              <section className="border border-white/10 bg-white/[0.02] p-5">
                {card ? (
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <img src={card.photo} alt={`${card.name} membership`} className="h-20 w-20 rounded-full border border-white/10 object-cover" />
                      <div>
                        <h2 className="text-2xl font-bold text-white">{card.name}</h2>
                        <p className="mt-1 text-sm text-gray-500">Member ID: {card.memberId}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Status value={card.status} />
                          <Status value={card.family?.familyName || "No family"} />
                        </div>
                      </div>
                    </div>
                    <div className="border border-white/10 bg-black p-4 text-sm text-gray-400 md:w-80">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Verification URL</p>
                      <p className="mt-2 break-all text-emerald-200">{card.verifyUrl}</p>
                      <p className="mt-3 text-xs text-gray-500">Issued on {formatDate(card.issuedAt)}</p>
                    </div>
                  </div>
                ) : (
                  <Empty text="Membership card is available after your account becomes active." />
                )}
              </section>
            )}

            {activeTab === "issues" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submitIssue} className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Submit Issue</h2>
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
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Location">
                    <input className={inputClass} value={issueForm.location} onChange={(event) => updateIssue("location", event.target.value)} />
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "issue"}>
                    Submit
                  </Button>
                </form>

                <section className="border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">My Issues</h2>
                  <div className="mt-4 divide-y divide-white/10">
                    {issues.map((issue) => (
                      <article key={issue._id} className="py-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="font-bold text-white">{issue.title}</h3>
                            <p className="mt-1 text-sm text-gray-500">{issue.description}</p>
                          </div>
                          <Status value={issue.status} />
                        </div>
                        <p className="mt-2 text-xs text-gray-600">{issue.category || "General"} - {formatDate(issue.createdAt)}</p>
                      </article>
                    ))}
                    {issues.length === 0 && <Empty text="No issues submitted yet." />}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submitBooking} className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Request Dharamshala</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Start Date">
                      <input type="date" className={inputClass} value={bookingForm.startDate} onChange={(event) => updateBooking("startDate", event.target.value)} required />
                    </Field>
                    <Field label="End Date">
                      <input type="date" className={inputClass} value={bookingForm.endDate} onChange={(event) => updateBooking("endDate", event.target.value)} required />
                    </Field>
                  </div>
                  <Field label="Purpose">
                    <input className={inputClass} value={bookingForm.purpose} onChange={(event) => updateBooking("purpose", event.target.value)} required />
                  </Field>
                  <Field label="Rooms Requested">
                    <input type="number" min="1" className={inputClass} value={bookingForm.roomsRequested} onChange={(event) => updateBooking("roomsRequested", Number(event.target.value))} />
                  </Field>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Button type="button" icon={FaCheck} onClick={checkAvailability} disabled={busyId === "availability"}>
                      Check
                    </Button>
                    <Button icon={FaPaperPlane} tone="success" disabled={busyId === "booking"}>
                      Request
                    </Button>
                  </div>
                  {availability && (
                    <p className={`border px-3 py-2 text-sm ${availability.available ? "border-emerald-400/30 text-emerald-200" : "border-amber-400/30 text-amber-200"}`}>
                      {availability.available ? "Selected dates are available." : "Selected dates currently have conflicts."}
                    </p>
                  )}
                </form>

                <section className="border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">My Bookings</h2>
                  <div className="mt-4 divide-y divide-white/10">
                    {bookings.map((booking) => (
                      <article key={booking._id} className="py-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="font-bold text-white">{booking.purpose}</h3>
                            <p className="mt-1 text-sm text-gray-500">{formatDate(booking.startDate)} to {formatDate(booking.endDate)}</p>
                          </div>
                          <Status value={booking.status} />
                        </div>
                        <p className="mt-2 text-xs text-gray-600">{booking.roomsRequested || 1} room(s)</p>
                      </article>
                    ))}
                    {bookings.length === 0 && <Empty text="No dharamshala booking requests yet." />}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "polls" && (
              <section className="grid gap-4">
                {polls.map((poll) => (
                  <article key={poll._id} className="border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex flex-col gap-2 border-b border-white/10 pb-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-white">{poll.title}</h2>
                        <p className="mt-1 text-sm text-gray-500">{poll.description}</p>
                      </div>
                      <Status value={`${poll.status} - Ends ${formatDate(poll.endsAt)}`} />
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {poll.options?.map((option) => {
                        const percentage = poll.totalVotes > 0 ? Math.round((option.voteCount / poll.totalVotes) * 100) : 0;
                        return (
                          <button
                            key={option._id}
                            onClick={() => castVote(poll._id, option._id)}
                            disabled={poll.status !== "ACTIVE" || busyId === `${poll._id}-${option._id}`}
                            className="border border-white/10 bg-black p-4 text-left transition hover:border-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-bold text-white">{option.label}</span>
                              <span className="text-xs text-gray-500">{option.voteCount} votes</span>
                            </div>
                            <div className="mt-3 h-2 bg-white/10">
                              <div className="h-full bg-emerald-400" style={{ width: `${percentage}%` }} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </article>
                ))}
                {polls.length === 0 && <Empty text="No active or closed polls yet." />}
              </section>
            )}

            {activeTab === "posts" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submitPost} className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Create Post</h2>
                  <Field label="Title">
                    <input className={inputClass} value={postForm.title} onChange={(event) => updatePost("title", event.target.value)} required />
                  </Field>
                  <Field label="Category">
                    <input className={inputClass} value={postForm.category} onChange={(event) => updatePost("category", event.target.value)} />
                  </Field>
                  <Field label="Body">
                    <textarea className={textareaClass} value={postForm.body} onChange={(event) => updatePost("body", event.target.value)} required />
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "post"}>
                    Publish
                  </Button>
                </form>

                <section className="grid gap-4">
                  {posts.map((post) => (
                    <article key={post._id} className="border border-white/10 bg-white/[0.02] p-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h2 className="font-bold text-white">{post.title}</h2>
                          <p className="mt-1 text-sm text-gray-500">{post.body}</p>
                        </div>
                        <Status value={post.category || "General"} />
                      </div>
                      <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
                        <div className="flex gap-2">
                          <input
                            className={`${inputClass} flex-1`}
                            value={commentDrafts[post._id] || ""}
                            onChange={(event) => setCommentDrafts((current) => ({ ...current, [post._id]: event.target.value }))}
                            placeholder="Write a comment"
                          />
                          <Button type="button" icon={FaPaperPlane} onClick={() => addComment(post._id)} disabled={busyId === `comment-${post._id}`}>
                            Send
                          </Button>
                        </div>
                        <Button type="button" onClick={() => loadComments(post._id)} disabled={busyId === `comments-${post._id}`} className="w-fit">
                          {commentsByPost[post._id] ? "Reload Comments" : `Show ${post.commentCount || 0} Comments`}
                        </Button>
                        {commentsByPost[post._id]?.map((comment) => (
                          <div key={comment._id} className="border border-white/10 bg-black px-3 py-2 text-sm text-gray-300">
                            {comment.body}
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                  {posts.length === 0 && <Empty text="No community posts yet." />}
                </section>
              </div>
            )}

            {activeTab === "achievements" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submitAchievement} className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Submit Achievement</h2>
                  <Field label="Title">
                    <input className={inputClass} value={achievementForm.title} onChange={(event) => updateAchievement("title", event.target.value)} required />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Achiever Name">
                      <input className={inputClass} value={achievementForm.achieverName} onChange={(event) => updateAchievement("achieverName", event.target.value)} required />
                    </Field>
                    <Field label="Category">
                      <input className={inputClass} value={achievementForm.category} onChange={(event) => updateAchievement("category", event.target.value)} placeholder="Education, business, sports" />
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea className={textareaClass} value={achievementForm.description} onChange={(event) => updateAchievement("description", event.target.value)} required />
                  </Field>
                  <Field label="Image URL">
                    <input className={inputClass} value={achievementForm.imageUrl} onChange={(event) => updateAchievement("imageUrl", event.target.value)} />
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "achievement"}>
                    Submit
                  </Button>
                </form>

                <section className="border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Recent Achievements</h2>
                  <div className="mt-4 divide-y divide-white/10">
                    {achievements.map((achievement) => (
                      <article key={achievement._id} className="py-4">
                        <div className="flex gap-3">
                          {achievement.image?.url ? <img src={achievement.image.url} alt={achievement.title} className="h-16 w-20 object-cover" /> : null}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div>
                                <h3 className="font-bold text-white">{achievement.title}</h3>
                                <p className="mt-1 text-sm text-gray-500">{achievement.achieverName} - {achievement.category || "General"}</p>
                              </div>
                              <Status value={achievement.status} />
                            </div>
                            <p className="mt-2 line-clamp-2 text-xs text-gray-600">{achievement.description}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                    {achievements.length === 0 && <Empty text="No achievement submissions yet." />}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "shradhanjali" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submitShradhanjali} className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Submit Shradhanjali</h2>
                  <Field label="Person Name">
                    <input className={inputClass} value={shradhanjaliForm.personName} onChange={(event) => updateShradhanjali("personName", event.target.value)} required />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Date Of Birth">
                      <input type="date" className={inputClass} value={shradhanjaliForm.dateOfBirth} onChange={(event) => updateShradhanjali("dateOfBirth", event.target.value)} />
                    </Field>
                    <Field label="Date Of Passing">
                      <input type="date" className={inputClass} value={shradhanjaliForm.dateOfPassing} onChange={(event) => updateShradhanjali("dateOfPassing", event.target.value)} required />
                    </Field>
                  </div>
                  <Field label="Message">
                    <textarea className={textareaClass} value={shradhanjaliForm.message} onChange={(event) => updateShradhanjali("message", event.target.value)} required />
                  </Field>
                  <Field label="Photo URL">
                    <input className={inputClass} value={shradhanjaliForm.photoUrl} onChange={(event) => updateShradhanjali("photoUrl", event.target.value)} />
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "shradhanjali"}>
                    Submit
                  </Button>
                </form>

                <section className="border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Recent Tributes</h2>
                  <div className="mt-4 divide-y divide-white/10">
                    {shradhanjalis.map((item) => (
                      <article key={item._id} className="py-4">
                        <div className="flex gap-3">
                          {item.photo?.url ? <img src={item.photo.url} alt={item.personName} className="h-16 w-20 object-cover" /> : null}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div>
                                <h3 className="font-bold text-white">{item.personName}</h3>
                                <p className="mt-1 text-sm text-gray-500">Passed on {formatDate(item.dateOfPassing)}</p>
                              </div>
                              <Status value={item.status} />
                            </div>
                            <p className="mt-2 line-clamp-2 text-xs text-gray-600">{item.message}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                    {shradhanjalis.length === 0 && <Empty text="No shradhanjali submissions yet." />}
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
