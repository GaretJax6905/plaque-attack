"""The dental facts the game teaches: numbering, data integrity, quiz bank."""

# pylint: disable=missing-function-docstring

import pytest

pytestmark = pytest.mark.logic

TYPES = [
    "third molar",
    "second molar",
    "first molar",
    "second premolar",
    "first premolar",
    "canine",
    "lateral incisor",
    "central incisor",
]


def expected_tooth(n):
    """Independent Universal-system reference written out quadrant by quadrant."""
    if n <= 8:
        return f"Maxillary right {TYPES[n - 1]}", 10 + (9 - n)
    if n <= 16:
        return f"Maxillary left {TYPES[16 - n]}", 20 + (n - 8)
    if n <= 24:
        return f"Mandibular left {TYPES[n - 17]}", 30 + (25 - n)
    return f"Mandibular right {TYPES[32 - n]}", 40 + (n - 24)


def test_all_32_teeth_names_and_fdi(js):
    table = js("""
        const t = await import('/js/data/teeth.js');
        return Array.from({length: 32}, (_, i) => [t.toothName(i + 1), t.toFDI(i + 1),
                                                    t.fromFDI(t.toFDI(i + 1))]);
    """)
    for n, (name, fdi, back) in enumerate(table, start=1):
        assert (name, fdi) == expected_tooth(n), n
        assert back == n


@pytest.mark.parametrize(
    ("number", "name", "fdi"),
    [
        (1, "Maxillary right third molar", 18),
        (3, "Maxillary right first molar", 16),
        (8, "Maxillary right central incisor", 11),
        (19, "Mandibular left first molar", 36),
        (30, "Mandibular right first molar", 46),
        (32, "Mandibular right third molar", 48),
    ],
)
def test_landmark_teeth(js, number, name, fdi):
    got = js(f"""
        const t = await import('/js/data/teeth.js');
        return [t.toothName({number}), t.toFDI({number})];
    """)
    assert got == [name, fdi]


def test_anterior_teeth_and_bad_numbers(js):
    result = js("""
        const t = await import('/js/data/teeth.js');
        const anterior = Array.from({length: 32}, (_, i) => i + 1).filter(t.isAnterior);
        let threw = 0;
        for (const bad of [0, 33, 2.5]) { try { t.toothName(bad); } catch { threw++; } }
        return { anterior, threw };
    """)
    assert result["anterior"] == [6, 7, 8, 9, 10, 11, 22, 23, 24, 25, 26, 27]
    assert result["threw"] == 3


def test_cases_reference_real_content(js):
    problems = js("""
        const { CASES } = await import('/js/data/cases.js');
        const { WEAPONS, TOOLS } = await import('/js/data/instruments.js');
        const { ENEMIES, BOSSES, ANATOMY } = await import('/js/data/conditions.js');
        const bad = [];
        for (const c of CASES) {
          for (const id of c.indicated) if (!WEAPONS[id]) bad.push(`${c.id}: weapon ${id}`);
          for (const id of c.tools) if (!TOOLS[id]) bad.push(`${c.id}: tool ${id}`);
          for (const id of c.codex) if (!ANATOMY[id]) bad.push(`${c.id}: codex ${id}`);
          for (const id of Object.keys(c.mix)) if (!ENEMIES[id]) bad.push(`${c.id}: enemy ${id}`);
          if (!BOSSES[c.boss]) bad.push(`${c.id}: boss`);
          if (c.steps.length < 6) bad.push(`${c.id}: too few steps`);
          for (const s of c.steps) if (!s.easy || !s.pro) bad.push(`${c.id}: step text`);
          for (const n of c.teeth) if (n < 1 || n > 32) bad.push(`${c.id}: tooth ${n}`);
          if (!c.easy || !c.pro) bad.push(`${c.id}: diagnosis text`);
        }
        return bad;
    """)
    assert not problems


def test_quiz_bank_is_well_formed(js):
    report = js("""
        const { QUESTIONS } = await import('/js/data/quiz.js');
        const { CASES } = await import('/js/data/cases.js');
        const ids = new Set(CASES.map((c) => c.id));
        const bad = [];
        const seen = new Set();
        for (const q of QUESTIONS) {
          if (seen.has(q.id)) bad.push(`duplicate ${q.id}`);
          seen.add(q.id);
          if (q.options.length !== 4) bad.push(`${q.id}: options`);
          if (new Set(q.options).size !== 4) bad.push(`${q.id}: repeated option`);
          if (!(q.answer >= 0 && q.answer < q.options.length)) bad.push(`${q.id}: answer`);
          if (!['easy', 'pro'].includes(q.mode)) bad.push(`${q.id}: mode`);
          for (const c of q.cases) if (!ids.has(c)) bad.push(`${q.id}: case ${c}`);
          if (!q.why) bad.push(`${q.id}: explanation`);
        }
        const perCase = CASES.map((c) => [c.id,
          QUESTIONS.filter((q) => q.mode === 'easy' && q.cases.includes(c.id)).length,
          QUESTIONS.filter((q) => q.mode === 'pro' && q.cases.includes(c.id)).length]);
        return { bad, perCase };
    """)
    assert not report["bad"]
    for case_id, easy, pro in report["perCase"]:
        assert easy >= 1, case_id
        assert pro >= 3, case_id


def test_quiz_shuffle_keeps_the_right_answer(js):
    ok = js("""
        const { QUESTIONS, shuffled, quizFor } = await import('/js/data/quiz.js');
        const { seeded } = await import('/js/rng.js');
        const rand = seeded(42);
        for (const q of QUESTIONS) {
          const s = shuffled(q, rand);
          if (s.options[s.answer] !== q.options[q.answer]) return false;
        }
        const pro = quizFor('classII', 'pro', 3, rand);
        return pro.length === 3 && pro.every((q) => q.mode === 'pro')
          && pro[0].cases.includes('classII');
    """)
    assert ok


def test_every_codex_entry_has_both_explanations(js):
    result = js("""
        const { CATALOG, totalEntries, STARTING_ENTRIES, findEntry } = await import('/js/codex.js');
        const missing = [];
        for (const group of Object.values(CATALOG)) {
          for (const [id, e] of Object.entries(group)) {
            if (!e.name || !e.easy || !e.pro) missing.push(id);
          }
        }
        return { missing, total: totalEntries(), start: STARTING_ENTRIES.every(findEntry) };
    """)
    assert not result["missing"]
    assert result["total"] >= 40
    assert result["start"]
