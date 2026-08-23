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
      middleName: user?.additionalDetails?.middleName || "",
      LastName: user?.lastName || "",
      dateOfBirth: user?.additionalDetails?.dateOfBirth || "",
      contactNumber: user?.additionalDetails?.contactNumber || "",
      gender: user?.additionalDetails?.gender || "",
      nativePlace: user?.additionalDetails?.nativePlace || "",
      currentCity: user?.additionalDetails?.currentCity || "",
      address: user?.additionalDetails?.address || "",
      education: user?.additionalDetails?.education || "",
      profession: user?.additionalDetails?.profession || "",
      gotra: user?.additionalDetails?.gotra || "",
      about: user?.additionalDetails?.about || "",
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        FirstName: user?.firstName || "",
        middleName: user?.additionalDetails?.middleName || "",
        LastName: user?.lastName || "",
        dateOfBirth: user?.additionalDetails?.dateOfBirth || "",
        contactNumber: user?.additionalDetails?.contactNumber || "",
        gender: user?.additionalDetails?.gender || "",
        nativePlace: user?.additionalDetails?.nativePlace || "",
        currentCity: user?.additionalDetails?.currentCity || "",
        address: user?.additionalDetails?.address || "",
        education: user?.additionalDetails?.education || "",
        profession: user?.additionalDetails?.profession || "",
        gotra: user?.additionalDetails?.gotra || "",
        about: user?.additionalDetails?.about || "",
      });
    }
  }, [user, reset]);

  const onFormSubmit = (data) => dispatch(UpdateProfileDetails(token, data));

  const inputStyle = "ka-input";
  const labelStyle = "text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] ml-0.5 mb-1.5 block";

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-6">
      {/* 1. Personal Details */}
      <div className="ka-card p-6 md:p-8">
        <div className="mb-6 border-b border-[var(--border-subtle)] pb-4">
          <div className="eyebrow-badge mb-1">Section 1</div>
          <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Personal <span className="text-gradient">Information</span>
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <label>
            <span className={labelStyle}>First Name *</span>
            <input type="text" placeholder="First Name" {...register("FirstName", { required: true })} className={inputStyle} />
          </label>

          <label>
            <span className={labelStyle}>Middle Name</span>
            <input type="text" placeholder="Middle Name" {...register("middleName")} className={inputStyle} />
          </label>

          <label>
            <span className={labelStyle}>Last Name *</span>
            <input type="text" placeholder="Last Name" {...register("LastName", { required: true })} className={inputStyle} />
          </label>

          <label>
            <span className={labelStyle}>Date of Birth</span>
            <input type="date" {...register("dateOfBirth")} className={inputStyle} />
          </label>

          <label>
            <span className={labelStyle}>Contact Number</span>
            <input type="tel" placeholder="10-digit number" {...register("contactNumber", { maxLength: 15 })} className={inputStyle} />
          </label>

          <label>
            <span className={labelStyle}>Gotra</span>
            <input type="text" placeholder="e.g. Kashyap, Garg" {...register("gotra")} className={inputStyle} />
          </label>

          <div className="md:col-span-3">
            <span className={labelStyle}>Gender Identity</span>
            <div className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] p-4 rounded-2xl">
              <CustomRadioButton name="gender" register={register} setValue={setValue} errors={errors} getValues={getValues} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Address & Residence */}
      <div className="ka-card p-6 md:p-8">
        <div className="mb-6 border-b border-[var(--border-subtle)] pb-4">
          <div className="eyebrow-badge mb-1">Section 2</div>
          <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Location & <span className="text-gradient">Residence</span>
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label>
            <span className={labelStyle}>Native Place / Mool Niwas</span>
            <input type="text" placeholder="e.g. Jaipur, Nagaur, etc." {...register("nativePlace")} className={inputStyle} />
          </label>

          <label>
            <span className={labelStyle}>Current City</span>
            <input type="text" placeholder="e.g. Mumbai, Delhi, Ahmedabad" {...register("currentCity")} className={inputStyle} />
          </label>

          <div className="md:col-span-2">
            <label>
              <span className={labelStyle}>Complete Residential Address</span>
              <textarea rows={2} placeholder="House / Flat No., Street, Landmark, Pincode" {...register("address")} className={`${inputStyle} resize-none`} />
            </label>
          </div>
        </div>
      </div>

      {/* 3. Education & Profession */}
      <div className="ka-card p-6 md:p-8">
        <div className="mb-6 border-b border-[var(--border-subtle)] pb-4">
          <div className="eyebrow-badge mb-1">Section 3</div>
          <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Education & <span className="text-gradient">Profession</span>
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label>
            <span className={labelStyle}>Highest Qualification</span>
            <input type="text" placeholder="e.g. B.Tech, CA, MBBS, MBA, M.Com" {...register("education")} className={inputStyle} />
          </label>

          <label>
            <span className={labelStyle}>Profession / Occupation</span>
            <input type="text" placeholder="e.g. Software Engineer, Business Owner, Chartered Accountant" {...register("profession")} className={inputStyle} />
          </label>

          <div className="md:col-span-2">
            <label>
              <span className={labelStyle}>Bio / About Yourself</span>
              <textarea rows={3} placeholder="Write a short summary about yourself..." {...register("about")} className={`${inputStyle} resize-none`} />
            </label>
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
          <span>Save Changes</span>
        </button>
      </div>
    </form>
  );
};

export default UpdateProfile;