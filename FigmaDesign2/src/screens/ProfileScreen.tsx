import { useState } from "react";
import Sheet from "../components/Sheet";
import PianoEditor from "../components/PianoEditor";
import { showToast } from "../components/Toast";
import {
  useProfilo,
  useImpostazioni,
  useDietologo,
  useDiarioMap,
  setProfilo,
  setObiettivi,
  setImpostazioni,
  setDietologo,
  resetTutto,
} from "../store";
import { statsGlobali, streak } from "../stats";
import {
  calcolaObiettivi,
  datiCompleti,
  ATTIVITA_LABEL,
  OBIETTIVO_LABEL,
  type DatiPersonali,
} from "../nutricalc";
import {
  AVATAR_PRESETS,
  COVER_PRESETS,
  resolveImg,
  type Preset,
} from "../presets";
import { readImageAsDataUrl } from "../imageUtil";
import { richiediPermesso, permessoNotifiche, notificaProva, schedulazioneRealeDisponibile } from "../notifications";
import type { LivelloAttivita, Obiettivi, ObiettivoTipo, Sesso } from "../types";

type SheetId =
  | null
  | "profilo"
  | "obiettivi"
  | "calcola"
  | "avatar"
  | "cover"
  | "dietologo"
  | "notifiche"
  | "impostazioni"
  | "aiuto"
  | "logout";

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#C5BFB8]">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );
}

function MenuRow({
  icon, label, sublabel, danger = false, badge, onClick,
}: {
  icon: React.ReactNode; label: string; sublabel?: string; danger?: boolean; badge?: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3.5 px-4 py-3.5 active:bg-[#F8F6F2] transition-colors">
      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${danger ? "bg-red-50" : "bg-[#F0EDE8]"}`}>
        <span className={danger ? "text-red-500" : "text-[#1C1915]"}>{icon}</span>
      </div>
      <div className="flex-1 text-left">
        <p className={`text-sm font-semibold ${danger ? "text-red-500" : "text-[#1C1915]"}`}>{label}</p>
        {sublabel && <p className="text-[11px] text-[#9A9187] mt-0.5">{sublabel}</p>}
      </div>
      {badge && <span className="text-[10px] font-bold bg-[#27C882] text-white px-2 py-0.5 rounded-full mr-1">{badge}</span>}
      {!danger && <ChevronRight />}
    </button>
  );
}

const inputCls =
  "w-full bg-white border border-black/5 rounded-2xl px-4 py-3 text-sm font-medium text-[#1C1915] placeholder:text-[#C5BFB8] focus:outline-none focus:ring-2 focus:ring-[#27C882]/40 shadow-sm";
const primaryBtn =
  "w-full py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-40";
const primaryStyle = { background: "linear-gradient(135deg, #27C882 0%, #1AA86A 100%)" };

function fmtVisita(iso: string | null): string {
  if (!iso) return "Nessun appuntamento";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Nessun appuntamento";
  return d.toLocaleString("it-IT", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

export default function ProfileScreen() {
  const profilo = useProfilo();
  const impostazioni = useImpostazioni();
  const dietologo = useDietologo();
  const diarioMap = useDiarioMap();
  const [sheet, setSheet] = useState<SheetId>(null);
  const [pianoOpen, setPianoOpen] = useState(false);
  const close = () => setSheet(null);

  const globali = statsGlobali(diarioMap);
  const STATS = [
    { label: "Giorni", value: globali.giorni.toString() },
    { label: "Streak 🔥", value: streak(diarioMap, new Date()).toString() },
    { label: "Pasti", value: globali.pasti.toString() },
  ];

  const avatarUrl = resolveImg(profilo.avatar, AVATAR_PRESETS, AVATAR_PRESETS[0].url);
  const coverUrl = resolveImg(profilo.cover, COVER_PRESETS, COVER_PRESETS[0].url);
  const hasObiettivoPeso = !!profilo.obiettivoPeso.trim();

  return (
    <div className="flex-1 overflow-y-auto pb-28">

      {/* Cover + avatar */}
      <div className="relative">
        <button onClick={() => setSheet("cover")} className="block w-full h-52 bg-[#EAE6E0] overflow-hidden active:opacity-90 transition-opacity">
          <img src={coverUrl} alt="Sfondo" className="w-full h-full object-cover" />
        </button>
        <div className="absolute inset-x-0 top-0 h-52 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#F0EDE8]" />

        {/* change-cover hint */}
        <div className="absolute top-12 left-4 bg-white/80 backdrop-blur-md text-[#1C1915] text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm pointer-events-none flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>
          Cambia sfondo
        </div>

        <button
          onClick={() => setSheet("profilo")}
          className="absolute top-12 right-4 bg-white/80 backdrop-blur-md text-[#1C1915] text-xs font-bold px-4 py-2 rounded-full shadow-sm border border-black/10 active:scale-95 transition-transform"
        >
          Modifica profilo
        </button>

        {/* Avatar */}
        <button onClick={() => setSheet("avatar")} className="absolute -bottom-12 left-5 active:scale-95 transition-transform">
          <div className="w-24 h-24 rounded-3xl border-4 border-[#F0EDE8] overflow-hidden shadow-lg relative">
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#27C882] border-2 border-[#F0EDE8] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
            </span>
          </div>
        </button>
      </div>

      {/* Name + goal */}
      <div className="px-5 pt-16 pb-2 flex items-start justify-between">
        <div>
          <h1 className="font-display text-[26px] font-black text-[#1C1915] leading-tight">{profilo.nome}</h1>
          <p className="text-sm text-[#9A9187] font-medium mt-0.5">Iniziato il {profilo.inizio}</p>
        </div>
        {hasObiettivoPeso && (
          <div className="mt-1 flex items-center gap-1.5 bg-[#27C882]/10 px-3 py-1.5 rounded-full border border-[#27C882]/20">
            <span className="text-[#27C882] text-xs">⚡</span>
            <span className="text-xs font-bold text-[#27C882]">Obiettivo: {profilo.obiettivoPeso}</span>
          </div>
        )}
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

      {/* Obiettivi */}
      <div className="mx-5 mt-4 bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <p className="text-xs font-bold text-[#9A9187] uppercase tracking-widest">I miei obiettivi</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setSheet("calcola")} className="text-xs font-bold text-[#6366F1] active:scale-95 transition-transform">Calcola</button>
            <button onClick={() => setSheet("obiettivi")} className="text-xs font-bold text-[#27C882] active:scale-95 transition-transform">Modifica</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-[#F0EDE8]">
          {[
            { label: "Calorie", value: profilo.obiettivi.kcal, unit: "kcal", color: "#27C882" },
            { label: "Carboidrati", value: profilo.obiettivi.carbo, unit: "g", color: "#27C882" },
            { label: "Proteine", value: profilo.obiettivi.proteine, unit: "g", color: "#6366F1" },
            { label: "Grassi", value: profilo.obiettivi.grassi, unit: "g", color: "#F59E0B" },
          ].map((o) => (
            <div key={o.label} className="px-4 py-3.5 flex items-center gap-3">
              <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ background: o.color }} />
              <div>
                <p className="text-[11px] font-semibold text-[#9A9187]">{o.label}</p>
                <p className="font-display text-xl font-black text-[#1C1915] leading-tight">
                  {o.value}<span className="text-xs font-sans font-normal text-[#9A9187] ml-0.5">{o.unit}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="mx-5 mt-4 space-y-3">
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden divide-y divide-[#F8F6F2]">
          <MenuRow
            label="Rifai il questionario" sublabel="Ricalcola i tuoi obiettivi iniziali"
            onClick={() => {
              if (confirm("Vuoi rifare il questionario? Il tuo piano attuale verrà resettato per ricalcolarne uno nuovo.")) {
                setImpostazioni({ onboardingCompleto: false });
              }
            }}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>}
          />
          <MenuRow
            label="Il mio piano alimentare" sublabel="Modifica pasti e alternative" badge="Modifica"
            onClick={() => setPianoOpen(true)}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8.42-15.03-8.42-15.03 0h15.03zM1 17h15v2H1z" /></svg>}
          />
          <MenuRow
            label="Dietologo" sublabel={`${dietologo.nome} · ${fmtVisita(dietologo.prossimaVisita)}`}
            onClick={() => setSheet("dietologo")}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>}
          />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden divide-y divide-[#F8F6F2]">
          <MenuRow
            label="Notifiche" sublabel={impostazioni.notifiche ? "Promemoria attivi" : "Promemoria disattivati"}
            onClick={() => setSheet("notifiche")}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></svg>}
          />
          <MenuRow
            label="Impostazioni" sublabel="Tasto rapido, acqua, notifiche"
            onClick={() => setSheet("impostazioni")}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.02 7.02 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.47.47 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>}
          />
          <MenuRow
            label="Aiuto & Supporto"
            onClick={() => setSheet("aiuto")}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" /></svg>}
          />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
          <MenuRow
            label="Esci dall'account" danger
            onClick={() => setSheet("logout")}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" /></svg>}
          />
        </div>

        <p className="text-center text-[11px] text-[#C5BFB8] font-medium pb-2">Mangiaria v1.0.0</p>
      </div>

      {/* ── Sheets / editor ── */}
      <EditProfiloSheet open={sheet === "profilo"} onClose={close} />
      <EditObiettiviSheet open={sheet === "obiettivi"} onClose={close} onCalcola={() => setSheet("calcola")} />
      <CalcolaObiettiviSheet open={sheet === "calcola"} onClose={close} />
      <ImagePickerSheet
        open={sheet === "avatar"} onClose={close} title="Immagine profilo"
        presets={AVATAR_PRESETS} onPick={(v) => setProfilo({ avatar: v })} grid="grid-cols-3"
      />
      <ImagePickerSheet
        open={sheet === "cover"} onClose={close} title="Immagine di sfondo"
        presets={COVER_PRESETS} onPick={(v) => setProfilo({ cover: v })} grid="grid-cols-2" wide
      />
      <DietologoSheet open={sheet === "dietologo"} onClose={close} />
      <ImpostazioniSheet open={sheet === "impostazioni"} onClose={close} />
      <NotificheSheet open={sheet === "notifiche"} onClose={close} />
      <InfoSheet open={sheet === "aiuto"} onClose={close} title="Aiuto & Supporto" emoji="💬"
        body="Tocca un pasto in Home per personalizzarlo; tieni premuto lo stato per cambiarlo al volo. Il tasto + in basso aggiunge alla spesa (tienilo premuto per scegliere). In 'Il mio piano alimentare' modifichi pasti e alternative per ogni giorno. Tutti i dati restano su questo dispositivo. Assistenza: supporto@mangiaria.app." />
      <LogoutSheet open={sheet === "logout"} onClose={close} />

      <PianoEditor open={pianoOpen} onClose={() => setPianoOpen(false)} />
    </div>
  );
}

// ── Edit profilo ─────────────────────────────────────────────────────────────
function EditProfiloSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const profilo = useProfilo();
  const [nome, setNome] = useState(profilo.nome);
  const [peso, setPeso] = useState(profilo.obiettivoPeso);

  function save() {
    setProfilo({ nome: nome.trim() || profilo.nome, obiettivoPeso: peso.trim() });
    showToast("Profilo aggiornato");
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Modifica profilo">
      <div className="space-y-3">
        <div>
          <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-1.5">Nome</p>
          <input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-1.5">Obiettivo peso (lascia vuoto per nasconderlo)</p>
          <input className={inputCls} value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="es. -5 kg" />
        </div>
        <button onClick={save} className={primaryBtn} style={primaryStyle}>Salva</button>
      </div>
    </Sheet>
  );
}

// ── Edit obiettivi (manuale) ─────────────────────────────────────────────────
function EditObiettiviSheet({ open, onClose, onCalcola }: { open: boolean; onClose: () => void; onCalcola: () => void }) {
  const profilo = useProfilo();
  const [v, setV] = useState<Obiettivi>(profilo.obiettivi);

  function field(key: keyof Obiettivi, label: string, unit: string) {
    return (
      <div>
        <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-1.5">{label} ({unit})</p>
        <input
          className={inputCls}
          inputMode="numeric"
          value={String(v[key])}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            setV((prev) => ({ ...prev, [key]: Number.isFinite(n) ? n : 0 }));
          }}
        />
      </div>
    );
  }

  function save() {
    setObiettivi({
      kcal: Math.max(0, v.kcal),
      carbo: Math.max(0, v.carbo),
      proteine: Math.max(0, v.proteine),
      grassi: Math.max(0, v.grassi),
    });
    showToast("Obiettivi aggiornati");
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="I miei obiettivi">
      <div className="space-y-3">
        <button onClick={onCalcola} className="w-full py-3 rounded-2xl text-sm font-bold text-[#6366F1] bg-[#6366F1]/10 active:scale-[0.98] transition-transform">
          ✨ Calcolali automaticamente dai miei dati
        </button>
        {field("kcal", "Calorie", "kcal")}
        <div className="grid grid-cols-3 gap-2">
          {field("carbo", "Carbo", "g")}
          {field("proteine", "Prot", "g")}
          {field("grassi", "Grassi", "g")}
        </div>
        <button onClick={save} className={primaryBtn} style={primaryStyle}>Salva obiettivi</button>
      </div>
    </Sheet>
  );
}

// ── Calcola obiettivi ideali ─────────────────────────────────────────────────
const ATTIVITA_LIST: LivelloAttivita[] = ["sedentario", "leggero", "moderato", "intenso", "molto"];
const OBIETTIVO_LIST: ObiettivoTipo[] = ["dimagrire", "mantenere", "aumentare"];

function CalcolaObiettiviSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const profilo = useProfilo();
  const [peso, setPeso] = useState(profilo.peso ? String(profilo.peso) : "");
  const [altezza, setAltezza] = useState(profilo.altezza ? String(profilo.altezza) : "");
  const [eta, setEta] = useState(profilo.eta ? String(profilo.eta) : "");
  const [sesso, setSesso] = useState<Sesso>(profilo.sesso ?? "uomo");
  const [attivita, setAttivita] = useState<LivelloAttivita>(profilo.attivita ?? "moderato");
  const [obiettivoTipo, setObiettivoTipo] = useState<ObiettivoTipo>(profilo.obiettivoTipo ?? "mantenere");

  const dati: Partial<DatiPersonali> = {
    peso: parseFloat(peso.replace(",", ".")),
    altezza: parseFloat(altezza.replace(",", ".")),
    eta: parseInt(eta, 10),
    sesso, attivita, obiettivoTipo,
  };
  const ok = datiCompleti(dati);
  const anteprima = ok ? calcolaObiettivi(dati) : null;

  function save() {
    if (!ok || !anteprima) return;
    setProfilo({ peso: dati.peso, altezza: dati.altezza, eta: dati.eta, sesso, attivita, obiettivoTipo });
    setObiettivi(anteprima);
    showToast("Obiettivi calcolati e salvati");
    onClose();
  }

  const num = "w-full bg-white border border-black/5 rounded-2xl px-3 py-2.5 text-sm font-semibold text-[#1C1915] text-center placeholder:text-[#C5BFB8] focus:outline-none focus:ring-2 focus:ring-[#27C882]/40 shadow-sm";
  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 ${active ? "bg-[#1C1915] text-white shadow-sm" : "bg-white text-[#9A9187] border border-black/5"}`;

  return (
    <Sheet open={open} onClose={onClose} title="Calcola obiettivi ideali">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div><p className="text-[10px] font-bold text-[#9A9187] uppercase mb-1 text-center">Peso kg</p><input className={num} inputMode="decimal" value={peso} onChange={(e) => setPeso(e.target.value)} /></div>
          <div><p className="text-[10px] font-bold text-[#9A9187] uppercase mb-1 text-center">Altezza cm</p><input className={num} inputMode="numeric" value={altezza} onChange={(e) => setAltezza(e.target.value)} /></div>
          <div><p className="text-[10px] font-bold text-[#9A9187] uppercase mb-1 text-center">Età</p><input className={num} inputMode="numeric" value={eta} onChange={(e) => setEta(e.target.value)} /></div>
        </div>

        <div>
          <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-2">Sesso</p>
          <div className="flex gap-2">
            {(["uomo", "donna"] as Sesso[]).map((s) => (
              <button key={s} onClick={() => setSesso(s)} className={pill(sesso === s) + " capitalize flex-1"}>{s}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-2">Livello attività</p>
          <div className="flex flex-wrap gap-1.5">
            {ATTIVITA_LIST.map((a) => (
              <button key={a} onClick={() => setAttivita(a)} className={pill(attivita === a)}>{ATTIVITA_LABEL[a]}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-2">Obiettivo</p>
          <div className="flex gap-2">
            {OBIETTIVO_LIST.map((o) => (
              <button key={o} onClick={() => setObiettivoTipo(o)} className={pill(obiettivoTipo === o) + " flex-1"}>{OBIETTIVO_LABEL[o]}</button>
            ))}
          </div>
        </div>

        {anteprima && (
          <div className="bg-[#27C882]/8 rounded-2xl p-4 grid grid-cols-4 gap-2 text-center">
            {[["kcal", anteprima.kcal], ["Carbo", anteprima.carbo + "g"], ["Prot", anteprima.proteine + "g"], ["Grassi", anteprima.grassi + "g"]].map(([l, v]) => (
              <div key={l}><p className="font-display text-lg font-black text-[#1C1915] leading-none">{v}</p><p className="text-[10px] text-[#9A9187] font-semibold mt-1">{l}</p></div>
            ))}
          </div>
        )}

        <button onClick={save} disabled={!ok} className={primaryBtn} style={primaryStyle}>
          {ok ? "Calcola e salva obiettivi" : "Compila tutti i campi"}
        </button>
      </div>
    </Sheet>
  );
}

// ── Image picker (preset + upload) ───────────────────────────────────────────
function ImagePickerSheet({
  open, onClose, title, presets, onPick, grid, wide = false,
}: {
  open: boolean; onClose: () => void; title: string; presets: Preset[]; onPick: (value: string) => void; grid: string; wide?: boolean;
}) {
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageAsDataUrl(file, wide ? 800 : 512);
      onPick(dataUrl);
      showToast("Immagine aggiornata");
      onClose();
    } catch {
      showToast("Impossibile caricare l'immagine");
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-2">Scegli un preset</p>
          <div className={`grid ${grid} gap-2`}>
            {presets.map((p) => (
              <button key={p.key} onClick={() => { onPick(p.key); showToast("Immagine aggiornata"); onClose(); }} className="active:scale-95 transition-transform">
                <img src={p.url} alt={p.label} className={`w-full ${wide ? "h-16" : "aspect-square"} object-cover rounded-2xl border border-black/5`} />
              </button>
            ))}
          </div>
        </div>
        <label className="block w-full py-3.5 rounded-2xl text-sm font-bold text-white text-center shadow-lg active:scale-[0.98] transition-all cursor-pointer" style={primaryStyle}>
          Carica dal dispositivo
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
      </div>
    </Sheet>
  );
}

// ── Dietologo ────────────────────────────────────────────────────────────────
function DietologoSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dietologo = useDietologo();
  const iso = dietologo.prossimaVisita ?? "";
  const [nome, setNome] = useState(dietologo.nome);
  const [luogo, setLuogo] = useState(dietologo.luogo ?? "");
  const [data, setData] = useState(iso ? iso.slice(0, 10) : "");
  const [ora, setOra] = useState(iso && iso.length >= 16 ? iso.slice(11, 16) : "15:30");
  const [note, setNote] = useState(dietologo.note ?? "");

  async function save() {
    const prossimaVisita = data ? `${data}T${ora || "09:00"}` : null;
    setDietologo({ nome: nome.trim() || dietologo.nome, luogo: luogo.trim(), prossimaVisita, note: note.trim() });
    if (prossimaVisita) {
      const perm = await richiediPermesso();
      showToast(perm === "granted" ? "Visita salvata · notifica impostata" : "Visita salvata sul calendario");
    } else {
      showToast("Dati dietologo salvati");
    }
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Il tuo dietologo">
      <div className="space-y-3">
        <div>
          <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-1.5">Nome</p>
          <input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Dr. …" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-1.5">Studio / luogo</p>
          <input className={inputCls} value={luogo} onChange={(e) => setLuogo(e.target.value)} placeholder="es. Studio nutrizione" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-1.5">Prossima visita</p>
            <input type="date" className={inputCls} value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-1.5">Ora</p>
            <input type="time" className={inputCls} value={ora} onChange={(e) => setOra(e.target.value)} />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-1.5">Note</p>
          <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="es. portare esami del sangue" />
        </div>
        {data && (
          <p className="text-[11px] text-[#9A9187]">
            📅 La visita verrà segnata sul calendario{schedulazioneRealeDisponibile() ? " e riceverai una notifica all'orario, anche ad app chiusa." : ". Riceverai la notifica quando l'app è aperta (il tuo browser non supporta le notifiche programmate ad app chiusa)."}
          </p>
        )}
        <button onClick={save} className={primaryBtn} style={primaryStyle}>Salva</button>
      </div>
    </Sheet>
  );
}

// ── Impostazioni ─────────────────────────────────────────────────────────────
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-12 h-7 rounded-full transition-colors relative flex-shrink-0" style={{ background: on ? "#27C882" : "#D0CBC3" }} aria-pressed={on}>
      <span className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all" style={{ left: on ? "22px" : "2px" }} />
    </button>
  );
}

async function abilitaNotifiche(on: boolean) {
  if (on) {
    const perm = await richiediPermesso();
    setImpostazioni({ notifiche: true });
    showToast(perm === "granted" ? "Notifiche attivate" : "Attiva i permessi nel browser");
  } else {
    setImpostazioni({ notifiche: false });
  }
}

function ImpostazioniSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const impostazioni = useImpostazioni();
  return (
    <Sheet open={open} onClose={onClose} title="Impostazioni">
      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-2">Azione del tasto + (tocco singolo)</p>
          <div className="flex gap-2">
            {([{ key: "spesa", label: "🛒 Spesa" }, { key: "pasto", label: "🍽️ Pasto" }] as const).map((o) => (
              <button key={o.key} onClick={() => setImpostazioni({ fabDefault: o.key })}
                className={`flex-1 px-3 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 ${impostazioni.fabDefault === o.key ? "bg-[#1C1915] text-white shadow-sm" : "bg-white text-[#9A9187] border border-black/5"}`}>
                {o.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#9A9187] mt-2">Tieni premuto il tasto + per scegliere ogni volta.</p>
        </div>

        <div>
          <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-2">Acqua · obiettivo giornaliero</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setImpostazioni({ acquaMax: Math.max(1, impostazioni.acquaMax - 1) })} className="w-10 h-10 rounded-2xl bg-[#F0EDE8] text-xl font-bold text-[#1C1915] active:scale-90 transition-transform">−</button>
            <div className="text-center flex-1">
              <p className="font-display text-2xl font-black text-[#1C1915] leading-none">{impostazioni.acquaMax}</p>
              <p className="text-[11px] text-[#9A9187] font-semibold">bicchieri · {(impostazioni.acquaMax * 0.25).toLocaleString("it-IT")} L</p>
            </div>
            <button onClick={() => setImpostazioni({ acquaMax: Math.min(16, impostazioni.acquaMax + 1) })} className="w-10 h-10 rounded-2xl bg-[#F0EDE8] text-xl font-bold text-[#1C1915] active:scale-90 transition-transform">+</button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1C1915]">Notifiche promemoria</p>
            <p className="text-[11px] text-[#9A9187]">Visita dietologo e pasti</p>
          </div>
          <Toggle on={impostazioni.notifiche} onClick={() => void abilitaNotifiche(!impostazioni.notifiche)} />
        </div>

        {impostazioni.notifiche && permessoNotifiche() === "granted" && (
          <button onClick={() => void notificaProva()} className="w-full py-3 rounded-2xl text-sm font-bold text-[#27C882] bg-[#27C882]/10 active:scale-[0.98] transition-transform">
            Invia notifica di prova
          </button>
        )}
      </div>
    </Sheet>
  );
}

function NotificheSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const impostazioni = useImpostazioni();
  const perm = permessoNotifiche();
  return (
    <Sheet open={open} onClose={onClose} title="Notifiche">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1C1915]">Promemoria</p>
            <p className="text-[11px] text-[#9A9187]">Visita dietologo e pasti del piano</p>
          </div>
          <Toggle on={impostazioni.notifiche} onClick={() => void abilitaNotifiche(!impostazioni.notifiche)} />
        </div>
        <p className="text-[11px] text-[#9A9187] leading-relaxed">
          {perm === "granted"
            ? (schedulazioneRealeDisponibile()
              ? "Permesso concesso. Gli avvisi programmati (es. visita) arrivano anche ad app chiusa."
              : "Permesso concesso. Il tuo browser mostra gli avvisi quando l'app è aperta; per gli avvisi ad app chiusa serve un browser che supporti le notifiche programmate.")
            : perm === "denied"
              ? "Permesso negato: riattivalo dalle impostazioni del browser/sito."
              : "Attiva l'interruttore per concedere il permesso alle notifiche."}
        </p>
      </div>
    </Sheet>
  );
}

// ── Info sheet ───────────────────────────────────────────────────────────────
function InfoSheet({ open, onClose, title, emoji, body }: { open: boolean; onClose: () => void; title: string; emoji: string; body: string }) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <span className="text-4xl">{emoji}</span>
        <p className="text-sm text-[#6b645b] leading-relaxed">{body}</p>
        <button onClick={onClose} className={primaryBtn + " mt-2"} style={primaryStyle}>Ho capito</button>
      </div>
    </Sheet>
  );
}

// ── Logout ───────────────────────────────────────────────────────────────────
function LogoutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  function doLogout() {
    resetTutto();
    onClose();
    showToast("Uscito · dati locali azzerati");
  }
  return (
    <Sheet open={open} onClose={onClose} title="Esci dall'account">
      <div className="space-y-3">
        <p className="text-sm text-[#6b645b] leading-relaxed">
          Vuoi uscire? Tutti i dati salvati su questo dispositivo (piano, spesa, obiettivi, dietologo e impostazioni) verranno riportati ai valori iniziali.
        </p>
        <button onClick={doLogout} className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-red-500 shadow-lg active:scale-[0.98] transition-all">
          Esci e azzera i dati
        </button>
        <button onClick={onClose} className="w-full py-3 rounded-2xl text-sm font-bold text-[#9A9187] bg-[#F0EDE8]">Annulla</button>
      </div>
    </Sheet>
  );
}
