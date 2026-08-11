import { useState, useEffect } from "react";
import type { DiarioGiorno, StatoPasto } from "./types";
import { mockGiornoLunedi } from "./mockData";
import PastoCard from "./components/PastoCard";
import MacroRing from "./components/MacroRing";
import BottomNav, { type Tab } from "./components/BottomNav";
import CalendarPanel from "./components/CalendarPanel";
import StatsScreen from "./screens/StatsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SpesaScreen from "./screens/SpesaScreen";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buona sera";
}

function formatData(d: Date): string {
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}

export default function App() {
  const [giorno, setGiorno] = useState<DiarioGiorno>(() => {
    const saved = localStorage.getItem("mangiaria_giorno");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return mockGiornoLunedi;
  });

  useEffect(() => {
    localStorage.setItem("mangiaria_giorno", JSON.stringify(giorno));
  }, [giorno]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<Tab>("home");

  function handleStatoChange(pastoId: string, nuovoStato: StatoPasto) {
    setGiorno((g) => ({
      ...g,
      pasti: g.pasti.map((p) =>
        p.id === pastoId ? { ...p, stato: nuovoStato } : p
      ),
    }));
  }

  function handlePorzioneChange(pastoId: string, titoloLogico: string, porzioneId: string) {
    setGiorno((g) => ({
      ...g,
      pasti: g.pasti.map((p) => {
        if (p.id !== pastoId) return p;
        return {
          ...p,
          scelteEffettuate: p.scelteEffettuate.map((s) =>
            s.titoloLogico === titoloLogico
              ? { ...s, porzioneSelezionataId: porzioneId }
              : s
          ),
        };
      }),
    }));
  }

  const completati = giorno.pasti.filter((p) => p.stato === "completato").length;
  const totale = giorno.pasti.length;

  return (
    <div className="min-h-screen bg-[#F0EDE8] font-sans flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative">

        {/* ── HOME ── */}
        {activeTab === "home" && (
          <>
            <header className="px-5 pt-14 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#9A9187] font-medium">
                    {getGreeting()} ·{" "}
                    <span className="capitalize">{formatData(selectedDate)}</span>
                  </p>
                  <h1 className="font-display text-[28px] font-black text-[#1C1915] leading-tight mt-0.5">
                    Ciao, Marco!
                  </h1>
                </div>
                <button
                  onClick={() => setCalendarOpen(true)}
                  className={`w-11 h-11 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center active:scale-95 transition-all ${calendarOpen ? "ring-2 ring-[#27C882]" : ""}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1C1915">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 0h2v2h-2z" />
                  </svg>
                </button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto pb-28 px-5 space-y-4">
              <MacroRing completati={completati} totale={totale} />
              {giorno.pasti.map((pasto) => (
                <PastoCard
                  key={pasto.id}
                  pasto={pasto}
                  onStatoChange={handleStatoChange}
                  onPorzioneChange={handlePorzioneChange}
                />
              ))}
            </div>
          </>
        )}

        {/* ── STATS ── */}
        {activeTab === "stats" && <StatsScreen />}

        {/* ── PROFILO ── */}
        {activeTab === "profilo" && <ProfileScreen />}

        {/* ── SPESA ── */}
        {activeTab === "piano" && <SpesaScreen />}

        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <CalendarPanel
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
    </div>
  );
}
