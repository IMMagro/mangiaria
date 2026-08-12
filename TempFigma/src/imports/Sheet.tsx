import { useEffect, type ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** Reusable bottom sheet with backdrop, slide-up animation and Escape-to-close. */
export default function Sheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className="fixed inset-0 z-40" style={{ pointerEvents: open ? "auto" : "none" }}>
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
      {/* Sheet card */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <div
          className="w-full max-w-[430px] rounded-t-3xl shadow-2xl"
          style={{
            background: "rgba(252,250,248,0.98)",
            backdropFilter: "blur(24px)",
            transform: open ? "translateY(0)" : "translateY(105%)",
            transition: "transform 0.4s cubic-bezier(0.32, 1.14, 0.40, 1.0)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center pt-3">
            <div className="w-10 h-1 rounded-full bg-[#D0CBC3]" />
          </div>
          <div className="flex items-center justify-between px-5 pt-3 pb-1">
            <h2 className="font-display text-xl font-black text-[#1C1915]">{title}</h2>
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
          <div className="px-5 pb-8 pt-2 max-h-[70vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
