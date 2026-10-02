import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { apiConnector } from "../../services/apiConnector";
import { communityEndpoints } from "../../services/apis";
import {
  FiX,
  FiDownload,
  FiPrinter,
  FiShield,
  FiCheckCircle,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiUsers,
  FiInfo,
} from "react-icons/fi";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";

/**
 * Text wrapper helper for HTML5 Canvas
 */
function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  if (!text) return y;
  const words = String(text).split(" ");
  let line = "";
  let currentY = y;
  let linesCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
      linesCount++;
      if (linesCount >= maxLines - 1 && n < words.length - 1) {
        let truncLine = line + words.slice(n).join(" ");
        while (ctx.measureText(truncLine + "...").width > maxWidth && truncLine.length > 0) {
          truncLine = truncLine.slice(0, -1);
        }
        ctx.fillText((truncLine + "...").trim(), x, currentY);
        return currentY;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY;
}

/**
 * Standard Dimensions for Both Front & Back Cards
 * Width: 1000px, Height: 640px (Proportion: 1.5625)
 */
const CARD_WIDTH = 1000;
const CARD_HEIGHT = 640;

/**
 * 1. APPROVED FRONT SIDE CANVAS GENERATOR
 * Strictly preserves the approved visual identity, dimensions & styling.
 */
export const generateCardImage = async (cardData, verificationUrl, formattedMemberId) => {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");

  // Premium Ivory/Warm White Card Background & Clean Rounded Border
  const radius = 24;
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, radius);
  } else {
    ctx.rect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  }
  ctx.clip();

  ctx.fillStyle = "#fafaf9"; // Warm ivory/white
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Subtle forest green border
  ctx.strokeStyle = "#14532d";
  ctx.lineWidth = 3.5;
  if (typeof ctx.roundRect === "function") {
    ctx.stroke(
      new Path2D(
        `M ${radius} 0 L ${CARD_WIDTH - radius} 0 Q ${CARD_WIDTH} 0 ${CARD_WIDTH} ${radius} L ${CARD_WIDTH} ${CARD_HEIGHT - radius} Q ${CARD_WIDTH} ${CARD_HEIGHT} ${CARD_WIDTH - radius} ${CARD_HEIGHT} L ${radius} ${CARD_HEIGHT} Q 0 ${CARD_HEIGHT} 0 ${CARD_HEIGHT - radius} L 0 ${radius} Q 0 0 ${radius} 0 Z`
      )
    );
  } else {
    ctx.strokeRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  }
  ctx.restore();

  // Top Minimal Heritage Accent (Saffron -> Gold -> Green)
  ctx.fillStyle = "#ea580c"; // Saffron
  ctx.fillRect(320, 20, 120, 4);
  ctx.fillStyle = "#facc15"; // Gold
  ctx.fillRect(445, 20, 60, 4);
  ctx.fillStyle = "#16a34a"; // Green
  ctx.fillRect(510, 20, 120, 4);

  // Load and Draw Public Logo (logo.png)
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    await new Promise((resolve) => {
      logoImg.onload = resolve;
      logoImg.onerror = resolve;
      logoImg.src = "/logo.png";
    });

    // Logo background frame
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#14532d";
    ctx.lineWidth = 1.5;
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(40, 25, 75, 75, 10);
      ctx.fill();
      ctx.stroke();
    }
    ctx.drawImage(logoImg, 48, 33, 59, 59);
  } catch (e) {}

  // Header Organization Titles (Strictly as requested)
  ctx.textAlign = "left";
  ctx.font = "900 21px sans-serif";
  ctx.fillStyle = "#14532d"; // Forest green
  ctx.fillText("ADIVASI HALBA/HALBI SAMAJ", 132, 54);

  ctx.font = "bold 15px sans-serif";
  ctx.fillStyle = "#334155";
  ctx.fillText("KALYAN SAMITI, UJJAIN", 132, 78);

  // Subtle horizontal header line
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(40, 115);
  ctx.lineTo(CARD_WIDTH - 40, 115);
  ctx.stroke();

  // Load and draw Member Photograph
  const photoUrl =
    cardData.photo ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cardData.name || "Member")}`;

  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
      img.src = photoUrl;
    });

    ctx.strokeStyle = "#14532d";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 142, 190, 245);
    ctx.drawImage(img, 42, 144, 186, 241);
  } catch (e) {}

  // Center Member Information Section
  ctx.textAlign = "left";

  // NAME
  ctx.fillStyle = "#475569";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("NAME / नाम:", 260, 165);
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 27px sans-serif";
  ctx.fillText(cardData.name || "MEMBER NAME", 260, 200);

  // MEMBER ID
  ctx.fillStyle = "#475569";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("MEMBER ID / आईडी:", 260, 244);
  ctx.fillStyle = "#ea580c"; // Brand accent color for ID
  ctx.font = "bold 22px monospace";
  ctx.fillText(formattedMemberId, 260, 276);

  // ISSUED DATE
  ctx.fillStyle = "#475569";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("ISSUED DATE / जारी तिथि:", 260, 322);
  ctx.fillStyle = "#334155";
  ctx.font = "15px sans-serif";
  const issueDate = cardData.issuedAt
    ? new Date(cardData.issuedAt).toLocaleDateString("en-IN")
    : "22/09/2026";
  ctx.fillText(issueDate, 260, 348);

  // Load and draw QR Code from API directly into Canvas
  try {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
      verificationUrl
    )}`;
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    await new Promise((resolve) => {
      qrImg.onload = resolve;
      qrImg.onerror = resolve;
      qrImg.src = qrApiUrl;
    });

    // QR Code Container Box
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(CARD_WIDTH - 240, 142, 195, 245, 10);
      ctx.fill();
      ctx.stroke();
    }

    ctx.drawImage(qrImg, CARD_WIDTH - 220, 155, 155, 155);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SCAN TO VERIFY", CARD_WIDTH - 142, 342);

    ctx.fillStyle = "#64748b";
    ctx.font = "9px sans-serif";
    ctx.fillText("MEMBERSHIP VERIFICATION", CARD_WIDTH - 142, 360);
  } catch (e) {}

  // Bottom Footer Divider Line
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(40, 515);
  ctx.lineTo(CARD_WIDTH - 40, 515);
  ctx.stroke();

  // Bottom Identity Slogan ("समाज की पहचान, हमारा अधिकार")
  ctx.textAlign = "center";
  ctx.fillStyle = "#ea580c"; // Saffron highlight on "समाज"
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("समाज", CARD_WIDTH / 2 - 120, 568);
  ctx.fillStyle = "#14532d";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("की पहचान, हमारा अधिकार", CARD_WIDTH / 2 + 15, 568);

  return canvas.toDataURL("image/png");
};

/**
 * 2. PROFESSIONAL BACK SIDE CANVAS GENERATOR
 * EXACT SAME DIMENSIONS (1000x640) as front side!
 * Right column dedicated fully to family members so 8-10 members fit with FULL NAMES.
 * Verification section moved into left column below address for maximum space efficiency.
 */
export const generateCardBackImage = async (cardData, verificationUrl, formattedMemberId) => {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");

  // Premium Ivory/Warm White Card Background & Clean Rounded Border
  const radius = 24;
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, radius);
  } else {
    ctx.rect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  }
  ctx.clip();

  ctx.fillStyle = "#fafaf9"; // Warm ivory/white
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Subtle forest green border
  ctx.strokeStyle = "#14532d";
  ctx.lineWidth = 3.5;
  if (typeof ctx.roundRect === "function") {
    ctx.stroke(
      new Path2D(
        `M ${radius} 0 L ${CARD_WIDTH - radius} 0 Q ${CARD_WIDTH} 0 ${CARD_WIDTH} ${radius} L ${CARD_WIDTH} ${CARD_HEIGHT - radius} Q ${CARD_WIDTH} ${CARD_HEIGHT} ${CARD_WIDTH - radius} ${CARD_HEIGHT} L ${radius} ${CARD_HEIGHT} Q 0 ${CARD_HEIGHT} 0 ${CARD_HEIGHT - radius} L 0 ${radius} Q 0 0 ${radius} 0 Z`
      )
    );
  } else {
    ctx.strokeRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  }
  ctx.restore();

  // Top Minimal Heritage Accent (Saffron -> Gold -> Green)
  ctx.fillStyle = "#ea580c";
  ctx.fillRect(320, 20, 120, 4);
  ctx.fillStyle = "#facc15";
  ctx.fillRect(445, 20, 60, 4);
  ctx.fillStyle = "#16a34a";
  ctx.fillRect(510, 20, 120, 4);

  // Load and Draw Public Logo (logo.png)
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    await new Promise((resolve) => {
      logoImg.onload = resolve;
      logoImg.onerror = resolve;
      logoImg.src = "/logo.png";
    });

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#14532d";
    ctx.lineWidth = 1.5;
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(40, 25, 75, 75, 10);
      ctx.fill();
      ctx.stroke();
    }
    ctx.drawImage(logoImg, 48, 33, 59, 59);
  } catch (e) {}

  // Header Organization Titles
  ctx.textAlign = "left";
  ctx.font = "900 20px sans-serif";
  ctx.fillStyle = "#14532d";
  ctx.fillText("ADIVASI HALBA/HALBI SAMAJ", 132, 52);

  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = "#334155";
  ctx.fillText("KALYAN SAMITI, UJJAIN", 132, 74);

  // Community Tagline
  ctx.font = "bold 10.5px sans-serif";
  ctx.fillStyle = "#ea580c";
  ctx.fillText("GARV SE KAHO HUM ADIVASI HAI, BHARAT KE MUL NIWASI HAI", 132, 95);

  // Header Divider Line
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(40, 115);
  ctx.lineTo(CARD_WIDTH - 40, 115);
  ctx.stroke();

  // =========================================================
  // LEFT COLUMN: Member Identification, Address & Verification Rules
  // =========================================================
  const leftBoxX = 40;
  const leftBoxY = 125;
  const leftBoxW = 440;
  const leftBoxH = 375;

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.5;
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(leftBoxX, leftBoxY, leftBoxW, leftBoxH, 12);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillRect(leftBoxX, leftBoxY, leftBoxW, leftBoxH);
    ctx.strokeRect(leftBoxX, leftBoxY, leftBoxW, leftBoxH);
  }

  // Section Header: Member Details
  ctx.fillStyle = "#14532d";
  ctx.font = "900 12px sans-serif";
  ctx.fillText("MEMBER IDENTIFICATION / सदस्य पहचान", leftBoxX + 16, leftBoxY + 24);

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftBoxX + 16, leftBoxY + 32);
  ctx.lineTo(leftBoxX + leftBoxW - 16, leftBoxY + 32);
  ctx.stroke();

  // Member ID
  ctx.fillStyle = "#64748b";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("Member ID / सदस्य क्र.:", leftBoxX + 16, leftBoxY + 52);
  ctx.fillStyle = "#ea580c";
  ctx.font = "bold 14px monospace";
  ctx.fillText(formattedMemberId, leftBoxX + 170, leftBoxY + 52);

  // Status
  ctx.fillStyle = "#64748b";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("Status / स्थिति:", leftBoxX + 16, leftBoxY + 75);
  ctx.fillStyle = "#16a34a";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText(
    cardData.status === "ACTIVE" ? "✓ VERIFIED ACTIVE" : cardData.status || "ACTIVE",
    leftBoxX + 170,
    leftBoxY + 75
  );

  // Contact Number
  ctx.fillStyle = "#64748b";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("Contact / संपर्क:", leftBoxX + 16, leftBoxY + 98);
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText(cardData.phone || "Not Provided", leftBoxX + 170, leftBoxY + 98);

  // Email
  ctx.fillStyle = "#64748b";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("Email / ईमेल:", leftBoxX + 16, leftBoxY + 121);
  ctx.fillStyle = "#0f172a";
  ctx.font = "11.5px sans-serif";
  const emailText = cardData.email || "Not Provided";
  ctx.fillText(emailText, leftBoxX + 170, leftBoxY + 121);

  // Address Subheader
  ctx.fillStyle = "#14532d";
  ctx.font = "900 12px sans-serif";
  ctx.fillText("PERMANENT ADDRESS / स्थायी पता", leftBoxX + 16, leftBoxY + 155);

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftBoxX + 16, leftBoxY + 163);
  ctx.lineTo(leftBoxX + leftBoxW - 16, leftBoxY + 163);
  ctx.stroke();

  ctx.fillStyle = "#1e293b";
  ctx.font = "11.5px sans-serif";
  const addressText =
    cardData.address || "Registered Samaj Member, Ujjain, Madhya Pradesh";
  wrapCanvasText(ctx, addressText, leftBoxX + 16, leftBoxY + 185, leftBoxW - 32, 19, 3);

  // Verification Box (Inside left column at bottom)
  const vBoxX = leftBoxX + 14;
  const vBoxY = leftBoxY + 248;
  const vBoxW = leftBoxW - 28;
  const vBoxH = 112;

  ctx.fillStyle = "#f0fdf4";
  ctx.strokeStyle = "#86efac";
  ctx.lineWidth = 1;
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(vBoxX, vBoxY, vBoxW, vBoxH, 8);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillRect(vBoxX, vBoxY, vBoxW, vBoxH);
    ctx.strokeRect(vBoxX, vBoxY, vBoxW, vBoxH);
  }

  ctx.fillStyle = "#14532d";
  ctx.font = "900 11px sans-serif";
  ctx.fillText("MEMBERSHIP VERIFICATION / सदस्यता सत्यापन", vBoxX + 12, vBoxY + 20);

  ctx.fillStyle = "#334155";
  ctx.font = "10.5px sans-serif";
  ctx.fillText("• Scan front QR code for instant smartphone verification.", vBoxX + 12, vBoxY + 42);
  ctx.fillText("• Valid only while membership status is ACTIVE.", vBoxX + 12, vBoxY + 63);
  ctx.fillText("• Official community identity document for Samaj welfare.", vBoxX + 12, vBoxY + 84);
  ctx.fillText("• For updates or inquiries, contact Samaj Helpline.", vBoxX + 12, vBoxY + 104);

  // =========================================================
  // RIGHT COLUMN: FAMILY MEMBERS (Full Height to Fit 8-10 Members!)
  // =========================================================
  const rightBoxX = 500;
  const rightBoxY = 125;
  const rightBoxW = 460;
  const rightBoxH = 375;

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.5;
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(rightBoxX, rightBoxY, rightBoxW, rightBoxH, 12);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillRect(rightBoxX, rightBoxY, rightBoxW, rightBoxH);
    ctx.strokeRect(rightBoxX, rightBoxY, rightBoxW, rightBoxH);
  }

  // Section Header: Family Members
  ctx.fillStyle = "#14532d";
  ctx.font = "900 12px sans-serif";
  ctx.fillText("FAMILY MEMBERS / परिवार के सदस्य", rightBoxX + 16, rightBoxY + 24);

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rightBoxX + 16, rightBoxY + 32);
  ctx.lineTo(rightBoxX + rightBoxW - 16, rightBoxY + 32);
  ctx.stroke();

  const familyList = Array.isArray(cardData.familyMembers) ? cardData.familyMembers : [];
  if (familyList.length > 0) {
    // Show up to 8 members with comfortable spacing
    const maxVisible = 8;
    const showMembers = familyList.slice(0, maxVisible);
    const rowHeight = familyList.length > 6 ? 34 : 38;
    let curY = rightBoxY + 54;

    showMembers.forEach((fm, idx) => {
      // Alternating row background for crystal clear reading
      if (idx % 2 === 0) {
        ctx.fillStyle = "#f8fafc";
        if (typeof ctx.roundRect === "function") {
          ctx.beginPath();
          ctx.roundRect(rightBoxX + 10, curY - 18, rightBoxW - 20, rowHeight - 6, 6);
          ctx.fill();
        } else {
          ctx.fillRect(rightBoxX + 10, curY - 18, rightBoxW - 20, rowHeight - 6);
        }
      }

      // Member Name (full name, bold, no truncation)
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 12.5px sans-serif";
      const nameText = `${idx + 1}. ${fm.name || "Member"}`;
      ctx.fillText(nameText, rightBoxX + 18, curY);

      // Relationship Tag (on the right)
      ctx.textAlign = "right";
      ctx.fillStyle = "#15803d";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`(${fm.relationship || "FAMILY"})`, rightBoxX + rightBoxW - 22, curY);
      ctx.textAlign = "left";

      curY += rowHeight;
    });

    if (familyList.length > maxVisible) {
      ctx.fillStyle = "#ea580c";
      ctx.font = "italic 11px sans-serif";
      ctx.fillText(
        `+ ${familyList.length - maxVisible} more member(s) listed in Member Dashboard`,
        rightBoxX + 18,
        curY + 2
      );
    }
  } else {
    ctx.fillStyle = "#64748b";
    ctx.font = "italic 12px sans-serif";
    ctx.fillText("Registered Family Head / Sole Member Record", rightBoxX + 18, rightBoxY + 60);
    ctx.fillText("All recognized family members appear automatically.", rightBoxX + 18, rightBoxY + 84);
  }

  // =========================================================
  // BOTTOM FOOTER: SAMAJ CONTACT & DISCLAIMER
  // =========================================================
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(40, 515);
  ctx.lineTo(CARD_WIDTH - 40, 515);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#14532d";
  ctx.font = "900 12.5px sans-serif";
  ctx.fillText("ADIVASI HALBA/HALBI SAMAJ KALYAN SAMITI, UJJAIN", CARD_WIDTH / 2, 545);

  ctx.fillStyle = "#334155";
  ctx.font = "11px sans-serif";
  ctx.fillText(
    "Helpline: +91 9926018058  |  Email: halbahalbiujjain79@gmail.com  |  Web: halbahalbisamaj.vercel.app",
    CARD_WIDTH / 2,
    570
  );

  ctx.fillStyle = "#64748b";
  ctx.font = "italic 10px sans-serif";
  ctx.fillText(
    "This card is the property of ADIVASI HALBA/HALBI SAMAJ KALYAN SAMITI, UJJAIN. Misuse or alteration is prohibited.",
    CARD_WIDTH / 2,
    594
  );

  return canvas.toDataURL("image/png");
};

const MembershipCardModal = ({ isOpen, onClose }) => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [error, setError] = useState(null);
  const [activeSide, setActiveSide] = useState("front"); // "front" | "back"
  const cardRef = useRef(null);

  const getEffectiveMemberId = (data) => {
    const raw = data?.memberId || user?.memberId;
    if (!raw) return "SMJ-MEMBER";
    const str = String(raw).trim();
    if (str.toUpperCase().startsWith("SMJ-")) return str.toUpperCase();
    return `SMJ-${str.slice(-6).toUpperCase()}`;
  };

  useEffect(() => {
    if (!isOpen) return;

    async function fetchCard() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiConnector(
          "GET",
          communityEndpoints.MEMBERSHIP_CARD_API,
          null,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
          }
        );
        if (res?.data?.success && res?.data?.data?.card) {
          setCardData(res.data.data.card);
        } else {
          setError(res?.data?.message || "Failed to fetch membership card");
        }
      } catch (err) {
        console.error("Fetch card error:", err);
        setError(
          err?.response?.data?.message ||
            "Membership card is currently available only for approved ACTIVE members."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCard();
  }, [isOpen, token]);

  const effectiveId = getEffectiveMemberId(cardData);
  const verificationUrl =
    cardData?.verifyUrl ||
    `${window.location.origin}/verify/member/${cardData?.verificationToken || effectiveId}`;
  const formattedMemberId = effectiveId;

  /**
   * 2-Page Standard Landscape PDF containing FRONT (Page 1) and BACK (Page 2)
   * EXACT SAME DIMENSIONS, EXACT SAME MARGINS, AND CROP MARKS ON BOTH PAGES!
   */
  const handleDownloadCard = async () => {
    if (!cardData) return;
    try {
      setDownloading(true);
      const frontBase64 = await generateCardImage(cardData, verificationUrl, formattedMemberId);
      const backBase64 = await generateCardBackImage(cardData, verificationUrl, formattedMemberId);

      // Standard A6 landscape format (148mm x 105mm)
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [148, 105],
      });

      // Card Dimensions: 140mm x 89.6mm (matching 1000:640 aspect ratio)
      const cardW = 140;
      const cardH = 89.6;
      const marginX = 4;
      const marginY = 7.7;

      const addCropMarks = () => {
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineWidth(0.2);
        // top-left
        pdf.line(marginX - 3, marginY, marginX, marginY);
        pdf.line(marginX, marginY - 3, marginX, marginY);
        // top-right
        pdf.line(marginX + cardW, marginY, marginX + cardW + 3, marginY);
        pdf.line(marginX + cardW, marginY - 3, marginX + cardW, marginY);
        // bottom-left
        pdf.line(marginX - 3, marginY + cardH, marginX, marginY + cardH);
        pdf.line(marginX, marginY + cardH, marginX, marginY + cardH + 3);
        // bottom-right
        pdf.line(marginX + cardW, marginY + cardH, marginX + cardW + 3, marginY + cardH);
        pdf.line(marginX + cardW, marginY + cardH, marginX + cardW + 3);
      };

      // Page 1: FRONT SIDE
      pdf.addImage(frontBase64, "PNG", marginX, marginY, cardW, cardH);
      addCropMarks();

      // Page 2: BACK SIDE (EXACT IDENTICAL DIMENSIONS)
      pdf.addPage([148, 105], "landscape");
      pdf.addImage(backBase64, "PNG", marginX, marginY, cardW, cardH);
      addCropMarks();

      const cleanName = (cardData?.name || "Member").replace(/\s+/g, "_");
      pdf.save(`Adivasi_Halba_Halbi_Samaj_ID_${cleanName}.pdf`);
      toast.success("Front & Back Membership Card PDF downloaded successfully!");
    } catch (err) {
      console.error("Download card error:", err);
      toast.error("Failed to generate PDF. Try printing instead.");
    } finally {
      setDownloading(false);
    }
  };

  /**
   * Print / PVC Lamination sheet
   */
  const handlePrint = async () => {
    if (!cardData) return;
    try {
      setPrinting(true);
      const frontBase64 = await generateCardImage(cardData, verificationUrl, formattedMemberId);
      const backBase64 = await generateCardBackImage(cardData, verificationUrl, formattedMemberId);

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        window.print();
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print ID Card - ${cardData?.name || "Member"}</title>
            <style>
              @page { size: A4 portrait; margin: 10mm; }
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #ffffff; margin: 0; padding: 15px; color: #1e293b; }
              .header { text-align: center; border-bottom: 2px solid #14532d; padding-bottom: 12px; margin-bottom: 25px; }
              .header h1 { font-size: 18px; color: #14532d; margin: 0 0 4px 0; text-transform: uppercase; }
              .header p { font-size: 12px; color: #64748b; margin: 0; }
              .sheet-container { display: flex; flex-direction: column; gap: 30px; align-items: center; justify-content: center; }
              .card-wrapper { position: relative; border: 1.5px dashed #94a3b8; padding: 12px; border-radius: 8px; background: #fdfdfd; }
              .cut-badge { position: absolute; top: -10px; left: 20px; background: #ffffff; padding: 0 10px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
              .card-img { width: 85.6mm; height: 54.78mm; display: block; border-radius: 3.5mm; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
              .print-guide { margin-top: 25px; padding: 12px 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11.5px; color: #475569; max-width: 480px; margin-left: auto; margin-right: auto; }
              .print-guide h4 { margin: 0 0 6px 0; color: #14532d; font-size: 12px; }
              .print-guide ul { margin: 0; padding-left: 18px; line-height: 1.5; }
              @media print {
                body { padding: 0; }
                .card-wrapper { border: 1.5px dashed #64748b; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain</h1>
              <p>Official Digital Membership Card — PVC Printing & Lamination Sheet</p>
            </div>
            <div class="sheet-container">
              <div class="card-wrapper">
                <span class="cut-badge">✂ FRONT SIDE — कटिंग रेखा (CUT HERE)</span>
                <img src="${frontBase64}" class="card-img" alt="Front Side" />
              </div>
              <div class="card-wrapper">
                <span class="cut-badge">✂ BACK SIDE — कटिंग रेखा (CUT HERE)</span>
                <img src="${backBase64}" class="card-img" alt="Back Side" />
              </div>
            </div>
            <div class="print-guide">
              <h4>Printing & PVC Lamination Guidelines:</h4>
              <ul>
                <li>Print at <strong>100% scale</strong> (do NOT select "Fit to page").</li>
                <li>Both sides are rendered at standard CR80 physical card dimensions (85.60 mm × 54.78 mm).</li>
                <li>Cut along the dashed lines for physical lamination or PVC plastic card printing.</li>
                <li>Scan the front QR code with any smartphone camera to verify live membership.</li>
              </ul>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } catch (e) {
      console.error("Print card error:", e);
      window.print();
    } finally {
      setPrinting(false);
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[2600] flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto overflow-x-hidden ka-card p-4 sm:p-6 md:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)] my-auto rounded-2xl border border-slate-700 bg-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 sm:right-5 sm:top-5 z-25 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 transition-all hover:bg-slate-700 hover:text-white cursor-pointer"
        >
          <FiX size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-4 sm:mb-6 flex items-center gap-3 pr-10">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <FiShield size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white truncate">
              Official Community Membership ID Card
            </h2>
            <p className="text-[11px] sm:text-xs text-emerald-400 font-medium truncate">
              Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-emerald-400 border-t-transparent" />
            <p className="text-xs text-slate-400">Loading verified membership card...</p>
          </div>
        ) : error || !cardData ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/5 p-6 sm:p-8 text-center">
            <p className="text-sm font-bold text-red-400">{error || "Card not available."}</p>
            <p className="mt-2 text-xs text-slate-400">
              Official membership cards are generated automatically once your application is approved and verified by the Super Admin.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            {/* Front / Back Preview Toggle Switch */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveSide("front")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeSide === "front"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30 ring-2 ring-emerald-400/50"
                    : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                }`}
              >
                🪪 Front Side / मुख्य पृष्ठ
              </button>
              <button
                type="button"
                onClick={() => setActiveSide("back")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeSide === "back"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30 ring-2 ring-emerald-400/50"
                    : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                }`}
              >
                🔄 Back Side / पृष्ठ भाग
              </button>
            </div>

            {/* ========================================================= */}
            {/* FRONT SIDE PREVIEW (Strictly Preserves Approved Design) */}
            {/* ========================================================= */}
            {activeSide === "front" && (
              <div
                ref={cardRef}
                data-membership-card="true"
                className="w-full min-h-[360px] sm:min-h-[380px] rounded-2xl p-4 sm:p-6 relative overflow-hidden text-slate-900 shadow-2xl border-2 border-emerald-900/30 bg-[#fafaf9] transition-all flex flex-col justify-between"
              >
                {/* Top Header Section */}
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "12px",
                    borderBottom: "1.5px solid #cbd5e1",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1.5px solid #14532d",
                        backgroundColor: "#ffffff",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src="/logo.png"
                        alt="Samaj Logo"
                        style={{ width: "38px", height: "38px", objectFit: "contain" }}
                      />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: "13px",
                          fontWeight: "900",
                          textTransform: "uppercase",
                          color: "#14532d",
                          lineHeight: 1.2,
                          letterSpacing: "0.02em",
                        }}
                      >
                        ADIVASI HALBA/HALBI SAMAJ
                      </h3>
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          color: "#334155",
                          marginTop: "2px",
                        }}
                      >
                        KALYAN SAMITI, UJJAIN
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      borderRadius: "999px",
                      padding: "4px 10px",
                      fontSize: "9px",
                      fontWeight: "900",
                      textTransform: "uppercase",
                      color: "#15803d",
                      border: "1px solid #bbf7d0",
                      backgroundColor: "#f0fdf4",
                    }}
                  >
                    <FiCheckCircle size={11} /> Verified Active
                  </div>
                </div>

                {/* Card Body Grid Layout */}
                <div className="relative mt-4 sm:mt-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                  {/* Member Photo & Details */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 flex-1 min-w-0 w-full sm:w-auto">
                    <div className="relative shrink-0 p-1 bg-white rounded-lg border-2 border-emerald-900/30 shadow-sm">
                      <img
                        src={
                          cardData.photo ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                            cardData.name || "Member"
                          )}`
                        }
                        alt={cardData.name}
                        crossOrigin="anonymous"
                        className="w-20 h-24 sm:w-24 sm:h-28 rounded object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Name / नाम
                        </span>
                        <h4
                          className="text-base sm:text-lg font-black leading-tight truncate"
                          style={{ color: "#0f172a" }}
                        >
                          {cardData.name}
                        </h4>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Member ID / आईडी
                        </span>
                        <p className="font-mono text-xs sm:text-sm font-extrabold text-orange-600">
                          {formattedMemberId}
                        </p>
                      </div>

                      <div className="text-[10px] text-slate-500 mt-0.5">
                        <span className="font-semibold">Issued Date / जारी तिथि:</span>{" "}
                        <span className="text-slate-700">
                          {cardData.issuedAt
                            ? new Date(cardData.issuedAt).toLocaleDateString("en-IN")
                            : "22/09/2026"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Container UI (Points to secure verification token) */}
                  <div className="flex flex-col items-center rounded-xl p-2.5 bg-white border border-slate-300 shadow-sm shrink-0 self-center sm:self-auto">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        verificationUrl
                      )}`}
                      alt="Verification QR"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded"
                    />
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-900 mt-1.5">
                      SCAN TO VERIFY
                    </span>
                    <span className="text-[7px] font-medium text-slate-500">
                      MEMBERSHIP VERIFICATION
                    </span>
                  </div>
                </div>

                {/* Card Footer Tagline */}
                <div className="relative mt-4 sm:mt-5 flex items-center justify-center pt-3 border-t border-slate-200 text-center">
                  <span className="text-[11px] font-extrabold text-slate-900 tracking-wide">
                    <span className="text-orange-600">समाज</span> की पहचान, हमारा अधिकार
                  </span>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* BACK SIDE PREVIEW (Expanded Family Members List - Full Names!) */}
            {/* ========================================================= */}
            {activeSide === "back" && (
              <div
                className="w-full min-h-[360px] sm:min-h-[380px] rounded-2xl p-4 sm:p-6 relative overflow-hidden text-slate-900 shadow-2xl border-2 border-emerald-900/30 bg-[#fafaf9] transition-all flex flex-col justify-between"
              >
                {/* Top Header Section */}
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "10px",
                    borderBottom: "1.5px solid #cbd5e1",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1.5px solid #14532d",
                        backgroundColor: "#ffffff",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src="/logo.png"
                        alt="Samaj Logo"
                        style={{ width: "32px", height: "32px", objectFit: "contain" }}
                      />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: "12px",
                          fontWeight: "900",
                          textTransform: "uppercase",
                          color: "#14532d",
                          lineHeight: 1.2,
                        }}
                      >
                        ADIVASI HALBA/HALBI SAMAJ
                      </h3>
                      <p
                        style={{
                          fontSize: "9.5px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          color: "#334155",
                        }}
                      >
                        KALYAN SAMITI, UJJAIN
                      </p>
                      <p
                        style={{
                          fontSize: "8.5px",
                          fontWeight: "700",
                          color: "#ea580c",
                          fontStyle: "italic",
                        }}
                      >
                        गर्व से कहो हम आदिवासी हैं, भारत के मूल निवासी हैं
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-black text-orange-600 block">
                      {formattedMemberId}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active Member
                    </span>
                  </div>
                </div>

                {/* Back Side Two-Column Details Layout */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {/* Left Column: Member ID, Contact, Address & Verification Note */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-900 uppercase tracking-wider mb-1.5 border-b border-slate-100 pb-1">
                        <FiUser size={12} className="text-emerald-700" />
                        <span>Member Identification</span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Contact / फोन:</span>
                          <span className="font-bold text-slate-800">{cardData.phone || "Not Provided"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Email / ईमेल:</span>
                          <span className="font-medium text-slate-800 text-[10.5px]">
                            {cardData.email || "Not Provided"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-900 uppercase tracking-wider mb-1">
                        <FiMapPin size={12} className="text-emerald-700" />
                        <span>Registered Address / स्थायी पता</span>
                      </div>
                      <p className="text-[10.5px] text-slate-700 leading-tight">
                        {cardData.address || "Registered Samaj Member, Ujjain, Madhya Pradesh"}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 bg-emerald-50/60 p-2 rounded-lg border border-emerald-200/50">
                      <div className="flex items-center gap-1 text-[9.5px] font-black text-emerald-900 uppercase">
                        <FiInfo size={11} className="text-emerald-700" />
                        <span>Verification Rule / सत्यापन</span>
                      </div>
                      <p className="text-[9px] text-slate-700 mt-0.5 leading-snug">
                        Scan front QR code for live instant verification. Valid while status is ACTIVE.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Complete Family Members List (Full Names, No Truncation!) */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-black text-emerald-900 uppercase tracking-wider mb-1.5 border-b border-slate-100 pb-1">
                        <div className="flex items-center gap-1.5">
                          <FiUsers size={12} className="text-emerald-700" />
                          <span>Family Members / परिवार</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">
                          {Array.isArray(cardData.familyMembers) ? `${cardData.familyMembers.length} Members` : ""}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[11px] max-h-[190px] overflow-y-auto pr-0.5">
                        {Array.isArray(cardData.familyMembers) && cardData.familyMembers.length > 0 ? (
                          <>
                            {cardData.familyMembers.slice(0, 8).map((fm, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center gap-2 py-0.5 px-1.5 rounded hover:bg-slate-50 transition-colors"
                              >
                                <span className="font-bold text-slate-900 text-[11px] leading-tight">
                                  {idx + 1}. {fm.name}
                                </span>
                                <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
                                  {fm.relationship || "Family"}
                                </span>
                              </div>
                            ))}
                            {cardData.familyMembers.length > 8 && (
                              <p className="text-[9.5px] font-medium text-orange-600 italic mt-1 text-center">
                                + {cardData.familyMembers.length - 8} more in Member Dashboard
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-[10px] text-slate-500 italic py-4 text-center">
                            Registered Family Head / Sole Member Record
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back Side Footer: Samaj Contact Info */}
                <div className="mt-3 pt-2 border-t border-slate-200 text-center">
                  <p className="text-[10px] font-black text-[#14532d] uppercase">
                    ADIVASI HALBA/HALBI SAMAJ KALYAN SAMITI, UJJAIN
                  </p>
                  <p className="text-[8.5px] text-slate-600 mt-0.5">
                    Helpline: +91 9926018058 | Email: halbahalbiujjain79@gmail.com | Web: halbahalbisamaj.vercel.app
                  </p>
                  <p className="text-[8px] text-slate-400 italic mt-0.5">
                    Official Samaj ID card property. Misuse or unauthorized alteration is prohibited.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                onClick={handlePrint}
                disabled={printing}
                className="btn-secondary !py-2.5 !px-4 !text-xs cursor-pointer justify-center flex items-center gap-2"
                title="Print ready-to-cut PVC sheet with front and back sides"
              >
                <FiPrinter size={14} /> {printing ? "Preparing Print..." : "Print / PVC Cut Sheet"}
              </button>

              <div className="flex items-center gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">
                <button
                  onClick={handleDownloadCard}
                  disabled={downloading}
                  className="btn-primary !py-2.5 !px-5 !text-xs cursor-pointer disabled:opacity-50 justify-center flex items-center gap-2"
                  title="Download 2-page PDF containing Front and Back sides with crop marks"
                >
                  <FiDownload size={14} /> {downloading ? "Generating PDF..." : "Download PDF (Front & Back)"}
                </button>
                <button
                  onClick={onClose}
                  className="btn-secondary !py-2.5 !px-4 !text-xs cursor-pointer justify-center"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default MembershipCardModal;