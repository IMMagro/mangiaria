import type { GiornoState } from "./types";
import { type DiarioMap, baseGiorno } from "./store";
import {
  dateKey,
  macroConsumato,
  macroPianificato,
  weekDates,
  weekdayIndex,
} from "./data";

const MESI_SHORT = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
const GIORNI_SHORT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

function completatiDi(g: GiornoState): number {
  return g.pasti.filter((p) => p.stato === "completato").length;
}
function saltatiDi(g: GiornoState): number {
  return g.pasti.filter((p) => p.stato === "saltato").length;
}
function haAttivita(g: GiornoState): boolean {
  return completatiDi(g) > 0 || g.extra.length > 0;
}

/** Only days the user actually touched are stored in the map. */
function giornoLoggato(map: DiarioMap, d: Date): GiornoState | null {
  return map[dateKey(d)] ?? null;
}

/** Effective calories for a day: what was consumed, or the plan as a reference. */
export function kcalGiorno(map: DiarioMap, d: Date): number {
  const g = map[dateKey(d)] ?? baseGiorno(d);
  const consumato = macroConsumato(g).kcal;
  return consumato > 0 ? consumato : macroPianificato(g).kcal;
}

export interface StatsGlobali {
  giorni: number;
  pasti: number;
  compliance: number; // 0..100
}

export function statsGlobali(map: DiarioMap): StatsGlobali {
  let giorni = 0;
  let pasti = 0;
  let completati = 0;
  let decisi = 0;
  for (const k of Object.keys(map)) {
    const g = map[k];
    const c = completatiDi(g);
    const s = saltatiDi(g);
    if (c > 0 || g.extra.length > 0) giorni++;
    completati += c;
    pasti += c + g.extra.length;
    decisi += c + s;
  }
  const compliance = decisi > 0 ? Math.round((100 * completati) / decisi) : 0;
  return { giorni, pasti, compliance };
}

/** Consecutive days (ending today, or yesterday if today is still empty) with activity. */
export function streak(map: DiarioMap, oggi: Date): number {
  const qualifies = (d: Date) => {
    const g = giornoLoggato(map, d);
    return g ? haAttivita(g) : false;
  };
  const cursor = new Date(oggi);
  if (!qualifies(cursor)) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (qualifies(cursor)) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export interface Barra {
  giorno: string;
  kcal: number;
  oggi?: boolean;
}

/** 7 bars, Mon→Sun of the current week. */
export function serieSettimana(map: DiarioMap, oggi: Date): Barra[] {
  return weekDates(oggi).map((d, i) => ({
    giorno: GIORNI_SHORT[i],
    kcal: kcalGiorno(map, d),
    oggi: d.toDateString() === oggi.toDateString(),
  }));
}

/** 4 bars, last 4 weeks (avg daily kcal per week); last bar = current week. */
export function serieMese(map: DiarioMap, oggi: Date): Barra[] {
  const monday = new Date(oggi);
  monday.setDate(oggi.getDate() - weekdayIndex(oggi));
  const bars: Barra[] = [];
  for (let w = 3; w >= 0; w--) {
    const start = new Date(monday);
    start.setDate(monday.getDate() - w * 7);
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      sum += kcalGiorno(map, d);
    }
    bars.push({
      giorno: `${start.getDate()}/${start.getMonth() + 1}`,
      kcal: Math.round(sum / 7),
      oggi: w === 0,
    });
  }
  return bars;
}

/** 12 bars, last 12 months (avg daily kcal per month); last bar = current month. */
export function serieAnno(map: DiarioMap, oggi: Date): Barra[] {
  const bars: Barra[] = [];
  for (let m = 11; m >= 0; m--) {
    const ref = new Date(oggi.getFullYear(), oggi.getMonth() - m, 1);
    const year = ref.getFullYear();
    const month = ref.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    let sum = 0;
    for (let day = 1; day <= days; day++) {
      sum += kcalGiorno(map, new Date(year, month, day));
    }
    bars.push({
      giorno: MESI_SHORT[month],
      kcal: Math.round(sum / days),
      oggi: m === 0,
    });
  }
  return bars;
}
