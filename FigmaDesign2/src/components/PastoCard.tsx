import { useState } from "react";
import type { DiarioPasto, StatoPasto } from "../types";
import StatoChip from "./StatoChip";
import { macroPasto } from "../data";
import { TIPO_FOTO as FOTO, TIPO_ORA as ORA, TIPO_LABEL_BREVE as LABEL } from "../mealMeta";

import { useCardExpanded, toggleCardExpanded } from "../store";
import SwapAlimentoSheet from "./SwapAlimentoSheet";

interface Props {
  pasto: DiarioPasto;
  onStatoChange: (id: string, stato: StatoPasto) => void;
  onPorzioneChange: (pastoId: string, titoloLogico: string, porzioneId: string) => void;
  onSwap: (pastoId: string, titoloLogico: string, nuovaPorzione: any) => void;
}

export default function PastoCard({ pasto, onStatoChange, onPorzioneChange, onSwap }: Props) {
  const hasFood = pasto.scelteEffettuate.length > 0;
  const expanded = useCardExpanded(pasto.id, hasFood);
  const [swapTarget, setSwapTarget] = useState<string | null>(null);
  const isCompleted = pasto.stato === "completato";
  const kcal = Math.round(macroPasto(pasto).kcal);

  return (
    <div
      className="rounded-3xl overflow-hidden shadow-sm border border-black/5 transition-all duration-300"
      style={{ background: "#fff" }}
    >
      {/* Photo hero */}
      <div className="relative h-44 overflow-hidden bg-[#EAE6E0]">
        <img
          src={FOTO[pasto.tipo]}
          alt={LABEL[pasto.tipo]}
          className={`w-full h-full object-cover transition-all duration-500 ${isCompleted ? "brightness-75 saturate-50" : ""}`}
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

        {/* Text + chip over photo */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex items-end justify-between">
          <div>
            <p className="text-white/60 text-[11px] font-semibold uppercase tracking-widest mb-0.5">
              {ORA[pasto.tipo]}
            </p>
            <h3 className="font-display text-2xl font-black text-white leading-none">
              {LABEL[pasto.tipo]}
            </h3>
          </div>
          <StatoChip
            stato={pasto.stato}
            onChange={(next) => onStatoChange(pasto.id, next)}
          />
        </div>
      </div>

      {/* Body */}
      {hasFood ? (
        <div>
          {/* Expand toggle */}
          <button
            onClick={() => toggleCardExpanded(pasto.id, expanded)}
            className="w-full flex items-center justify-between px-4 py-3 border-b border-[#F0EDE8] active:bg-[#F8F6F2] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1C1915]">
                {pasto.scelteEffettuate.length} componenti
              </span>
              <span className="text-[10px] font-bold text-[#9A9187] bg-[#F0EDE8] px-2 py-0.5 rounded-full">
                {kcal} kcal
              </span>
              {pasto.scelteEffettuate.some((s) => s.alternative.length > 1) && (
                <span className="text-[10px] font-semibold text-[#27C882] bg-[#27C882]/10 px-2 py-0.5 rounded-full">
                  Personalizzabile
                </span>
              )}
            </div>
            <span
              className="text-[#9A9187] text-base transition-transform duration-300"
              style={{ display: "inline-block", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              ▾
            </span>
          </button>

          {/* Food choices */}
          {expanded && (
            <div className="px-4 py-4 space-y-3">
              {pasto.scelteEffettuate.map((scelta) => {
                const sel = scelta.alternative.find((p) => p.id === scelta.porzioneSelezionataId);
                return (
                  <div key={scelta.titoloLogico}>
                    <p className="text-[10px] font-bold text-[#9A9187] uppercase tracking-widest mb-1.5">
                      {scelta.titoloLogico}
                    </p>
                    <div className="relative">
                      <select
                        value={scelta.porzioneSelezionataId}
                        onChange={(e) => {
                          if (e.target.value === "SWAP") setSwapTarget(scelta.titoloLogico);
                          else onPorzioneChange(pasto.id, scelta.titoloLogico, e.target.value);
                        }}
                        className="w-full appearance-none bg-[#F8F6F2] rounded-2xl px-3.5 py-3 pr-10 text-sm font-semibold text-[#1C1915] border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#27C882]/50 focus:border-[#27C882] transition-all cursor-pointer"
                      >
                        {scelta.alternative.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.alimento.nome} · {p.quantita} {p.alimento.unitaMisura} {p.note ? `(${p.note})` : ""}
                          </option>
                        ))}
                        <option value="NIENTE">Niente</option>
                        <option value="SWAP">⟲ Sostituisci alimento...</option>
                      </select>
                      <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/5 flex items-center justify-center">
                        <span className="text-[#1C1915] text-[10px] font-bold leading-none">▾</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 py-4">
          <p className="text-sm text-[#9A9187] italic">Nessun alimento pianificato</p>
        </div>
      )}
      {/* Swap Sheet */}
      {swapTarget && (
        <SwapAlimentoSheet
          open={!!swapTarget}
          onClose={() => setSwapTarget(null)}
          titoloLogico={swapTarget}
          onSwap={(nuovo) => onSwap(pasto.id, swapTarget, nuovo)}
        />
      )}
    </div>
  );
}
