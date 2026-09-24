import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiCreditCard,
  FiFileText,
  FiShield,
  FiRefreshCw,
  FiCalendar,
} from "react-icons/fi";
import { FaRupeeSign, FaReceipt } from "react-icons/fa";
import toast from "react-hot-toast";
import { apiConnector } from "../../../../services/apiConnector";
import { paymentEndpoints } from "../../../../services/apis";
import ReceiptModal from "../../../Common/ReceiptModal";

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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MyDues = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const fetchDuesData = async () => {
    try {
      setLoading(true);
      const authConfig = { Authorization: `Bearer ${token}` };
      const [summaryRes, contribRes] = await Promise.all([
        apiConnector("GET", paymentEndpoints.MY_CONTRIBUTIONS_SUMMARY_API, null, authConfig),
        apiConnector("GET", paymentEndpoints.MY_CONTRIBUTIONS_API, null, authConfig, { limit: 100 }),
      ]);

      if (summaryRes?.data?.success) {
        setSummary(summaryRes.data.data.summary);
      }
      if (contribRes?.data?.success) {
        setContributions(contribRes.data.data.contributions || []);
      }
    } catch (err) {
      console.error("Error fetching dues data:", err);
      toast.error(err?.response?.data?.message || "Failed to load dues information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDuesData();
    }
  }, [token]);

  // Payment Handler with server-side HMAC verification
  const handlePayNow = async (due) => {
    if (!due) return;
    const dueAmount = due.remainingAmount || (due.totalPayable - due.paidAmount) || due.expectedAmount;
    if (dueAmount <= 0) {
      toast.error("No pending dues for this month.");
      return;
    }

    setPayingId(due._id || due.id);
    const toastId = toast.loading("Initializing secure payment gateway...");

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error("Razorpay SDK could not be loaded. Please check your connection.");
      }

      const orderRes = await apiConnector(
        "POST",
        paymentEndpoints.CREATE_CONTRIBUTION_ORDER_API(due._id || due.id),
        { amount: dueAmount },
        { Authorization: `Bearer ${token}` }
      );

      const orderData = orderRes?.data?.data;
      if (!orderData?.order?.id || !orderData?.key) {
        throw new Error("Payment order creation failed on server.");
      }

      toast.dismiss(toastId);

      const checkout = new window.Razorpay({
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency || "INR",
        name: "श्री हल्बा / हल्बी समाज",
        description: `Monthly Contribution - ${due.monthName || due.month}/${due.year}`,
        order_id: orderData.order.id,
        prefill: {
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.email,
          contact: user?.additionalDetails?.contactNumber || "",
        },
        theme: {
          color: "#059669",
        },
        handler: async (response) => {
          const verifyToastId = toast.loading("Verifying payment with Samaj server...");
          try {
            const verifyRes = await apiConnector(
              "POST",
              paymentEndpoints.VERIFY_CONTRIBUTION_API(due._id || due.id),
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: dueAmount,
              },
              { Authorization: `Bearer ${token}` }
            );

            toast.dismiss(verifyToastId);
            if (verifyRes?.data?.success) {
              toast.success("Contribution recorded and verified successfully!");
              await fetchDuesData();
              // Open receipt automatically
              handleViewReceipt(due._id || due.id);
            } else {
              toast.error(verifyRes?.data?.message || "Verification failed");
            }
          } catch (vErr) {
            toast.dismiss(verifyToastId);
            console.error("Payment verification failed:", vErr);
            toast.error(vErr?.response?.data?.message || "Verification failed on server");
          } finally {
            setPayingId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setPayingId(null);
            toast("Payment window closed.");
          },
        },
      });

      checkout.open();
    } catch (err) {
      toast.dismiss(toastId);
      setPayingId(null);
      console.error("Payment error:", err);
      toast.error(err?.response?.data?.message || err.message || "Failed to start payment");
    }
  };

  const handleViewReceipt = async (contributionId) => {
    const loadingToast = toast.loading("Loading official receipt...");
    try {
      const res = await apiConnector(
        "GET",
        paymentEndpoints.CONTRIBUTION_RECEIPT_API(contributionId),
        null,
        { Authorization: `Bearer ${token}` }
      );
      toast.dismiss(loadingToast);
      if (res?.data?.success) {
        setSelectedReceipt(res.data.data.receipt);
        setIsReceiptModalOpen(true);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("Error loading receipt:", err);
      toast.error(err?.response?.data?.message || "Failed to load receipt");
    }
  };

  const currentDue = summary?.currentDue;

  return (
    <div className="relative min-h-screen w-full bg-[var(--bg)] text-[var(--text-primary)] p-3 sm:p-6 overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-6 sm:gap-8">
        {/* Navigation Breadcrumb & Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              <span>Home</span>
              <span className="text-[var(--accent-primary)]">/</span>
              <span>Dashboard</span>
              <span className="text-[var(--accent-primary)]">/</span>
              <span className="text-[var(--text-primary)]">My Dues</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-1 tracking-tight">
              Monthly Samaj <span className="text-gradient">Contributions</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Standard Samaj monthly contribution of ₹60 for community welfare, education, and development.
            </p>
          </div>

          <button
            onClick={fetchDuesData}
            disabled={loading}
            className="btn-secondary !py-2 !px-3.5 !text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh Dues"
          >
            <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* 1. TOP SUMMARY CARDS (Calculated from Backend Ledger) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="ka-card p-4 flex flex-col justify-between border-l-4 border-l-amber-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Current Due
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-500">
                ₹{currentDue ? currentDue.remainingAmount : 0}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] mt-1 truncate">
              {currentDue ? `${currentDue.monthName} ${currentDue.year}` : "All settled"}
            </span>
          </div>

          <div className="ka-card p-4 flex flex-col justify-between border-l-4 border-l-red-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Outstanding
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-red-400">
                ₹{summary?.totalOutstanding || 0}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] mt-1">
              {summary?.monthsPending || 0} month(s) pending
            </span>
          </div>

          <div className="ka-card p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Total Paid
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-400">
                ₹{summary?.totalPaid || 0}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] mt-1">
              {summary?.monthsPaid || 0} month(s) paid
            </span>
          </div>

          <div className="ka-card p-4 flex flex-col justify-between border-l-4 border-l-sky-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Paid Months
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-sky-400">
                {summary?.monthsPaid || 0}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] mt-1">
              Receipts available
            </span>
          </div>

          <div className="ka-card p-4 flex flex-col justify-between border-l-4 border-l-purple-500 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Pending Months
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-purple-400">
                {summary?.monthsPending || 0}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] mt-1">
              {summary?.monthsPending === 0 ? "Up to date" : "Action needed"}
            </span>
          </div>
        </div>

        {/* 2. CURRENT ACTIVE DUE HERO CARD */}
        {currentDue ? (
          <div className="ka-card p-5 sm:p-7 relative overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-[var(--surface)] to-[var(--surface-elevated)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-500/40 bg-amber-500/10 text-amber-400">
                    Current Due • {currentDue.status}
                  </span>
                  {currentDue.status === "OVERDUE" && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-500/40 bg-red-500/10 text-red-400">
                      Overdue (Late Fee Applied)
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                    {currentDue.monthName} {currentDue.year}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                    <FiCalendar size={13} />
                    <span>
                      Due Date:{" "}
                      {new Date(currentDue.dueDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                </div>

                {/* Amount breakdown */}
                <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <span>Monthly Contribution:</span>
                    <span className="font-bold text-[var(--text-primary)]">₹{currentDue.expectedAmount}</span>
                  </div>
                  {Boolean(currentDue.lateFee && currentDue.lateFee > 0) && (
                    <div className="flex items-center gap-1.5 text-red-400">
                      <span>Late Fee:</span>
                      <span className="font-bold">₹{currentDue.lateFee}</span>
                    </div>
                  )}
                  {Boolean(currentDue.paidAmount && currentDue.paidAmount > 0) && (
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <span>Already Paid:</span>
                      <span className="font-bold">₹{currentDue.paidAmount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action column */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--border-subtle)]">
                <div className="text-left md:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                    Total Payable Amount
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-amber-400">
                    ₹{currentDue.remainingAmount}
                  </span>
                </div>

                <button
                  onClick={() => handlePayNow(currentDue)}
                  disabled={payingId === currentDue.id}
                  className="btn-primary !py-3 !px-7 !text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <FaRupeeSign size={14} />
                  <span>{payingId === currentDue.id ? "Processing..." : "PAY NOW"}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="ka-card p-6 sm:p-8 text-center flex flex-col items-center justify-center border border-emerald-500/20 bg-emerald-500/5">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <FiCheckCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">You're All Caught Up!</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md">
              There are no pending monthly contributions due for your account. Thank you for your continued commitment to the Samaj.
            </p>
          </div>
        )}

        {/* 3. CONTRIBUTION HISTORY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaReceipt className="text-[var(--accent-primary)]" size={16} />
              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                Contribution History & Ledger
              </h3>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              {contributions.length} recorded cycle(s)
            </span>
          </div>

          {loading ? (
            <div className="ka-card p-8 text-center text-xs text-[var(--text-muted)]">
              <FiRefreshCw className="animate-spin mx-auto mb-2" size={20} />
              <span>Loading contribution history...</span>
            </div>
          ) : contributions.length === 0 ? (
            <div className="ka-card p-8 text-center text-xs text-[var(--text-muted)]">
              No historical contribution records found for your account.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto ka-card">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--surface-elevated)]">
                      <th className="py-3 px-4">Month / Cycle</th>
                      <th className="py-3 px-4">Base Due</th>
                      <th className="py-3 px-4">Late Fee</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Paid</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Payment Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action / Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {contributions.map((c) => {
                      const monthName = MONTH_NAMES[c.month - 1] || `Month ${c.month}`;
                      const isPaid = c.status === "PAID";
                      const isOverdue = c.status === "OVERDUE";
                      const total = (c.expectedAmount || 0) + (c.lateFee || 0);

                      return (
                        <tr key={c._id} className="hover:bg-[var(--surface-elevated)]/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                            {monthName} {c.year}
                          </td>
                          <td className="py-3 px-4 text-[var(--text-secondary)]">₹{c.expectedAmount}</td>
                          <td className="py-3 px-4 text-[var(--text-secondary)]">
                            {c.lateFee ? `₹${c.lateFee}` : "₹0"}
                          </td>
                          <td className="py-3 px-4 font-bold text-[var(--text-primary)]">₹{total}</td>
                          <td className="py-3 px-4 font-bold text-emerald-400">₹{c.paidAmount || 0}</td>
                          <td className="py-3 px-4 uppercase text-[11px] font-semibold text-[var(--text-secondary)]">
                            {c.paymentMethod && c.paymentMethod !== "NONE" ? c.paymentMethod : "—"}
                          </td>
                          <td className="py-3 px-4 text-[var(--text-muted)]">
                            {c.paidAt
                              ? new Date(c.paidAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                isPaid
                                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                  : isOverdue
                                  ? "border-red-500/40 bg-red-500/10 text-red-400"
                                  : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isPaid ? (
                              <button
                                onClick={() => handleViewReceipt(c._id)}
                                className="btn-secondary !py-1 !px-3 !text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <FiFileText size={12} />
                                <span>View Receipt</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePayNow(c)}
                                disabled={payingId === c._id}
                                className="btn-primary !py-1 !px-3 !text-[11px] inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <FaRupeeSign size={10} />
                                <span>{payingId === c._id ? "..." : "Pay Now"}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards View */}
              <div className="md:hidden space-y-3">
                {contributions.map((c) => {
                  const monthName = MONTH_NAMES[c.month - 1] || `Month ${c.month}`;
                  const isPaid = c.status === "PAID";
                  const isOverdue = c.status === "OVERDUE";
                  const total = (c.expectedAmount || 0) + (c.lateFee || 0);

                  return (
                    <div key={c._id} className="ka-card p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-[var(--text-primary)]">
                            {monthName} {c.year}
                          </h4>
                          <span className="text-[11px] text-[var(--text-muted)]">
                            Due: {new Date(c.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isPaid
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                              : isOverdue
                              ? "border-red-500/40 bg-red-500/10 text-red-400"
                              : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[var(--border-subtle)]">
                        <div>
                          <span className="text-[10px] uppercase text-[var(--text-muted)] block">Total Due</span>
                          <span className="font-bold text-[var(--text-primary)]">₹{total}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-[var(--text-muted)] block">Paid Amount</span>
                          <span className="font-bold text-emerald-400">₹{c.paidAmount || 0}</span>
                        </div>
                        {c.paymentMethod && c.paymentMethod !== "NONE" && (
                          <div>
                            <span className="text-[10px] uppercase text-[var(--text-muted)] block">Mode</span>
                            <span className="text-[var(--text-secondary)] uppercase">{c.paymentMethod}</span>
                          </div>
                        )}
                        {c.paidAt && (
                          <div>
                            <span className="text-[10px] uppercase text-[var(--text-muted)] block">Paid On</span>
                            <span className="text-[var(--text-secondary)]">
                              {new Date(c.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[var(--border-subtle)]">
                        {isPaid ? (
                          <button
                            onClick={() => handleViewReceipt(c._id)}
                            className="btn-secondary !py-1.5 !px-3 !text-xs w-full justify-center flex items-center gap-1.5"
                          >
                            <FiFileText size={13} />
                            <span>View Receipt</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePayNow(c)}
                            disabled={payingId === c._id}
                            className="btn-primary !py-2 !px-4 !text-xs w-full justify-center flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <FaRupeeSign size={12} />
                            <span>{payingId === c._id ? "Processing..." : `Pay ₹${total - (c.paidAmount || 0)}`}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Official Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
};

export default MyDues;
