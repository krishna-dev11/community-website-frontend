import Hieghlightedtext from "../Home/Hieghlightedtext";

const QuoteSection = () => {
  return (
    <div className="relative z-10 flex flex-col items-center py-20 px-6 max-w-6xl mx-auto text-center">
      <p className="text-white text-3xl md:text-5xl font-bold leading-[1.3] tracking-tight">
        "Communication is the foundation of success. At Bold Voive Spoken English Institute, 
        <Hieghlightedtext color="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent px-2" data="global opportunities" />. 
         we focus on practical speaking, personality development, and confidence building to help 
        <Hieghlightedtext data="practical conversation" color="text-emerald-400 px-2" /> with 
        <Hieghlightedtext color="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent px-2" data="real-world confidence" /> 
         every student express themselves fluently and achieve their goals."
      </p>
    </div>
  );
};

export default QuoteSection;
