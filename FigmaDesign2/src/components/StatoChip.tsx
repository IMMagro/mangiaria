import type { StatoPasto } from "../types";

const STATI: StatoPasto[] = ["daConsumare", "completato", "pastoLibero", "saltato"];

const CONFIG: Record<StatoPasto, { label: string; style: string; dot: string }> = {
  daConsumare: {
    label: "Da consumare",
    style: "bg-white/20 text-white border border-white/30 backdrop-blur-sm",
    dot: "bg-white/70",
  },
  completato: {
    label: "Completato",
    style: "bg-[#27C882] text-white border border-[#1FA86C]",
    dot: "bg-white",
  },
  pastoLibero: {
    label: "Pasto libero",
    style: "bg-amber-400/90 text-white border border-amber-300",
    dot: "bg-white",
  },
  saltato: {
    label: "Saltato",
    style: "bg-red-500/80 text-white border border-red-400",
    dot: "bg-white",
  },
};

interface Props {
  stato: StatoPasto;
  onChange: (next: StatoPasto) => void;
}

export default function StatoChip({ stato, onChange }: Props) {
  const cfg = CONFIG[stato];

  function handleTap() {
    const idx = STATI.indexOf(stato);
    onChange(STATI[(idx + 1) % STATI.length]);
  }

  return (
    <button
      onClick={handleTap}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all active:scale-95 ${cfg.style}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </button>
  );
}
