import type {
  Alimento,
  DiarioPasto,
  GiornoState,
  Macro,
  Porzione,
  SceltaVoce,
  StatoPasto,
  TipoPasto,
} from "./types";

// ── Alimenti registry ────────────────────────────────────────────────────────
// Nutritional values are per 100 g/ml, or per 1 piece when unitaMisura === "pz".
export interface Nutri {
  kcal: number;
  carbo: number;
  proteine: number;
  grassi: number;
}

export interface AlimentoDef extends Alimento {
  nutri: Nutri;
}

function def(
  id: string,
  nome: string,
  categoria: Alimento["categoria"],
  unitaMisura: Alimento["unitaMisura"],
  nutri: Nutri,
  isDispensa = false,
): AlimentoDef {
  return { id, nome, categoria, unitaMisura, isDispensa, nutri };
}

const ALIMENTI: Record<string, AlimentoDef> = {
  riso: def("riso", "Riso parboiled", "carboidrati", "g", { kcal: 350, carbo: 78, proteine: 7, grassi: 0.5 }),
  couscous: def("couscous", "Cous cous", "carboidrati", "g", { kcal: 376, carbo: 77, proteine: 13, grassi: 0.6 }),
  pastaInt: def("pastaInt", "Pasta semola integrale", "carboidrati", "g", { kcal: 350, carbo: 66, proteine: 13, grassi: 2.5 }),
  patate: def("patate", "Patate", "carboidrati", "g", { kcal: 77, carbo: 17, proteine: 2, grassi: 0.1 }),
  pane: def("pane", "Pane integrale", "carboidrati", "g", { kcal: 250, carbo: 45, proteine: 9, grassi: 3 }),
  avena: def("avena", "Fiocchi d'avena", "carboidrati", "g", { kcal: 370, carbo: 60, proteine: 13, grassi: 7 }),
  pollo: def("pollo", "Petto di pollo", "proteine", "g", { kcal: 165, carbo: 0, proteine: 31, grassi: 3.6 }),
  tacchino: def("tacchino", "Petto di tacchino", "proteine", "g", { kcal: 135, carbo: 0, proteine: 29, grassi: 1 }),
  tonno: def("tonno", "Tonno al naturale", "proteine", "g", { kcal: 116, carbo: 0, proteine: 26, grassi: 1 }),
  salmone: def("salmone", "Salmone", "proteine", "g", { kcal: 208, carbo: 0, proteine: 20, grassi: 13 }),
  ceci: def("ceci", "Ceci lessati", "proteine", "g", { kcal: 120, carbo: 20, proteine: 8, grassi: 2 }),
  uova: def("uova", "Uova", "proteine", "pz", { kcal: 78, carbo: 0.6, proteine: 6.3, grassi: 5.3 }),
  yogurt: def("yogurt", "Yogurt greco 0%", "proteine", "g", { kcal: 57, carbo: 4, proteine: 10, grassi: 0.4 }),
  latte: def("latte", "Latte parz. scremato", "proteine", "ml", { kcal: 46, carbo: 5, proteine: 3.3, grassi: 1.5 }),
  verdure: def("verdure", "Verdure o ortaggi", "verdura", "g", { kcal: 25, carbo: 4, proteine: 2, grassi: 0.3 }),
  banana: def("banana", "Banana", "frutta", "g", { kcal: 89, carbo: 23, proteine: 1.1, grassi: 0.3 }),
  mela: def("mela", "Mela", "frutta", "g", { kcal: 52, carbo: 14, proteine: 0.3, grassi: 0.2 }),
  mandorle: def("mandorle", "Mandorle", "grassi", "g", { kcal: 600, carbo: 20, proteine: 21, grassi: 50 }),
  olio: def("olio", "Olio extravergine di oliva", "grassi", "g", { kcal: 900, carbo: 0, proteine: 0, grassi: 100 }, true),
};

// ── Macro computation ────────────────────────────────────────────────────────
const ZERO: Macro = { kcal: 0, carbo: 0, proteine: 0, grassi: 0 };

function macroPorzione(p: Porzione): Macro {
  const a = ALIMENTI[p.alimento.id];
  if (!a) return ZERO;
  const factor = p.alimento.unitaMisura === "pz" ? p.quantita : p.quantita / 100;
  return {
    kcal: a.nutri.kcal * factor,
    carbo: a.nutri.carbo * factor,
    proteine: a.nutri.proteine * factor,
    grassi: a.nutri.grassi * factor,
  };
}

function add(a: Macro, b: Macro): Macro {
  return {
    kcal: a.kcal + b.kcal,
    carbo: a.carbo + b.carbo,
    proteine: a.proteine + b.proteine,
    grassi: a.grassi + b.grassi,
  };
}

function round(m: Macro): Macro {
  return {
    kcal: Math.round(m.kcal),
    carbo: Math.round(m.carbo),
    proteine: Math.round(m.proteine),
    grassi: Math.round(m.grassi),
  };
}

/** Macro of a single meal (its currently-selected portions). */
export function macroPasto(pasto: DiarioPasto): Macro {
  return pasto.scelteEffettuate.reduce((acc, s) => {
    const sel = s.alternative.find((p) => p.id === s.porzioneSelezionataId) ?? s.alternative[0];
    return sel ? add(acc, macroPorzione(sel)) : acc;
  }, { ...ZERO });
}

/** Total planned macro for a day (every meal, ignoring status). */
export function macroPianificato(state: GiornoState): Macro {
  const base = state.pasti.reduce((acc, p) => add(acc, macroPasto(p)), { ...ZERO });
  return round(base);
}

/** Consumed macro = completed meals + all extra logged items. */
export function macroConsumato(state: GiornoState): Macro {
  const dai = state.pasti
    .filter((p) => p.stato === "completato")
    .reduce((acc, p) => add(acc, macroPasto(p)), { ...ZERO });
  const extra = state.extra.reduce(
    (acc, e) => add(acc, { kcal: e.kcal, carbo: e.carbo, proteine: e.proteine, grassi: e.grassi }),
    { ...ZERO },
  );
  return round(add(dai, extra));
}

// ── Weekly plan template ─────────────────────────────────────────────────────
type Slot = { titolo: string; opzioni: Array<[string, number, string?]> };

function P(alimentoId: string): Alimento {
  const { nutri, ...rest } = ALIMENTI[alimentoId];
  void nutri;
  return rest;
}

const COLAZIONI: Slot[][] = [
  [
    { titolo: "Cereali", opzioni: [["avena", 60], ["pane", 60]] },
    { titolo: "Latticino", opzioni: [["latte", 200], ["yogurt", 170]] },
    { titolo: "Frutta", opzioni: [["banana", 120], ["mela", 150]] },
  ],
  [
    { titolo: "Cereali", opzioni: [["pane", 70], ["avena", 60]] },
    { titolo: "Proteine", opzioni: [["uova", 2], ["yogurt", 170]] },
    { titolo: "Frutta", opzioni: [["mela", 150], ["banana", 120]] },
  ],
];

const SPUNTINI: Slot[][] = [
  [{ titolo: "Frutta", opzioni: [["mela", 150], ["banana", 120]] }],
  [{ titolo: "Frutta secca", opzioni: [["mandorle", 20]] }],
  [{ titolo: "Yogurt", opzioni: [["yogurt", 150], ["latte", 200]] }],
];

const PRANZI: Slot[][] = [
  [
    { titolo: "Carboidrati", opzioni: [["riso", 130], ["couscous", 130], ["pastaInt", 130]] },
    { titolo: "Proteine", opzioni: [["pollo", 200], ["tacchino", 190]] },
    { titolo: "Verdure", opzioni: [["verdure", 200]] },
    { titolo: "Grassi", opzioni: [["olio", 15, "1 cucchiaio e mezzo"]] },
  ],
  [
    { titolo: "Carboidrati", opzioni: [["pastaInt", 120], ["riso", 120]] },
    { titolo: "Proteine", opzioni: [["tonno", 120], ["pollo", 180]] },
    { titolo: "Verdure", opzioni: [["verdure", 200]] },
    { titolo: "Grassi", opzioni: [["olio", 12, "1 cucchiaio"]] },
  ],
  [
    { titolo: "Carboidrati", opzioni: [["patate", 300], ["riso", 120]] },
    { titolo: "Proteine", opzioni: [["salmone", 150], ["pollo", 180]] },
    { titolo: "Verdure", opzioni: [["verdure", 200]] },
    { titolo: "Grassi", opzioni: [["olio", 10, "1 cucchiaio"]] },
  ],
  [
    { titolo: "Carboidrati", opzioni: [["couscous", 130], ["pastaInt", 120]] },
    { titolo: "Proteine", opzioni: [["ceci", 200], ["tacchino", 190]] },
    { titolo: "Verdure", opzioni: [["verdure", 200]] },
    { titolo: "Grassi", opzioni: [["olio", 12, "1 cucchiaio"]] },
  ],
];

const CENE: Slot[][] = [
  [
    { titolo: "Proteine", opzioni: [["pollo", 180], ["tacchino", 170]] },
    { titolo: "Verdure", opzioni: [["verdure", 250]] },
    { titolo: "Grassi", opzioni: [["olio", 10, "1 cucchiaio"]] },
  ],
  [
    { titolo: "Proteine", opzioni: [["salmone", 160], ["tonno", 130]] },
    { titolo: "Verdure", opzioni: [["verdure", 250]] },
    { titolo: "Carboidrati", opzioni: [["pane", 50]] },
    { titolo: "Grassi", opzioni: [["olio", 10, "1 cucchiaio"]] },
  ],
  [
    { titolo: "Proteine", opzioni: [["uova", 3], ["tacchino", 170]] },
    { titolo: "Verdure", opzioni: [["verdure", 250]] },
    { titolo: "Grassi", opzioni: [["olio", 10, "1 cucchiaio"]] },
  ],
];

const TIPI: TipoPasto[] = ["colazione", "spuntinoMattina", "pranzo", "spuntinoPomeriggio", "cena"];

function buildScelte(slots: Slot[], dayIdx: number, tipo: TipoPasto): SceltaVoce[] {
  return slots.map((slot, slotIdx) => {
    const alternative: Porzione[] = slot.opzioni.map(([alimentoId, quantita, note], altIdx) => ({
      id: `${dayIdx}_${tipo}_${slotIdx}_${altIdx}`,
      alimento: P(alimentoId),
      quantita,
      note,
    }));
    return {
      titoloLogico: slot.titolo,
      alternative,
      porzioneSelezionataId: alternative[0].id,
    };
  });
}

function pick<T>(pool: T[], i: number): T {
  return pool[((i % pool.length) + pool.length) % pool.length];
}

/** Deterministic meal plan for a given weekday index (0 = Monday). */
function pastiPerGiorno(dayIdx: number): DiarioPasto[] {
  const stati: StatoPasto[] = ["daConsumare", "daConsumare", "daConsumare", "daConsumare", "daConsumare"];
  const slotsByTipo: Record<TipoPasto, Slot[]> = {
    colazione: pick(COLAZIONI, dayIdx),
    spuntinoMattina: pick(SPUNTINI, dayIdx),
    pranzo: pick(PRANZI, dayIdx),
    spuntinoPomeriggio: pick(SPUNTINI, dayIdx + 1),
    cena: pick(CENE, dayIdx),
  };
  return TIPI.map((tipo, i) => ({
    id: `${dayIdx}_${tipo}`,
    tipo,
    stato: stati[i],
    scelteEffettuate: buildScelte(slotsByTipo[tipo], dayIdx, tipo),
  }));
}

// ── Date helpers ─────────────────────────────────────────────────────────────
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Monday = 0 … Sunday = 6 */
export function weekdayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/** Built-in (factory) plan for a weekday — used until the user customises it. */
export function pastiDefaultGiorno(dayIdx: number): DiarioPasto[] {
  return pastiPerGiorno(dayIdx);
}

/** The 7 dates (Mon→Sun) of the week containing `ref`. */
export function weekDates(ref: Date): Date[] {
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - weekdayIndex(ref));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// ── Food registry API (built-in + user custom) ───────────────────────────────
export function registerAlimento(defn: AlimentoDef) {
  ALIMENTI[defn.id] = defn;
}
export function getAlimentoDef(id: string): AlimentoDef | undefined {
  return ALIMENTI[id];
}
export function allAlimenti(): AlimentoDef[] {
  return Object.values(ALIMENTI);
}
/** Strip nutrition to get the plain Alimento (as stored inside a Porzione). */
export function alimentoBase(id: string): Alimento | undefined {
  const a = ALIMENTI[id];
  if (!a) return undefined;
  const { nutri, ...rest } = a;
  void nutri;
  return rest;
}

export { ALIMENTI, TIPI };
