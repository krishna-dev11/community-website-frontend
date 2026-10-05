import React, { useRef } from "react";
import { FiX, FiPrinter, FiCheckCircle, FiShield } from "react-icons/fi";
import { formatReceiptAmount, getReceiptViewData } from "./receiptPresentation";
import "./ReceiptModal.css";

const monthRange = (months) => {
  if (!months.length) return "";
  const first = months[0].formattedMonth;
  const last = months[months.length - 1].formattedMonth;
  return first === last ? first : `${first} – ${last}`;
};

const statusLabel = (status) => {
  if (status === "PAID_AHEAD") return "PAID AHEAD";
  if (status === "PAID") return "PAID";
  return String(status || "ALLOCATED").replaceAll("_", " ");
};

const ReceiptModal = ({ isOpen, onClose, receipt }) => {
  const receiptRef = useRef();

  if (!isOpen || !receipt) return null;

  const receiptView = getReceiptViewData(receipt);
  const formattedDate = receipt.paymentDate || receipt.receiptDate
    ? new Date(receipt.paymentDate || receipt.receiptDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Date not recorded";
  const hasMonthAllocations = receiptView.allocationDetailsAvailable;
  const paidContributions = receiptView.coveredMonths.map((month) => month.contributionPaidPaise);
  const hasSimpleCalculation = hasMonthAllocations &&
    receiptView.lateFineSubtotalPaise === 0 &&
    paidContributions.length > 0 &&
    paidContributions.every((amount) => amount === paidContributions[0]);
  const status = receipt.displayStatus || (receipt.status === "SUCCESS" || receipt.status === "PAID"
    ? "PAID & VERIFIED"
    : String(receipt.status || "VERIFIED").replaceAll("_", " "));

  /**
   * Print / Save PDF
   *
   * IMPORTANT:
   * We intentionally do NOT call window.print() on the application page.
   * The application contains modal/scroll containers and responsive table
   * styles which can make browser printing crop, clip or split the receipt.
   *
   * Instead we create a clean print-only document containing ONLY the
   * receipt paper. This makes Chrome/Edge "Save as PDF" output predictable.
   */
  const handlePrint = () => {
    if (!receiptRef.current) return;

    const printWindow = window.open("", "_blank", "width=900,height=1200");

    if (!printWindow) {
      alert("Print window was blocked. Please allow pop-ups for this site and try again.");
      return;
    }

    /*
     * IMPORTANT:
     * Do not copy the application's Tailwind/global CSS into the print window.
     * Some application styles can hide/clamp modal content during printing.
     *
     * We create a completely isolated print document and style the receipt
     * from scratch. This prevents the blank about:blank preview problem.
     */
    const source = receiptRef.current;
    const receiptHTML = source.innerHTML;

    const safeReceiptNumber = String(receipt.receiptNumber || "Receipt")
      .replace(/[<>"'`]/g, "");

    const printStyles = `
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          min-height: 100% !important;
          background: #ffffff !important;
          color: #0f172a !important;
          font-family: Arial, Helvetica, sans-serif !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        * {
          box-sizing: border-box !important;
        }

        body {
          display: block !important;
          overflow: visible !important;
        }

        .print-page {
          width: 100% !important;
          max-width: 194mm !important;
          margin: 0 auto !important;
          padding: 0 !important;
        }

        .print-receipt-paper {
          display: block !important;
          width: 100% !important;
          max-width: 194mm !important;
          min-width: 0 !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          margin: 0 auto !important;
          padding: 0 !important;
          overflow: visible !important;
          background: #fff !important;
          color: #0f172a !important;
          font-family: Arial, Helvetica, sans-serif !important;
          font-size: 10pt !important;
          line-height: 1.4 !important;
        }

        /* Reset copied Tailwind utility classes. */
        .print-receipt-paper * {
          box-sizing: border-box !important;
          max-width: 100% !important;
        }

        .print-receipt-paper header {
          display: block !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 0 5mm !important;
          text-align: center !important;
          border-bottom: 1px solid #cbd5e1 !important;
        }

        .print-receipt-paper header > div:first-child {
          display: inline-flex !important;
          width: 12mm !important;
          height: 12mm !important;
          margin: 0 0 2mm !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 50% !important;
          background: #d1fae5 !important;
          color: #047857 !important;
        }

        .print-receipt-paper header > div:first-child span {
          font-size: 15pt !important;
          font-weight: 700 !important;
        }

        .print-receipt-paper h2 {
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
          color: #0f172a !important;
          font-size: 19pt !important;
          line-height: 1.2 !important;
          font-weight: 800 !important;
        }

        .print-receipt-paper header p {
          display: block !important;
          margin: 1.5mm auto 0 !important;
          color: #475569 !important;
          font-size: 7.5pt !important;
          line-height: 1.35 !important;
        }

        .print-receipt-paper header > div:last-child {
          display: inline-block !important;
          margin: 2.5mm 0 0 !important;
          padding: 1.2mm 3mm !important;
          border: 1px solid #86efac !important;
          border-radius: 20px !important;
          background: #ecfdf5 !important;
          color: #166534 !important;
          font-size: 7pt !important;
          font-weight: 700 !important;
        }

        .print-receipt-paper section {
          display: block !important;
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 4mm 0 !important;
          overflow: visible !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }

        /* Receipt number / date */
        .print-receipt-paper section:nth-of-type(1) {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 8mm !important;
        }

        /* Member details */
        .print-receipt-paper section:nth-of-type(2) {
          display: block !important;
        }

        .print-receipt-paper section:nth-of-type(1) > div,
        .print-receipt-paper section:nth-of-type(2) > div,
        .print-receipt-paper section:nth-of-type(6) > div {
          display: flex !important;
          width: 100% !important;
          min-width: 0 !important;
          justify-content: space-between !important;
          align-items: flex-start !important;
          gap: 5mm !important;
          margin: 0 0 2mm !important;
        }

        .print-receipt-paper section:nth-of-type(1) > div:last-child,
        .print-receipt-paper section:nth-of-type(2) > div:last-child,
        .print-receipt-paper section:nth-of-type(6) > div:last-child {
          margin-bottom: 0 !important;
        }

        .print-receipt-paper section:nth-of-type(1) > div:last-child {
          text-align: right !important;
        }

        .print-receipt-paper span,
        .print-receipt-paper p {
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }

        .print-receipt-paper section:nth-of-type(1) span,
        .print-receipt-paper section:nth-of-type(2) span {
          color: #334155 !important;
          font-size: 8.5pt !important;
        }

        .print-receipt-paper section:nth-of-type(1) span:first-child,
        .print-receipt-paper section:nth-of-type(2) span:first-child {
          color: #64748b !important;
        }

        .print-receipt-paper h3,
        .print-receipt-paper h4 {
          display: block !important;
          margin: 0 0 3mm !important;
          color: #64748b !important;
          font-size: 7pt !important;
          line-height: 1.2 !important;
          font-weight: 700 !important;
        }

        /* Total amount box */
        .print-receipt-paper section:nth-of-type(3) {
          display: block !important;
          margin: 5mm 0 !important;
          padding: 5mm !important;
          border: 1px solid #a7f3d0 !important;
          border-radius: 3mm !important;
          background: #ecfdf5 !important;
          text-align: center !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .print-receipt-paper section:nth-of-type(3) > span {
          display: block !important;
          margin-bottom: 1mm !important;
          color: #047857 !important;
          font-size: 7pt !important;
          font-weight: 700 !important;
        }

        .print-receipt-paper section:nth-of-type(3) p {
          display: block !important;
          margin: 0 !important;
          color: #064e3b !important;
          font-size: 18pt !important;
          line-height: 1.15 !important;
          font-weight: 800 !important;
        }

        /* Month-wise table wrapper */
        .print-receipt-paper .overflow-x-auto {
          display: block !important;
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          overflow: visible !important;
        }

        .print-receipt-paper table {
          display: table !important;
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          table-layout: fixed !important;
          border-collapse: collapse !important;
          margin: 0 !important;
          font-size: 7.5pt !important;
        }

        .print-receipt-paper thead {
          display: table-header-group !important;
        }

        .print-receipt-paper tbody {
          display: table-row-group !important;
        }

        .print-receipt-paper tr {
          display: table-row !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .print-receipt-paper th,
        .print-receipt-paper td {
          display: table-cell !important;
          min-width: 0 !important;
          width: auto !important;
          padding: 2mm 1.5mm !important;
          border-bottom: 0.25mm solid #e2e8f0 !important;
          vertical-align: middle !important;
          white-space: normal !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
          color: #334155 !important;
        }

        .print-receipt-paper th {
          background: #f8fafc !important;
          color: #475569 !important;
          font-size: 6.8pt !important;
          font-weight: 700 !important;
        }

        .print-receipt-paper th:nth-child(1),
        .print-receipt-paper td:nth-child(1) { width: 27% !important; text-align: left !important; }

        .print-receipt-paper th:nth-child(2),
        .print-receipt-paper td:nth-child(2) { width: 18% !important; text-align: right !important; }

        .print-receipt-paper th:nth-child(3),
        .print-receipt-paper td:nth-child(3) { width: 18% !important; text-align: right !important; }

        .print-receipt-paper th:nth-child(4),
        .print-receipt-paper td:nth-child(4) { width: 18% !important; text-align: right !important; }

        .print-receipt-paper th:nth-child(5),
        .print-receipt-paper td:nth-child(5) { width: 19% !important; text-align: right !important; }

        /* Hide helper text such as "Swipe" */
        .print-receipt-paper .sm\\:hidden {
          display: none !important;
        }

        /* Payment calculation */
        .print-receipt-paper section:nth-of-type(5) {
          margin: 4mm 0 !important;
          padding: 4mm !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 2mm !important;
          background: #f8fafc !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .print-receipt-paper section:nth-of-type(5) p,
        .print-receipt-paper section:nth-of-type(5) div {
          font-size: 8pt !important;
        }

        /* Recorded by / notes */
        .print-receipt-paper section:nth-of-type(6) {
          padding: 4mm 0 !important;
          border-top: 0 !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .print-receipt-paper footer {
          display: block !important;
          margin: 4mm 0 0 !important;
          padding: 3mm 0 0 !important;
          border-top: 1px solid #e2e8f0 !important;
          text-align: center !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .print-receipt-paper footer p {
          display: block !important;
          margin: 1mm 0 !important;
          color: #64748b !important;
          font-size: 6.8pt !important;
          line-height: 1.3 !important;
        }

        @media print {
          html, body {
            width: 100% !important;
            min-height: auto !important;
            overflow: visible !important;
          }
        }
      </style>
    `;

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contribution Receipt - ${safeReceiptNumber}</title>
          ${printStyles}
        </head>
        <body>
          <main class="print-page">
            <div class="print-receipt-paper">
              ${receiptHTML}
            </div>
          </main>
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait until the isolated document has actually rendered before opening
    // Chrome's print dialog. This avoids printing an empty about:blank page.
    const startPrint = () => {
      setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch (error) {
          console.error("Receipt print error:", error);
        }
      }, 800);
    };

    if (printWindow.document.readyState === "complete") {
      startPrint();
    } else {
      printWindow.addEventListener("load", startPrint, { once: true });
    }

    printWindow.addEventListener("afterprint", () => {
      setTimeout(() => {
        try {
          printWindow.close();
        } catch {
          // Ignore close errors.
        }
      }, 300);
    }, { once: true });
  };

  return (
    <div className="contribution-receipt-overlay fixed inset-0 z-2000 flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto print:fixed print:inset-0 print:block print:overflow-visible print:bg-white print:p-0 print:backdrop-blur-none">
      <div className="relative my-2 sm:my-8 flex w-full max-w-3xl max-h-[96dvh] flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl print:static print:my-0 print:w-full print:max-w-none print:max-h-none print:h-auto print:min-h-0 print:overflow-visible print:rounded-none print:border-none print:bg-white print:shadow-none">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-2.5 sm:px-6 sm:py-4 print:hidden">
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <FiShield className="text-[var(--accent-primary)]" size={18} />
            <span className="truncate text-[11px] font-bold text-[var(--text-primary)] sm:text-sm">Official Contribution Receipt</span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button onClick={handlePrint} className="btn-secondary !flex cursor-pointer items-center gap-1 !px-2 sm:!px-3 !py-1.5 !text-[10px] sm:!text-xs" title="Print Receipt">
              <FiPrinter size={13} />
              <span className="hidden xs:inline sm:inline">Print / Save PDF</span><span className="sm:hidden">Print</span>
            </button>
            <button onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text-primary)]" aria-label="Close receipt">
              <FiX size={18} />
            </button>
          </div>
        </div>

        <div ref={receiptRef} className="contribution-receipt-paper min-h-0 flex-1 overflow-y-auto bg-white p-3.5 font-sans text-slate-900 sm:p-10 print:static print:block print:h-auto print:min-h-0 print:max-h-none print:flex-none print:overflow-visible print:w-full print:bg-white print:p-0">
          <header className="border-b-2 border-slate-200 pb-4 text-center sm:pb-5">
            <div className="mb-1.5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 sm:mb-2 sm:h-12 sm:w-12">
              <span className="text-base font-bold sm:text-lg">ॐ</span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 sm:text-2xl">
              श्री हल्बा / हल्बी समाज
            </h2>
            <p className="mx-auto mt-1 max-w-xl text-[9px] font-medium uppercase leading-relaxed tracking-wide text-slate-600 sm:mt-0.5 sm:text-xs">
              Halba / Halbi Samaj Vikas Parishad • Monthly Membership Contribution
            </p>
            <div className="mt-2 inline-block rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-800 sm:mt-3 sm:px-3 sm:text-xs">
              Payment Acknowledgment Receipt
            </div>
          </header>

          <section className="grid grid-cols-1 gap-3 border-b border-slate-200 py-3 text-xs sm:grid-cols-2 sm:gap-4 sm:py-4">
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Receipt Number</span>
              <span className="mt-0.5 break-all font-mono text-xs font-bold text-slate-800 sm:text-sm">{receipt.receiptNumber || "Not recorded"}</span>
            </div>
            <div className="text-left sm:text-right">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Payment Date</span>
              <span className="text-xs font-semibold text-slate-800 sm:text-sm">{formattedDate}</span>
            </div>
          </section>

          <section className="space-y-2 border-b border-slate-200 py-3 text-xs sm:py-4">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Member Details</h3>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="font-medium text-slate-500">Member Name</span>
              <span className="break-words text-left font-bold text-slate-900 sm:text-right">{receipt.member?.name || receipt.payerName || "Family Head"}</span>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="font-medium text-slate-500">Member ID</span>
              <span className="break-all text-left font-mono font-bold text-slate-800 sm:text-right">{receipt.member?.memberId || receipt.payerMemberId || "Not recorded"}</span>
            </div>
            {receipt.familyName && (
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="font-medium text-slate-500">Family</span>
                <span className="break-words text-left font-bold text-slate-800 sm:text-right">{receipt.familyName}</span>
              </div>
            )}
          </section>

          <section className="my-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-center sm:my-5 sm:p-5">
            <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-800">Total Amount Paid</span>
            <strong className="mt-1 block text-4xl font-black tracking-tight text-emerald-800">
              {formatReceiptAmount(receiptView.totalAmountPaidPaise)}
            </strong>
            <div className="mt-3 flex flex-col items-center justify-center gap-1 text-[11px] text-slate-700 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:text-xs">
              <span>Payment Mode: <strong className="uppercase">{receipt.paymentMethod || "Not recorded"}</strong></span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
                <FiCheckCircle size={13} />
                {status}
              </span>
            </div>
            {(receipt.transactionId || receipt.razorpayPaymentId) && (
              <p className="mt-2 break-all text-[11px] text-slate-600">
                Transaction / Reference ID: <span className="font-mono font-semibold">{receipt.transactionId || receipt.razorpayPaymentId}</span>
              </p>
            )}
          </section>

          <section className="border-b border-slate-200 py-4">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Contribution Coverage</h3>
            {hasMonthAllocations ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-2.5 sm:p-3">
                    <span className="block text-slate-500">Monthly Contribution</span>
                    <strong className="mt-1 block text-sm text-slate-900">
                      {receiptView.monthlyContributionPaise !== null
                        ? `${formatReceiptAmount(receiptView.monthlyContributionPaise)} / month`
                        : "Varies by month"}
                    </strong>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 sm:p-3">
                    <span className="block text-slate-500">Months Covered</span>
                    <strong className="mt-1 block text-sm text-slate-900">{receiptView.totalMonthsCovered}</strong>
                  </div>
                  <div className="col-span-1 rounded-lg bg-slate-50 p-2.5 sm:col-span-1 sm:p-3">
                    <span className="block text-slate-500">Coverage Period</span>
                    <strong className="mt-1 block text-sm text-slate-900">{monthRange(receiptView.coveredMonths)}</strong>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto rounded-lg border border-slate-100 sm:mt-5">
                  <div className="flex items-center justify-between gap-2 px-2 py-1.5 sm:hidden">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Month-wise Breakdown</h4>
                    <span className="text-[9px] font-medium text-slate-400">Swipe →</span>
                  </div>
                  <h4 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Month-wise Breakdown</h4>
                  <table className="w-full min-w-[620px] border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-y border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-600">
                        <th className="px-3 py-2">Month</th>
                        <th className="px-3 py-2 text-right">Contribution</th>
                        <th className="px-3 py-2 text-right">Late Fine</th>
                        <th className="px-3 py-2 text-right">Paid</th>
                        <th className="px-3 py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receiptView.coveredMonths.map((month) => (
                        <tr key={`${month.year}-${month.month}`} className="break-inside-avoid border-b border-slate-100">
                          <td className="px-3 py-2 font-semibold text-slate-800">{month.formattedMonth}</td>
                          <td className="px-3 py-2 text-right text-slate-700">{formatReceiptAmount(month.contributionPaidPaise)}</td>
                          <td className="px-3 py-2 text-right text-slate-700">{formatReceiptAmount(month.lateFinePaidPaise)}</td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900">{formatReceiptAmount(month.totalPaidPaise)}</td>
                          <td className="px-3 py-2 text-right text-[10px] font-bold text-emerald-700">{statusLabel(month.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-slate-900">
                  {receipt.contributionPeriod || receipt.periodCovered || "Historical contribution"}
                </p>
                {!receipt.contributionPeriod && !receipt.periodCovered && (
                  <p className="mt-1 text-xs text-slate-600">{receiptView.allocationDetailsMessage}</p>
                )}
                {receipt.baseContribution !== undefined && (
                  <div className="mt-3 flex justify-between text-xs text-slate-700">
                    <span>Base Monthly Contribution</span>
                    <span>{formatReceiptAmount(Number(receipt.baseContribution) * 100)}</span>
                  </div>
                )}
                {Number(receipt.lateFee) > 0 && (
                  <div className="mt-2 flex justify-between text-xs text-amber-700">
                    <span>Late Fee / Fine</span>
                    <span>{formatReceiptAmount(Number(receipt.lateFee) * 100)}</span>
                  </div>
                )}
              </>
            )}
          </section>

          {hasMonthAllocations && (
            <section className="my-4 rounded-lg border border-slate-200 p-3 sm:p-4">
              <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Payment Calculation</h3>
              {hasSimpleCalculation ? (
                <p className="text-sm font-bold text-slate-800">
                  {receiptView.totalMonthsCovered} Months × {formatReceiptAmount(paidContributions[0])} = {formatReceiptAmount(receiptView.totalAmountPaidPaise)}
                </p>
              ) : (
                <div className="space-y-1 text-xs text-slate-700">
                  <div className="flex justify-between"><span>Contribution Subtotal</span><strong>{formatReceiptAmount(receiptView.contributionSubtotalPaise)}</strong></div>
                  <div className="flex justify-between"><span>Fine Subtotal</span><strong>{formatReceiptAmount(receiptView.lateFineSubtotalPaise)}</strong></div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900"><span>Total Paid</span><strong>{formatReceiptAmount(receiptView.totalAmountPaidPaise)}</strong></div>
                </div>
              )}
            </section>
          )}

          <section className="space-y-2 border-t border-slate-200 pt-3 text-xs text-slate-600 sm:pt-4">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span>Recorded By</span>
              <span className="text-right font-medium text-slate-800">{receipt.recordedBy || "Samaj System"}</span>
            </div>
            {receipt.notes && <p className="pt-2 text-[11px] italic text-slate-500">Note: {receipt.notes}</p>}
          </section>

          <footer className="mt-4 border-t border-slate-200 pt-3 text-center sm:mt-6 sm:pt-4">
            <p className="text-[9px] leading-relaxed tracking-wide text-slate-500 sm:text-[10px]">This is a computer-generated official receipt issued by Shree Halba/Halbi Samaj.</p>
            <p className="mt-0.5 text-[8px] text-slate-400 sm:text-[9px]">No signature required.</p>
          </footer>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-2.5 sm:flex-row sm:justify-end sm:gap-3 sm:px-6 sm:py-3 print:hidden">
          <button onClick={onClose} className="btn-secondary !flex !w-full !cursor-pointer !justify-center !px-4 !py-2 !text-xs sm:!w-auto sm:!py-1.5">Close</button>
          <button onClick={handlePrint} className="btn-primary !flex !w-full !cursor-pointer !justify-center items-center gap-1.5 !px-4 !py-2 !text-xs sm:!w-auto sm:!py-1.5">
            <FiPrinter size={13} />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
