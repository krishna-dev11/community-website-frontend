import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiInbox,
  FiRefreshCw,
} from "react-icons/fi";
import { apiConnector } from "../services/apiConnector";
import { notificationEndpoints } from "../services/apis";

const formatDateTime = (value) => {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const NotificationsPage = () => {
  const { token } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const params = { limit: 40 };
      if (status) params.status = status;
      const response = await apiConnector("GET", notificationEndpoints.NOTIFICATIONS_API, null, authConfig, params);
      setNotifications(response.data?.data?.notifications || []);
      setUnreadCount(response.data?.data?.unreadCount || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [status]);

  const markRead = async (notificationId) => {
    setBusyId(notificationId);
    try {
      await apiConnector("PATCH", notificationEndpoints.MARK_NOTIFICATION_READ_API(notificationId), null, authConfig);
      setNotifications((current) =>
        current.map((item) =>
          item._id === notificationId ? { ...item, status: "READ", readAt: new Date().toISOString() } : item
        )
      );
      setUnreadCount((current) => Math.max(current - 1, 0));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to mark notification read");
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    setBusyId("all");
    try {
      await apiConnector("PATCH", notificationEndpoints.MARK_ALL_NOTIFICATIONS_READ_API, null, authConfig);
      setNotifications((current) =>
        current.map((item) => ({ ...item, status: "READ", readAt: item.readAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to mark all read");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#071412] px-4 pb-16 pt-28 text-white sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="border-b border-white/10 pb-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
            <FiBell size={15} />
            Notification Center
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">
                Notifications
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                Track review updates, family actions, payments, applications, and committee messages in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadNotifications}
                disabled={loading}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-xs font-bold uppercase tracking-wider text-white/75 transition hover:bg-white/10 disabled:opacity-60"
              >
                <FiRefreshCw size={15} />
                Refresh
              </button>
              <button
                type="button"
                onClick={markAllRead}
                disabled={busyId === "all" || unreadCount === 0}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-400 px-4 text-xs font-black uppercase tracking-wider text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiCheckCircle size={15} />
                Mark All Read
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "All", value: "" },
              { label: "Unread", value: "UNREAD" },
              { label: "Read", value: "READ" },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setStatus(option.value)}
                className={`h-10 rounded-lg px-4 text-xs font-bold uppercase tracking-wider transition ${
                  status === option.value
                    ? "bg-white text-black"
                    : "border border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {unreadCount} unread
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-lg border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center">
            <FiInbox className="mx-auto text-white/30" size={34} />
            <p className="mt-4 text-sm text-white/55">No notifications found for this filter.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {notifications.map((notification) => {
              const unread = notification.status === "UNREAD";
              const content = (
                <article
                  className={`rounded-lg border p-4 transition ${
                    unread
                      ? "border-emerald-400/25 bg-emerald-500/[0.08]"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${unread ? "bg-emerald-400" : "bg-white/20"}`} />
                        <h2 className="text-lg font-bold leading-snug text-white">{notification.title}</h2>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/62">{notification.message}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/38">
                        <span className="inline-flex items-center gap-1.5">
                          <FiClock size={13} />
                          {formatDateTime(notification.createdAt)}
                        </span>
                        {notification.readAt ? <span>Read {formatDateTime(notification.readAt)}</span> : null}
                      </div>
                    </div>
                    {unread ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          markRead(notification._id);
                        }}
                        disabled={busyId === notification._id}
                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 text-xs font-bold uppercase tracking-wider text-emerald-100 transition hover:bg-emerald-400/20 disabled:opacity-60"
                      >
                        <FiCheck size={14} />
                        Read
                      </button>
                    ) : null}
                  </div>
                </article>
              );

              return notification.link ? (
                <Link key={notification._id} to={notification.link}>
                  {content}
                </Link>
              ) : (
                <div key={notification._id}>{content}</div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default NotificationsPage;
