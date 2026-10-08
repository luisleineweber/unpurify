import assert from 'node:assert/strict';
import test from 'node:test';
import { languages } from './language.ts';
import { createTranslator, errorMessage, formatNumber, formatPercent, purificationCostMessage, translations } from './translate.ts';
import type { CalculationError } from '../lib/pokemon.ts';

test('all languages have complete text and the same template values', () => {
  const keys = Object.keys(translations.en);
  const parameters = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  for (const { code } of languages) {
    const messages = translations[code];
    assert.deepEqual(Object.keys(messages).sort(), [...keys].sort(), code);
    for (const key of keys as (keyof typeof messages)[]) {
      assert.ok(messages[key].trim(), `${code}.${key}`);
      assert.deepEqual(parameters(messages[key]), parameters(translations.en[key]), `${code}.${key}`);
    }
  }
});

test('templates preserve each language’s word order and report missing values', () => {
  assert.equal(createTranslator('en')('statAfter', { stat: 'Attack' }), 'Attack after purification');
  assert.equal(createTranslator('ja')('statAfter', { stat: 'こうげき' }), 'リトレーン後のこうげき');
  assert.throws(() => createTranslator('en')('statAfter'), /Missing value stat/);
});

test('numbers and percentages use the selected language', () => {
  assert.equal(formatPercent(86.666666, 'en'), '86.7');
  assert.equal(formatPercent(86.666666, 'de'), '86,7');
  assert.equal(formatPercent(100, 'ja'), '100');
  assert.equal(formatNumber(20000, 'en'), '20,000');
  assert.equal(formatNumber(20000, 'de'), '20.000');
  assert.equal(formatNumber(8.5, 'fr'), '8,5');
});

test('purification costs use singular and plural Candy words in every language', () => {
  const cases = [
    ['en', '1 Candy.', '3 Candy.'],
    ['de', '1 Bonbon.', '3 Bonbons.'],
    ['es', '1 Caramelo.', '3 Caramelos.'],
    ['it', '1 caramella.', '3 caramelle.'],
    ['fr', '1 Bonbon.', '3 Bonbons.'],
    ['ja', 'アメ1個。', 'アメ3個。'],
  ] as const;
  for (const [language, one, many] of cases) {
    assert.ok(purificationCostMessage(1000, 1, language).includes(one), `${language}: one Candy`);
    assert.ok(purificationCostMessage(1000, 3, language).includes(many), `${language}: several Candies`);
  }
  assert.equal(purificationCostMessage(20000, 1, 'de'), 'Erlösen: 20.000 Sternenstaub und 1 Bonbon. Das Level steigt auf mindestens 25.');
});

test('all domain errors render in every language, including stat and number values', () => {
  const errors: CalculationError[] = [
    { code: 'invalid-iv', stat: 'attack' }, { code: 'invalid-iv', stat: 'defense' },
    { code: 'invalid-iv', stat: 'stamina' }, { code: 'invalid-cp' },
    { code: 'invalid-hp' }, { code: 'invalid-level' }, { code: 'invalid-species' },
  ];
  for (const { code } of languages) {
    for (const error of errors) {
      const message = errorMessage(error, code);
      assert.ok(message.length > 0);
      assert.equal(message.includes('{'), false, `${code}: ${message}`);
    }
  }
  assert.equal(errorMessage({ code: 'invalid-iv', stat: 'attack' }, 'en'), 'Attack: Enter a whole number from 0 to 15.');
  assert.equal(errorMessage({ code: 'invalid-cp' }, 'de'), 'Gib eine ganze WP-Zahl von 10 bis 10.000 ein.');
});
