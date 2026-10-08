import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { languages } from '../src/i18n/language.ts';
import { de } from '../src/i18n/locales/de.ts';
import { en } from '../src/i18n/locales/en.ts';
import { es } from '../src/i18n/locales/es.ts';
import { fr } from '../src/i18n/locales/fr.ts';
import { it } from '../src/i18n/locales/it.ts';
import { ja } from '../src/i18n/locales/ja.ts';

const configuredSiteUrl = process.env.VITE_SITE_URL;
if (!configuredSiteUrl) {
  throw new Error('VITE_SITE_URL must contain the GitHub Pages site URL.');
}

const site = new URL(configuredSiteUrl);
if (site.protocol !== 'https:') {
  throw new Error('VITE_SITE_URL must use HTTPS.');
}

const sitePath = site.pathname.replace(/\/+$/, '');
const siteRoot = `${site.origin}${sitePath}/`;
const messagesByLanguage = { de, en, es, fr, it, ja };
const openGraphLocales = {
  de: 'de_DE',
  en: 'en_US',
  es: 'es_ES',
  fr: 'fr_FR',
  it: 'it_IT',
  ja: 'ja_JP',
};
const noScriptText = {
  de: 'Aktiviere JavaScript, um den Rechner zu verwenden.',
  en: 'Enable JavaScript to use the calculator.',
  es: 'Activa JavaScript para usar la calculadora.',
  fr: 'Activez JavaScript pour utiliser le calculateur.',
  it: 'Attiva JavaScript per usare il calcolatore.',
  ja: '計算ツールを使うにはJavaScriptを有効にしてください。',
};

const localePages = languages.map(({ code }) => {
  const messages = messagesByLanguage[code];
  if (!messages) throw new Error(`Missing translation data for ${code}.`);
  const url = code === 'en' ? siteRoot : new URL(`${code}/`, siteRoot).href;
  return { code, messages, url };
});
const rootUrl = siteRoot;
const alternates = [
  ...localePages.map(({ code, url }) => `<link rel="alternate" hreflang="${code}" href="${url}" />`),
  `<link rel="alternate" hreflang="x-default" href="${rootUrl}" />`,
].join('\n');

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function replaceOnce(html, pattern, replacement, label) {
  let count = 0;
  const output = html.replace(pattern, (...args) => {
    count += 1;
    return typeof replacement === 'function' ? replacement(...args) : replacement;
  });
  if (count !== 1) throw new Error(`Expected one ${label} in the built index, found ${count}.`);
  return output;
}

function fallbackMarkup(messages, language) {
  return `<!-- localized-fallback-start -->
      <main>
        <h1 id="page-title">${escapeHtml(messages.heroFirst)}<br />${escapeHtml(messages.heroSecond)}</h1>
        <p>${escapeHtml(messages.intro)}</p>
        <noscript><p>${escapeHtml(noScriptText[language])}</p></noscript>
      </main>
      <!-- localized-fallback-end -->`;
}

function createLocalizedHtml(template, locale) {
  const { code, messages, url } = locale;
  let html = template;
  html = replaceOnce(html, /<html lang="[^"]*">/, `<html lang="${code}">`, 'html language');
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${escapeHtml(messages.pageTitle)}</title>`, 'title');
  html = replaceOnce(html, /<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(messages.pageDescription)}" />`, 'description');
  html = replaceOnce(html, /<meta property="og:locale" content="[^"]*"\s*\/>/, `<meta property="og:locale" content="${openGraphLocales[code]}" />`, 'Open Graph locale');
  html = replaceOnce(html, /<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(messages.pageTitle)}" />`, 'Open Graph title');
  html = replaceOnce(html, /<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(messages.pageDescription)}" />`, 'Open Graph description');
  html = replaceOnce(html, /<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />\n${alternates}`, 'canonical URL');
  html = replaceOnce(html, /<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`, 'Open Graph URL');

  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Unpurify',
    url,
    description: messages.pageDescription,
    inLanguage: code,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  });
  html = replaceOnce(
    html,
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${structuredData}</script>`,
    'structured data',
  );
  html = replaceOnce(
    html,
    /<!-- localized-fallback-start -->[\s\S]*?<!-- localized-fallback-end -->/,
    fallbackMarkup(messages, code),
    'localized fallback content',
  );
  return html;
}

const template = await readFile('dist/index.html', 'utf8');
for (const locale of localePages) {
  const outputPath = locale.code === 'en' ? 'dist/index.html' : `dist/${locale.code}/index.html`;
  if (locale.code !== 'en') await mkdir(`dist/${locale.code}`, { recursive: true });
  await writeFile(outputPath, createLocalizedHtml(template, locale), 'utf8');
}

const sitemapEntries = localePages.map(({ url }) => `  <url><loc>${url.replaceAll('&', '&amp;')}</loc></url>`).join('\n');
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>
`, 'utf8');
await writeFile('dist/robots.txt', `User-agent: *
Allow: /
Sitemap: ${siteRoot}sitemap.xml
`, 'utf8');
