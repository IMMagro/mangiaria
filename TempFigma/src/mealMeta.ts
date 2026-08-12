import type { TipoPasto } from "./types";

export const TIPO_FOTO: Record<TipoPasto, string> = {
  colazione: "https://images.unsplash.com/photo-1610450624105-58a2f25f7911?w=600&h=400&fit=crop&auto=format",
  spuntinoMattina: "https://images.unsplash.com/photo-1557568951-a691f75c810f?w=600&h=400&fit=crop&auto=format",
  pranzo: "https://images.unsplash.com/photo-1573225342350-16731dd9bf3d?w=600&h=400&fit=crop&auto=format",
  spuntinoPomeriggio: "https://images.unsplash.com/photo-1557568951-a691f75c810f?w=600&h=400&fit=crop&auto=format",
  cena: "https://images.unsplash.com/photo-1579619002916-88cd4c81a70c?w=600&h=400&fit=crop&auto=format",
};

export const TIPO_ORA: Record<TipoPasto, string> = {
  colazione: "07:30",
  spuntinoMattina: "10:30",
  pranzo: "13:00",
  spuntinoPomeriggio: "16:30",
  cena: "20:00",
};

export const TIPO_LABEL: Record<TipoPasto, string> = {
  colazione: "Colazione",
  spuntinoMattina: "Spuntino mattina",
  pranzo: "Pranzo",
  spuntinoPomeriggio: "Spuntino pomeriggio",
  cena: "Cena",
};

export const TIPO_LABEL_BREVE: Record<TipoPasto, string> = {
  colazione: "Colazione",
  spuntinoMattina: "Spuntino",
  pranzo: "Pranzo",
  spuntinoPomeriggio: "Spuntino",
  cena: "Cena",
};

export const TUTTI_TIPI: TipoPasto[] = [
  "colazione",
  "spuntinoMattina",
  "pranzo",
  "spuntinoPomeriggio",
  "cena",
];

export const GIORNI_SETTIMANA = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
export const GIORNI_SETTIMANA_BREVE = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
