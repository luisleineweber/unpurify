export type AnalyticsConfig = { endpoint: string; privacyUrl: string };
type ConfigResult = { ok: true; value: AnalyticsConfig | null } | { ok: false; error: string };
export type UsageEvent =
  | { type: 'pokemon-search'; id: string; name: string }
  | { type: 'mode-change'; mode: 'simple' | 'advanced' };

export function readAnalyticsConfig(endpoint = '', privacyUrl = ''): ConfigResult {
  endpoint = endpoint.trim();
  privacyUrl = privacyUrl.trim();
  if (!endpoint && !privacyUrl) return { ok: true, value: null };
  if (!endpoint || !privacyUrl) {
    return { ok: false, error: 'Usage statistics need both VITE_GOATCOUNTER_ENDPOINT and VITE_PRIVACY_URL.' };
  }
  if (!URL.canParse(endpoint) || !URL.canParse(privacyUrl)) {
    return { ok: false, error: 'Usage statistics need valid collector and privacy notice URLs.' };
  }
  const collector = new URL(endpoint);
  const privacy = new URL(privacyUrl);
  if ([collector, privacy].some((url) => url.protocol !== 'https:' || url.username || url.password)) {
    return { ok: false, error: 'Usage statistics URLs must use HTTPS without credentials.' };
  }
  if (!collector.pathname.endsWith('/count') || collector.search || collector.hash) {
    return { ok: false, error: 'VITE_GOATCOUNTER_ENDPOINT must end in /count without a query or fragment.' };
  }
  return { ok: true, value: { endpoint: collector.href, privacyUrl: privacy.href } };
}

export function analyticsConsentKey(config: AnalyticsConfig): string {
  return `unpurify.analytics-consent.v1:${config.endpoint}`;
}

export async function sendUsageEvent(
  config: AnalyticsConfig | null, enabled: boolean, event: UsageEvent, send: typeof fetch = fetch,
): Promise<void> {
  if (!config || !enabled) return;
  const url = new URL(config.endpoint);
  const path = event.type === 'pokemon-search' ? `pokemon-search-${event.id}` : `mode-change-${event.mode}`;
  const title = event.type === 'pokemon-search' ? `Pokémon search: ${event.name}` : `Mode change: ${event.mode}`;
  url.search = new URLSearchParams({ p: path, t: title, e: 'true', ns: 'true' }).toString();
  try {
    const response = await send(url.href, {
      method: 'GET', credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store', keepalive: true,
    });
    if (!response.ok) {
      console.warn(`Could not send usage statistics: HTTP ${response.status}.`);
    }
  } catch (error) {
    console.warn('Could not send usage statistics.', error);
  }
}
