import assert from 'node:assert/strict';
import test from 'node:test';
import { detectLanguage, languageFromPathname, languagePath, languages, resolveLanguage } from './language.ts';

test('browser language detection respects order and regional tags', () => {
  assert.equal(detectLanguage(['it-IT', 'de-DE']), 'it');
  assert.equal(detectLanguage(['pt-BR', 'es-MX', 'en-US']), 'es');
  assert.equal(detectLanguage(['fr-CA']), 'fr');
  assert.equal(detectLanguage(['JA-jp']), 'ja');
  assert.equal(detectLanguage(['de-AT']), 'de');
});

test('English is the default when no browser language is supported', () => {
  assert.equal(detectLanguage(['pt-BR', 'ko']), 'en');
  assert.equal(detectLanguage([]), 'en');
});

test('a saved choice takes priority and automatic mode uses the browser', () => {
  assert.equal(resolveLanguage('en', ['de-DE']), 'en');
  assert.equal(resolveLanguage('ja', ['de-DE']), 'ja');
  assert.equal(resolveLanguage('auto', ['de-DE']), 'de');
  assert.equal(resolveLanguage(null, ['fr-FR']), 'fr');
  assert.equal(resolveLanguage('unknown', ['it-IT']), 'it');
});

test('language paths match the generated pages for project and root sites', () => {
  for (const base of ['/', '/unpurify/', '/unpurify']) {
    const root = base.endsWith('/') ? base : `${base}/`;
    assert.equal(languagePath(null, base), root);
    for (const { code } of languages) {
      const path = languagePath(code, base);
      assert.equal(path, code === 'en' ? root : `${root}${code}/`);
      assert.equal(languageFromPathname(path, base), code === 'en' ? null : code);
    }
  }
});

test('language paths do not match unsupported languages or another site', () => {
  assert.equal(languageFromPathname('/unpurify/pt/', '/unpurify/'), null);
  assert.equal(languageFromPathname('/another/de/', '/unpurify/'), null);
  assert.equal(languageFromPathname('/unpurify-other/de/', '/unpurify/'), null);
});
