import type { CalculationError } from '../lib/pokemon.ts';
import type { Language } from './language.ts';
import { en } from './locales/en.ts';
import type { Messages } from './locales/en.ts';
import { de } from './locales/de.ts';
import { it } from './locales/it.ts';
import { es } from './locales/es.ts';
import { fr } from './locales/fr.ts';
import { ja } from './locales/ja.ts';

export const translations: Record<Language, Messages> = { en, de, it, es, fr, ja };
export type MessageKey = keyof Messages;
export type Translator = (key: MessageKey, values?: Record<string, string | number>) => string;

export function createTranslator(language: Language): Translator {
  return (key, values = {}) => translations[language][key].replace(/\{(\w+)\}/g, (_, name: string) => {
    if (values[name] === undefined) throw new Error(`Missing value ${name} for translation ${key}.`);
    return String(values[name]);
  });
}

export function formatNumber(value: number, language: Language): string {
  return new Intl.NumberFormat(language).format(value);
}

export function formatPercent(value: number, language: Language): string {
  return new Intl.NumberFormat(language, {
    maximumFractionDigits: 1, minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);
}

export function purificationCostMessage(dust: number, candy: number, language: Language): string {
  return createTranslator(language)(candy === 1 ? 'purificationCostOne' : 'purificationCost', {
    dust: formatNumber(dust, language), candy: formatNumber(candy, language),
  });
}

export function errorMessage(error: CalculationError, language: Language): string {
  const t = createTranslator(language);
  switch (error.code) {
    case 'invalid-iv': return t('invalidStat', { stat: t(error.stat) });
    case 'invalid-cp': return t('invalidCP', { max: formatNumber(10000, language) });
    case 'invalid-hp': return t('invalidHP', { max: formatNumber(1000, language) });
    case 'invalid-level': return t('invalidLevel');
    case 'invalid-species': return t('invalidSpecies');
  }
}
