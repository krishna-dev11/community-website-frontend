import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { communityEndpoints } from "../services/apis";
import { FiCheckCircle, FiXCircle, FiShield, FiArrowLeft } from "react-icons/fi";
import { useLanguage } from "../i18n/LanguageContext";

const VerifyMemberCardPage = () => {
  const { memberId } = useParams();
  const { isHindi } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVerification() {
      if (!memberId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await apiConnector(
          "GET",
          communityEndpoints.VERIFY_MEMBERSHIP_CARD_API(memberId)
        );
        if (res?.data?.success && res?.data?.data?.member) {
          setMemberData(res.data.data.member);
        } else {
          setError(res?.data?.message || "Invalid or unverified membership card.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError(
          err?.response?.data?.message ||
            "Unable to verify membership card. Record not found or card revoked."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchVerification();
  }, [memberId]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4 sm:p-6 pt-24 transition-colors duration-300">
      {/* Background ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[var(--accent-primary)]/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md ka-card p-6 sm:p-8 shadow-2xl text-center">
        {/* Top Header Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10">
            <FiShield className="text-[var(--accent-primary)]" size={18} />
          </div>
          <div className="text-left leading-tight">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)]">SAMAJ TRUST</p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--accent-primary)] font-bold">Digital ID Verification</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-3 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-[var(--text-secondary)]">Verifying member identity...</p>
          </div>
        ) : error || !memberData ? (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <FiXCircle size={36} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Verification Failed</h2>
              <p className="text-xs text-red-400 mt-1 max-w-xs mx-auto">{error || "Card is invalid or expired."}</p>
            </div>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center">
            {/* Status Pill */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-6 ${
                memberData.valid
                  ? "bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)]"
                  : "bg-red-500/15 border border-red-500/30 text-red-400"
              }`}
            >
              {memberData.valid ? <FiCheckCircle size={14} /> : <FiXCircle size={14} />}
              <span>{memberData.valid ? "Verified Active Member" : "Inactive / Revoked"}</span>
            </div>

            {/* Member Photo */}
            <div className="relative mb-5">
              <img
                src={
                  memberData.photo ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${memberData.name || "Member"}`
                }
                alt={memberData.name}
                className="w-28 h-28 rounded-2xl border-2 border-[var(--accent-primary)]/40 object-cover shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-[var(--accent-primary)] text-[#070707] p-1.5 rounded-xl border border-[var(--border-subtle)] shadow-lg">
                <FiShield size={14} />
              </div>
            </div>

            {/* Member Name & ID */}
            <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">{memberData.name}</h1>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-mono tracking-wider">
              ID: {memberData.memberId ? String(memberData.memberId).slice(-8).toUpperCase() : "N/A"}
            </p>

            {/* Verification Metadata Box */}
            <div className="w-full mt-6 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 text-left space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--text-muted)]">Status</span>
                <span className={`font-bold ${memberData.valid ? "text-[var(--accent-primary)]" : "text-red-400"}`}>
                  {memberData.status || "UNKNOWN"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--text-muted)]">Authenticity</span>
                <span className="font-bold text-[var(--text-primary)]">Cryptographically Verified</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--text-muted)]">Verification Source</span>
                <span className="font-bold text-[var(--accent-primary)]">Samaj Central Registry</span>
              </div>
            </div>

            {/* Privacy notice */}
            <p className="text-[10px] text-[var(--text-muted)] mt-4 leading-relaxed max-w-xs">
              This public verification page displays non-sensitive authentication status only, adhering to Samaj Data Privacy Standards.
            </p>
          </div>
        )}

        {/* Back button */}
        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
          >
            <FiArrowLeft size={14} /> Back to Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyMemberCardPage;

