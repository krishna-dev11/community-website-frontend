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

  const inputStyle = "ka-input";
  const labelStyle = "text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] ml-0.5 mb-1.5 block";

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-6">
      <div className="ka-card p-6 md:p-8">
        <div className="mb-6 border-b border-[var(--border-subtle)] pb-4">
          <div className="eyebrow-badge mb-1">Information</div>
          <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Personal <span className="text-gradient">Details</span>
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <input type="date" {...register("dateOfBirth", { required: true })} className={inputStyle} />
          </label>

          <label>
            <span className={labelStyle}>Contact Number</span>
            <input type="tel" placeholder="10-digit number" {...register("contactNumber", { required: true, maxLength: 10 })} className={inputStyle} />
          </label>

          <div className="md:col-span-2">
            <span className={labelStyle}>Gender Identity</span>
            <div className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] p-4 rounded-2xl">
              <CustomRadioButton name="gender" register={register} setValue={setValue} errors={errors} getValues={getValues} />
            </div>
          </div>

          <div className="md:col-span-2">
            <span className={labelStyle}>Bio / About</span>
            <textarea rows={4} placeholder="Describe yourself..." {...register("about")} className={`${inputStyle} resize-none`} />
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