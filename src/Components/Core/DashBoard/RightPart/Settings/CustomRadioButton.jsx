import { useEffect, useState } from "react";

const CustomRadioButton = ({
  name,
  register,
  setValue,
  errors = {}, // 🔥 Default object to prevent "reading properties of undefined"
}) => {
  const [selectedGender, setSelectedGender] = useState("");
  const genders = ["Male", "Female", "Other"];

  useEffect(() => {
    register(name, {
      required: "Please select your gender",
    });
  }, [register, name]);

  const handleGenderChange = (gender) => {
    setSelectedGender(gender);
    setValue(name, gender, { shouldValidate: true }); 
  };

  return (
    <div className="flex flex-col gap-3">
      
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        {genders.map((gender) => (
          <label
            key={gender}
            className="flex items-center gap-x-3 cursor-pointer group transition-all"
          >
            <input
              type="radio"
              name={name}
              value={gender}
              checked={selectedGender === gender}
              onChange={() => handleGenderChange(gender)}
              className="hidden"
            />
            
            
            <div
              className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all duration-300
                ${
                  selectedGender === gender
                    ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    : "border-white/10 bg-transparent group-hover:border-white/30"
                }`}
            >
              
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 transform
                  ${
                    selectedGender === gender 
                      ? "bg-emerald-400 scale-100 shadow-[0_0_8px_rgba(52,211,153,0.8)]" 
                      : "bg-transparent scale-0"
                  }`}
              ></div>
            </div>

            
            <p className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
              selectedGender === gender ? "text-white" : "text-gray-500 group-hover:text-gray-300"
            }`}>
              {gender}
            </p>
          </label>
        ))}
      </div>

      
      {errors && errors[name] && (
        <div className="flex items-center gap-1 mt-1 animate-pulse">
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">
            ⚠ {errors[name].message || "Selection Required"}
          </span>
        </div>
      )}
    </div>
  );
};

export default CustomRadioButton;