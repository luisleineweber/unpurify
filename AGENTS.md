# Unpurify

This project is a Pokémon GO purification calculator. It uses React,
TypeScript, and Vite. The simple mode compares appraisal IVs before and after
purification. The advanced mode finds possible IV combinations from species
and CP. Species, CP multipliers, and purification rules are stored locally.

Run `npm run dev` for the local page. Run `npm test` for calculation and language checks.
Run `npm run build` to check TypeScript and make the production build.
Run `npm run data:update` to update the source data.

Support English, German, Italian, Spanish, French, and Japanese. Use the first
supported browser language unless the user saved a choice. Use English when
no browser language is supported. Keep translated text in `src/i18n/locales`.
Keep calculation code in `src/lib` and interface code in `src/components`.
Do not infer one IV combination from CP alone. Publish GitHub Pages only from
published GitHub releases. Build the release tag and run the tests first.
Preserve unrelated changes. Do not commit, push, or publish unless requested.
