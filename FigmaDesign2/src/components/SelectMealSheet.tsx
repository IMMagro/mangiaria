import React from 'react';
import Sheet from './Sheet';
import type { PastoDef } from '../data';

interface Props {
  open: boolean;
  onClose: () => void;
  pasti: PastoDef[];
  onSelect: (pastoId: string) => void;
}

export default function SelectMealSheet({ open, onClose, pasti, onSelect }: Props) {
  // Filtriamo i pasti "da effettuare" (es. quelli senza stato COMPLETO, o li mostriamo tutti ma evidenziamo)
  // Per ora li mostriamo tutti, o possiamo usare la logica di business per capire quali sono ancora validi.
  // L'utente ha chiesto "quali tra quelli che ancora sono da effettuare".
  // Nello stato attuale, possiamo semplicemente elencare tutti i pasti del giorno.

  return (
    <Sheet open={open} onClose={onClose} title="Scegli a quale pasto aggiungere">
      <div className="px-6 pb-8 space-y-3">
        {pasti.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="w-full flex items-center justify-between p-4 bg-[#F8F6F2] hover:bg-[#F3EFE9] rounded-2xl transition-colors text-left"
          >
            <div>
              <p className="text-sm font-black text-[#1C1915]">{p.nome}</p>
              <p className="text-[10px] font-bold text-[#9A9187] uppercase tracking-wider">{p.tipo}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-[#27C882]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </Sheet>
  );
}
