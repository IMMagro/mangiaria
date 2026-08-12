import type { LivelloAttivita, Obiettivi, ObiettivoTipo, Sesso } from "./types";

export const ATTIVITA_LABEL: Record<LivelloAttivita, string> = {
  sedentario: "Sedentario",
  leggero: "Leggero (1-2 all.)",
  moderato: "Moderato (3-4 all.)",
  intenso: "Intenso (5-6 all.)",
  molto: "Molto intenso",
};

const ATTIVITA_FATTORE: Record<LivelloAttivita, number> = {
  sedentario: 1.2,
  leggero: 1.375,
  moderato: 1.55,
  intenso: 1.725,
  molto: 1.9,
};

export const OBIETTIVO_LABEL: Record<ObiettivoTipo, string> = {
  dimagrire: "Dimagrire",
  mantenere: "Mantenere",
  aumentare: "Aumentare massa",
};

const OBIETTIVO_FATTORE: Record<ObiettivoTipo, number> = {
  dimagrire: 0.83, // ~ -17%
  mantenere: 1,
  aumentare: 1.12, // ~ +12%
};

export interface DatiPersonali {
  peso: number; // kg
  altezza: number; // cm
  eta: number; // anni
  sesso: Sesso;
  attivita: LivelloAttivita;
  obiettivoTipo: ObiettivoTipo;
}

/** Mifflin–St Jeor BMR × activity × goal, then a sensible macro split. */
export function calcolaObiettivi(d: DatiPersonali): Obiettivi {
  const bmr =
    10 * d.peso + 6.25 * d.altezza - 5 * d.eta + (d.sesso === "uomo" ? 5 : -161);
  const tdee = bmr * ATTIVITA_FATTORE[d.attivita] * OBIETTIVO_FATTORE[d.obiettivoTipo];
  const kcal = Math.round(tdee / 10) * 10;

  // Protein 1.8 g/kg, fat 0.9 g/kg, carbs = remaining calories.
  const proteine = Math.round(1.8 * d.peso);
  const grassi = Math.round(0.9 * d.peso);
  const kcalRimanenti = Math.max(kcal - proteine * 4 - grassi * 9, 0);
  const carbo = Math.round(kcalRimanenti / 4);

  return { kcal, carbo, proteine, grassi };
}

export function datiCompleti(p: Partial<DatiPersonali>): p is DatiPersonali {
  return (
    typeof p.peso === "number" && p.peso > 0 &&
    typeof p.altezza === "number" && p.altezza > 0 &&
    typeof p.eta === "number" && p.eta > 0 &&
    !!p.sesso && !!p.attivita && !!p.obiettivoTipo
  );
}
