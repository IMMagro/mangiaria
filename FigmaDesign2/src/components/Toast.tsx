import { useSyncExternalStore } from "react";

// Minimal module-level toast store — call showToast() from anywhere.
type Listener = () => void;
let current: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function showToast(message: string) {
  current = message;
  emit();
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    current = null;
    emit();
  }, 2400);
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export default function ToastHost() {
  const message = useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  );

  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-50 pointer-events-none" style={{ bottom: 100 }}>
      <div
        className="transition-all duration-300"
        style={{
          transform: message ? "translateY(0)" : "translateY(20px)",
          opacity: message ? 1 : 0,
        }}
      >
        {message && (
          <div className="bg-[#1C1915] text-white text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2">
            <span className="text-[#27C882]">✓</span>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
