import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { ChangePassword } from '../../../../../services/Operations/DashBoard';

const PasswordUpdate = () => {
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)
  const navigate = useNavigate()

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitSuccessful }
  } = useForm()

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        newPassword: "",
        confirmNewPassword: "",
        oldPassword: ""
      })
    }
  }, [reset, isSubmitSuccessful])

  const onFormSubmit = async (data) => {
    if (data.newPassword !== data.confirmNewPassword) {
      return toast.error("Passwords do not match")
    }
    dispatch(ChangePassword(token, data))
  }

  const inputStyle = "ka-input pr-11";
  const labelStyle = "block text-[var(--text-muted)] text-[10px] font-bold mb-1.5 ml-0.5 uppercase tracking-[0.18em]";

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-6">
      <div className="ka-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-subtle)] pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
            <FiLock size={18} />
          </div>
          <div>
            <div className="eyebrow-badge mb-0.5">Authentication</div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Security Credentials</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative">
            <label className={labelStyle}>Current Password</label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("oldPassword", { required: true })}
                className={inputStyle}
              />
              <button 
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {showOldPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div className="relative">
            <label className={labelStyle}>New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("newPassword", { required: true })}
                className={inputStyle}
              />
              <button 
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div className="relative">
            <label className={labelStyle}>Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirmNewPassword", { required: true })}
                className={inputStyle}
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 px-2">
        <button 
          type="button"
          onClick={() => navigate("/dashboard/my-profile")} 
          className="btn-secondary !py-2.5 !px-6 !text-xs cursor-pointer"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn-primary !py-2.5 !px-8 !text-xs cursor-pointer"
        >
          <span>Update Password</span>
        </button>
      </div>
    </form>
  );
};

export default PasswordUpdate;