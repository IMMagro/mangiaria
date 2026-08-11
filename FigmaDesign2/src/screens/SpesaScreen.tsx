import { useState, useEffect } from "react";

interface Articolo {
  id: string;
  nome: string;
  quantita: string;
  categoria: string;
  comprato: boolean;
}

const LISTA_INIZIALE: Articolo[] = [
  // Carboidrati
  { id: "s1", nome: "Riso parboiled",          quantita: "500 g",  categoria: "Carboidrati", comprato: false },
  { id: "s2", nome: "Pasta semola integrale",   quantita: "500 g",  categoria: "Carboidrati", comprato: false },
  { id: "s3", nome: "Cous cous",                quantita: "300 g",  categoria: "Carboidrati", comprato: true  },
  // Proteine
  { id: "s4", nome: "Petto di pollo",           quantita: "800 g",  categoria: "Proteine",    comprato: false },
  { id: "s5", nome: "Petto di tacchino",        quantita: "400 g",  categoria: "Proteine",    comprato: false },
  { id: "s6", nome: "Uova",                     quantita: "6 pz",   categoria: "Proteine",    comprato: true  },
  // Verdure
  { id: "s7", nome: "Zucchine",                 quantita: "500 g",  categoria: "Verdure",     comprato: false },
  { id: "s8", nome: "Pomodori",                 quantita: "400 g",  categoria: "Verdure",     comprato: false },
  { id: "s9", nome: "Spinaci freschi",          quantita: "200 g",  categoria: "Verdure",     comprato: false },
  // Dispensa
  { id: "s10", nome: "Olio EVO",               quantita: "500 ml", categoria: "Dispensa",    comprato: true  },
  { id: "s11", nome: "Sale integrale",          quantita: "1 conf", categoria: "Dispensa",    comprato: true  },
  { id: "s12", nome: "Limoni",                  quantita: "3 pz",   categoria: "Dispensa",    comprato: false },
];

const CATEGORIA_CFG: Record<string, { color: string; icon: string }> = {
  Carboidrati: { color: "#27C882", icon: "🌾" },
  Proteine:    { color: "#6366F1", icon: "🥩" },
  Verdure:     { color: "#22C55E", icon: "🥦" },
  Dispensa:    { color: "#F59E0B", icon: "🫙" },
};

export default function SpesaScreen() {
  const [lista, setLista] = useState<Articolo[]>(() => {
    const saved = localStorage.getItem("mangiaria_spesa");
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return LISTA_INIZIALE;
  });

  useEffect(() => {
    localStorage.setItem("mangiaria_spesa", JSON.stringify(lista));
  }, [lista]);
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState<"tutti" | "da_comprare" | "comprati">("tutti");

  function toggle(id: string) {
    setLista((l) => l.map((a) => (a.id === id ? { ...a, comprato: !a.comprato } : a)));
  }

  function svuotaComprati() {
    setLista((l) => l.map((a) => ({ ...a, comprato: false })));
  }

  const filtered = lista.filter((a) => {
    const matchSearch = a.nome.toLowerCase().includes(search.toLowerCase());
    const matchFiltro =
      filtro === "tutti" ? true :
      filtro === "da_comprare" ? !a.comprato :
      a.comprato;
    return matchSearch && matchFiltro;
  });

  const categorie = [...new Set(filtered.map((a) => a.categoria))];
  const daComprare = lista.filter((a) => !a.comprato).length;
  const totale = lista.length;

  return (
    <div className="flex-1 overflow-y-auto pb-28">

      {/* Header */}
      <header className="px-5 pt-14 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[#9A9187] font-medium">Dal tuo piano settimanale</p>
            <h1 className="font-display text-[28px] font-black text-[#1C1915] leading-tight mt-0.5">
              Lista Spesa
            </h1>
          </div>
          <button
            onClick={svuotaComprati}
            className="mt-1 text-xs font-bold text-[#9A9187] bg-white px-3 py-2 rounded-full border border-black/5 shadow-sm active:scale-95 transition-transform"
          >
            Reset
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4 bg-white rounded-2xl px-4 py-3 flex items-center gap-4 shadow-sm border border-black/5">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-bold text-[#1C1915]">
                {totale - daComprare} di {totale} articoli
              </span>
              <span className="text-[#9A9187] font-medium">{Math.round(((totale - daComprare) / totale) * 100)}%</span>
            </div>
            <div className="h-2 bg-[#F0EDE8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#27C882] rounded-full transition-all duration-500"
                style={{ width: `${((totale - daComprare) / totale) * 100}%` }}
              />
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#27C882] flex items-center justify-center shadow-md shadow-[#27C882]/30 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M19 3H4.99L3 1 1.59 2.41 3.59 4.41 3 5H1v2h3.23l.77 1.63L3.5 11A2 2 0 0 0 5 14h12a2 2 0 0 0 1.96-1.6l1.44-7.18A1 1 0 0 0 19 4h-.59l1-1L18 1.59 17 3h2zm-2.06 9H5l1.5-3.5h9l1.44 3.5zM7 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </div>
        </div>
      </header>

      <div className="px-5 space-y-3">

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C5BFB8]" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            placeholder="Cerca nella lista…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-black/5 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-[#1C1915] placeholder:text-[#C5BFB8] focus:outline-none focus:ring-2 focus:ring-[#27C882]/40 shadow-sm"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2">
          {([
            { key: "tutti",       label: `Tutti (${totale})` },
            { key: "da_comprare", label: `Da comprare (${daComprare})` },
            { key: "comprati",    label: `Comprati (${totale - daComprare})` },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 whitespace-nowrap ${
                filtro === f.key
                  ? "bg-[#1C1915] text-white shadow-sm"
                  : "bg-white text-[#9A9187] border border-black/5"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grouped list */}
        {categorie.map((cat) => {
          const articoli = filtered.filter((a) => a.categoria === cat);
          const cfg = CATEGORIA_CFG[cat] ?? { color: "#9A9187", icon: "📦" };
          return (
            <div key={cat} className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
              {/* Category header */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#F8F6F2]">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                  style={{ background: cfg.color + "18" }}
                >
                  {cfg.icon}
                </div>
                <span className="text-xs font-bold text-[#1C1915] uppercase tracking-widest">{cat}</span>
                <span
                  className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: cfg.color + "18", color: cfg.color }}
                >
                  {articoli.filter((a) => !a.comprato).length} rimasti
                </span>
              </div>

              {/* Items */}
              <div className="divide-y divide-[#F8F6F2]">
                {articoli.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => toggle(a.id)}
                    className="w-full flex items-center gap-3.5 px-4 py-3.5 active:bg-[#F8F6F2] transition-colors text-left"
                  >
                    {/* Checkbox */}
                    <div
                      className="w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        borderColor: a.comprato ? cfg.color : "#D0CBC3",
                        background: a.comprato ? cfg.color : "transparent",
                      }}
                    >
                      {a.comprato && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      )}
                    </div>

                    {/* Name */}
                    <span
                      className={`flex-1 text-sm font-semibold transition-all ${
                        a.comprato ? "line-through text-[#C5BFB8]" : "text-[#1C1915]"
                      }`}
                    >
                      {a.nome}
                    </span>

                    {/* Quantity badge */}
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl transition-all ${
                        a.comprato
                          ? "bg-[#F0EDE8] text-[#C5BFB8]"
                          : "bg-[#F0EDE8] text-[#9A9187]"
                      }`}
                    >
                      {a.quantita}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <span className="text-4xl opacity-30">🛒</span>
            <p className="text-sm text-[#9A9187] font-medium">Nessun articolo trovato</p>
          </div>
        )}
      </div>
    </div>
  );
}
