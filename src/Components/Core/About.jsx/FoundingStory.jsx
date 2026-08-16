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
    <div className="relative w-full py-24 overflow-hidden">
      
      <div className="absolute top-0 right-[-5%] select-none pointer-events-none z-0">
        <h2 className="text-[12rem] md:text-[18rem] font-bold text-white/[0.02] tracking-tighter uppercase">Journey</h2>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {academyStory.map((story) => (
            story.type === "Image" ? (
              
              <div key={story.id} className="relative flex justify-center group order-last lg:order-none">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-80 transition duration-1000"></div>
                
                <div className="relative p-2 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-sm shadow-2xl overflow-hidden">
                   
                  <img 
                    src={story.imageUrl} 
                    alt="Our Journey" 
                    className="w-full max-w-[500px] rounded-[2rem] object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
              </div>
            ) : (
              
              <div key={story.id} className="flex flex-col gap-8 p-8 md:p-14 bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-2xl shadow-inner">
                <div className="flex flex-col gap-4">
                  
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-emerald-500 rounded-full mb-2"></div>
                  
                  <Hieghlightedtext 
                    color="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent" 
                    data={story.heading}
                  />
                </div>
                
                <div className="flex flex-col gap-8">
                  <p className="text-gray-400 text-lg leading-relaxed font-light">
                    {story.description1}
                  </p>
                  
                  
                  <p className="text-emerald-400/90 text-base md:text-lg leading-relaxed italic border-l-4 border-emerald-500/30 pl-8 bg-emerald-500/5 py-4 rounded-r-2xl">
                    {story.description2}
                  </p>
                </div>

                
                <div className="pt-6 flex items-center gap-4 opacity-20">
                   <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white">Since 2010</span>
                   <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
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
