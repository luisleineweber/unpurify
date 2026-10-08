export const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'ja', name: '日本語' },
] as const;

export type Language = typeof languages[number]['code'];
export type LanguagePreference = Language | 'auto';
export const languageStorageKey = 'unpurify.language';

export function isLanguage(value: string): value is Language {
  return languages.some(({ code }) => code === value);
}

export function languageFromPathname(pathname: string, baseUrl: string): Language | null {
  const rootPath = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  if (!pathname.startsWith(rootPath)) return null;
  const pathLanguage = pathname.slice(rootPath.length).split('/')[0];
  return pathLanguage && isLanguage(pathLanguage) ? pathLanguage : null;
}

export function languagePath(language: Language | null, baseUrl: string): string {
  const rootPath = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return language && language !== 'en' ? `${rootPath}${language}/` : rootPath;
}

export function detectLanguage(browserLanguages: readonly string[]): Language {
  for (const tag of browserLanguages) {
    const code = tag.toLowerCase().split('-')[0];
    if (isLanguage(code)) return code;
  }
  return 'en';
}

export function resolveLanguage(preference: string | null, browserLanguages: readonly string[]): Language {
  return preference !== null && isLanguage(preference) ? preference : detectLanguage(browserLanguages);
}
