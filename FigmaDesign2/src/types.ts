export type CategoriaAlimento = "carboidrati" | "proteine" | "grassi" | "verdura" | "frutta" | "altro";
export type UnitaMisura = "g" | "ml" | "pz";
export type TipoPasto = "colazione" | "spuntinoMattina" | "pranzo" | "spuntinoPomeriggio" | "cena";
export type StatoPasto = "daConsumare" | "completato" | "pastoLibero" | "saltato";

export interface Alimento {
  id: string;
  nome: string;
  categoria: CategoriaAlimento;
  unitaMisura: UnitaMisura;
  isDispensa?: boolean;
}

export interface Porzione {
  id: string;
  alimento: Alimento;
  quantita: number;
  note?: string;
}

export interface SceltaVoce {
  titoloLogico: string;
  alternative: Porzione[];
  porzioneSelezionataId: string;
}

export interface DiarioPasto {
  id: string;
  tipo: TipoPasto;
  stato: StatoPasto;
  scelteEffettuate: SceltaVoce[];
  notePersonali?: string;
  noteDietologo?: string;
}

export interface DiarioGiorno {
  id: string;
  data: Date;
  pasti: DiarioPasto[];
}

/** Extra logged off-plan meal/snack (from the "+" button). */
export interface ExtraPasto {
  id: string;
  nome: string;
  kcal: number;
  carbo: number;
  proteine: number;
  grassi: number;
}

/** Persisted state for a single calendar day. */
export interface GiornoState {
  pasti: DiarioPasto[];
  extra: ExtraPasto[];
  streakClaimed?: boolean;
}

export interface Macro {
  kcal: number;
  carbo: number;
  proteine: number;
  grassi: number;
}

export interface Obiettivi extends Macro {}

export type Sesso = "uomo" | "donna";
export type LivelloAttivita = "sedentario" | "leggero" | "moderato" | "intenso" | "molto";
export type ObiettivoTipo = "dimagrire" | "mantenere" | "aumentare";

export interface Profilo {
  nome: string;
  obiettivoPeso: string; // "" → il widget obiettivo non compare
  inizio: string;
  obiettivi: Obiettivi;
  avatar?: string; // preset key ("preset:xxx") oppure data URL
  cover?: string;
  // dati personali (per il calcolo automatico degli obiettivi)
  peso?: number; // kg
  altezza?: number; // cm
  eta?: number; // anni
  sesso?: Sesso;
  attivita?: LivelloAttivita;
  obiettivoTipo?: ObiettivoTipo;
}

export interface Impostazioni {
  fabDefault: "spesa" | "pasto";
  notifiche: boolean;
  acquaMax: number; // bicchieri al giorno (max)
}

export interface Dietologo {
  nome: string;
  luogo?: string;
  prossimaVisita: string | null; // ISO datetime, es. "2026-08-20T15:30"
  note?: string;
}
