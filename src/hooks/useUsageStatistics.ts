import { useEffect, useState } from 'react';
import { analyticsConsentKey, readAnalyticsConfig, sendUsageEvent } from '../lib/analytics';
import type { Species } from '../lib/pokemon';

const configured = readAnalyticsConfig(import.meta.env.VITE_GOATCOUNTER_ENDPOINT, import.meta.env.VITE_PRIVACY_URL);
if (!configured.ok) throw new Error(configured.error);
const config = configured.value;
const storageKey = config ? analyticsConsentKey(config) : null;

function readConsent() {
  if (!storageKey) return { enabled: false, storageError: false };
  try {
    return { enabled: localStorage.getItem(storageKey) === 'true', storageError: false };
  } catch (error) {
    console.warn('Could not read the usage statistics choice.', error);
    return { enabled: false, storageError: true };
  }
}

export function useUsageStatistics() {
  const [settings, setSettings] = useState(readConsent);
  useEffect(() => {
    if (!storageKey) return;
    const sync = (event: StorageEvent) => {
      if (event.storageArea === localStorage && (event.key === storageKey || event.key === null)) {
        setSettings(readConsent());
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  function setEnabled(enabled: boolean) {
    if (!storageKey) return;
    let storageError = false;
    try {
      localStorage.setItem(storageKey, String(enabled));
    } catch (error) {
      storageError = true;
      console.warn('Could not save the usage statistics choice.', error);
    }
    setSettings({ enabled, storageError });
  }

  const enabled = settings.enabled && import.meta.env.PROD;
  return {
    ...settings, config, setEnabled,
    trackSearch: ({ id, name }: Pick<Species, 'id' | 'name'>) => {
      void sendUsageEvent(config, enabled, { type: 'pokemon-search', id, name });
    },
    trackModeChange: (mode: 'simple' | 'advanced') => {
      void sendUsageEvent(config, enabled, { type: 'mode-change', mode });
    },
  };
}
