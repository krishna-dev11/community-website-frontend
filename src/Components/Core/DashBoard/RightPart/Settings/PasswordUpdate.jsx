import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi"; // Cleaner modern icons
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

  const inputStyle = "w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-white/20 transition-all text-sm pr-12";
  const labelStyle = "block text-gray-500 text-[10px] font-bold mb-2.5 ml-1 uppercase tracking-[0.2em]";

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-6">
      
      
      <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        
        
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
            <FiLock className="text-emerald-400" size={20} />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Security Credentials</h3>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
              >
                {showOldPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
              >
                {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

        </div>
      </div>

      
      <div className="flex justify-end items-center gap-6">
        <button 
          type="button"
          onClick={() => navigate("/dashboard/my-profile")}
          className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-10 py-4 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all active:scale-95"
        >
          Update Security
        </button>
      </div>

    </form>
  )
}

export default PasswordUpdate