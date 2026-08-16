import React from 'react'
import LoginForm from './LoginForm'
import SignUpForm from './SignUpForm'

const Template = ({title , desc1 , desc2 , image , formtype}) => {
  return (
    <div className='h-screen w-full translate-y-9 flex flex-col'>
    
        <div>{
          formtype === "login" ? <LoginForm/> : <SignUpForm/>
        }</div>
     
     
 

    </div>
  )
}

export default Template