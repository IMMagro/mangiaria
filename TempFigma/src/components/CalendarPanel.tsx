import { useEffect, useState } from "react";
import { useDietologo } from "../store";

const GIORNI_SHORT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MESI = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

interface Props {
  open: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}

export default function CalendarPanel({ open, onClose, selectedDate, onSelectDate }: Props) {
  const today = new Date();
  const dietologo = useDietologo();
  const visita = dietologo.prossimaVisita ? new Date(dietologo.prossimaVisita) : null;
  const [view, setView] = useState({ year: selectedDate.getFullYear(), month: selectedDate.getMonth() });

  // Re-sync the visible month to the selected date each time the panel opens.
  useEffect(() => {
    if (open) setView({ year: selectedDate.getFullYear(), month: selectedDate.getMonth() });
  }, [open, selectedDate]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const cells = buildCalendar(view.year, view.month);

  function shiftMonth(delta: number) {
    setView((v) => {
      const m = v.month + delta;
      const year = v.year + Math.floor(m / 12);
      const month = ((m % 12) + 12) % 12;
      return { year, month };
    });
  }

  return (
    <div className="fixed inset-0 z-30" style={{ pointerEvents: open ? "auto" : "none" }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 transition-all duration-300"
        style={{
          background: open ? "rgba(28,25,21,0.40)" : "transparent",
          backdropFilter: open ? "blur(6px)" : "none",
          WebkitBackdropFilter: open ? "blur(6px)" : "none",
        }}
      />

      {/* Sliding card */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center"
        style={{
          transform: open ? "translateY(0)" : "translateY(-105%)",
          transition: "transform 0.44s cubic-bezier(0.32, 1.14, 0.40, 1.0)",
        }}
      >
        <div
          className="w-full max-w-[430px] mx-3 mt-3 rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: "rgba(252,250,248,0.97)", backdropFilter: "blur(24px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-0">
            <div className="w-10 h-1 rounded-full bg-[#D0CBC3]" />
          </div>

          {/* Month + nav + close */}
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <div>
              <h2 className="font-display text-3xl font-black text-[#1C1915] leading-none">
                {MESI[view.month]}
              </h2>
              <p className="text-sm text-[#9A9187] font-medium mt-0.5">{view.year}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => shiftMonth(-1)}
                className="w-9 h-9 rounded-full bg-[#F0EDE8] flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Mese precedente"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#9A9187">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </button>
              <button
                onClick={() => shiftMonth(1)}
                className="w-9 h-9 rounded-full bg-[#F0EDE8] flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Mese successivo"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#9A9187">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#F0EDE8] flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Chiudi"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#9A9187">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 px-4 pb-1">
            {GIORNI_SHORT.map((g) => (
              <div key={g} className="text-center text-[11px] font-bold text-[#9A9187] uppercase tracking-wider py-1">
                {g}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 px-4 pb-6 gap-y-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const isToday =
                day === today.getDate() &&
                view.month === today.getMonth() &&
                view.year === today.getFullYear();
              const isSelected =
                day === selectedDate.getDate() &&
                view.month === selectedDate.getMonth() &&
                view.year === selectedDate.getFullYear();
              const hasVisita =
                !!visita &&
                day === visita.getDate() &&
                view.month === visita.getMonth() &&
                view.year === visita.getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => { onSelectDate(new Date(view.year, view.month, day)); onClose(); }}
                  className={`
                    relative aspect-square flex items-center justify-center rounded-2xl text-sm font-semibold
                    transition-all active:scale-90
                    ${isSelected
                      ? "bg-[#27C882] text-white shadow-lg shadow-[#27C882]/30"
                      : isToday
                        ? "bg-[#EAE6E0] text-[#27C882] font-black ring-2 ring-[#27C882]/30"
                        : "text-[#1C1915] active:bg-[#F0EDE8]"
                    }
                  `}
                >
                  {day}
                  {hasVisita && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ background: isSelected ? "#fff" : "#6366F1" }}
                      title="Visita dietologo"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick "oggi" shortcut */}
          <div className="px-4 pb-5 -mt-1">
            <button
              onClick={() => { onSelectDate(new Date()); onClose(); }}
              className="w-full py-2.5 rounded-2xl text-xs font-bold text-[#27C882] bg-[#27C882]/10 active:scale-[0.98] transition-transform"
            >
              Vai a oggi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
