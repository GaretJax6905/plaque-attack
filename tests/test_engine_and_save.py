"""Game rules (headless engine with a fixed seed) and progress saving."""

# pylint: disable=missing-function-docstring

import pytest

pytestmark = pytest.mark.logic

SETUP = """
const { Game, BOSS_TIME } = await import('/js/engine.js');
const { caseById } = await import('/js/data/cases.js');
const make = (id = 'checkup', mode = 'easy') =>
  new Game({ caseData: caseById(id), mode, width: 200, height: 300, seed: 7 });
const step = (g, seconds) => {
  for (let t = 0; t < seconds; t += 1 / 60) {
    if (g.offer) g.choose(g.offer[0]);  // keep playing through level-ups
    g.update(1 / 60);
  }
};
"""


def test_enemies_spawn_and_toothbrush_fights_back(js):
    result = js(SETUP + """
        const g = make();
        step(g, 12);
        return { spawned: g.nextId > 1, kills: g.stats.kills, time: g.time > 11 };
    """)
    assert result["spawned"] and result["time"]
    assert result["kills"] > 0


def test_level_up_offers_three_and_tracks_clinical_choices(js):
    result = js(SETUP + """
        const g = make('tartar');
        g.gainXp(g.xpNext);
        const offer = [...g.offer];
        const before = g.time;
        for (let i = 0; i < 60; i++) g.update(1 / 60);  // frozen while choosing
        const frozen = g.time === before;
        const pick = offer.find((id) => g.case.indicated.includes(id)) || offer[0];
        const { indicated } = g.choose(pick);
        return { size: offer.length, frozen, indicated, clinical: g.stats.clinical,
                 owned: g.weapons[pick], cleared: g.offer === null,
                 wanted: g.case.indicated.includes(pick) };
    """)
    assert result["size"] == 3
    assert result["frozen"] and result["cleared"]
    assert result["indicated"] == result["wanted"]
    assert result["clinical"] == (1 if result["wanted"] else 0)
    assert result["owned"] >= 1


def test_sickle_scaler_triples_damage_on_calculus(js):
    result = js(SETUP + """
        const g = make('tartar');
        const a = g.addEnemy('calculus', { x: 50, y: 50 });
        const b = g.addEnemy('calculus', { x: 150, y: 50 });
        const hp = a.hp;
        g.damage(a, 10, 'sickle');
        g.damage(b, 10, 'toothbrush');
        return [hp - a.hp, hp - b.hp];
    """)
    assert result == [30, 6]


def test_gracey_curet_triples_damage_below_the_gumline(js):
    result = js(SETUP + """
        const g = make('perio');
        const a = g.addEnemy('pging', { x: 50, y: 50 });
        const b = g.addEnemy('pging', { x: 150, y: 50 });
        const hp = a.hp;
        g.damage(a, 10, 'gracey');
        g.damage(b, 10, 'sickle');
        return [Math.round(hp - a.hp), Math.round(hp - b.hp)];
    """)
    assert result == [30, 7]


def test_hidden_caries_found_by_the_mirror(js):
    result = js(SETUP + """
        const g = make('classII');
        g.weapons.mirror = 1;
        const e = g.addEnemy('caries', { x: g.player.x + 10, y: g.player.y });
        const before = e.revealed;
        g.fire_aura('mirror', 1);
        return [before, e.revealed];
    """)
    assert result == [False, True]


def test_varnish_reduces_damage_and_sealant_blocks_a_hit(js):
    result = js(SETUP + """
        const plain = make();
        plain.hurtPlayer(20);
        const lost = plain.player.maxHp - plain.player.hp;
        const coated = make();
        coated.weapons.varnish = 5;
        coated.hurtPlayer(20);
        const lostCoated = coated.player.maxHp - coated.player.hp;
        const sealed = make();
        sealed.player.shield = 1;
        sealed.hurtPlayer(20);
        return { lost, lostCoated, sealedHp: sealed.player.hp, max: sealed.player.maxHp };
    """)
    assert result["lost"] == pytest.approx(10)  # easy mode: 50% enemy damage
    assert result["lostCoated"] == pytest.approx(6)  # 40% varnish reduction
    assert result["sealedHp"] == result["max"]


def test_boss_arrives_on_time_and_winning_ends_the_case(js):
    result = js(SETUP + """
        const g = make('classI', 'pro');
        g.player.hp = 1e9; g.player.maxHp = 1e9;
        step(g, BOSS_TIME - 1);
        const early = !!g.boss;
        step(g, 2);
        const name = g.boss && g.boss.name;
        g.damage(g.boss, 1e9, 'highspeed');
        const events = g.drainEvents().map((e) => e.type);
        return { early, name, status: g.status, win: events.includes('win') };
    """)
    assert result == {
        "early": False,
        "name": "Sugar Titan",
        "status": "won",
        "win": True,
    }


def test_losing_all_health_ends_the_case(js):
    status = js(SETUP + """
        const g = make();
        g.hurtPlayer(1e9);
        return g.status;
    """)
    assert status == "lost"


def test_save_records_best_and_unlocks_next(js):
    result = js("""
        const s = await import('/js/save.js');
        const save = s.freshSave();
        s.recordCase(save, 0, { stars: 2, time: 130, quizRight: 2, stepsCorrect: false });
        s.recordCase(save, 0, { stars: 1, time: 110, quizRight: 3, stepsCorrect: true });
        return { unlocked: save.unlocked, c: save.cases.checkup };
    """)
    assert result["unlocked"] == 2
    assert result["c"] == {"stars": 2, "bestTime": 110, "quizBest": 3, "steps": True}


def test_save_code_round_trip_and_bad_codes(js):
    result = js("""
        const s = await import('/js/save.js');
        const save = s.freshSave();
        save.mode = 'pro';
        save.codex['mirror'] = true;
        save.stats.kills = 99;
        const back = s.importCode(s.exportCode(save));
        let error = '';
        try { s.importCode('not a code!'); } catch (e) { error = e.message; }
        const clamped = s.normalize({ version: 1, unlocked: 999, mode: 'hacker' });
        return { mode: back.mode, mirror: back.codex.mirror, kills: back.stats.kills, error,
                 unlocked: clamped.unlocked, cmode: clamped.mode };
    """)
    assert result["mode"] == "pro" and result["mirror"] and result["kills"] == 99
    assert "isn't valid" in result["error"]
    assert result["unlocked"] == 7 and result["cmode"] == "easy"


def test_storage_failures_do_not_crash(js):
    result = js("""
        const s = await import('/js/save.js');
        const broken = { getItem() { throw new Error('blocked'); },
                         setItem() { throw new Error('blocked'); } };
        return { loaded: s.load(broken).version, stored: s.store(s.freshSave(), broken) };
    """)
    assert result == {"loaded": 1, "stored": False}
