// Chiptune music and sound effects, generated live with WebAudio (no files).

let ctx = null;
function ac() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
  }
  if (ctx && ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq, start, dur, type, vol, dest) {
  const a = ac(); if (!a) return;
  const t = Math.max(a.currentTime, start);
  const o = a.createOscillator(); const g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest || a.destination);
  o.start(t); o.stop(t + dur + 0.02);
}

function noise(start, dur, vol, dest) {
  const a = ac(); if (!a) return;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = a.createBufferSource(); const g = a.createGain(); const f = a.createBiquadFilter();
  f.type = "highpass"; f.frequency.value = 6000;
  s.buffer = buf; g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  s.connect(f).connect(g).connect(dest); s.start(start);
}

const NOTE = (n) => 440 * 2 ** ((n - 69) / 12);

export const settings = { music: true, sound: true };

export const sfx = {
  play(name) {
    if (!settings.sound) return;
    const a = ac(); if (!a) return;
    const t = a.currentTime;
    const S = {
      pick: () => tone(1046, t, 0.05, "square", 0.03),
      level: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, t + i * 0.06, 0.12, "triangle", 0.08)),
      hurt: () => tone(140, t, 0.12, "sawtooth", 0.06),
      boss: () => [220, 207, 196, 185].forEach((f, i) => tone(f, t + i * 0.18, 0.3, "sawtooth", 0.06)),
      win: () => [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, t + i * 0.1, 0.2, "triangle", 0.1)),
      lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, t + i * 0.16, 0.28, "sawtooth", 0.05)),
      right: () => [659, 988].forEach((f, i) => tone(f, t + i * 0.07, 0.14, "triangle", 0.08)),
      wrong: () => tone(160, t, 0.25, "square", 0.05),
      click: () => tone(880, t, 0.03, "square", 0.025),
    };
    (S[name] || S.click)();
  },
};

const TRACKS = {
  menu: { bpm: 96, roots: [48, 45, 41, 43], arp: [0, 4, 7, 12], lead: "triangle", drums: false },
  play: { bpm: 132, roots: [45, 45, 41, 43], arp: [0, 7, 12, 15, 12, 7], lead: "square", drums: true },
  boss: { bpm: 152, roots: [45, 46, 45, 43], arp: [0, 3, 6, 12], lead: "sawtooth", drums: true },
};

export const music = {
  track: "menu", step: 0, next: 0, timer: null, bus: null,
  start() {
    if (this.timer || !settings.music) return;
    const a = ac(); if (!a) return;
    this.bus = a.createGain(); this.bus.gain.value = 0.5; this.bus.connect(a.destination);
    this.next = a.currentTime + 0.05;
    this.timer = setInterval(() => this.tick(), 25);
  },
  stop() {
    clearInterval(this.timer); this.timer = null;
    if (this.bus) { try { this.bus.disconnect(); } catch { /* ignore */ } this.bus = null; }
  },
  set(track) { if (TRACKS[track] && track !== this.track) { this.track = track; this.step = 0; } },
  tick() {
    const a = ac(); if (!a || !this.bus) return;
    while (this.next < a.currentTime + 0.12) {
      const t = TRACKS[this.track];
      const six = 60 / t.bpm / 4;
      const s = this.step % 16;
      const root = t.roots[Math.floor(this.step / 16) % t.roots.length];
      if (s % 4 === 0) tone(NOTE(root), this.next, six * 3, "triangle", 0.07, this.bus);
      tone(NOTE(root + 24 + t.arp[this.step % t.arp.length]), this.next, six * 0.85, t.lead, t.lead === "triangle" ? 0.035 : 0.016, this.bus);
      if (t.drums && s % 2 === 1) noise(this.next, 0.035, 0.04, this.bus);
      if (t.drums && (s === 4 || s === 12)) noise(this.next, 0.1, 0.07, this.bus);
      this.next += six; this.step++;
    }
  },
};

export function buzz(ms = 30) {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch { /* unsupported */ }
}
