import React from 'react'
import Hieghlightedtext from '../Components/Core/Home/Hieghlightedtext'
import QuoteSection from '../Components/Core/About.jsx/QuoteSection'
import FoundingStory from '../Components/Core/About.jsx/FoundingStory'
import Grey_whiteBox from '../Components/Core/About.jsx/Grey_whiteBox'
import ContactForm from '../Components/Core/About.jsx/ContactForm';
import SocialStats from '../Components/Core/Home/SocialStats';
import ModernFooter from '../Components/Core/Home/ModernFooter'

const AboutPage = () => {
  return (
    <div className='relative w-full min-h-screen bg-[var(--bg)] text-[var(--text-primary)] overflow-x-hidden font-sans m-0 p-0 box-border transition-colors duration-300'>
      
      {/* Background Watermark */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 select-none pointer-events-none z-0">
        <h1 className="text-[14rem] md:text-[22rem] font-bold text-[var(--text-primary)]/[0.02] tracking-widest uppercase">English</h1>
      </div>

      {/* Subtle Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[var(--accent-blue)]/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className='relative z-10 pt-36 md:pt-44 pb-16 px-6'>
        <div className='max-w-6xl mx-auto flex flex-col items-center text-center'>
          <div className="eyebrow-badge mb-8">
            Our Vision
          </div>

          <h2 className="heading-hero mb-8 text-[var(--text-primary)]">
            Empowering Your Voice for a <br/>
            <Hieghlightedtext
              color="text-gradient"
              data="Global Career"
            />
          </h2>

          <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-3xl leading-relaxed mb-16 font-normal">
            With more than 22 years of excellence, Bold Voive Spoken English Institute focuses on 
            building confidence, improving communication skills, and helping students speak English 
            fluently through practical speaking sessions and personality development training.
          </p>
        </div>
      </section>

      {/* Quote & Story Section */}
      <section className='relative z-10 bg-[var(--surface-raised)]/40 backdrop-blur-md py-16 border-y border-[var(--border-subtle)]'>
        <QuoteSection />
        <div className='max-w-5xl h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent mx-auto my-16'></div>
        <FoundingStory />
      </section>

      {/* Features & Form */}
      <section className='relative z-10 py-16 flex flex-col gap-24 md:gap-32'>
        <Grey_whiteBox />
        
        <div className="w-full">
           <SocialStats />
        </div>
        
        <div className="max-w-2xl mx-auto w-full px-6">
          <ContactForm 
            heading="Book Your Free Demo" 
            description="Select your preferred batch and start your journey to fluency today." 
          />
        </div>
      </section>
      
      <ModernFooter/>
    </div>
  )
}

export default AboutPage
