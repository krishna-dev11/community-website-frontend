import { FiMail, FiPhone, FiMapPin, FiArrowUpRight, FiHelpCircle } from "react-icons/fi";
import ContactForm from './ContactForm';

const ContactInfoCard = ({ icon: Icon, title, detail }) => (
  <div className="flex items-center justify-between p-4 ka-card border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/40 transition-all group cursor-pointer w-full">
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-[var(--surface-elevated)] flex items-center justify-center border border-[var(--border-subtle)] shrink-0 group-hover:border-[var(--accent-primary)]/40 transition-colors">
        <Icon className="text-[var(--accent-primary)] text-xl" />
      </div>
      <div>
        <p className="text-[var(--text-primary)] font-bold text-sm mb-0.5">{title}</p>
        <p className="text-[var(--text-secondary)] text-[11px] md:text-xs font-medium tracking-wide leading-tight">{detail}</p>
      </div>
    </div>
    <div className="w-8 h-8 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center border border-[var(--border-subtle)] group-hover:bg-[var(--accent-primary)] group-hover:text-[#070707] text-[var(--text-secondary)] transition-all duration-300 shrink-0 ml-2">
      <FiArrowUpRight size={14} />
    </div>
  </div>
);

const GetInTouchSection = () => {
  return (
    <div className='flex flex-col lg:flex-row w-full bg-[var(--bg)] overflow-hidden gap-8 lg:gap-12 items-center'>

      {/* Left Info Column */}
      <div className="relative w-full lg:w-1/2 text-[var(--text-primary)] flex flex-col justify-center py-6">
        
        {/* Background Watermark */}
        <div className="absolute top-10 right-[-5%] select-none pointer-events-none opacity-10 lg:opacity-100">
          <h1 className="text-[8rem] md:text-[12rem] lg:text-[14rem] font-bold text-[var(--text-primary)]/[0.03] tracking-widest uppercase leading-none">
            Contact
          </h1>
        </div>

        {/* Glow */}
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[var(--accent-primary)]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          
          <div className="eyebrow-badge mb-2">
            <FiHelpCircle className="text-[var(--accent-primary)]" size={14} />
            <span>Inquiry Node</span>
          </div>

          <h2 className="heading-hero text-[var(--text-primary)] mb-1">
            Get in <span className="text-gradient">touch</span>
          </h2>

          <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed max-w-[440px] mb-4 font-normal">
            Have questions about our spoken English courses? Contact Bold Voive Academy today for confident communication.
          </p>

          <div className="flex flex-col gap-4 max-w-md w-full">
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

      {/* Right Form Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-6">
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

