interface Props {
  open: boolean;
  onClose: () => void;
  onSpesa: () => void;
  onPasto: () => void;
}

export default function FabMenu({ open, onClose, onSpesa, onPasto }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[430px]" style={{ bottom: 96 }}>
        <div
          className="mx-auto w-64 bg-white rounded-3xl shadow-2xl border border-black/5 overflow-hidden animate-[fabpop_0.18s_ease-out]"
          onClick={(e) => e.stopPropagation()}
          style={{ transformOrigin: "bottom center" }}
        >
          <button
            onClick={() => { onPasto(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-4 active:bg-[#F8F6F2] transition-colors border-b border-[#F0EDE8]"
          >
            <span className="w-10 h-10 rounded-2xl bg-[#27C882]/12 flex items-center justify-center text-lg">🍽️</span>
            <div className="text-left">
              <p className="text-sm font-bold text-[#1C1915]">Registra pasto</p>
              <p className="text-[11px] text-[#9A9187]">Un pasto libero nel diario</p>
            </div>
          </button>
          <button
            onClick={() => { onSpesa(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-4 active:bg-[#F8F6F2] transition-colors"
          >
            <span className="w-10 h-10 rounded-2xl bg-[#6366F1]/12 flex items-center justify-center text-lg">🛒</span>
            <div className="text-left">
              <p className="text-sm font-bold text-[#1C1915]">Aggiungi alla spesa</p>
              <p className="text-[11px] text-[#9A9187]">Un articolo alla lista</p>
            </div>
          </button>
        </div>
      </div>
      <style>{`@keyframes fabpop{from{opacity:0;transform:translateY(8px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  );
}
