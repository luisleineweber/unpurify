import { languages, languagePath } from '../i18n/language';
import { useLanguage } from '../i18n/LanguageProvider';

export function LanguageLinks() {
  const { language, setPreference, t } = useLanguage();
  return <nav className="language-links" aria-label={t('language')}>
    {languages.map(({ code, name }) => <a key={code} href={languagePath(code, import.meta.env.BASE_URL)}
      hrefLang={code} lang={code} aria-current={language === code ? 'page' : undefined}
      onClick={(event) => {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        setPreference(code);
      }}>{name}</a>)}
  </nav>;
}
