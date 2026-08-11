import { useRef, useState } from "react";
import type { StatoPasto } from "../types";

const STATI: StatoPasto[] = ["daConsumare", "completato", "pastoLibero", "saltato"];

const CONFIG: Record<StatoPasto, { label: string; style: string; dot: string; solid: string }> = {
  daConsumare: {
    label: "Da consumare",
    style: "bg-white/20 text-white border border-white/30 backdrop-blur-sm",
    dot: "bg-white/70",
    solid: "#9A9187",
  },
  completato: {
    label: "Completato",
    style: "bg-[#27C882] text-white border border-[#1FA86C]",
    dot: "bg-white",
    solid: "#27C882",
  },
  pastoLibero: {
    label: "Pasto libero",
    style: "bg-amber-400/90 text-white border border-amber-300",
    dot: "bg-white",
    solid: "#F59E0B",
  },
  saltato: {
    label: "Saltato",
    style: "bg-red-500/80 text-white border border-red-400",
    dot: "bg-white",
    solid: "#EF4444",
  },
};

interface Props {
  stato: StatoPasto;
  onChange: (next: StatoPasto) => void;
}

export default function StatoChip({ stato, onChange }: Props) {
  const cfg = CONFIG[stato];
  const [menu, setMenu] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);

  function clear() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }
  function down() {
    held.current = false;
    clear();
    timer.current = setTimeout(() => {
      held.current = true;
      setMenu(true);
    }, 420);
  }
  function up() {
    clear();
    if (!held.current) {
      const idx = STATI.indexOf(stato);
      onChange(STATI[(idx + 1) % STATI.length]);
    }
  }

  return (
    <>
      <button
        onPointerDown={down}
        onPointerUp={up}
        onPointerLeave={clear}
        onPointerCancel={clear}
        onContextMenu={(e) => e.preventDefault()}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all active:scale-95 touch-none select-none ${cfg.style}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        {cfg.label}
      </button>

      {menu && (
        <div className="fixed inset-0 z-40" onClick={() => setMenu(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[320px] px-6">
            <div
              className="bg-white rounded-3xl shadow-2xl border border-black/5 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest px-4 pt-4 pb-2">
                Stato del pasto
              </p>
              <div className="divide-y divide-[#F8F6F2] pb-1">
                {STATI.map((s) => {
                  const c = CONFIG[s];
                  const active = s === stato;
                  return (
                    <button
                      key={s}
                      onClick={() => { onChange(s); setMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-[#F8F6F2] transition-colors text-left"
                    >
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.solid }} />
                      <span className={`flex-1 text-sm ${active ? "font-black text-[#1C1915]" : "font-semibold text-[#1C1915]"}`}>
                        {c.label}
                      </span>
                      {active && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#27C882">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
