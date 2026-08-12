import { useState } from "react";
import Sheet from "./Sheet";
import { allAlimenti } from "../data";
import { showToast } from "./Toast";
import type { AlimentoDef } from "../data";

interface Props {
  open: boolean;
  onClose: () => void;
  onSwap: (nuovo: { alimento: AlimentoDef; quantita: number }) => void;
  titoloLogico: string;
}

export default function SwapAlimentoSheet({ open, onClose, onSwap, titoloLogico }: Props) {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [selId, setSelId] = useState<string | null>(null);

  const alimenti = allAlimenti().filter((a) => a.nome.toLowerCase().includes(search.toLowerCase()));
  const sel = alimenti.find((a) => a.id === selId);

  function submit() {
    if (!sel || !q) return;
    const quantita = parseFloat(q);
    if (isNaN(quantita) || quantita <= 0) return;
    
    onSwap({ alimento: sel, quantita });
    showToast(`Sostituito con ${sel.nome}`);
    setQ("");
    setSearch("");
    setSelId(null);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={`Sostituisci ${titoloLogico}`}>
      <div className="space-y-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Cerca alimento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 text-sm font-medium text-[#1C1915] placeholder:text-[#C5BFB8] focus:outline-none focus:ring-2 focus:ring-[#27C882]/40"
        />

        {/* List */}
        <div className="max-h-48 overflow-y-auto space-y-1 bg-white rounded-2xl border border-black/5 p-1">
          {alimenti.length === 0 && <p className="text-center text-[#9A9187] text-xs p-4">Nessun alimento trovato.</p>}
          {alimenti.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelId(a.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                selId === a.id ? "bg-[#27C882]/10 text-[#1AA86A]" : "text-[#1C1915] active:bg-[#F8F6F2]"
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{a.nome}</span>
                <span className="text-[10px] text-[#9A9187] font-bold">{a.nutri.kcal} kcal</span>
              </div>
            </button>
          ))}
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-3 bg-[#F8F6F2] p-1 rounded-2xl">
          <input
            type="number"
            placeholder="Quantità"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 bg-white rounded-xl px-4 py-3 text-sm font-bold text-[#1C1915] text-center border-none focus:ring-2 focus:ring-[#27C882]/40"
          />
          <span className="w-12 text-center text-sm font-bold text-[#9A9187] uppercase">
            {sel?.unitaMisura || "-"}
          </span>
        </div>

        <button
          onClick={submit}
          disabled={!sel || !q}
          className="w-full py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #27C882 0%, #1AA86A 100%)" }}
        >
          Conferma Sostituzione
        </button>
      </div>
    </Sheet>
  );
}
