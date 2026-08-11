import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'dart:math' as math;
import 'models.dart';
import 'mock_data.dart';
import 'theme.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  DiarioGiorno oggi = mockGiornoLunedi;

  @override
  void initState() {
    super.initState();
    initializeDateFormatting('it_IT', null);
  }

  void _handleStatoChange(String pastoId, StatoPasto nuovoStato) {
    setState(() {
      final p = oggi.pasti.firstWhere((p) => p.id == pastoId);
      p.stato = nuovoStato;
    });
  }

  void _handlePorzioneChange(String pastoId, String titoloLogico, Porzione nuovaPorzione) {
    setState(() {
      final p = oggi.pasti.firstWhere((p) => p.id == pastoId);
      final scelta = p.scelteEffettuate.firstWhere((s) => s.titoloLogico == titoloLogico);
      scelta.porzioneSelezionata = nuovaPorzione;
    });
  }

  @override
  Widget build(BuildContext context) {
    int completati = oggi.pasti.where((p) => p.stato == StatoPasto.completato).length;
    int totale = oggi.pasti.length;

    String formattedDate = DateFormat('EEEE d MMMM', 'it_IT').format(oggi.data);

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Buongiorno · ${formattedDate[0].toUpperCase()}${formattedDate.substring(1)}',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Ciao, Marco!',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          color: AppColors.textPrimary,
                          letterSpacing: -0.5,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.borderLight),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: Offset(0, 2))
                      ],
                    ),
                    child: IconButton(
                      icon: Icon(Icons.calendar_today_outlined, color: AppColors.textPrimary, size: 20),
                      onPressed: () {},
                    ),
                  )
                ],
              ),
            ),

            // Scrollable Content
            Expanded(
              child: ListView(
                padding: EdgeInsets.fromLTRB(20, 0, 20, 100), // padding bottom for BottomNav
                children: [
                  MacroRing(completati: completati, totale: totale),
                  SizedBox(height: 16),
                  ...oggi.pasti.map((pasto) => PastoCard(
                    pasto: pasto,
                    onStatoChange: _handleStatoChange,
                    onPorzioneChange: _handlePorzioneChange,
                  )).toList(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class MacroRing extends StatelessWidget {
  final int completati;
  final int totale;

  const MacroRing({required this.completati, required this.totale});

  @override
  Widget build(BuildContext context) {
    const double kcalConsumate = 1240;
    const double kcalTotali = 2000;
    final int pct = ((kcalConsumate / kcalTotali) * 100).round();

    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: Offset(0, 4))
        ],
      ),
      child: Row(
        children: [
          // Ring
          Container(
            width: 128,
            height: 128,
            child: Stack(
              children: [
                CustomPaint(
                  size: Size(128, 128),
                  painter: RingPainter(
                    progress: kcalConsumate / kcalTotali,
                    color: AppColors.accent,
                    backgroundColor: AppColors.divider,
                  ),
                ),
                Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        '${kcalConsumate.toInt()}',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.textPrimary, height: 1),
                      ),
                      Text(
                        '/ ${kcalTotali.toInt()} kcal',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: AppColors.textSecondary),
                      ),
                      SizedBox(height: 4),
                      Text(
                        '$pct%',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.accent),
                      ),
                    ],
                  ),
                )
              ],
            ),
          ),
          SizedBox(width: 20),
          
          // Macros
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Obiettivo giornaliero', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.accent.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text('$completati/$totale pasti', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.accent)),
                    )
                  ],
                ),
                SizedBox(height: 12),
                MacroBar(label: 'Carboidrati', value: 148, max: 250, color: AppColors.accent, unit: 'g'),
                SizedBox(height: 12),
                MacroBar(label: 'Proteine', value: 82, max: 150, color: AppColors.catProtein, unit: 'g'),
                SizedBox(height: 12),
                MacroBar(label: 'Grassi', value: 41, max: 80, color: AppColors.catPantry, unit: 'g'),
              ],
            ),
          )
        ],
      ),
    );
  }
}

class MacroBar extends StatelessWidget {
  final String label;
  final double value;
  final double max;
  final Color color;
  final String unit;

  const MacroBar({required this.label, required this.value, required this.max, required this.color, required this.unit});

  @override
  Widget build(BuildContext context) {
    double pct = (value / max).clamp(0.0, 1.0);
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label.toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary, letterSpacing: 1.2)),
            RichText(
              text: TextSpan(
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                children: [
                  TextSpan(text: '${value.toInt()}'),
                  TextSpan(text: unit, style: TextStyle(fontWeight: FontWeight.normal, color: AppColors.textSecondary)),
                ],
              ),
            )
          ],
        ),
        SizedBox(height: 4),
        Container(
          height: 6,
          decoration: BoxDecoration(color: AppColors.divider, borderRadius: BorderRadius.circular(3)),
          child: Align(
            alignment: Alignment.centerLeft,
            child: FractionallySizedBox(
              widthFactor: pct,
              child: Container(
                decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3)),
              ),
            ),
          ),
        )
      ],
    );
  }
}

class RingPainter extends CustomPainter {
  final double progress;
  final Color color;
  final Color backgroundColor;

  RingPainter({required this.progress, required this.color, required this.backgroundColor});

  @override
  void paint(Canvas canvas, Size size) {
    final strokeWidth = 11.0;
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - strokeWidth) / 2;

    final bgPaint = Paint()
      ..color = backgroundColor
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    final fgPaint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    canvas.drawCircle(center, radius, bgPaint);
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      math.pi * 2 * progress,
      false,
      fgPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// ... PastoCard (identica a prima ma con i nuovi colori)
class PastoCard extends StatelessWidget {
  final DiarioPasto pasto;
  final Function(String, StatoPasto) onStatoChange;
  final Function(String, String, Porzione) onPorzioneChange;

  const PastoCard({
    required this.pasto,
    required this.onStatoChange,
    required this.onPorzioneChange,
  });

  String getIconForType(TipoPasto tipo) {
    switch (tipo) {
      case TipoPasto.colazione: return "☀️";
      case TipoPasto.spuntinoMattina: return "🍎";
      case TipoPasto.pranzo: return "🥗";
      case TipoPasto.spuntinoPomeriggio: return "🫐";
      case TipoPasto.cena: return "🌙";
    }
  }
  
  String getLabelForType(TipoPasto tipo) {
    switch (tipo) {
      case TipoPasto.colazione: return "Colazione";
      case TipoPasto.spuntinoMattina: return "Spuntino mattina";
      case TipoPasto.pranzo: return "Pranzo";
      case TipoPasto.spuntinoPomeriggio: return "Spuntino pomeriggio";
      case TipoPasto.cena: return "Cena";
    }
  }

  @override
  Widget build(BuildContext context) {
    bool vuoto = pasto.scelteEffettuate.isEmpty;

    return Container(
      margin: EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.borderLight))),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(getIconForType(pasto.tipo), style: TextStyle(fontSize: 20)),
                    SizedBox(width: 10),
                    Text(
                      getLabelForType(pasto.tipo),
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary, letterSpacing: -0.3),
                    ),
                  ],
                ),
                StatoChip(
                  stato: pasto.stato,
                  onChange: (next) => onStatoChange(pasto.id, next),
                ),
              ],
            ),
          ),
          
          if (vuoto)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text("Nessun alimento registrato", style: TextStyle(fontSize: 14, color: AppColors.textSecondary, fontStyle: FontStyle.italic)),
            )
          else
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: pasto.scelteEffettuate.map((scelta) => _buildSceltaItem(scelta)).toList(),
              ),
            ),
            
          if (pasto.noteDietologo != null)
            Container(
              margin: EdgeInsets.fromLTRB(16, 0, 16, 12),
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.emerald50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.emerald100),
              ),
              child: RichText(
                text: TextSpan(
                  style: TextStyle(fontSize: 12, color: AppColors.emerald700),
                  children: [
                    TextSpan(text: "Nota: ", style: TextStyle(fontWeight: FontWeight.w600)),
                    TextSpan(text: pasto.noteDietologo),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSceltaItem(SceltaVoce scelta) {
    bool hasAlternatives = scelta.alternative.length > 1;
    Porzione selezionata = scelta.porzioneSelezionata;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            scelta.titoloLogico.toUpperCase(),
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary, letterSpacing: 1.2),
          ),
          SizedBox(height: 6),
          if (!hasAlternatives)
            Container(
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.bg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: RichText(
                      text: TextSpan(
                        style: TextStyle(fontSize: 14, color: AppColors.textPrimary),
                        children: [
                          TextSpan(text: "${selezionata.quantita} ${selezionata.alimento.unitaMisura.name} di "),
                          TextSpan(text: selezionata.alimento.nome, style: TextStyle(fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                  ),
                  if (selezionata.note != null)
                    Text(selezionata.note!, style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                ],
              ),
            )
          else
            Container(
              padding: EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: AppColors.bg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<Porzione>(
                  isExpanded: true,
                  value: selezionata,
                  icon: Text('⇅', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                  dropdownColor: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  onChanged: (Porzione? nuovaScelta) {
                    if (nuovaScelta != null) {
                      onPorzioneChange(pasto.id, scelta.titoloLogico, nuovaScelta);
                    }
                  },
                  items: scelta.alternative.map<DropdownMenuItem<Porzione>>((Porzione p) {
                    return DropdownMenuItem<Porzione>(
                      value: p,
                      child: RichText(
                        text: TextSpan(
                          style: TextStyle(fontSize: 14, color: AppColors.textPrimary, fontWeight: FontWeight.w600),
                          children: [
                            TextSpan(text: "${p.quantita} ${p.alimento.unitaMisura.name} di ${p.alimento.nome}"),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class StatoChip extends StatelessWidget {
  final StatoPasto stato;
  final Function(StatoPasto) onChange;

  const StatoChip({required this.stato, required this.onChange});

  @override
  Widget build(BuildContext context) {
    Color bg, text, dot;
    String label;

    switch (stato) {
      case StatoPasto.daConsumare:
        bg = Color(0xFFE0F2FE); text = Color(0xFF0369A1); dot = Color(0xFF38BDF8); label = "Da consumare"; break;
      case StatoPasto.completato:
        bg = Color(0xFFD1FAE5); text = Color(0xFF047857); dot = Color(0xFF34D399); label = "Completato"; break;
      case StatoPasto.pastoLibero:
        bg = Color(0xFFFEF3C7); text = Color(0xFFB45309); dot = Color(0xFFFBBF24); label = "Pasto libero"; break;
      case StatoPasto.saltato:
        bg = Color(0xFFFEE2E2); text = Color(0xFFDC2626); dot = Color(0xFFF87171); label = "Saltato"; break;
    }

    return GestureDetector(
      onTap: () {
        final stati = StatoPasto.values;
        final nextIdx = (stato.index + 1) % stati.length;
        onChange(stati[nextIdx]);
      },
      child: AnimatedContainer(
        duration: Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 6, height: 6, decoration: BoxDecoration(color: dot, shape: BoxShape.circle)),
            SizedBox(width: 6),
            Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: text)),
          ],
        ),
      ),
    );
  }
}
