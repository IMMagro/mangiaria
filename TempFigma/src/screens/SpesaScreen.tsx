import { useState } from "react";
import { useSpesa, toggleArticolo, resetComprati } from "../store";

const FOTO: Record<string, string> = {
  "s1":  "https://images.unsplash.com/photo-1586201375761-83865001e31c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=300&q=80",
  "s2":  "https://images.unsplash.com/photo-1615485020475-ba867eb72d7f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=300&q=80",
  "s3":  "https://images.unsplash.com/photo-1586201375761-83865001e31c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=300&q=80",
  "s4":  "https://images.unsplash.com/photo-1604503468506-a8da13d82791?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=300&q=80",
  "s5":  "https://images.unsplash.com/photo-1670398564097-0762e1b30b3a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=300&q=80",
  "s6":  "https://images.unsplash.com/photo-1639194335563-d56b83f0060c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=300&q=80",
  "s7":  "https://images.unsplash.com/photo-1615485499978-1279c3d6302f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=300&q=80",
  "s8":  "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=300&q=80",
  "s9":  "https://images.unsplash.com/photo-1576045057995-568f588f82fb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=300&q=80",
  "s10": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=300&q=80",
  "s11": "https://images.unsplash.com/photo-1785013045711-c2f5efb1a720?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=300&q=80",
  "s12": "https://images.unsplash.com/flagged/photo-1587302164675-820fe61bbd55?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=300&q=80",
};

const FALLBACK = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=300&q=80";

const CAT_CFG: Record<string, { color: string }> = {
  Carboidrati: { color: "#27C882" },
  Proteine:    { color: "#6366F1" },
  Verdure:     { color: "#22C55E" },
  Frutta:      { color: "#F59E0B" },
  Dispensa:    { color: "#F59E0B" },
  Altro:       { color: "#9A9187" },
};

export default function SpesaScreen() {
  const lista = useSpesa();
  const [filtro, setFiltro] = useState<string>("Tutti");

  const categorie = [...new Set(lista.map((a) => a.categoria))];
  const filtroOpts = ["Tutti", ...categorie];
  const filtrata = filtro === "Tutti" ? lista : lista.filter((a) => a.categoria === filtro);
  const categorieVis = [...new Set(filtrata.map((a) => a.categoria))];

  const daComprare = lista.filter((a) => !a.comprato).length;
  const totale = lista.length;
  const comprati = totale - daComprare;
  const pct = totale > 0 ? Math.round((comprati / totale) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto pb-28">

      {/* ── Header ── */}
      <header className="px-5 pt-14 pb-2">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs font-semibold text-[#9A9187] uppercase tracking-widest mb-1">
              Piano settimanale
            </p>
            <h1 className="font-display text-[32px] font-black text-[#1C1915] leading-none">
              Lista Spesa
            </h1>
          </div>
          <button
            onClick={resetComprati}
            className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[#9A9187] bg-white px-3.5 py-2 rounded-full border border-black/5 shadow-sm active:scale-95 transition-transform"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
            Reset
          </button>
        </div>

        {/* Progress card */}
        <div className="bg-white rounded-3xl px-5 py-4 shadow-sm border border-black/5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-display text-[22px] font-black text-[#1C1915] leading-none">{comprati}</span>
              <span className="text-sm text-[#9A9187] font-medium"> / {totale} articoli</span>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "#27C88218", color: "#1AA86A" }}
            >
              {pct === 100 ? "Tutto preso 🎉" : `${pct}%`}
            </span>
          </div>
          <div className="h-2 bg-[#F0EDE8] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #27C882, #1AA86A)",
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[11px] text-[#27C882] font-bold">{comprati} nel carrello</span>
            <span className="text-[11px] text-[#9A9187] font-medium">{daComprare} rimasti</span>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
          {filtroOpts.map((f) => {
            const cfg = CAT_CFG[f];
            const active = filtro === f;
            return (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
                style={
                  active
                    ? { background: "#1C1915", color: "#fff" }
                    : { background: "#fff", color: "#9A9187", border: "1px solid rgba(0,0,0,0.06)" }
                }
              >
                {cfg && (
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: active ? "#fff" : cfg.color }}
                  />
                )}
                {f}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Grid content ── */}
      <div className="px-5 pt-5 space-y-8">
        {categorieVis.map((cat) => {
          const items = filtrata.filter((a) => a.categoria === cat);
          const cfg = CAT_CFG[cat] ?? { color: "#9A9187" };
          const rimasti = items.filter((a) => !a.comprato).length;

          return (
            <section key={cat}>
              {/* Section header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                  <h2 className="font-display text-[17px] font-black text-[#1C1915]">{cat}</h2>
                </div>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: cfg.color + "18", color: cfg.color }}
                >
                  {rimasti} {rimasti === 1 ? "rimasto" : "rimasti"}
                </span>
              </div>

              {/* 2-col tile grid */}
              <div className="grid grid-cols-2 gap-3">
                {items.map((a) => {
                  const foto = FOTO[a.id] ?? FALLBACK;
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleArticolo(a.id)}
                      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-black/5 active:scale-95 transition-all duration-150 text-left"
                    >
                      {/* Photo */}
                      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
                        <img
                          src={foto}
                          alt={a.nome}
                          className="w-full h-full object-cover transition-all duration-500"
                          style={{ filter: a.comprato ? "grayscale(1) brightness(0.85)" : "none" }}
                        />
                        {a.comprato && <div className="absolute inset-0 bg-white/20" />}

                        {/* Checkbox indicator */}
                        <div
                          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm"
                          style={
                            a.comprato
                              ? { background: "#27C882" }
                              : { background: "rgba(255,255,255,0.75)", backdropFilter: "blur(4px)", border: "1.5px solid rgba(255,255,255,0.9)" }
                          }
                        >
                          {a.comprato && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Label */}
                      <div className="px-3 py-2.5">
                        <p
                          className="text-[13px] font-bold leading-snug transition-colors duration-300"
                          style={{
                            color: a.comprato ? "#C5BFB8" : "#1C1915",
                            textDecoration: a.comprato ? "line-through" : "none",
                          }}
                        >
                          {a.nome}
                        </p>
                        <p
                          className="text-[11px] font-semibold mt-0.5 transition-colors duration-300"
                          style={{ color: a.comprato ? "#D8D3CC" : "#9A9187" }}
                        >
                          {a.quantita}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {filtrata.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="w-16 h-16 rounded-3xl bg-white shadow-sm border border-black/5 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#C5BFB8">
                <path d="M19 3H4.99L3 1 1.59 2.41 3.59 4.41 3 5H1v2h3.23l.77 1.63L3.5 11A2 2 0 0 0 5 14h12a2 2 0 0 0 1.96-1.6l1.44-7.18A1 1 0 0 0 19 4h-.59l1-1L18 1.59 17 3h2zm-2.06 9H5l1.5-3.5h9l1.44 3.5zM7 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-[#9A9187] font-medium">Nessun articolo trovato</p>
          </div>
        )}
      </div>
    </div>
  );
}
