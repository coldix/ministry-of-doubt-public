# The Ministry of Doubt — Public Evidence Repository

> **Don't trust the Ministry. Check the Ministry.**

This is the public evidence and website repository for [The Ministry of Doubt](https://ministryofdoubt.com).

## What this repository is

The Ministry of Doubt applies structured, sceptical analysis to institutional claims — particularly claims made by government departments, agencies and public bodies. Cases are researched using a published protocol and documented in a way that allows any reader to verify, challenge or falsify the findings.

This repository contains:

- The public website source (`site/`)
- All structured evidence data for published and preview cases (`site/src/data/cases/`)
- The methodology documents (`method/`)
- Build and validation tooling (`scripts/`)
- CI configuration (`.github/workflows/`)

Raw research, private workshop material, draft notes, AI editorial reviews and unverified hypotheses are kept in a separate private workbench. The split is intentional: the public repository is the inspectable record; the private workbench is the workspace.

## Publication states

Cases carry one of three publication states. The distinction matters.

| State | Meaning |
|-------|---------|
| `draft` | Not yet ready for any public review. May not appear on the site at all. |
| `preview` | Research is substantive enough to invite challenge, but is not final. Included in preview builds; excluded from production builds. Pages carry `noindex`. |
| `public` | Editorially promoted to the public record. Included in all builds and indexed. |

Preview cases are deliberately published with `noindex` so readers can still inspect and challenge them, without the Ministry asserting they are the final word.

## Running locally

```sh
npm install
npm run dev
```

The dev server starts at `http://localhost:4321`. It runs in preview mode by default, so preview cases are visible.

## Building

Production build (excludes `preview` cases):

```sh
npm run build
```

Preview build (includes `preview` and `public` cases):

```sh
PUBLIC_SITE_MODE=preview npm run build
```

## Case validation

```sh
npm run case:validate
```

This validates all case JSON files against the expected schema.

## Method

The methodology documents live in `method/`. Start with `method/truth-protocol.md`.

The short version: claims are assessed against structured evidence. Each claim has an ID, a confidence rating, a supporting/contradicting ledger, and a falsification condition — a statement of what evidence would change the assessment. The Ministry is wrong when the ledger says it is.

## Challenging a claim

Open a GitHub issue. See `CONTRIBUTING.md` for the format.

## Licence

No open-source or content licence is granted. Public visibility is not permission to redistribute, republish or relicense any content in this repository. All content is copyright Colin Dixon / OZE unless otherwise stated.

Sources are cited for verification purposes. Reproduction of third-party material is limited to lawful quotation.
