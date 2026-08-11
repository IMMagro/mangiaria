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
