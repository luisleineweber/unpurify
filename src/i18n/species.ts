import namesData from '../data/names.json' with { type: 'json' };
import type { Species } from '../lib/pokemon.ts';
import type { Language } from './language.ts';

const names: Record<string, Record<Language, string>> = namesData;
const regions: Record<string, { name: string; ja: string }> = {
  alola: { name: 'Alola', ja: 'アローラのすがた' },
  galarian: { name: 'Galar', ja: 'ガラルのすがた' },
  hisuian: { name: 'Hisui', ja: 'ヒスイのすがた' },
  paldea: { name: 'Paldea', ja: 'パルデアのすがた' },
  paldean: { name: 'Paldea', ja: 'パルデアのすがた' },
};

export function speciesName(species: Pick<Species, 'id' | 'dex'>, language: Language): string {
  const base = names[species.dex]?.[language];
  if (!base) throw new Error(`Missing ${language} name for species ${species.dex}.`);
  const regionId = species.id.split('-')[1];
  if (!regionId) return base;
  const region = regions[regionId];
  if (!region) throw new Error(`Unknown region ${regionId} for species ${species.id}.`);
  return language === 'ja' ? `${base}（${region.ja}）` : `${base} (${region.name})`;
}

export function findSpecies(query: string, species: readonly Species[], language: Language): Species | undefined {
  const normalize = (value: string) => value.trim().normalize('NFKC').toLocaleLowerCase(language);
  const search = normalize(query);
  return species.find((entry) => normalize(speciesName(entry, language)) === search);
}
