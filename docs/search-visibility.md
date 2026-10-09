# Google search visibility

## Required result

A GPT-6 Luna agent must start at google.com, choose a natural search for a
Pokémon GO purification calculator, and reach the public Unpurify page from
a search result. Do not supply the site name, address, or exact page title
to the agent. A brand search, `site:` query, direct visit, or local preview
does not meet this result.

## Status on 9 October 2026

The required result is still pending. The user approved a commit, push, and
release for the search changes. Publication alone does not establish the
required result.

- The public release is v1.0.0, published on 8 October 2026.
- Five initial GPT-6 Luna agents made nine natural searches. None reached
  Unpurify on the first result pages they checked.
- A further independent agent searched for
  `Pokémon GO Crypto Pokémon IV WP Erlösen Rechner`. It found GameInfo and
  other sites, then opened GameInfo. It did not find Unpurify.
- A separate `site:luisleineweber.github.io/unpurify` check returned no pages.
  This does not establish the full Google index status.
- The home page and German page return HTTP 200. The checked home response
  has no `noindex` meta tag or `X-Robots-Tag` header.
- Google Search Console is not set up. Its browser page requires sign-in.
- Existing usage-statistics changes belong to other work and were kept.

## Prepared code changes

- The generated initial HTML includes the existing guide and calculator
  instructions. These texts are available before JavaScript runs.
- Three visible questions cover perfect IVs, CP after purification, and
  keeping a Pokémon Shadow. The static HTML and React page use the same
  translations and question list.
- All six pages have ordinary language links in the body. React language
  selection uses the existing preference handler and keeps calculator inputs.
- The German title includes “Erlösen-Rechner”. English and German descriptions
  and introduction text name the calculation and the supported inputs.
- The build uses the English translation for its application description.

## Checks

- The focused page-generation test first failed because the initial HTML
  lacked the guide. It passes after the change.
- `npm test` in the local workspace: 34 tests passed.
- `npm run build`: TypeScript and production build passed.
- Localized release generation passed for all six languages.
- HTTP checks found one H1, three questions, six language links, and no
  unresolved mode template on each generated page.
- Browser checks at 390 and 1280 pixels found no horizontal overflow.
- Keyboard selection of a footer language link changed English to German
  and kept the entered IVs at 12/13/13.
- `git diff --check` passed.

## Release and follow-up

1. Sign in to Google Search Console in the shared browser.
2. Add the URL-prefix property `https://luisleineweber.github.io/unpurify/`.
   Obtain the HTML verification tag or file from Google. Add the exact supplied
   verification value to the release source; do not invent a value.
3. Publish the approved search changes. Review the
   complete current diff and keep unrelated user changes outside this release.
   Keep the existing release-only Pages workflow. Test and build the release tag.
4. Verify the property. Submit
   `https://luisleineweber.github.io/unpurify/sitemap.xml`. Inspect the home page
   and German page, then request indexing where appropriate.
5. Check the indexed page version before judging the code changes. Repeat an
   independent natural Google search test when Google serves the updated pages.
   Record the query, observed result position, clicked address, and screenshot.
6. Mark the required result complete only after the agent reaches Unpurify
   through an ordinary Google result.

Google controls crawl timing and search results. Repeated requests do not
make a page crawl sooner. Google states that crawling can take days or weeks.

References: [Google recrawl guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl),
[site search limits](https://developers.google.com/search/docs/monitor-debug/search-operators/all-search-site),
[JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
