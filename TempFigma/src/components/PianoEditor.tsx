import { useEffect, useState } from "react";
import type { Alimento, DiarioPasto, Porzione, SceltaVoce, TipoPasto } from "../types";
import type { AlimentoDef } from "../data";
import { allAlimenti, alimentoBase } from "../data";
import {
  pianoPasti,
  setPianoWeekday,
  resetPianoWeekday,
  isPianoCustom,
  addAlimentoCustom,
} from "../store";
import { GIORNI_SETTIMANA_BREVE, TIPO_LABEL, TIPO_ORA, TUTTI_TIPI } from "../mealMeta";
import { showToast } from "./Toast";

let seq = 0;
const uid = (p: string) => `${p}_${Date.now()}_${seq++}`;

function nuovaPorzione(def: AlimentoDef): Porzione {
  const base = alimentoBase(def.id) as Alimento;
  return { id: uid("por"), alimento: base, quantita: def.unitaMisura === "pz" ? 1 : 100 };
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PianoEditor({ open, onClose }: Props) {
  const [wd, setWd] = useState(0);
  const [pasti, setPasti] = useState<DiarioPasto[]>([]);
  const [picker, setPicker] = useState<{ pi: number; ci: number } | null>(null);
  const [addMealOpen, setAddMealOpen] = useState(false);

  useEffect(() => {
    if (open) setPasti(pianoPasti(wd));
  }, [open, wd]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (picker) setPicker(null);
        else if (addMealOpen) setAddMealOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, picker, addMealOpen]);

  if (!open) return null;

  function commit(next: DiarioPasto[]) {
    setPasti(next);
    setPianoWeekday(wd, next);
  }

  // ── mutations ──
  const editPasto = (pi: number, fn: (p: DiarioPasto) => DiarioPasto) =>
    commit(pasti.map((p, i) => (i === pi ? fn(p) : p)));
  const editScelta = (pi: number, ci: number, fn: (s: SceltaVoce) => SceltaVoce) =>
    editPasto(pi, (p) => ({ ...p, scelteEffettuate: p.scelteEffettuate.map((s, i) => (i === ci ? fn(s) : s)) }));

  function addMeal(tipo: TipoPasto) {
    commit([...pasti, { id: uid(`p_${wd}_${tipo}`), tipo, stato: "daConsumare", scelteEffettuate: [] }]);
    setAddMealOpen(false);
  }
  const removeMeal = (pi: number) => commit(pasti.filter((_, i) => i !== pi));

  const addComponent = (pi: number) =>
    editPasto(pi, (p) => ({
      ...p,
      scelteEffettuate: [...p.scelteEffettuate, { titoloLogico: "Nuovo gruppo", alternative: [], porzioneSelezionataId: "" }],
    }));
  const removeComponent = (pi: number, ci: number) =>
    editPasto(pi, (p) => ({ ...p, scelteEffettuate: p.scelteEffettuate.filter((_, i) => i !== ci) }));
  const setTitolo = (pi: number, ci: number, titoloLogico: string) =>
    editScelta(pi, ci, (s) => ({ ...s, titoloLogico }));

  function addAlternativa(pi: number, ci: number, def: AlimentoDef) {
    editScelta(pi, ci, (s) => {
      const por = nuovaPorzione(def);
      const alternative = [...s.alternative, por];
      return { ...s, alternative, porzioneSelezionataId: s.porzioneSelezionataId || por.id };
    });
    setPicker(null);
  }
  const removeAlternativa = (pi: number, ci: number, ai: number) =>
    editScelta(pi, ci, (s) => {
      const alternative = s.alternative.filter((_, i) => i !== ai);
      const stillSel = alternative.some((a) => a.id === s.porzioneSelezionataId);
      return { ...s, alternative, porzioneSelezionataId: stillSel ? s.porzioneSelezionataId : alternative[0]?.id ?? "" };
    });
  const setQuantita = (pi: number, ci: number, ai: number, quantita: number) =>
    editScelta(pi, ci, (s) => ({
      ...s,
      alternative: s.alternative.map((a, i) => (i === ai ? { ...a, quantita } : a)),
    }));

  function resetGiorno() {
    resetPianoWeekday(wd);
    setPasti(pianoPasti(wd));
    showToast("Giorno ripristinato ai valori predefiniti");
  }

  const smallInput =
    "bg-white border border-black/5 rounded-xl px-2.5 py-1.5 text-sm font-semibold text-[#1C1915] focus:outline-none focus:ring-2 focus:ring-[#27C882]/40 shadow-sm";

  return (
    <div className="fixed inset-0 z-40 flex justify-center bg-[#F0EDE8]">
      <div className="w-full max-w-[430px] flex flex-col h-full">
        {/* Header */}
        <header className="px-5 pt-12 pb-3 bg-[#F0EDE8]">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white shadow-sm border border-black/5 flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Chiudi"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1C1915">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <h1 className="font-display text-lg font-black text-[#1C1915]">Il mio piano</h1>
            <button
              onClick={resetGiorno}
              className="text-[11px] font-bold text-[#9A9187] bg-white px-3 py-2 rounded-full border border-black/5 shadow-sm active:scale-95 transition-transform"
            >
              Ripristina
            </button>
          </div>
          {/* Weekday tabs */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto">
            {GIORNI_SETTIMANA_BREVE.map((g, i) => (
              <button
                key={g}
                onClick={() => setWd(i)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 flex-shrink-0 ${
                  wd === i ? "bg-[#1C1915] text-white shadow-sm" : "bg-white text-[#9A9187] border border-black/5"
                }`}
              >
                {g}
                {isPianoCustom(i) && <span className="ml-1 text-[#27C882]">•</span>}
              </button>
            ))}
          </div>
        </header>

        {/* Meals */}
        <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-4">
          {pasti.map((pasto, pi) => (
            <div key={pasto.id} className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#F0EDE8]">
                <span className="text-[10px] font-bold text-[#9A9187] tabular-nums">{TIPO_ORA[pasto.tipo]}</span>
                <span className="text-sm font-black text-[#1C1915]">{TIPO_LABEL[pasto.tipo]}</span>
                <button
                  onClick={() => removeMeal(pi)}
                  className="ml-auto w-8 h-8 rounded-full bg-red-50 flex items-center justify-center active:scale-90 transition-transform"
                  aria-label="Elimina pasto"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#EF4444">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>
              </div>

              <div className="px-4 py-3 space-y-4">
                {pasto.scelteEffettuate.map((scelta, ci) => (
                  <div key={ci}>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        value={scelta.titoloLogico}
                        onChange={(e) => setTitolo(pi, ci, e.target.value)}
                        className="text-[10px] font-bold text-[#9A9187] uppercase tracking-widest bg-transparent border-b border-dashed border-[#D0CBC3] focus:outline-none focus:border-[#27C882] flex-1"
                      />
                      <button
                        onClick={() => removeComponent(pi, ci)}
                        className="text-[10px] font-bold text-red-400"
                      >
                        rimuovi
                      </button>
                    </div>
                    <div className="space-y-2">
                      {scelta.alternative.map((alt, ai) => (
                        <div key={alt.id} className="flex items-center gap-2 bg-[#F8F6F2] rounded-2xl px-3 py-2">
                          <span className="flex-1 text-sm font-semibold text-[#1C1915] truncate">{alt.alimento.nome}</span>
                          <input
                            type="number"
                            value={alt.quantita}
                            onChange={(e) => setQuantita(pi, ci, ai, Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className={smallInput + " w-16 text-right"}
                          />
                          <span className="text-[10px] text-[#9A9187] w-4">{alt.alimento.unitaMisura}</span>
                          <button
                            onClick={() => removeAlternativa(pi, ci, ai)}
                            className="w-7 h-7 rounded-full bg-white flex items-center justify-center active:scale-90 flex-shrink-0"
                            aria-label="Rimuovi alternativa"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#9A9187">
                              <path d="M19 13H5v-2h14v2z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setPicker({ pi, ci })}
                        className="text-xs font-bold text-[#27C882] active:scale-95 transition-transform"
                      >
                        + Aggiungi alternativa
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addComponent(pi)}
                  className="w-full py-2.5 rounded-2xl text-xs font-bold text-[#1C1915] bg-[#F0EDE8] active:scale-[0.98] transition-transform"
                >
                  + Aggiungi gruppo (es. Carboidrati)
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => setAddMealOpen(true)}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg active:scale-[0.98] transition-all"
            style={{ background: "linear-gradient(135deg, #27C882 0%, #1AA86A 100%)" }}
          >
            + Aggiungi pasto
          </button>
        </div>
      </div>

      {/* Add-meal picker */}
      {addMealOpen && (
        <PickerOverlay title="Che pasto aggiungere?" onClose={() => setAddMealOpen(false)}>
          <div className="space-y-2">
            {TUTTI_TIPI.map((t) => (
              <button
                key={t}
                onClick={() => addMeal(t)}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-[#F8F6F2] rounded-2xl active:bg-[#EFEBE5] transition-colors"
              >
                <span className="text-sm font-bold text-[#1C1915]">{TIPO_LABEL[t]}</span>
                <span className="text-[10px] text-[#9A9187]">{TIPO_ORA[t]}</span>
              </button>
            ))}
          </div>
        </PickerOverlay>
      )}

      {/* Food picker */}
      {picker && (
        <FoodPicker
          onClose={() => setPicker(null)}
          onPick={(def) => addAlternativa(picker.pi, picker.ci, def)}
        />
      )}
    </div>
  );
}

function PickerOverlay({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-[430px] bg-[#FCFAF8] rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3"><div className="w-10 h-1 rounded-full bg-[#D0CBC3]" /></div>
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <h2 className="font-display text-xl font-black text-[#1C1915]">{title}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#F0EDE8] flex items-center justify-center active:scale-90" aria-label="Chiudi">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#9A9187"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
          </button>
        </div>
        <div className="px-5 pb-8 pt-1">{children}</div>
      </div>
    </div>
  );
}

const CAT: Alimento["categoria"][] = ["carboidrati", "proteine", "grassi", "verdura", "frutta", "altro"];
const UNITA: Alimento["unitaMisura"][] = ["g", "ml", "pz"];

function FoodPicker({ onClose, onPick }: { onClose: () => void; onPick: (def: AlimentoDef) => void }) {
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const lista = allAlimenti().filter((a) => a.nome.toLowerCase().includes(q.toLowerCase()));

  // new food form
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState<Alimento["categoria"]>("carboidrati");
  const [unita, setUnita] = useState<Alimento["unitaMisura"]>("g");
  const [kcal, setKcal] = useState("");
  const [carbo, setCarbo] = useState("");
  const [prot, setProt] = useState("");
  const [gras, setGras] = useState("");

  function creaAlimento() {
    const n = nome.trim();
    if (!n) return;
    const num = (v: string) => Math.max(0, parseFloat(v.replace(",", ".")) || 0);
    const def = addAlimentoCustom({
      nome: n,
      categoria,
      unitaMisura: unita,
      nutri: { kcal: num(kcal), carbo: num(carbo), proteine: num(prot), grassi: num(gras) },
    });
    onPick(def);
  }

  const inp = "w-full bg-white border border-black/5 rounded-2xl px-3 py-2.5 text-sm font-medium text-[#1C1915] placeholder:text-[#C5BFB8] focus:outline-none focus:ring-2 focus:ring-[#27C882]/40 shadow-sm";

  return (
    <PickerOverlay title={creating ? "Nuovo alimento" : "Scegli alimento"} onClose={onClose}>
      {!creating ? (
        <>
          <input autoFocus className={inp + " mb-3"} placeholder="Cerca alimento…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="space-y-1.5 max-h-[45vh] overflow-y-auto">
            {lista.map((a) => (
              <button
                key={a.id}
                onClick={() => onPick(a)}
                className="w-full flex items-center justify-between px-3.5 py-3 bg-[#F8F6F2] rounded-2xl active:bg-[#EFEBE5] transition-colors text-left"
              >
                <span className="text-sm font-semibold text-[#1C1915]">{a.nome}</span>
                <span className="text-[10px] text-[#9A9187]">{a.nutri.kcal} kcal/{a.unitaMisura === "pz" ? "pz" : "100" + a.unitaMisura}</span>
              </button>
            ))}
            {lista.length === 0 && <p className="text-sm text-[#9A9187] text-center py-6">Nessun alimento trovato</p>}
          </div>
          <button
            onClick={() => { setNome(q); setCreating(true); }}
            className="w-full mt-3 py-3 rounded-2xl text-sm font-bold text-[#27C882] bg-[#27C882]/10 active:scale-[0.98] transition-transform"
          >
            + Crea nuovo alimento
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <input autoFocus className={inp} placeholder="Nome alimento" value={nome} onChange={(e) => setNome(e.target.value)} />
          <div className="flex flex-wrap gap-1.5">
            {CAT.map((c) => (
              <button key={c} onClick={() => setCategoria(c)} className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold capitalize ${categoria === c ? "bg-[#1C1915] text-white" : "bg-white text-[#9A9187] border border-black/5"}`}>{c}</button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-[11px] font-bold text-[#9A9187]">Unità</span>
            {UNITA.map((u) => (
              <button key={u} onClick={() => setUnita(u)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${unita === u ? "bg-[#1C1915] text-white" : "bg-white text-[#9A9187] border border-black/5"}`}>{u}</button>
            ))}
          </div>
          <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest">Valori per {unita === "pz" ? "1 pezzo" : "100 " + unita}</p>
          <div className="grid grid-cols-4 gap-2">
            <input className={inp + " text-center px-1"} inputMode="numeric" placeholder="kcal" value={kcal} onChange={(e) => setKcal(e.target.value)} />
            <input className={inp + " text-center px-1"} inputMode="numeric" placeholder="carbo" value={carbo} onChange={(e) => setCarbo(e.target.value)} />
            <input className={inp + " text-center px-1"} inputMode="numeric" placeholder="prot" value={prot} onChange={(e) => setProt(e.target.value)} />
            <input className={inp + " text-center px-1"} inputMode="numeric" placeholder="grassi" value={gras} onChange={(e) => setGras(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCreating(false)} className="flex-1 py-3 rounded-2xl text-sm font-bold text-[#9A9187] bg-[#F0EDE8]">Indietro</button>
            <button
              onClick={creaAlimento}
              disabled={!nome.trim()}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #27C882 0%, #1AA86A 100%)" }}
            >
              Crea e aggiungi
            </button>
          </div>
        </div>
      )}
    </PickerOverlay>
  );
}
