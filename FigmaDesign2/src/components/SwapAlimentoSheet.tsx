import { useState, useEffect } from "react";
import Sheet from "./Sheet";
import { allAlimenti } from "../data";
import { showToast } from "./Toast";
import type { AlimentoDef } from "../data";

interface Props {
  open: boolean;
  onClose: () => void;
  onSwap: (nuovo: { alimento: AlimentoDef; quantita: number }) => void;
  titoloLogico: string;
}

export default function SwapAlimentoSheet({ open, onClose, onSwap, titoloLogico }: Props) {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [selId, setSelId] = useState<string | null>(null);
  
  const [externalResults, setExternalResults] = useState<AlimentoDef[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filtra risultati locali
  const localResults = allAlimenti().filter((a) => a.nome.toLowerCase().includes(search.toLowerCase()));
  
  // Combina i risultati
  const alimenti = search ? [...localResults, ...externalResults] : localResults;
  const sel = alimenti.find((a) => a.id === selId);

  // Debounced API search
  useEffect(() => {
    if (search.trim().length < 3) {
      setExternalResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(search)}&search_simple=1&action=process&json=1&page_size=15`);
        const data = await res.json();
        
        const mapped: AlimentoDef[] = (data.products || [])
          .filter((p: any) => p.nutriments && typeof p.nutriments['energy-kcal_100g'] === 'number')
          .map((p: any) => ({
            id: `off_${p._id}`,
            nome: p.product_name_it || p.product_name || "Prodotto Sconosciuto",
            categoria: "extra", // default
            unitaMisura: "g", // OpenFoodFacts always refers to 100g/100ml
            sorgente: "openfoodfacts",
            nutri: {
              kcal: p.nutriments['energy-kcal_100g'] || 0,
              carbo: p.nutriments['carbohydrates_100g'] || 0,
              proteine: p.nutriments['proteins_100g'] || 0,
              grassi: p.nutriments['fat_100g'] || 0,
              fibra: p.nutriments['fiber_100g'] || 0,
            }
          }));
          
        // Rimuovi duplicati basati sul nome per evitare liste troppo lunghe con lo stesso prodotto
        const unique = mapped.filter((v, i, a) => a.findIndex(t => t.nome === v.nome) === i);
        setExternalResults(unique);
      } catch (err) {
        console.error("Errore ricerca OpenFoodFacts:", err);
      } finally {
        setIsSearching(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timeoutId);
  }, [search]);

  function submit() {
    if (!sel || !q) return;
    const quantita = parseFloat(q);
    if (isNaN(quantita) || quantita <= 0) return;
    
    // Convert external nutrition to per-gram (since OFF is per 100g)
    let finalSel = { ...sel };
    if (sel.sorgente === "openfoodfacts") {
      finalSel.nutri = {
        kcal: sel.nutri.kcal / 100,
        carbo: sel.nutri.carbo / 100,
        proteine: sel.nutri.proteine / 100,
        grassi: sel.nutri.grassi / 100,
        fibra: (sel.nutri.fibra || 0) / 100,
      };
    }

    onSwap({ alimento: finalSel, quantita });
    showToast(`Sostituito con ${sel.nome}`);
    setQ("");
    setSearch("");
    setSelId(null);
    setExternalResults([]);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={`Sostituisci ${titoloLogico}`}>
      <div className="space-y-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Cerca alimento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 text-sm font-medium text-[#1C1915] placeholder:text-[#C5BFB8] focus:outline-none focus:ring-2 focus:ring-[#27C882]/40"
        />

        {/* List */}
        <div className="max-h-48 overflow-y-auto space-y-1 bg-white rounded-2xl border border-black/5 p-1 relative">
          {isSearching && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="text-xs font-bold text-[#9A9187] animate-pulse">Ricerca nel database globale...</span>
            </div>
          )}
          {!isSearching && alimenti.length === 0 && (
            <p className="text-center text-[#9A9187] text-xs p-4">Nessun alimento trovato.</p>
          )}
          {alimenti.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelId(a.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex justify-between items-center ${
                selId === a.id ? "bg-[#27C882]/10 text-[#1AA86A]" : "text-[#1C1915] active:bg-[#F8F6F2]"
              }`}
            >
              <div className="flex flex-col">
                <span className="truncate max-w-[200px]">{a.nome}</span>
                {a.sorgente === "openfoodfacts" && (
                  <span className="text-[9px] font-bold text-[#F59E0B] uppercase tracking-wider">Database Esterno (100g)</span>
                )}
              </div>
              <div className="flex flex-col items-end text-right">
                <span className="text-[10px] text-[#9A9187] font-bold">{a.nutri.kcal.toFixed(0)} kcal</span>
                {a.sorgente === "openfoodfacts" && (
                  <span className="text-[8px] text-[#C5BFB8] font-bold">C:{a.nutri.carbo.toFixed(1)} P:{a.nutri.proteine.toFixed(1)}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-3 bg-[#F8F6F2] p-1 rounded-2xl">
          <input
            type="number"
            placeholder={sel?.sorgente === "openfoodfacts" ? "Quantità (g)" : "Quantità"}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 bg-white rounded-xl px-4 py-3 text-sm font-bold text-[#1C1915] text-center border-none focus:ring-2 focus:ring-[#27C882]/40"
          />
          <span className="w-12 text-center text-sm font-bold text-[#9A9187] uppercase">
            {sel?.unitaMisura || "-"}
          </span>
        </div>

        <button
          onClick={submit}
          disabled={!sel || !q}
          className="w-full py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #27C882 0%, #1AA86A 100%)" }}
        >
          Conferma Sostituzione
        </button>
      </div>
    </Sheet>
  );
}
