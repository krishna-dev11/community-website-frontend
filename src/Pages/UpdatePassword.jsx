import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiArrowLeft, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";
import { forgotPassword } from "../services/Operations/authAPI";

const UpdatePassword = () => {
  const [formData, setFormData] = useState({
    CreateNewPassword: "",
    ConfirmNewPassword: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showCreatepassword, setshowCreatepassword] = useState(false);
  const [showConfirmPassword, setshowConfirmPassword] = useState(false);

  const location = useLocation();
  const token = location.pathname.split("/").at(-1);

  const changeHandler = (event) => {
    const { type, name, value, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const SubmitHandler = (event) => {
    event.preventDefault();

    if (formData.ConfirmNewPassword !== formData.CreateNewPassword) {
      toast.error("Passwords do not match");
      return;
    }

    dispatch(
      forgotPassword(
        formData.CreateNewPassword,
        formData.ConfirmNewPassword,
        token,
        navigate
      )
    );
  };

  return (
    <div className="flex flex-col gap-y-5 min-h-screen w-full justify-center items-center bg-[var(--bg)] text-[var(--text-primary)] px-4 py-16 transition-colors duration-300">
      <div className="w-full max-w-md flex flex-col ka-card p-8 sm:p-10 shadow-2xl gap-y-6">
        <div>
          <div className="eyebrow-badge mb-2">Security</div>
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Choose new password</h2>
          <p className="text-[var(--text-secondary)] text-sm font-normal mt-1">
            Almost done. Enter your new password and you're all set.
          </p>
        </div>

        <form onSubmit={SubmitHandler} className="flex flex-col gap-y-5">
          <label className="relative block">
            <span className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] block">
              New Password *
            </span>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input
                required
                className="ka-input pl-11 pr-11"
                type={showCreatepassword ? "text" : "password"}
                placeholder="Enter New Password"
                name="CreateNewPassword"
                onChange={changeHandler}
                value={formData.CreateNewPassword}
              />
              <button
                type="button"
                onClick={() => setshowCreatepassword(!showCreatepassword)}
                className="top-1/2 -translate-y-1/2 right-4 absolute text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {showCreatepassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </label>

          <label className="relative block">
            <span className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] block">
              Confirm New Password *
            </span>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input
                required
                className="ka-input pl-11 pr-11"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                name="ConfirmNewPassword"
                onChange={changeHandler}
                value={formData.ConfirmNewPassword}
              />
              <button
                type="button"
                onClick={() => setshowConfirmPassword(!showConfirmPassword)}
                className="top-1/2 -translate-y-1/2 right-4 absolute text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            className="btn-primary mt-2 w-full text-sm"
          >
            <span>Reset Password</span>
          </button>
        </form>

        <Link to="/login" className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <FiArrowLeft size={14} /> Back to login
        </Link>
      </div>
    </div>
  );
};

export default UpdatePassword;

