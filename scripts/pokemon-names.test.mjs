import assert from 'node:assert/strict';
import test from 'node:test';
import { extractNames } from './pokemon-names.mjs';

const csv = 'pokemon_species_id,local_language_id,name,genus\r\n' + [
  '150,9,Mewtwo,Genetic Pokémon', '150,6,Mewtu,Genmutant',
  '150,8,Mewtwo,Genetico', '150,7,Mewtwo,Genético',
  '150,5,Mewtwo,Génétique', '150,11,ミュウツー,いでんし',
].join('\r\n');

test('extracts every requested language and only the requested species', () => {
  const names = extractNames(csv, [150, 150]);
  assert.deepEqual(names, { 150: { en: 'Mewtwo', de: 'Mewtu', it: 'Mewtwo', es: 'Mewtwo', fr: 'Mewtwo', ja: 'ミュウツー' } });
});

test('missing translations stop the data update', () => {
  assert.throws(() => extractNames(csv.replace('150,11,ミュウツー,いでんし', ''), [150]), /ja name missing/);
  assert.throws(() => extractNames(csv, [94]), /en name missing/);
});
