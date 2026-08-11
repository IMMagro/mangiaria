import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Sector,
} from "recharts";

// ── Mock weekly data ────────────────────────────────────────────────────────
const SETTIMANA = [
  { giorno: "Lun", kcal: 1820, obiettivo: 2000 },
  { giorno: "Mar", kcal: 2050, obiettivo: 2000 },
  { giorno: "Mer", kcal: 1640, obiettivo: 2000 },
  { giorno: "Gio", kcal: 1950, obiettivo: 2000 },
  { giorno: "Ven", kcal: 2100, obiettivo: 2000 },
  { giorno: "Sab", kcal: 1720, obiettivo: 2000 },
  { giorno: "Dom", kcal: 1240, obiettivo: 2000, oggi: true },
];

const MACROS = [
  { name: "Carboidrati", value: 148, max: 250, color: "#27C882" },
  { name: "Proteine",    value: 82,  max: 150, color: "#6366F1" },
  { name: "Grassi",      value: 41,  max: 80,  color: "#F59E0B" },
];

const DONUT_DATA = MACROS.map((m) => ({ name: m.name, value: m.value, color: m.color }));

const KPI = [
  { label: "Streak 🔥", value: "6", unit: "giorni" },
  { label: "Media kcal", value: "1.789", unit: "kcal/giorno" },
  { label: "Compliance", value: "82", unit: "%" },
  { label: "Acqua oggi", value: "1,4", unit: "/ 2 L" },
];

// ── Custom bar tooltip ──────────────────────────────────────────────────────
function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const kcal = payload[0]?.value as number;
  const over = kcal > 2000;
  return (
    <div className="bg-white rounded-2xl px-3 py-2 shadow-lg border border-black/5">
      <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest">{label}</p>
      <p className={`text-base font-black font-display ${over ? "text-[#F59E0B]" : "text-[#1C1915]"}`}>
        {kcal.toLocaleString("it-IT")} <span className="text-xs font-normal text-[#9A9187]">kcal</span>
      </p>
      {over && <p className="text-[10px] text-[#F59E0B] font-semibold">+{kcal - 2000} sopra obiettivo</p>}
    </div>
  );
}

// ── Active donut sector ─────────────────────────────────────────────────────
function ActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={outerRadius + 6}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
}

// ── Period selector ─────────────────────────────────────────────────────────
const PERIODS = ["Sett.", "Mese", "Anno"] as const;
type Period = typeof PERIODS[number];

// ── Screen ──────────────────────────────────────────────────────────────────
export default function StatsScreen() {
  const [period, setPeriod] = useState<Period>("Sett.");
  const [activeDonut, setActiveDonut] = useState(0);

  const totalKcalWeek = SETTIMANA.reduce((s, d) => s + d.kcal, 0);

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
            <div key={k.label} className="bg-white rounded-3xl px-4 py-4 shadow-sm border border-black/5">
              <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-1">{k.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl font-black text-[#1C1915] leading-none">{k.value}</span>
                <span className="text-xs text-[#9A9187] font-medium">{k.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly kcal bar chart */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest">Calorie settimanali</p>
              <p className="font-display text-2xl font-black text-[#1C1915] mt-0.5 leading-none">
                {totalKcalWeek.toLocaleString("it-IT")}
                <span className="text-sm font-sans font-normal text-[#9A9187] ml-1">kcal totali</span>
              </p>
            </div>
            {/* Obiettivo line legend */}
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-4 h-0.5 bg-[#D0CBC3] rounded-full" style={{ borderTop: "2px dashed #D0CBC3", height: 0 }} />
              <span className="text-[10px] text-[#9A9187] font-medium">Obiettivo</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={SETTIMANA} barSize={28} margin={{ top: 8, right: 0, left: -28, bottom: 0 }}>
              <XAxis
                dataKey="giorno"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 600, fill: "#9A9187", fontFamily: "Outfit" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#C5BFB8", fontFamily: "Outfit" }}
                tickCount={3}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)", radius: 10 }} />
              <Bar dataKey="kcal" radius={[8, 8, 4, 4]}>
                {SETTIMANA.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.oggi ? "#27C882" : entry.kcal > 2000 ? "#F59E0B" : "#E8E4DE"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#E8E4DE]" />
              <span className="text-[10px] text-[#9A9187] font-medium">Nei limiti</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#27C882]" />
              <span className="text-[10px] text-[#9A9187] font-medium">Oggi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#F59E0B]" />
              <span className="text-[10px] text-[#9A9187] font-medium">Sforato</span>
            </div>
          </div>
        </div>

        {/* Macros donut + breakdown */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
          <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest mb-4">
            Macronutrienti — oggi
          </p>

          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="relative w-[140px] h-[140px] flex-shrink-0">
              <PieChart width={140} height={140}>
                <Pie
                  data={DONUT_DATA}
                  cx={65} cy={65}
                  innerRadius={42} outerRadius={58}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#fff"
                  activeIndex={activeDonut}
                  activeShape={<ActiveShape />}
                  onMouseEnter={(_, i) => setActiveDonut(i)}
                >
                  {DONUT_DATA.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
              {/* Center label */}
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
                const pct = Math.round((m.value / m.max) * 100);
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
                        style={{ width: `${pct}%`, background: m.color }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Water tracker */}
        <div className="bg-white rounded-3xl px-5 py-4 shadow-sm border border-black/5 mb-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-[#9A9187] uppercase tracking-widest">Acqua</p>
            <p className="font-display text-xl font-black text-[#1C1915]">
              1,4 <span className="text-sm font-sans font-normal text-[#9A9187]">/ 2 L</span>
            </p>
          </div>
          {/* 8 bicchieri */}
          <div className="flex gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-8 rounded-xl transition-all"
                style={{
                  background: i < 7 ? (i < 5 ? "#27C882" : "#A7EDD0") : "#F0EDE8",
                }}
              />
            ))}
          </div>
          <p className="text-[10px] text-[#9A9187] font-medium mt-2">7 / 8 bicchieri</p>
        </div>

      </div>
    </div>
  );
}
