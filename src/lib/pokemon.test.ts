import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { appraisal, combatPower, findCandidates, hitPoints, ivPercent, purify, readIVs } from './pokemon.ts';
import type { Multiplier, Species } from './pokemon.ts';

const multipliers: Multiplier[] = JSON.parse(readFileSync(new URL('../data/multipliers.json', import.meta.url), 'utf8'));
const species: Species[] = JSON.parse(readFileSync(new URL('../data/pokemon.json', import.meta.url), 'utf8'));
const mewtwo = species.find((entry) => entry.id === '150')!;
const multiplier = (level: number) => multipliers.find((entry) => entry.level === level)!.multiplier;

test('purification adds two, caps each IV at 15, and leaves the input intact for all 4096 combinations', () => {
  for (let attack = 0; attack <= 15; attack++) {
    for (let defense = 0; defense <= 15; defense++) {
      for (let stamina = 0; stamina <= 15; stamina++) {
        const input = Object.freeze({ attack, defense, stamina });
        const result = purify(input);
        assert.deepEqual(result, { attack: Math.min(15, attack + 2), defense: Math.min(15, defense + 2), stamina: Math.min(15, stamina + 2) });
        assert.equal(ivPercent(result) === 100, attack >= 13 && defense >= 13 && stamina >= 13);
      }
    }
  }
});

test('IV input accepts zero and rejects missing, fractional, negative, and out-of-range values', () => {
  assert.deepEqual(readIVs({ attack: '0', defense: '14', stamina: '15' }), { ok: true, value: { attack: 0, defense: 14, stamina: 15 } });
  for (const value of ['', '16', '-1', '1.5', 'NaN', '1e1']) {
    assert.equal(readIVs({ attack: value, defense: '13', stamina: '13' }).ok, false);
  }
});

test('appraisal follows the actual sum thresholds, including the separate perfect appraisal', () => {
  const expected = [[22, 0], [23, 1], [29, 1], [30, 2], [36, 2], [37, 3], [44, 3], [45, 4]];
  for (const [total, rating] of expected) {
    assert.equal(appraisal({ attack: Math.min(total, 15), defense: Math.min(Math.max(total - 15, 0), 15), stamina: Math.max(total - 30, 0) }), rating);
  }
});

test('Mewtwo CP matches the level 20 and level 25 perfect raid values', () => {
  const perfect = { attack: 15, defense: 15, stamina: 15 };
  assert.equal(combatPower(mewtwo, perfect, multiplier(20)), 2387);
  assert.equal(combatPower(mewtwo, perfect, multiplier(25)), 2984);
  assert.equal(combatPower({ ...mewtwo, attack: 1, defense: 1, stamina: 1 }, { attack: 0, defense: 0, stamina: 0 }, multiplier(1)), 10);
});

test('CP alone returns every matching combination rather than one invented IV', () => {
  const ivs = { attack: 13, defense: 13, stamina: 13 };
  const cp = combatPower(mewtwo, ivs, multiplier(8));
  const result = findCandidates(mewtwo, cp, multipliers);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(result.value.length > 1);
  assert.ok(result.value.some((row) => row.level === 8 && row.ivs.attack === 13 && row.ivs.defense === 13 && row.ivs.stamina === 13));
  for (const row of result.value) {
    assert.equal(combatPower(mewtwo, row.ivs, multiplier(row.level)), cp);
    assert.equal(row.purifiedCP, combatPower(mewtwo, purify(row.ivs), multiplier(Math.max(25, row.level))));
  }
});

test('known IVs and maximum HP narrow the candidates and preserve levels above 25', () => {
  const ivs = { attack: 14, defense: 15, stamina: 13 };
  for (const level of [8, 25, 35, 50]) {
    const cp = combatPower(mewtwo, ivs, multiplier(level));
    const result = findCandidates(mewtwo, cp, multipliers, { level, ivs, hp: hitPoints(mewtwo, ivs, multiplier(level)) });
    assert.equal(result.ok, true);
    if (!result.ok) continue;
    assert.equal(result.value.length, 1);
    assert.equal(result.value[0].purifiedCP, combatPower(mewtwo, purify(ivs), multiplier(Math.max(25, level))));
  }
});

test('invalid CP and filters return visible domain errors; valid impossible searches return an empty result', () => {
  for (const cp of [0, 9, -1, 10001, 10.2, NaN]) assert.equal(findCandidates(mewtwo, cp, multipliers).ok, false);
  assert.equal(findCandidates(mewtwo, 900, multipliers, { hp: 9 }).ok, false);
  assert.equal(findCandidates(mewtwo, 900, multipliers, { level: 51 }).ok, false);
  assert.equal(findCandidates(mewtwo, 900, multipliers, { ivs: { attack: 16 } }).ok, false);
  assert.deepEqual(findCandidates(mewtwo, 10, multipliers, { level: 50 }), { ok: true, value: [] });
});

test('validation identifies the invalid field without embedding interface text', () => {
  assert.deepEqual(readIVs({ attack: '13', defense: '16', stamina: '13' }), {
    ok: false, error: { code: 'invalid-iv', stat: 'defense' },
  });
  assert.deepEqual(findCandidates(mewtwo, 9, multipliers), { ok: false, error: { code: 'invalid-cp' } });
  assert.deepEqual(findCandidates(mewtwo, 900, multipliers, { hp: 9 }), { ok: false, error: { code: 'invalid-hp' } });
  assert.deepEqual(findCandidates(mewtwo, 900, multipliers, { level: 51 }), { ok: false, error: { code: 'invalid-level' } });
  assert.deepEqual(findCandidates(mewtwo, 900, multipliers, { ivs: { stamina: 16 } }), {
    ok: false, error: { code: 'invalid-iv', stat: 'stamina' },
  });
});

test('bundled data has all 99 half levels, named species, and explicit purification costs', () => {
  assert.equal(multipliers.length, 99);
  assert.equal(new Set(multipliers.map((row) => row.level)).size, 99);
  assert.equal(multipliers[0].level, 1);
  assert.equal(multipliers.at(-1)!.level, 50);
  assert.ok(species.length > 200);
  assert.equal(mewtwo.dust, 20000);
  for (const row of species) {
    assert.ok(row.name.length > 0 && row.attack > 0 && row.defense > 0 && row.stamina > 0 && row.dust > 0 && row.candy > 0);
  }
});
