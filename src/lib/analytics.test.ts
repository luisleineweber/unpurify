import assert from 'node:assert/strict';
import test from 'node:test';
import { analyticsConsentKey, readAnalyticsConfig, sendUsageEvent } from './analytics.ts';
import type { AnalyticsConfig } from './analytics.ts';

const config: AnalyticsConfig = {
  endpoint: 'https://counter.example/count', privacyUrl: 'https://unpurify.example/privacy',
};

test('statistics stay disabled without configuration and reject incomplete or unsafe URLs', () => {
  assert.deepEqual(readAnalyticsConfig(), { ok: true, value: null });
  assert.deepEqual(readAnalyticsConfig('  ', '  '), { ok: true, value: null });
  assert.deepEqual(readAnalyticsConfig(config.endpoint, config.privacyUrl), { ok: true, value: config });
  const invalid = [
    [config.endpoint, ''], ['', config.privacyUrl], ['not a URL', config.privacyUrl],
    ['http://counter.example/count', config.privacyUrl], [config.endpoint, 'http://unpurify.example/privacy'],
    ['https://secret:token@counter.example/count', config.privacyUrl],
    ['https://counter.example/count?token=secret', config.privacyUrl],
    ['https://counter.example/count#secret', config.privacyUrl],
    ['https://counter.example/api', config.privacyUrl],
  ];
  for (const [endpoint, privacyUrl] of invalid) assert.equal(readAnalyticsConfig(endpoint, privacyUrl).ok, false);
});

test('consent belongs to one collector and cannot transfer to a new collector', () => {
  assert.notEqual(analyticsConsentKey(config), analyticsConsentKey({ ...config, endpoint: 'https://other.example/count' }));
});

test('no request leaves the browser without configuration and explicit consent', async () => {
  let requests = 0;
  const send: typeof fetch = async () => { requests++; return new Response(); };
  const event = { type: 'mode-change', mode: 'advanced' } as const;
  await sendUsageEvent(null, true, event, send);
  await sendUsageEvent(config, false, event, send);
  assert.equal(requests, 0);
});

test('search events contain only the canonical species and event flags', async () => {
  const requests: { url: URL; options: RequestInit | undefined }[] = [];
  const send: typeof fetch = async (input, options) => {
    requests.push({ url: new URL(String(input)), options });
    return new Response();
  };
  const pokemon = {
    type: 'pokemon-search' as const, id: '79-GALARIAN', name: 'Galarian Slowpoke',
    cp: 900, hp: 49, ivs: [13, 13, 13], level: 25, query: 'typed search text',
  };
  await sendUsageEvent(config, true, pokemon, send);
  assert.equal(requests.length, 1);
  const { url, options } = requests[0];
  assert.equal(url.origin + url.pathname, config.endpoint);
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    p: 'pokemon-search-79-GALARIAN', t: 'Pokémon search: Galarian Slowpoke', e: 'true', ns: 'true',
  });
  assert.equal(options?.credentials, 'omit');
  assert.equal(options?.referrerPolicy, 'no-referrer');
  assert.equal(options?.cache, 'no-store');
});

test('each submitted event gets a fresh request, including repeated searches', async () => {
  const events: string[] = [];
  const send: typeof fetch = async (input) => {
    const url = new URL(String(input));
    assert.equal(url.searchParams.get('ns'), 'true');
    events.push(url.searchParams.get('p')!);
    return new Response();
  };
  await sendUsageEvent(config, true, { type: 'mode-change', mode: 'advanced' }, send);
  const pokemon = { type: 'pokemon-search', id: '150', name: 'Mewtwo' } as const;
  await sendUsageEvent(config, true, pokemon, send);
  await sendUsageEvent(config, true, pokemon, send);
  assert.deepEqual(events, ['mode-change-advanced', 'pokemon-search-150', 'pokemon-search-150']);
});

test('collector failures stay visible and do not interrupt the calculator', async (context) => {
  const warning = context.mock.method(console, 'warn', () => {});
  await sendUsageEvent(config, true, { type: 'mode-change', mode: 'simple' }, async () => new Response(null, { status: 503 }));
  await sendUsageEvent(config, true, { type: 'mode-change', mode: 'simple' }, async () => { throw new Error('offline'); });
  assert.equal(warning.mock.callCount(), 2);
  assert.match(String(warning.mock.calls[0].arguments[0]), /HTTP 503/);
  assert.match(String(warning.mock.calls[1].arguments[0]), /Could not send usage statistics/);
});
