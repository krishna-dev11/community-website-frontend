import { FiMail, FiPhone, FiMapPin, FiArrowUpRight, FiHelpCircle } from "react-icons/fi";
import ContactForm from './ContactForm';

const ContactInfoCard = ({ icon: Icon, title, detail }) => (
  <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.07] transition-all group cursor-pointer w-full">
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
        <Icon className="text-white text-xl" />
      </div>
      <div>
        <p className="text-white font-semibold text-sm mb-0.5">{title}</p>
        <p className="text-gray-500 text-[11px] md:text-xs font-medium tracking-wide leading-tight">{detail}</p>
      </div>
    </div>
    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-300 shrink-0 ml-2">
      <FiArrowUpRight size={16} />
    </div>
  </div>
);

const GetInTouchSection = () => {
  return (
    <div className='flex flex-col lg:flex-row w-full min-h-screen bg-black overflow-hidden'>

      
      <div className="relative min-h-[500px] lg:min-h-[600px] w-full lg:w-1/2 text-white flex flex-col justify-center px-6 md:px-10 lg:pl-20 py-16">
        
        
        <div className="absolute top-10 right-[-5%] select-none pointer-events-none opacity-10 lg:opacity-100">
          <h1 className="text-[10rem] md:text-[15rem] lg:text-[18rem] font-bold text-white/[0.03] tracking-widest uppercase leading-none">
            Contact
          </h1>
        </div>

        
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          
          
          <div className="flex items-center gap-2 px-3 py-1.5 w-fit rounded-full bg-[#111] border border-white/10 shadow-inner">
            <FiHelpCircle className="text-gray-400" size={14} />
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-300">Inquiry Node</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-1">
            Get in <span className="text-teal-400">touch</span>
          </h2>

          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-[400px] mb-6">
            Have questions about our spoken English courses? Contact Bold Voive Academy today for confident communication.
          </p>

          
          <div className="flex flex-col gap-4 max-w-md">
            <ContactInfoCard 
              icon={FiMail} 
              title="Email Synchronization" 
              detail="boldvoiveenglish@gmail.com" 
            />
            <ContactInfoCard 
              icon={FiPhone} 
              title="Direct Helpline" 
              detail="+91 88002 70020" 
            />
            <ContactInfoCard 
              icon={FiMapPin} 
              title="Academy Location" 
              detail="Freeganj, Ujjain (MP)" 
            />
          </div>
        </div>
      </div>

      
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:pr-20 py-16 bg-white/[0.01] border-t lg:border-t-0 lg:border-l border-white/5">
        <div className="w-full max-w-[550px]">
          <ContactForm 
            heading={"Book Your Free Demo Class"} 
            description={"Fill the protocol form and our admin node will contact you with batch details and admission process."} 
          />
        </div>
      </div>

    </div>
  );
};

export default GetInTouchSection;
