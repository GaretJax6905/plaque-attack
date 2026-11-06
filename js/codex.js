// Every Codex entry in one catalog, grouped into tabs.
import { WEAPONS, TOOLS } from "./data/instruments.js";
import { ENEMIES, ANATOMY } from "./data/conditions.js";
import { SURFACES, BLACK_CLASSES } from "./data/teeth.js";

const surfaceList = Object.entries(SURFACES);

export const CHARTING = {
  "chart-universal": {
    name: "Universal Numbering", icon: "🔢",
    easy: "Adult teeth are numbered 1 to 32. #1 is the upper right wisdom tooth; the numbers go across the top to #16, then drop to the lower left (#17) and come back across to #32.",
    pro: "Universal (ADA) system: permanent teeth 1–32 starting at the maxillary right third molar; primary teeth A–T. E.g. #3 maxillary right first molar, #19 mandibular left first molar, #30 mandibular right first molar.",
  },
  "chart-fdi": {
    name: "FDI Notation", icon: "🌍",
    easy: "Most of the world uses two digits: the first is the quarter of the mouth, the second is the tooth counted from the middle.",
    pro: "FDI/ISO 3950: quadrant (1 UR, 2 UL, 3 LL, 4 LR) then tooth 1–8 from the midline. Universal #3 = 16, #19 = 36, #30 = 46, #32 = 48.",
  },
  "chart-surfaces": {
    name: "Tooth Surfaces", icon: "🧭",
    easy: surfaceList.map(([k, s]) => `${k} = ${s.name}: ${s.easy}`).join(" "),
    pro: surfaceList.map(([k, s]) => `${k} — ${s.name}: ${s.pro}`).join(" "),
  },
  "chart-black": {
    name: "G.V. Black's Classes", icon: "🏷️",
    easy: "Dentists sort cavities by where they are. Class I is in the grooves, Class II is between back teeth, and so on.",
    pro: Object.entries(BLACK_CLASSES).map(([k, v]) => `Class ${k}: ${v}`).join(" "),
  },
};

export const CATALOG = {
  instruments: { ...WEAPONS, ...TOOLS },
  conditions: Object.fromEntries(
    Object.entries(ENEMIES).map(([k, v]) => [k, { ...v, icon: "🦠" }]),
  ),
  anatomy: {
    ...CHARTING,
    ...Object.fromEntries(Object.entries(ANATOMY).map(([k, v]) => [k, { ...v, icon: "🦷" }])),
  },
};

export const STARTING_ENTRIES = ["toothbrush", "chart-universal"];

export function totalEntries() {
  return Object.values(CATALOG).reduce((n, group) => n + Object.keys(group).length, 0);
}

export function findEntry(id) {
  for (const group of Object.values(CATALOG)) if (group[id]) return group[id];
  return null;
}
