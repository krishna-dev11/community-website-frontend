
const Tab = ({ tabData, accountType, setaccountType }) => {
  return (
    <div className="bg-[#0F0F0F] border border-gray-800 h-12 w-full max-w-[420px] mx-auto rounded-xl flex p-1">
      {tabData.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setaccountType(tab.type)}
          className={`flex-1 text-sm font-medium rounded-lg transition-all duration-200
            ${
              accountType === tab.type
                ? "bg-white text-black shadow-md"
                : "text-gray-400 hover:text-white hover:bg-[#1A1A1A]"
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
