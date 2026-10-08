import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { languages, languagePath } from '../src/i18n/language.ts';
import { de } from '../src/i18n/locales/de.ts';
import { en } from '../src/i18n/locales/en.ts';
import { es } from '../src/i18n/locales/es.ts';
import { fr } from '../src/i18n/locales/fr.ts';
import { it } from '../src/i18n/locales/it.ts';
import { ja } from '../src/i18n/locales/ja.ts';

const generator = fileURLToPath(new URL('./generate-localized-pages.mjs', import.meta.url));
const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const messages = { de, en, es, fr, it, ja };

async function fixture(siteUrl) {
  const directory = await mkdtemp(join(tmpdir(), 'unpurify-pages-test-'));
  await mkdir(join(directory, 'dist'));
  const base = new URL(siteUrl).pathname;
  const template = source.replaceAll('%BASE_URL%', base).replace('<!-- seo-metadata -->',
    `<link rel="canonical" href="${siteUrl}" />\n<meta property="og:url" content="${siteUrl}" />\n<script type="application/ld+json">{}</script>`);
  await writeFile(join(directory, 'dist/index.html'), template);
  return { directory, template };
}

function generate(directory, siteUrl) {
  return spawnSync(process.execPath, ['--experimental-strip-types', generator], {
    cwd: directory, env: { ...process.env, VITE_SITE_URL: siteUrl }, encoding: 'utf8',
  });
}

for (const siteUrl of ['https://example.github.io/', 'https://example.github.io/unpurify/']) {
  test(`release pages contain six language links and correct metadata at ${siteUrl}`, async () => {
    const { directory } = await fixture(siteUrl);
    const result = generate(directory, siteUrl);
    assert.equal(result.status, 0, result.stderr);
    const base = new URL(siteUrl).pathname;
    for (const { code } of languages) {
      const path = code === 'en' ? 'index.html' : `${code}/index.html`;
      const html = await readFile(join(directory, 'dist', path), 'utf8');
      const pageUrl = new URL(languagePath(code, base), siteUrl).href;
      assert.ok(html.includes(`<html lang="${code}">`));
      assert.ok(html.includes(`href="${pageUrl}"`));
      assert.ok(html.includes(messages[code].heroFirst));
      assert.ok(html.includes(`${base}favicon.svg`));
      assert.equal((html.match(/hreflang=/g) ?? []).length, 7);
      for (const { code: alternate } of languages) {
        const alternateUrl = new URL(languagePath(alternate, base), siteUrl).href;
        assert.ok(html.includes(`hreflang="${alternate}" href="${alternateUrl}"`));
      }
      const data = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
      assert.equal(data.inLanguage, code);
      assert.equal(data.url, pageUrl);
      assert.equal(data.description, messages[code].pageDescription);
    }
    const sitemap = await readFile(join(directory, 'dist/sitemap.xml'), 'utf8');
    assert.equal((sitemap.match(/<loc>/g) ?? []).length, languages.length);
    for (const { code } of languages) {
      assert.ok(sitemap.includes(`<loc>${new URL(languagePath(code, base), siteUrl).href}</loc>`));
    }
    const robots = await readFile(join(directory, 'dist/robots.txt'), 'utf8');
    assert.ok(robots.includes(`Sitemap: ${siteUrl}sitemap.xml`));
  });
}

test('release generation reports a missing fallback marker before writing pages', async () => {
  const siteUrl = 'https://example.github.io/unpurify/';
  const { directory, template } = await fixture(siteUrl);
  const incomplete = template.replace('<!-- localized-fallback-start -->', '');
  await writeFile(join(directory, 'dist/index.html'), incomplete);
  const result = generate(directory, siteUrl);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Expected one localized fallback content/);
  assert.equal(await readFile(join(directory, 'dist/index.html'), 'utf8'), incomplete);
});
