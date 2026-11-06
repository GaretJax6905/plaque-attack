// Tooth numbering, names, surfaces, and G.V. Black's caries classification.
// Universal Numbering System (used in the United States): permanent teeth
// 1-32, starting at the maxillary right third molar, moving across the upper
// arch to #16, then down to the mandibular left third molar (#17) and back
// across the lower arch to #32 (mandibular right third molar).

const TYPES = [
  "third molar",
  "second molar",
  "first molar",
  "second premolar",
  "first premolar",
  "canine",
  "lateral incisor",
  "central incisor",
];

/** Full name of a permanent tooth by Universal number, e.g. 19 -> "Mandibular left first molar". */
export function toothName(n) {
  check(n);
  const arch = n <= 16 ? "Maxillary" : "Mandibular";
  const side = (n >= 9 && n <= 24) ? "left" : "right";
  // Position from the back of its quadrant: 0 = third molar ... 7 = central incisor.
  let pos;
  if (n <= 8) pos = n - 1;
  else if (n <= 16) pos = 16 - n;
  else if (n <= 24) pos = n - 17;
  else pos = 32 - n;
  return `${arch} ${side} ${TYPES[pos]}`;
}

/** FDI (ISO 3950) two-digit notation for a Universal number, e.g. 3 -> 16, 19 -> 36. */
export function toFDI(n) {
  check(n);
  if (n <= 8) return 10 + (9 - n); // quadrant 1: upper right, 18..11
  if (n <= 16) return 20 + (n - 8); // quadrant 2: upper left, 21..28
  if (n <= 24) return 30 + (25 - n); // quadrant 3: lower left, 38..31
  return 40 + (n - 24); // quadrant 4: lower right, 41..48
}

/** Universal number for an FDI number (inverse of toFDI). */
export function fromFDI(fdi) {
  for (let n = 1; n <= 32; n++) if (toFDI(n) === fdi) return n;
  throw new RangeError(`Not a permanent FDI tooth number: ${fdi}`);
}

export function isAnterior(n) {
  check(n);
  return (n >= 6 && n <= 11) || (n >= 22 && n <= 27);
}

function check(n) {
  if (!Number.isInteger(n) || n < 1 || n > 32) {
    throw new RangeError(`Universal tooth numbers run from 1 to 32, got ${n}`);
  }
}

export const SURFACES = {
  M: { name: "Mesial", easy: "The side facing the front middle of your mouth.", pro: "Proximal surface toward the midline of the dental arch." },
  D: { name: "Distal", easy: "The side facing toward the back of your mouth.", pro: "Proximal surface away from the midline." },
  O: { name: "Occlusal", easy: "The chewing surface of a back tooth.", pro: "Chewing surface of posterior teeth (premolars and molars)." },
  I: { name: "Incisal", easy: "The biting edge of a front tooth.", pro: "Biting edge of anterior teeth (incisors and canines)." },
  B: { name: "Buccal", easy: "The side of a back tooth touching your cheek.", pro: "Surface of posterior teeth facing the cheek." },
  F: { name: "Facial (labial)", easy: "The side of a front tooth touching your lips.", pro: "Surface of anterior teeth facing the lips; 'facial' covers both labial and buccal." },
  L: { name: "Lingual", easy: "The side facing your tongue.", pro: "Surface facing the tongue; on maxillary teeth it is also called palatal." },
};

export const BLACK_CLASSES = {
  I: "Pits and fissures: occlusal surfaces of premolars and molars, buccal/lingual pits of molars, and lingual pits of maxillary incisors.",
  II: "Proximal surfaces of premolars and molars (e.g. MO, DO, MOD).",
  III: "Proximal surfaces of incisors and canines, not involving the incisal angle.",
  IV: "Proximal surfaces of incisors and canines, involving the incisal angle.",
  V: "Cervical (gingival) third of facial or lingual surfaces of any tooth.",
  VI: "Incisal edges of anterior teeth and cusp tips of posterior teeth (added to Black's original five).",
};
