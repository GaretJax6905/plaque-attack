// Draws the game in chunky pixels on a low-resolution canvas, scales it up
// with no smoothing (the retro look), then adds modern glow on top.

import { ENEMIES, BOSSES } from "./data/conditions.js";

// 10x10 pixel sprites. o = outline, x = body color, w = white, k = black, h = highlight
const SPRITES = {
  hero: [
    "..oooooo..",
    ".owwwwwwo.",
    "owwwwwwwwo",
    "owkwwwwkwo",
    "owwwwwwwwo",
    "owwwppwwwo",
    "owwwwwwwwo",
    ".owwoowwo.",
    ".oww..wwo.",
    "..oo..oo..",
  ],
  blob: [
    "...oooo...",
    "..oxxxxo..",
    ".oxhxxxxo.",
    "oxxxxxxxxo",
    "oxwkxxwkxo",
    "oxxxxxxxxo",
    "oxxxooxxxo",
    ".oxxxxxxo.",
    "..oxxxxo..",
    "...oooo...",
  ],
  drop: [
    "....oo....",
    "...oxxo...",
    "...oxxo...",
    "..oxhxxo..",
    ".oxxxxxxo.",
    ".oxwkwkxo.",
    "oxxxxxxxxo",
    "oxxxooxxxo",
    ".oxxxxxxo.",
    "..oooooo..",
  ],
  cube: [
    "oooooooooo",
    "oxxhxxxxxo",
    "oxhxxxhxxo",
    "oxxwkxwkxo",
    "oxxxxxxxxo",
    "oxxxxxxxxo",
    "oxxoooooxo",
    "oxxxxxxxxo",
    "oxxhxxxhxo",
    "oooooooooo",
  ],
  crab: [
    "o..oooo..o",
    "oooxxxxooo",
    ".oxxhxxxo.",
    "oxxwkwkxxo",
    "oxxxxxxxxo",
    "oxhxxxxhxo",
    ".oxxxxxxo.",
    "o.oooooo.o",
    "o.o....o.o",
    "..........",
  ],
  worm: [
    "..........",
    "..oooo....",
    ".oxxxxo...",
    "oxwkxxxo..",
    "oxxxxxxxo.",
    ".oooxxxxo.",
    "....oxxxxo",
    "...oxxxxo.",
    "..oxxxoo..",
    "...ooo....",
  ],
  gum: [
    "..oo..oo..",
    ".oxxooxxo.",
    "oxxhxxxxxo",
    "oxxxxxxxxo",
    "oxwkxxwkxo",
    "oxxxxxxxxo",
    "oxxxooxxxo",
    ".oxxxxxxo.",
    "..oxxxxo..",
    "...oooo...",
  ],
  rod: [
    "...oooo...",
    "..oxxxxo..",
    "..oxhxxo..",
    "..oxwkxo..",
    "..oxxxxo..",
    "..oxxxxo..",
    "..oxwkxo..",
    "..oxxxxo..",
    "..oxxxxo..",
    "...oooo...",
  ],
};
const SHAPE = { plaque: "blob", acid: "drop", sugar: "cube", calculus: "crab", caries: "worm", gingivitis: "gum", pging: "rod" };

const cache = new Map();
function sprite(name, color) {
  const key = `${name}:${color}`;
  if (cache.has(key)) return cache.get(key);
  const rows = SPRITES[name];
  const c = document.createElement("canvas");
  c.width = rows[0].length;
  c.height = rows.length;
  const g = c.getContext("2d");
  const pal = { o: "#1a0f24", x: color, w: "#ffffff", k: "#1a0f24", h: "rgba(255,255,255,.55)", p: "#ff7aa8" };
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (pal[ch]) { g.fillStyle = pal[ch]; g.fillRect(x, y, 1, 1); }
  }));
  cache.set(key, c);
  return c;
}

let glowSprite = null;
function glow() {
  if (glowSprite) return glowSprite;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  glowSprite = c;
  return c;
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.low = document.createElement("canvas");
    this.lctx = this.low.getContext("2d");
    this.scale = 3;
    this.bg = null;
    this.t = 0;
  }

  /** Size the canvas to the window and return the logical game size. */
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.scale = Math.max(2, Math.round(Math.min(w, h) / 140)); // ~140 logical px on the short side
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.dpr = dpr;
    this.low.width = Math.ceil(w / this.scale);
    this.low.height = Math.ceil(h / this.scale);
    this.bg = null;
    return { width: this.low.width, height: this.low.height };
  }

  background(w, h) {
    if (this.bg && this.bg.width === w && this.bg.height === h) return this.bg;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    g.fillStyle = "#5a1a35";
    g.fillRect(0, 0, w, h);
    // Gum texture: scattered darker and lighter pixels.
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < (w * h) / 18; i++) {
      g.fillStyle = rnd() < 0.5 ? "#4a1530" : "#6a2342";
      g.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), 1, 1);
    }
    // Rows of teeth along the top (maxillary) and bottom (mandibular) edges.
    const toothW = 14;
    for (let x = 0; x < w + toothW; x += toothW) {
      for (const top of [true, false]) {
        const y = top ? 0 : h - 9;
        g.fillStyle = "#1a0f24";
        g.fillRect(x, y, toothW - 1, 9);
        g.fillStyle = "#f3efe2";
        g.fillRect(x + 1, top ? y : y + 1, toothW - 3, 8);
        g.fillStyle = "#d9d2bf";
        g.fillRect(x + 1, top ? y + 6 : y + 1, toothW - 3, 2);
      }
    }
    this.bg = c;
    return c;
  }

  draw(game, input) {
    this.t += 1 / 60;
    const g = this.lctx;
    const w = this.low.width;
    const h = this.low.height;
    g.imageSmoothingEnabled = false;
    g.drawImage(this.background(w, h), 0, 0);

    const p = game.player;
    // Mirror aura (reveal radius).
    if (game.weapons.mirror) {
      g.strokeStyle = "rgba(159,247,255,0.25)";
      g.beginPath();
      g.arc(Math.round(p.x), Math.round(p.y), 28 + 7 * game.weapons.mirror, 0, Math.PI * 2);
      g.stroke();
    }
    // XP gems.
    for (const gem of game.gems) {
      g.fillStyle = "#1a0f24";
      g.fillRect(Math.round(gem.x) - 2, Math.round(gem.y) - 2, 4, 4);
      g.fillStyle = gem.xp > 2 ? "#ffd23f" : "#7ef7ff";
      g.fillRect(Math.round(gem.x) - 1, Math.round(gem.y) - 1, 2, 2);
    }
    // Enemies.
    for (const e of game.enemies) {
      const color = e.boss ? BOSSES[e.bossId].color : ENEMIES[e.type].color;
      const img = sprite(SHAPE[e.type] || "blob", e.hit > 0 ? "#ffffff" : color);
      const size = e.boss ? 30 : 10;
      g.globalAlpha = e.hidden && !e.revealed ? 0.28 : 1;
      const bob = Math.round(Math.sin(this.t * 8 + e.id) * (e.stun > 0 ? 0 : 0.6));
      g.drawImage(img, Math.round(e.x - size / 2), Math.round(e.y - size / 2) + bob, size, size);
      if (e.boss) {
        g.fillStyle = "#ffd23f";
        g.fillRect(Math.round(e.x) - 6, Math.round(e.y) - 19, 12, 3);
        g.fillRect(Math.round(e.x) - 6, Math.round(e.y) - 22, 2, 3);
        g.fillRect(Math.round(e.x) - 1, Math.round(e.y) - 23, 2, 4);
        g.fillRect(Math.round(e.x) + 4, Math.round(e.y) - 22, 2, 3);
      }
      g.globalAlpha = 1;
      if (e.marked > 0) {
        g.fillStyle = "#ff9bd3";
        g.fillRect(Math.round(e.x) - 1, Math.round(e.y - size / 2) - 4, 2, 2);
      }
      if (e.stun > 0) {
        g.fillStyle = "#5aa8ff";
        g.fillRect(Math.round(e.x) - 3, Math.round(e.y - size / 2) - 3, 6, 1);
      }
    }
    // Player (blinks when hurt), with a shield ring from the sealant.
    if (!(p.hurt > 0 && Math.floor(this.t * 20) % 2)) {
      g.drawImage(sprite("hero", "#ffffff"), Math.round(p.x) - 5, Math.round(p.y) - 5);
    }
    if (p.shield > 0) {
      g.strokeStyle = "rgba(126,247,255,0.8)";
      g.beginPath();
      g.arc(Math.round(p.x), Math.round(p.y), 9, 0, Math.PI * 2);
      g.stroke();
    }
    // Shots.
    for (const s of game.shots) {
      g.fillStyle = s.color;
      g.fillRect(Math.round(s.x) - 1, Math.round(s.y) - 1, 2, 2);
    }
    // Effects drawn in low-res too, so they stay pixel-y.
    for (const f of game.fx) this.drawFx(g, f);
    // Touch joystick.
    if (input && input.stick) {
      const s = input.stick;
      g.strokeStyle = "rgba(255,255,255,0.35)";
      g.beginPath();
      g.arc(s.ox / this.scale, s.oy / this.scale, 16, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = "rgba(255,255,255,0.45)";
      g.beginPath();
      g.arc(s.x / this.scale, s.y / this.scale, 6, 0, Math.PI * 2);
      g.fill();
    }

    // Upscale with hard pixel edges.
    const c = this.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.imageSmoothingEnabled = false;
    c.drawImage(this.low, 0, 0, this.low.width * this.scale * this.dpr, this.low.height * this.scale * this.dpr);
    // Modern touch: additive glow on shots, gems and the boss.
    c.globalCompositeOperation = "lighter";
    const k = this.scale * this.dpr;
    const gs = glow();
    c.globalAlpha = 0.35;
    for (const s of game.shots) c.drawImage(gs, s.x * k - 6 * k, s.y * k - 6 * k, 12 * k, 12 * k);
    c.globalAlpha = 0.18;
    for (const gem of game.gems) c.drawImage(gs, gem.x * k - 5 * k, gem.y * k - 5 * k, 10 * k, 10 * k);
    if (game.boss && game.boss.hp > 0) {
      c.globalAlpha = 0.22 + 0.08 * Math.sin(this.t * 4);
      c.drawImage(gs, game.boss.x * k - 30 * k, game.boss.y * k - 30 * k, 60 * k, 60 * k);
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = "source-over";
    // Subtle CRT scanlines.
    c.fillStyle = "rgba(0,0,0,0.12)";
    for (let y = 0; y < this.canvas.height; y += 3 * this.dpr) c.fillRect(0, y, this.canvas.width, this.dpr);
  }

  drawFx(g, f) {
    const alpha = Math.min(1, f.ttl * 4);
    g.globalAlpha = alpha;
    g.strokeStyle = f.color;
    g.fillStyle = f.color;
    if (f.type === "arc" || f.type === "cone") {
      g.beginPath();
      g.moveTo(f.x, f.y);
      g.arc(f.x, f.y, f.r, f.a - f.spread, f.a + f.spread);
      g.closePath();
      g.globalAlpha = alpha * (f.type === "cone" ? 0.35 : 0.25);
      g.fill();
    } else if (f.type === "line") {
      g.beginPath();
      g.moveTo(f.x, f.y);
      g.lineTo(f.x2, f.y2);
      g.stroke();
    } else if (f.type === "ring") {
      g.beginPath();
      g.arc(f.x, f.y, f.r * (1.1 - f.ttl * 2), 0, Math.PI * 2);
      g.stroke();
    } else if (f.type === "slash") {
      g.fillRect(Math.round(f.x) - 5, Math.round(f.y), 10, 1);
      g.fillRect(Math.round(f.x), Math.round(f.y) - 5, 1, 10);
    } else if (f.type === "pop") {
      const n = f.big ? 24 : 8;
      const spread = (f.big ? 1.2 : 0.4) - f.ttl;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const d = 4 + spread * (f.big ? 60 : 30);
        g.fillRect(Math.round(f.x + Math.cos(a) * d), Math.round(f.y + Math.sin(a) * d), f.big ? 2 : 1, f.big ? 2 : 1);
      }
    } else if (f.type === "text") {
      g.font = "bold 7px monospace";
      g.textAlign = "center";
      g.fillStyle = "#1a0f24";
      g.fillText(f.text, Math.round(f.x) + 1, Math.round(f.y - (0.9 - f.ttl) * 8) + 1);
      g.fillStyle = f.color;
      g.fillText(f.text, Math.round(f.x), Math.round(f.y - (0.9 - f.ttl) * 8));
    }
    g.globalAlpha = 1;
  }
}
