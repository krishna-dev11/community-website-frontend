import React from 'react'
import Template from '../Components/Core/Auth/Template'

const Login = () => {
  return (
    <Template
      title="Samaj Portal Login"
      desc1="Approved members and invited admins can access the dashboard."
      desc2="Pending applications are reviewed by the committee before login is enabled."
      formtype="login"
    />
  )
}

export default Login
