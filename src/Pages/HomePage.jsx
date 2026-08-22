import ModernFooter from "../Components/Core/Home/ModernFooter";

const HomePage = () => {
  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="page-gradient-glow left-[-140px] top-[-44px] opacity-60" />
      <div className="page-gradient-glow right-[-160px] top-[620px] opacity-40" />

      <ModernFooter />
    </div>
  );
};

export default HomePage;
