import { useState } from "react";
import { setImpostazioni } from "../store";

const COVER_URL =
  "https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?w=800&h=400&fit=crop&auto=format";

const AVATAR_URL =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format&face";

const STATS = [
  { label: "Giorni", value: "48" },
  { label: "Streak 🔥", value: "6" },
  { label: "Pasti", value: "142" },
];

const OBIETTIVI = [
  { label: "Calorie", value: 2000, unit: "kcal", color: "#27C882" },
  { label: "Carboidrati", value: 250, unit: "g", color: "#27C882" },
  { label: "Proteine", value: 150, unit: "g", color: "#6366F1" },
  { label: "Grassi", value: 80, unit: "g", color: "#F59E0B" },
];

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  danger?: boolean;
  badge?: string;
  onPress?: () => void;
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#C5BFB8]">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );
}

function MenuRow({ icon, label, sublabel, danger = false, badge, onPress }: MenuItem) {
  return (
    <button onClick={onPress} className="w-full flex items-center gap-3.5 px-4 py-3.5 active:bg-[#F8F6F2] transition-colors">
      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${danger ? "bg-red-50" : "bg-[#F0EDE8]"}`}>
        <span className={danger ? "text-red-500" : "text-[#1C1915]"}>{icon}</span>
      </div>
      <div className="flex-1 text-left">
        <p className={`text-sm font-semibold ${danger ? "text-red-500" : "text-[#1C1915]"}`}>{label}</p>
        {sublabel && <p className="text-[11px] text-[#9A9187] mt-0.5">{sublabel}</p>}
      </div>
      {badge && (
        <span className="text-[10px] font-bold bg-[#27C882] text-white px-2 py-0.5 rounded-full mr-1">
          {badge}
        </span>
      )}
      {!danger && <ChevronRight />}
    </button>
  );
}

export default function ProfileScreen() {
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto pb-28">

      {/* Cover photo + avatar */}
      <div className="relative">
        <div className="h-52 bg-[#EAE6E0] overflow-hidden">
          <img
            src={COVER_URL}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F0EDE8]" />
        </div>

        {/* Edit button top-right */}
        <button
          onClick={() => setEditMode(!editMode)}
          className="absolute top-12 right-4 bg-white/80 backdrop-blur-md text-[#1C1915] text-xs font-bold px-4 py-2 rounded-full shadow-sm border border-black/10 active:scale-95 transition-transform"
        >
          Modifica profilo
        </button>

        {/* Avatar sovrapposto */}
        <div className="absolute -bottom-12 left-5">
          <div className="w-24 h-24 rounded-3xl border-4 border-[#F0EDE8] overflow-hidden shadow-lg">
            <img
              src={AVATAR_URL}
              alt="Avatar Marco"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Name + goal chip */}
      <div className="px-5 pt-16 pb-2 flex items-start justify-between">
        <div>
          <h1 className="font-display text-[26px] font-black text-[#1C1915] leading-tight">
            Marco Rossi
          </h1>
          <p className="text-sm text-[#9A9187] font-medium mt-0.5">Iniziato il 24 giugno 2025</p>
        </div>
        <div className="mt-1 flex items-center gap-1.5 bg-[#27C882]/10 px-3 py-1.5 rounded-full border border-[#27C882]/20">
          <span className="text-[#27C882] text-xs">⚡</span>
          <span className="text-xs font-bold text-[#27C882]">Obiettivo: -5 kg</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="mx-5 mt-4 bg-white rounded-3xl shadow-sm border border-black/5 flex divide-x divide-[#F0EDE8]">
        {STATS.map((s) => (
          <div key={s.label} className="flex-1 py-4 flex flex-col items-center gap-0.5">
            <span className="font-display text-2xl font-black text-[#1C1915] leading-none">{s.value}</span>
            <span className="text-[11px] font-semibold text-[#9A9187]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Obiettivi card */}
      <div className="mx-5 mt-4 bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <p className="text-xs font-bold text-[#9A9187] uppercase tracking-widest">I miei obiettivi</p>
          <button className="text-xs font-bold text-[#27C882]">Modifica</button>
        </div>
        <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-[#F0EDE8]">
          {OBIETTIVI.map((o) => (
            <div key={o.label} className="px-4 py-3.5 flex items-center gap-3">
              <div
                className="w-2 h-10 rounded-full flex-shrink-0"
                style={{ background: o.color }}
              />
              <div>
                <p className="text-[11px] font-semibold text-[#9A9187]">{o.label}</p>
                <p className="font-display text-xl font-black text-[#1C1915] leading-tight">
                  {o.value}
                  <span className="text-xs font-sans font-normal text-[#9A9187] ml-0.5">{o.unit}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu sections */}
      <div className="mx-5 mt-4 space-y-3">

        {/* Piano & dieta */}
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden divide-y divide-[#F8F6F2]">
          <MenuRow
            label="Il mio piano alimentare"
            sublabel="Personalizza i tuoi pasti"
            badge="Nuovo"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8.42-15.03-8.42-15.03 0h15.03zM1 17h15v2H1z" />
              </svg>
            }
          />
          <MenuRow
            label="Dietologo"
            sublabel="Dr. Giulia Ferrara · prossima visita 20 ago"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            }
          />
        </div>

        {/* App settings */}
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden divide-y divide-[#F8F6F2]">
          <MenuRow
            label="Notifiche"
            sublabel="Promemoria pasti attivi"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            }
          />
          <MenuRow
            label="Impostazioni"
            sublabel="Unità di misura, lingua, tema"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.02 7.02 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.47.47 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
              </svg>
            }
          />
          <MenuRow
            label="Aiuto & Supporto"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
              </svg>
            }
          />
        </div>

        {/* Rifai questionario */}
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
          <MenuRow
            label="Rifai il questionario"
            sublabel="Riconfigura profilo e piano pasti"
            onPress={() => setImpostazioni({ onboardingCompleto: false })}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
              </svg>
            }
          />
        </div>

        {/* Logout */}
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
          <MenuRow
            label="Esci dall'account"
            danger
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
            }
          />
        </div>

        {/* Version */}
        <p className="text-center text-[11px] text-[#C5BFB8] font-medium pb-2">
          Mangiaria v1.0.0
        </p>
      </div>
    </div>
  );
}
