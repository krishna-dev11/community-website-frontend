import ModernFooter from '../Components/Core/Home/ModernFooter'
import GetInTouchSection from '../Components/Core/About.jsx/GetInTouchSection'

const ContactUsPage = () => {
  return (
    <div className='w-full min-h-screen bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300'>
      <div className='w-full max-w-7xl mx-auto pt-28 pb-12 px-4 sm:px-6'>
        <GetInTouchSection/>
      </div>
      <ModernFooter/>
    </div>
  )
}

export default ContactUsPage

