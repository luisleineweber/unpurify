import { mkdir, writeFile } from 'node:fs/promises';
import { extractNames } from './pokemon-names.mjs';

const sources = {
  gameMaster: 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json',
  names: 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species_names.csv',
  multipliers: 'https://pogoapi.net/api/v1/cp_multiplier.json',
};

async function download(url, json = true) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not download ${url}: ${response.status}`);
  return json ? response.json() : response.text();
}

const [gameMaster, namesCsv, cpMultipliers] = await Promise.all([
  download(sources.gameMaster), download(sources.names, false), download(sources.multipliers),
]);
const names = new Map(namesCsv.split('\n').map((line) => line.split(','))
  .filter((row) => row[1] === '6').map((row) => [Number(row[0]), row[2]]));
const regionNames = { ALOLA: 'Alola', GALARIAN: 'Galar', HISUIAN: 'Hisui', PALDEA: 'Paldea', PALDEAN: 'Paldea' };
const species = new Map();
for (const template of gameMaster) {
  const pokemon = template.data?.pokemonSettings;
  const match = template.templateId.match(/^V(\d+)_POKEMON_(.+)$/);
  if (!match || !pokemon?.shadow || !pokemon.stats?.baseAttack) continue;
  const region = Object.keys(regionNames).find((key) => match[2] === `${pokemon.pokemonId}_${key}`);
  if (match[2] !== pokemon.pokemonId && !region) continue;
  const dex = Number(match[1]);
  const name = names.get(dex);
  if (!name) throw new Error(`German name missing for species ${dex}`);
  const id = `${dex}${region ? `-${region.toLowerCase()}` : ''}`;
  species.set(id, {
    id, dex, name: `${name}${region ? ` (${regionNames[region]})` : ''}`,
    attack: pokemon.stats.baseAttack, defense: pokemon.stats.baseDefense,
    stamina: pokemon.stats.baseStamina,
    dust: pokemon.shadow.purificationStardustNeeded,
    candy: pokemon.shadow.purificationCandyNeeded,
  });
}
if (species.size < 200 || !species.has('150') || !species.has('94')) {
  throw new Error('The source schema changed. Check the species extraction.');
}
const multipliers = cpMultipliers.filter((row) => row.level <= 45);
const integerMultipliers = gameMaster.find((row) => row.templateId === 'PLAYER_LEVEL_SETTINGS')?.data.playerLevel.cpMultiplier;
if (!integerMultipliers || integerMultipliers.length < 50) throw new Error('Game Master CP multipliers are missing.');
// The API stops at 45. Above 40, half levels use the mean of integer-level multipliers.
for (let level = 45.5; level <= 50; level += 0.5) {
  const lower = Math.fround(integerMultipliers[Math.floor(level) - 1]);
  const upper = Math.fround(integerMultipliers[Math.ceil(level) - 1]);
  multipliers.push({ level, multiplier: (lower + upper) / 2 });
}
if (multipliers.length !== 99 || !multipliers.find((row) => row.level === 25)) {
  throw new Error('Expected CP multipliers for half levels 1–50.');
}
const localizedNames = extractNames(namesCsv, [...species.values()].map(({ dex }) => dex));
await mkdir('src/data', { recursive: true });
await writeFile('src/data/pokemon.json', JSON.stringify([...species.values()]
  .sort((a, b) => a.name.localeCompare(b.name, 'de'))));
await writeFile('src/data/names.json', JSON.stringify(localizedNames));
await writeFile('src/data/multipliers.json', JSON.stringify(multipliers));
await writeFile('src/data/sources.json', JSON.stringify({ updated: new Date().toISOString().slice(0, 10), ...sources }));
console.log(`Saved ${species.size} standard and regional forms, and ${multipliers.length} CP multipliers.`);
