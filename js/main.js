// Screens, flow and glue: title -> appointments -> chart -> play ->
// treatment steps -> quiz -> results, plus Codex, settings and saving.

import { CASES } from "./data/cases.js";
import { WEAPONS } from "./data/instruments.js";
import { ENEMIES, BOSSES } from "./data/conditions.js";
import { toothName, toFDI } from "./data/teeth.js";
import { quizFor } from "./data/quiz.js";
import { Game, BOSS_TIME, MAX_LEVEL } from "./engine.js";
import { Renderer } from "./render.js";
import { Input } from "./input.js";
import { sfx, music, settings as audioSettings, buzz } from "./audio.js";
import * as saves from "./save.js";
import { CATALOG, STARTING_ENTRIES, totalEntries, findEntry } from "./codex.js";

const $ = (id) => document.getElementById(id);
const SCREENS = ["title", "cases", "chart", "procedure", "quiz", "results", "codex", "settings"];
const MODALS = ["levelup", "pause", "lost"];
const CASE_CHARTING = {
  classI: ["chart-surfaces", "chart-black"],
  classII: ["chart-surfaces", "chart-black", "chart-fdi"],
  endo: ["chart-fdi"],
  extraction: ["chart-fdi"],
};

let save = saves.load();
saves.unlockCodex(save, STARTING_ENTRIES);
let game = null;
let caseIndex = 0;
let screen = "title";
let codexReturn = "title";
let lastFrame = 0;
let acc = 0;
let run = null; // per-case results: { time, kills, clinical, quizRight, stepsCorrect }

const canvas = $("game");
const renderer = new Renderer(canvas);
const input = new Input(canvas);
let size = renderer.resize();
window.addEventListener("resize", () => { size = renderer.resize(); if (game) { game.w = size.width; game.h = size.height; } });

function persist() { saves.store(save); }
function applySettings() {
  audioSettings.music = save.settings.music;
  audioSettings.sound = save.settings.sound;
  if (save.settings.music) music.start(); else music.stop();
}
const mode = () => save.mode;
const text = (entry) => (mode() === "pro" ? entry.pro : entry.easy);
function haptic(ms) { if (save.settings.haptics) buzz(ms); }

// ------------------------------------------------------------------ screens
function show(id) {
  screen = id;
  for (const s of SCREENS) $(s).hidden = s !== id;
  for (const m of MODALS) $(m).hidden = true;
  $("hud").hidden = id !== "play";
  canvas.style.visibility = id === "play" ? "visible" : "hidden";
  if (id !== "play") music.set("menu");
  const first = id !== "play" && $(id).querySelector("button:not([disabled])");
  if (first) first.focus({ preventScroll: true });
}
function modal(id, open = true) { $(id).hidden = !open; if (open) { const b = $(id).querySelector("button"); if (b) b.focus(); } }

let toastTimer = 0;
function toast(message, warn = false) {
  const t = $("toast");
  t.textContent = message;
  t.className = `toast${warn ? " warn" : ""}`;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

// ------------------------------------------------------------------ title
function renderTitle() {
  document.querySelectorAll('input[name="mode"]').forEach((r) => { r.checked = r.value === save.mode; });
  const stars = Object.values(save.cases).reduce((n, c) => n + c.stars, 0);
  const codex = Object.keys(save.codex).filter((id) => findEntry(id)).length;
  $("title-progress").textContent = `Cases ${Math.min(save.unlocked, CASES.length)}/${CASES.length} unlocked · ⭐ ${stars}/${CASES.length * 3} · 📖 ${codex}/${totalEntries()}`;
  $("play-btn").textContent = Object.keys(save.cases).length ? "Continue" : "Play";
}
document.querySelectorAll('input[name="mode"]').forEach((r) => r.addEventListener("change", () => {
  save.mode = r.value; persist(); sfx.play("click");
  toast(save.mode === "pro" ? "🦷 Dental Pro: clinical terms, procedure ordering, harder quizzes." : "😁 Easy: plain-English facts and helpful hints.");
}));
$("play-btn").addEventListener("click", () => { sfx.play("click"); renderCases(); show("cases"); });
$("codex-btn").addEventListener("click", () => { codexReturn = "title"; openCodex(); });
$("settings-btn").addEventListener("click", () => { renderSettings(); show("settings"); });
document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => {
  sfx.play("click");
  const target = b.dataset.go;
  if (target === "cases") { endGame(); renderCases(); }
  if (target === "title") renderTitle();
  show(target);
}));

// ------------------------------------------------------------------ cases
function renderCases() {
  const list = $("case-list");
  list.innerHTML = "";
  CASES.forEach((c, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "case-item";
    const locked = i >= save.unlocked;
    btn.disabled = locked;
    const stars = save.cases[c.id]?.stars || 0;
    btn.innerHTML = '<span class="n"></span><span><b></b><small></small></span><span class="st"></span>';
    btn.querySelector(".n").textContent = locked ? "🔒" : String(i + 1).padStart(2, "0");
    btn.querySelector("b").textContent = c.title;
    btn.querySelector("small").textContent = locked ? "Finish the previous appointment to unlock" : c.patient;
    btn.querySelector(".st").textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
    btn.setAttribute("aria-label", `${c.title}${locked ? ", locked" : `, ${stars} of 3 stars`}`);
    btn.addEventListener("click", () => { sfx.play("click"); openChart(i); });
    li.appendChild(btn);
    list.appendChild(li);
  });
}

// ------------------------------------------------------------------ chart
function toothChart(highlight) {
  const wrap = $("tooth-chart");
  wrap.innerHTML = "";
  const label = (a, b) => {
    const d = document.createElement("div");
    d.className = "arch-label";
    d.innerHTML = `<span>${a}</span><span>${b}</span>`;
    return d;
  };
  const row = (nums) => {
    const r = document.createElement("div");
    r.className = "tooth-row";
    for (const n of nums) {
      const t = document.createElement("span");
      t.className = `tooth${highlight.includes(n) ? " hl" : ""}`;
      t.textContent = n;
      t.title = `#${n} ${toothName(n)} (FDI ${toFDI(n)})`;
      r.appendChild(t);
    }
    return r;
  };
  wrap.appendChild(label("Patient's right", "Maxillary (upper)"));
  wrap.appendChild(row(Array.from({ length: 16 }, (_, i) => i + 1)));
  wrap.appendChild(row(Array.from({ length: 16 }, (_, i) => 32 - i)));
  wrap.appendChild(label("Patient's right", "Mandibular (lower)"));
}

function openChart(i) {
  caseIndex = i;
  const c = CASES[i];
  $("chart-num").textContent = `Appointment ${i + 1} of ${CASES.length} · ${mode() === "pro" ? "Dental Pro" : "Easy"} mode`;
  $("chart-title").textContent = c.title;
  $("chart-patient").textContent = c.patient;
  toothChart(c.teeth);
  const teeth = c.teeth.map((n) => `#${n}`).join(", ");
  const first = c.teeth[0];
  $("chart-tooth").textContent = c.teeth.length === 1
    ? `Tooth #${first} · FDI ${toFDI(first)} · ${toothName(first)}`
    : `Teeth ${teeth} · ${toothName(first)} to ${toothName(c.teeth[c.teeth.length - 1])}`;
  $("chart-dx").textContent = text(c);
  if (mode() === "pro") {
    $("chart-tools-h").textContent = "Instrument selection";
    $("chart-tools").textContent = "No hints in Dental Pro: choose instruments indicated for this case when you level up to earn clinical-choice bonuses.";
  } else {
    $("chart-tools-h").textContent = "Helpful instruments";
    $("chart-tools").textContent = c.indicated.map((id) => `${WEAPONS[id].icon} ${WEAPONS[id].name}`).join(" · ");
  }
  show("chart");
}
$("begin-btn").addEventListener("click", () => { sfx.play("click"); startGame(); });

// ------------------------------------------------------------------ play
function startGame() {
  const c = CASES[caseIndex];
  size = renderer.resize();
  game = new Game({ caseData: c, mode: mode(), width: size.width, height: size.height, seed: Date.now() % 100000 });
  run = { time: 0, kills: 0, clinical: 0, quizRight: 0, stepsCorrect: false };
  save.stats.runs += 1;
  persist();
  input.reset();
  $("hud-case").textContent = `${c.title} · ${c.teeth.map((n) => `#${n}`).join(" ")}`;
  $("boss-bar").hidden = true;
  show("play");
  music.set("play");
  if (save.settings.music) music.start();
  renderHudWeapons();
  if (window.PA) window.PA.game = game;
}

function endGame() {
  game = null;
}

function renderHudWeapons() {
  if (!game) return;
  const box = $("hud-weapons");
  box.innerHTML = "";
  for (const [id, L] of Object.entries(game.weapons)) {
    const s = document.createElement("span");
    s.title = `${WEAPONS[id].name} level ${L}`;
    s.textContent = WEAPONS[id].icon;
    const b = document.createElement("b");
    b.textContent = L;
    s.appendChild(b);
    box.appendChild(s);
  }
}

function renderHud() {
  const p = game.player;
  $("hud-hp").style.width = `${(p.hp / p.maxHp) * 100}%`;
  $("hud-hp-text").textContent = `${Math.ceil(p.hp)} / ${p.maxHp}${p.shield ? " 🛡" : ""}`;
  $("hud-xp").style.width = `${Math.min(100, (game.xp / game.xpNext) * 100)}%`;
  $("hud-level").textContent = `LV ${game.level}`;
  const left = Math.max(0, BOSS_TIME - game.time);
  $("hud-time").textContent = game.boss ? "BOSS" : `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, "0")}`;
  if (game.boss) {
    $("boss-bar").hidden = false;
    $("boss-hp").style.width = `${Math.max(0, game.boss.hp / game.boss.maxHp) * 100}%`;
  }
}

function handleEvents() {
  for (const ev of game.drainEvents()) {
    if (ev.type === "levelup") openLevelUp(ev.offer);
    else if (ev.type === "hurt") { sfx.play("hurt"); haptic(25); }
    else if (ev.type === "discover") {
      if (saves.unlockCodex(save, [ev.id])) toast(`📖 New Codex entry: ${ENEMIES[ev.id].name}`);
    } else if (ev.type === "boss") {
      sfx.play("boss"); haptic(120); music.set("boss");
      $("boss-name").textContent = ev.name;
      toast(`⚠️ ${ev.name} has appeared!`, true);
    } else if (ev.type === "win") onWin();
    else if (ev.type === "lose") onLose();
  }
}

function openLevelUp(offer) {
  sfx.play("level"); haptic(40);
  const box = $("choices");
  box.innerHTML = "";
  $("levelup-sub").textContent = mode() === "pro"
    ? "Choose an instrument. Indicated choices for this case earn a clinical bonus."
    : "Choose an instrument. ✓ marks ones that fit this case.";
  offer.forEach((id) => {
    const w = WEAPONS[id];
    const level = (game.weapons[id] || 0) + 1;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice";
    btn.dataset.weapon = id;
    btn.innerHTML = '<span class="ic" aria-hidden="true"></span><span><b></b><small></small></span>';
    btn.querySelector(".ic").textContent = w.icon;
    btn.querySelector("b").textContent = w.name;
    const lv = document.createElement("span");
    lv.className = "lv";
    lv.textContent = level === 1 ? "NEW" : `LV ${level}${level === MAX_LEVEL ? " MAX" : ""}`;
    btn.querySelector("b").appendChild(lv);
    btn.querySelector("small").textContent = text(w);
    if (mode() === "easy" && game.case.indicated.includes(id)) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "✓ Fits this case";
      btn.querySelector("span:last-child").appendChild(badge);
    }
    btn.addEventListener("click", () => chooseWeapon(id));
    box.appendChild(btn);
  });
  modal("levelup");
}

function chooseWeapon(id) {
  const { indicated } = game.choose(id);
  sfx.play("pick");
  if (saves.unlockCodex(save, [id])) persist();
  modal("levelup", false);
  renderHudWeapons();
  if (mode() === "pro") {
    toast(indicated ? `✓ Clinically indicated for this case: ${WEAPONS[id].name}` : `${WEAPONS[id].name} isn't typically used for this case.`, !indicated);
  }
  input.reset();
  lastFrame = performance.now();
}

$("pause-btn").addEventListener("click", () => pauseGame(true));
$("resume-btn").addEventListener("click", () => pauseGame(false));
$("quit-btn").addEventListener("click", () => { endGame(); renderCases(); show("cases"); });
function pauseGame(on) {
  if (!game) return;
  game.paused = on;
  modal("pause", on);
  input.reset();
  lastFrame = performance.now();
}
document.addEventListener("visibilitychange", () => { if (document.hidden && game && game.status === "playing" && !game.offer) pauseGame(true); });
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && screen === "play" && game && !game.offer) pauseGame(!game.paused);
  if (screen === "play" && game && game.offer && /^[1-3]$/.test(e.key)) {
    const pick = game.offer[Number(e.key) - 1];
    if (pick) chooseWeapon(pick);
  }
});

function onLose() {
  sfx.play("lose"); haptic(200);
  const c = CASES[caseIndex];
  $("lost-text").textContent = mode() === "pro"
    ? `Tip: in this case, ${c.indicated.slice(0, 3).map((id) => WEAPONS[id].name).join(", ")} are clinically indicated — and they hit harder against what you're facing.`
    : "Tip: pick the instruments marked ✓ when you level up, and keep moving!";
  modal("lost");
}
$("retry-btn").addEventListener("click", () => { sfx.play("click"); startGame(); });

function onWin() {
  sfx.play("win"); haptic(150);
  run.time = Math.round(game.time);
  run.kills = game.stats.kills;
  run.clinical = game.stats.clinical;
  save.stats.wins += 1;
  save.stats.kills += game.stats.kills;
  save.stats.clinical += game.stats.clinical;
  persist();
  setTimeout(() => { endGame(); openProcedure(); }, 900);
}

// ------------------------------------------------------------------ loop
function frame(now) {
  requestAnimationFrame(frame);
  if (screen !== "play" || !game) { lastFrame = now; return; }
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  const v = input.vector();
  game.setMove(v.x, v.y);
  acc += dt;
  const step = 1 / 60;
  while (acc >= step) { game.update(step); acc -= step; }
  if (!game) return;
  renderer.draw(game, input);
  renderHud();
  handleEvents();
}
requestAnimationFrame(frame);

// ------------------------------------------------------------------ procedure
let order = [];
function openProcedure() {
  const c = CASES[caseIndex];
  const steps = c.steps.map((s, i) => ({ i, label: text(s) }));
  order = [];
  $("steps").innerHTML = "";
  $("proc-feedback").textContent = "";
  $("proc-feedback").className = "feedback";
  $("step-pool").innerHTML = "";
  if (mode() === "pro") {
    $("proc-h").textContent = "Put the treatment in order";
    $("proc-sub").textContent = `${BOSSES[c.boss].name} is defeated. Now sequence the real procedure: tap the steps in the order you'd perform them.`;
    const shuffled = [...steps].sort(() => Math.random() - 0.5);
    for (const s of shuffled) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = s.label;
      b.dataset.step = s.i;
      b.addEventListener("click", () => {
        order.push(s);
        b.hidden = true;
        sfx.play("click");
        renderOrder();
      });
      $("step-pool").appendChild(b);
    }
    $("proc-next").textContent = "Check order";
    $("proc-next").disabled = true;
    $("proc-undo").hidden = false;
  } else {
    $("proc-h").textContent = "How the real appointment goes";
    $("proc-sub").textContent = `You beat ${BOSSES[c.boss].name}! Here are the steps a dental team would follow for this patient.`;
    for (const s of steps) {
      const li = document.createElement("li");
      li.textContent = s.label;
      $("steps").appendChild(li);
    }
    $("proc-next").textContent = "Continue to quiz";
    $("proc-next").disabled = false;
    $("proc-undo").hidden = true;
    run.stepsCorrect = true;
  }
  unlockCaseCodex(c);
  show("procedure");
}

function renderOrder() {
  $("steps").innerHTML = "";
  for (const s of order) {
    const li = document.createElement("li");
    li.textContent = s.label;
    $("steps").appendChild(li);
  }
  $("proc-next").disabled = order.length !== CASES[caseIndex].steps.length;
}
$("proc-undo").addEventListener("click", () => {
  const s = order.pop();
  if (!s) return;
  const b = $("step-pool").querySelector(`[data-step="${s.i}"]`);
  if (b) b.hidden = false;
  renderOrder();
});
$("proc-next").addEventListener("click", () => {
  const c = CASES[caseIndex];
  if (mode() === "pro" && $("proc-next").textContent === "Check order") {
    let right = 0;
    $("steps").innerHTML = "";
    order.forEach((s, pos) => {
      const li = document.createElement("li");
      li.textContent = s.label;
      const ok = s.i === pos;
      if (ok) right++;
      li.className = ok ? "ok" : "bad";
      if (!ok) {
        const fix = document.createElement("small");
        fix.textContent = `Step ${pos + 1} should be: ${text(c.steps[pos])}`;
        li.appendChild(fix);
      }
      $("steps").appendChild(li);
    });
    run.stepsCorrect = right === c.steps.length;
    $("proc-feedback").textContent = run.stepsCorrect ? "Perfect sequence! ⭐" : `${right} of ${c.steps.length} in the right place. Review the corrections above.`;
    $("proc-feedback").className = `feedback ${run.stepsCorrect ? "good" : "bad"}`;
    sfx.play(run.stepsCorrect ? "right" : "wrong");
    $("proc-undo").hidden = true;
    $("proc-next").textContent = "Continue to quiz";
    return;
  }
  startQuiz();
});

function unlockCaseCodex(c) {
  const ids = [...c.tools, ...c.codex, ...(CASE_CHARTING[c.id] || [])];
  const added = saves.unlockCodex(save, ids);
  if (added) toast(`📖 ${added} new Codex ${added === 1 ? "entry" : "entries"} unlocked`);
  persist();
}

// ------------------------------------------------------------------ quiz
let questions = [];
let qIndex = 0;
function startQuiz() {
  questions = quizFor(CASES[caseIndex].id, mode(), 3);
  qIndex = 0;
  run.quizRight = 0;
  show("quiz");
  renderQuestion();
}
function renderQuestion() {
  const q = questions[qIndex];
  $("quiz-count").textContent = `Question ${qIndex + 1} of ${questions.length} · ${mode() === "pro" ? "Dental Pro" : "Easy"}`;
  $("quiz-h").textContent = q.q;
  $("quiz-feedback").textContent = "";
  $("quiz-feedback").className = "feedback";
  $("quiz-next").hidden = true;
  const box = $("answers");
  box.innerHTML = "";
  q.options.forEach((opt, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = opt;
    b.addEventListener("click", () => answer(i));
    box.appendChild(b);
  });
  box.querySelector("button").focus();
}
function answer(i) {
  const q = questions[qIndex];
  const buttons = [...$("answers").children];
  buttons.forEach((b, j) => {
    b.disabled = true;
    if (j === q.answer) b.classList.add("right");
    else if (j === i) b.classList.add("wrong");
  });
  const right = i === q.answer;
  if (right) run.quizRight++;
  save.stats.quizTotal += 1;
  if (right) save.stats.quizRight += 1;
  persist();
  sfx.play(right ? "right" : "wrong");
  $("quiz-feedback").textContent = `${right ? "Correct! " : "Not quite. "}${q.why}`;
  $("quiz-feedback").className = `feedback ${right ? "good" : "bad"}`;
  $("quiz-next").hidden = false;
  $("quiz-next").textContent = qIndex + 1 < questions.length ? "Next question" : "See results";
  $("quiz-next").focus();
}
$("quiz-next").addEventListener("click", () => {
  qIndex++;
  if (qIndex < questions.length) renderQuestion();
  else finishCase();
});

// ------------------------------------------------------------------ results
function finishCase() {
  const c = CASES[caseIndex];
  let stars = 1;
  if (run.quizRight >= 2) stars++;
  if (run.clinical >= 2 && run.stepsCorrect) stars++;
  saves.recordCase(save, caseIndex, { stars, time: run.time, quizRight: run.quizRight, stepsCorrect: run.stepsCorrect });
  persist();
  $("results-h").textContent = `${c.title}: treated!`;
  $("results-stars").textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
  $("results-stars").setAttribute("aria-label", `${stars} of 3 stars`);
  const rows = [
    ["Time", `${Math.floor(run.time / 60)}:${String(run.time % 60).padStart(2, "0")}`],
    ["Germs cleared", run.kills],
    ["Clinical instrument choices", run.clinical],
    ["Quiz", `${run.quizRight} / ${questions.length}`],
  ];
  if (mode() === "pro") rows.push(["Procedure order", run.stepsCorrect ? "Correct" : "Needs review"]);
  rows.push(["Stars", "1 treated · 2 quiz ≥ 2 · 3 two clinical picks" + (mode() === "pro" ? " + correct order" : "")]);
  $("results-list").innerHTML = "";
  for (const [k, v] of rows) {
    const li = document.createElement("li");
    li.innerHTML = "<span></span><b></b>";
    li.querySelector("span").textContent = k;
    li.querySelector("b").textContent = v;
    $("results-list").appendChild(li);
  }
  const hasNext = caseIndex + 1 < CASES.length;
  $("next-case-btn").textContent = hasNext ? "Next appointment" : "All cases done! 🎓";
  $("next-case-btn").disabled = !hasNext;
  show("results");
}
$("next-case-btn").addEventListener("click", () => { if (caseIndex + 1 < CASES.length) openChart(caseIndex + 1); });

// ------------------------------------------------------------------ codex
let codexTab = "instruments";
function openCodex() {
  sfx.play("click");
  show("codex");
  renderCodex();
}
$("codex-back").addEventListener("click", () => { renderTitle(); show(codexReturn); });
document.querySelectorAll("[data-tab]").forEach((t) => t.addEventListener("click", () => {
  codexTab = t.dataset.tab;
  renderCodex();
}));
function renderCodex() {
  document.querySelectorAll("[data-tab]").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === codexTab)));
  const total = totalEntries();
  const have = Object.keys(save.codex).filter((id) => findEntry(id)).length;
  $("codex-count").textContent = `${have}/${total}`;
  const list = $("codex-list");
  list.innerHTML = "";
  $("codex-detail").hidden = true;
  for (const [id, entry] of Object.entries(CATALOG[codexTab])) {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    const known = !!save.codex[id];
    b.disabled = !known;
    b.dataset.entry = id;
    b.innerHTML = '<span class="ic" aria-hidden="true"></span><span class="nm"></span>';
    b.querySelector(".ic").textContent = known ? entry.icon || "🦷" : "❔";
    b.querySelector(".nm").textContent = known ? entry.name : "???";
    b.addEventListener("click", () => showEntry(id, entry));
    li.appendChild(b);
    list.appendChild(li);
  }
}
function showEntry(id, entry) {
  const d = $("codex-detail");
  d.hidden = false;
  d.innerHTML = "<h3></h3><h4>In plain English</h4><p class=\"e\"></p><h4>Dental Pro</h4><p class=\"p\"></p>";
  d.querySelector("h3").textContent = `${entry.icon || "🦷"} ${entry.name}`;
  d.querySelector(".e").textContent = entry.easy;
  d.querySelector(".p").textContent = entry.pro;
  d.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ------------------------------------------------------------------ settings
function renderSettings() {
  $("set-music").checked = save.settings.music;
  $("set-sound").checked = save.settings.sound;
  $("set-haptics").checked = save.settings.haptics;
  $("save-code").value = saves.exportCode(save);
  $("save-feedback").textContent = "";
  $("reset-save").textContent = "Reset all progress";
}
for (const key of ["music", "sound", "haptics"]) {
  $(`set-${key}`).addEventListener("change", (e) => {
    save.settings[key] = e.target.checked;
    persist();
    applySettings();
    $("save-code").value = saves.exportCode(save);
  });
}
$("copy-save").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("save-code").value); } catch { $("save-code").select(); document.execCommand("copy"); }
  $("save-feedback").textContent = "Copied! Paste it on your other device under Settings → Load code.";
  $("save-feedback").className = "feedback good";
});
$("load-save").addEventListener("click", () => {
  try {
    save = saves.importCode($("load-code").value);
    saves.unlockCodex(save, STARTING_ENTRIES);
    persist();
    applySettings();
    renderSettings();
    $("save-feedback").textContent = "Progress loaded!";
    $("save-feedback").className = "feedback good";
  } catch (err) {
    $("save-feedback").textContent = err.message;
    $("save-feedback").className = "feedback bad";
  }
});
$("reset-save").addEventListener("click", () => {
  const btn = $("reset-save");
  if (btn.textContent !== "Tap again to confirm") { btn.textContent = "Tap again to confirm"; return; }
  save = saves.freshSave();
  saves.unlockCodex(save, STARTING_ENTRIES);
  persist();
  renderSettings();
  $("save-feedback").textContent = "Progress reset.";
  $("save-feedback").className = "feedback";
});

// ------------------------------------------------------------------ boot
document.addEventListener("pointerdown", () => applySettings(), { once: true });
document.addEventListener("keydown", () => applySettings(), { once: true });
renderTitle();
show("title");
persist();
if ("serviceWorker" in navigator && !navigator.webdriver) navigator.serviceWorker.register("sw.js").catch(() => {});

// Test hooks (only with ?debug in the URL).
if (new URLSearchParams(location.search).has("debug")) {
  window.PA = {
    game,
    get save() { return save; },
    winNow() { if (game) { game.boss || game.spawnBoss(); game.damage(game.boss, 1e9, "toothbrush"); } },
    levelUpNow() { if (game) game.gainXp(game.xpNext); },
    loseNow() { if (game) { game.player.hurt = 0; game.player.shield = 0; game.hurtPlayer(1e9); } },
  };
}
