import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiDownload,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiFileText,
  FiRefreshCw,
  FiRotateCcw,
  FiDollarSign,
  FiUsers,
  FiLayers,
  FiX,
  FiEye,
} from "react-icons/fi";
import { FaRupeeSign, FaMoneyBillWave, FaHandHoldingUsd } from "react-icons/fa";
import { apiConnector } from "../../../../services/apiConnector";
import { paymentEndpoints } from "../../../../services/apis";
import ReceiptModal from "../../../Common/ReceiptModal";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const MonthlyContributionsAdmin = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  // ── States ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [cycles, setCycles] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [summary, setSummary] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState({ page: 1, limit: 50, total: 0, pages: 1 });

  // Modals
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [isCyclesManagerOpen, setIsCyclesManagerOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const [activeContribution, setActiveContribution] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [memberLedger, setMemberLedger] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // Form states
  const [cycleForm, setCycleForm] = useState({
    month: currentMonth,
    year: currentYear,
    contributionAmount: 60,
    dueStartDate: `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`,
    dueDate: `${currentYear}-${String(currentMonth).padStart(2, "0")}-10`,
    lateFeeAmount: 2,
    lateFeeRule: "PER_MONTH",
    description: `Monthly contribution cycle for ${MONTH_NAMES[currentMonth - 1]} ${currentYear}`,
    status: "OPEN",
  });

  const [paymentForm, setPaymentForm] = useState({
    contributionId: "",
    memberSearch: "",
    selectedMember: null,
    month: currentMonth,
    year: currentYear,
    amount: 60,
    paymentMethod: "CASH",
    paymentDate: new Date().toISOString().slice(0, 10),
    receiptNumber: "",
    collectedBy: `${user?.firstName || "Admin"} ${user?.lastName || ""}`.trim(),
    notes: "Monthly contribution collected in cash.",
  });

  const [reversalReason, setReversalReason] = useState("");
  const [busyAction, setBusyAction] = useState(false);

  // ── Loaders ───────────────────────────────────────────────────────────────
  const fetchCycles = async () => {
    try {
      const res = await apiConnector("GET", paymentEndpoints.CONTRIBUTION_CYCLES_API, null, authConfig);
      if (res.data?.success) {
        setCycles(res.data.data.cycles || []);
      }
    } catch (err) {
      console.error("Error fetching cycles:", err);
    }
  };

  const fetchDashboardSummary = async () => {
    try {
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;

      const res = await apiConnector(
        "GET",
        paymentEndpoints.CONTRIBUTIONS_DASHBOARD_SUMMARY_API,
        null,
        authConfig,
        params
      );
      if (res.data?.success) {
        setSummary(res.data.data.summary);
      }
    } catch (err) {
      console.error("Error fetching dashboard summary:", err);
    }
  };

  const fetchContributions = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 50,
      };
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      if (statusFilter && statusFilter !== "ALL") params.status = statusFilter;
      if (methodFilter && methodFilter !== "ALL") params.paymentMethod = methodFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiConnector("GET", paymentEndpoints.CONTRIBUTIONS_API, null, authConfig, params);
      if (res.data?.success) {
        setContributions(res.data.data.contributions || []);
        if (res.data.meta) setPaginationMeta(res.data.meta);
      }
    } catch (err) {
      console.error("Error fetching contributions:", err);
      toast.error(err.response?.data?.message || "Failed to load contributions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  useEffect(() => {
    fetchDashboardSummary();
    fetchContributions(1);
  }, [selectedMonth, selectedYear, statusFilter, methodFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchContributions(1);
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  // 1. Create Cycle
  const handleCreateCycle = async (e) => {
    e.preventDefault();
    setBusyAction(true);
    try {
      const res = await apiConnector(
        "POST",
        paymentEndpoints.CONTRIBUTION_CYCLES_API,
        cycleForm,
        authConfig
      );
      if (res.data?.success) {
        toast.success(res.data.message || "Monthly contribution cycle created!");
        setIsCycleModalOpen(false);
        await Promise.all([fetchCycles(), fetchDashboardSummary(), fetchContributions(1)]);
      }
    } catch (err) {
      console.error("Error creating cycle:", err);
      toast.error(err.response?.data?.message || "Failed to create contribution cycle");
    } finally {
      setBusyAction(false);
    }
  };

  // 2. Open Record Cash Payment for specific contribution
  const openRecordPaymentModal = (contrib) => {
    const remaining = Math.max(
      0,
      (contrib.totalPayable || contrib.expectedAmount) - (contrib.paidAmount || 0)
    );
    setActiveContribution(contrib);
    setPaymentForm({
      contributionId: contrib._id,
      memberSearch: `${contrib.member?.firstName || ""} ${contrib.member?.lastName || ""}`.trim(),
      selectedMember: contrib.member,
      month: contrib.month,
      year: contrib.year,
      amount: remaining > 0 ? remaining : 60,
      paymentMethod: "CASH",
      paymentDate: new Date().toISOString().slice(0, 10),
      receiptNumber: `CASH-${contrib.year}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      collectedBy: `${user?.firstName || "Admin"} ${user?.lastName || ""}`.trim(),
      notes: "Monthly contribution collected in cash.",
    });
    setIsRecordModalOpen(true);
  };

  // 3. Submit Manual Payment
  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!activeContribution) return;

    const confirmMsg = `Record ₹${paymentForm.amount} ${paymentForm.paymentMethod} contribution for ${paymentForm.memberSearch} for ${MONTH_NAMES[paymentForm.month - 1]} ${paymentForm.year}?`;
    if (!window.confirm(confirmMsg)) return;

    setBusyAction(true);
    try {
      const res = await apiConnector(
        "POST",
        paymentEndpoints.MANUAL_CONTRIBUTION_PAYMENT_API(activeContribution._id),
        paymentForm,
        authConfig
      );
      if (res.data?.success) {
        toast.success("Contribution recorded successfully!");
        setIsRecordModalOpen(false);
        await Promise.all([fetchDashboardSummary(), fetchContributions(paginationMeta.page)]);
      }
    } catch (err) {
      console.error("Error recording payment:", err);
      toast.error(err.response?.data?.message || "Failed to record payment");
    } finally {
      setBusyAction(false);
    }
  };

  // 4. Reverse Payment
  const openReverseModal = (contrib) => {
    setActiveContribution(contrib);
    setReversalReason("");
    setIsReverseModalOpen(true);
  };

  const handleReverseSubmit = async (e) => {
    e.preventDefault();
    if (!reversalReason.trim()) {
      toast.error("Please enter a valid reversal reason for accounting audit records.");
      return;
    }
    if (!activeContribution) return;

    setBusyAction(true);
    try {
      const res = await apiConnector(
        "POST",
        paymentEndpoints.REVERSE_CONTRIBUTION_PAYMENT_API(activeContribution._id),
        { reason: reversalReason.trim() },
        authConfig
      );
      if (res.data?.success) {
        toast.success("Payment reversed successfully and logged in audit history.");
        setIsReverseModalOpen(false);
        await Promise.all([fetchDashboardSummary(), fetchContributions(paginationMeta.page)]);
      }
    } catch (err) {
      console.error("Error reversing payment:", err);
      toast.error(err.response?.data?.message || "Failed to reverse payment");
    } finally {
      setBusyAction(false);
    }
  };

  // 5. View Receipt
  const handleViewReceipt = async (contributionId) => {
    const tId = toast.loading("Loading official receipt...");
    try {
      const res = await apiConnector(
        "GET",
        paymentEndpoints.CONTRIBUTION_RECEIPT_API(contributionId),
        null,
        authConfig
      );
      toast.dismiss(tId);
      if (res.data?.success) {
        setActiveReceipt(res.data.data.receipt);
        setIsReceiptModalOpen(true);
      }
    } catch (err) {
      toast.dismiss(tId);
      console.error("Error loading receipt:", err);
      toast.error(err.response?.data?.message || "Failed to load receipt");
    }
  };

  // 6. View Member Ledger
  const handleViewMemberLedger = async (memberId) => {
    setLedgerLoading(true);
    setIsLedgerModalOpen(true);
    try {
      const res = await apiConnector(
        "GET",
        paymentEndpoints.MEMBER_LEDGER_ADMIN_API(memberId),
        null,
        authConfig
      );
      if (res.data?.success) {
        setMemberLedger(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching member ledger:", err);
      toast.error(err.response?.data?.message || "Failed to load member ledger");
      setIsLedgerModalOpen(false);
    } finally {
      setLedgerLoading(false);
    }
  };

  // 7. Export CSV
  const handleExportCSV = async () => {
    const tId = toast.loading("Generating CSV contribution report...");
    try {
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      if (statusFilter && statusFilter !== "ALL") params.status = statusFilter;
      if (methodFilter && methodFilter !== "ALL") params.paymentMethod = methodFilter;

      const res = await apiConnector(
        "GET",
        paymentEndpoints.EXPORT_CONTRIBUTIONS_API,
        null,
        authConfig,
        params
      );
      toast.dismiss(tId);
      // Trigger download
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `samaj_contributions_${selectedMonth || "all"}_${selectedYear || "all"}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV export downloaded successfully!");
    } catch (err) {
      toast.dismiss(tId);
      console.error("Export error:", err);
      toast.error("Failed to export contributions");
    }
  };

  // 8. Send Reminders
  const handleSendReminders = async () => {
    if (!window.confirm("Send friendly contribution reminders to members with pending/overdue dues?")) {
      return;
    }
    const tId = toast.loading("Sending contribution reminders...");
    try {
      const res = await apiConnector(
        "POST",
        paymentEndpoints.SEND_CONTRIBUTION_REMINDERS_API,
        { month: selectedMonth || undefined, year: selectedYear || undefined },
        authConfig
      );
      toast.dismiss(tId);
      if (res.data?.success) {
        toast.success(res.data.message || "Reminders dispatched to members!");
      }
    } catch (err) {
      toast.dismiss(tId);
      console.error("Reminder error:", err);
      toast.error("Failed to send reminders");
    }
  };

  // 9. Cycle status toggle (Open / Close)
  const handleToggleCycleStatus = async (cycle) => {
    const nextStatus = cycle.status === "OPEN" ? "CLOSED" : "OPEN";
    const confirmMsg = `Are you sure you want to change cycle ${cycle.title || `${cycle.month}/${cycle.year}`} to ${nextStatus}? Historical records will remain intact.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await apiConnector(
        "PATCH",
        paymentEndpoints.UPDATE_CYCLE_STATUS_API(cycle._id),
        { status: nextStatus },
        authConfig
      );
      if (res.data?.success) {
        toast.success(`Cycle marked as ${nextStatus}`);
        fetchCycles();
      }
    } catch (err) {
      console.error("Cycle update error:", err);
      toast.error("Failed to update cycle status");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header & Actions Bar ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[var(--surface-elevated)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              ₹
            </div>
            <div>
              <h2 className="text-lg font-black text-[var(--text-primary)]">
                Monthly Contributions Management
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Manage ₹60 monthly Samaj dues, billing cycles, cash recording, receipts, and audit trail.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={() => setIsCycleModalOpen(true)}
            className="btn-primary !py-2 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <FiPlus size={14} />
            <span>Start Contribution Cycle</span>
          </button>

          <button
            onClick={() => setIsCyclesManagerOpen(true)}
            className="btn-secondary !py-2 !px-3.5 !text-xs flex items-center gap-1.5 cursor-pointer"
            title="View & manage cycles"
          >
            <FiLayers size={13} />
            <span>Manage Cycles ({cycles.length})</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn-secondary !py-2 !px-3.5 !text-xs flex items-center gap-1.5 cursor-pointer"
            title="Export CSV"
          >
            <FiDownload size={13} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleSendReminders}
            className="btn-secondary !py-2 !px-3.5 !text-xs flex items-center gap-1.5 cursor-pointer text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
            title="Send Reminders"
          >
            <FiBell size={13} />
            <span>Send Reminders</span>
          </button>
        </div>
      </div>

      {/* ── Cycle Filter Dropdown Selector ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 bg-[var(--surface)] p-3 rounded-xl border border-[var(--border-subtle)] text-xs">
        <span className="font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[10px] flex items-center gap-1">
          <FiCalendar size={12} /> Cycle Filter:
        </span>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="ka-input !py-1.5 !px-3 !text-xs !w-auto"
        >
          <option value="">All Months</option>
          {MONTH_NAMES.map((name, idx) => (
            <option key={idx + 1} value={idx + 1}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="ka-input !py-1.5 !px-3 !text-xs !w-auto"
        >
          <option value="">All Years</option>
          {[currentYear - 1, currentYear, currentYear + 1].map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>

        {(selectedMonth || selectedYear) && (
          <button
            onClick={() => {
              setSelectedMonth("");
              setSelectedYear("");
            }}
            className="text-[11px] text-[var(--accent-primary)] hover:underline cursor-pointer ml-auto"
          >
            Reset to All Cycles
          </button>
        )}
      </div>

      {/* ── KPI Summary Cards (From Backend Ledger Data) ────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="ka-card p-3.5 border-l-4 border-l-slate-400">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Eligible Members
          </span>
          <div className="mt-1 text-xl font-black text-[var(--text-primary)]">
            {summary?.eligibleMembers || 0}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Active community</span>
        </div>

        <div className="ka-card p-3.5 border-l-4 border-l-blue-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Expected
          </span>
          <div className="mt-1 text-xl font-black text-blue-400">
            ₹{summary?.totalExpected || 0}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Total dues</span>
        </div>

        <div className="ka-card p-3.5 border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Collected
          </span>
          <div className="mt-1 text-xl font-black text-emerald-400">
            ₹{summary?.totalCollected || 0}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">
            Cash: ₹{summary?.cashCollected || 0} · Online: ₹{summary?.onlineCollected || 0}
          </span>
        </div>

        <div className="ka-card p-3.5 border-l-4 border-l-red-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Outstanding
          </span>
          <div className="mt-1 text-xl font-black text-red-400">
            ₹{summary?.totalOutstanding || 0}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Pending collection</span>
        </div>

        <div className="ka-card p-3.5 border-l-4 border-l-teal-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Paid
          </span>
          <div className="mt-1 text-xl font-black text-teal-400">
            {summary?.paidMembers || 0}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Members cleared</span>
        </div>

        <div className="ka-card p-3.5 border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Pending
          </span>
          <div className="mt-1 text-xl font-black text-amber-400">
            {summary?.pendingMembers || 0}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Members to pay</span>
        </div>

        <div className="ka-card p-3.5 border-l-4 border-l-rose-500 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Overdue
          </span>
          <div className="mt-1 text-xl font-black text-rose-400">
            {summary?.overdueMembers || 0}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Past due date</span>
        </div>
      </div>

      {/* ── Filter Bar & Member Search ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[var(--surface-elevated)] p-3.5 rounded-2xl border border-[var(--border-subtle)]">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member name, email or Member ID (SMJ-XXXX)..."
            className="ka-input !pl-10 !py-2 !text-xs w-full"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ka-input !py-2 !px-3 !text-xs !w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
            <option value="OVERDUE">Overdue</option>
            <option value="WAIVED">Waived</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="ka-input !py-2 !px-3 !text-xs !w-auto"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="ONLINE">Online (Gateway)</option>
            <option value="CASH">Cash (Admin)</option>
            <option value="BANK_TRANSFER">Bank Transfer / UPI</option>
            <option value="NONE">None (Pending)</option>
          </select>

          <button
            onClick={() => fetchContributions(paginationMeta.page)}
            disabled={loading}
            className="btn-secondary !py-2 !px-3 !text-xs cursor-pointer"
            title="Refresh list"
          >
            <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── Member Contribution Ledger Table ───────────────────────────────── */}
      <div className="ka-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-muted)]">
            <FiRefreshCw className="animate-spin mx-auto mb-2 text-[var(--accent-primary)]" size={24} />
            <span>Loading member contribution records...</span>
          </div>
        ) : contributions.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--text-muted)] space-y-2">
            <p className="font-bold text-sm text-[var(--text-primary)]">No contribution records found</p>
            <p>Try clearing filters or start a contribution cycle to generate monthly dues.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--surface-elevated)]">
                  <th className="py-3 px-4">Member Name & ID</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Cycle</th>
                  <th className="py-3 px-4">Due</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Outstanding</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {contributions.map((c) => {
                  const memberIdStr = c.member?._id ? `SMJ-${String(c.member._id).slice(-6).toUpperCase()}` : "SMJ-XXXX";
                  const total = (c.expectedAmount || 0) + (c.lateFee || 0);
                  const outstanding = Math.max(0, total - (c.paidAmount || 0));
                  const isPaid = c.status === "PAID";
                  const isActionable = ["PENDING", "PARTIAL", "OVERDUE"].includes(c.status);

                  return (
                    <tr key={c._id} className="hover:bg-[var(--surface-elevated)]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[var(--text-primary)]">
                          {c.member?.firstName} {c.member?.lastName}
                        </div>
                        <div className="font-mono text-[10px] text-[var(--text-muted)] flex items-center gap-1.5">
                          <span>{memberIdStr}</span>
                          {c.member?.additionalDetails?.gotra && (
                            <span>· Gotra: {c.member.additionalDetails.gotra}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[var(--text-muted)]">
                        <div>{c.member?.additionalDetails?.contactNumber || "N/A"}</div>
                        <div className="text-[10px] truncate max-w-[130px]">{c.member?.email}</div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-[var(--text-secondary)]">
                        {MONTH_NAMES[c.month - 1]} {c.year}
                      </td>

                      <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                        ₹{total}
                        {Boolean(c.lateFee && c.lateFee > 0) && (
                          <span className="text-[10px] text-red-400 font-normal ml-1">(+₹{c.lateFee} fee)</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-bold text-emerald-400">
                        ₹{c.paidAmount || 0}
                      </td>

                      <td className="py-3 px-4 font-bold text-red-400">
                        ₹{outstanding}
                      </td>

                      <td className="py-3 px-4 uppercase text-[10px] font-bold text-[var(--text-secondary)]">
                        {c.paymentMethod && c.paymentMethod !== "NONE" ? c.paymentMethod : "—"}
                      </td>

                      <td className="py-3 px-4 text-[var(--text-muted)] text-[11px]">
                        {c.paidAt
                          ? new Date(c.paidAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })
                          : "—"}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isPaid
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                              : c.status === "OVERDUE"
                              ? "border-red-500/40 bg-red-500/10 text-red-400"
                              : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isActionable && (
                            <button
                              onClick={() => openRecordPaymentModal(c)}
                              className="btn-primary !py-1 !px-2.5 !text-[10px] flex items-center gap-1 cursor-pointer"
                              title="Record Cash Payment"
                            >
                              <FaRupeeSign size={10} />
                              <span>Record</span>
                            </button>
                          )}

                          {isPaid && (
                            <>
                              <button
                                onClick={() => handleViewReceipt(c._id)}
                                className="btn-secondary !py-1 !px-2.5 !text-[10px] flex items-center gap-1 cursor-pointer"
                                title="View Receipt"
                              >
                                <FiFileText size={11} />
                                <span>Receipt</span>
                              </button>

                              <button
                                onClick={() => openReverseModal(c)}
                                className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Reverse / Correct Payment"
                              >
                                <FiRotateCcw size={13} />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleViewMemberLedger(c.member?._id)}
                            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
                            title="View Member Full Ledger"
                          >
                            <FiEye size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {paginationMeta.pages > 1 && (
          <div className="flex items-center justify-between p-3.5 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            <span>
              Page {paginationMeta.page} of {paginationMeta.pages} ({paginationMeta.total} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={paginationMeta.page <= 1}
                onClick={() => fetchContributions(paginationMeta.page - 1)}
                className="btn-secondary !py-1 !px-3 !text-xs disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={paginationMeta.page >= paginationMeta.pages}
                onClick={() => fetchContributions(paginationMeta.page + 1)}
                className="btn-secondary !py-1 !px-3 !text-xs disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL 1: START / CREATE CONTRIBUTION CYCLE
      ══════════════════════════════════════════════════════════════════════════ */}
      {isCycleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-emerald-400" size={18} />
                <h3 className="font-bold text-base text-[var(--text-primary)]">
                  Start Monthly Contribution Cycle
                </h3>
              </div>
              <button
                onClick={() => setIsCycleModalOpen(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                    Month *
                  </span>
                  <select
                    value={cycleForm.month}
                    onChange={(e) =>
                      setCycleForm((cur) => ({
                        ...cur,
                        month: Number(e.target.value),
                        description: `Monthly contribution cycle for ${MONTH_NAMES[Number(e.target.value) - 1]} ${cur.year}`,
                      }))
                    }
                    className="ka-input"
                    required
                  >
                    {MONTH_NAMES.map((name, i) => (
                      <option key={i + 1} value={i + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                    Year *
                  </span>
                  <input
                    type="number"
                    value={cycleForm.year}
                    onChange={(e) =>
                      setCycleForm((cur) => ({
                        ...cur,
                        year: Number(e.target.value),
                        description: `Monthly contribution cycle for ${MONTH_NAMES[cur.month - 1]} ${e.target.value}`,
                      }))
                    }
                    className="ka-input"
                    required
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                    Contribution Amount *
                  </span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={cycleForm.contributionAmount}
                      onChange={(e) =>
                        setCycleForm((cur) => ({ ...cur, contributionAmount: Number(e.target.value) }))
                      }
                      className="ka-input !pl-7"
                      required
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                    Late Fee / Fine
                  </span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={cycleForm.lateFeeAmount}
                      onChange={(e) =>
                        setCycleForm((cur) => ({ ...cur, lateFeeAmount: Number(e.target.value) }))
                      }
                      className="ka-input !pl-7"
                    />
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                    Due Start Date *
                  </span>
                  <input
                    type="date"
                    value={cycleForm.dueStartDate}
                    onChange={(e) => setCycleForm((cur) => ({ ...cur, dueStartDate: e.target.value }))}
                    className="ka-input"
                    required
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                    Payment Due Date *
                  </span>
                  <input
                    type="date"
                    value={cycleForm.dueDate}
                    onChange={(e) => setCycleForm((cur) => ({ ...cur, dueDate: e.target.value }))}
                    className="ka-input"
                    required
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                  Description / Purpose
                </span>
                <input
                  type="text"
                  value={cycleForm.description}
                  onChange={(e) => setCycleForm((cur) => ({ ...cur, description: e.target.value }))}
                  className="ka-input"
                />
              </label>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed">
                ℹ️ Starting this cycle will automatically identify all active eligible members and generate their individual ₹{cycleForm.contributionAmount} monthly contribution records. Duplicate cycles for the same month/year are strictly prevented.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsCycleModalOpen(false)}
                  className="btn-secondary !py-2 !px-4 !text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busyAction}
                  className="btn-primary !py-2 !px-5 !text-xs cursor-pointer disabled:opacity-50"
                >
                  {busyAction ? "Generating..." : "Create & Start Cycle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL 2: RECORD MANUAL CASH / OFFLINE PAYMENT
      ══════════════════════════════════════════════════════════════════════════ */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
              <div className="flex items-center gap-2">
                <FaHandHoldingUsd className="text-emerald-400" size={18} />
                <h3 className="font-bold text-base text-[var(--text-primary)]">
                  Record Manual Contribution Payment
                </h3>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Member:</span>
                  <span className="font-bold text-[var(--text-primary)]">{paymentForm.memberSearch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Cycle:</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {MONTH_NAMES[paymentForm.month - 1]} {paymentForm.year}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Total Due:</span>
                  <span className="font-bold text-amber-400">
                    ₹{(activeContribution?.totalPayable || activeContribution?.expectedAmount) || 60}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                    Amount Paid (₹) *
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm((cur) => ({ ...cur, amount: Number(e.target.value) }))}
                    className="ka-input font-bold text-emerald-400"
                    required
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                    Payment Method *
                  </span>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm((cur) => ({ ...cur, paymentMethod: e.target.value }))}
                    className="ka-input font-semibold"
                    required
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                    Payment Date *
                  </span>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm((cur) => ({ ...cur, paymentDate: e.target.value }))}
                    className="ka-input"
                    required
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                    Receipt Number
                  </span>
                  <input
                    type="text"
                    value={paymentForm.receiptNumber}
                    onChange={(e) => setPaymentForm((cur) => ({ ...cur, receiptNumber: e.target.value }))}
                    className="ka-input font-mono"
                    placeholder="Auto-generated if blank"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                  Collected By / Collector Name
                </span>
                <input
                  type="text"
                  value={paymentForm.collectedBy}
                  onChange={(e) => setPaymentForm((cur) => ({ ...cur, collectedBy: e.target.value }))}
                  className="ka-input"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                  Notes
                </span>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm((cur) => ({ ...cur, notes: e.target.value }))}
                  className="ka-input"
                  placeholder="Notes or collection details"
                />
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="btn-secondary !py-2 !px-4 !text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busyAction}
                  className="btn-primary !py-2 !px-5 !text-xs cursor-pointer disabled:opacity-50"
                >
                  {busyAction ? "Saving..." : "Confirm & Save Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL 3: REVERSE / CORRECT PAYMENT (Accounting Audit Trail)
      ══════════════════════════════════════════════════════════════════════════ */}
      {isReverseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-[var(--surface)] border border-red-500/30 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
              <div className="flex items-center gap-2">
                <FiRotateCcw className="text-red-400" size={18} />
                <h3 className="font-bold text-base text-[var(--text-primary)]">
                  Reverse Payment Record
                </h3>
              </div>
              <button
                onClick={() => setIsReverseModalOpen(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleReverseSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] leading-relaxed">
                ⚠️ <strong className="font-bold">Accounting Safety Notice:</strong> Payment records cannot be silently deleted. Reversing this payment will restore the member's pending due and log the action, actor, timestamp, and reason permanently in the Samaj financial audit history.
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Member:</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {activeContribution?.member?.firstName} {activeContribution?.member?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Month / Year:</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {MONTH_NAMES[activeContribution?.month - 1]} {activeContribution?.year}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Current Paid Amount:</span>
                  <span className="font-bold text-emerald-400">₹{activeContribution?.paidAmount}</span>
                </div>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                  Reversal Reason (Mandatory) *
                </span>
                <textarea
                  rows="3"
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="ka-input !py-2 resize-none"
                  placeholder="e.g. Incorrect member selected, duplicate entry recorded, check bounced..."
                  required
                />
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsReverseModalOpen(false)}
                  className="btn-secondary !py-2 !px-4 !text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busyAction}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-red-500/30 bg-red-500 text-white font-bold text-xs px-5 py-2 hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50"
                >
                  {busyAction ? "Reversing..." : "Confirm Reversal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL 4: FULL MEMBER CONTRIBUTION LEDGER (Lifetime View)
      ══════════════════════════════════════════════════════════════════════════ */}
      {isLedgerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
              <div className="flex items-center gap-2">
                <FiFileText className="text-[var(--accent-primary)]" size={18} />
                <h3 className="font-bold text-base text-[var(--text-primary)]">
                  Member Lifetime Contribution Ledger
                </h3>
              </div>
              <button
                onClick={() => setIsLedgerModalOpen(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <FiX size={18} />
              </button>
            </div>

            {ledgerLoading ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                <FiRefreshCw className="animate-spin mx-auto mb-2" size={20} />
                <span>Loading member ledger...</span>
              </div>
            ) : memberLedger ? (
              <div className="space-y-4 overflow-y-auto pr-1">
                {/* Member Header */}
                <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-base text-[var(--text-primary)]">
                      {memberLedger.member?.firstName} {memberLedger.member?.lastName}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">{memberLedger.member?.email}</p>
                    <span className="font-mono text-[11px] text-[var(--accent-primary)] font-bold">
                      SMJ-{String(memberLedger.member?._id).slice(-6).toUpperCase()}
                    </span>
                  </div>

                  {/* Summary Totals */}
                  <div className="grid grid-cols-3 gap-3 text-center text-xs border-t sm:border-t-0 sm:border-l border-[var(--border-subtle)] sm:pl-4">
                    <div>
                      <span className="text-[10px] uppercase text-[var(--text-muted)] block">Total Due</span>
                      <span className="font-bold text-[var(--text-primary)]">₹{memberLedger.summary?.totalDue || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[var(--text-muted)] block">Total Paid</span>
                      <span className="font-bold text-emerald-400">₹{memberLedger.summary?.totalPaid || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[var(--text-muted)] block">Outstanding</span>
                      <span className="font-bold text-red-400">₹{memberLedger.summary?.totalOutstanding || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Ledger Table */}
                <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[var(--surface-elevated)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                        <th className="py-2.5 px-3">Month / Year</th>
                        <th className="py-2.5 px-3">Due</th>
                        <th className="py-2.5 px-3">Paid</th>
                        <th className="py-2.5 px-3">Mode</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Receipt</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {memberLedger.contributions?.map((item) => (
                        <tr key={item._id} className="hover:bg-[var(--surface-elevated)]/40">
                          <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">
                            {MONTH_NAMES[item.month - 1]} {item.year}
                          </td>
                          <td className="py-2.5 px-3">₹{item.totalPayable || item.expectedAmount}</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-400">₹{item.paidAmount || 0}</td>
                          <td className="py-2.5 px-3 uppercase text-[10px] text-[var(--text-secondary)]">
                            {item.paymentMethod || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--text-muted)]">
                            {item.paidAt
                              ? new Date(item.paidAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[10px]">
                            {item.receiptNumber ? (
                              <button
                                onClick={() => handleViewReceipt(item._id)}
                                className="text-emerald-400 hover:underline cursor-pointer"
                              >
                                {item.receiptNumber}
                              </button>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                item.status === "PAID"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : item.status === "OVERDUE"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL 5: CYCLES MANAGEMENT (View All, Open/Close)
      ══════════════════════════════════════════════════════════════════════════ */}
      {isCyclesManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
              <div className="flex items-center gap-2">
                <FiLayers className="text-[var(--accent-primary)]" size={18} />
                <h3 className="font-bold text-base text-[var(--text-primary)]">
                  Contribution Cycles Cockpit
                </h3>
              </div>
              <button
                onClick={() => setIsCyclesManagerOpen(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="overflow-y-auto pr-1 space-y-3">
              {cycles.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                  No monthly contribution cycles created yet.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                  {cycles.map((c) => (
                    <div
                      key={c._id}
                      className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--surface-elevated)]/40 hover:bg-[var(--surface-elevated)] transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[var(--text-primary)]">
                            {c.title || `${MONTH_NAMES[c.month - 1]} ${c.year}`}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              c.status === "OPEN"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-slate-500/10 text-slate-400 border border-slate-500/30"
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          Amount: ₹{c.contributionAmount} · Due Date:{" "}
                          {new Date(c.dueDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          · Late Fee: ₹{c.lateFeeAmount || 0}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase">Members</span>
                          <span className="font-bold text-[var(--text-primary)]">{c.stats?.totalMembers || c.eligibleMembersCount || 0}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase">Expected</span>
                          <span className="font-bold text-blue-400">₹{c.stats?.totalExpected || 0}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase">Collected</span>
                          <span className="font-bold text-emerald-400">₹{c.stats?.totalCollected || 0}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase">Outstanding</span>
                          <span className="font-bold text-red-400">₹{c.stats?.totalOutstanding || 0}</span>
                        </div>
                        <div>
                          <button
                            onClick={() => handleToggleCycleStatus(c)}
                            className={`btn-secondary !py-1 !px-3 !text-[11px] cursor-pointer ${
                              c.status === "OPEN"
                                ? "text-amber-400 border-amber-500/30"
                                : "text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {c.status === "OPEN" ? "Close Cycle" : "Reopen Cycle"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={activeReceipt}
      />
    </div>
  );
};

export default MonthlyContributionsAdmin;
