import React, { useRef } from "react";
import { FiX, FiPrinter, FiCheckCircle, FiShield } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

const ReceiptModal = ({ isOpen, onClose, receipt }) => {
  const receiptRef = useRef();

  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = receipt.paymentDate
    ? new Date(receipt.paymentDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:my-0 print:w-full print:max-w-none">
        {/* Header / Actions (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] print:hidden">
          <div className="flex items-center gap-2">
            <FiShield className="text-[var(--accent-primary)]" size={18} />
            <span className="font-bold text-sm text-[var(--text-primary)]">Official Contribution Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-secondary !py-1.5 !px-3 !text-xs flex items-center gap-1.5 cursor-pointer"
              title="Print Receipt"
            >
              <FiPrinter size={13} />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div ref={receiptRef} className="p-6 sm:p-8 bg-white text-slate-900 font-sans print:p-6">
          {/* Samaj Header */}
          <div className="text-center pb-5 border-b-2 border-slate-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mb-2">
              <span className="font-bold text-lg">ॐ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              श्री हल्बा / हल्बी समाज
            </h2>
            <p className="text-xs text-slate-600 font-medium tracking-wide uppercase mt-0.5">
              Halba / Halbi Samaj Vikas Parishad • Monthly Membership Contribution
            </p>
            <div className="inline-block mt-3 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Payment Acknowledgment Receipt
            </div>
          </div>

          {/* Receipt Meta (Number & Date) */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 uppercase tracking-wider block text-[10px] font-semibold">Receipt Number</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{receipt.receiptNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 uppercase tracking-wider block text-[10px] font-semibold">Payment Date</span>
              <span className="font-semibold text-slate-800 text-sm">{formattedDate}</span>
            </div>
          </div>

          {/* Member Details */}
          <div className="py-4 border-b border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Member Name:</span>
              <span className="font-bold text-slate-900">{receipt.member?.name || "Samaj Member"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Member ID:</span>
              <span className="font-mono font-bold text-slate-800">{receipt.member?.memberId || "SMJ-MEMBER"}</span>
            </div>
            {receipt.member?.contact && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Contact:</span>
                <span className="text-slate-700 font-medium">{receipt.member.contact}</span>
              </div>
            )}
            {receipt.member?.email && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="text-slate-700 font-medium">{receipt.member.email}</span>
              </div>
            )}
          </div>

          {/* Billing Breakdown */}
          <div className="py-4 border-b border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-700 font-medium">
                Contribution Period:
              </span>
              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {receipt.contributionPeriod}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Base Monthly Contribution:</span>
              <span>₹{receipt.baseContribution || 60}</span>
            </div>
            {Boolean(receipt.lateFee && receipt.lateFee > 0) && (
              <div className="flex justify-between items-center text-amber-700">
                <span>Late Fee / Fine:</span>
                <span>₹{receipt.lateFee}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
              <span>Total Amount Paid:</span>
              <span className="text-emerald-700 text-base">₹{receipt.totalPaid}</span>
            </div>
          </div>

          {/* Payment & Audit Info */}
          <div className="pt-4 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold text-slate-800 uppercase">{receipt.paymentMethod || "Online"}</span>
            </div>
            {receipt.transactionId && receipt.transactionId !== "N/A" && (
              <div className="flex justify-between">
                <span>Transaction / Ref ID:</span>
                <span className="font-mono text-slate-800">{receipt.transactionId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Recorded By:</span>
              <span className="text-slate-700">{receipt.recordedBy || "Samaj System"}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <FiCheckCircle size={12} />
                <span>PAID & VERIFIED</span>
              </span>
            </div>
            {receipt.notes && (
              <div className="pt-2 text-[11px] text-slate-500 italic">
                Note: {receipt.notes}
              </div>
            )}
          </div>

          {/* Samaj Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <p className="text-[10px] text-slate-500 tracking-wide">
              This is a computer-generated official receipt issued by Shree Halba/Halbi Samaj.
            </p>
            <p className="text-[9px] text-slate-400 mt-0.5">
              Thank you for your active participation and regular monthly contribution for community welfare.
            </p>
          </div>
        </div>

        {/* Modal Footer (Hidden on print) */}
        <div className="flex justify-end gap-3 px-6 py-3 bg-[var(--surface-elevated)] border-t border-[var(--border-subtle)] print:hidden">
          <button onClick={onClose} className="btn-secondary !py-1.5 !px-4 !text-xs cursor-pointer">
            Close
          </button>
          <button onClick={handlePrint} className="btn-primary !py-1.5 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer">
            <FiPrinter size={13} />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
