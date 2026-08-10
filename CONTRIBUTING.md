# Contributing — How to Challenge a Claim

The Ministry of Doubt welcomes challenges. That is the point.

If a finding is wrong, the methodology requires updating the evidence ledger. A sourced challenge that changes the ledger is how the Ministry corrects itself.

## How to challenge a claim

Open a GitHub issue. Title it clearly (e.g. `[Robodebt] Challenge: Claim RD-C-04`).

Include:

- **Case ID** — the case being challenged (e.g. `robodebt`)
- **Claim ID** — the specific claim ID from the case JSON (e.g. `RD-C-04`)
- **Disputed statement** — quote the exact claim text you are challenging
- **Your evidence** — the source(s) you are relying on
- **Why it changes the claim** — explain the logical connection between your evidence and the disputed statement
- **Proposed ledger change** (optional) — if you believe the confidence level or ledger entry should change, say so and explain why

**Unsourced allegations are not evidence.** A source must be named and checkable. "I know someone who said" is not sufficient. Official documents, court records, primary reporting and on-the-record statements carry the most weight.

**Disagreement is welcome; abuse is not.** Challenges to claims are encouraged. Personal attacks on individuals named in cases, or on the researchers, are not acceptable and will be closed.

## Preview cases

Cases with `publication: preview` are deliberately available for challenge even though they are not final. Preview cases carry `noindex` and are excluded from production builds, but they can still receive issue reports. That is partly why they are published at preview stage.

## Correcting evidence or source data

If you believe a source has been miscited, misquoted, or that a source URL is wrong, open a GitHub issue with the correction and a link to the correct source.

If you want to submit a pull request for an evidence correction:

- Keep PRs small and focused — one claim at a time
- Cite your source in the PR description
- Do not change publication state (`draft` / `preview` / `public`) in a PR — publication decisions are editorial
- The case validator (`npm run case:validate`) must pass

## What this repository is not for

- Unsourced allegations about individuals
- Complaints about the Ministry's methodology that do not engage with the published protocol (challenge the protocol in `method/truth-protocol.md` if you think it is wrong)
- Requests to suppress findings without evidence
- General political commentary
