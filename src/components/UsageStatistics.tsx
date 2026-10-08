import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageProvider';
import type { AnalyticsConfig } from '../lib/analytics';

type Props = {
  config: AnalyticsConfig | null;
  enabled: boolean;
  storageError: boolean;
  onChange: (enabled: boolean) => void;
};

export function UsageStatistics({ config, enabled, storageError, onChange }: Props) {
  const { t } = useLanguage();
  if (!config) return null;
  return <details id="usage-statistics" className="usage-statistics footer-note">
    <summary>{t('usageStatistics')}<ChevronDown size={16} aria-hidden="true" /></summary>
    <div className="usage-statistics-content">
      <p id="usage-statistics-description">{t('usageStatisticsDescription', { collector: new URL(config.endpoint).host })}</p>
      <a href={config.privacyUrl} target="_blank" rel="noreferrer">{t('usageStatisticsPrivacy')}</a>
      <label className="usage-statistics-choice">
        <input type="checkbox" checked={enabled} aria-describedby="usage-statistics-description"
          onChange={(event) => onChange(event.target.checked)} />
        <span>{t('shareUsageStatistics')}</span>
      </label>
      <p className="field-error" role="status">{storageError ? t('usageStatisticsStorageError') : ''}</p>
    </div>
  </details>;
}
