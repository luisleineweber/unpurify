import { useId } from 'react';
import { Flame, Heart, MoveRight, Shield, Sparkles, Star, Sword } from 'lucide-react';
import { appraisal, ivPercent, purify, stats } from '../lib/pokemon';
import type { IVs, Result } from '../lib/pokemon';
import { useLanguage } from '../i18n/LanguageProvider';

function Rating({ ivs }: { ivs: IVs }) {
  const { t } = useLanguage();
  const rating = appraisal(ivs);
  const label = [t('stars0'), t('stars1'), t('stars2'), t('stars3'), t('stars4')][rating];
  return <div className={`star-rating ${rating === 4 ? 'perfect' : ''}`} aria-label={t('rating', { rating: label })}>
    {[0, 1, 2].map((star) => <Star key={star} size={17} fill={rating > star ? 'currentColor' : 'none'}
      className={rating <= star ? 'empty-star' : ''} aria-hidden="true" />)}
    <span>{label}</span>
  </div>;
}

function StatBars({ ivs, purified, before }: { ivs: IVs; purified?: boolean; before?: IVs }) {
  const { t } = useLanguage();
  return <div className="result-bars">{stats.map(({ key }) => {
    const Icon = { attack: Sword, defense: Shield, stamina: Heart }[key];
    return <div className="result-stat" key={key}>
      <div className="result-stat-label"><span><Icon size={14} aria-hidden="true" />{t(key)}</span>
        <span><b>{ivs[key]}</b><span className="stat-max"> / 15</span>
          {before && <small className="gain">+{ivs[key] - before[key]}</small>}</span></div>
      <div className="segment-bar" aria-hidden="true">{Array.from({ length: 15 }, (_, index) =>
        <i key={index} className={index < ivs[key] ? purified ? 'segment-purified' : 'segment-shadow' : ''} />)}</div>
    </div>;
  })}</div>;
}

export function Comparison({ ivs, cp }: { ivs: IVs; cp?: { before: number; after: number; level: number } }) {
  const { t, number, percent: formatPercent } = useLanguage();
  const headingId = useId();
  const purified = purify(ivs);
  const percent = ivPercent(ivs);
  const afterPercent = ivPercent(purified);
  return <section className="comparison" aria-labelledby={headingId}>
    <div className="panel-heading result-heading"><h2 id={headingId}>{t('result')}</h2></div>
    <div className="comparison-cards">
      <div className="pokemon-result shadow-result">
        <span className="state-label"><Flame size={15} aria-hidden="true" />{t('shadow')}</span>
        <div className="iv-percent">{formatPercent(percent)}<span>%</span></div>
        <Rating ivs={ivs} />
        <StatBars ivs={ivs} />
        <div className="result-footnote">{cp ? t('cpLevel', { cp: number(cp.before), level: number(cp.level) }) : t('ivPoints', { total: number(ivs.attack + ivs.defense + ivs.stamina) })}</div>
      </div>
      <span className="comparison-arrow" aria-hidden="true"><MoveRight size={26} strokeWidth={1.8} /></span>
      <div className="pokemon-result purified-result">
        <span className="state-label"><Sparkles size={15} aria-hidden="true" />{t('purified')}</span>
        <div className="iv-percent">{formatPercent(afterPercent)}<span>%</span></div>
        <Rating ivs={purified} />
        <StatBars ivs={purified} purified before={ivs} />
        <div className="result-footnote">
          <div>{cp ? t('cpLevel', { cp: number(cp.after), level: number(Math.max(25, cp.level)) }) : t('ivPoints', { total: number(purified.attack + purified.defense + purified.stamina) })}</div>
          <div className="iv-gain"><span>{t('ivGain')}</span><strong>{t('percentagePoints', { gain: formatPercent(afterPercent - percent) })}</strong></div>
        </div>
      </div>
    </div>
  </section>;
}

export function CompactResult({ result }: { result: Result<IVs> }) {
  const { t, percent: formatPercent, errorText } = useLanguage();
  if (!result.ok) return <section className="compact-result compact-result-error" aria-label={t('ivResult')}>
    <h3>{t('checkIVs')}</h3><p>{errorText(result.error)}</p>
  </section>;
  const purified = purify(result.value);
  const gain = formatPercent(ivPercent(purified) - ivPercent(result.value));
  return <section className="compact-result" aria-label={t('ivComparison')}>
    <div className="compact-result-card shadow-result">
      <span className="state-label"><Flame size={14} aria-hidden="true" />{t('shadow')}</span>
      <div className="iv-percent">{formatPercent(ivPercent(result.value))}<span>%</span></div>
      <Rating ivs={result.value} />
    </div>
    <span className="compact-result-arrow" aria-hidden="true"><MoveRight size={20} strokeWidth={1.8} /></span>
    <div className="compact-result-card purified-result">
      <span className="state-label"><Sparkles size={14} aria-hidden="true" />{t('purified')}</span>
      <div className="iv-percent">{formatPercent(ivPercent(purified))}<span>%</span></div>
      <div className="sr-only"><Rating ivs={purified} /></div>
      <div className="compact-iv-gain" title={`${t('ivGain')}: ${t('percentagePoints', { gain })}`}>
        <span aria-hidden="true">{t('percentagePointsShort', { gain })}</span>
        <span className="sr-only">{t('ivGain')}: {t('percentagePoints', { gain })}</span>
      </div>
    </div>
  </section>;
}
