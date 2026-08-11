# Repository scripts

These operate on the public/preview projection only. They never publish private research dossiers from `docs/`.

## `case-tool.mjs` — Evidence File data

Validates and manages the structured case data under `site/src/data/cases/`, and validates the research index.

```bash
npm run case:validate                       # all cases + the registry
npm run case:list                           # slug, publication, ledger, title
npm run case:new <slug> [title]             # scaffold a new case as draft
npm run case:publication <slug> <state>     # draft | preview | public
```

Public cases face stricter rules than preview ones: every source needs a URL or precise locator, and the case cannot still be status "Active research". Registry checks reject duplicate slugs, invalid listings and **unexpected fields** — that last one is the guard against dossier text creeping into public data.

## `registry-sync.mjs` — research index

Generates `site/src/data/case-registry.json` from `docs/cases/_index.md` and each dossier's header block.

```bash
npm run case:registry
```

Reads **index metadata only**: slug, title, chapter, difficulty, status, last-updated date. Never dossier body content. The date's parenthetical (`2026-08-10 (pass 3: …)`) is stripped, since it describes which research pass ran. Titles come from each dossier's H1 rather than the registry table, which carries working shorthand.

Cases with no dossier are skipped — nothing researched, nothing to list.

`DEFAULT_LISTING` at the top of the file decides what a newly seen case gets. It is currently `"public"` (show every researched case). Set it to `"preview"` to hold new cases back to the research preview. Either way, a listing already in the registry is preserved, so a case pinned to `"preview"` by hand stays hidden.

## `write-build-meta.mjs` — build identity

Writes `site/src/generated/build-meta.json` (imported by the footer) and `site/public/build-meta.json` (served, so a deploy can be identified with `curl`).

```bash
npm run build:meta
```

Version format matches electiontracker.au: `YYYYMMDD.HHMM-aest+sha`, Melbourne time, with `-dirty` when the working tree has uncommitted changes.

## Build wiring

`prebuild` and `predev` in `package.json` run registry sync → case validation → build stamp, so every build path (local, `deploy`, `deploy:research-preview`, CI) regenerates the index rather than shipping a stale one.
