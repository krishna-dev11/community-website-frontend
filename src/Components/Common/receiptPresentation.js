const amountToPaise = (value) =>
  value === null || value === undefined || value === "" || !Number.isFinite(Number(value))
    ? null
    : Math.round(Number(value));

export const formatReceiptAmount = (paise) =>
  paise === null || paise === undefined
    ? "—"
    : `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function getReceiptViewData(receipt) {
  const totalAmountPaidPaise = receipt?.totalAmountPaidPaise !== undefined
    ? amountToPaise(receipt.totalAmountPaidPaise)
    : receipt?.amountPaise !== undefined
    ? amountToPaise(receipt.amountPaise)
    : receipt?.totalPaid !== undefined
    ? amountToPaise(Number(receipt.totalPaid) * 100)
    : receipt?.amountRupees !== undefined
    ? amountToPaise(Number(receipt.amountRupees) * 100)
    : null;
  const coveredMonths = Array.isArray(receipt?.coveredMonths) ? receipt.coveredMonths : [];
  const contributionSubtotalPaise = receipt?.contributionSubtotalPaise !== undefined
    ? amountToPaise(receipt.contributionSubtotalPaise)
    : coveredMonths.reduce((sum, month) => sum + (Number(month.contributionPaidPaise) || 0), 0);
  const lateFineSubtotalPaise = receipt?.lateFineSubtotalPaise !== undefined
    ? amountToPaise(receipt.lateFineSubtotalPaise)
    : coveredMonths.reduce((sum, month) => sum + (Number(month.lateFinePaidPaise) || 0), 0);
  const allocationDetailsAvailable = receipt?.allocationDetailsAvailable !== undefined
    ? Boolean(receipt.allocationDetailsAvailable)
    : coveredMonths.length > 0;

  return {
    totalAmountPaidPaise,
    coveredMonths,
    contributionSubtotalPaise,
    lateFineSubtotalPaise,
    allocationDetailsAvailable,
    totalMonthsCovered: receipt?.totalMonthsCovered ?? coveredMonths.length,
    monthlyContributionPaise: receipt?.monthlyContributionPaise ?? null,
    allocationDetailsMessage: receipt?.allocationDetailsMessage
      || "Contribution allocation details are unavailable for this historical payment.",
  };
}
