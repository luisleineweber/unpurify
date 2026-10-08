import { useMemo, useState } from 'react';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import speciesData from '../data/pokemon.json';
import multiplierData from '../data/multipliers.json';
import { findCandidates, stats } from '../lib/pokemon';
import type { CalculationError, Candidate, IVs, Result, Species, StatKey } from '../lib/pokemon';
import { PokemonSelect } from './PokemonSelect';
import { CandidateResults } from './CandidateResults';
import { useLanguage } from '../i18n/LanguageProvider';
import { findSpecies, speciesName } from '../i18n/species';

const species = speciesData as Species[];
type SearchResult = { species: Species; cp: number; candidates: Candidate[] };

export function AdvancedCalculator({ onSearch }: { onSearch: (species: Pick<Species, 'id' | 'name'>) => void }) {
  const { t, language, number, errorText } = useLanguage();
  const [query, setQuery] = useState(() => ({ text: speciesName(species.find(({ id }) => id === '150')!, language), language }));
  const [cp, setCP] = useState('900');
  const [level, setLevel] = useState('');
  const [hp, setHP] = useState('');
  const [knownIVs, setKnownIVs] = useState<Record<StatKey, string>>({ attack: '', defense: '', stamina: '' });
  const [result, setResult] = useState<Result<SearchResult> | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [limit, setLimit] = useState(12);
  const selectedSpecies = useMemo(() => findSpecies(query.text, species, query.language), [query]);
  const pokemon = selectedSpecies ? speciesName(selectedSpecies, language) : query.text;

  function invalidate() { setResult(null); setErrorField(null); setSelected(null); setLimit(12); }
  function showError(error: CalculationError) {
    const field = error.code === 'invalid-iv' ? `known-${error.stat}` : {
      'invalid-species': 'pokemon-search', 'invalid-cp': 'cp', 'invalid-hp': 'hp', 'invalid-level': 'level',
    }[error.code];
    setResult({ ok: false, error }); setErrorField(field);
    const input = document.getElementById(field);
    const details = input?.closest('details');
    if (details) details.open = true;
    input?.focus();
  }
  function calculate(event: React.FormEvent) {
    event.preventDefault();
    setSelected(null); setErrorField(null); setLimit(12);
    if (!selectedSpecies) {
      showError({ code: 'invalid-species' });
      return;
    }
    const ivs: Partial<IVs> = {};
    for (const { key } of stats) if (knownIVs[key] !== '') ivs[key] = Number(knownIVs[key]);
    const found = findCandidates(selectedSpecies, Number(cp), multiplierData, {
      level: level === '' ? undefined : Number(level), hp: hp === '' ? undefined : Number(hp), ivs,
    });
    if (!found.ok) {
      showError(found.error);
      return;
    }
    setResult({ ok: true, value: { species: selectedSpecies, cp: Number(cp), candidates: found.value } });
    if (found.ok && found.value.length === 1) setSelected(found.value[0]);
    onSearch(selectedSpecies);
  }

  return <>
    <section className="advanced-panel panel" aria-labelledby="advanced-heading">
      <div className="panel-heading"><h2 id="advanced-heading">{t('advancedHeading')}</h2></div>
      <p className="panel-description">{t('advancedDescription')}</p>
      <form onSubmit={calculate} noValidate>
        <div className="advanced-main-fields">
          <PokemonSelect key={language} species={species} value={pokemon} invalid={errorField === 'pokemon-search'}
            onChange={(text) => { setQuery({ text, language }); invalidate(); }} />
          <div className="form-field"><label htmlFor="cp">{t('cpLabel')}</label>
            <input id="cp" type="number" inputMode="numeric" min="10" max="10000" step="1" required value={cp}
              aria-invalid={errorField === 'cp'} aria-describedby={errorField === 'cp' ? 'advanced-error' : undefined}
              onChange={(event) => { setCP(event.target.value); invalidate(); }} /></div>
          <div className="form-field"><label htmlFor="hp">{t('maxHP')} <span className="optional-label">{t('optional')}</span></label>
            <input id="hp" type="number" inputMode="numeric" min="10" max="1000" step="1" placeholder={t('unknown')} value={hp}
              aria-invalid={errorField === 'hp'} aria-describedby={errorField === 'hp' ? 'hp-help advanced-error' : 'hp-help'}
              onChange={(event) => { setHP(event.target.value); invalidate(); }} />
            <p className="field-hint input-hint" id="hp-help">{t('hpHint')}</p>
          </div>
        </div>
        <p className="field-hint" id="species-help">{t('speciesHint')}</p>
        <details className="advanced-filters"><summary><SlidersHorizontal size={16} aria-hidden="true" />{t('narrowSearch')}<ChevronDown size={16} aria-hidden="true" /></summary>
          <div className="filter-grid"><div className="form-field"><label htmlFor="level">{t('pokemonLevel')}</label>
            <select id="level" value={level} aria-invalid={errorField === 'level'} aria-describedby={errorField === 'level' ? 'advanced-error' : undefined}
              onChange={(event) => { setLevel(event.target.value); invalidate(); }}>
              <option value="">{t('unknownLevel')}</option>{multiplierData.map((entry) => <option key={entry.level} value={entry.level}>{t('levelValue', { level: number(entry.level) })}</option>)}
            </select></div>
          </div>
          <div className="filter-grid known-ivs">{stats.map(({ key }) => <div className="form-field" key={key}>
            <label htmlFor={`known-${key}`}>{t('statIV', { stat: t(key) })}</label><input id={`known-${key}`} type="number" inputMode="numeric"
              min="0" max="15" step="1" placeholder="0–15" value={knownIVs[key]}
              aria-invalid={errorField === `known-${key}`} aria-describedby={errorField === `known-${key}` ? 'advanced-error' : undefined}
              onChange={(event) => {
                setKnownIVs((current) => ({ ...current, [key]: event.target.value })); invalidate();
              }} /></div>)}</div>
          <p className="field-hint">{t('filtersHint')}</p>
        </details>
        <button className="primary-button" type="submit"><Search size={17} aria-hidden="true" />{t('calculate')}</button>
      </form>
      <div className="advanced-notice"><span className="info-symbol">i</span><p>{t('cpNotice')}</p></div>
      <div className="sr-only" role="status">{result?.ok ? t('matchesFound', { count: number(result.value.candidates.length) }) : ''}</div>
      {result && !result.ok && <p className="field-error" id="advanced-error" role="alert">{errorText(result.error)}</p>}
    </section>
    {result?.ok && <CandidateResults species={result.value.species} cp={result.value.cp} candidates={result.value.candidates}
      selected={selected} limit={limit} onSelect={setSelected} onShowMore={() => setLimit((current) => current + 24)} />}
  </>;
}
