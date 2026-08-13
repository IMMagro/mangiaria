import React, { useRef, useEffect } from "react";
import { useTransient, setTransient } from "../store";

export type Tab = "home" | "stats" | "piano" | "profilo";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 min-w-[52px] active:scale-95 transition-transform"
    >
      <span className={`transition-all ${active ? "text-[#27C882]" : "text-[#9A9187]"}`}>{icon}</span>
      <span className={`text-[10px] font-semibold transition-colors ${active ? "text-[#27C882]" : "text-[#9A9187]"}`}>
        {label}
      </span>
      {active && <span className="w-1 h-1 rounded-full bg-[#27C882]" />}
    </button>
  );
}

interface Props {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
  onFabTap: () => void;
  onFabHold: () => void;
}

export default function BottomNav({ activeTab, onChange, onFabTap, onFabHold }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const { isDraggingFood, isHoveringTrash } = useTransient();

  useEffect(() => {
    function updateBounds() {
      if (fabRef.current) {
        setTransient({ fabBounds: fabRef.current.getBoundingClientRect() });
      }
    }
    updateBounds();
    window.addEventListener("resize", updateBounds);
    window.addEventListener("scroll", updateBounds);
    return () => {
      window.removeEventListener("resize", updateBounds);
      window.removeEventListener("scroll", updateBounds);
    };
  }, []);

  function clear() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  function down() {
    held.current = false;
    clear();
    timer.current = setTimeout(() => {
      held.current = true;
      onFabHold();
    }, 450);
  }

  function up() {
    clear();
    if (!held.current) onFabTap();
  }

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-20">
      <div className="bg-white/85 backdrop-blur-2xl border-t border-black/5 px-6 pb-6 pt-3">
        <div className="flex items-center justify-around">
          <NavItem
            active={activeTab === "home"}
            label="Home"
            onClick={() => onChange("home")}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            }
          />
          <NavItem
            active={activeTab === "stats"}
            label="Stats"
            onClick={() => onChange("stats")}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3v18h18v-2H5V3H3zm4 12h2V9H7v6zm4 2h2V7h-2v10zm4-4h2v-6h-2v6z" />
              </svg>
            }
          />
          {/* FAB — tap = azione predefinita, tieni premuto = menu */}
          <div className="-mt-7">
            <button
              ref={fabRef}
              onPointerDown={down}
              onPointerUp={up}
              onPointerLeave={clear}
              onPointerCancel={clear}
              onContextMenu={(e) => e.preventDefault()}
              aria-label={isDraggingFood ? "Elimina alimento" : "Aggiungi"}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all touch-none select-none ${
                isDraggingFood 
                  ? isHoveringTrash ? "scale-110 bg-[#EF4444]" : "scale-100 bg-[#EF4444]" 
                  : "active:scale-95"
              }`}
              style={{
                background: isDraggingFood ? undefined : "linear-gradient(135deg, #27C882 0%, #1AA86A 100%)",
                boxShadow: isDraggingFood 
                  ? (isHoveringTrash ? "0 12px 32px rgba(239, 68, 68, 0.6)" : "0 8px 24px rgba(239, 68, 68, 0.4)")
                  : "0 8px 24px rgba(39, 200, 130, 0.4)",
              }}
            >
              {isDraggingFood ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              )}
            </button>
          </div>
          <NavItem
            active={activeTab === "piano"}
            label="Spesa"
            onClick={() => onChange("piano")}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H4.99L3 1 1.59 2.41 3.59 4.41 3 5H1v2h3.23l.77 1.63L3.5 11A2 2 0 0 0 5 14h12a2 2 0 0 0 1.96-1.6l1.44-7.18A1 1 0 0 0 19 4h-.59l1-1L18 1.59 17 3h2zm-2.06 9H5l1.5-3.5h9l1.44 3.5zM7 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            }
          />
          <NavItem
            active={activeTab === "profilo"}
            label="Profilo"
            onClick={() => onChange("profilo")}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            }
          />
        </div>
      </div>
    </nav>
  );
}

