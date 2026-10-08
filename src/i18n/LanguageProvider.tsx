import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { isLanguage, languageFromPathname, languagePath, languageStorageKey, resolveLanguage } from './language';
import type { Language, LanguagePreference } from './language';
import { createTranslator, errorMessage, formatNumber, formatPercent } from './translate';
import type { Translator } from './translate';
import type { CalculationError } from '../lib/pokemon';

type Settings = { preference: LanguagePreference; storageError: boolean };
type LanguageContextValue = Settings & {
  language: Language;
  setPreference: (preference: LanguagePreference) => void;
  t: Translator;
  number: (value: number) => string;
  percent: (value: number) => string;
  errorText: (error: CalculationError) => string;
};
const LanguageContext = createContext<LanguageContextValue | null>(null);
const browserLanguages = () => navigator.languages.length ? navigator.languages : [navigator.language];

function readSettings(): Settings {
  try {
    const saved = localStorage.getItem(languageStorageKey);
    return { preference: saved !== null && isLanguage(saved) ? saved : 'auto', storageError: false };
  } catch (error) {
    console.warn('Could not read the saved language choice.', error);
    return { preference: 'auto', storageError: true };
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(readSettings);
  const [browser, setBrowser] = useState(browserLanguages);
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const pathLanguage = languageFromPathname(pathname, import.meta.env.BASE_URL);
  const language = pathLanguage ?? resolveLanguage(settings.preference, browser);
  const preference = pathLanguage ?? settings.preference;
  const t = useMemo(() => createTranslator(language), [language]);

  useEffect(() => {
    const update = () => setBrowser(browserLanguages());
    window.history.replaceState({ ...window.history.state, languagePreference: preference }, '');
    const navigate = (event: PopStateEvent) => {
      setPathname(window.location.pathname);
      const previous = event.state?.languagePreference;
      if (previous === 'auto' || (typeof previous === 'string' && isLanguage(previous))) {
        setSettings((current) => ({ ...current, preference: previous }));
      }
    };
    const sync = (event: StorageEvent) => {
      if (event.key === languageStorageKey || event.key === null) setSettings(readSettings());
    };
    window.addEventListener('languagechange', update);
    window.addEventListener('storage', sync);
    window.addEventListener('popstate', navigate);
    return () => {
      window.removeEventListener('languagechange', update);
      window.removeEventListener('storage', sync);
      window.removeEventListener('popstate', navigate);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('pageTitle');
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('pageDescription'));
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', t('pageTitle'));
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', t('pageDescription'));
    const ogLocale = { en: 'en_US', de: 'de_DE', it: 'it_IT', es: 'es_ES', fr: 'fr_FR', ja: 'ja_JP' }[language];
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', ogLocale);
    const siteUrl = import.meta.env.VITE_SITE_URL;
    if (siteUrl) {
      const canonicalUrl = new URL(pathLanguage && pathLanguage !== 'en' ? `${pathLanguage}/` : '', `${siteUrl.replace(/\/+$/, '')}/`).href;
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
      const structuredData = document.querySelector('script[type="application/ld+json"]');
      if (structuredData?.textContent) {
        const data = JSON.parse(structuredData.textContent);
        structuredData.textContent = JSON.stringify({ ...data, url: canonicalUrl, description: t('pageDescription'), inLanguage: language });
      }
    }
  }, [language, pathLanguage, t]);

  function setPreference(preference: LanguagePreference) {
    let storageError = false;
    try {
      if (preference === 'auto') localStorage.removeItem(languageStorageKey);
      else localStorage.setItem(languageStorageKey, preference);
    } catch (error) {
      storageError = true;
      console.warn('Could not save the language choice.', error);
    }
    const destination = languagePath(preference === 'auto' ? null : preference, import.meta.env.BASE_URL);
    const state = { ...window.history.state, languagePreference: preference };
    if (destination !== window.location.pathname) {
      window.history.pushState(state, '', `${destination}${window.location.search}${window.location.hash}`);
      setPathname(destination);
    } else window.history.replaceState(state, '');
    setSettings({ preference, storageError });
  }

  return <LanguageContext value={{ ...settings, preference, language, setPreference, t,
    number: (value) => formatNumber(value, language), percent: (value) => formatPercent(value, language),
    errorText: (error) => errorMessage(error, language) }}>{children}</LanguageContext>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === null) throw new Error('useLanguage requires a LanguageProvider.');
  return context;
}
