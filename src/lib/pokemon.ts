export type IVs = { attack: number; defense: number; stamina: number };
export type StatKey = keyof IVs;
export type Species = {
  id: string; dex: number; name: string;
  attack: number; defense: number; stamina: number; dust: number; candy: number;
};
export type Multiplier = { level: number; multiplier: number };
export type Candidate = { ivs: IVs; level: number; purifiedCP: number; purifiedHP: number };
export type CalculationError =
  | { code: 'invalid-iv'; stat: StatKey }
  | { code: 'invalid-cp' | 'invalid-hp' | 'invalid-level' | 'invalid-species' };
export type Result<T> = { ok: true; value: T } | { ok: false; error: CalculationError };

export const stats: { key: StatKey }[] = [
  { key: 'attack' },
  { key: 'defense' },
  { key: 'stamina' },
];

export function readIVs(values: Record<StatKey, string>): Result<IVs> {
  const ivs = {} as IVs;
  for (const { key } of stats) {
    const value = values[key].trim();
    if (!/^\d+$/.test(value) || Number(value) > 15) {
      return { ok: false, error: { code: 'invalid-iv', stat: key } };
    }
    ivs[key] = Number(value);
  }
  return { ok: true, value: ivs };
}

export function purify(ivs: IVs): IVs {
  return {
    attack: Math.min(15, ivs.attack + 2),
    defense: Math.min(15, ivs.defense + 2),
    stamina: Math.min(15, ivs.stamina + 2),
  };
}

export function ivPercent(ivs: IVs): number {
  return (ivs.attack + ivs.defense + ivs.stamina) / 45 * 100;
}

export function appraisal(ivs: IVs): number {
  const total = ivs.attack + ivs.defense + ivs.stamina;
  return total === 45 ? 4 : total >= 37 ? 3 : total >= 30 ? 2 : total >= 23 ? 1 : 0;
}

export function combatPower(species: Species, ivs: IVs, multiplier: number): number {
  return Math.max(10, Math.floor((species.attack + ivs.attack)
    * Math.sqrt(species.defense + ivs.defense)
    * Math.sqrt(species.stamina + ivs.stamina) * multiplier ** 2 / 10));
}

export function hitPoints(species: Species, ivs: IVs, multiplier: number): number {
  return Math.max(10, Math.floor((species.stamina + ivs.stamina) * multiplier));
}

export function findCandidates(
  species: Species, cp: number, multipliers: Multiplier[],
  filters: { level?: number; hp?: number; ivs?: Partial<IVs> } = {},
): Result<Candidate[]> {
  if (!Number.isInteger(cp) || cp < 10 || cp > 10000) {
    return { ok: false, error: { code: 'invalid-cp' } };
  }
  if (filters.hp !== undefined && (!Number.isInteger(filters.hp) || filters.hp < 10 || filters.hp > 1000)) {
    return { ok: false, error: { code: 'invalid-hp' } };
  }
  if (filters.level !== undefined && !multipliers.some((row) => row.level === filters.level)) {
    return { ok: false, error: { code: 'invalid-level' } };
  }
  for (const { key } of stats) {
    const value = filters.ivs?.[key];
    if (value !== undefined && (!Number.isInteger(value) || value < 0 || value > 15)) {
      return { ok: false, error: { code: 'invalid-iv', stat: key } };
    }
  }
  const byLevel = new Map(multipliers.map((row) => [row.level, row.multiplier]));
  if (!byLevel.has(25)) throw new Error('CP multiplier for purification level 25 is missing.');
  const candidates: Candidate[] = [];
  const levels = filters.level === undefined ? multipliers : multipliers.filter((row) => row.level === filters.level);
  for (const { level, multiplier } of levels) {
    if (combatPower(species, { attack: 0, defense: 0, stamina: 0 }, multiplier) > cp
      || combatPower(species, { attack: 15, defense: 15, stamina: 15 }, multiplier) < cp) continue;
    for (let attack = 0; attack <= 15; attack++) {
      if (filters.ivs?.attack !== undefined && attack !== filters.ivs.attack) continue;
      for (let defense = 0; defense <= 15; defense++) {
        if (filters.ivs?.defense !== undefined && defense !== filters.ivs.defense) continue;
        for (let stamina = 0; stamina <= 15; stamina++) {
          if (filters.ivs?.stamina !== undefined && stamina !== filters.ivs.stamina) continue;
          const ivs = { attack, defense, stamina };
          if (combatPower(species, ivs, multiplier) !== cp) continue;
          if (filters.hp !== undefined && hitPoints(species, ivs, multiplier) !== filters.hp) continue;
          const purified = purify(ivs);
          const purifiedMultiplier = byLevel.get(Math.max(25, level));
          if (purifiedMultiplier === undefined) throw new Error(`CP multiplier missing for level ${level}.`);
          candidates.push({ ivs, level, purifiedCP: combatPower(species, purified, purifiedMultiplier),
            purifiedHP: hitPoints(species, purified, purifiedMultiplier) });
        }
      }
    }
  }
  return { ok: true, value: candidates.sort((a, b) => ivPercent(b.ivs) - ivPercent(a.ivs) || a.level - b.level) };
}
