import type { Macro, Obiettivi } from "../types";

interface Props {
  consumato: Macro;
  obiettivi: Obiettivi;
  completati: number;
  totale: number;
}

const R = 52;
const CIRC = 2 * Math.PI * R;

function MacroBar({ label, value, max, color, unit }: {
  label: string; value: number; max: number; color: string; unit: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[11px] font-semibold text-[#9A9187] uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold text-[#1C1915]">{value}<span className="text-[#9A9187] font-normal">{unit}</span></span>
      </div>
      <div className="h-1.5 bg-[#EAE6E0] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

const OBJ_DEFAULT: Obiettivi = { kcal: 2000, carbo: 250, proteine: 150, grassi: 80 };

export default function MacroRing({ consumato, obiettivi, completati, totale }: Props) {
  const obj = obiettivi ?? OBJ_DEFAULT;
  const kcalConsumate = consumato.kcal;
  const kcalTotali = obj.kcal;
  const pct = kcalTotali > 0 ? Math.min(Math.round((kcalConsumate / kcalTotali) * 100), 999) : 0;
  const dash = (Math.min(pct, 100) / 100) * CIRC;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
      <div className="flex items-center gap-5">

        {/* Ring */}
        <div className="relative w-[128px] h-[128px] flex-shrink-0">
          <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
            <circle cx="64" cy="64" r={R} fill="none" stroke="#EAE6E0" strokeWidth="11" />
            <circle
              cx="64" cy="64" r={R} fill="none"
              stroke={pct > 100 ? "#F59E0B" : "#27C882"} strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${CIRC}`}
              style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[22px] font-black text-[#1C1915] leading-none">{kcalConsumate}</span>
            <span className="text-[10px] text-[#9A9187] font-medium mt-0.5">/ {kcalTotali} kcal</span>
            <span className={`text-[11px] font-bold mt-1 ${pct > 100 ? "text-[#F59E0B]" : "text-[#27C882]"}`}>{pct}%</span>
          </div>
        </div>

        {/* Macros */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1C1915]">Consumati oggi</span>
            <span className="text-[10px] font-semibold text-[#27C882] bg-[#27C882]/10 px-2 py-0.5 rounded-full">
              {completati}/{totale} pasti
            </span>
          </div>
          <MacroBar label="Carboidrati" value={consumato.carbo} max={obj.carbo} color="#27C882" unit="g" />
          <MacroBar label="Proteine" value={consumato.proteine} max={obj.proteine} color="#6366F1" unit="g" />
          <MacroBar label="Grassi" value={consumato.grassi} max={obj.grassi} color="#F59E0B" unit="g" />
        </div>
      </div>
    </div>
  );
}
