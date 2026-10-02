import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiLock,
  FiShield,
  FiSlash,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { apiConnector } from "../services/apiConnector";
import { adminEndpoints } from "../services/apis";

const inputClass = "ka-input";
const labelClass = "mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]";

const formatRoleLabel = (role) => {
  return String(role || "")
    .replace(/_/g, " ")
    .toUpperCase();
};

const AdminInviteAcceptPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [errorState, setErrorState] = useState(null); // 'INVALID', 'EXPIRED', 'REVOKED', 'ALREADY_USED', 'NETWORK_ERROR'

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setErrorState("INVALID");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await apiConnector(
          "GET",
          adminEndpoints.VALIDATE_ADMIN_INVITE_API(token)
        );
        const data = response.data?.data;

        if (!data || data.state !== "VALID") {
          setErrorState(data?.state || "INVALID");
        } else {
          setInviteData(data);
          setErrorState(null);
        }
      } catch (err) {
        const status = err.response?.status;
        const errCode = err.response?.data?.error?.code || err.response?.data?.message;

        if (errCode === "ADMIN_INVITE_ALREADY_USED" || status === 409) {
          setErrorState("ALREADY_USED");
        } else if (errCode === "ADMIN_INVITE_EXPIRED") {
          setErrorState("EXPIRED");
        } else if (errCode === "ADMIN_INVITE_REVOKED") {
          setErrorState("REVOKED");
        } else {
          setErrorState("INVALID");
        }
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const changeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    if (inviteData?.isExistingUser) {
      if (!formData.password) {
        toast.error("Please enter your current account password to confirm your identity");
        return;
      }
    } else {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error("First name and last name are required");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await apiConnector("POST", adminEndpoints.ACCEPT_ADMIN_INVITE_API, {
        token,
        ...formData,
      });

      if (inviteData?.isExistingUser) {
        toast.success("Admin role activated for your account! Please sign in.");
      } else {
        toast.success("Admin account created successfully! Please sign in.");
      }
      navigate("/login");
    } catch (error) {
      const msg = error.response?.data?.message || "Unable to accept admin invite";
      toast.error(msg);
      // If error indicates invite is now used/expired, refresh validation
      if (error.response?.data?.error?.code === "ADMIN_INVITE_ALREADY_USED") {
        setErrorState("ALREADY_USED");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-24 text-[var(--text-primary)]">
        <div className="ka-card p-8 max-w-md w-full text-center flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-[var(--accent-primary)]/20 border-t-[var(--accent-primary)] animate-spin mb-4" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Validating Invitation...</h2>
          <p className="mt-2 text-xs text-[var(--text-muted)]">Verifying administrative security token</p>
        </div>
      </main>
    );
  }

  // Error States
  if (errorState) {
    let icon = <FiAlertCircle className="text-red-400" size={36} />;
    let title = "INVITATION INVALID";
    let message = "This invitation link is not valid or does not exist.";
    let hint = "Please verify the link provided in your email or contact the Samaj administrator.";

    if (errorState === "EXPIRED") {
      icon = <FiClock className="text-amber-400" size={36} />;
      title = "INVITATION EXPIRED";
      message = "This invitation has expired. Invitations remain valid for 7 days from when they are issued.";
      hint = "Please ask an authorized administrator to send a new invitation.";
    } else if (errorState === "REVOKED") {
      icon = <FiSlash className="text-red-400" size={36} />;
      title = "INVITATION REVOKED";
      message = "This invitation is no longer active. It has been revoked by an administrator.";
      hint = "If you believe this is a mistake, please reach out to the Samaj executive committee.";
    } else if (errorState === "ALREADY_USED") {
      icon = <FiCheckCircle className="text-[var(--accent-primary)]" size={36} />;
      title = "INVITATION ALREADY USED";
      message = "This invitation has already been accepted. Administrative privileges have been activated.";
      hint = "If you already have an account, please sign in to access your dashboard.";
    }

    return (
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-24 text-[var(--text-primary)]">
        <div className="ka-card p-8 sm:p-10 max-w-lg w-full text-center flex flex-col items-center border border-[var(--border-subtle)] shadow-2xl">
          <div className="h-16 w-16 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 shadow-inner">
            {icon}
          </div>
          <p className="eyebrow-badge mb-2 text-xs">Security Notice</p>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] mb-3">{title}</h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{message}</p>
          <p className="text-xs text-[var(--text-muted)] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl p-3 mb-6 w-full">
            {hint}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link to="/login" className="btn-primary w-full text-xs justify-center">
              <span>Go to Sign In</span>
              <FiArrowRight size={14} />
            </Link>
            <Link to="/" className="btn-secondary w-full text-xs justify-center">
              <span>Home</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Valid Invitation State
  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 pb-14 pt-24 text-[var(--text-primary)] sm:px-6 lg:px-8 transition-colors duration-300">
      <section className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* Left Aside: Organization & Invitation Summary */}
        <aside className="ka-card p-6 lg:sticky lg:top-24 lg:self-start border border-[var(--border-subtle)] shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
              <FiShield size={24} />
            </div>
            <div>
              <p className="eyebrow-badge mb-1">Administrative Access</p>
              <h1 className="text-xl font-black tracking-tight text-[var(--text-primary)]">Samaj Portal</h1>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
              <p className="font-bold text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Organization</p>
              <p className="font-black text-xs text-[var(--text-primary)] leading-snug">
                ADIVASI HALBA/HALBI SAMAJ KALYAN SAMITI, UJJAIN
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
              <p className="font-bold text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Invited Email Address</p>
              <p className="font-mono text-xs font-semibold text-[var(--accent-primary)] break-all">
                {inviteData?.email}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
              <p className="font-bold text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Assigned Admin Role(s)</p>
              <div className="flex flex-wrap gap-1.5">
                {(inviteData?.roles || []).map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 px-2.5 py-1 text-[11px] font-bold text-[var(--accent-primary)]"
                  >
                    <FiShield size={10} />
                    {formatRoleLabel(role)}
                  </span>
                ))}
              </div>
            </div>

            {inviteData?.expiresAt && (
              <div className="flex items-center gap-2 px-1 text-[11px] text-[var(--text-muted)]">
                <FiClock size={12} className="shrink-0" />
                <span>
                  Valid until: {new Date(inviteData.expiresAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </aside>

        {/* Right Form: Acceptance & Setup */}
        <form onSubmit={submitHandler} className="ka-card p-6 sm:p-8 shadow-2xl border border-[var(--border-subtle)]">
          <div className="mb-7 border-b border-[var(--border-subtle)] pb-6">
            <div className="eyebrow-badge mb-3">
              {inviteData?.isExistingUser ? "Account Linking" : "New Account Setup"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] leading-tight">
              {inviteData?.isExistingUser ? (
                <>Link Admin Privileges to <span className="text-gradient">Existing Account</span></>
              ) : (
                <>Create your <span className="text-gradient">Admin Account</span></>
              )}
            </h2>
            <p className="mt-3 text-xs sm:text-sm leading-6 text-[var(--text-secondary)] font-normal">
              {inviteData?.isExistingUser ? (
                <>
                  An existing member account for <strong className="text-[var(--text-primary)]">{inviteData.email}</strong> was detected ({inviteData.existingUserName || "Community Member"}). Enter your existing password to verify ownership and activate your assigned administrative roles.
                </>
              ) : (
                "Please enter your full name and choose a secure password to complete your administrator onboarding."
              )}
            </p>
          </div>

          {inviteData?.isExistingUser ? (
            <div className="space-y-5">
              <label className="block">
                <span className={labelClass}>Confirm Current Account Password</span>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    required
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={changeHandler}
                    className={`${inputClass} !pl-10`}
                    placeholder="Enter your existing account password"
                  />
                </div>
                <span className="mt-1.5 block text-[11px] text-[var(--text-muted)]">
                  Confirms your identity before activating administrator permissions.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary mt-6 w-full text-xs sm:text-sm justify-center py-3.5"
              >
                <span>{submitting ? "Activating Roles..." : "Accept Invitation & Activate Admin Access"}</span>
                <FiArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>First Name</span>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      required
                      name="firstName"
                      value={formData.firstName}
                      onChange={changeHandler}
                      className={`${inputClass} !pl-10`}
                      placeholder="e.g. Ramesh"
                    />
                  </div>
                </label>

                <label>
                  <span className={labelClass}>Last Name</span>
                  <input
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={changeHandler}
                    className={inputClass}
                    placeholder="e.g. Halba"
                  />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Create Password</span>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      required
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={changeHandler}
                      className={`${inputClass} !pl-10`}
                      placeholder="At least 8 characters"
                    />
                  </div>
                </label>

                <label>
                  <span className={labelClass}>Confirm Password</span>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      required
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={changeHandler}
                      className={`${inputClass} !pl-10`}
                      placeholder="Confirm your password"
                    />
                  </div>
                </label>
              </div>

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
                Security note: Passwords are encrypted with standard bcrypt (12 rounds) and never stored in plain text.
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary mt-6 w-full text-xs sm:text-sm justify-center py-3.5"
              >
                <span>{submitting ? "Creating Account..." : "Create Account & Activate Access"}</span>
                <FiArrowRight size={16} />
              </button>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
            Already have an active login?{" "}
            <Link to="/login" className="font-bold text-[var(--accent-primary)] hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default AdminInviteAcceptPage;
