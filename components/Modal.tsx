function Modal({ show, onClose, children }: { show: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl p-8 w-full max-w-lg border border-gray-200 animate-scaleIn">
        {children}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-[#0A1E2D] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
