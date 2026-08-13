import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from "recharts";
import { useGiorno, useAcquaOggi, setAcquaOggi, useProfilo, useImpostazioni, useDiarioMap } from "../store";
import { macroConsumato, macroPianificato } from "../data";
import { serieOggi, serieSettimana, serieMese, serieAnno, statsGlobali, streak } from "../stats";

function BarTooltip({ active, payload, label, obiettivo }: any) {
  if (!active || !payload?.length) return null;
  const kcal = payload[0]?.value as number;
  const over = kcal > obiettivo;
  return (
    <div className="bg-white rounded-2xl px-3 py-2 shadow-lg border border-black/5">
      <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest">{label}</p>
      <p className={`text-base font-black font-display ${over ? "text-[#F59E0B]" : "text-[#1C1915]"}`}>
        {kcal.toLocaleString("it-IT")} <span className="text-xs font-normal text-[#9A9187]">kcal</span>
      </p>
      {over && <p className="text-[10px] text-[#F59E0B] font-semibold">+{kcal - obiettivo} sopra obiettivo</p>}
    </div>
  );
}

const PERIODS = ["Oggi", "Sett.", "Mese", "Anno"] as const;
type Period = typeof PERIODS[number];

export default function StatsScreen() {
  const [period, setPeriod] = useState<Period>("Oggi");
  const [activeDonut, setActiveDonut] = useState(0);
  const [infoPopup, setInfoPopup] = useState<string | null>(null);
  const profilo = useProfilo();
  const impostazioni = useImpostazioni();
  const acqua = useAcquaOggi();
  const acquaMax = impostazioni.acquaMax;
  const diarioMap = useDiarioMap();
  const oggiGiorno = useGiorno(new Date());

  const obiettivoKcal = profilo.obiettivi.kcal;

  // Today's macros (consumed, or planned as reference if nothing logged yet).
  const consumato = macroConsumato(oggiGiorno);
  const usaConsumato = consumato.kcal > 0;
  const oggiMacro = usaConsumato ? consumato : macroPianificato(oggiGiorno);
  const MACROS = [
    { name: "Carboidrati", value: oggiMacro.carbo, max: profilo.obiettivi.carbo, color: "#27C882" },
    { name: "Proteine", value: oggiMacro.proteine, max: profilo.obiettivi.proteine, color: "#6366F1" },
    { name: "Grassi", value: oggiMacro.grassi, max: profilo.obiettivi.grassi, color: "#F59E0B" },
  ];
  const DONUT_DATA = MACROS.map((m) => ({ name: m.name, value: Math.max(m.value, 0), color: m.color }));
  const donutVuoto = DONUT_DATA.every((d) => d.value === 0);

  // All series computed from the real diary history (plan used as reference where nothing logged).
  const today = new Date();
  const dataset =
    period === "Oggi" ? serieOggi(diarioMap, today)
    : period === "Sett." ? serieSettimana(diarioMap, today)
    : period === "Mese" ? serieMese(diarioMap, today)
    : serieAnno(diarioMap, today);
  const mediaKcal = dataset.length
    ? Math.round(dataset.reduce((s, d) => s + d.kcal, 0) / dataset.length)
    : 0;

  const periodLabel = period === "Oggi" ? "di oggi" : period === "Sett." ? "settimanali" : period === "Mese" ? "mensili (media/g per settimana)" : "annuali (media/g per mese)";

  const globali = statsGlobali(diarioMap);
  const streakVal = streak(diarioMap, today);

  const KPI = [
    { label: "Streak 🔥", value: streakVal.toString(), unit: streakVal === 1 ? "giorno" : "giorni", desc: "Giorni consecutivi in cui hai registrato almeno un pasto." },
    { label: "Media kcal", value: mediaKcal.toLocaleString("it-IT"), unit: "kcal/g", desc: "Media delle calorie assunte al giorno nel periodo selezionato." },
    { label: "Compliance", value: globali.compliance.toString(), unit: "%", desc: "Percentuale di giorni in cui hai rispettato il piano alimentare." },
    { label: "Acqua oggi", value: acqua.toString(), unit: `/ ${acquaMax} bicch.`, desc: "Bicchieri d'acqua bevuti oggi rispetto all'obiettivo." },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-28">

      {/* Header */}
      <header className="px-5 pt-14 pb-4">
        <p className="text-sm text-[#9A9187] font-medium">Il tuo andamento</p>
        <h1 className="font-display text-[28px] font-black text-[#1C1915] leading-tight mt-0.5">
          Statistiche
        </h1>
      </header>

      <div className="px-5 space-y-4">

        {/* Period tabs */}
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
                period === p
                  ? "bg-[#1C1915] text-white shadow-sm"
                  : "bg-white text-[#9A9187] border border-black/5"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 gap-3">
          {KPI.map((k) => (
            <div key={k.label} className="bg-white rounded-3xl px-4 py-4 shadow-sm border border-black/5 relative">
              <button 
                onClick={() => setInfoPopup(infoPopup === k.label ? null : k.label)} 
                className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-1 text-left active:scale-95 transition-transform flex items-center gap-1 w-full"
              >
                {k.label} 
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </button>
              <div className="flex items-baseline gap-1 relative z-0">
                <span className="font-display text-3xl font-black text-[#1C1915] leading-none">{k.value}</span>
                <span className="text-xs text-[#9A9187] font-medium">{k.unit}</span>
              </div>
              
              {infoPopup === k.label && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setInfoPopup(null)} />
                  <div className="absolute top-10 left-2 right-2 bg-[#1C1915] text-white p-3 rounded-2xl shadow-xl z-50 text-[11px] leading-relaxed animate-in fade-in slide-in-from-top-2">
                    {k.desc}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Kcal bar chart */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest">Calorie {periodLabel}</p>
              <p className="font-display text-2xl font-black text-[#1C1915] mt-0.5 leading-none">
                {mediaKcal.toLocaleString("it-IT")}
                <span className="text-sm font-sans font-normal text-[#9A9187] ml-1">kcal media/g</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-4 h-0.5 bg-[#D0CBC3] rounded-full" style={{ borderTop: "2px dashed #D0CBC3", height: 0 }} />
              <span className="text-[10px] text-[#9A9187] font-medium">Obiettivo</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dataset} barSize={period === "Anno" ? 14 : 28} margin={{ top: 8, right: 0, left: -28, bottom: 0 }}>
              <XAxis
                dataKey="giorno"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: period === "Anno" ? 9 : 11, fontWeight: 600, fill: "#9A9187", fontFamily: "Outfit" }}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#C5BFB8", fontFamily: "Outfit" }}
                tickCount={3}
              />
              <Tooltip content={<BarTooltip obiettivo={obiettivoKcal} />} cursor={{ fill: "rgba(0,0,0,0.04)", radius: 10 }} />
              <Bar dataKey="kcal" radius={[8, 8, 4, 4]}>
                {dataset.map((entry: any, i) => (
                  <Cell
                    key={i}
                    fill={
                      period === "Oggi" ? (entry.oggi ? "#27C882" : "#E8E4DE")
                      : entry.oggi ? "#27C882"
                      : entry.kcal > obiettivoKcal ? "#F59E0B"
                      : (entry.kcal > 0 && entry.kcal < obiettivoKcal * 0.95) ? "#3B82F6"
                      : "#E8E4DE"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex gap-4 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#E8E4DE]" />
              <span className="text-[10px] text-[#9A9187] font-medium">Nei limiti</span>
            </div>
            {period !== "Oggi" && (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[#3B82F6]" />
                <span className="text-[10px] text-[#9A9187] font-medium">Sotto</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#27C882]" />
              <span className="text-[10px] text-[#9A9187] font-medium">{period === "Oggi" ? "Completato" : "Oggi"}</span>
            </div>
            {period !== "Oggi" && (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[#F59E0B]" />
                <span className="text-[10px] text-[#9A9187] font-medium">Sforato</span>
              </div>
            )}
          </div>
        </div>

        {/* Macros donut + breakdown */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
          <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-4">
            Macronutrienti — oggi {usaConsumato ? "(consumati)" : "(da piano)"}
          </p>

          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="relative w-[140px] h-[140px] flex-shrink-0">
              {donutVuoto ? (
                <div className="w-full h-full rounded-full border-[16px] border-[#F0EDE8]" />
              ) : (
                <PieChart width={140} height={140}>
                  <Pie
                    data={DONUT_DATA}
                    cx={65} cy={65}
                    innerRadius={42} outerRadius={58}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                    onMouseEnter={(_: unknown, i: number) => setActiveDonut(i)}
                    onClick={(_: unknown, i: number) => setActiveDonut(i)}
                  >
                    {DONUT_DATA.map((d, i) => (
                      <Cell
                        key={i}
                        fill={d.color}
                        opacity={i === activeDonut ? 1 : 0.55}
                      />
                    ))}
                  </Pie>
                </PieChart>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-display text-sm font-black text-[#1C1915] leading-none">
                  {MACROS[activeDonut].value}g
                </span>
                <span className="text-[9px] text-[#9A9187] font-semibold mt-0.5 text-center leading-tight px-1">
                  {MACROS[activeDonut].name}
                </span>
              </div>
            </div>

            {/* Bars breakdown */}
            <div className="flex-1 space-y-3.5">
              {MACROS.map((m, i) => {
                const pct = m.max > 0 ? Math.round((m.value / m.max) * 100) : 0;
                return (
                  <button
                    key={m.name}
                    onClick={() => setActiveDonut(i)}
                    className="w-full text-left"
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                        <span className="text-[11px] font-semibold text-[#1C1915]">{m.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#1C1915]">
                        {m.value}<span className="text-[#9A9187] font-normal">/{m.max}g</span>
                      </span>
                    </div>
                    <div className="h-2 bg-[#F0EDE8] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(pct, 100)}%`, background: m.color }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Water tracker — tap glasses to update (resets each day) */}
        <div className="bg-white rounded-3xl px-5 py-4 shadow-sm border border-black/5 mb-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest">Acqua · oggi</p>
            <p className="font-display text-xl font-black text-[#1C1915]">
              {(acqua * 0.25).toLocaleString("it-IT")} <span className="text-sm font-sans font-normal text-[#9A9187]">/ {(acquaMax * 0.25).toLocaleString("it-IT")} L</span>
            </p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: acquaMax }).map((_, i) => {
              const filled = i < acqua;
              const soglia = acquaMax * 0.65;
              return (
                <button
                  key={i}
                  onClick={() => setAcquaOggi(acqua === i + 1 ? i : i + 1)}
                  aria-label={`${i + 1} bicchieri`}
                  className="h-8 rounded-xl transition-all active:scale-90"
                  style={{ flex: "1 1 24px", minWidth: 18, background: filled ? (i < soglia ? "#27C882" : "#A7EDD0") : "#F0EDE8" }}
                />
              );
            })}
          </div>
          <p className="text-[10px] text-[#9A9187] font-medium mt-2">
            {acqua} / {acquaMax} bicchieri (0,25 L l'uno) · tocca per aggiornare · obiettivo modificabile in Impostazioni
          </p>
        </div>

      </div>

    </div>
  );
}
