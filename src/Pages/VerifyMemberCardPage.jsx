import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { communityEndpoints } from "../services/apis";
import {
  FiCheckCircle,
  FiXCircle,
  FiShield,
  FiArrowLeft,
  FiAlertTriangle,
  FiUser,
  FiCalendar,
  FiAward,
} from "react-icons/fi";

function isVerificationToken(str) {
  return /^[0-9a-f]{96}$/i.test(str);
}

const VerifyMemberCardPage = () => {
  // Supports both /verify/member/:token (new) and /verify-member/:memberId (legacy)
  const { memberId, token: tokenParam } = useParams();
  const identifier = tokenParam || memberId;

  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState(null);
  const [verified, setVerified] = useState(null);
  const [reason, setReason] = useState(null);

  useEffect(() => {
    async function fetchVerification() {
      if (!identifier) {
        setVerified(false);
        setReason("INVALID_CARD");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        let res;
        if (isVerificationToken(identifier)) {
          res = await apiConnector("GET", communityEndpoints.VERIFY_MEMBER_BY_TOKEN_API(identifier));
        } else {
          res = await apiConnector("GET", communityEndpoints.VERIFY_MEMBERSHIP_CARD_API(identifier));
        }
        const data = res?.data?.data || res?.data;
        if (data?.verified === true) {
          setVerified(true);
          setMemberData(data.member || null);
        } else if (data?.verified === false) {
          setVerified(false);
          setReason(data.reason || "INVALID_CARD");
          setMemberData(data.member || null);
        } else if (data?.member) {
          const m = data.member;
          const active = m.valid || m.status === "ACTIVE";
          setVerified(active);
          setMemberData(m);
          if (!active) setReason("MEMBERSHIP_INACTIVE");
        } else {
          setVerified(false);
          setReason("INVALID_CARD");
        }
      } catch (err) {
        setVerified(false);
        setReason("INVALID_CARD");
      } finally {
        setLoading(false);
      }
    }
    fetchVerification();
  }, [identifier]);

  const statusLabel = (s) => {
    const map = {
      ACTIVE: "Active Member",
      PENDING: "Pending Review",
      SUSPENDED: "Suspended",
      REJECTED: "Rejected",
      DEACTIVATED: "Deactivated",
      CORRECTION_REQUESTED: "Correction Requested",
    };
    return map[s] || s || "Unknown";
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4 sm:p-6 pt-24 transition-colors duration-300">
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/8 blur-[140px] rounded-full pointer-events-none" />

      {/* Org header */}
      <div className="relative w-full max-w-md mb-5 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src="/logo.png" alt="Samaj Logo" className="w-10 h-10 object-contain rounded-lg border border-emerald-500/30 bg-white p-0.5" />
          <div className="text-left leading-tight">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#14532d" }}>ADIVASI HALBA/HALBI SAMAJ</p>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">KALYAN SAMITI, UJJAIN</p>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-md ka-card p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10">
            <FiShield className="text-[var(--accent-primary)]" size={18} />
          </div>
          <div className="text-left leading-tight">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)]">MEMBERSHIP VERIFICATION</p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--accent-primary)] font-bold">Secure Digital ID Check</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-[3px] border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-[var(--text-secondary)]">Verifying membership...</p>
          </div>
        ) : verified === true ? (
          <div className="flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-500">
              <FiCheckCircle size={15} /><span>Verified Active Member</span>
            </div>
            <div className="relative">
              <img
                src={memberData?.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(memberData?.name || "Member")}`}
                alt={memberData?.name || "Member"}
                className="w-28 h-28 rounded-2xl border-2 border-emerald-500/40 object-cover shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-2 border-[var(--surface)] shadow-lg">
                <FiCheckCircle size={13} />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">{memberData?.name || "—"}</h1>
              <p className="text-xs text-[var(--accent-primary)] font-bold mt-1 font-mono tracking-wider">{memberData?.memberId || "—"}</p>
            </div>
            <div className="w-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-[var(--text-muted)]"><FiAward size={12} /> Membership Status</span>
                <span className="font-bold text-emerald-500">{statusLabel(memberData?.status)}</span>
              </div>
              {memberData?.issuedAt && (
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-[var(--text-muted)]"><FiCalendar size={12} /> Issued Date</span>
                  <span className="font-bold text-[var(--text-primary)]">{new Date(memberData.issuedAt).toLocaleDateString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--text-muted)]">Authenticity</span>
                <span className="font-bold text-[var(--text-primary)]">Cryptographically Verified</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--text-muted)]">Organization</span>
                <span className="font-bold text-[var(--accent-primary)] text-right max-w-[200px] leading-tight">Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain</span>
              </div>
            </div>
            <div className="w-full p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-xs font-bold text-emerald-500">✓ Membership successfully verified</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">This is an active, verified member of the Samaj.</p>
            </div>
          </div>
        ) : verified === false && reason === "MEMBERSHIP_INACTIVE" ? (
          <div className="flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-500">
              <FiAlertTriangle size={14} /><span>Membership Not Active</span>
            </div>
            {memberData && (
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
                  <FiUser size={22} className="text-[var(--text-muted)]" />
                </div>
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{memberData.name}</p>
                  <p className="text-xs font-mono text-[var(--text-muted)]">{memberData.memberId}</p>
                </div>
              </div>
            )}
            <div className="w-full bg-[var(--surface-elevated)] border border-amber-500/20 rounded-2xl p-4 space-y-2.5">
              {memberData?.status && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--text-muted)]">Current Status</span>
                  <span className="font-bold text-amber-500">{statusLabel(memberData.status)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--text-muted)]">Verification</span>
                <span className="font-bold text-amber-500">Not Active</span>
              </div>
            </div>
            <div className="w-full p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-xs font-bold text-amber-500">⚠ This membership is currently not active</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Valid only while membership status is ACTIVE. Contact the Samaj office for assistance.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <FiXCircle size={36} />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Invalid Membership Card</h2>
              <p className="text-xs text-red-400 mt-2 max-w-xs mx-auto leading-relaxed">
                Unable to verify this membership card. This card may be invalid, expired, or not registered in the Samaj system.
              </p>
            </div>
            <div className="w-full p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
              <p className="text-xs text-[var(--text-muted)]">
                If you believe this is an error, please contact the Samaj office at{" "}
                <span className="font-bold text-[var(--text-primary)]">9926018058</span>
              </p>
            </div>
          </div>
        )}

        {!loading && (
          <p className="text-[10px] text-[var(--text-muted)] mt-5 text-center leading-relaxed">
            This public verification page displays non-sensitive authentication status only, adhering to Samaj Data Privacy Standards.
          </p>
        )}

        <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors">
            <FiArrowLeft size={13} /> Back to Portal
          </Link>
        </div>
      </div>

      <div className="relative w-full max-w-md mt-4 text-center">
        <p className="text-[10px] text-[var(--text-muted)]">
          ADIVASI HALBA/HALBI SAMAJ KALYAN SAMITI, UJJAIN · 9926018058 ·{" "}
          <a href="mailto:halbahalbiujjain79@gmail.com" className="hover:underline">halbahalbiujjain79@gmail.com</a>
        </p>
      </div>
    </div>
  );
};

export default VerifyMemberCardPage;


