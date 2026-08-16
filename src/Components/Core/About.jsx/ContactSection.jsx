import { FiArrowUpRight } from "react-icons/fi";
import { HiOutlineMail } from "react-icons/hi";
import { FiPhone } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";

const ContactSection = () => {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden px-8 py-10">

      
      <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        text-[12rem] font-bold tracking-wider text-white/5 pointer-events-none">
        CONTACT
      </h1>

      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] 
        bg-emerald-500/10 blur-[120px]"></div>

      
      <div className="flex justify-center mb-16">
        <div className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 
          rounded-full flex items-center gap-6 text-sm">

          <span className="text-gray-400 cursor-pointer hover:text-white">Home</span>
          <span className="text-gray-400 cursor-pointer hover:text-white">Integrations</span>
          <span className="text-gray-400 cursor-pointer hover:text-white">Pricing</span>
          <span className="text-gray-400 cursor-pointer hover:text-white">Logs</span>

          <span className="px-3 py-1 bg-white/10 rounded-full">Contact</span>

          <button className="ml-2 px-4 py-1.5 bg-white text-black rounded-full 
            flex items-center gap-1 hover:opacity-80 transition">
            Get Template <FiArrowUpRight />
          </button>
        </div>
      </div>

      
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

        
        <div className="space-y-6">

          
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/5 border 
            border-white/10 rounded-full text-sm text-gray-300">
            ⓘ CONTACT
          </div>

          <h2 className="text-6xl font-bold">Get in touch</h2>
          <p className="text-gray-400 max-w-md">
            Have questions or ready to transform your business with AI automation?
          </p>

          
          <div className="space-y-4 mt-6">

            
            <div className="flex items-center justify-between bg-white/5 backdrop-blur-lg 
              border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <HiOutlineMail size={20} />
                <div>
                  <p className="text-sm text-gray-400">Email us</p>
                  <p className="text-white">johnnykyurov@gmail.com</p>
                </div>
              </div>
              <button className="p-2 bg-white/10 rounded-full">
                <FiArrowUpRight />
              </button>
            </div>

            
            <div className="flex items-center justify-between bg-white/5 backdrop-blur-lg 
              border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <FiPhone size={20} />
                <div>
                  <p className="text-sm text-gray-400">Call us</p>
                  <p className="text-white">(501) 123-4567</p>
                </div>
              </div>
              <button className="p-2 bg-white/10 rounded-full">
                <FiArrowUpRight />
              </button>
            </div>

            
            <div className="flex items-center justify-between bg-white/5 backdrop-blur-lg 
              border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <IoLocationOutline size={20} />
                <div>
                  <p className="text-sm text-gray-400">Our location</p>
                  <p className="text-white">Crosby Street, NY, US</p>
                </div>
              </div>
              <button className="p-2 bg-white/10 rounded-full">
                <FiArrowUpRight />
              </button>
            </div>
          </div>
        </div>

        
        <div className="bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/10 
          rounded-[2.5rem] p-8 space-y-4">

          <input
            type="text"
            placeholder="Name"
            className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl 
              px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl 
              px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
          />

          <textarea
            rows={5}
            placeholder="Message"
            className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl 
              px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
          />

          <button className="w-full bg-white text-black font-semibold py-3 rounded-xl 
            shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:opacity-90 transition">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
