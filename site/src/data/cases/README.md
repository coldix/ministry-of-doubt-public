# Evidence File data

One JSON file per reader-facing case.

The generic Astro route at `site/src/pages/cases/[slug].astro` renders these files. Do not create a case-specific `.astro` page.

Core requirements are enforced by `scripts/case-tool.mjs`:

- `publication`: `draft`, `preview`, or `public`
- Claim Ledger values: `KNOWN`, `PROBABLE`, `POSSIBLE`, `UNSUPPORTED`, `UNKNOWN`
- claims must name supporting `sourceIds`
- sources must carry an `independenceGroup`
- `public` sources must provide a direct `url` or precise `locator`

The private research dossier under `docs/cases/` remains the canonical working record. This directory contains only the curated projection intended for web presentation.
