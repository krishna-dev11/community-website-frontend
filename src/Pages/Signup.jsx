import React from 'react'
import Template from '../Components/Core/Auth/Template'

const Signup = () => {
  return (
    <Template
      title="Samaj Member Registration"
      desc1="Submit your member profile for committee review."
      desc2="After OTP verification, your account stays pending until approved."
      formtype="signup"
    />
  )
}

export default Signup
