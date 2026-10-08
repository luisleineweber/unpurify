const languageIds = { en: '9', de: '6', it: '8', es: '7', fr: '5', ja: '11' };

export function extractNames(csv, dexNumbers) {
  const rows = new Map();
  for (const line of csv.trim().split(/\r?\n/).slice(1)) {
    const [dex, languageId, name] = line.split(',');
    const language = Object.keys(languageIds).find((key) => languageIds[key] === languageId);
    if (!language) continue;
    const entry = rows.get(Number(dex)) ?? {};
    entry[language] = name;
    rows.set(Number(dex), entry);
  }
  const result = {};
  for (const dex of new Set(dexNumbers)) {
    const names = rows.get(dex);
    for (const language of Object.keys(languageIds)) {
      if (!names?.[language]?.trim()) throw new Error(`${language} name missing for species ${dex}.`);
    }
    result[dex] = names;
  }
  return result;
}
