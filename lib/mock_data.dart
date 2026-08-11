import 'models.dart';

// --- ALIMENTI ---
final aRiso = Alimento(id: 'a1', nome: 'Riso parboiled', categoria: CategoriaAlimento.carboidrati, unitaMisura: UnitaMisura.g);
final aCousCous = Alimento(id: 'a2', nome: 'Cous cous', categoria: CategoriaAlimento.carboidrati, unitaMisura: UnitaMisura.g);
final aPastaInt = Alimento(id: 'a3', nome: 'Pasta semola integrale', categoria: CategoriaAlimento.carboidrati, unitaMisura: UnitaMisura.g);
final aPollo = Alimento(id: 'a4', nome: 'Petto di pollo', categoria: CategoriaAlimento.proteine, unitaMisura: UnitaMisura.g);
final aTacchino = Alimento(id: 'a5', nome: 'Petto di tacchino', categoria: CategoriaAlimento.proteine, unitaMisura: UnitaMisura.g);
final aVerdure = Alimento(id: 'a6', nome: 'Verdure o ortaggi', categoria: CategoriaAlimento.verdura, unitaMisura: UnitaMisura.g);
final aOlio = Alimento(id: 'a7', nome: 'Olio extravergine di oliva', categoria: CategoriaAlimento.grassi, unitaMisura: UnitaMisura.g, isDispensa: true);

// --- LUNEDI PRANZO MOCK ---
final pranzoLunedi = DiarioPasto(
  id: 'p_lun_pranzo',
  tipo: TipoPasto.pranzo,
  stato: StatoPasto.daConsumare,
  scelteEffettuate: [
    SceltaVoce(
      titoloLogico: 'Carboidrati',
      alternative: [
        Porzione(id: 'p1', alimento: aRiso, quantita: 130),
        Porzione(id: 'p2', alimento: aCousCous, quantita: 130),
        Porzione(id: 'p3', alimento: aPastaInt, quantita: 130),
      ],
      porzioneSelezionata: Porzione(id: 'p1', alimento: aRiso, quantita: 130), // Default
    ),
    SceltaVoce(
      titoloLogico: 'Proteine',
      alternative: [
        Porzione(id: 'p4', alimento: aPollo, quantita: 200),
        Porzione(id: 'p5', alimento: aTacchino, quantita: 190),
      ],
      porzioneSelezionata: Porzione(id: 'p4', alimento: aPollo, quantita: 200),
    ),
    SceltaVoce(
      titoloLogico: 'Verdure',
      alternative: [
        Porzione(id: 'p6', alimento: aVerdure, quantita: 200),
      ],
      porzioneSelezionata: Porzione(id: 'p6', alimento: aVerdure, quantita: 200),
    ),
    SceltaVoce(
      titoloLogico: 'Grassi',
      alternative: [
        Porzione(id: 'p7', alimento: aOlio, quantita: 15, note: '1 cucchiaio e mezzo'),
      ],
      porzioneSelezionata: Porzione(id: 'p7', alimento: aOlio, quantita: 15, note: '1 cucchiaio e mezzo'),
    ),
  ],
);

final mockGiornoLunedi = DiarioGiorno(
  id: 'g_lunedi',
  data: DateTime.now(), // Facciamo finta sia oggi
  pasti: [
    // Qui aggiungiamo solo il pranzo per semplicità della demo
    pranzoLunedi,
  ],
);
