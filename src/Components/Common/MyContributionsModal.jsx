import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { apiConnector } from "../../services/apiConnector";
import { paymentEndpoints } from "../../services/apis";
import {
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiShield,
  FiArrowRight,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import toast from "react-hot-toast";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const STATUS_BADGES = {
  PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  OVERDUE: "bg-red-500/10 text-red-400 border-red-500/30",
  WAIVED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  PARTIAL: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

const MyContributionsModal = ({ isOpen, onClose }) => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [contributions, setContributions] = useState([]);
  const [financialRecords, setFinancialRecords] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const authConfig = { Authorization: `Bearer ${token}` };
      const [res, historyRes] = await Promise.all([
        apiConnector("GET", paymentEndpoints.MY_CONTRIBUTIONS_API, null, authConfig),
        apiConnector("GET", paymentEndpoints.MY_FINANCIAL_HISTORY_API, null, authConfig),
      ]);
      if (res?.data?.success) setContributions(res.data.data.contributions || []);
      if (historyRes?.data?.success) {
        setFinancialRecords(historyRes.data.data.records || []);
        setFinancialSummary(historyRes.data.data.summary || null);
      }
    } catch (err) {
      console.error("Error fetching contributions:", err);
      toast.error(err?.response?.data?.message || "Failed to load contributions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchContributions();
    }
  }, [isOpen]);

  const handlePayDues = async (contribution) => {
    const dueAmount = Math.max(
      0,
      Number(contribution.expectedAmount || 0) - Number(contribution.paidAmount || 0)
    );
    if (dueAmount <= 0) {
      toast.error("No pending dues for this month.");
      return;
    }

    setPayingId(contribution._id);
    const toastId = toast.loading("Initializing payment gateway...");

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error("Razorpay SDK could not be loaded.");
      }

      const res = await apiConnector(
        "POST",
        paymentEndpoints.CREATE_CONTRIBUTION_ORDER_API(contribution._id),
        { amount: dueAmount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res?.data?.data;
      if (!data?.order || !data?.key) {
        throw new Error("Payment initialization failed.");
      }

      const checkout = new window.Razorpay({
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency || "INR",
        name: "Samaj Monthly Contribution",
        description: `Month: ${contribution.month}/${contribution.year}`,
        order_id: data.order.id,
        prefill: {
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.email,
          contact: user?.additionalDetails?.contactNumber || "",
        },
        theme: {
          color: "#10b981",
        },
        handler: () => {
          toast.success("Payment submitted. Your status will update shortly!");
          fetchContributions();
        },
        modal: {
          ondismiss: () => toast("Payment cancelled."),
        },
      });

      checkout.open();
    } catch (err) {
      console.error("Pay dues error:", err);
      toast.error(err?.response?.data?.message || err.message || "Payment initiation failed.");
    } finally {
      toast.dismiss(toastId);
      setPayingId(null);
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  const totalDues = contributions
    .filter((c) => ["PENDING", "OVERDUE", "PARTIAL"].includes(c.status))
    .reduce((acc, c) => acc + (Number(c.expectedAmount || 0) - Number(c.paidAmount || 0)), 0);

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[92dvh] flex flex-col rounded-2xl sm:rounded-3xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-4 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)] my-auto text-[var(--text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 sm:right-6 sm:top-6 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-md"
        >
          <FiX size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6 pr-12">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
            <FaRupeeSign size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Monthly Member Contributions
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-normal">Samaj community welfare monthly subscriptions & dues</p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mb-6 grid grid-cols-2 gap-4 bg-[var(--surface-raised)] border border-[var(--border-subtle)] p-4 sm:p-5 rounded-2xl">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Total Outstanding Dues
            </span>
            <p className="text-2xl sm:text-3xl font-bold text-[var(--accent-primary)] mt-1 font-heading">₹{totalDues}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Billing Cadence
            </span>
            <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] mt-1">Monthly on 1st</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Auto-generated</p>
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Total Contributed</p>
            <p className="mt-1 text-xl font-black text-[var(--accent-primary)]">₹{financialSummary?.totalContributed || 0}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Records</p>
            <p className="mt-1 text-xl font-black text-[var(--text-primary)]">{financialSummary?.contributionCount || 0}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Last Contribution</p>
            <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{financialSummary?.lastContribution ? new Date(financialSummary.lastContribution).toLocaleDateString("en-IN") : "Not available"}</p>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-9 h-9 border-3 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[var(--text-secondary)]">Loading contribution statements...</p>
            </div>
          ) : contributions.length === 0 && financialRecords.length === 0 ? (
            <div className="py-16 text-center text-[var(--text-secondary)] border border-dashed border-[var(--border-subtle)] rounded-2xl p-6">
              <p className="text-sm font-semibold text-[var(--text-primary)]">No contribution records found.</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Monthly statements are generated automatically on the 1st of every month.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {financialRecords.length > 0 && (
                <section>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Contribution History</h3>
                  <div className="space-y-3">
                    {financialRecords.map((record) => (
                      <div key={`${record.type}-${record._id}`} className="min-w-0 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2"><span className="font-bold text-[var(--text-primary)]">₹{record.amount || 0}</span><span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">{record.type}</span><span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">{record.status}</span></div>
                            <p className="mt-1 break-words text-xs text-[var(--text-secondary)]">{record.purpose}</p>
                            <p className="mt-1 text-[10px] text-[var(--text-muted)]">{record.date ? new Date(record.date).toLocaleDateString("en-IN") : "Date not available"} · {record.paymentMethod}</p>
                          </div>
                          {record.receiptNumber ? <span className="break-all text-[10px] text-[var(--text-muted)]">Receipt: {record.receiptNumber}</span> : <span className="text-[10px] text-[var(--text-muted)]">Receipt not available</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Monthly Dues</h3>
                <div className="space-y-3">
              {contributions.map((item) => {
                const due = Math.max(
                  0,
                  Number(item.expectedAmount || 0) - Number(item.paidAmount || 0)
                );
                const badgeClass = STATUS_BADGES[item.status] || "bg-[var(--surface-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]";

                return (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--text-primary)]">
                          Month {item.month} / {item.year}
                        </span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${badgeClass}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Expected: <strong className="text-[var(--text-primary)]">₹{item.expectedAmount}</strong>
                        {item.paidAmount > 0 && (
                          <span className="ml-2 text-[var(--accent-primary)] font-semibold">
                            (Paid: ₹{item.paidAmount})
                          </span>
                        )}
                      </p>
                      {item.dueDate && (
                        <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                          <FiClock size={11} /> Due Date: {new Date(item.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div>
                      {["PENDING", "OVERDUE", "PARTIAL"].includes(item.status) && due > 0 ? (
                        <button
                          onClick={() => handlePayDues(item)}
                          disabled={payingId === item._id}
                          className="btn-primary !py-2 !px-5 !text-xs w-full sm:w-auto"
                        >
                          <FaRupeeSign size={12} /> Pay ₹{due}
                        </button>
                      ) : item.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-primary)]">
                          <FiCheckCircle size={14} /> Dues Cleared
                        </span>
                      ) : item.status === "WAIVED" ? (
                        <span className="text-xs text-[var(--accent-blue)] font-semibold">Waived by Admin</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary !py-2.5 !px-6 !text-xs w-full sm:w-auto justify-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MyContributionsModal;
