export interface Preset {
  key: string;
  label: string;
  url: string;
}

// Inline SVG tile (offline, on-brand) with an emoji centred on a gradient.
function tile(from: string, to: string, emoji: string): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/>` +
    `</linearGradient></defs>` +
    `<rect width='240' height='240' fill='url(#g)'/>` +
    `<text x='120' y='120' font-size='120' text-anchor='middle' dominant-baseline='central'>${emoji}</text>` +
    `</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

function banner(from: string, to: string, emoji: string): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/>` +
    `</linearGradient></defs>` +
    `<rect width='800' height='400' fill='url(#g)'/>` +
    `<text x='680' y='300' font-size='240' text-anchor='middle' dominant-baseline='central' opacity='0.25'>${emoji}</text>` +
    `</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

export const AVATAR_PRESETS: Preset[] = [
  { key: "preset:av-salad", label: "Insalata", url: tile("#27C882", "#1AA86A", "🥗") },
  { key: "preset:av-apple", label: "Mela", url: tile("#EF4444", "#B91C1C", "🍎") },
  { key: "preset:av-avocado", label: "Avocado", url: tile("#65A30D", "#3F6212", "🥑") },
  { key: "preset:av-chef", label: "Chef", url: tile("#6366F1", "#4338CA", "🧑‍🍳") },
  { key: "preset:av-fire", label: "Energia", url: tile("#F59E0B", "#B45309", "🔥") },
  { key: "preset:av-broccoli", label: "Broccolo", url: tile("#22C55E", "#15803D", "🥦") },
];

export const COVER_PRESETS: Preset[] = [
  { key: "preset:cv-green", label: "Verde", url: banner("#27C882", "#1AA86A", "🥗") },
  { key: "preset:cv-sunrise", label: "Alba", url: banner("#F59E0B", "#EF4444", "🍳") },
  { key: "preset:cv-indigo", label: "Indaco", url: banner("#6366F1", "#4338CA", "🫐") },
  { key: "preset:cv-fresh", label: "Fresco", url: banner("#22C55E", "#0D9488", "🥦") },
  {
    key: "preset:cv-photo",
    label: "Foto",
    url: "https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?w=800&h=400&fit=crop&auto=format",
  },
];

export const DEFAULT_AVATAR = "preset:av-salad";
export const DEFAULT_COVER = "preset:cv-green";

export function resolveImg(value: string | undefined, presets: Preset[], fallback: string): string {
  if (!value) return fallback;
  if (value.startsWith("preset:")) {
    return presets.find((p) => p.key === value)?.url ?? fallback;
  }
  return value; // data URL (uploaded) or external URL
}
