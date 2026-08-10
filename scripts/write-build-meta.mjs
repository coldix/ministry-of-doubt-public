#!/usr/bin/env node
// Write build identity for the footer (git SHA + Melbourne timestamp).
// Runs as part of `npm run build`/`npm run dev` so every deploy is stamped.
// Mirrors the electiontracker.au stamp format: YYYYMMDD.HHMM-aest+sha
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const outDir = join(repoRoot, "site", "src", "generated");
const outFile = join(outDir, "build-meta.json");

function sh(cmd) {
  try {
    return execSync(cmd, { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

const now = new Date();
const TZ = "Australia/Melbourne";

const human = new Intl.DateTimeFormat("en-AU", {
  timeZone: TZ,
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
  timeZoneName: "short",
}).format(now);

const parts = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})
  .formatToParts(now)
  .reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});

// "GMT+11:00" → the label the stamp suffix uses (aest/aedt is decided by the tz name)
const tzLabel =
  new Intl.DateTimeFormat("en-AU", { timeZone: TZ, timeZoneName: "short" })
    .formatToParts(now)
    .find((p) => p.type === "timeZoneName")?.value ?? "AEST";

const sha = sh("git rev-parse --short=7 HEAD") || "unknown";
const shaFull = sh("git rev-parse HEAD") || null;
const branch = sh("git rev-parse --abbrev-ref HEAD") || null;
const dirty = Boolean(sh("git status --porcelain"));

// Date-based version, not semver: this is a research artefact, not an app release.
const ymd = `${parts.year}${parts.month}${parts.day}`;
const hm = `${parts.hour}${parts.minute}`;
const version = `${ymd}.${hm}-${tzLabel.toLowerCase()}+${sha}${dirty ? "-dirty" : ""}`;

const meta = {
  version,
  git_sha: sha,
  git_sha_full: shaFull,
  git_branch: branch,
  git_dirty: dirty,
  site_mode: process.env.PUBLIC_SITE_MODE || "production",
  built_at_utc: now.toISOString(),
  built_at_local: human,
  built_at_local_compact: `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`,
  timezone: TZ,
};

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, JSON.stringify(meta, null, 2) + "\n");

// Also served publicly so a deploy can be identified with curl.
const publicDir = join(repoRoot, "site", "public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "build-meta.json"), JSON.stringify(meta, null, 2) + "\n");

console.log(`build-meta: ${version} (${human}) [${meta.site_mode}]`);
