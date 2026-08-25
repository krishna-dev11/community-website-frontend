
const Tab = ({ tabData, accountType, setaccountType }) => {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border-subtle)] h-12 w-full max-w-[420px] mx-auto rounded-xl flex p-1">
      {tabData.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setaccountType(tab.type)}
          className={`flex-1 text-sm font-medium rounded-lg transition-all duration-200
            ${
              accountType === tab.type
                ? "bg-[var(--accent-primary)] text-[#070707] shadow-md"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            }
          `}
        >
          {tab.tabName}
        </button>
      ))}
    </div>
  );
};

export default Tab;
