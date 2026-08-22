const ConfirmationModal = ({ data, modalData }) => {
  const config = modalData || data;
  if (!config) return null;

  const handle1 = config.button1Handler || config.btn1Onclick;
  const handle2 = config.button2Handler || config.btn2Onclick;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
      <div className="w-full max-w-md ka-card p-6 sm:p-8 shadow-2xl border border-[var(--border-strong)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{config.heading}</h2>
        <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed font-normal">{config.text1 || config.text2}</p>

        <div className="mt-6 flex gap-3 justify-end items-center">
          <button
            type="button"
            onClick={handle2}
            className="btn-secondary !py-2 !px-5 !text-xs"
          >
            {config.button2Text || "Cancel"}
          </button>
          <button
            type="button"
            onClick={handle1}
            className="inline-flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 transition-all shadow-md cursor-pointer"
          >
            {config.button1Text || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

