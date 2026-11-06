// Progress is saved in this browser (localStorage) and can be moved to
// another device with a save code (base64 JSON). Every read/write is guarded:
// private windows and blocked storage simply fall back to an in-memory save.

import { CASES } from "./data/cases.js";

export const SAVE_KEY = "plaqueAttack:save";
export const VERSION = 1;

export function freshSave() {
  return {
    version: VERSION,
    mode: "easy", // "easy" or "pro"
    unlocked: 1, // number of cases available
    cases: {}, // id -> { stars, bestTime, quizBest, steps }
    codex: {}, // entry id -> true
    stats: { runs: 0, wins: 0, kills: 0, quizRight: 0, quizTotal: 0, clinical: 0 },
    settings: { music: true, sound: true, haptics: true },
  };
}

/** Fill in anything missing and clamp values, so old or hand-edited saves load safely. */
export function normalize(data) {
  const base = freshSave();
  if (!data || typeof data !== "object") return base;
  const out = { ...base, ...data };
  out.version = VERSION;
  out.mode = data.mode === "pro" ? "pro" : "easy";
  const unlocked = Number(data.unlocked);
  out.unlocked = Number.isInteger(unlocked) ? Math.min(Math.max(unlocked, 1), CASES.length) : 1;
  out.cases = data.cases && typeof data.cases === "object" ? data.cases : {};
  out.codex = data.codex && typeof data.codex === "object" ? data.codex : {};
  out.stats = { ...base.stats, ...(data.stats || {}) };
  out.settings = { ...base.settings, ...(data.settings || {}) };
  return out;
}

export function load(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(SAVE_KEY);
    return raw ? normalize(JSON.parse(raw)) : freshSave();
  } catch {
    return freshSave();
  }
}

export function store(save, storage = globalThis.localStorage) {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}

/** Record a finished case. Keeps the best result and unlocks the next case. */
export function recordCase(save, caseIndex, result) {
  const id = CASES[caseIndex].id;
  const prev = save.cases[id] || { stars: 0, bestTime: null, quizBest: 0, steps: false };
  save.cases[id] = {
    stars: Math.max(prev.stars, result.stars),
    bestTime: prev.bestTime === null ? result.time : Math.min(prev.bestTime, result.time),
    quizBest: Math.max(prev.quizBest, result.quizRight),
    steps: prev.steps || result.stepsCorrect,
  };
  save.unlocked = Math.min(CASES.length, Math.max(save.unlocked, caseIndex + 2));
  return save;
}

export function unlockCodex(save, ids) {
  let added = 0;
  for (const id of ids) {
    if (!save.codex[id]) { save.codex[id] = true; added++; }
  }
  return added;
}

export function exportCode(save) {
  const json = JSON.stringify(save);
  return btoa(unescape(encodeURIComponent(json)));
}

export function importCode(code) {
  try {
    const json = decodeURIComponent(escape(atob(String(code).trim())));
    const data = JSON.parse(json);
    if (!data || data.version === undefined) throw new Error("not a save");
    return normalize(data);
  } catch {
    throw new Error("That save code isn't valid. Copy the whole code and try again.");
  }
}
