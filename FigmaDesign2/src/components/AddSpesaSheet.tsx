import { useState } from "react";
import Sheet from "./Sheet";
import { addArticolo, CATEGORIE_SPESA } from "../store";
import { showToast } from "./Toast";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddSpesaSheet({ open, onClose }: Props) {
  const [nome, setNome] = useState("");
  const [quantita, setQuantita] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIE_SPESA[0]);

  function reset() {
    setNome("");
    setQuantita("");
    setCategoria(CATEGORIE_SPESA[0]);
  }

  function submit() {
    const n = nome.trim();
    if (!n) return;
    addArticolo({ nome: n, quantita: quantita.trim() || "1", categoria });
    showToast(`"${n}" aggiunto alla spesa`);
    reset();
    onClose();
  }

  const inputCls =
    "w-full bg-white border border-black/5 rounded-2xl px-4 py-3 text-sm font-medium text-[#1C1915] placeholder:text-[#C5BFB8] focus:outline-none focus:ring-2 focus:ring-[#27C882]/40 shadow-sm";

  return (
    <Sheet open={open} onClose={onClose} title="Aggiungi alla spesa">
      <div className="space-y-3">
        <input
          autoFocus
          className={inputCls}
          placeholder="Nome articolo (es. Pane integrale)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <div className="flex gap-3">
          <input
            className={inputCls}
            placeholder="Quantità (es. 500 g)"
            value={quantita}
            onChange={(e) => setQuantita(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>
        <div>
          <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-2">Categoria</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIE_SPESA.map((c) => (
              <button
                key={c}
                onClick={() => setCategoria(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                  categoria === c
                    ? "bg-[#1C1915] text-white shadow-sm"
                    : "bg-white text-[#9A9187] border border-black/5"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={submit}
          disabled={!nome.trim()}
          className="w-full py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #27C882 0%, #1AA86A 100%)" }}
        >
          Aggiungi articolo
        </button>
      </div>
    </Sheet>
  );
}
