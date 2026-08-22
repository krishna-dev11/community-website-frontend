import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowRight, FiLock, FiShield, FiUser } from "react-icons/fi";
import { apiConnector } from "../services/apiConnector";
import { adminEndpoints } from "../services/apis";

const inputClass = "ka-input";
const labelClass = "mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]";

const AdminInviteAcceptPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  const changeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await apiConnector("POST", adminEndpoints.ACCEPT_ADMIN_INVITE_API, {
        token,
        ...formData,
      });
      toast.success("Admin account activated. Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to accept admin invite");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 pb-14 pt-28 text-[var(--text-primary)] sm:px-6 lg:px-8 transition-colors duration-300">
      <section className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="ka-card p-6 lg:sticky lg:top-28 lg:self-start">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
              <FiShield size={22} />
            </div>
            <div>
              <p className="eyebrow-badge mb-1">Admin Invite</p>
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Activate Access</h1>
            </div>
          </div>
          <p className="text-sm leading-6 text-[var(--text-secondary)] font-normal">
            Complete your invited admin account setup. This page only works with a valid invite token sent by a Super Admin.
          </p>
          <div className="mt-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 text-xs leading-6 text-[var(--text-muted)]">
            The invite token is used once and the password is stored as a bcrypt hash by the backend.
          </div>
        </aside>

        <form onSubmit={submitHandler} className="ka-card p-5 sm:p-7 shadow-2xl">
          <div className="mb-7 border-b border-[var(--border-subtle)] pb-6">
            <div className="eyebrow-badge mb-4">Setup</div>
            <h2 className="text-3xl font-black tracking-tight text-[var(--text-primary)] leading-tight">Create your <span className="text-gradient">admin account</span></h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)] font-normal">
              Enter your name and choose a password to activate the invited admin roles.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className={labelClass}>First name</span>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input required name="firstName" value={formData.firstName} onChange={changeHandler} className={`${inputClass} !pl-10`} placeholder="First name" />
              </div>
            </label>

            <label>
              <span className={labelClass}>Last name</span>
              <input required name="lastName" value={formData.lastName} onChange={changeHandler} className={inputClass} placeholder="Last name" />
            </label>

            <label>
              <span className={labelClass}>Password</span>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input required type="password" name="password" value={formData.password} onChange={changeHandler} className={`${inputClass} !pl-10`} placeholder="Create password" />
              </div>
            </label>

            <label>
              <span className={labelClass}>Confirm password</span>
              <input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={changeHandler} className={inputClass} placeholder="Confirm password" />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-7 w-full text-sm"
          >
            <span>{submitting ? "Activating" : "Activate Admin Account"}</span>
            <FiArrowRight size={16} />
          </button>

          <p className="mt-5 text-center text-xs text-[var(--text-muted)]">
            Already activated? <Link to="/login" className="font-bold text-[var(--accent-primary)] hover:opacity-80 transition-opacity">Login here</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default AdminInviteAcceptPage;
