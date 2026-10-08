import { Check, ChevronDown } from 'lucide-react';
import { ivPercent, purify } from '../lib/pokemon';
import type { Candidate, Species } from '../lib/pokemon';
import { Comparison } from './Comparison';
import { useLanguage } from '../i18n/LanguageProvider';
import { speciesName } from '../i18n/species';
import { purificationCostMessage } from '../i18n/translate';

type Props = {
  species: Species;
  cp: number;
  candidates: Candidate[];
  selected: Candidate | null;
  limit: number;
  onSelect: (candidate: Candidate) => void;
  onShowMore: () => void;
};

export function CandidateResults({ species, cp, candidates, selected, limit, onSelect, onShowMore }: Props) {
  const { t, language, number, percent } = useLanguage();
  return <section className="candidate-panel panel" aria-labelledby="candidates-heading">
    <div className="panel-heading"><h2 id="candidates-heading">{t('possibleResults', { count: number(candidates.length) })}</h2><span className="muted">{speciesName(species, language)}</span></div>
    {candidates.length === 0 ? <p className="empty-result">{t('noResults')}</p> : <>
      <p className="panel-description" id="candidate-help">{t('selectHint')}</p>
      <fieldset className="candidate-list" aria-describedby="candidate-help">
        <legend className="sr-only">{t('selectCombination')}</legend>
        {candidates.slice(0, limit).map((candidate) => {
          const isSelected = selected === candidate;
          const { attack, defense, stamina } = candidate.ivs;
          return <div key={`${candidate.level}-${attack}-${defense}-${stamina}`}
            className={`candidate-option ${isSelected ? 'candidate-selected' : ''}`}>
            <label className="candidate-choice">
              <input type="radio" name="iv-candidate" checked={isSelected} onChange={() => onSelect(candidate)}
                aria-label={t('selectCandidate', { level: number(candidate.level), attack, defense, stamina })} />
              <span className="candidate-ivs"><span className="candidate-value">{attack} / {defense} / {stamina}</span><span className="candidate-caption">{t('ivLabels')}</span></span>
              <span className="candidate-metric"><span className="candidate-caption">{t('level')}</span><span className="candidate-value">{number(candidate.level)}</span></span>
              <span className="candidate-metric"><span className="candidate-caption">{t('shadowIVs')}</span><span className="candidate-value">{percent(ivPercent(candidate.ivs))} %</span></span>
              <span className="candidate-metric purified-cell"><span className="candidate-caption">{t('purifiedIVs')}</span><span className="candidate-value">{percent(ivPercent(purify(candidate.ivs)))} %</span></span>
              <span className="candidate-metric"><span className="candidate-caption">{t('cpAfter')}</span><span className="candidate-value">{number(candidate.purifiedCP)}</span></span>
              <span className="candidate-selection" aria-hidden="true">{isSelected ? <Check size={18} /> : <ChevronDown size={18} />}</span>
            </label>
            {isSelected && <div className="candidate-detail">
              <p className="candidate-detail-heading"><Check size={15} aria-hidden="true" />{t('selectedCombination')}<span>{t('hpAfter', { hp: number(candidate.purifiedHP) })}</span></p>
              <Comparison ivs={candidate.ivs} cp={{ before: cp, after: candidate.purifiedCP, level: candidate.level }} />
            </div>}
          </div>;
        })}
      </fieldset>
      {limit < candidates.length && <button type="button" className="secondary-button" onClick={onShowMore}>{t('showMore')}</button>}
      <p className="field-hint">{purificationCostMessage(species.dust, species.candy, language)}</p>
    </>}
  </section>;
}
