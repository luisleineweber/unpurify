import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readAnalyticsConfig } from './src/lib/analytics.ts';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');
  const analytics = readAnalyticsConfig(env.VITE_GOATCOUNTER_ENDPOINT, env.VITE_PRIVACY_URL);
  if (!analytics.ok) throw new Error(analytics.error);
  const basePath = env.VITE_BASE_PATH?.replace(/^\/+|\/+$/g, '');
  const base = basePath ? `/${basePath}/` : '/';
  const siteUrl = env.VITE_SITE_URL?.replace(/\/+$/, '');
  const description = 'Compare Shadow Pokémon IVs before and after purification. Calculate purified CP and find possible IV combinations from species and CP.';
  const structuredData = siteUrl ? JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Unpurify',
    url: `${siteUrl}/`,
    description,
    inLanguage: ['en', 'de', 'it', 'es', 'fr', 'ja'],
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }) : '';
  const seoHead = siteUrl
    ? `<link rel="canonical" href="${siteUrl}/" />\n<meta property="og:url" content="${siteUrl}/" />\n<script type="application/ld+json">${structuredData}</script>`
    : '';
  const seoPlugin: Plugin = {
    name: 'seo-metadata',
    transformIndexHtml(html) {
      return html.replace('<!-- seo-metadata -->', seoHead);
    },
  };

  return { base, plugins: [react(), seoPlugin] };
});
