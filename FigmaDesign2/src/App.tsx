import { useState, useEffect } from "react";
import PastoCard from "./components/PastoCard";
import MacroRing from "./components/MacroRing";
import BottomNav, { type Tab } from "./components/BottomNav";
import CalendarPanel from "./components/CalendarPanel";
import FabMenu from "./components/FabMenu";
import AddSpesaSheet from "./components/AddSpesaSheet";
import AddPastoSheet from "./components/AddPastoSheet";
import ToastHost from "./components/Toast";
import StatsScreen from "./screens/StatsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SpesaScreen from "./screens/SpesaScreen";
import { macroConsumato } from "./data";
import {
  useGiorno,
  useProfilo,
  useImpostazioni,
  useDietologo,
  setStatoPasto,
  setPorzione,
  removeExtraPasto,
} from "./store";
import { pianificaVisita } from "./notifications";
import type { StatoPasto } from "./types";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buona sera";
}

function formatData(d: Date): string {
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function App() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<Tab>("home");

  const [fabMenu, setFabMenu] = useState(false);
  const [spesaSheet, setSpesaSheet] = useState(false);
  const [pastoSheet, setPastoSheet] = useState(false);

  const profilo = useProfilo();
  const impostazioni = useImpostazioni();
  const dietologo = useDietologo();
  const giorno = useGiorno(selectedDate);

  // (Re)schedule the dietitian-visit reminder whenever it or the toggle changes.
  useEffect(() => {
    if (impostazioni.notifiche) {
      void pianificaVisita(dietologo.prossimaVisita, dietologo.nome, dietologo.note);
    } else {
      void pianificaVisita(null, dietologo.nome);
    }
  }, [impostazioni.notifiche, dietologo.prossimaVisita, dietologo.nome, dietologo.note]);

  const consumato = macroConsumato(giorno);
  const completati = giorno.pasti.filter((p) => p.stato === "completato").length;
  const totale = giorno.pasti.length;
  const oggi = isSameDay(selectedDate, new Date());

  function handleStatoChange(pastoId: string, nuovoStato: StatoPasto) {
    setStatoPasto(selectedDate, pastoId, nuovoStato);
  }
  function handlePorzioneChange(pastoId: string, titoloLogico: string, porzioneId: string) {
    setPorzione(selectedDate, pastoId, titoloLogico, porzioneId);
  }

  function handleFabTap() {
    if (impostazioni.fabDefault === "pasto") setPastoSheet(true);
    else setSpesaSheet(true);
  }

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
                    Ciao, {profilo.nome.split(" ")[0]}!
                  </h1>
                </div>
                <button
                  onClick={() => setCalendarOpen(true)}
                  className={`w-11 h-11 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center active:scale-95 transition-all ${calendarOpen ? "ring-2 ring-[#27C882]" : ""}`}
                  aria-label="Apri calendario"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1C1915">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 0h2v2h-2z" />
                  </svg>
                </button>
              </div>
              {!oggi && (
                <div className="mt-3 flex items-center gap-2 bg-[#27C882]/10 text-[#1AA86A] text-xs font-semibold px-3 py-2 rounded-2xl">
                  <span>📅</span>
                  Stai visualizzando un altro giorno
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="ml-auto font-bold underline"
                  >
                    Torna a oggi
                  </button>
                </div>
              )}
            </header>
            <div className="flex-1 overflow-y-auto pb-28 px-5 space-y-4">
              <MacroRing
                consumato={consumato}
                obiettivi={profilo.obiettivi}
                completati={completati}
                totale={totale}
              />
              {giorno.pasti.map((pasto) => (
                <PastoCard
                  key={pasto.id}
                  pasto={pasto}
                  onStatoChange={handleStatoChange}
                  onPorzioneChange={handlePorzioneChange}
                />
              ))}

              {/* Extra logged meals */}
              {giorno.extra.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#F0EDE8]">
                    <span className="text-xs font-bold text-[#1C1915] uppercase tracking-widest">
                      Pasti liberi registrati
                    </span>
                  </div>
                  <div className="divide-y divide-[#F8F6F2]">
                    {giorno.extra.map((e) => (
                      <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                        <span className="w-9 h-9 rounded-2xl bg-amber-400/15 flex items-center justify-center text-base">🍽️</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#1C1915]">{e.nome}</p>
                          <p className="text-[11px] text-[#9A9187]">{e.kcal} kcal</p>
                        </div>
                        <button
                          onClick={() => removeExtraPasto(selectedDate, e.id)}
                          className="w-8 h-8 rounded-full bg-[#F0EDE8] flex items-center justify-center active:scale-90 transition-transform"
                          aria-label="Rimuovi"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#9A9187">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── STATS ── */}
        {activeTab === "stats" && <StatsScreen />}

        {/* ── PROFILO ── */}
        {activeTab === "profilo" && <ProfileScreen />}

        {/* ── SPESA ── */}
        {activeTab === "piano" && <SpesaScreen />}

        <BottomNav
          activeTab={activeTab}
          onChange={setActiveTab}
          onFabTap={handleFabTap}
          onFabHold={() => setFabMenu(true)}
        />
      </div>

      <CalendarPanel
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <FabMenu
        open={fabMenu}
        onClose={() => setFabMenu(false)}
        onSpesa={() => setSpesaSheet(true)}
        onPasto={() => setPastoSheet(true)}
      />
      <AddSpesaSheet open={spesaSheet} onClose={() => setSpesaSheet(false)} />
      <AddPastoSheet open={pastoSheet} onClose={() => setPastoSheet(false)} data={selectedDate} />

      <ToastHost />
    </div>
  );
}
