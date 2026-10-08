import assert from 'node:assert/strict';
import test from 'node:test';
import species from '../data/pokemon.json' with { type: 'json' };
import { languages } from './language.ts';
import { findSpecies, speciesName } from './species.ts';

test('every bundled form has a distinct searchable name in all six languages', () => {
  for (const { code } of languages) {
    const names = species.map((entry) => speciesName(entry, code));
    assert.equal(new Set(names).size, species.length, code);
    for (const entry of species) {
      assert.equal(findSpecies(speciesName(entry, code), species, code)?.id, entry.id);
    }
  }
});

test('names and regional forms match the selected language', () => {
  assert.equal(speciesName({ id: '150', dex: 150 }, 'en'), 'Mewtwo');
  assert.equal(speciesName({ id: '150', dex: 150 }, 'de'), 'Mewtu');
  assert.equal(speciesName({ id: '94', dex: 94 }, 'fr'), 'Ectoplasma');
  assert.equal(speciesName({ id: '150', dex: 150 }, 'ja'), 'ミュウツー');
  assert.equal(speciesName({ id: '37-alola', dex: 37 }, 'en'), 'Vulpix (Alola)');
  assert.equal(speciesName({ id: '37-alola', dex: 37 }, 'ja'), 'ロコン（アローラのすがた）');
});

test('search accepts case, whitespace, and Japanese character width without confusing forms', () => {
  assert.equal(findSpecies('  mEwTwO ', species, 'en')?.id, '150');
  assert.equal(findSpecies('ﾐｭｳﾂｰ', species, 'ja')?.id, '150');
  assert.equal(findSpecies('Vulpix (Alola)', species, 'en')?.id, '37-alola');
  assert.equal(findSpecies('Vulpix', species, 'en')?.id, '37');
  assert.equal(findSpecies('Unknown Pokémon', species, 'en'), undefined);
  assert.throws(() => speciesName({ id: '99999', dex: 99999 }, 'en'), /Missing en name/);
});
