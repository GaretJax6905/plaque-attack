// The simulation: player, enemies, instruments (weapons), XP, level-ups and
// the boss. No drawing and no DOM, so it runs headless in tests. The
// renderer reads `game` and draws it; `game.fx` holds short-lived effects.

import { WEAPONS } from "./data/instruments.js";
import { ENEMIES, BOSSES } from "./data/conditions.js";
import { seeded } from "./rng.js";

export const BOSS_TIME = 100; // seconds of waves before the boss arrives
export const MAX_LEVEL = 5;
export const MAX_WEAPONS = 6;

const MODE = {
  easy: { playerHp: 150, enemyDmg: 0.5, bossHp: 0.7 },
  pro: { playerHp: 120, enemyDmg: 0.7, bossHp: 0.9 },
};

const TAU = Math.PI * 2;
const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

export class Game {
  constructor({ caseData, mode = "easy", width = 320, height = 320, seed = 1 }) {
    this.case = caseData;
    this.mode = MODE[mode] ? mode : "easy";
    this.tune = MODE[this.mode];
    this.w = width;
    this.h = height;
    this.random = seeded(seed);
    this.time = 0;
    this.status = "playing"; // playing | won | lost
    this.paused = false;
    const hp = this.tune.playerHp;
    this.player = {
      x: width / 2, y: height / 2, r: 5, hp, maxHp: hp, speed: 78,
      face: { x: 1, y: 0 }, hurt: 0, shield: 0, shieldTimer: 0,
    };
    this.move = { x: 0, y: 0 };
    this.enemies = [];
    this.shots = [];
    this.gems = [];
    this.fx = [];
    this.weapons = { toothbrush: 1 };
    this.timers = {};
    this.xp = 0;
    this.level = 1;
    this.xpNext = 5;
    this.offer = null; // [weaponId, ...] while choosing an upgrade
    this.boss = null;
    this.spawnClock = 0;
    this.nextId = 1;
    this.stats = { kills: 0, damageTaken: 0, clinical: 0, picks: [], seen: new Set() };
    this.events = []; // drained by the UI: level-up, boss, win, lose, discover
  }

  // ---------------------------------------------------------------- input
  setMove(x, y) {
    const len = Math.hypot(x, y);
    this.move = len > 1 ? { x: x / len, y: y / len } : { x, y };
  }

  // ---------------------------------------------------------------- loop
  update(dt) {
    if (this.status !== "playing" || this.paused || this.offer) return;
    dt = Math.min(dt, 0.05);
    this.time += dt;
    this.movePlayer(dt);
    this.spawn(dt);
    this.moveEnemies(dt);
    this.useWeapons(dt);
    this.moveShots(dt);
    this.collectGems(dt);
    this.passives(dt);
    this.tickFx(dt);
    if (!this.boss && this.time >= BOSS_TIME) this.spawnBoss();
  }

  movePlayer(dt) {
    const p = this.player;
    p.x = Math.min(this.w - p.r, Math.max(p.r, p.x + this.move.x * p.speed * dt));
    p.y = Math.min(this.h - p.r, Math.max(p.r, p.y + this.move.y * p.speed * dt));
    if (this.move.x || this.move.y) p.face = { ...this.move };
    if (p.hurt > 0) p.hurt -= dt;
  }

  // ---------------------------------------------------------------- spawning
  spawn(dt) {
    if (this.boss) return; // during the boss fight, only the boss spawns minions
    this.spawnClock -= dt;
    if (this.spawnClock > 0) return;
    const progress = Math.min(1, this.time / BOSS_TIME);
    this.spawnClock = 1.3 - 0.8 * progress; // faster spawns over time
    const group = 1 + Math.floor(progress * 2.5 + this.random());
    for (let i = 0; i < group; i++) this.addEnemy(this.pickType());
  }

  pickType() {
    const mix = Object.entries(this.case.mix);
    const total = mix.reduce((s, [, w]) => s + w, 0);
    let roll = this.random() * total;
    for (const [type, weight] of mix) {
      roll -= weight;
      if (roll <= 0) return type;
    }
    return mix[0][0];
  }

  edgePoint() {
    const side = Math.floor(this.random() * 4);
    const t = this.random();
    if (side === 0) return { x: t * this.w, y: -8 };
    if (side === 1) return { x: this.w + 8, y: t * this.h };
    if (side === 2) return { x: t * this.w, y: this.h + 8 };
    return { x: -8, y: t * this.h };
  }

  addEnemy(type, at = null) {
    const def = ENEMIES[type];
    const pos = at || this.edgePoint();
    const scale = 1 + Math.min(1, this.time / BOSS_TIME) * 0.4; // tougher later
    const e = {
      id: this.nextId++, type, x: pos.x, y: pos.y, r: def.r,
      hp: def.hp * scale, maxHp: def.hp * scale, speed: def.speed * (0.9 + this.random() * 0.2),
      dmg: def.dmg, xp: def.xp, armored: !!def.armored, subgingival: !!def.subgingival,
      hidden: !!def.hidden, revealed: false, marked: 0, stun: 0, hit: 0, spawnClock: 4,
      boss: false,
    };
    this.enemies.push(e);
    this.discover(type);
    return e;
  }

  spawnBoss() {
    const def = BOSSES[this.case.boss];
    const base = ENEMIES[def.base];
    const p = this.player;
    const at = { x: p.x < this.w / 2 ? this.w - 20 : 20, y: p.y < this.h / 2 ? this.h - 20 : 20 };
    const hp = def.hp * this.tune.bossHp;
    this.boss = {
      id: this.nextId++, type: def.base, bossId: this.case.boss, name: def.name, color: def.color,
      x: at.x, y: at.y, r: 15, hp, maxHp: hp, speed: base.speed * 0.6, dmg: base.dmg * 2, xp: 0,
      armored: !!def.armored, subgingival: !!def.subgingival, hidden: !!def.hidden,
      revealed: !def.hidden, marked: 0, stun: 0, hit: 0, boss: true, minion: def.minion,
      spawnClock: 3, dashClock: 5, dash: 0,
    };
    this.enemies.push(this.boss);
    this.events.push({ type: "boss", name: def.name });
  }

  discover(type) {
    if (!this.stats.seen.has(type)) {
      this.stats.seen.add(type);
      this.events.push({ type: "discover", id: type });
    }
  }

  // ---------------------------------------------------------------- enemies
  moveEnemies(dt) {
    const p = this.player;
    for (const e of this.enemies) {
      if (e.hit > 0) e.hit -= dt;
      if (e.marked > 0) e.marked -= dt;
      if (e.stun > 0) { e.stun -= dt; continue; }
      let speed = e.speed;
      if (e.boss) speed = this.bossAct(e, dt);
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const len = Math.hypot(dx, dy) || 1;
      e.x += (dx / len) * speed * dt;
      e.y += (dy / len) * speed * dt;
      const ENEMY_SPAWNER = ENEMIES[e.type].spawns;
      if (!e.boss && ENEMY_SPAWNER) {
        e.spawnClock -= dt;
        if (e.spawnClock <= 0) {
          e.spawnClock = 5;
          this.addEnemy(ENEMY_SPAWNER, { x: e.x, y: e.y });
        }
      }
      if (len < e.r + p.r) this.hurtPlayer(e.dmg);
    }
  }

  bossAct(b, dt) {
    b.spawnClock -= dt;
    b.dashClock -= dt;
    if (b.spawnClock <= 0) {
      b.spawnClock = 3.5;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU;
        this.addEnemy(b.minion, { x: b.x + Math.cos(a) * 22, y: b.y + Math.sin(a) * 22 });
      }
    }
    if (b.dashClock <= 0) {
      b.dashClock = 6;
      b.dash = 0.6;
      this.fx.push({ type: "text", x: b.x, y: b.y - 20, text: "!", color: "#ff5d5d", ttl: 0.6 });
    }
    if (b.dash > 0) {
      b.dash -= dt;
      return b.speed * 4;
    }
    return b.speed;
  }

  hurtPlayer(amount) {
    const p = this.player;
    if (p.hurt > 0) return;
    p.hurt = 0.6;
    if (p.shield > 0) {
      p.shield -= 1;
      this.fx.push({ type: "text", x: p.x, y: p.y - 10, text: "SEALED", color: "#7ef7ff", ttl: 0.8 });
      return;
    }
    const reduction = Math.min(0.4, 0.08 * (this.weapons.varnish || 0));
    const dmg = amount * this.tune.enemyDmg * (1 - reduction);
    p.hp -= dmg;
    this.stats.damageTaken += dmg;
    this.events.push({ type: "hurt" });
    if (p.hp <= 0) {
      p.hp = 0;
      this.status = "lost";
      this.events.push({ type: "lose" });
    }
  }

  damage(e, amount, source) {
    if (e.hp <= 0) return;
    const w = WEAPONS[source] || {};
    let mult = 1;
    if (e.armored) mult *= w.bonus === "armored" ? 3 : 0.6;
    if (e.subgingival) mult *= w.bonus === "subgingival" ? 3 : 0.7;
    if (e.hidden && !e.revealed) mult *= 0.5;
    if (e.marked > 0) mult *= 1.5;
    if (this.weapons.mirror) {
      const radius = 28 + 7 * this.weapons.mirror;
      if (dist2(e, this.player) < radius * radius) mult *= 1 + 0.08 * this.weapons.mirror;
    }
    const dealt = amount * mult;
    e.hp -= dealt;
    e.hit = 0.12;
    if (dealt >= 1) {
      this.fx.push({ type: "text", x: e.x, y: e.y - e.r - 2, text: String(Math.round(dealt)), color: mult > 1.5 ? "#ffd23f" : "#ffffff", ttl: 0.5 });
    }
    if (e.hp <= 0) this.kill(e);
  }

  kill(e) {
    this.enemies = this.enemies.filter((x) => x !== e);
    this.fx.push({ type: "pop", x: e.x, y: e.y, color: e.boss ? BOSSES[e.bossId].color : ENEMIES[e.type].color, ttl: e.boss ? 1.2 : 0.4, big: e.boss });
    if (e.boss) {
      this.status = "won";
      this.events.push({ type: "win" });
      return;
    }
    this.stats.kills += 1;
    this.gems.push({ x: e.x, y: e.y, xp: e.xp });
  }

  // ---------------------------------------------------------------- weapons
  nearest(range = Infinity, from = this.player, skip = null) {
    let best = null;
    let bestD = range * range;
    for (const e of this.enemies) {
      if (skip && skip.has(e)) continue;
      const d = dist2(e, from);
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  aim() {
    const target = this.nearest(140);
    if (!target) return { ...this.player.face };
    const dx = target.x - this.player.x;
    const dy = target.y - this.player.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  }

  ready(id, cooldown, dt) {
    this.timers[id] = (this.timers[id] ?? cooldown * 0.5) - dt;
    if (this.timers[id] > 0) return false;
    this.timers[id] = cooldown;
    return true;
  }

  useWeapons(dt) {
    for (const [id, L] of Object.entries(this.weapons)) {
      const kind = WEAPONS[id].kind;
      const fire = this[`fire_${kind}`];
      if (fire) fire.call(this, id, L, dt);
    }
  }

  fire_sweep(id, L, dt) {
    if (!this.ready(id, 0.95 - 0.06 * L, dt)) return;
    const p = this.player;
    const dir = this.aim();
    const radius = 18 + 3 * L;
    const angle = Math.atan2(dir.y, dir.x);
    for (const e of [...this.enemies]) {
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d > radius + e.r) continue;
      let diff = Math.atan2(e.y - p.y, e.x - p.x) - angle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      if (Math.abs(diff) <= 1.25) this.damage(e, 9 + 3 * L, id);
    }
    this.fx.push({ type: "arc", x: p.x, y: p.y, r: radius, a: angle, spread: 1.25, color: "#9ff7ff", ttl: 0.18 });
  }

  fire_whip(id, L, dt) {
    if (!this.ready(id, 1.5 - 0.1 * L, dt)) return;
    const p = this.player;
    const dir = this.aim();
    const len = 55 + 8 * L;
    const end = { x: p.x + dir.x * len, y: p.y + dir.y * len };
    for (const e of [...this.enemies]) {
      if (segmentDistance(e, p, end) <= e.r + 4) this.damage(e, 6 + 3 * L, id);
    }
    this.fx.push({ type: "line", x: p.x, y: p.y, x2: end.x, y2: end.y, color: "#ffffff", ttl: 0.2 });
  }

  fire_aura(id, L) {
    const radius = 28 + 7 * L;
    for (const e of this.enemies) {
      if (e.hidden && !e.revealed && dist2(e, this.player) < radius * radius) {
        e.revealed = true;
        this.fx.push({ type: "text", x: e.x, y: e.y - 10, text: "FOUND", color: "#9ff7ff", ttl: 0.7 });
      }
    }
  }

  fire_shot(id, L, dt) {
    if (!this.ready(id, 0.65 - 0.06 * L, dt)) return;
    const count = L >= 4 ? 2 : 1;
    const dir = this.aim();
    for (let i = 0; i < count; i++) {
      const spread = (i - (count - 1) / 2) * 0.2;
      this.addShot(id, dir, spread, 180, 6 + 2.5 * L, 1 + Math.floor(L / 2), "#e8f0ff", true);
    }
  }

  fire_burst(id, L, dt) {
    if (!this.ready(id, 0.2 - 0.015 * L, dt)) return;
    const dir = this.aim();
    this.addShot(id, dir, (this.random() - 0.5) * 0.3, 220, 2.5 + 1.2 * L, 0, "#7ef7ff", false);
  }

  addShot(source, dir, spread, speed, dmg, pierce, color, reveals) {
    const a = Math.atan2(dir.y, dir.x) + spread;
    this.shots.push({
      source, x: this.player.x, y: this.player.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
      dmg, pierce, color, reveals, life: 1.2, hits: new Set(),
    });
  }

  fire_mark(id, L, dt) {
    if (!this.ready(id, 1.3 - 0.1 * L, dt)) return;
    const skip = new Set(this.enemies.filter((e) => e.marked > 0));
    for (let i = 0; i < 1 + L; i++) {
      const e = this.nearest(110, this.player, skip);
      if (!e) break;
      skip.add(e);
      e.marked = 4;
      const mm = 4 + Math.floor(this.random() * 4); // pockets on a "diseased" enemy
      this.fx.push({ type: "text", x: e.x, y: e.y - 12, text: `${mm} mm`, color: "#ff9bd3", ttl: 0.9 });
    }
  }

  fire_slash(id, L, dt) {
    if (!this.ready(id, 1.0 - 0.08 * L, dt)) return;
    const range = 28 + 3 * L;
    const skip = new Set();
    for (let i = 0; i < 1 + Math.floor(L / 2); i++) {
      const e = this.nearest(range, this.player, skip);
      if (!e) break;
      skip.add(e);
      this.fx.push({ type: "slash", x: e.x, y: e.y, color: WEAPONS[id].bonus === "armored" ? "#ffe9a8" : "#d8b4ff", ttl: 0.2 });
      this.damage(e, 10 + 4 * L, id);
    }
  }

  fire_pulse(id, L, dt) {
    if (!this.ready(id, 2.6 - 0.2 * L, dt)) return;
    const p = this.player;
    const radius = 32 + 5 * L;
    for (const e of [...this.enemies]) {
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d > radius) continue;
      if (!e.boss) {
        const push = 30 * (1 - d / radius) + 14;
        e.x += ((e.x - p.x) / (d || 1)) * push;
        e.y += ((e.y - p.y) / (d || 1)) * push;
      }
      this.damage(e, 3 + 1.5 * L, id);
    }
    this.fx.push({ type: "ring", x: p.x, y: p.y, r: radius, color: "#b8f1ff", ttl: 0.3 });
  }

  fire_cone(id, L, dt) {
    if (!this.ready(id, 3.2 - 0.25 * L, dt)) return;
    const p = this.player;
    const dir = this.aim();
    const angle = Math.atan2(dir.y, dir.x);
    const range = 60 + 6 * L;
    for (const e of [...this.enemies]) {
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d > range) continue;
      let diff = Math.atan2(e.y - p.y, e.x - p.x) - angle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      if (Math.abs(diff) > 0.52) continue;
      e.stun = Math.max(e.stun, e.boss ? 0.4 : 1 + 0.2 * L);
      this.damage(e, 5 + 3 * L, id);
    }
    this.fx.push({ type: "cone", x: p.x, y: p.y, r: range, a: angle, spread: 0.52, color: "#5aa8ff", ttl: 0.35 });
  }

  passives(dt) {
    const p = this.player;
    const varnish = this.weapons.varnish || 0;
    if (varnish) p.hp = Math.min(p.maxHp, p.hp + 0.3 * varnish * dt);
    const sealant = this.weapons.sealant || 0;
    if (sealant && p.shield < 1) {
      p.shieldTimer += dt;
      if (p.shieldTimer >= 9 - 1.2 * sealant) {
        p.shieldTimer = 0;
        p.shield = 1;
      }
    }
  }

  moveShots(dt) {
    for (const s of this.shots) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      for (const e of this.enemies) {
        if (s.life <= 0 || s.hits.has(e)) continue;
        if (dist2(s, e) <= (e.r + 2) ** 2) {
          s.hits.add(e);
          if (s.reveals && e.hidden) e.revealed = true;
          this.damage(e, s.dmg, s.source);
          if (s.pierce-- <= 0) s.life = 0;
        }
      }
    }
    this.shots = this.shots.filter((s) => s.life > 0 && s.x > -10 && s.y > -10 && s.x < this.w + 10 && s.y < this.h + 10);
  }

  // ---------------------------------------------------------------- XP
  magnetRadius() {
    return 24 + 18 * (this.weapons.hve || 0);
  }

  collectGems(dt) {
    const p = this.player;
    const radius = this.magnetRadius();
    for (const g of this.gems) {
      const d = Math.hypot(g.x - p.x, g.y - p.y);
      if (d < radius) {
        const pull = (160 * dt) / (d || 1);
        g.x += (p.x - g.x) * Math.min(1, pull);
        g.y += (p.y - g.y) * Math.min(1, pull);
      }
      if (d < p.r + 3) {
        g.taken = true;
        this.gainXp(g.xp);
      }
    }
    this.gems = this.gems.filter((g) => !g.taken);
  }

  gainXp(amount) {
    this.xp += amount;
    if (this.xp >= this.xpNext && !this.offer) {
      this.xp -= this.xpNext;
      this.level += 1;
      this.xpNext = 4 + this.level * 3;
      this.offer = this.makeOffer();
      if (this.offer.length) this.events.push({ type: "levelup", offer: this.offer });
      else this.offer = null;
    }
  }

  makeOffer() {
    const owned = Object.keys(this.weapons);
    const upgrades = owned.filter((id) => this.weapons[id] < MAX_LEVEL);
    const fresh = owned.length < MAX_WEAPONS ? Object.keys(WEAPONS).filter((id) => !this.weapons[id]) : [];
    const pool = [...upgrades, ...fresh];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 3);
  }

  /** Choose one offered instrument. Returns { indicated } for teaching feedback. */
  choose(id) {
    if (!this.offer || !this.offer.includes(id)) throw new Error("Pick one of the offered instruments.");
    this.weapons[id] = (this.weapons[id] || 0) + 1;
    const indicated = this.case.indicated.includes(id);
    if (indicated) this.stats.clinical += 1;
    this.stats.picks.push({ id, indicated });
    this.offer = null;
    if (this.xp >= this.xpNext) this.gainXp(0);
    return { indicated };
  }

  tickFx(dt) {
    for (const f of this.fx) f.ttl -= dt;
    this.fx = this.fx.filter((f) => f.ttl > 0);
  }

  drainEvents() {
    const out = this.events;
    this.events = [];
    return out;
  }
}

function segmentDistance(pt, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((pt.x - a.x) * dx + (pt.y - a.y) * dy) / len2));
  return Math.hypot(pt.x - (a.x + t * dx), pt.y - (a.y + t * dy));
}
