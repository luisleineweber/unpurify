import { ArrowRight, Heart, Shield, Sword } from 'lucide-react';
import type { StatKey } from '../lib/pokemon';
import { useLanguage } from '../i18n/LanguageProvider';

const icons = { attack: Sword, defense: Shield, stamina: Heart };

export function StatInput({ stat, label, value, onChange }: {
  stat: StatKey; label: string; value: string; onChange: (value: string) => void;
}) {
  const { t } = useLanguage();
  const Icon = icons[stat];
  const valid = /^\d+$/.test(value) && Number(value) <= 15;
  const amount = valid ? Number(value) : 0;
  return (
    <div className={`stat-input ${stat}`}>
      <div className="stat-input-heading">
        <label htmlFor={stat}><Icon size={17} aria-hidden="true" />{label}</label>
        <div className="number-wrap">
          <input id={stat} name={stat} type="number" inputMode="numeric" min="0" max="15" step="1"
            value={value} onChange={(event) => onChange(event.target.value)}
            aria-invalid={!valid} aria-describedby={!valid ? `${stat}-error` : 'iv-help'} />
          <span aria-hidden="true">/ 15</span>
          <span className="purified-stat-preview">
            <ArrowRight size={14} aria-hidden="true" />
            <output aria-label={t('statAfter', { stat: label })} htmlFor={stat}>{valid ? Math.min(15, amount + 2) : '—'}</output>
          </span>
        </div>
      </div>
      <input className="iv-slider" aria-label={t('statSlider', { stat: label })} type="range" min="0" max="15" step="1"
        value={amount} onChange={(event) => onChange(event.target.value)}
        style={{ '--fill': `${amount / 15 * 100}%` } as React.CSSProperties} />
      <div className="range-labels" aria-hidden="true"><span>0</span><span>5</span><span>10</span><span>15</span></div>
      {!valid && <p className="field-error" id={`${stat}-error`}>{t('invalidIV')}</p>}
    </div>
  );
}
