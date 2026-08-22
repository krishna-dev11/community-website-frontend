import LoginForm from './LoginForm'
import SignUpForm from './SignUpForm'

const Template = ({formtype}) => {
  return (
    <div className='min-h-screen w-full flex flex-col'>
    
        <div>{
          formtype === "login" ? <LoginForm/> : <SignUpForm/>
        }</div>
     
     
 

    </div>
  )
}

export default Template
