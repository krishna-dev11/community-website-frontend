import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

const countryCodes = [
    { country: "India", code: "+91" },
    { country: "United States", code: "+1" },
    { country: "United Kingdom", code: "+44" },
    { country: "Australia", code: "+61" },
    { country: "Canada", code: "+1" },
]

const ContactForm = ({heading , description }) => {

    const {
         register,
         handleSubmit,
         reset,
         formState:{isSubmitSuccessful }
    } = useForm()

    useEffect(()=>{
          if(isSubmitSuccessful){
            reset({
                FirstName : "",
                LastName : "",
                EmaiAddress : "",
                message : "",
                ContactNumber : "",
                CountryCode : ""
            })
          }
    } , [reset , isSubmitSuccessful])

    const ActionTaken = ()=>{
        toast.success("We Are Connected to You ")
    }

  return (
    <form onSubmit={handleSubmit(ActionTaken)} className='w-full max-w-[600px] ka-card p-8 md:p-12 shadow-2xl relative overflow-hidden'>

         <div className='flex flex-col gap-4'>

           <div className='flex flex-col text-center mb-4'>
             <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mb-2">{heading}</h3>
             <p className="text-xs sm:text-sm text-[var(--text-secondary)]">{description}</p>
           </div>

         <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>

<label className="flex flex-col">
  <span className="mb-1 text-xs font-semibold text-[var(--text-primary)]">First Name <span className="text-[var(--accent-primary)]">*</span></span>
  <input
       type='text'
       placeholder='Enter First Name'
       name='FirstName'
       {...register('FirstName' , {
            required:{
                value:true,
                message:"Please Enter Your First Name"
            }
       })}
       className='ka-input'
    />
</label>

<label className="flex flex-col">
    <span className="mb-1 text-xs font-semibold text-[var(--text-primary)]">Last Name <span className="text-[var(--accent-primary)]">*</span></span>
    <input
       type='text'
       placeholder='Enter Last Name'
       name='LastName'
       {...register('LastName' , {
            required:{
                value:true,
                message:"Please Enter Your Last Name "
            }
       })}
       className='ka-input'
    />
</label>

</div>

<label className="flex flex-col">
       <span className="mb-1 text-xs font-semibold text-[var(--text-primary)]">Email Address <span className="text-[var(--accent-primary)]">*</span></span>            
       <input
       type='email'
       placeholder='Enter Email Address'
       name='EmaiAddress'
       {...register('EmaiAddress' , {
            required:{
                value:true,
                message:"Please Enter Your Email Address "
            }
       })}
       className='ka-input'
    />
</label>

<label className="flex flex-col">
     <span className="mb-1 text-xs font-semibold text-[var(--text-primary)]">Phone Number <span className="text-[var(--accent-primary)]">*</span></span>
     <div className='flex gap-3'>
      <select 
           name='CountryCode'
           {...register('CountryCode' , {
               required:{
                value:true,
                message:"Please Provide a country Code"
               }
           })}
           className='w-[35%] sm:w-[28%] ka-input'
      >
        {
           countryCodes.map((Country , index)=>(
            <option key={index} value={Country.code} className='bg-[var(--surface)] text-[var(--text-primary)]'>{Country.code} ({Country.country})</option>
           ))
        }
      </select>
      <input 
        type='tel'
        name='ContactNumber'
        placeholder='Contact Number'
        {...register('ContactNumber' , {
            required:{
                value:true,
                message:"Please Enter Your Phone Number"
            },
            maxLength:{
                value:10,
                message:"Contact Number of 10 Digits"
            },
            minLength:{
                value:10,
                message:"Contact Number of 10 Digits"
            }
        })}
        className='flex-1 ka-input'
      />
     </div>
</label>

<label className="flex flex-col">
    <span className="mb-1 text-xs font-semibold text-[var(--text-primary)]">Message <span className="text-[var(--accent-primary)]">*</span></span>
    <textarea
        name='message'
        cols={20}
        rows={4}
        placeholder='How can we help you?'
        {...register('message'  , {
            required : {
                value: true,
                message : "Please Provide message"
            }
        })}
        className='ka-input resize-none'
    />
</label>

<button
  type="submit"
  className="btn-primary mt-4 w-full"
>
   Submit Message
</button>

         </div>

    </form>
  )
}

export default ContactForm
