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

- The public release is v1.0.1, published on 9 October 2026 at 11:32 UTC.
  Its commit is `5ae114736f3945ba80e4a0404cb6a31b863e802f`.
  [The release deployment](https://github.com/luisleineweber/unpurify/actions/runs/37924397854)
  passed. The first release, v1.0.0, was published on 8 October 2026.
- Five initial GPT-6 Luna agents made nine natural searches. None reached
  Unpurify on the first result pages they checked.
- A further independent agent searched for
  `Pokémon GO Crypto Pokémon IV WP Erlösen Rechner`. It found GameInfo and
  other sites, then opened GameInfo. It did not find Unpurify.
- After v1.0.1 deployed, a new independent GPT-6 Luna agent started on
  google.com and made these three natural searches:
  `Pokémon GO Crypto-Pokémon IV Rechner WP nach Erlösung`,
  `Pokémon GO Crypto Rechner mögliche IV nach Erlösung WP`, and
  `Crypto Pokémon Rechner IV WP Shadow gereinigt`.
  It opened GameInfo and QPin from the results, rather than Unpurify. It
  observed QPin's Shadow/Geläutert inputs but did not run a calculation.
  No CAPTCHA appeared. Exact result positions were not recorded.
  The final Google screenshot is
  `C:\Users\llein\.t3\userdata\browser-artifacts\browser-screenshot-www-google-com-mv0w4isk-2057e5bc.png`.
- A separate `site:luisleineweber.github.io/unpurify` check returned no pages.
  This does not establish the full Google index status.
- The home page and German page return HTTP 200. The checked home response
  has no `noindex` meta tag or `X-Robots-Tag` header.
- The user signed in to Google Search Console. The URL-prefix property for
  `https://luisleineweber.github.io/unpurify/` was added. Google supplied an
  HTML verification tag, which was added to `index.html`. Verification is
  pending a release of that tag.
- Existing usage-statistics changes belong to other work and were kept.

## Published code changes

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
- The exact v1.0.1 tag was exported to a separate source directory. A fresh
  dependency install, all 33 release tests, production build, and six-language
  page generation passed before the push and release.
- After deployment, all six public pages returned HTTP 200 with three
  questions and six language links in their initial HTML. The sitemap returned
  HTTP 200 with six URLs. No unresolved mode template was found.
- On the public page, keyboard selection of the English footer link changed
  German to English and kept the entered IVs at 12/13/13.

## Release and follow-up

1. Completed: the user signed in to Google Search Console in the shared browser.
2. Completed: add the URL-prefix property
   `https://luisleineweber.github.io/unpurify/` and Google's exact HTML tag to
   `index.html`. Keep the tag in future releases to maintain verification.
3. Completed: publish the approved search changes as v1.0.1. The complete diff
   was reviewed, unrelated user changes stayed outside the release, and the
   exact release tag passed tests and build. The release-only Pages workflow
   deployed the site successfully.
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
