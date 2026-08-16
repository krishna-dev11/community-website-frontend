const ConfirmationModal = ({ data }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white">{data.heading}</h2>
        <p className="mt-3 text-sm text-gray-400">{data.text1}</p>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={data.btn2Onclick}
            className="rounded-xl border border-white/10 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            {data.button2Text}
          </button>
          <button
            type="button"
            onClick={data.btn1Onclick}
            className="rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-400"
          >
            {data.button1Text}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
