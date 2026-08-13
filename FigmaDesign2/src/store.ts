import { useSyncExternalStore } from "react";
import type {
  Dietologo,
  DiarioPasto,
  ExtraPasto,
  GiornoState,
  Impostazioni,
  Profilo,
  StatoPasto,
} from "./types";
import type { AlimentoDef } from "./data";
import { dateKey, pastiDefaultGiorno, registerAlimento, weekdayIndex } from "./data";
import { DEFAULT_AVATAR, DEFAULT_COVER } from "./presets";

// ── Generic localStorage-backed reactive store ───────────────────────────────
type Listener = () => void;

interface Store<T> {
  get: () => T;
  set: (updater: T | ((prev: T) => T)) => void;
  subscribe: (l: Listener) => () => void;
}

function createStore<T>(key: string, initial: T): Store<T> {
  let state: T = initial;
  try {
    const saved = localStorage.getItem(key);
    if (saved != null) state = JSON.parse(saved) as T;
  } catch {
    /* corrupted value → fall back to initial */
  }
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set: (updater) => {
      const next =
        typeof updater === "function" ? (updater as (p: T) => T)(state) : updater;
      if (next === state) return;
      state = next;
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {
        /* storage full / unavailable — keep in-memory state */
      }
      listeners.forEach((l) => l());
    },
    subscribe: (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

// ── Custom foods (merged into the data.ts registry) ──────────────────────────
const alimentiStore = createStore<Record<string, AlimentoDef>>("mangiaria_alimenti", {});
// Register any previously-saved custom foods so macros resolve on first render.
for (const a of Object.values(alimentiStore.get())) registerAlimento(a);

export function useAlimentiCustom() {
  return useStore(alimentiStore);
}

let alimentoSeq = 0;
export function addAlimentoCustom(defn: Omit<AlimentoDef, "id">): AlimentoDef {
  const full: AlimentoDef = { ...defn, id: `cf_${Date.now()}_${alimentoSeq++}` };
  registerAlimento(full);
  alimentiStore.set((m) => ({ ...m, [full.id]: full }));
  return full;
}

// ── Shopping list ────────────────────────────────────────────────────────────
export interface Articolo {
  id: string;
  nome: string;
  quantita: string;
  categoria: string;
  comprato: boolean;
}

const SPESA_INIZIALE: Articolo[] = [
  { id: "s1", nome: "Riso parboiled", quantita: "500 g", categoria: "Carboidrati", comprato: false },
  { id: "s2", nome: "Pasta semola integrale", quantita: "500 g", categoria: "Carboidrati", comprato: false },
  { id: "s3", nome: "Cous cous", quantita: "300 g", categoria: "Carboidrati", comprato: true },
  { id: "s4", nome: "Petto di pollo", quantita: "800 g", categoria: "Proteine", comprato: false },
  { id: "s5", nome: "Petto di tacchino", quantita: "400 g", categoria: "Proteine", comprato: false },
  { id: "s6", nome: "Uova", quantita: "6 pz", categoria: "Proteine", comprato: true },
  { id: "s7", nome: "Zucchine", quantita: "500 g", categoria: "Verdure", comprato: false },
  { id: "s8", nome: "Pomodori", quantita: "400 g", categoria: "Verdure", comprato: false },
  { id: "s9", nome: "Spinaci freschi", quantita: "200 g", categoria: "Verdure", comprato: false },
  { id: "s10", nome: "Olio EVO", quantita: "500 ml", categoria: "Dispensa", comprato: true },
  { id: "s11", nome: "Sale integrale", quantita: "1 conf", categoria: "Dispensa", comprato: true },
  { id: "s12", nome: "Limoni", quantita: "3 pz", categoria: "Dispensa", comprato: false },
];

const spesaStore = createStore<Articolo[]>("mangiaria_spesa", SPESA_INIZIALE);

export function useSpesa() {
  return useStore(spesaStore);
}

let spesaSeq = 0;
export function addArticolo(a: Omit<Articolo, "id" | "comprato">) {
  spesaStore.set((l) => [{ ...a, id: `u_${Date.now()}_${spesaSeq++}`, comprato: false }, ...l]);
}
export function toggleArticolo(id: string) {
  spesaStore.set((l) => l.map((a) => (a.id === id ? { ...a, comprato: !a.comprato } : a)));
}
export function resetComprati() {
  spesaStore.set((l) => l.map((a) => ({ ...a, comprato: false })));
}
export const CATEGORIE_SPESA = ["Carboidrati", "Proteine", "Verdure", "Frutta", "Dispensa", "Altro"];

// ── Weekly plan (user-customisable; empty weekday → built-in default) ─────────
type PianoMap = Record<number, DiarioPasto[]>;
const pianoStore = createStore<PianoMap>("mangiaria_piano", {});

/** Meals for a weekday: user's plan if defined, else the built-in default. */
export function pastiPerWeekday(wd: number): DiarioPasto[] {
  const custom = pianoStore.get()[wd];
  return custom ? clone(custom) : pastiDefaultGiorno(wd);
}

/** Fresh state for a date, from the (possibly customised) weekly plan. */
export function baseGiorno(d: Date): GiornoState {
  return { pasti: pastiPerWeekday(weekdayIndex(d)), extra: [] };
}

export function usePiano() {
  return useStore(pianoStore);
}
export function pianoPasti(wd: number): DiarioPasto[] {
  const custom = pianoStore.get()[wd];
  return clone(custom ?? pastiDefaultGiorno(wd));
}
export function setPianoWeekday(wd: number, pasti: DiarioPasto[]) {
  pianoStore.set((m) => ({ ...m, [wd]: clone(pasti) }));
}
export function resetPianoWeekday(wd: number) {
  pianoStore.set((m) => {
    const next = { ...m };
    delete next[wd];
    return next;
  });
}
export function isPianoCustom(wd: number): boolean {
  return !!pianoStore.get()[wd];
}

// ── Diario (per-day meal state) ──────────────────────────────────────────────
type DiarioMap = Record<string, GiornoState>;
const diarioStore = createStore<DiarioMap>("mangiaria_diario", {});

function readGiorno(map: DiarioMap, d: Date): GiornoState {
  return map[dateKey(d)] ?? baseGiorno(d);
}

export function useGiorno(d: Date): GiornoState {
  const map = useStore(diarioStore);
  return readGiorno(map, d);
}
export function useDiarioMap(): DiarioMap {
  return useStore(diarioStore);
}
export type { DiarioMap };

export function getGiorno(d: Date): GiornoState {
  return readGiorno(diarioStore.get(), d);
}

function mutateGiorno(d: Date, fn: (g: GiornoState) => GiornoState) {
  const k = dateKey(d);
  diarioStore.set((map) => ({ ...map, [k]: fn(readGiorno(map, d)) }));
}

export function setStatoPasto(d: Date, pastoId: string, stato: StatoPasto) {
  mutateGiorno(d, (g) => ({
    ...g,
    pasti: g.pasti.map((p) => (p.id === pastoId ? { ...p, stato } : p)),
  }));
}
export function setPorzione(d: Date, pastoId: string, titoloLogico: string, porzioneId: string) {
  mutateGiorno(d, (g) => ({
    ...g,
    pasti: g.pasti.map((p) =>
      p.id !== pastoId
        ? p
        : {
            ...p,
            scelteEffettuate: p.scelteEffettuate.map((s) =>
              s.titoloLogico === titoloLogico ? { ...s, porzioneSelezionataId: porzioneId } : s,
            ),
          },
    ),
  }));
}

export function sostituisciAlimento(d: Date, pastoId: string, titoloLogico: string, nuovaPorzione: Omit<Porzione, "id">) {
  const pId = `swap_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  const porzione: Porzione = { ...nuovaPorzione, id: pId };
  
  mutateGiorno(d, (g) => ({
    ...g,
    pasti: g.pasti.map((p) =>
      p.id !== pastoId
        ? p
        : {
            ...p,
            scelteEffettuate: p.scelteEffettuate.map((s) =>
              s.titoloLogico === titoloLogico
                ? {
                    ...s,
                    alternative: [porzione, ...s.alternative],
                    porzioneSelezionataId: pId,
                  }
                : s,
            ),
          },
    ),
  }));
}


let extraSeq = 0;
export function addExtraPasto(d: Date, extra: Omit<ExtraPasto, "id">) {
  mutateGiorno(d, (g) => ({ ...g, extra: [...g.extra, { ...extra, id: `e_${Date.now()}_${extraSeq++}` }] }));
}
export function removeExtraPasto(d: Date, id: string) {
  mutateGiorno(d, (g) => ({ ...g, extra: g.extra.filter((e) => e.id !== id) }));
}
export function claimStreak(d: Date) {
  mutateGiorno(d, (g) => ({ ...g, streakClaimed: true }));
}

// ── Profile ──────────────────────────────────────────────────────────────────
const PROFILO_INIZIALE: Profilo = {
  nome: "Marco Rossi",
  obiettivoPeso: "-5 kg",
  inizio: "24 giugno 2025",
  obiettivi: { kcal: 2000, carbo: 250, proteine: 150, grassi: 80 },
  avatar: DEFAULT_AVATAR,
  cover: DEFAULT_COVER,
};

const profiloStore = createStore<Profilo>("mangiaria_profilo", PROFILO_INIZIALE);

export function useProfilo() {
  return useStore(profiloStore);
}
export function setProfilo(p: Partial<Profilo>) {
  profiloStore.set((prev) => ({ ...prev, ...p }));
}
export function setObiettivi(o: Profilo["obiettivi"]) {
  profiloStore.set((prev) => ({ ...prev, obiettivi: o }));
}

// ── Settings ─────────────────────────────────────────────────────────────────
const IMPOSTAZIONI_INIZIALI: Impostazioni = {
  fabDefault: "spesa",
  notifiche: true,
  acquaMax: 8,
  onboardingCompleto: false,
};
const impostazioniStore = createStore<Impostazioni>("mangiaria_impostazioni", IMPOSTAZIONI_INIZIALI);

export function useImpostazioni() {
  const raw = useStore(impostazioniStore);
  // Back-compat: ensure acquaMax exists for older saved values.
  return { ...IMPOSTAZIONI_INIZIALI, ...raw };
}
export function setImpostazioni(i: Partial<Impostazioni>) {
  impostazioniStore.set((prev) => ({ ...IMPOSTAZIONI_INIZIALI, ...prev, ...i }));
}

// ── Water tracker (resets each day) ──────────────────────────────────────────
interface AcquaState {
  giorno: string;
  bicchieri: number;
}
const acquaStore = createStore<AcquaState>("mangiaria_acqua", { giorno: "", bicchieri: 0 });

export function useAcquaOggi(): number {
  const s = useStore(acquaStore);
  return s.giorno === dateKey(new Date()) ? s.bicchieri : 0;
}
export function setAcquaOggi(n: number) {
  const max = { ...IMPOSTAZIONI_INIZIALI, ...impostazioniStore.get() }.acquaMax;
  acquaStore.set({ giorno: dateKey(new Date()), bicchieri: Math.max(0, Math.min(max, n)) });
}

// ── Dietitian ────────────────────────────────────────────────────────────────
const DIETOLOGO_INIZIALE: Dietologo = {
  nome: "Dr. Giulia Ferrara",
  luogo: "Studio nutrizione",
  prossimaVisita: "2026-08-20T15:30",
  note: "",
};
const dietologoStore = createStore<Dietologo>("mangiaria_dietologo", DIETOLOGO_INIZIALE);

export function useDietologo() {
  return useStore(dietologoStore);
}
export function setDietologo(d: Partial<Dietologo>) {
  dietologoStore.set((prev) => ({ ...prev, ...d }));
}

// ── Full reset (logout) ──────────────────────────────────────────────────────
export function resetTutto() {
  spesaStore.set(SPESA_INIZIALE);
  diarioStore.set({});
  pianoStore.set({});
  profiloStore.set(PROFILO_INIZIALE);
  impostazioniStore.set(IMPOSTAZIONI_INIZIALI);
  acquaStore.set({ giorno: "", bicchieri: 0 });
  dietologoStore.set(DIETOLOGO_INIZIALE);
  uiCardsStore.set({});
}

// ── UI UI State ──────────────────────────────────────────────────────────────
const uiCardsStore = createStore<Record<string, boolean>>("mangiaria_ui_cards", {});

export function useCardExpanded(pastoId: string, defaultExpanded: boolean): boolean {
  const map = useStore(uiCardsStore);
  return map[pastoId] ?? defaultExpanded;
}

export function toggleCardExpanded(pastoId: string, current: boolean) {
  uiCardsStore.set((m) => ({ ...m, [pastoId]: !current }));
}
