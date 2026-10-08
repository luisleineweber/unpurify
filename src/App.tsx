import { useState } from 'react';
import { ArrowUpRight, BookOpen, ChevronDown, CircleHelp, RotateCcw, Search, SlidersHorizontal, Sparkles, Swords, Zap } from 'lucide-react';
import { CompactResult, Comparison } from './components/Comparison';
import { StatInput } from './components/StatInput';
import { AdvancedCalculator } from './components/AdvancedCalculator';
import { LanguageSelect } from './components/LanguageSelect';
import { UsageStatistics } from './components/UsageStatistics';
import { useLanguage } from './i18n/LanguageProvider';
import { useUsageStatistics } from './hooks/useUsageStatistics';
import { ivPercent, purify, readIVs, stats } from './lib/pokemon';
import type { StatKey } from './lib/pokemon';
import sources from './data/sources.json';

const initialValues = { attack: '13', defense: '13', stamina: '13' };

export default function App() {
  const { t, language, percent, errorText, storageError } = useLanguage();
  const usageStatistics = useUsageStatistics();
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [values, setValues] = useState<Record<StatKey, string>>(initialValues);
  const [helpOpen, setHelpOpen] = useState(false);
  const result = readIVs(values);
  const announcement = result.ok ? t('announcement', { before: percent(ivPercent(result.value)), after: percent(ivPercent(purify(result.value))) }) : t('checkIVs');

  function changeMode(next: 'simple' | 'advanced') {
    if (next === mode) return;
    setMode(next);
    usageStatistics.trackModeChange(next);
  }

  return <>
    <a className="skip-link" href="#calculator">{t('skipLink')}</a>
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#" className="brand" aria-label={t('home')}><img className="brand-symbol" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width="36" height="36" /><span>unpurify<span className="brand-dot">.</span></span></a>
        <div className="header-controls"><nav aria-label={t('navigation')}><a className="nav-active" href="#calculator">{t('calculator')}</a><a href="#how-it-works">{t('howItWorks')}</a></nav><LanguageSelect /></div>
      </div>
    </header>
    <main>
      {storageError && <p className="field-error" role="status">{t('storageError')}</p>}
      <section className="intro" aria-labelledby="page-title">
        <div className="intro-content">
          <h1 id="page-title">{t('heroFirst')}<br />{t('heroSecond')}</h1>
          <p>{t('intro')}</p>
        </div>
        <div className="pokemon-scene" aria-hidden="true"><div className="scene-orbit orbit-one" /><div className="scene-orbit orbit-two" />
          <div className="scene-glow" /><span className="scene-spark spark-one">✧</span><span className="scene-spark spark-two">✧</span>
          <img src={`${import.meta.env.BASE_URL}assets/gengar.png`} alt="" width="330" height="330" fetchPriority="high" />
        </div>
      </section>

      <section className="calculator-section" id="calculator" aria-label={t('calculator')}>
        <div className="calculator-toolbar"><div className="mode-switch" aria-label={t('mode')}>
          <button type="button" className={mode === 'simple' ? 'active' : ''} aria-pressed={mode === 'simple'} onClick={() => changeMode('simple')}><SlidersHorizontal size={16} aria-hidden="true" />{t('enterIVs')}</button>
          <button type="button" className={mode === 'advanced' ? 'active' : ''} aria-pressed={mode === 'advanced'} onClick={() => changeMode('advanced')}><Search size={16} aria-hidden="true" />{t('pokemonCP')}</button>
        </div></div>

        <div className="calculator-grid" hidden={mode !== 'simple'}>
          <section className="input-panel panel" aria-labelledby="input-heading"><div className="panel-heading"><h2 id="input-heading">{t('yourIVs')}</h2><div className="input-actions">
            <button type="button" className="icon-button mobile-reset" onClick={() => setValues({ attack: '0', defense: '0', stamina: '0' })} aria-label={t('resetAll')}><RotateCcw size={17} /></button>
            <button type="button" className={`icon-button ${helpOpen ? 'help-active' : ''}`} aria-label={t('ivHelp')} aria-expanded={helpOpen}
              aria-controls="iv-instructions" onClick={() => setHelpOpen((current) => !current)}><CircleHelp size={18} /></button></div></div>
            <p className="panel-description" id="iv-help">{t('inputDescription')}</p>
            <CompactResult result={result} />
            {helpOpen && <div className="iv-instructions" id="iv-instructions">{t('instructions')}</div>}
            <div className="stat-inputs">{stats.map(({ key }) => <StatInput key={key} stat={key} label={t(key)}
              value={values[key]} onChange={(value) => setValues((current) => ({ ...current, [key]: value }))} />)}</div>
            <div className="input-panel-bottom">
              <button type="button" className="reset-button" onClick={() => setValues({ attack: '0', defense: '0', stamina: '0' })} aria-label={t('resetAll')}><RotateCcw size={14} />{t('reset')}</button></div>
          </section>
          {result.ok ? <Comparison ivs={result.value} /> : <section className="comparison invalid-result"><CircleHelp size={30} /><h2>{t('checkValues')}</h2><p>{errorText(result.error)}</p></section>}
          <div className="sr-only" role="status">{announcement}</div>
        </div><div className="advanced-layout" hidden={mode !== 'advanced'}><AdvancedCalculator onSearch={usageStatistics.trackSearch} /></div>
      </section>

      <section className="guide-section" id="how-it-works" aria-labelledby="guide-heading">
        <div className="guide-heading"><h2 id="guide-heading">{t('guideTitle')}</h2></div>
        <div className="guide-grid">
          <article className="guide-item"><span className="guide-icon violet"><Sparkles size={21} aria-hidden="true" /></span><div><h3>{t('ivGainTitle')}</h3><p>{t('ivGainDescription')}</p></div></article>
          <article className="guide-item"><span className="guide-icon blue"><Zap size={21} aria-hidden="true" /></span><div><h3>{t('levelTitle')}</h3><p>{t('levelDescription')}</p></div></article>
          <article className="guide-item"><span className="guide-icon amber"><Swords size={21} aria-hidden="true" /></span><div><h3>{t('shadowTitle')}</h3><p>{t('shadowDescription')}</p></div></article>
        </div>
        <details className="more-details"><summary><BookOpen size={16} aria-hidden="true" />{t('detailsTitle')}<ChevronDown size={16} aria-hidden="true" /></summary>
          <div className="details-content"><p>{t('movesDescription')}</p>
            <p>{t('costsDescription')}</p>
            <p>{t('battleDescription')}</p>
            <a href={`https://niantic.helpshift.com/hc/${language}/6-pokemon-go/faq/2396-shadow-pokemon-purified-pokemon/`} target="_blank" rel="noreferrer">{t('pokemonHelp')} <ArrowUpRight size={14} aria-hidden="true" /></a>
          </div></details>
      </section>
    </main>
    <footer className="site-footer"><div className="site-footer-inner">
      <span className="footer-brand"><img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width="28" height="28" /><span>unpurify<span className="brand-dot">.</span></span></span>
      <div className="footer-right"><span>{t('gameData', { date: new Intl.DateTimeFormat(language).format(new Date(`${sources.updated}T12:00:00`)) })}</span><a href={sources.gameMaster} target="_blank" rel="noreferrer">{t('dataSource')} <ArrowUpRight size={14} aria-hidden="true" /></a><a href="https://github.com/luisleineweber/unpurify" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} aria-hidden="true" /></a></div>
      <p className="footer-note">{t('credits')} <a href="https://wiki.pokemoncentral.it/Gengar" target="_blank" rel="noreferrer">Pokémon Central</a>. <a href={`${import.meta.env.BASE_URL}privacy.html`}>{t('usageStatisticsPrivacy')}</a>.</p>
      <UsageStatistics config={usageStatistics.config} enabled={usageStatistics.enabled}
        storageError={usageStatistics.storageError} onChange={usageStatistics.setEnabled} />
      </div>
    </footer>
  </>;
}
