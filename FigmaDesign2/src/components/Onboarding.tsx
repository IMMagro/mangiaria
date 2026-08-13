import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { setProfilo, setImpostazioni, setDietologo, setPianoWeekday } from "../store";
import { calcolaObiettivi, ATTIVITA_LABEL, OBIETTIVO_LABEL } from "../nutricalc";
import type {
  LivelloAttivita, ObiettivoTipo, Sesso, TipoPasto,
  DiarioPasto, SceltaVoce, Porzione, CategoriaAlimento, UnitaMisura, StatoPasto,
} from "../types";

// ── Step definitions ─────────────────────────────────────────────────────────
type StepId =
  | "benvenuto" | "sesso" | "eta" | "peso" | "altezza"
  | "attivita" | "obiettivo"
  | "dieta" | "pasti_giorno" | "piano"
  | "acqua" | "dietologo";

const STEPS: StepId[] = [
  "benvenuto", "sesso", "eta", "peso", "altezza",
  "attivita", "obiettivo",
  "dieta", "pasti_giorno", "piano",
  "acqua", "dietologo",
];

const STEP_META: Record<StepId, { bg: string; accent: string; title: string; sub?: string }> = {
  benvenuto:    { bg: "#FFF4E6", accent: "#F97316", title: "Benvenuto in\nMangiaria", sub: "Il tuo diario alimentare personale." },
  sesso:        { bg: "#ECFDF5", accent: "#059669", title: "Di che sesso sei?", sub: "Serve per calcolare il tuo fabbisogno calorico." },
  eta:          { bg: "#FFFBEB", accent: "#D97706", title: "Quanti anni hai?" },
  peso:         { bg: "#F0FDF4", accent: "#16A34A", title: "Qual è il tuo peso?" },
  altezza:      { bg: "#EFF6FF", accent: "#2563EB", title: "Qual è la tua altezza?" },
  attivita:     { bg: "#FFF7ED", accent: "#EA580C", title: "Livello di attività", sub: "Quanto ti alleni in media a settimana?" },
  obiettivo:    { bg: "#F0FDF4", accent: "#15803D", title: "Il tuo obiettivo", sub: "Costruisco il tuo piano calorico su misura." },
  dieta:        { bg: "#FEFCE8", accent: "#CA8A04", title: "Che dieta segui?", sub: "Scelgo gli alimenti più adatti a te." },
  pasti_giorno: { bg: "#F5F3FF", accent: "#7C3AED", title: "Quanti pasti al giorno?" },
  piano:        { bg: "#F0FDF4", accent: "#0F766E", title: "Il tuo piano pasti", sub: "Configura gli alimenti giorno per giorno." },
  acqua:        { bg: "#EFF8FF", accent: "#0284C7", title: "Idratazione", sub: "Quanta acqua vuoi bere ogni giorno?" },
  dietologo:    { bg: "#F0FDF4", accent: "#047857", title: "Il tuo nutrizionista", sub: "Facoltativo — potrai compilarlo dopo." },
};

// ── Piano food data types ─────────────────────────────────────────────────────
interface VoceAlimento { nome: string; quantita: string; }
interface PastoForm {
  principale: VoceAlimento;
  alternative: VoceAlimento[];
  condimenti: VoceAlimento[];
  note: string;
}
// key: `${dayIdx}_${tipoPasto}` e.g. "0_colazione"
type PianoFormMap = Record<string, PastoForm>;

type TipoDieta = "onnivoro" | "vegetariano" | "vegano" | "pescatariano" | "flexitariano";

interface Dati {
  nome: string;
  sesso: Sesso | "";
  eta: string;
  peso: string;
  altezza: string;
  attivita: LivelloAttivita | "";
  obiettivoTipo: ObiettivoTipo | "";
  dieta: TipoDieta | "";
  pastiGiorno: string;
  piano: PianoFormMap;
  acqua: string;
  dietologoNome: string;
  dietologoTel: string;
  dietologoEmail: string;
  dietologoVisita: string;
}

const ATTIVITA_OPT: { key: LivelloAttivita; bars: number; desc: string }[] = [
  { key: "sedentario", bars: 1, desc: "Lavoro sedentario, poco o nessun esercizio" },
  { key: "leggero",    bars: 2, desc: "Esercizio leggero 1–2 volte a settimana" },
  { key: "moderato",   bars: 3, desc: "Allenamento moderato 3–4 volte a settimana" },
  { key: "intenso",    bars: 4, desc: "Allenamento intenso 5–6 volte a settimana" },
  { key: "molto",      bars: 5, desc: "Atleta, doppi allenamenti giornalieri" },
];

const OBIETTIVO_OPT: { key: ObiettivoTipo; svg: React.ReactNode; desc: string }[] = [
  {
    key: "dimagrire",
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" /></svg>,
    desc: "Deficit calorico controllato (−17%)",
  },
  {
    key: "mantenere",
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 11h3V8h2v3h3l-4 4-4-4zm8 7H8v-2h8v2zm2-14H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 18H6V6h12v16z" /></svg>,
    desc: "Mantenere il peso attuale",
  },
  {
    key: "aumentare",
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" /></svg>,
    desc: "Surplus per aumentare la massa (+12%)",
  },
];

const PASTI_PER_NUMERO: Record<number, TipoPasto[]> = {
  1: ["pranzo"],
  2: ["colazione", "cena"],
  3: ["colazione", "pranzo", "cena"],
  4: ["colazione", "spuntinoMattina", "pranzo", "cena"],
  5: ["colazione", "spuntinoMattina", "pranzo", "spuntinoPomeriggio", "cena"],
};
const PASTO_LABEL: Record<TipoPasto, string> = {
  colazione: "Colazione",
  spuntinoMattina: "Spuntino mattina",
  pranzo: "Pranzo",
  spuntinoPomeriggio: "Spuntino pomeriggio",
  cena: "Cena",
};
const PASTO_ICON: Record<TipoPasto, string> = {
  colazione: "☀️", spuntinoMattina: "🍎", pranzo: "🌤️", spuntinoPomeriggio: "🍵", cena: "🌙",
};
const GIORNI_SHORT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
// JS weekdays: 0=Sun, 1=Mon ... 6=Sat — map from idx 0(Mon)..6(Sun)
const WD_MAP = [1, 2, 3, 4, 5, 6, 0];

// ── SVG Illustrations ─────────────────────────────────────────────────────────
// ── Photos ────────────────────────────────────────────────────────────────────
const PHOTOS: Record<StepId, string> = {
  benvenuto:    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=800&h=500&q=85",
  sesso:        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=800&h=500&q=85",
  eta:          "https://images.unsplash.com/photo-1529543544282-ea669407fca3?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=800&h=500&q=85",
  peso:         "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=800&h=500&q=85",
  altezza:      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=800&h=500&q=85",
  attivita:     "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=800&h=500&q=85",
  obiettivo:    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=800&h=500&q=85",
  dieta:        "https://images.unsplash.com/photo-1543362906-acfc16c67564?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=800&h=500&q=85",
  pasti_giorno: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=800&h=500&q=85",
  piano:        "https://images.unsplash.com/photo-1606787366850-de6330128bfc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=800&h=500&q=85",
  acqua:        "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=800&h=500&q=85",
  dietologo:    "https://images.unsplash.com/photo-1551190822-a9333d879b1f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=800&h=500&q=85",
};

function IlluBenvenuto() {
  return (
    <svg viewBox="0 0 180 140" width="180" height="140" fill="none">
      <ellipse cx="90" cy="95" rx="52" ry="12" fill="#F97316" opacity="0.15" />
      <path d="M42 70 Q42 104 90 104 Q138 104 138 70 Z" fill="#fff" stroke="#F97316" strokeWidth="2.5" />
      <ellipse cx="90" cy="70" rx="48" ry="12" fill="#FED7AA" stroke="#F97316" strokeWidth="2" />
      <path d="M72 77 Q82 67 90 77 Q98 87 108 77" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="84" cy="62" r="7" fill="#EF4444" />
      <path d="M81 57 Q84 52 87 57" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <ellipse cx="95" cy="59" rx="6" ry="3.5" fill="#16A34A" transform="rotate(-30 95 59)" />
      <rect x="18" y="44" width="4.5" height="50" rx="2" fill="#D97706" />
      <rect x="15" y="44" width="2" height="18" rx="1" fill="#D97706" />
      <rect x="21" y="44" width="2" height="18" rx="1" fill="#D97706" />
      <rect x="157" y="57" width="4.5" height="40" rx="2" fill="#D97706" />
      <ellipse cx="159.5" cy="49" rx="6" ry="9" fill="#D97706" />
      <ellipse cx="159.5" cy="50" rx="4" ry="6.5" fill="#FEF3C7" />
      <circle cx="34" cy="34" r="3" fill="#F97316" opacity="0.5" />
      <circle cx="148" cy="32" r="3.5" fill="#F97316" opacity="0.4" />
    </svg>
  );
}

function IlluSesso() {
  return (
    <svg viewBox="0 0 200 150" width="200" height="150" fill="none">
      {/* Female — left */}
      <circle cx="62" cy="36" r="20" fill="#ECFDF5" />
      <circle cx="62" cy="36" r="14" fill="#059669" />
      {/* hair */}
      <path d="M50 30 Q52 18 62 17 Q72 18 74 30" fill="#047857" />
      <path d="M50 30 Q46 26 48 38" fill="#047857" />
      <path d="M74 30 Q78 26 76 38" fill="#047857" />
      {/* face */}
      <circle cx="57" cy="34" r="2" fill="white" opacity="0.9" />
      <circle cx="67" cy="34" r="2" fill="white" opacity="0.9" />
      <path d="M57 41 Q62 45 67 41" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* dress body */}
      <path d="M48 56 Q45 70 42 90 L82 90 Q79 70 76 56 Q69 62 62 62 Q55 62 48 56Z" fill="#059669" opacity="0.85" />
      {/* legs */}
      <rect x="54" y="88" width="7" height="28" rx="3.5" fill="#059669" />
      <rect x="63" y="88" width="7" height="28" rx="3.5" fill="#059669" />
      {/* shoes */}
      <ellipse cx="57" cy="117" rx="7" ry="4" fill="#047857" />
      <ellipse cx="66" cy="117" rx="7" ry="4" fill="#047857" />
      {/* venus symbol */}
      <circle cx="62" cy="130" r="6" fill="none" stroke="#059669" strokeWidth="2" />
      <line x1="62" y1="136" x2="62" y2="143" stroke="#059669" strokeWidth="2" />
      <line x1="57" y1="140" x2="67" y2="140" stroke="#059669" strokeWidth="2" />

      {/* divider */}
      <line x1="100" y1="18" x2="100" y2="132" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* Male — right */}
      <circle cx="138" cy="36" r="20" fill="#EFF6FF" />
      <circle cx="138" cy="36" r="14" fill="#2563EB" />
      {/* short hair */}
      <path d="M126 30 Q128 20 138 19 Q148 20 150 30 Q148 24 138 23 Q128 24 126 30Z" fill="#1D4ED8" />
      {/* face */}
      <circle cx="133" cy="34" r="2" fill="white" opacity="0.9" />
      <circle cx="143" cy="34" r="2" fill="white" opacity="0.9" />
      <path d="M133 41 Q138 45 143 41" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* shirt body */}
      <path d="M124 56 Q122 70 120 90 L156 90 Q154 70 152 56 Q145 60 138 60 Q131 60 124 56Z" fill="#2563EB" opacity="0.85" />
      {/* collar */}
      <path d="M130 57 L138 65 L146 57" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* legs */}
      <rect x="128" y="88" width="8" height="28" rx="4" fill="#1E40AF" />
      <rect x="139" y="88" width="8" height="28" rx="4" fill="#1E40AF" />
      {/* shoes */}
      <ellipse cx="132" cy="117" rx="8" ry="4" fill="#1E3A8A" />
      <ellipse cx="143" cy="117" rx="8" ry="4" fill="#1E3A8A" />
      {/* mars symbol */}
      <circle cx="138" cy="133" r="5" fill="none" stroke="#2563EB" strokeWidth="2" />
      <line x1="142" y1="129" x2="147" y2="124" stroke="#2563EB" strokeWidth="2" />
      <line x1="144" y1="124" x2="147" y2="124" stroke="#2563EB" strokeWidth="2" />
      <line x1="147" y1="124" x2="147" y2="127" stroke="#2563EB" strokeWidth="2" />
    </svg>
  );
}

function IlluEta() {
  return (
    <svg viewBox="0 0 180 140" width="180" height="140" fill="none">
      <rect x="40" y="98" width="100" height="26" rx="9" fill="#FCD34D" />
      <ellipse cx="90" cy="98" rx="50" ry="7" fill="#FBBF24" />
      <rect x="58" y="68" width="64" height="32" rx="7" fill="#FDE68A" />
      <ellipse cx="90" cy="68" rx="32" ry="5.5" fill="#FCD34D" />
      <path d="M58 72 Q62 80 66 72 Q70 80 74 72 Q78 80 82 72 Q86 80 90 72 Q94 80 98 72 Q102 80 106 72 Q110 80 114 72 Q118 80 122 72" fill="white" stroke="white" strokeWidth="1" />
      <rect x="74" y="49" width="6" height="20" rx="3" fill="#EF4444" />
      <rect x="87" y="43" width="6" height="26" rx="3" fill="#8B5CF6" />
      <rect x="100" y="49" width="6" height="20" rx="3" fill="#F97316" />
      <path d="M77 46 Q80 40 83 46 Q80 49 77 46Z" fill="#FCD34D" />
      <path d="M90 40 Q93 34 96 40 Q93 44 90 40Z" fill="#FCD34D" />
      <path d="M103 46 Q106 40 109 46 Q106 49 103 46Z" fill="#FCD34D" />
    </svg>
  );
}

function IlluPeso() {
  return (
    <svg viewBox="0 0 180 140" width="180" height="140" fill="none">
      <rect x="62" y="100" width="56" height="11" rx="5.5" fill="#16A34A" opacity="0.7" />
      <rect x="80" y="80" width="20" height="22" rx="3.5" fill="#16A34A" opacity="0.6" />
      <path d="M54 80 L90 68 L90 80 Z" stroke="#16A34A" strokeWidth="1.8" fill="none" />
      <ellipse cx="54" cy="80" rx="20" ry="5.5" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.8" />
      <path d="M126 73 L90 68 L90 73 Z" stroke="#16A34A" strokeWidth="1.8" fill="none" />
      <ellipse cx="126" cy="73" rx="20" ry="5.5" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.8" />
      <circle cx="90" cy="68" r="4.5" fill="#16A34A" />
      <rect x="88" y="68" width="4" height="32" rx="2" fill="#16A34A" />
      <circle cx="54" cy="71" r="11" fill="#EF4444" />
      <path d="M54 61 Q57 57 60 61" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="57" cy="59" rx="4" ry="2.5" fill="#16A34A" transform="rotate(20 57 59)" />
      <text x="126" y="70" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#16A34A">70</text>
      <text x="126" y="79" textAnchor="middle" fontSize="7" fill="#16A34A">kg</text>
    </svg>
  );
}

function IlluAltezza() {
  return (
    <svg viewBox="0 0 180 140" width="180" height="140" fill="none">
      <rect x="32" y="18" width="20" height="108" rx="5.5" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.8" />
      {[28, 38, 48, 58, 68, 78, 88, 98, 108, 118].map((y, i) => (
        <g key={i}>
          <line x1="42" y1={y} x2={i % 2 === 0 ? 32 : 37} y2={y} stroke="#2563EB" strokeWidth="1.5" />
          {i % 2 === 0 && <text x="31" y={y + 3.5} textAnchor="end" fontSize="6" fill="#2563EB" fontWeight="bold">{185 - i * 18}</text>}
        </g>
      ))}
      <circle cx="122" cy="38" r="12" fill="#2563EB" opacity="0.8" />
      <circle cx="118" cy="36" r="1.5" fill="white" /><circle cx="126" cy="36" r="1.5" fill="white" />
      <path d="M118 42 Q122 46 126 42" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M122 51 L122 94 M104 68 L140 68 M122 94 L110 118 M122 94 L134 118" stroke="#2563EB" strokeWidth="4.5" strokeLinecap="round" />
      <rect x="68" y="36" width="32" height="14" rx="7" fill="#2563EB" />
      <text x="84" y="47" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">175 cm</text>
    </svg>
  );
}

function IlluAttivita() {
  return (
    <svg viewBox="0 0 200 155" width="200" height="155" fill="none">
      {/* Track */}
      <ellipse cx="100" cy="128" rx="80" ry="10" fill="#FED7AA" opacity="0.5" />
      <path d="M20 128 L180 128" stroke="#FDBA74" strokeWidth="2.5" strokeLinecap="round" />
      {/* Shadow */}
      <ellipse cx="108" cy="126" rx="28" ry="5" fill="#EA580C" opacity="0.12" />
      {/* Motion lines */}
      <line x1="16" y1="72" x2="46" y2="72" stroke="#FDBA74" strokeWidth="3" strokeLinecap="round" />
      <line x1="10" y1="85" x2="38" y2="85" stroke="#FDBA74" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="98" x2="42" y2="98" stroke="#FDBA74" strokeWidth="2" strokeLinecap="round" />
      {/* Head */}
      <circle cx="126" cy="30" r="16" fill="#EA580C" />
      {/* hair */}
      <path d="M114 24 Q116 14 126 13 Q136 14 138 24" fill="#C2410C" />
      {/* face */}
      <circle cx="121" cy="28" r="1.8" fill="white" opacity="0.9" />
      <circle cx="131" cy="28" r="1.8" fill="white" opacity="0.9" />
      <path d="M122 35 Q126 38 130 35" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* torso — leaning forward */}
      <path d="M126 46 Q118 58 112 76" stroke="#EA580C" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* right arm (pumping back) */}
      <path d="M122 54 Q134 58 142 48" stroke="#EA580C" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* left arm (forward) */}
      <path d="M120 58 Q106 64 98 76" stroke="#EA580C" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* right leg (forward kick) */}
      <path d="M112 76 Q104 94 92 106" stroke="#EA580C" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* left leg (push off) */}
      <path d="M114 74 Q124 90 138 90" stroke="#EA580C" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* shoes */}
      <path d="M84 106 Q92 102 102 107 Q98 114 88 113 Q82 111 84 106Z" fill="#1C1915" />
      <path d="M130 90 Q138 86 148 90 Q146 97 136 97 Q128 96 130 90Z" fill="#1C1915" />
      {/* shoe stripe */}
      <line x1="86" y1="110" x2="99" y2="106" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="132" y1="93" x2="145" y2="90" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" />
      {/* sweat drops */}
      <path d="M144 20 Q146 15 148 20 Q148 24 146 24 Q144 24 144 20Z" fill="#BFDBFE" />
      <path d="M154 32 Q156 28 158 32 Q158 35 156 35 Q154 35 154 32Z" fill="#BFDBFE" opacity="0.7" />
      <circle cx="150" cy="16" r="2.5" fill="#BAE6FD" opacity="0.6" />
    </svg>
  );
}

function IlluObiettivo() {
  return (
    <svg viewBox="0 0 180 140" width="180" height="140" fill="none">
      <circle cx="86" cy="78" r="50" fill="#DCFCE7" />
      <circle cx="86" cy="78" r="38" fill="#BBF7D0" />
      <circle cx="86" cy="78" r="26" fill="#4ADE80" opacity="0.6" />
      <circle cx="86" cy="78" r="13" fill="#15803D" />
      <rect x="108" y="30" width="6.5" height="48" rx="3" fill="#1C1915" transform="rotate(40 108 30)" />
      <rect x="102" y="21" width="2.2" height="13" rx="1" fill="#1C1915" transform="rotate(40 102 21)" />
      <rect x="108" y="19" width="2.2" height="13" rx="1" fill="#1C1915" transform="rotate(40 108 19)" />
      <rect x="114" y="17" width="2.2" height="13" rx="1" fill="#1C1915" transform="rotate(40 114 17)" />
      <text x="86" y="82" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white">META</text>
    </svg>
  );
}

function IlluDieta() {
  return (
    <svg viewBox="0 0 180 140" width="180" height="140" fill="none">
      <circle cx="90" cy="82" r="46" fill="#FEF9C3" />
      <circle cx="90" cy="82" r="38" fill="#FFFBEB" />
      <ellipse cx="78" cy="75" rx="18" ry="10" fill="#4ADE80" transform="rotate(-20 78 75)" />
      <ellipse cx="100" cy="72" rx="16" ry="9" fill="#22C55E" transform="rotate(15 100 72)" />
      <ellipse cx="88" cy="68" rx="14" ry="8" fill="#86EFAC" transform="rotate(-5 88 68)" />
      <circle cx="74" cy="88" r="9" fill="#EF4444" />
      <path d="M71 81 Q74 77 77 81" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M100 90 L115 78" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="104" cy="93" rx="8" ry="6" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="1.5" />
      <circle cx="104" cy="93" r="3.5" fill="#FDE047" />
      <rect x="148" y="48" width="4" height="48" rx="2" fill="#CA8A04" />
      <rect x="145" y="48" width="2" height="16" rx="1" fill="#CA8A04" />
      <rect x="151" y="48" width="2" height="16" rx="1" fill="#CA8A04" />
      <rect x="28" y="48" width="4" height="48" rx="2" fill="#CA8A04" />
      <path d="M32 48 Q38 56 32 64 Z" fill="#CA8A04" />
    </svg>
  );
}

function IlluPastiGiorno() {
  return (
    <svg viewBox="0 0 180 140" width="180" height="140" fill="none">
      <circle cx="36" cy="40" r="14" fill="#FCD34D" />
      {[0,60,120,180,240,300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return <line key={i} x1={36 + 17 * Math.cos(rad)} y1={40 + 17 * Math.sin(rad)} x2={36 + 22 * Math.cos(rad)} y2={40 + 22 * Math.sin(rad)} stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />;
      })}
      <path d="M22 60 Q36 50 50 60 Q46 72 36 72 Q26 72 22 60Z" fill="#F59E0B" />
      <path d="M76 72 A20 20 0 0 1 116 72Z" fill="#FCD34D" />
      <path d="M72 88 Q72 110 96 110 Q120 110 120 88 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.8" />
      <ellipse cx="96" cy="88" rx="24" ry="6" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.8" />
      <path d="M84 94 Q90 88 96 94 Q102 100 108 94" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M144 32 A16 16 0 0 1 144 62 A24 24 0 0 0 144 32Z" fill="#8B5CF6" />
      <circle cx="152" cy="26" r="2" fill="#C4B5FD" /><circle cx="160" cy="38" r="1.8" fill="#C4B5FD" /><circle cx="155" cy="50" r="2" fill="#C4B5FD" />
      <ellipse cx="152" cy="100" rx="22" ry="7" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="1.8" />
      <ellipse cx="152" cy="100" rx="14" ry="4.5" fill="#DDD6FE" />
      <path d="M142 98 Q152 93 162 98 Q158 105 152 105 Q146 105 142 98Z" fill="#B45309" />
    </svg>
  );
}

function IlluPiano() {
  // Calendar-style weekly food planner — pure shapes, no emoji/text
  const accent = "#0F766E";
  const days = 7;
  const cellW = 22;
  const startX = 22;
  // Colors for meal dots per day
  const colColors = ["#FCD34D","#FCD34D","#BBF7D0","#FCD34D","#BBF7D0","#DDD6FE","#DDD6FE"];
  return (
    <svg viewBox="0 0 194 148" width="194" height="148" fill="none">
      {/* Card shadow */}
      <rect x="14" y="22" width="166" height="118" rx="12" fill="#0F766E" opacity="0.1" />
      {/* Card */}
      <rect x="12" y="18" width="166" height="118" rx="12" fill="white" stroke="#CCFBF1" strokeWidth="1.5" />
      {/* Header bar */}
      <rect x="12" y="18" width="166" height="30" rx="12" fill={accent} />
      <rect x="12" y="35" width="166" height="13" rx="0" fill={accent} />
      {/* Calendar rings */}
      <rect x="46" y="12" width="7" height="14" rx="3.5" fill={accent} />
      <rect x="137" y="12" width="7" height="14" rx="3.5" fill={accent} />
      {/* Month label — decorative lines */}
      <rect x="76" y="26" width="38" height="5" rx="2.5" fill="white" opacity="0.4" />
      {/* Day headers — colored dots */}
      {colColors.map((c, i) => (
        <circle key={i} cx={startX + i * cellW + 11} cy={45} r={4} fill="white" opacity={0.85} />
      ))}
      {/* Grid rows — food slot blocks */}
      {[0, 1, 2].map((row) => (
        <g key={row}>
          {colColors.map((c, i) => {
            const x = startX + i * cellW;
            const y = 58 + row * 22;
            const filled = (row === 0) || (row === 1 && i < 5) || (row === 2 && i < 3);
            return (
              <g key={i}>
                <rect x={x + 2} y={y} width={cellW - 4} height={14} rx={4}
                  fill={filled ? c : "#F1F5F9"} opacity={filled ? 0.9 : 1} />
                {filled && (
                  <>
                    {/* mini food icon: fork shape */}
                    <rect x={x + 7} y={y + 4} width={1.5} height={6} rx={0.75} fill={accent} opacity={0.7} />
                    <rect x={x + 10} y={y + 4} width={1.5} height={6} rx={0.75} fill={accent} opacity={0.7} />
                    <ellipse cx={x + 14} cy={y + 7} rx={2.5} ry={2} fill={accent} opacity={0.5} />
                  </>
                )}
              </g>
            );
          })}
        </g>
      ))}
      {/* Dividers */}
      {[1,2,3,4,5,6].map(i => (
        <line key={i} x1={startX + i * cellW} y1={55} x2={startX + i * cellW} y2={130}
          stroke="#F1F5F9" strokeWidth="1" />
      ))}
      {/* Pencil decoration */}
      <g transform="rotate(-35 172 22) translate(158 4)">
        <rect width="6" height="22" rx="3" fill="#F97316" />
        <path d="M1 22 L3 28 L5 22Z" fill="#FCD34D" />
        <rect y="0" width="6" height="4" rx="1" fill="#FED7AA" />
      </g>
      {/* Green check badge */}
      <circle cx="168" cy="110" r="12" fill="#0F766E" />
      <polyline points="162,110 166,114 174,106" stroke="white" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function IlluAcqua() {
  return (
    <svg viewBox="0 0 180 140" width="180" height="140" fill="none">
      <ellipse cx="90" cy="126" rx="28" ry="6" fill="#BAE6FD" opacity="0.4" />
      <path d="M66 34 L60 120 Q60 126 90 126 Q120 126 120 120 L114 34 Z" fill="#E0F2FE" opacity="0.65" />
      <clipPath id="gc2"><path d="M66 34 L60 120 Q60 126 90 126 Q120 126 120 120 L114 34 Z" /></clipPath>
      <rect x="52" y="66" width="76" height="64" fill="#38BDF8" opacity="0.55" clipPath="url(#gc2)" />
      <path d="M62 66 Q72 61 82 66 Q90 71 100 66 Q110 61 118 66" stroke="#0EA5E9" strokeWidth="1.8" fill="none" strokeLinecap="round" clipPath="url(#gc2)" />
      <path d="M66 34 L60 120 Q60 126 90 126 Q120 126 120 120 L114 34 Z" fill="none" stroke="#0284C7" strokeWidth="2.2" />
      <ellipse cx="90" cy="34" rx="24" ry="5.5" fill="none" stroke="#0284C7" strokeWidth="2.2" />
      <path d="M44 48 Q47 41 50 48 Q50 54 47 54 Q44 54 44 48Z" fill="#38BDF8" />
      <path d="M132 58 Q135 51 138 58 Q138 63 135 63 Q132 63 132 58Z" fill="#38BDF8" />
      <circle cx="38" cy="52" r="3.5" fill="#BAE6FD" />
      <circle cx="142" cy="44" r="3" fill="#BAE6FD" />
      <rect x="100" y="24" width="4.5" height="64" rx="2" fill="#FDBA74" transform="rotate(5 100 24)" />
      <circle cx="79" cy="94" r="2.5" fill="white" opacity="0.5" />
      <circle cx="98" cy="85" r="2" fill="white" opacity="0.4" />
    </svg>
  );
}

function IlluDietologo() {
  return (
    <svg viewBox="0 0 180 140" width="180" height="140" fill="none">
      <rect x="48" y="28" width="80" height="100" rx="9" fill="#ECFDF5" stroke="#047857" strokeWidth="1.8" />
      <rect x="64" y="20" width="52" height="15" rx="7.5" fill="#047857" />
      <circle cx="90" cy="27.5" r="3.5" fill="#6EE7B7" />
      <line x1="64" y1="54" x2="112" y2="54" stroke="#D1FAE5" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="64" y1="67" x2="106" y2="67" stroke="#D1FAE5" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="64" y1="80" x2="109" y2="80" stroke="#D1FAE5" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="70" y="92" width="16" height="5.5" rx="2.8" fill="#047857" />
      <rect x="75.5" y="86.5" width="5.5" height="16" rx="2.8" fill="#047857" />
      <path d="M122 50 Q144 46 146 68 Q146 86 134 91 Q126 94 122 87" stroke="#047857" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="122" cy="89" r="8" fill="#047857" />
      <circle cx="122" cy="89" r="4.5" fill="#ECFDF5" />
      <circle cx="148" cy="45" r="6.5" fill="#6EE7B7" />
      <circle cx="142" cy="42" r="6.5" fill="#6EE7B7" />
      <circle cx="145" cy="43.5" r="3.5" fill="#047857" />
      <polyline points="96,91 101,98 110,87" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

const ILLUSTRATIONS: Record<StepId, React.ReactNode> = {
  benvenuto:    <IlluBenvenuto />,
  sesso:        <IlluSesso />,
  eta:          <IlluEta />,
  peso:         <IlluPeso />,
  altezza:      <IlluAltezza />,
  attivita:     <IlluAttivita />,
  obiettivo:    <IlluObiettivo />,
  dieta:        <IlluDieta />,
  pasti_giorno: <IlluPastiGiorno />,
  piano:        <IlluPiano />,
  acqua:        <IlluAcqua />,
  dietologo:    <IlluDietologo />,
};

// ── Stepper ───────────────────────────────────────────────────────────────────
function Stepper({ value, onChange, min, max, unit, accent }: {
  value: string; onChange: (v: string) => void; min: number; max: number; unit: string; accent: string;
}) {
  const n = parseInt(value) || 0;
  function handleInput(raw: string) {
    if (raw === "" || raw === "-") { onChange(""); return; }
    const num = parseInt(raw);
    if (isNaN(num)) return;
    // Allow typing numbers below min, but cap at max.
    // The canProceed function will block submission if it's below min.
    onChange(String(Math.min(max, num)));
  }
  return (
    <div className="flex items-center justify-center gap-3 mt-2">
      <button onClick={() => onChange(String(Math.max(min, n - 1)))}
        className="w-11 h-11 rounded-full bg-white border border-black/8 shadow-sm flex items-center justify-center text-xl font-light text-[#1C1915] active:scale-90 transition-transform flex-shrink-0">−</button>
      <div className="text-center w-[120px]">
        <input type="number" inputMode="numeric" value={value} onChange={(e) => handleInput(e.target.value)} placeholder="—"
          className="font-display font-black leading-none tabular-nums text-center bg-transparent border-none outline-none w-full"
          style={{ fontSize: "52px", color: value ? accent : "#C5BFB8", caretColor: accent }} />
        <p className="text-sm text-[#9A9187] font-semibold -mt-1">{unit}</p>
      </div>
      <button onClick={() => onChange(String(Math.min(max, n + 1)))}
        className="w-11 h-11 rounded-full bg-white border border-black/8 shadow-sm flex items-center justify-center text-xl font-light text-[#1C1915] active:scale-90 transition-transform flex-shrink-0">+</button>
    </div>
  );
}

function Check() {
  return (
    <div className="w-6 h-6 rounded-full bg-[#27C882] flex items-center justify-center flex-shrink-0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [dati, setDati] = useState<Dati>({
    nome: "", sesso: "", eta: "", peso: "", altezza: "",
    attivita: "", obiettivoTipo: "",
    dieta: "", pastiGiorno: "3",
    piano: {},
    acqua: "8",
    dietologoNome: "", dietologoTel: "", dietologoEmail: "", dietologoVisita: "",
  });
  const [done, setDone] = useState(false);

  const safeIdx = Math.min(stepIdx, STEPS.length - 1);
  const step = STEPS[safeIdx];
  const meta = STEP_META[step] ?? STEP_META.benvenuto;
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === STEPS.length - 1;

  function canProceed() {
    if (step === "benvenuto")    return dati.nome.trim().length >= 2;
    if (step === "sesso")        return !!dati.sesso;
    if (step === "eta")          return parseInt(dati.eta) >= 10 && parseInt(dati.eta) <= 100;
    if (step === "peso")         return parseInt(dati.peso) >= 30 && parseInt(dati.peso) <= 300;
    if (step === "altezza")      return parseInt(dati.altezza) >= 100 && parseInt(dati.altezza) <= 250;
    if (step === "attivita")     return !!dati.attivita;
    if (step === "obiettivo")    return !!dati.obiettivoTipo;
    if (step === "dieta")        return !!dati.dieta;
    if (step === "pasti_giorno") return parseInt(dati.pastiGiorno) >= 1;
    if (step === "piano")        return true; // optional — skip allowed
    if (step === "acqua")        return parseInt(dati.acqua) >= 1;
    if (step === "dietologo")    return true;
    return false;
  }

  function goNext() {
    if (!canProceed()) return;
    if (isLast) { handleComplete(); return; }
    setDir(1);
    setStepIdx((i) => i + 1);
  }

  function goBack() {
    if (isFirst) return;
    setDir(-1);
    setStepIdx((i) => i - 1);
  }

  function skip() {
    setDir(1);
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  }

  function handleComplete() {
    const peso = parseFloat(dati.peso);
    const altezza = parseFloat(dati.altezza);
    const eta = parseInt(dati.eta);
    const sesso = dati.sesso as Sesso;
    const attivita = dati.attivita as LivelloAttivita;
    const obiettivoTipo = dati.obiettivoTipo as ObiettivoTipo;
    const acquaMax = parseInt(dati.acqua) || 8;
    const obiettivi = calcolaObiettivi({ peso, altezza, eta, sesso, attivita, obiettivoTipo });

    setProfilo({
      nome: dati.nome.trim(), peso, altezza, eta, sesso, attivita, obiettivoTipo, obiettivi,
      inizio: new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }),
    });

    // ── Save weekly food plan ──────────────────────────────────────────────
    const numPasti = Math.min(Math.max(parseInt(dati.pastiGiorno) || 3, 1), 5);
    const tipiPasto = PASTI_PER_NUMERO[numPasti] ?? PASTI_PER_NUMERO[3];
    const ts = Date.now();

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const wd = WD_MAP[dayIdx];
      const pastiGiorno: DiarioPasto[] = [];

      for (const tipo of tipiPasto) {
        const form = dati.piano[`${dayIdx}_${tipo}`];
        if (!form?.principale?.nome?.trim()) continue;

        const scelteEffettuate: SceltaVoce[] = [];

        // Main food + alternatives as one SceltaVoce
        const allAlts = [form.principale, ...form.alternative].filter(a => a.nome.trim());
        if (allAlts.length > 0) {
          const porzioni: Porzione[] = allAlts.map((a, i) => ({
            id: `p_${ts}_${dayIdx}_${tipo}_${i}`,
            alimento: {
              id: `a_${ts}_${dayIdx}_${tipo}_${i}`,
              nome: a.nome.trim(),
              categoria: "altro" as CategoriaAlimento,
              unitaMisura: "g" as UnitaMisura,
            },
            quantita: parseFloat(a.quantita) || 100,
          }));
          scelteEffettuate.push({
            titoloLogico: form.principale.nome.trim(),
            alternative: porzioni,
            porzioneSelezionataId: porzioni[0].id,
          });
        }

        // Condiments as separate SceltaVoce (fixed, single option)
        for (const cond of form.condimenti.filter(c => c.nome.trim())) {
          const pid = `c_${ts}_${dayIdx}_${tipo}_${cond.nome}`;
          scelteEffettuate.push({
            titoloLogico: cond.nome.trim(),
            alternative: [{
              id: pid,
              alimento: {
                id: `ca_${pid}`,
                nome: cond.nome.trim(),
                categoria: "altro" as CategoriaAlimento,
                unitaMisura: "g" as UnitaMisura,
                isDispensa: true,
              },
              quantita: parseFloat(cond.quantita) || 0,
            }],
            porzioneSelezionataId: pid,
          });
        }

        pastiGiorno.push({
          id: `pasto_${ts}_${dayIdx}_${tipo}`,
          tipo,
          stato: "daConsumare" as StatoPasto,
          scelteEffettuate,
          notePersonali: form.note?.trim() || undefined,
        });
      }

      if (pastiGiorno.length > 0) {
        setPianoWeekday(wd, pastiGiorno);
      }
    }

    if (dati.dietologoNome.trim()) {
      setDietologo({
        nome: dati.dietologoNome.trim(),
        telefono: dati.dietologoTel.trim() || undefined,
        email: dati.dietologoEmail.trim() || undefined,
        prossimaVisita: dati.dietologoVisita || null,
      });
    }

    setImpostazioni({ acquaMax, onboardingCompleto: true });
    setDone(true);
    setTimeout(onComplete, 2400);
  }

  // ── Completion screen ─────────────────────────────────────────────────────
  if (done) {
    const pianoDaysCount = Object.keys(dati.piano).length;
    return (
      <div className="fixed inset-0 z-50 flex justify-center" style={{ background: "#0D2B1E" }}>
        <div className="w-full max-w-[430px] relative overflow-hidden flex flex-col items-center justify-center px-8 text-center">
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 430 900" fill="none">
            <ellipse cx="80" cy="200" rx="120" ry="60" fill="#27C882" transform="rotate(-30 80 200)" />
            <ellipse cx="350" cy="150" rx="100" ry="50" fill="#27C882" transform="rotate(20 350 150)" />
            <ellipse cx="50" cy="700" rx="90" ry="45" fill="#27C882" transform="rotate(-15 50 700)" />
            <ellipse cx="380" cy="750" rx="110" ry="55" fill="#27C882" transform="rotate(25 380 750)" />
          </svg>
          <motion.div initial={{ scale: 0.7, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
            className="flex flex-col items-center gap-6 relative">
            <div className="w-28 h-28 rounded-[32px] flex items-center justify-center shadow-2xl"
              style={{ background: "linear-gradient(135deg, #27C882, #0D9448)" }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
            </div>
            <div>
              <h2 className="font-display text-[38px] font-black text-white leading-tight">
                Tutto pronto,<br />{dati.nome.trim()}!
              </h2>
              <p className="text-white/60 text-[15px] font-medium mt-3 leading-relaxed">
                Il tuo piano alimentare<br />personalizzato è pronto.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <div className="px-4 py-2 rounded-2xl" style={{ background: "rgba(39,200,130,0.15)" }}>
                <p className="text-[10px] font-bold text-[#27C882] uppercase tracking-widest">Dieta</p>
                <p className="text-sm font-bold text-white mt-0.5 capitalize">{dati.dieta || "Configurata"}</p>
              </div>
              {pianoDaysCount > 0 && (
                <div className="px-4 py-2 rounded-2xl" style={{ background: "rgba(39,200,130,0.15)" }}>
                  <p className="text-[10px] font-bold text-[#27C882] uppercase tracking-widest">Piano</p>
                  <p className="text-sm font-bold text-white mt-0.5">{pianoDaysCount} pasti</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Main flow ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex justify-center" style={{ background: meta.bg }}>
      <div className="w-full max-w-[430px] flex flex-col overflow-hidden relative">

        {/* ── Top nav ── */}
        <div className="flex items-center justify-between px-5 pt-12 pb-3 flex-shrink-0 z-20 relative">
          <button onClick={goBack}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: isFirst ? "transparent" : "rgba(0,0,0,0.07)", pointerEvents: isFirst ? "none" : "auto", opacity: isFirst ? 0 : 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={meta.accent}>
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <p className="text-xs font-bold" style={{ color: meta.accent }}>{stepIdx + 1} / {STEPS.length}</p>
          {!isLast ? (
            <button onClick={skip} className="text-xs font-bold px-1 py-1" style={{ color: meta.accent }}>Salta</button>
          ) : <div className="w-10" />}
        </div>

        {/* ── Ghost cards ── */}
        <div className="relative flex-1 flex flex-col px-4 pb-8">
          <div className="absolute inset-x-4 bottom-8 rounded-[28px] bg-white/60"
            style={{ top: "28px", transform: "scale(0.88) translateY(16px)", transformOrigin: "bottom center", zIndex: 0 }} />
          <div className="absolute inset-x-4 bottom-8 rounded-[28px] bg-white/80"
            style={{ top: "16px", transform: "scale(0.94) translateY(8px)", transformOrigin: "bottom center", zIndex: 1 }} />

          {/* ── Animated card ── */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={{
                enter: (d: number) => ({ y: d > 0 ? "100%" : 0, scale: d > 0 ? 1 : 0.88, opacity: d > 0 ? 1 : 0.5 }),
                center: { y: 0, scale: 1, opacity: 1 },
                exit: (d: number) => ({ y: d > 0 ? 0 : "100%", scale: d > 0 ? 0.88 : 1, opacity: d > 0 ? 0.5 : 1 }),
              }}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white flex flex-col overflow-hidden shadow-2xl"
              style={{ top: "0px", zIndex: 10 }}
            >
              {/* Photo */}
              <div className="relative flex-shrink-0 overflow-hidden" style={{ height: "200px" }}>
                <img
                  src={PHOTOS[step]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
              </div>
              <svg viewBox="0 0 430 28" className="w-full flex-shrink-0 -mt-px" preserveAspectRatio="none" style={{ height: "28px", display: "block" }}>
                <path d="M0 28 Q215 0 430 28 L430 0 L0 0 Z" fill="white" />
              </svg>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 pt-1 pb-2">
                <h1 className="font-display font-black text-[#1C1915] leading-tight mb-1" style={{ fontSize: "24px" }}>
                  {meta.title.split("\n").map((line, i) => (
                    <span key={i}>{line}{i < meta.title.split("\n").length - 1 && <br />}</span>
                  ))}
                </h1>
                {meta.sub && <p className="text-sm text-[#9A9187] font-medium mb-2">{meta.sub}</p>}

                {step === "benvenuto"    && <ContentBenvenuto dati={dati} setDati={setDati} accent={meta.accent} />}
                {step === "sesso"        && <ContentSesso dati={dati} setDati={setDati} />}
                {step === "eta"          && <ContentNumero unit="anni" field="eta" min={10} max={100} hint="Anni compiuti" dati={dati} setDati={setDati} accent={meta.accent} />}
                {step === "peso"         && <ContentNumero unit="kg" field="peso" min={30} max={300} hint="Peso in chilogrammi" dati={dati} setDati={setDati} accent={meta.accent} />}
                {step === "altezza"      && <ContentNumero unit="cm" field="altezza" min={100} max={250} hint="Altezza in centimetri" dati={dati} setDati={setDati} accent={meta.accent} />}
                {step === "attivita"     && <ContentAttivita dati={dati} setDati={setDati} />}
                {step === "obiettivo"    && <ContentObiettivo dati={dati} setDati={setDati} />}
                {step === "dieta"        && <ContentDieta dati={dati} setDati={setDati} />}
                {step === "pasti_giorno" && <ContentNumero unit="pasti" field="pastiGiorno" min={1} max={7} hint="Colazione, pranzo, cena e spuntini" dati={dati} setDati={setDati} accent={meta.accent} />}
                {step === "piano"        && <ContentPiano dati={dati} setDati={setDati} accent={meta.accent} />}
                {step === "acqua"        && <ContentNumero unit="bicchieri" field="acqua" min={1} max={15} hint="Obiettivo giornaliero di idratazione" dati={dati} setDati={setDati} accent={meta.accent} />}
                {step === "dietologo"    && <ContentDietologo dati={dati} setDati={setDati} />}
              </div>

              {/* CTA */}
              <div className="px-5 pb-8 pt-3 flex-shrink-0">
                <div className="flex justify-center gap-1.5 mb-4">
                  {STEPS.map((_, i) => (
                    <div key={i} className="rounded-full transition-all duration-300"
                      style={{ width: i === stepIdx ? "18px" : "5px", height: "5px", background: i <= stepIdx ? meta.accent : "#E5E0D8" }} />
                  ))}
                </div>
                <button onClick={goNext} disabled={!canProceed()}
                  className="w-full py-4 rounded-3xl text-base font-bold text-white transition-all active:scale-[0.98] disabled:opacity-30"
                  style={{
                    background: canProceed() ? `linear-gradient(135deg, ${meta.accent} 0%, ${meta.accent}CC 100%)` : "#C5BFB8",
                    boxShadow: canProceed() ? `0 8px 24px ${meta.accent}40` : "none",
                  }}>
                  {isLast ? "Inizia il tuo percorso" : "Continua"}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Content: Benvenuto ────────────────────────────────────────────────────────
function ContentBenvenuto({ dati, setDati, accent }: { dati: Dati; setDati: React.Dispatch<React.SetStateAction<Dati>>; accent: string }) {
  return (
    <div className="py-1">
      <label className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest block mb-2">Come ti chiami?</label>
      <input type="text" placeholder="Il tuo nome…" value={dati.nome}
        onChange={(e) => setDati((d) => ({ ...d, nome: e.target.value }))} autoFocus
        className="w-full bg-[#F7F5F2] rounded-2xl px-5 py-4 text-[17px] font-bold text-[#1C1915] placeholder:text-[#C5BFB8] border border-black/5 focus:outline-none"
        onFocus={(e) => { e.target.style.boxShadow = `0 0 0 3px ${accent}30`; }}
        onBlur={(e) => { e.target.style.boxShadow = ""; }} />
      <p className="text-xs text-[#C5BFB8] font-medium mt-3 text-center">Circa 3 minuti per completare il questionario.</p>
    </div>
  );
}

// ── Content: Sesso ────────────────────────────────────────────────────────────
function ContentSesso({ dati, setDati }: { dati: Dati; setDati: React.Dispatch<React.SetStateAction<Dati>> }) {
  const opts: { key: Sesso; label: string; svg: React.ReactNode; desc: string; accent: string; bg: string }[] = [
    { key: "uomo", label: "Uomo", desc: "Metabolismo maschile", accent: "#2563EB", bg: "#DBEAFE",
      svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11.75A2.25 2.25 0 0 0 6.75 14 2.25 2.25 0 0 0 9 16.25 2.25 2.25 0 0 0 11.25 14 2.25 2.25 0 0 0 9 11.75M15 2l2.29 2.29-2.88 2.88A7 7 0 0 1 16 12a7 7 0 0 1-7 7 7 7 0 0 1-7-7 7 7 0 0 1 7-7c1.43 0 2.76.43 3.88 1.17L15.76 3.3 18 2M9 6a6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6A6 6 0 0 0 9 6z" /></svg> },
    { key: "donna", label: "Donna", desc: "Metabolismo femminile", accent: "#DB2777", bg: "#FCE7F3",
      svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2a7 7 0 0 1 7 7 7 7 0 0 1-5.33 6.79L13 17h2v2h-2v3h-2v-3H9v-2h2l.33-1.21A7 7 0 0 1 4 9a7 7 0 0 1 7-7m0 2a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5z" /></svg> },
  ];
  return (
    <div className="flex flex-col gap-3 py-1">
      {opts.map((o) => {
        const sel = dati.sesso === o.key;
        return (
          <button key={o.key} onClick={() => setDati((d) => ({ ...d, sesso: o.key }))}
            className="flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] text-left"
            style={{ borderColor: sel ? o.accent : "rgba(0,0,0,0.07)", background: sel ? o.bg : "#F7F5F2" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: sel ? o.accent + "30" : "#ECEAE6", color: sel ? o.accent : "#9A9187" }}>{o.svg}</div>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-[#1C1915]">{o.label}</p>
              <p className="text-xs text-[#9A9187] font-medium mt-0.5">{o.desc}</p>
            </div>
            {sel && <Check />}
          </button>
        );
      })}
    </div>
  );
}

// ── Content: Numero ───────────────────────────────────────────────────────────
function ContentNumero({ unit, field, min, max, hint, dati, setDati, accent }: {
  unit: string; field: "eta" | "peso" | "altezza" | "acqua" | "pastiGiorno";
  min: number; max: number; hint: string; accent: string;
  dati: Dati; setDati: React.Dispatch<React.SetStateAction<Dati>>;
}) {
  return (
    <div className="py-2">
      <Stepper value={dati[field]} onChange={(v) => setDati((d) => ({ ...d, [field]: v }))} min={min} max={max} unit={unit} accent={accent} />
      <p className="text-center text-xs text-[#C5BFB8] font-medium mt-4">{hint}</p>
    </div>
  );
}

// ── Content: Attività ─────────────────────────────────────────────────────────
function ContentAttivita({ dati, setDati }: { dati: Dati; setDati: React.Dispatch<React.SetStateAction<Dati>> }) {
  return (
    <div className="flex flex-col gap-1.5 py-1">
      {ATTIVITA_OPT.map((o) => {
        const sel = dati.attivita === o.key;
        return (
          <button key={o.key} onClick={() => setDati((d) => ({ ...d, attivita: o.key }))}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all active:scale-[0.98] text-left"
            style={{ borderColor: sel ? "#EA580C" : "rgba(0,0,0,0.07)", background: sel ? "#FFF7ED" : "#F7F5F2" }}>
            <div className="flex items-end gap-[3px] w-8 h-6 flex-shrink-0">
              {[1,2,3,4,5].map((b) => (
                <div key={b} className="flex-1 rounded-sm transition-colors"
                  style={{ height: `${40 + b * 12}%`, background: b <= o.bars ? (sel ? "#EA580C" : "#1C1915") : "#E0DBD5" }} />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[#1C1915]">{ATTIVITA_LABEL[o.key]}</p>
              <p className="text-[11px] text-[#9A9187] font-medium mt-0.5 truncate">{o.desc}</p>
            </div>
            {sel && <Check />}
          </button>
        );
      })}
    </div>
  );
}

// ── Content: Obiettivo ────────────────────────────────────────────────────────
function ContentObiettivo({ dati, setDati }: { dati: Dati; setDati: React.Dispatch<React.SetStateAction<Dati>> }) {
  return (
    <div className="flex flex-col gap-2 py-1">
      {OBIETTIVO_OPT.map((o) => {
        const sel = dati.obiettivoTipo === o.key;
        return (
          <button key={o.key} onClick={() => setDati((d) => ({ ...d, obiettivoTipo: o.key }))}
            className="flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] text-left"
            style={{ borderColor: sel ? "#15803D" : "rgba(0,0,0,0.07)", background: sel ? "#F0FDF4" : "#F7F5F2" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: sel ? "#BBF7D0" : "#ECEAE6", color: sel ? "#15803D" : "#9A9187" }}>{o.svg}</div>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-[#1C1915]">{OBIETTIVO_LABEL[o.key]}</p>
              <p className="text-xs text-[#9A9187] font-medium mt-0.5">{o.desc}</p>
            </div>
            {sel && <Check />}
          </button>
        );
      })}
    </div>
  );
}

import iconOmnivoro from "../assets/icons/diet_omnivore_256.png";
import iconFlexitariano from "../assets/icons/diet_flexitarian_256.png";
import iconVegetariano from "../assets/icons/diet_vegetarian_256.png";
import iconPescatariano from "../assets/icons/diet_pescatarian_256.png";
import iconVegano from "../assets/icons/diet_vegan_256.png";

// ── Content: Dieta ────────────────────────────────────────────────────────────
const DIETA_OPT: { key: TipoDieta; label: string; desc: string; iconImg: string }[] = [
  { key: "onnivoro",     label: "Onnivoro",     desc: "Mangio di tutto",             iconImg: iconOmnivoro },
  { key: "flexitariano", label: "Flexitariano", desc: "Prevalentemente vegetale",    iconImg: iconFlexitariano },
  { key: "vegetariano",  label: "Vegetariano",  desc: "No carne, sì latticini/uova", iconImg: iconVegetariano },
  { key: "pescatariano", label: "Pescatariano", desc: "No carne, sì pesce",          iconImg: iconPescatariano },
  { key: "vegano",       label: "Vegano",       desc: "Solo alimenti vegetali",      iconImg: iconVegano },
];

function ContentDieta({ dati, setDati }: { dati: Dati; setDati: React.Dispatch<React.SetStateAction<Dati>> }) {
  return (
    <div className="flex flex-col gap-1.5 py-1">
      {DIETA_OPT.map((o) => {
        const sel = dati.dieta === o.key;
        return (
          <button key={o.key} onClick={() => setDati((d) => ({ ...d, dieta: o.key }))}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all active:scale-[0.98] text-left"
            style={{ borderColor: sel ? "#CA8A04" : "rgba(0,0,0,0.07)", background: sel ? "#FEFCE8" : "#F7F5F2" }}>
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg overflow-hidden mix-blend-multiply">
              <img src={o.iconImg} alt={o.label} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[#1C1915]">{o.label}</p>
              <p className="text-[11px] text-[#9A9187] font-medium">{o.desc}</p>
            </div>
            {sel && <Check />}
          </button>
        );
      })}
    </div>
  );
}

// ── Content: Piano ────────────────────────────────────────────────────────────
function ContentPiano({ dati, setDati, accent }: { dati: Dati; setDati: React.Dispatch<React.SetStateAction<Dati>>; accent: string }) {
  const [selDay, setSelDay] = useState(0);
  const [openMeal, setOpenMeal] = useState<TipoPasto | null>("colazione");

  const numPasti = Math.min(Math.max(parseInt(dati.pastiGiorno) || 3, 1), 5);
  const tipiPasto = PASTI_PER_NUMERO[numPasti] ?? PASTI_PER_NUMERO[3];

  function getPasto(day: number, tipo: TipoPasto): PastoForm {
    return dati.piano[`${day}_${tipo}`] ?? { principale: { nome: "", quantita: "" }, alternative: [], condimenti: [], note: "" };
  }

  function setPasto(day: number, tipo: TipoPasto, updater: (p: PastoForm) => PastoForm) {
    const key = `${day}_${tipo}`;
    setDati(d => ({ ...d, piano: { ...d.piano, [key]: updater(getPasto(day, tipo)) } }));
  }

  function hasDati(day: number, tipo: TipoPasto) {
    return !!dati.piano[`${day}_${tipo}`]?.principale?.nome?.trim();
  }

  return (
    <div>
      {/* Day pills */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
        {GIORNI_SHORT.map((g, i) => {
          const filled = tipiPasto.filter(t => hasDati(i, t)).length;
          const complete = filled === tipiPasto.length;
          return (
            <button key={i} onClick={() => { setSelDay(i); setOpenMeal(tipiPasto[0]); }}
              className="flex-shrink-0 flex flex-col items-center px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: selDay === i ? "#1C1915" : "#F0EDE8", color: selDay === i ? "white" : "#9A9187" }}>
              {g}
              <span className="w-1.5 h-1.5 rounded-full mt-0.5"
                style={{ background: filled === 0 ? "transparent" : complete ? "#27C882" : "#F59E0B" }} />
            </button>
          );
        })}
      </div>

      {/* Meal accordions */}
      <div className="space-y-1.5">
        {tipiPasto.map(tipo => {
          const pasto = getPasto(selDay, tipo);
          const isOpen = openMeal === tipo;
          const hasData = hasDati(selDay, tipo);

          return (
            <div key={tipo} className="rounded-2xl border-2 overflow-hidden transition-all"
              style={{ borderColor: isOpen ? accent : hasData ? "#27C882" : "rgba(0,0,0,0.07)", background: isOpen ? "#F7F5F2" : "white" }}>

              {/* Header */}
              <button className="w-full flex items-center justify-between px-4 py-3"
                onClick={() => setOpenMeal(isOpen ? null : tipo)}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base flex-shrink-0">{PASTO_ICON[tipo]}</span>
                  <span className="text-[13px] font-bold text-[#1C1915]">{PASTO_LABEL[tipo]}</span>
                  {hasData && !isOpen && (
                    <span className="text-[11px] font-semibold truncate" style={{ color: accent }}>
                      · {pasto.principale.nome}{pasto.principale.quantita ? ` ${pasto.principale.quantita}g` : ""}
                    </span>
                  )}
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#9A9187"
                  style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>

              {/* Expanded form */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  {/* Primary food */}
                  <div>
                    <p className="text-[10px] font-bold text-[#9A9187] uppercase tracking-widest mb-1.5">Alimento principale</p>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Es. Yogurt greco" value={pasto.principale.nome}
                        onChange={e => setPasto(selDay, tipo, p => ({ ...p, principale: { ...p.principale, nome: e.target.value } }))}
                        className="flex-1 bg-white rounded-xl px-3 py-2.5 text-[13px] font-semibold text-[#1C1915] placeholder:text-[#C5BFB8] border border-black/8 focus:outline-none" />
                      <div className="flex items-center gap-1 bg-white rounded-xl px-3 border border-black/8" style={{ minWidth: "72px" }}>
                        <input type="number" inputMode="numeric" placeholder="—" value={pasto.principale.quantita}
                          onChange={e => setPasto(selDay, tipo, p => ({ ...p, principale: { ...p.principale, quantita: e.target.value } }))}
                          className="w-[36px] bg-transparent text-[13px] font-bold text-[#1C1915] text-right border-none focus:outline-none py-2.5" />
                        <span className="text-[11px] text-[#9A9187] font-semibold">g</span>
                      </div>
                    </div>
                  </div>

                  {/* Alternatives */}
                  {pasto.alternative.map((alt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-[10px] font-bold text-[#9A9187] w-9 flex-shrink-0 text-right">oppure</span>
                      <input type="text" placeholder="Alternativa…" value={alt.nome}
                        onChange={e => setPasto(selDay, tipo, p => ({ ...p, alternative: p.alternative.map((a, i) => i === idx ? { ...a, nome: e.target.value } : a) }))}
                        className="flex-1 bg-white rounded-xl px-3 py-2 text-[13px] font-semibold text-[#1C1915] placeholder:text-[#C5BFB8] border border-black/8 focus:outline-none" />
                      <div className="flex items-center gap-1 bg-white rounded-xl px-2 border border-black/8" style={{ minWidth: "58px" }}>
                        <input type="number" inputMode="numeric" placeholder="—" value={alt.quantita}
                          onChange={e => setPasto(selDay, tipo, p => ({ ...p, alternative: p.alternative.map((a, i) => i === idx ? { ...a, quantita: e.target.value } : a) }))}
                          className="w-[28px] bg-transparent text-[13px] font-bold text-[#1C1915] text-right border-none focus:outline-none py-2" />
                        <span className="text-[11px] text-[#9A9187] font-semibold">g</span>
                      </div>
                      <button onClick={() => setPasto(selDay, tipo, p => ({ ...p, alternative: p.alternative.filter((_, i) => i !== idx) }))}
                        className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#E11D48"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                      </button>
                    </div>
                  ))}

                  <button onClick={() => setPasto(selDay, tipo, p => ({ ...p, alternative: [...p.alternative, { nome: "", quantita: "" }] }))}
                    className="flex items-center gap-1.5 text-[11px] font-bold py-0.5" style={{ color: accent }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                    Aggiungi alternativa
                  </button>

                  {/* Condiments */}
                  {pasto.condimenti.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-[#9A9187] uppercase tracking-widest">Condimenti fissi</p>
                      {pasto.condimenti.map((cond, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input type="text" placeholder="Es. Olio EVO" value={cond.nome}
                            onChange={e => setPasto(selDay, tipo, p => ({ ...p, condimenti: p.condimenti.map((c, i) => i === idx ? { ...c, nome: e.target.value } : c) }))}
                            className="flex-1 bg-white rounded-xl px-3 py-2 text-[13px] font-semibold text-[#1C1915] placeholder:text-[#C5BFB8] border border-black/8 focus:outline-none" />
                          <div className="flex items-center gap-1 bg-white rounded-xl px-2 border border-black/8" style={{ minWidth: "58px" }}>
                            <input type="number" inputMode="numeric" placeholder="—" value={cond.quantita}
                              onChange={e => setPasto(selDay, tipo, p => ({ ...p, condimenti: p.condimenti.map((c, i) => i === idx ? { ...c, quantita: e.target.value } : c) }))}
                              className="w-[28px] bg-transparent text-[13px] font-bold text-[#1C1915] text-right border-none focus:outline-none py-2" />
                            <span className="text-[11px] text-[#9A9187] font-semibold">g</span>
                          </div>
                          <button onClick={() => setPasto(selDay, tipo, p => ({ ...p, condimenti: p.condimenti.filter((_, i) => i !== idx) }))}
                            className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#E11D48"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button onClick={() => setPasto(selDay, tipo, p => ({ ...p, condimenti: [...p.condimenti, { nome: "", quantita: "" }] }))}
                    className="flex items-center gap-1.5 text-[11px] font-bold py-0.5 text-[#9A9187]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                    Aggiungi condimento
                  </button>

                  {/* Notes */}
                  <div>
                    <p className="text-[10px] font-bold text-[#9A9187] uppercase tracking-widest mb-1.5">Note preparazione</p>
                    <textarea placeholder="Es. Merluzzo al pomodoro, verdure e pane…" value={pasto.note}
                      onChange={e => setPasto(selDay, tipo, p => ({ ...p, note: e.target.value }))}
                      rows={2}
                      className="w-full bg-white rounded-xl px-3 py-2.5 text-[13px] font-semibold text-[#1C1915] placeholder:text-[#C5BFB8] border border-black/8 focus:outline-none resize-none" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Content: Dietologo ────────────────────────────────────────────────────────
function ContentDietologo({ dati, setDati }: { dati: Dati; setDati: React.Dispatch<React.SetStateAction<Dati>> }) {
  return (
    <div className="space-y-3 py-1">
      <div>
        <label className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest block mb-1.5">Nome e cognome</label>
        <input type="text" placeholder="Es. Dott.ssa Rossi" value={dati.dietologoNome}
          onChange={(e) => setDati((d) => ({ ...d, dietologoNome: e.target.value }))}
          className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-[#1C1915] placeholder:text-[#C5BFB8] border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#047857]/30" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest block mb-1.5">Telefono</label>
          <input type="tel" placeholder="+39 …" value={dati.dietologoTel}
            onChange={(e) => setDati((d) => ({ ...d, dietologoTel: e.target.value }))}
            className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-3.5 text-[14px] font-semibold text-[#1C1915] placeholder:text-[#C5BFB8] border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#047857]/30" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest block mb-1.5">Email</label>
          <input type="email" placeholder="nome@studio.it" value={dati.dietologoEmail}
            onChange={(e) => setDati((d) => ({ ...d, dietologoEmail: e.target.value }))}
            className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-3.5 text-[14px] font-semibold text-[#1C1915] placeholder:text-[#C5BFB8] border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#047857]/30" />
        </div>
      </div>
      <div>
        <label className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest block mb-1.5">Prossima visita</label>
        <input type="datetime-local" value={dati.dietologoVisita}
          onChange={(e) => setDati((d) => ({ ...d, dietologoVisita: e.target.value }))}
          className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-3.5 text-[14px] font-semibold text-[#1C1915] border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#047857]/30" />
      </div>
      <p className="text-center text-[11px] text-[#C5BFB8] font-medium pt-1">Aggiornabile in qualsiasi momento dal Profilo.</p>
    </div>
  );
}
