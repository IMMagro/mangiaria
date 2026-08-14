interface Props {
  open: boolean;
  onClose: () => void;
  onSpesa: () => void;
  onPasto: () => void;
  onScanner?: () => void;
}

export default function FabMenu({ open, onClose, onSpesa, onPasto, onScanner }: Props) {
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
          {onScanner && (
            <button
              onClick={() => { onScanner(); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-4 active:bg-[#F8F6F2] transition-colors border-t border-[#F0EDE8]"
            >
              <span className="w-10 h-10 rounded-2xl bg-[#F59E0B]/12 flex items-center justify-center text-[#F59E0B]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3M8 8h1v8H8zM11 8h2v8h-2zM15 8h1v8h-1z" />
                </svg>
              </span>
              <div className="text-left">
                <p className="text-sm font-bold text-[#1C1915]">Scansiona Barcode</p>
                <p className="text-[11px] text-[#9A9187]">Cerca tramite codice a barre</p>
              </div>
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes fabpop{from{opacity:0;transform:translateY(8px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  );
}

