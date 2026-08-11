import { useState } from "react";
import Sheet from "./Sheet";
import { addExtraPasto } from "../store";
import { showToast } from "./Toast";

interface Props {
  open: boolean;
  onClose: () => void;
  data: Date;
}

export default function AddPastoSheet({ open, onClose, data }: Props) {
  const [nome, setNome] = useState("");
  const [kcal, setKcal] = useState("");
  const [carbo, setCarbo] = useState("");
  const [proteine, setProteine] = useState("");
  const [grassi, setGrassi] = useState("");

  function reset() {
    setNome("");
    setKcal("");
    setCarbo("");
    setProteine("");
    setGrassi("");
  }

  function num(v: string) {
    const n = parseFloat(v.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function submit() {
    const n = nome.trim();
    if (!n) return;
    addExtraPasto(data, {
      nome: n,
      kcal: Math.round(num(kcal)),
      carbo: Math.round(num(carbo)),
      proteine: Math.round(num(proteine)),
      grassi: Math.round(num(grassi)),
    });
    showToast(`"${n}" registrato nel diario`);
    reset();
    onClose();
  }

  const inputCls =
    "w-full bg-white border border-black/5 rounded-2xl px-4 py-3 text-sm font-medium text-[#1C1915] placeholder:text-[#C5BFB8] focus:outline-none focus:ring-2 focus:ring-[#27C882]/40 shadow-sm";
  const small =
    "w-full bg-white border border-black/5 rounded-2xl px-3 py-2.5 text-sm font-medium text-[#1C1915] placeholder:text-[#C5BFB8] focus:outline-none focus:ring-2 focus:ring-[#27C882]/40 shadow-sm text-center";

  return (
    <Sheet open={open} onClose={onClose} title="Registra un pasto libero">
      <div className="space-y-3">
        <input
          autoFocus
          className={inputCls}
          placeholder="Cosa hai mangiato? (es. Pizza margherita)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <input
          className={inputCls}
          placeholder="Calorie (kcal)"
          inputMode="numeric"
          value={kcal}
          onChange={(e) => setKcal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <div>
          <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-2">
            Macro (opzionale, in g)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <input className={small} placeholder="Carbo" inputMode="numeric" value={carbo} onChange={(e) => setCarbo(e.target.value)} />
            <input className={small} placeholder="Prot" inputMode="numeric" value={proteine} onChange={(e) => setProteine(e.target.value)} />
            <input className={small} placeholder="Grassi" inputMode="numeric" value={grassi} onChange={(e) => setGrassi(e.target.value)} />
          </div>
        </div>
        <button
          onClick={submit}
          disabled={!nome.trim()}
          className="w-full py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #27C882 0%, #1AA86A 100%)" }}
        >
          Registra pasto
        </button>
      </div>
    </Sheet>
  );
}
