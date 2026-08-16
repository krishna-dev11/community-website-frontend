

        

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UpdateProfileDetails } from "../../../../../services/Operations/DashBoard";
import CustomRadioButton from "./CustomRadioButton";

const UpdateProfile = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, getValues, reset, formState: { errors } } = useForm({
    defaultValues: {
      FirstName: user?.firstName || "",
      LastName: user?.lastName || "",
      dateOfBirth: user?.additionalDetails?.dateOfBirth || "",
      contactNumber: user?.additionalDetails?.contactNumber || "",
      about: user?.additionalDetails?.about || "",
      gender: user?.additionalDetails?.gender || "",
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        FirstName: user?.firstName,
        LastName: user?.lastName,
        dateOfBirth: user?.additionalDetails?.dateOfBirth,
        contactNumber: user?.additionalDetails?.contactNumber,
        about: user?.additionalDetails?.about,
        gender: user?.additionalDetails?.gender,
      });
    }
  }, [user, reset]);

  const onFormSubmit = (data) => dispatch(UpdateProfileDetails(token, data));

  const inputStyle = "w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-gray-700 focus:border-white/20 focus:outline-none transition-all text-sm";
  const labelStyle = "text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1 mb-2 block";

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-6">
      <div className="bg-white/[0.02] border border-white/10 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] backdrop-blur-xl">
        <h3 className="text-lg md:text-xl font-bold mb-8 md:mb-10 tracking-tight text-white uppercase italic">
          Personal <span className="text-emerald-500">Metadata</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <label>
            <span className={labelStyle}>First Name</span>
            <input type="text" placeholder="John" {...register("FirstName", { required: true })} className={inputStyle} />
          </label>

          <label>
            <span className={labelStyle}>Last Name</span>
            <input type="text" placeholder="Doe" {...register("LastName", { required: true })} className={inputStyle} />
          </label>

          <label>
            <span className={labelStyle}>Date of Birth</span>
            <input type="date" {...register("dateOfBirth", { required: true })} className={`${inputStyle} [color-scheme:dark]`} />
          </label>

          <label>
            <span className={labelStyle}>Contact Number</span>
            <input type="tel" placeholder="10-digit number" {...register("contactNumber", { required: true, maxLength: 10 })} className={inputStyle} />
          </label>

          <div className="md:col-span-2">
            <span className={labelStyle}>Gender Identity</span>
            <div className="bg-white/[0.03] border border-white/5 p-4 md:p-5 rounded-2xl">
              <CustomRadioButton name="gender" register={register} setValue={setValue} errors={errors} getValues={getValues} />
            </div>
          </div>

          <div className="md:col-span-2">
            <span className={labelStyle}>Bio / About</span>
            <textarea rows={4} placeholder="Describe yourself..." {...register("about")} className={`${inputStyle} resize-none`} />
          </div>
        </div>
      </div>

      
      <div className="flex flex-col sm:flex-row justify-end gap-4 px-2">
        <button 
          type="button"
          onClick={() => navigate("/dashboard/my-profile")} 
          className="order-2 sm:order-1 px-8 py-3 text-gray-400 hover:text-white transition-all text-[10px] md:text-xs uppercase tracking-widest font-bold"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="order-1 sm:order-2 px-6 md:px-10 py-4 bg-white text-black rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-gray-200 shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95"
        >
          Save Configuration
        </button>
      </div>
    </form>
  );
};

export default UpdateProfile;