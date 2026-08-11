enum CategoriaAlimento { carboidrati, proteine, grassi, verdura, frutta, altro }
enum UnitaMisura { g, ml, pz }
enum TipoPasto { colazione, spuntinoMattina, pranzo, spuntinoPomeriggio, cena }
enum StatoPasto { daConsumare, completato, pastoLibero, saltato }

class Alimento {
  final String id;
  final String nome;
  final CategoriaAlimento categoria;
  final UnitaMisura unitaMisura;
  final bool isDispensa;

  const Alimento({
    required this.id,
    required this.nome,
    required this.categoria,
    required this.unitaMisura,
    this.isDispensa = false,
  });
}

class Porzione {
  final String id;
  final Alimento alimento;
  final double quantita;
  final String? note;

  const Porzione({
    required this.id,
    required this.alimento,
    required this.quantita,
    this.note,
  });
}

class SceltaVoce {
  final String titoloLogico;
  final List<Porzione> alternative;
  Porzione porzioneSelezionata;

  SceltaVoce({
    required this.titoloLogico,
    required this.alternative,
    required this.porzioneSelezionata,
  });
}

class DiarioPasto {
  final String id;
  final TipoPasto tipo;
  StatoPasto stato;
  final List<SceltaVoce> scelteEffettuate;
  String? notePersonali;
  final String? noteDietologo;

  DiarioPasto({
    required this.id,
    required this.tipo,
    this.stato = StatoPasto.daConsumare,
    required this.scelteEffettuate,
    this.notePersonali,
    this.noteDietologo,
  });
}

class DiarioGiorno {
  final String id;
  final DateTime data;
  final List<DiarioPasto> pasti;

  DiarioGiorno({
    required this.id,
    required this.data,
    required this.pasti,
  });
}
