# Unpurify

A Pokémon GO purification calculator. Built with React, TypeScript,
and Vite. The dark interface uses local fonts and Gengar artwork.

[Open Unpurify](https://luisleineweber.github.io/unpurify/).

## Run

```sh
npm install
npm run dev
```

Open http://localhost:5173. Use `npm test` for calculation and language checks.
Use `npm run build` for the production build in `dist`.

## Languages

The interface and Pokémon names support English, German, Italian, Spanish,
French, and Japanese. The app uses the first supported browser language.
Regional settings such as `es-MX` use the matching language. The default is
English when the browser has no supported language.

The header shows the selected language and six country choices. Select a
language to save your choice in the browser. Browser language detection runs
without a visible automatic option.

A language change keeps your input values, Pokémon choice, and calculation
results. Opening a localized page uses that page's language.

Keep interface text in `src/i18n/locales`. Each language must have all message
keys and the same template values. Tests check the messages, number formats,
language selection, and names for every stored Pokémon form.

## Calculator

- Simple mode accepts the three appraisal IVs, from 0 to 15. It shows the
  IV percentage, appraisal, and each value before and after purification.
  On mobile, the live result stays above the controls when you scroll.
  Each control also shows its value after purification. Short screens omit
  the large page title to keep the result and all three controls in view.
- Advanced mode searches standard and regional forms from the game data.
  Species and CP alone can match several IV combinations. Optional level,
  maximum HP, and known IV filters narrow the results. Select a result to
  see the full comparison, new CP, and purification costs.
- Purification adds 2 to each IV, up to 15. It raises the Pokémon to at least
  level 25 and keeps higher levels. CP uses the normal game formula. The
  Shadow damage bonus does not change displayed CP.
- The search checks half levels 1–50. It does not include the Best Buddy
  level boost. Species with Shadow settings can appear in the data before
  release. The list does not claim current encounter availability.
- Calculation runs locally. Optional usage statistics send a Pokémon ID and
  name only after a visitor enables them. CP, HP, IVs, levels, filters, and
  typed search text stay in the browser.

## Optional usage statistics

This project's hosted collector is
`https://unpurify.goatcounter.com/count`. The
[dashboard](https://unpurify.goatcounter.com/) is private. Optional visitor
details are disabled in the account settings.

The [privacy notice](https://luisleineweber.github.io/unpurify/privacy.html)
is in English. It covers hosting, browser preferences, optional statistics,
contact details, and visitor rights.

Usage statistics are disabled by default. The app uses GoatCounter's public
`/count` endpoint. It sends no events on page load or while you type. Each
valid advanced search sends `pokemon-search-{id}`, including searches with
no matching IV combination. Each switch to another calculator mode sends
`mode-change-simple` or `mode-change-advanced`. Repeated searches count
separately. The Pokémon ID includes its form and stays the same in every
language. The event title uses the name from the local game data.

To enable statistics:

1. Create a hosted [GoatCounter site](https://www.goatcounter.com/).
2. In GoatCounter's **Settings > Data collection**, disable visitor details
   such as browsers, systems, locations, languages, screen sizes, sessions,
   and individual pageviews. Keep only event totals.
3. Publish a privacy notice for this site. Explain the purpose, consent,
   collector, connection data, retention, and how to withdraw consent.
   Include the site operator's identity and contact details. Review the
   provider's role and any required data processing agreement before use.
4. In GitHub **Settings > Secrets and variables > Actions > Variables**, set
   `GOATCOUNTER_ENDPOINT` to `https://unpurify.goatcounter.com/count` and
   `PRIVACY_URL` to the HTTPS URL of your site's privacy notice.
5. Include this change in the next published release. The release workflow
   supplies both values to the build. These URLs are public, not API keys.

Both values are required. A partial or invalid setup stops the build.
Leave both variables unset to keep statistics disabled. A self-hosted
GoatCounter instance can use the same `/count` endpoint setting.

When configured, **Usage statistics** appears in the footer. Visitors must
enable the checkbox before the app sends any event. They can clear it there
at any time. The browser saves only the consent choice, with no user ID.
Changing the collector address requires a new consent choice. Consent
changes also apply to other open tabs on the same site.

The app sends events directly and does not load an external tracking script.
Requests omit cookies and referrer information. They include the event name
and title, plus the event and count flags. The collector still receives IP
addresses and HTTP headers. GoatCounter's server settings control which
visitor details it stores; client code cannot replace those settings.
See [GoatCounter's privacy policy](https://www.goatcounter.com/help/privacy)
and the [German privacy authorities' guidance](https://www.datenschutzkonferenz-online.de/media/oh/OH_Digitale_Dienste.pdf).

For a local setup, copy `.env.example` to `.env.local` and set both values.
Development mode never sends events. Use a production build and preview to
check the integration. Ad blockers can prevent events, so totals represent
the events received from visitors who enabled statistics.

## Data and assets

Run `npm run data:update` to rebuild the local dataset. The update stops with
an error if the expected source fields are missing.

- [PokeMiners Game Master](https://github.com/PokeMiners/game_masters) provides
  base stats, supported forms, purification costs, and CP multipliers above
  level 45.
- [PoGo API](https://pogoapi.net/documentation/) provides the CP multipliers
  through level 45. Above level 40, half levels use the mean of the adjacent
  integer multipliers. Integer values from the Game Master use float32 precision.
- [PokeAPI](https://github.com/PokeAPI/pokeapi) provides species names in all
  six languages. `npm run data:update` also updates `src/data/names.json`.
- [Pokémon GO Help](https://niantic.helpshift.com/hc/en/6-pokemon-go/faq/2396-shadow-pokemon-purified-pokemon/)
  explains Shadow bonuses, purification, and Return.
- [Pokémon Central](https://wiki.pokemoncentral.it/Gengar) provides the Gengar
  artwork. Pokémon and its characters belong to their rights holders.
- Manrope and Outfit fonts ship locally through Fontsource under the SIL
  Open Font License. Their license files are included in their packages.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` publishes the site only when
a GitHub release is published. It checks out that release tag, installs the
locked packages, runs the tests, and builds the site. A push to the default
branch does not publish the site.

It uses the base path supplied by GitHub, so project pages and user or custom
domains use the correct asset paths. The build creates an English page at the
site root and localized pages at `/de/`, `/es/`, `/fr/`, `/it/`, and `/ja/`.
Each page has its own title, description, canonical URL, language links, and
structured data. The build also creates `sitemap.xml` and `robots.txt`. The
language menu links to each page. Browser language selection still works on
the root page.

Before the first deployment, set **Settings > Pages > Build and deployment >
Source** to **GitHub Actions**.

No commit or public deployment is part of this local build.
