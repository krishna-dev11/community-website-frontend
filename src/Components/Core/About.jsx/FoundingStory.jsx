import Hieghlightedtext from '../Home/Hieghlightedtext'

const academyStory = [
  {
    id: 1,
    type: "Text",
    heading: "22 Years of Teaching Excellence",
    description1: "Bold Voive Spoken English Institute was established with a simple mission — to help students overcome hesitation and build confidence in spoken English. Over the years, the institute has successfully trained thousands of students through practical and interactive learning methods.",
    description2: "Our focus is not only on speaking English, but also on personality development, interview preparation, and communication skills. We believe every student has potential, and with proper guidance, they can achieve success in academics, career, and life."
  },
  {
    id: 2,
    type: "Image",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop"
  }
];

const FoundingStory = () => {
  return (
    <div className="relative w-full py-20 overflow-hidden">
      
      <div className="absolute top-0 right-[-5%] select-none pointer-events-none z-0">
        <h2 className="text-[10rem] md:text-[16rem] font-bold text-[var(--text-primary)]/[0.02] tracking-tighter uppercase">Journey</h2>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {academyStory.map((story) => (
            story.type === "Image" ? (
              <div key={story.id} className="relative flex justify-center group order-last lg:order-none">
                <div className="absolute -inset-4 bg-[var(--accent-primary)]/10 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-80 transition duration-700"></div>
                
                <div className="ka-card p-3 rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--border-subtle)]">
                  <img 
                    src={story.imageUrl} 
                    alt="Our Journey" 
                    className="w-full max-w-[500px] rounded-[2rem] object-cover transition-all duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            ) : (
              <div key={story.id} className="ka-card flex flex-col gap-6 p-8 md:p-12 border border-[var(--border-subtle)] rounded-[2.5rem] shadow-xl">
                <div className="flex flex-col gap-3">
                  <div className="w-14 h-1 bg-[var(--brand-gradient)] rounded-full mb-1"></div>
                  
                  <Hieghlightedtext 
                    color="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]" 
                    data={story.heading}
                  />
                </div>
                
                <div className="flex flex-col gap-6">
                  <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed font-normal">
                    {story.description1}
                  </p>
                  
                  <p className="text-[var(--accent-primary)] text-sm sm:text-base leading-relaxed italic border-l-4 border-[var(--accent-primary)]/40 pl-6 bg-[var(--accent-primary)]/5 py-4 rounded-r-2xl">
                    {story.description2}
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-4 opacity-40">
                   <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--text-muted)]">Since 2010</span>
                   <div className="h-px flex-1 bg-gradient-to-r from-[var(--border-strong)] to-transparent"></div>
                </div>
              </div>
            )
          ))}
          
        </div>
      </div>
    </div>
  )
}

export default FoundingStory;

