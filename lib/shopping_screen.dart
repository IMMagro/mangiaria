import 'package:flutter/material.dart';
import 'theme.dart';

class Articolo {
  final String id;
  final String nome;
  final String quantita;
  final String categoria;
  bool comprato;

  Articolo({
    required this.id,
    required this.nome,
    required this.quantita,
    required this.categoria,
    this.comprato = false,
  });
}

class CategoriaCfg {
  final Color color;
  final String icon;
  CategoriaCfg(this.color, this.icon);
}

class ShoppingScreen extends StatefulWidget {
  @override
  _ShoppingScreenState createState() => _ShoppingScreenState();
}

class _ShoppingScreenState extends State<ShoppingScreen> {
  List<Articolo> lista = [
    // Carboidrati
    Articolo(id: "s1", nome: "Riso parboiled", quantita: "500 g", categoria: "Carboidrati", comprato: false),
    Articolo(id: "s2", nome: "Pasta semola integrale", quantita: "500 g", categoria: "Carboidrati", comprato: false),
    Articolo(id: "s3", nome: "Cous cous", quantita: "300 g", categoria: "Carboidrati", comprato: true),
    // Proteine
    Articolo(id: "s4", nome: "Petto di pollo", quantita: "800 g", categoria: "Proteine", comprato: false),
    Articolo(id: "s5", nome: "Petto di tacchino", quantita: "400 g", categoria: "Proteine", comprato: false),
    Articolo(id: "s6", nome: "Uova", quantita: "6 pz", categoria: "Proteine", comprato: true),
    // Verdure
    Articolo(id: "s7", nome: "Zucchine", quantita: "500 g", categoria: "Verdure", comprato: false),
    Articolo(id: "s8", nome: "Pomodori", quantita: "400 g", categoria: "Verdure", comprato: false),
    Articolo(id: "s9", nome: "Spinaci freschi", quantita: "200 g", categoria: "Verdure", comprato: false),
    // Dispensa
    Articolo(id: "s10", nome: "Olio EVO", quantita: "500 ml", categoria: "Dispensa", comprato: true),
    Articolo(id: "s11", nome: "Sale integrale", quantita: "1 conf", categoria: "Dispensa", comprato: true),
    Articolo(id: "s12", nome: "Limoni", quantita: "3 pz", categoria: "Dispensa", comprato: false),
  ];

  final Map<String, CategoriaCfg> categoriaCfg = {
    'Carboidrati': CategoriaCfg(AppColors.catCarbs, "🌾"),
    'Proteine': CategoriaCfg(AppColors.catProtein, "🥩"),
    'Verdure': CategoriaCfg(AppColors.catVeg, "🥦"),
    'Dispensa': CategoriaCfg(AppColors.catPantry, "🫙"),
  };

  String search = "";
  String filtro = "tutti"; // "tutti", "da_comprare", "comprati"

  void toggle(String id) {
    setState(() {
      var item = lista.firstWhere((a) => a.id == id);
      item.comprato = !item.comprato;
    });
  }

  void svuotaComprati() {
    setState(() {
      for (var a in lista) {
        a.comprato = false;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    var filtered = lista.where((a) {
      bool matchSearch = a.nome.toLowerCase().contains(search.toLowerCase());
      bool matchFiltro = true;
      if (filtro == "da_comprare") matchFiltro = !a.comprato;
      if (filtro == "comprati") matchFiltro = a.comprato;
      return matchSearch && matchFiltro;
    }).toList();

    var categoriePresenti = filtered.map((a) => a.categoria).toSet().toList();
    int daComprare = lista.where((a) => !a.comprato).length;
    int totale = lista.length;
    int comprati = totale - daComprare;
    double progress = totale == 0 ? 0 : comprati / totale;

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("Dal tuo piano settimanale", style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
                          SizedBox(height: 2),
                          Text("Lista Spesa", style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.textPrimary, letterSpacing: -0.5)),
                        ],
                      ),
                      GestureDetector(
                        onTap: svuotaComprati,
                        child: Container(
                          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.borderLight),
                            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: Offset(0, 2))],
                          ),
                          child: Text("Reset", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
                        ),
                      )
                    ],
                  ),
                  SizedBox(height: 16),
                  // Progress bar
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.borderLight),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: Offset(0, 2))],
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text("$comprati di $totale articoli", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                                  Text("${(progress * 100).round()}%", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
                                ],
                              ),
                              SizedBox(height: 6),
                              Container(
                                height: 8,
                                decoration: BoxDecoration(color: AppColors.bg, borderRadius: BorderRadius.circular(4)),
                                child: Align(
                                  alignment: Alignment.centerLeft,
                                  child: FractionallySizedBox(
                                    widthFactor: progress,
                                    child: AnimatedContainer(
                                      duration: Duration(milliseconds: 500),
                                      decoration: BoxDecoration(color: AppColors.accent, borderRadius: BorderRadius.circular(4)),
                                    ),
                                  ),
                                ),
                              )
                            ],
                          ),
                        ),
                        SizedBox(width: 16),
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppColors.accent,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [BoxShadow(color: AppColors.accent.withOpacity(0.3), blurRadius: 8, offset: Offset(0, 4))],
                          ),
                          child: Icon(Icons.check, color: Colors.white),
                        )
                      ],
                    ),
                  )
                ],
              ),
            ),

            // Contenuto Scrollabile
            Expanded(
              child: ListView(
                padding: EdgeInsets.fromLTRB(20, 0, 20, 100),
                children: [
                  // Search
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.borderLight),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: Offset(0, 2))],
                    ),
                    child: TextField(
                      onChanged: (val) => setState(() => search = val),
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
                      decoration: InputDecoration(
                        hintText: "Cerca nella lista...",
                        hintStyle: TextStyle(color: Color(0xFFC5BFB8)),
                        prefixIcon: Icon(Icons.search, color: Color(0xFFC5BFB8), size: 20),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      ),
                    ),
                  ),
                  SizedBox(height: 12),
                  
                  // Filter pills
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildFiltro("tutti", "Tutti ($totale)"),
                        SizedBox(width: 8),
                        _buildFiltro("da_comprare", "Da comprare ($daComprare)"),
                        SizedBox(width: 8),
                        _buildFiltro("comprati", "Comprati ($comprati)"),
                      ],
                    ),
                  ),
                  SizedBox(height: 16),
                  
                  // Gruppi
                  if (filtered.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 64.0),
                      child: Column(
                        children: [
                          Text("🛒", style: TextStyle(fontSize: 48, color: Colors.black.withOpacity(0.3))),
                          SizedBox(height: 8),
                          Text("Nessun articolo trovato", style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
                        ],
                      ),
                    )
                  else
                    ...categoriePresenti.map((cat) {
                      var articoli = filtered.where((a) => a.categoria == cat).toList();
                      var cfg = categoriaCfg[cat] ?? CategoriaCfg(AppColors.textSecondary, "📦");
                      return _buildCategoriaGroup(cat, cfg, articoli);
                    }).toList(),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildFiltro(String key, String label) {
    bool active = filtro == key;
    return GestureDetector(
      onTap: () => setState(() => filtro = key),
      child: AnimatedContainer(
        duration: Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.textPrimary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: active ? Colors.transparent : AppColors.borderLight),
          boxShadow: active ? [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4, offset: Offset(0, 2))] : [],
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: active ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildCategoriaGroup(String cat, CategoriaCfg cfg, List<Articolo> articoli) {
    int rimasti = articoli.where((a) => !a.comprato).length;

    return Container(
      margin: EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Container(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF8F6F2)))),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(color: cfg.color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                  alignment: Alignment.center,
                  child: Text(cfg.icon, style: TextStyle(fontSize: 16)),
                ),
                SizedBox(width: 10),
                Text(cat.toUpperCase(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary, letterSpacing: 1.2)),
                Spacer(),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(color: cfg.color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                  child: Text("$rimasti rimasti", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: cfg.color)),
                )
              ],
            ),
          ),
          
          // Items
          ...articoli.map((a) {
            return GestureDetector(
              onTap: () => toggle(a.id),
              behavior: HitTestBehavior.opaque,
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  border: Border(bottom: BorderSide(color: Color(0xFFF8F6F2))),
                ),
                child: Row(
                  children: [
                    // Checkbox
                    AnimatedContainer(
                      duration: Duration(milliseconds: 200),
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: a.comprato ? cfg.color : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: a.comprato ? cfg.color : Color(0xFFD0CBC3), width: 2),
                      ),
                      child: a.comprato ? Icon(Icons.check, color: Colors.white, size: 16) : null,
                    ),
                    SizedBox(width: 14),
                    
                    // Nome
                    Expanded(
                      child: AnimatedDefaultTextStyle(
                        duration: Duration(milliseconds: 200),
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: a.comprato ? Color(0xFFC5BFB8) : AppColors.textPrimary,
                          decoration: a.comprato ? TextDecoration.lineThrough : TextDecoration.none,
                          fontFamily: 'Roboto',
                        ),
                        child: Text(a.nome),
                      ),
                    ),
                    
                    // Quantità
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: AppColors.bg, borderRadius: BorderRadius.circular(12)),
                      child: Text(
                        a.quantita,
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: a.comprato ? Color(0xFFC5BFB8) : AppColors.textSecondary),
                      ),
                    )
                  ],
                ),
              ),
            );
          }).toList()
        ],
      ),
    );
  }
}
