import type { Alimento, DiarioGiorno } from "./types";

const aRiso: Alimento = { id: "a1", nome: "Riso parboiled", categoria: "carboidrati", unitaMisura: "g" };
const aCousCous: Alimento = { id: "a2", nome: "Cous cous", categoria: "carboidrati", unitaMisura: "g" };
const aPastaInt: Alimento = { id: "a3", nome: "Pasta semola integrale", categoria: "carboidrati", unitaMisura: "g" };
const aPollo: Alimento = { id: "a4", nome: "Petto di pollo", categoria: "proteine", unitaMisura: "g" };
const aTacchino: Alimento = { id: "a5", nome: "Petto di tacchino", categoria: "proteine", unitaMisura: "g" };
const aVerdure: Alimento = { id: "a6", nome: "Verdure o ortaggi", categoria: "verdura", unitaMisura: "g" };
const aOlio: Alimento = { id: "a7", nome: "Olio extravergine di oliva", categoria: "grassi", unitaMisura: "g", isDispensa: true };

export const mockGiornoLunedi: DiarioGiorno = {
  id: "g_lunedi",
  data: new Date(),
  pasti: [
    {
      id: "p_lun_colazione",
      tipo: "colazione",
      stato: "completato",
      scelteEffettuate: [],
    },
    {
      id: "p_lun_pranzo",
      tipo: "pranzo",
      stato: "daConsumare",
      scelteEffettuate: [
        {
          titoloLogico: "Carboidrati",
          alternative: [
            { id: "p1", alimento: aRiso, quantita: 130 },
            { id: "p2", alimento: aCousCous, quantita: 130 },
            { id: "p3", alimento: aPastaInt, quantita: 130 },
          ],
          porzioneSelezionataId: "p1",
        },
        {
          titoloLogico: "Proteine",
          alternative: [
            { id: "p4", alimento: aPollo, quantita: 200 },
            { id: "p5", alimento: aTacchino, quantita: 190 },
          ],
          porzioneSelezionataId: "p4",
        },
        {
          titoloLogico: "Verdure",
          alternative: [
            { id: "p6", alimento: aVerdure, quantita: 200 },
          ],
          porzioneSelezionataId: "p6",
        },
        {
          titoloLogico: "Grassi",
          alternative: [
            { id: "p7", alimento: aOlio, quantita: 15, note: "1 cucchiaio e mezzo" },
          ],
          porzioneSelezionataId: "p7",
        },
      ],
    },
    {
      id: "p_lun_cena",
      tipo: "cena",
      stato: "daConsumare",
      scelteEffettuate: [
        {
          titoloLogico: "Proteine",
          alternative: [
            { id: "p8", alimento: aPollo, quantita: 180 },
            { id: "p9", alimento: aTacchino, quantita: 170 },
          ],
          porzioneSelezionataId: "p8",
        },
        {
          titoloLogico: "Verdure",
          alternative: [
            { id: "p10", alimento: aVerdure, quantita: 250 },
          ],
          porzioneSelezionataId: "p10",
        },
        {
          titoloLogico: "Grassi",
          alternative: [
            { id: "p11", alimento: aOlio, quantita: 10, note: "1 cucchiaio" },
          ],
          porzioneSelezionataId: "p11",
        },
      ],
    },
  ],
};
