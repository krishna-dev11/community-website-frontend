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
    <main className="min-h-screen bg-[var(--bg)] px-4 pb-16 pt-28 text-[var(--text-primary)] sm:px-6 lg:px-8 transition-colors duration-300">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="border-b border-[var(--border-subtle)] pb-6">
          <div className="eyebrow-badge mb-4">
            <FiBell size={14} />
            <span>Notification Center</span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="heading-hero text-[var(--text-primary)] mb-2">
                Notifications
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] font-normal">
                Track review updates, family actions, payments, applications, and committee messages in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadNotifications}
                disabled={loading}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-5 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] disabled:opacity-60"
              >
                <FiRefreshCw size={15} />
                Refresh
              </button>
              <button
                type="button"
                onClick={markAllRead}
                disabled={busyId === "all" || unreadCount === 0}
                className="btn-primary !h-11 !py-0 !px-5 text-xs"
              >
                <FiCheckCircle size={15} />
                Mark All Read
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3 md:grid-cols-[1fr_auto] md:items-center">
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
                className={`h-10 rounded-full px-5 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                  status === option.value
                    ? "bg-[var(--accent-primary)] text-[#070707] shadow-md"
                    : "border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-secondary)] font-medium">
            <span className="h-2 w-2 rounded-full bg-[var(--accent-primary)]" />
            {unreadCount} unread
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)]" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="ka-card px-6 py-12 text-center border-dashed">
            <FiInbox className="mx-auto text-[var(--text-muted)]" size={34} />
            <p className="mt-4 text-sm text-[var(--text-muted)]">No notifications found for this filter.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {notifications.map((notification) => {
              const unread = notification.status === "UNREAD";
              const content = (
                <article
                  className={`rounded-lg border p-4 transition ${
                    unread
                      ? "border-[var(--accent-primary)]/25 bg-[var(--accent-primary)]/8"
                      : "border-[var(--border-subtle)] bg-[var(--surface)] hover:bg-[var(--surface-raised)]"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${unread ? "bg-[var(--accent-primary)]" : "bg-[var(--border-strong)]"}`} />
                        <h2 className="text-lg font-bold leading-snug text-[var(--text-primary)]">{notification.title}</h2>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{notification.message}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
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
                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-4 text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] transition hover:bg-[var(--accent-primary)]/20 disabled:opacity-60"
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
