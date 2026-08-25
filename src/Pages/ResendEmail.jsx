import React from 'react'
import { Link } from 'react-router-dom'

const ResendEmail = () => {
  return (
    <div className="flex flex-col gap-y-5 h-screen w-full justify-center items-center bg-[var(--bg)]">
      <div className="w-[90%] sm:w-[30%] flex flex-col border border-[var(--border-subtle)] p-10 rounded-md gap-y-5 bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <p className="text-2xl text-[var(--text-primary)] font-semibold">Check email</p>
        <p className="text-[var(--text-secondary)] font-inter text-[.8rem]">
          We have sent the reset email to
          youremailaccount@gmail.com
        </p>
        <Link to={"/"}>
          <button
            type="submit"
            className="mt-6 w-full rounded-[8px] bg-[var(--accent-primary)] py-[8px] px-[12px] font-medium text-[#070707]"
          >
            Resend email
          </button>
        </Link>
        <Link to={"/"} className="flex gap-x-3 items-baseline">
          <span className="text-[var(--text-secondary)]">←</span>
          <p className="text-[var(--text-secondary)] -translate-y-1">Back to login</p>
        </Link>
      </div>
    </div>
  )
}

export default ResendEmail