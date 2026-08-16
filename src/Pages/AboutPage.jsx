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
    <div className='relative w-full bg-[#000] text-white overflow-x-hidden font-sans m-0 p-0 box-border'>
      
      
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 select-none pointer-events-none z-0">
        <h1 className="text-[18rem] md:text-[22rem] font-bold text-white/[0.02] tracking-widest uppercase">English</h1>
      </div>

      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />

      
      <section className='relative z-10 pt-44 pb-16 px-6'>
        <div className='max-w-6xl mx-auto flex flex-col items-center text-center'>
          <div className="flex items-center gap-2 px-3 py-1.5 w-fit rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">Our Vision</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-[1.1]">
            Empowering Your Voice for a <br/>
            <Hieghlightedtext
              color="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"
              data="Global Career"
            />
          </h2>

<p className="text-gray-400 text-lg max-w-3xl leading-relaxed mb-20">
  With more than 22 years of excellence, Bold Voive Spoken English Institute focuses on 
  building confidence, improving communication skills, and helping students speak English 
  fluently through practical speaking sessions and personality development training.
</p>

        </div>
      </section>

      
      <section className='relative z-10 bg-black/40 backdrop-blur-md py-16'>
        <QuoteSection />
        <div className='max-w-5xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto my-20'></div>
        <FoundingStory />
      </section>

      
      <section className='relative z-10 py-16 flex flex-col gap-40'>
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
