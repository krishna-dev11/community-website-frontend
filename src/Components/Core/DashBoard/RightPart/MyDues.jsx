import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
  FiChevronDown,
  FiChevronUp,
  FiArrowRight,
  FiUsers,
  FiInfo,
  FiAward,
} from "react-icons/fi";
import { FaRupeeSign, FaReceipt, FaHistory } from "react-icons/fa";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { apiConnector } from "../../../../services/apiConnector";
import { familyContributionEndpoints, paymentEndpoints } from "../../../../services/apis";
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

  // States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasFamily, setHasFamily] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [historyData, setHistoryData] = useState(null);

  // Pay-Until Quote & Checkout states
  const [selectedTarget, setSelectedTarget] = useState("");
  const [quote, setQuote] = useState(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [paying, setPaying] = useState(false);

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // UI Filters & Toggles
  const [timelineFilter, setTimelineFilter] = useState("ALL");
  const [showLegacyDues, setShowLegacyDues] = useState(false);
  const [legacySummary, setLegacySummary] = useState(null);
  const [legacyContributions, setLegacyContributions] = useState([]);
  const [loadingLegacy, setLoadingLegacy] = useState(false);

  // Month selector dropdown state & outside click
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const monthDropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(e.target)) {
        setIsMonthDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMonthDropdownOpen(false);
      }
    };
    if (isMonthDropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMonthDropdownOpen]);

  // Fetch Family Summary and History
  const fetchFamilyContributionData = useCallback(async (isRefresh = false) => {
    if (!token) return;
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const authHeaders = { Authorization: `Bearer ${token}` };

      const [summaryRes, historyRes] = await Promise.allSettled([
        apiConnector("GET", familyContributionEndpoints.MY_FAMILY_SUMMARY_API, null, authHeaders),
        apiConnector("GET", familyContributionEndpoints.MY_FAMILY_HISTORY_API, null, authHeaders),
      ]);

      if (summaryRes.status === "fulfilled" && summaryRes.value?.data?.success) {
        if (summaryRes.value.data.hasFamily === false) {
          setHasFamily(false);
          setSummaryData(null);
        } else {
          setHasFamily(true);
          const sData = summaryRes.value.data.data;
          setSummaryData(sData);

          // Auto-select immediate next due month or next 3 months by default
          if (sData?.account) {
            const nextY = sData.account.nextDueYear;
            const nextM = sData.account.nextDueMonth;
            setSelectedTarget(`${nextY}-${nextM}`);
          }
        }
      }

      if (historyRes.status === "fulfilled" && historyRes.value?.data?.success) {
        setHistoryData(historyRes.value.data.data);
      }
    } catch (err) {
      console.error("Error fetching family contribution data:", err);
      toast.error(err?.response?.data?.message || "Failed to load family contribution information");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFamilyContributionData();
  }, [fetchFamilyContributionData]);

  // Compute target month options based on nextDue
  const targetOptions = useMemo(() => {
    if (!summaryData?.account) return [];
    const { nextDueYear, nextDueMonth } = summaryData.account;
    const options = [];

    let curY = nextDueYear;
    let curM = nextDueMonth;

    // Generate up to 24 upcoming monthly intervals
    for (let i = 1; i <= 24; i++) {
      const monthName = MONTH_NAMES[curM - 1];
      let label = `${monthName} ${curY}`;
      if (i === 1) label += " (Next Due Month)";
      else if (i === 3) label += " (Quarter - 3 Months)";
      else if (i === 6) label += " (Half Year - 6 Months)";
      else if (i === 12) label += " (Full Year - 12 Months)";
      else if (curM === 3) label += " (Financial Year End)";

      options.push({
        year: curY,
        month: curM,
        value: `${curY}-${curM}`,
        label,
        count: i,
      });

      curM++;
      if (curM > 12) {
        curM = 1;
        curY++;
      }
    }
    return options;
  }, [summaryData]);

  // Fetch Pay-Until Quote when selected target changes
  const fetchQuote = useCallback(async (targetValue) => {
    if (!targetValue || !token) return;
    const [yStr, mStr] = targetValue.split("-");
    const toYear = parseInt(yStr, 10);
    const toMonth = parseInt(mStr, 10);

    try {
      setIsQuoting(true);
      const res = await apiConnector(
        "POST",
        familyContributionEndpoints.GET_QUOTE_API,
        { toYear, toMonth },
        { Authorization: `Bearer ${token}` }
      );

      if (res?.data?.success) {
        setQuote(res.data.data?.quote || res.data.data);
      }
    } catch (err) {
      console.error("Error fetching pay-until quote:", err);
      toast.error(err?.response?.data?.message || "Failed to calculate quote");
    } finally {
      setIsQuoting(false);
    }
  }, [token]);

  useEffect(() => {
    if (selectedTarget) {
      fetchQuote(selectedTarget);
    }
  }, [selectedTarget, fetchQuote]);

  // Razorpay Checkout Handler for Family Contribution
  const handlePayNow = async () => {
    if (!quote || quote.netPayableRupees === undefined) {
      toast.error("Please select a valid payment target first.");
      return;
    }

    if (quote.netPayableRupees <= 0) {
      toast.success("No payment required. Your dues are already covered by advance credits!");
      return;
    }

    setPaying(true);
    const toastId = toast.loading("Initializing secure Razorpay gateway...");
    const receiptAuthHeaders = { Authorization: "Bearer " + token };

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error("Razorpay SDK could not be loaded. Please check your internet connection.");
      }

      // Step 1: Prepare payment order
      const prepRes = await apiConnector(
        "POST",
        familyContributionEndpoints.PREPARE_PAYMENT_API,
        {
          toYear: quote.toYear,
          toMonth: quote.toMonth,
        },
        { Authorization: `Bearer ${token}` }
      );

      const prepData = prepRes?.data?.data;
      if (!prepData?.orderId || (!prepData?.keyId && !prepData?.key) || !prepData?.paymentId) {
        throw new Error("Payment order could not be generated by server.");
      }
      // Normalize backend field names
      const orderId = prepData.orderId;
      const rzpKey = prepData.key || prepData.keyId;
      const rzpAmount = prepData.amountPaise;

      toast.dismiss(toastId);

      // Step 2: Open Razorpay Popup
      const checkout = new window.Razorpay({
        key: rzpKey,
        amount: rzpAmount,
        currency: "INR",
        name: "श्री हल्बा / हल्बी समाज कल्याण समिति",
        description: `Family Contribution: ${summaryData?.family?.familyName || "Family"} (${quote.fromYear}-${quote.fromMonth} to ${quote.toYear}-${quote.toMonth})`,
        order_id: orderId,
        prefill: {
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.email,
          contact: user?.additionalDetails?.contactNumber || "",
        },
        theme: {
          color: "#059669",
        },
        handler: async (response) => {
          const verifyToastId = toast.loading("Verifying payment and updating family ledger...");
          try {
            const verifyRes = await apiConnector(
              "POST",
              familyContributionEndpoints.VERIFY_PAYMENT_API,
              {
                paymentId: prepData.paymentId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              { Authorization: `Bearer ${token}` }
            );

            toast.dismiss(verifyToastId);
            if (verifyRes?.data?.success) {
              toast.success("Contribution recorded and verified successfully!");
              await fetchFamilyContributionData(true);

              try {
                const receiptRes = await apiConnector(
                  "GET",
                  familyContributionEndpoints.GET_RECEIPT_API(prepData.paymentId),
                  null,
                  receiptAuthHeaders
                );
                if (receiptRes?.data?.success && receiptRes.data.data?.receipt) {
                  setSelectedReceipt(receiptRes.data.data.receipt);
                  setIsReceiptModalOpen(true);
                }
              } catch (receiptError) {
                console.error("Payment verified, but receipt could not be loaded:", receiptError);
                toast.error("Payment verified, but the receipt could not be loaded. You can open it from payment history.");
              }
            } else {
              toast.error(verifyRes?.data?.message || "Verification failed");
            }
          } catch (vErr) {
            toast.dismiss(verifyToastId);
            console.error("Payment verification failed:", vErr);
            toast.error(vErr?.response?.data?.message || "Verification failed on server");
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast("Payment window closed.");
          },
        },
      });

      checkout.open();
    } catch (err) {
      toast.dismiss(toastId);
      setPaying(false);
      console.error("Payment error:", err);
      toast.error(err?.response?.data?.message || err.message || "Failed to start payment");
    }
  };

  // View Receipt Handler
  const handleViewReceipt = async (paymentId) => {
    const loadingToast = toast.loading("Loading official receipt...");
    try {
      const res = await apiConnector(
        "GET",
        familyContributionEndpoints.GET_RECEIPT_API(paymentId),
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

  // Fetch Legacy Individual Dues (if user toggles)
  const fetchLegacyDues = async () => {
    if (legacySummary) return; // already loaded
    try {
      setLoadingLegacy(true);
      const authConfig = { Authorization: `Bearer ${token}` };
      const [sumRes, contribRes] = await Promise.all([
        apiConnector("GET", paymentEndpoints.MY_CONTRIBUTIONS_SUMMARY_API, null, authConfig),
        apiConnector("GET", paymentEndpoints.MY_CONTRIBUTIONS_API, null, authConfig, { limit: 50 }),
      ]);
      if (sumRes?.data?.success) setLegacySummary(sumRes.data.data.summary);
      if (contribRes?.data?.success) setLegacyContributions(contribRes.data.data.contributions || []);
    } catch (err) {
      console.error("Failed to load legacy dues:", err);
    } finally {
      setLoadingLegacy(false);
    }
  };

  const handleToggleLegacy = () => {
    const nextState = !showLegacyDues;
    setShowLegacyDues(nextState);
    if (nextState) fetchLegacyDues();
  };

  // Timeline list filtered
  const filteredTimeline = useMemo(() => {
    if (!historyData?.timeline) return [];
    if (timelineFilter === "ALL") return historyData.timeline;
    if (timelineFilter === "UNPAID") {
      return historyData.timeline.filter((e) => ["DUE", "OVERDUE", "PARTIAL"].includes(e.status));
    }
    if (timelineFilter === "PAID") {
      return historyData.timeline.filter((e) => ["PAID", "PAID_AHEAD"].includes(e.status));
    }
    return historyData.timeline;
  }, [historyData, timelineFilter]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <FiRefreshCw className="animate-spin text-emerald-500 text-3xl" />
        <p className="text-sm font-semibold text-[var(--text-muted)]">
          Loading your family contribution status...
        </p>
      </div>
    );
  }

  // If user is not linked to any family
  if (!hasFamily) {
    return (
      <div className="relative min-h-screen w-full bg-[var(--bg)] text-[var(--text-primary)] p-4 sm:p-8">
        <div className="max-w-3xl mx-auto mt-12 ka-card p-8 text-center space-y-6 border border-amber-500/20 bg-amber-500/5">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-2xl">
            <FiUsers />
          </div>
          <h2 className="text-2xl font-black text-[var(--text-primary)]">
            No Family Profile Linked
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
            The Samaj monthly contribution (₹60/month) is managed at the <strong>Family level</strong> instead of individual members. You are not currently registered under an active family profile.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link to="/dashboard/family" className="btn-primary !px-6 !py-2.5 text-sm flex items-center gap-2">
              <span>Go to Family Hub</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isHead = summaryData?.family?.isFamilyHead;
  const paidThroughDisplay = summaryData?.account?.paidThroughDisplay || "None";
  const nextDueText = summaryData?.account
    ? `${MONTH_NAMES[summaryData.account.nextDueMonth - 1]} ${summaryData.account.nextDueYear}`
    : "Up to Date";
  const totalOutstanding = summaryData?.account?.totalOutstandingRupees || 0;
  const advanceCredit = summaryData?.account?.advanceCreditRupees || 0;
  const isUpToDate = totalOutstanding === 0;

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
              <span className="text-[var(--text-primary)]">Family Contributions</span>
            </nav>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                Family Monthly <span className="text-gradient">Contribution</span>
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <FiUsers size={12} />
                {summaryData?.family?.familyName || "Family"} (₹60/mo)
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Recurring Samaj contribution of ₹60/month per family for community welfare, scholarships, and social security.
            </p>
          </div>

          <button
            onClick={() => fetchFamilyContributionData(true)}
            disabled={refreshing}
            className="btn-secondary !py-2 !px-3.5 !text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <FiRefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Family Role Notice if not Head */}
        {!isHead && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-sky-500/20 bg-sky-500/5 text-sky-300 text-xs">
            <FiInfo size={16} className="shrink-0" />
            <span>
              You are viewing the contribution status for your family. The primary designated payer is your Family Head (
              <strong>{summaryData?.family?.head?.firstName || "Family Head"}</strong>). However, any adult family member can contribute on behalf of the family.
            </span>
          </div>
        )}

        {/* 1. HERO STATUS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Paid Through */}
          <div className="ka-card p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Paid Through
              </span>
              <FiCalendar className="text-emerald-400" size={14} />
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-400">
                {paidThroughDisplay}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] mt-1">
              Continuous paid status
            </span>
          </div>

          {/* Card 2: Next Due */}
          <div className={`ka-card p-4 flex flex-col justify-between border-l-4 ${totalOutstanding > 0 ? "border-l-amber-500" : "border-l-sky-500"}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Next Due Month
              </span>
              <FiClock className={totalOutstanding > 0 ? "text-amber-400" : "text-sky-400"} size={14} />
            </div>
            <div className="mt-2">
              <span className={`text-xl sm:text-2xl font-black ${totalOutstanding > 0 ? "text-amber-400" : "text-sky-400"}`}>
                {nextDueText}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] mt-1">
              {summaryData?.account?.unpaidMonthsCount > 0
                ? `${summaryData.account.unpaidMonthsCount} month(s) awaiting payment`
                : "Obligations current"}
            </span>
          </div>

          {/* Card 3: Total Outstanding */}
          <div className={`ka-card p-4 flex flex-col justify-between border-l-4 ${totalOutstanding > 0 ? "border-l-red-500" : "border-l-emerald-500"}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Total Outstanding
              </span>
              <FaRupeeSign className={totalOutstanding > 0 ? "text-red-400" : "text-emerald-400"} size={12} />
            </div>
            <div className="mt-2">
              <span className={`text-xl sm:text-2xl font-black ${totalOutstanding > 0 ? "text-red-400" : "text-emerald-400"}`}>
                ₹{totalOutstanding}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] mt-1">
              {summaryData?.account?.outstandingLateFineRupees > 0
                ? `Includes ₹${summaryData.account.outstandingLateFineRupees} late fine`
                : "Zero late penalties"}
            </span>
          </div>

          {/* Card 4: Advance Credit */}
          <div className="ka-card p-4 flex flex-col justify-between border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Advance Credit
              </span>
              <FiAward className="text-purple-400" size={14} />
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-purple-400">
                ₹{advanceCredit}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] mt-1">
              Auto-applied to future dues
            </span>
          </div>
        </div>

        {/* 2. PAY AHEAD / QUICK PAYMENT PANEL */}
        <div className="ka-card p-6 sm:p-7 border border-[var(--border-subtle)] bg-[var(--surface-elevated)] relative overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border-subtle)] pb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]">
                Fast Contribution Gateway
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-0.5">
                Pay Ahead & Clear Contributions
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Select your target month. You can pay for 1 month, 6 months, or in advance up to 2 years with zero recurring hassle.
              </p>
            </div>

            {isUpToDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold shrink-0">
                <FiCheckCircle size={14} />
                Up to Date
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
            {/* Target Selector */}
            <div className="lg:col-span-6 space-y-4">
              <div className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Pay Until (Target Month):
                </span>
                <div ref={monthDropdownRef} className="mt-2 relative">
                  {/* Visual Dropdown Button */}
                  <button
                    type="button"
                    onClick={() => setIsMonthDropdownOpen((prev) => !prev)}
                    aria-haspopup="listbox"
                    aria-expanded={isMonthDropdownOpen}
                    className="ka-month-select flex h-14 w-full items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] px-4 pr-12 text-sm font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 cursor-pointer text-left relative min-w-0"
                    style={{
                      color: "var(--text-primary)",
                      backgroundColor: "var(--surface)",
                    }}
                  >
                    <span className="truncate pr-2 font-bold text-[var(--text-primary)]">
                      {targetOptions.find((opt) => opt.value === selectedTarget)?.label || "Select Target Month"}
                      {targetOptions.find((opt) => opt.value === selectedTarget) && (
                        <span className="ml-2 text-xs font-medium text-[var(--text-muted)]">
                          ({targetOptions.find((opt) => opt.value === selectedTarget)?.count} month{targetOptions.find((opt) => opt.value === selectedTarget)?.count > 1 ? "s" : ""})
                        </span>
                      )}
                    </span>
                    <FiChevronDown
                      className={`absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-transform duration-200 pointer-events-none ${
                        isMonthDropdownOpen ? "rotate-180 text-[var(--accent-primary)]" : ""
                      }`}
                      size={18}
                    />
                  </button>

                  {/* Dropdown Options Menu */}
                  {isMonthDropdownOpen && (
                    <div
                      role="listbox"
                      className="absolute left-0 right-0 top-full mt-2 z-50 max-h-60 overflow-y-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-1.5 shadow-2xl backdrop-blur-md"
                      style={{
                        backgroundColor: "var(--surface-elevated)",
                        borderColor: "var(--border-subtle)",
                      }}
                    >
                      {targetOptions.map((opt) => {
                        const isSelected = selectedTarget === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setSelectedTarget(opt.value);
                              setIsMonthDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-left ${
                              isSelected
                                ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold"
                                : "text-[var(--text-primary)] hover:bg-[var(--surface-hover)] hover:text-[var(--accent-primary)]"
                            }`}
                            style={{
                              color: isSelected ? "var(--accent-primary)" : "var(--text-primary)",
                            }}
                          >
                            <span className="truncate">{opt.label}</span>
                            <span
                              className={`ml-2 text-xs font-medium shrink-0 ${
                                isSelected ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"
                              }`}
                            >
                              {opt.count} mo{opt.count > 1 ? "s" : ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Accessible native select fallback */}
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    {targetOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} ({opt.count} month{opt.count > 1 ? "s" : ""})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Quick Select Intervals:
                </span>
                <div className="flex flex-wrap gap-2">
                  {targetOptions.slice(0, 4).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedTarget(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        selectedTarget === opt.value
                          ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                          : "border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {opt.count === 1 ? "Next 1 Mo" : `${opt.count} Months`}
                    </button>
                  ))}
                  {targetOptions.length >= 12 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTarget(targetOptions[11].value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        selectedTarget === targetOptions[11].value
                          ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                          : "border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      1 Year (12 Mo)
                    </button>
                  )}
                </div>
              </div>

              {/* Month Breakdown Pill List */}
              {quote?.monthBreakdown && quote.monthBreakdown.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                    Covered Months Breakdown ({quote.monthBreakdown.length} Months):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {quote.monthBreakdown.map((m) => (
                      <span
                        key={m.ledgerId || `${m.year}-${m.month}`}
                        className={`text-[11px] px-2.5 py-1 rounded-md font-medium border flex items-center gap-1.5 ${
                          m.lateFineRupees > 0
                            ? "border-red-500/30 bg-red-500/10 text-red-300"
                            : m.isFuture
                            ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        }`}
                      >
                        <span>{m.monthName} {m.year}</span>
                        <span className="font-bold">₹{m.totalRupees}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quote Summary & Pay Button */}
            <div className="lg:col-span-6 p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Live Quote Breakdown
                </span>
                {isQuoting && <FiRefreshCw className="animate-spin text-emerald-400" size={13} />}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Number of Months:</span>
                  <span className="font-bold text-[var(--text-primary)]">{quote?.monthCount || 0} month(s)</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Principal Contribution (₹60/mo):</span>
                  <span className="font-bold text-[var(--text-primary)]">₹{quote?.totalPrincipalRupees || 0}</span>
                </div>
                {quote?.totalLateFineRupees > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>Overdue Late Fines:</span>
                    <span className="font-bold">+ ₹{quote.totalLateFineRupees}</span>
                  </div>
                )}
                {quote?.availableCreditRupees > 0 && (
                  <div className="flex justify-between text-purple-400 font-semibold">
                    <span>Advance Credit Offset:</span>
                    <span>- ₹{quote.availableCreditRupees}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between items-baseline">
                  <span className="text-sm font-black uppercase text-[var(--text-primary)]">Net Payable:</span>
                  <span className="text-2xl font-black text-emerald-400">
                    ₹{quote?.netPayableRupees ?? 0}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePayNow}
                disabled={paying || isQuoting || (quote?.netPayableRupees === 0 && quote?.monthCount === 0)}
                className="w-full btn-primary !py-3 !text-sm flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50 mt-2 shadow-lg shadow-emerald-500/20"
              >
                {paying ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <FiCreditCard size={16} />
                    <span>Proceed to Secure Payment (₹{quote?.netPayableRupees ?? 0})</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-[var(--text-muted)] flex items-center justify-center gap-1">
                <FiShield size={12} className="text-emerald-400" />
                <span>Encrypted 256-bit Razorpay Gateway • Instant Official Receipt</span>
              </p>
            </div>
          </div>
        </div>

        {/* 3. MONTH-BY-MONTH TIMELINE & PAYMENT RECEIPTS TABS */}
        <div className="ka-card p-6 border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <h2 className="text-lg font-black text-[var(--text-primary)]">
                Contribution History & Ledger
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Audit trail of all generated monthly obligations and verified payments.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border-subtle)]">
              {["ALL", "UNPAID", "PAID"].map((f) => (
                <button
                  key={f}
                  onClick={() => setTimelineFilter(f)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition cursor-pointer ${
                    timelineFilter === f
                      ? "bg-[var(--accent-primary)] text-slate-950 shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {f === "ALL" ? "All Months" : f === "UNPAID" ? "Dues Only" : "Paid Months"}
                </button>
              ))}
            </div>
          </div>

          {/* Month-by-Month Obligations Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
              Monthly Obligations ({filteredTimeline.length})
            </h3>

            {filteredTimeline.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                No contribution records found for the selected filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredTimeline.map((item) => {
                  const isPaid = item.status === "PAID" || item.status === "PAID_AHEAD";
                  const isOverdue = item.status === "OVERDUE";
                  const isPartial = item.status === "PARTIAL";

                  let badgeClass = "border-amber-500/30 bg-amber-500/10 text-amber-300";
                  if (isPaid) badgeClass = "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
                  else if (isOverdue) badgeClass = "border-red-500/30 bg-red-500/10 text-red-300";
                  else if (isPartial) badgeClass = "border-sky-500/30 bg-sky-500/10 text-sky-300";

                  return (
                    <div
                      key={item._id}
                      className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] flex flex-col justify-between gap-2.5 transition hover:border-[var(--accent-primary)]/40"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-[var(--text-muted)]" size={13} />
                          <span className="text-sm font-bold text-[var(--text-primary)]">
                            {MONTH_NAMES[item.contributionMonth - 1]} {item.contributionYear}
                          </span>
                        </div>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${badgeClass}`}>
                          {item.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex justify-between text-[var(--text-muted)]">
                          <span>Principal:</span>
                          <span className="font-semibold text-[var(--text-primary)]">₹{item.contributionAmountRupees}</span>
                        </div>
                        {item.lateFineAmountRupees > 0 && (
                          <div className="flex justify-between text-red-400">
                            <span>Late Fine:</span>
                            <span className="font-semibold">+ ₹{item.lateFineAmountRupees}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
                          <span>Remaining Due:</span>
                          <span className={`font-black ${item.remainingRupees > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                            ₹{item.remainingRupees}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment Receipts History Table */}
          {historyData?.payments && historyData.payments.length > 0 && (
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                <FaReceipt className="text-emerald-400" />
                <span>Verified Payment Receipts ({historyData.payments.length})</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[var(--text-secondary)]">
                  <thead className="bg-[var(--surface)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                    <tr>
                      <th className="py-2.5 px-3">Receipt No</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {historyData.payments.map((p) => (
                      <tr key={p._id} className="hover:bg-[var(--surface)]/50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-[var(--text-primary)]">
                          {p.receiptNumber || "N/A"}
                        </td>
                        <td className="py-3 px-3">
                          {p.receiptDate ? new Date(p.receiptDate).toLocaleDateString("en-IN") : "N/A"}
                        </td>
                        <td className="py-3 px-3 font-black text-emerald-400">
                          ₹{p.amountRupees}
                        </td>
                        <td className="py-3 px-3 font-medium">
                          <span className="px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border-subtle)] text-[10px] uppercase font-bold">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-bold uppercase text-emerald-400">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleViewReceipt(p._id)}
                            className="btn-secondary !py-1 !px-2.5 !text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FiFileText size={11} />
                            <span>View Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 4. LEGACY INDIVIDUAL DUES (BACKWARD COMPATIBILITY ACCORDION) */}
        <div className="border border-[var(--border-subtle)] rounded-2xl bg-[var(--surface)] overflow-hidden">
          <button
            type="button"
            onClick={handleToggleLegacy}
            className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FaHistory size={13} />
              <span>View Past Individual Member Dues (Historical Archive)</span>
            </div>
            {showLegacyDues ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>

          {showLegacyDues && (
            <div className="p-5 border-t border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-4">
              {loadingLegacy ? (
                <div className="py-4 text-center text-xs text-[var(--text-muted)]">
                  Loading historical records...
                </div>
              ) : legacyContributions.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">
                  No previous individual records found for your account. All contributions are now tracked under your Family Ledger.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {legacyContributions.slice(0, 6).map((c) => (
                      <div key={c._id} className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] text-xs">
                        <div className="font-bold text-[var(--text-primary)]">{c.monthName || c.month}/{c.year}</div>
                        <div className="text-[11px] text-emerald-400 font-semibold">₹{c.paidAmount || c.expectedAmount} ({c.status})</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Official Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
};

export default MyDues;
