import { strict as assert } from "node:assert";
import { test } from "node:test";
import { formatReceiptAmount, getReceiptViewData } from "./receiptPresentation.js";

test("presents verified ₹360 payment with its actual six allocated months", () => {
  const receipt = getReceiptViewData({
    totalAmountPaidPaise: 36000,
    monthlyContributionPaise: 6000,
    totalMonthsCovered: 6,
    allocationDetailsAvailable: true,
    contributionSubtotalPaise: 36000,
    lateFineSubtotalPaise: 0,
    coveredMonths: [
      "October 2026", "November 2026", "December 2026",
      "January 2027", "February 2027", "March 2027",
    ].map((formattedMonth) => ({
      formattedMonth,
      contributionPaidPaise: 6000,
      lateFinePaidPaise: 0,
      totalPaidPaise: 6000,
      status: "PAID_AHEAD",
    })),
  });

  assert.equal(formatReceiptAmount(receipt.totalAmountPaidPaise), "₹360.00");
  assert.equal(receipt.totalMonthsCovered, 6);
  assert.equal(receipt.coveredMonths[0].formattedMonth, "October 2026");
  assert.equal(receipt.coveredMonths[5].formattedMonth, "March 2027");
  assert.equal(receipt.contributionSubtotalPaise, 36000);
});

test("keeps legacy rupee receipt totals and safely marks missing allocations", () => {
  const receipt = getReceiptViewData({ totalPaid: 60, coveredMonths: [] });
  assert.equal(formatReceiptAmount(receipt.totalAmountPaidPaise), "₹60.00");
  assert.equal(receipt.allocationDetailsAvailable, false);
  assert.match(receipt.allocationDetailsMessage, /unavailable/);
});

