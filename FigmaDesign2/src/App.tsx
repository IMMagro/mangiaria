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
import { motion, AnimatePresence } from "framer-motion";
import { macroConsumato } from "./data";
import { TIPO_LABEL_BREVE as LABEL } from "./mealMeta";
import {
  useGiorno,
  useProfilo,
  useImpostazioni,
  useDietologo,
  setStatoPasto,
  setPorzione,
  removeExtraPasto,
  sostituisciAlimento,
  claimStreak,
} from "./store";
import { pianificaVisita } from "./notifications";
import type { StatoPasto } from "./types";
import confetti from "canvas-confetti";

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
  function handleSwap(pastoId: string, titoloLogico: string, nuovaPorzione: any) {
    sostituisciAlimento(selectedDate, pastoId, titoloLogico, nuovaPorzione);
  }

  const tuttiCompletati = giorno.pasti.every(p => p.stato !== "daConsumare");

  function handleClaim() {
    claimStreak(selectedDate);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#27C882", "#F59E0B", "#EF4444", "#1AA86A", "#FFFFFF"]
    });
  }

  function handleFabTap() {
    if (impostazioni.fabDefault === "pasto") setPastoSheet(true);
    else setSpesaSheet(true);
  }

  return (
    <div className="min-h-screen bg-[#F0EDE8] font-sans flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative">

        <AnimatePresence mode="wait">
          {/* ── HOME ── */}
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col w-full h-full"
            >
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

                {/* Pasti Non da Consumare (Mini Box) */}
                <AnimatePresence>
                  {giorno.pasti.filter(p => p.stato !== "daConsumare").length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                      animate={{ opacity: 1, height: "auto", marginBottom: 16 }} 
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5"
                    >
                      <AnimatePresence>
                        {giorno.pasti
                          .filter((p) => p.stato !== "daConsumare")
                          .map((pasto) => (
                            <motion.button
                              layoutId={`pasto-${pasto.id}`}
                              key={pasto.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              onClick={() => handleStatoChange(pasto.id, "daConsumare")}
                              className="flex-shrink-0 w-[4.25rem] h-[4.25rem] rounded-2xl flex flex-col items-center justify-center border shadow-sm"
                              style={{
                                background: pasto.stato === "completato" ? "#27C8821A" : pasto.stato === "pastoLibero" ? "#F59E0B1A" : "#EF44441A",
                                borderColor: pasto.stato === "completato" ? "#27C8824D" : pasto.stato === "pastoLibero" ? "#F59E0B4D" : "#EF44444D",
                                color: pasto.stato === "completato" ? "#1AA86A" : pasto.stato === "pastoLibero" ? "#D97706" : "#DC2626",
                              }}
                            >
                              <div className="mb-1 flex items-center justify-center w-6 h-6 rounded-full bg-white/60 shadow-sm">
                                {pasto.stato === "completato" && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                )}
                                {pasto.stato === "pastoLibero" && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                )}
                                {pasto.stato === "saltato" && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                )}
                              </div>
                              <span className="text-[9px] w-full truncate font-bold text-center leading-tight px-1 uppercase tracking-wide">
                                {LABEL[pasto.tipo]}
                              </span>
                            </motion.button>
                          ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Congratulazioni Streak */}
                <AnimatePresence>
                  {tuttiCompletati && !giorno.streakClaimed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, height: 0, overflow: "hidden" }}
                      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                      className="bg-gradient-to-br from-[#27C882] to-[#1AA86A] rounded-[1.25rem] p-5 shadow-lg text-white relative overflow-hidden my-2"
                    >
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                      
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <span className="text-4xl mb-2">🎉</span>
                        <h3 className="font-display text-xl font-black mb-1">Obiettivo Raggiunto!</h3>
                        <p className="text-white/90 text-sm font-medium mb-4">
                          Hai completato o valutato tutti i pasti di oggi. Conferma per aggiornare la tua streak!
                        </p>
                        <button
                          onClick={handleClaim}
                          className="bg-white text-[#1AA86A] px-6 py-3 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all w-full"
                        >
                          Aggiorna Streak 🔥
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pasti Da Consumare */}
                <AnimatePresence>
                  {giorno.pasti
                    .filter((p) => p.stato === "daConsumare")
                    .map((pasto) => (
                      <motion.div
                        layoutId={`pasto-${pasto.id}`}
                        key={pasto.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                      >
                        <PastoCard
                          pasto={pasto}
                          onStatoChange={handleStatoChange}
                          onPorzioneChange={handlePorzioneChange}
                          onSwap={handleSwap}
                        />
                      </motion.div>
                  ))}
                </AnimatePresence>

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
            </motion.div>
          )}

          {/* ── STATS ── */}
          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col w-full h-full pb-20"
            >
              <StatsScreen />
            </motion.div>
          )}

          {/* ── PROFILO ── */}
          {activeTab === "profilo" && (
            <motion.div
              key="profilo"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col w-full h-full pb-20 overflow-y-auto"
            >
              <ProfileScreen />
            </motion.div>
          )}

          {/* ── SPESA ── */}
          {activeTab === "piano" && (
            <motion.div
              key="piano"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col w-full h-full pb-20"
            >
              <SpesaScreen />
            </motion.div>
          )}
        </AnimatePresence>

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
