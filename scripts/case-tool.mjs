#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const CASE_DIR = path.join(ROOT, "site", "src", "data", "cases");
const LEDGERS = new Set(["KNOWN", "PROBABLE", "POSSIBLE", "UNSUPPORTED", "UNKNOWN"]);
const PUBLICATION = new Set(["draft", "preview", "public"]);
const DATE_RE = /^\d{2}\/\d{2}\/\d{4}$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(message) {
  console.error(`\nCase tool error: ${message}\n`);
  process.exit(1);
}

function fileFor(slug) {
  return path.join(CASE_DIR, `${slug}.json`);
}

function loadCase(slug) {
  const file = fileFor(slug);
  if (!fs.existsSync(file)) fail(`No case data found for '${slug}' at ${path.relative(ROOT, file)}`);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${path.relative(ROOT, file)}: ${error.message}`);
  }
  return { file, data };
}

function caseFiles() {
  if (!fs.existsSync(CASE_DIR)) return [];
  return fs.readdirSync(CASE_DIR)
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.slice(0, -5))
    .sort();
}

function need(errors, condition, message) {
  if (!condition) errors.push(message);
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function uniqueIds(items = []) {
  const ids = items.map((item) => item?.id).filter(Boolean);
  return ids.length === new Set(ids).size;
}

function validateCase(data, expectedSlug) {
  const errors = [];

  need(errors, data && typeof data === "object", "case must be a JSON object");
  if (!data || typeof data !== "object") return errors;

  need(errors, nonEmpty(data.slug), "slug is required");
  need(errors, SLUG_RE.test(data.slug || ""), "slug must be lower-case kebab-case");
  need(errors, data.slug === expectedSlug, `slug '${data.slug}' must match filename '${expectedSlug}.json'`);
  need(errors, PUBLICATION.has(data.publication), "publication must be draft, preview or public");
  need(errors, nonEmpty(data.fileNo), "fileNo is required");
  need(errors, nonEmpty(data.title), "title is required");
  need(errors, nonEmpty(data.subtitle), "subtitle is required");
  need(errors, nonEmpty(data.chapter), "chapter is required");
  need(errors, nonEmpty(data.status), "status is required");
  need(errors, DATE_RE.test(data.lastReviewed || ""), "lastReviewed must be dd/mm/yyyy");
  need(errors, DATE_RE.test(data.evidenceCutoff || ""), "evidenceCutoff must be dd/mm/yyyy");

  need(errors, data.overall && typeof data.overall === "object", "overall assessment is required");
  if (data.overall) {
    need(errors, nonEmpty(data.overall.label), "overall.label is required");
    need(errors, LEDGERS.has(data.overall.ledger), `overall.ledger must be one of ${[...LEDGERS].join(", ")}`);
    need(errors, nonEmpty(data.overall.confidence), "overall.confidence is required");
    need(errors, nonEmpty(data.overall.summary), "overall.summary is required");
  }

  need(errors, Array.isArray(data.claims) && data.claims.length > 0, "at least one claim is required");
  need(errors, uniqueIds(data.claims), "claim IDs must be unique");
  need(errors, Array.isArray(data.sources) && data.sources.length > 0, "at least one source is required");
  need(errors, uniqueIds(data.sources), "source IDs must be unique");

  const sourceIds = new Set((data.sources || []).map((source) => source.id));
  for (const claim of data.claims || []) {
    const prefix = claim?.id || "claim?";
    need(errors, nonEmpty(claim?.id), "every claim needs an id");
    need(errors, nonEmpty(claim?.level), `${prefix}: level is required`);
    need(errors, LEDGERS.has(claim?.ledger), `${prefix}: invalid ledger '${claim?.ledger}'`);
    need(errors, nonEmpty(claim?.confidence), `${prefix}: confidence is required`);
    need(errors, nonEmpty(claim?.claim), `${prefix}: claim text is required`);
    need(errors, nonEmpty(claim?.why), `${prefix}: evidence note ('why') is required`);
    need(errors, Array.isArray(claim?.sourceIds) && claim.sourceIds.length > 0, `${prefix}: sourceIds must identify supporting evidence`);
    for (const sourceId of claim?.sourceIds || []) {
      need(errors, sourceIds.has(sourceId), `${prefix}: unknown sourceId '${sourceId}'`);
    }
  }

  for (const source of data.sources || []) {
    const prefix = source?.id || "source?";
    need(errors, nonEmpty(source?.id), "every source needs an id");
    need(errors, nonEmpty(source?.name), `${prefix}: name is required`);
    need(errors, nonEmpty(source?.kind), `${prefix}: kind is required`);
    need(errors, nonEmpty(source?.role), `${prefix}: role is required`);
    need(errors, nonEmpty(source?.independenceGroup), `${prefix}: independenceGroup is required`);
    if (data.publication === "public") {
      need(
        errors,
        nonEmpty(source?.url) || nonEmpty(source?.locator),
        `${prefix}: public cases require a url or precise locator`
      );
    }
  }

  for (const field of ["timeline", "hypotheses", "openQuestions", "wouldChange", "methodAudit", "changelog"]) {
    need(errors, Array.isArray(data[field]) && data[field].length > 0, `${field} must be a non-empty array`);
  }

  if (data.publication === "public") {
    need(errors, data.status.toLowerCase() !== "active research", "public cases cannot retain status 'Active research'");
  }

  return errors;
}

function validateOne(slug, quiet = false) {
  const { data } = loadCase(slug);
  const errors = validateCase(data, slug);
  if (errors.length) {
    if (!quiet) {
      console.error(`\n✗ ${slug}: ${errors.length} validation problem${errors.length === 1 ? "" : "s"}`);
      for (const error of errors) console.error(`  - ${error}`);
    }
    return { ok: false, errors, data };
  }
  if (!quiet) {
    console.log(`✓ ${slug}: valid (${data.publication}) — ${data.claims.length} claims, ${data.sources.length} sources`);
  }
  return { ok: true, errors: [], data };
}

const REGISTRY_FILE = path.join(ROOT, "site", "src", "data", "case-registry.json");
const LISTING = new Set(["preview", "public"]);

/**
 * The research index is public metadata about private dossiers, so it gets its
 * own guard: no unknown fields (which is how dossier text would leak in), and a
 * case cannot be listed publicly while its Evidence File is still preview-only.
 */
function validateRegistry() {
  if (!fs.existsSync(REGISTRY_FILE)) {
    console.log("• case registry: not generated (run npm run case:registry)");
    return;
  }

  let entries;
  try {
    entries = JSON.parse(fs.readFileSync(REGISTRY_FILE, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${path.relative(ROOT, REGISTRY_FILE)}: ${error.message}`);
  }

  const allowed = new Set(["slug", "title", "chapter", "difficulty", "research", "lastUpdated", "listing"]);
  const errors = [];
  const pending = [];
  const seen = new Set();

  for (const entry of entries) {
    const prefix = entry?.slug || "entry?";
    need(errors, SLUG_RE.test(entry?.slug || ""), `${prefix}: slug must be lower-case kebab-case`);
    need(errors, !seen.has(entry?.slug), `${prefix}: duplicate registry entry`);
    seen.add(entry?.slug);
    need(errors, nonEmpty(entry?.title), `${prefix}: title is required`);
    need(errors, LISTING.has(entry?.listing), `${prefix}: listing must be preview or public`);
    for (const key of Object.keys(entry || {})) {
      need(errors, allowed.has(key), `${prefix}: unexpected field '${key}' — the index carries metadata only`);
    }

    // A case may be listed publicly while its Evidence File is still preview:
    // the index row then reads "in preparation" and carries no link. What must
    // never happen is a link to a page the build did not generate, and the
    // tracker template decides that from the built slugs, not from this file.
    const caseFile = fileFor(entry?.slug || "");
    if (entry?.listing === "public" && fs.existsSync(caseFile)) {
      const data = JSON.parse(fs.readFileSync(caseFile, "utf8"));
      if (data.publication !== "public") {
        pending.push(`${prefix} (evidence file ${data.publication})`);
      }
    }
  }

  if (errors.length) {
    console.error(`\n✗ case registry: ${errors.length} problem${errors.length === 1 ? "" : "s"}`);
    for (const error of errors) console.error(`  - ${error}`);
    fail("case registry failed validation");
  }

  const publicCount = entries.filter((entry) => entry.listing === "public").length;
  console.log(`✓ case registry: ${entries.length} researched cases (${publicCount} public, ${entries.length - publicCount} preview-only)`);
  if (pending.length) {
    console.log(`  listed without a published evidence file: ${pending.join(", ")}`);
  }
}

function validateAll() {
  const slugs = caseFiles();
  if (!slugs.length) fail("No case JSON files found");
  let failed = 0;
  for (const slug of slugs) if (!validateOne(slug).ok) failed += 1;
  if (failed) fail(`${failed} case file${failed === 1 ? "" : "s"} failed validation`);
  validateRegistry();
  console.log(`\nAll ${slugs.length} case file${slugs.length === 1 ? "" : "s"} valid.`);
}

function setPublication(slug, state) {
  if (!PUBLICATION.has(state)) fail("publication state must be draft, preview or public");
  const { file, data } = loadCase(slug);
  const previous = data.publication;
  data.publication = state;
  const errors = validateCase(data, slug);
  if (errors.length) {
    console.error(`\nCannot set ${slug} to '${state}':`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`✓ ${slug}: publication ${previous} → ${state}`);
}

function newCase(slug, title) {
  if (!SLUG_RE.test(slug || "")) fail("new case slug must be lower-case kebab-case");
  const file = fileFor(slug);
  if (fs.existsSync(file)) fail(`${slug}.json already exists`);
  const now = new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date());
  const template = {
    fileNo: "TBD",
    slug,
    publication: "draft",
    title: title || slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
    subtitle: "TBD",
    chapter: "TBD",
    status: "Draft data",
    lastReviewed: now,
    evidenceCutoff: now,
    overall: { label: "Assessment pending", ledger: "UNKNOWN", confidence: "Very low", summary: "TBD" },
    claims: [{ id: "C1", level: "Object", ledger: "UNKNOWN", confidence: "Very low", claim: "TBD", why: "TBD", sourceIds: ["S1"] }],
    timeline: [{ date: "TBD", event: "TBD", effect: "TBD" }],
    hypotheses: [{ id: "H1", title: "TBD", status: "Open", text: "TBD", test: "TBD" }],
    independence: ["TBD"],
    openQuestions: ["TBD"],
    wouldChange: ["TBD"],
    sources: [{ id: "S1", name: "TBD", kind: "TBD", role: "TBD", independenceGroup: "TBD" }],
    methodAudit: [{ name: "Grammar", note: "TBD" }],
    changelog: [{ date: now, change: "Case data scaffold created." }]
  };
  fs.writeFileSync(file, `${JSON.stringify(template, null, 2)}\n`);
  console.log(`✓ Created ${path.relative(ROOT, file)} as draft`);
}

const [command = "validate", arg1 = "all", arg2] = process.argv.slice(2);

switch (command) {
  case "validate":
    if (arg1 === "all") validateAll();
    else if (!validateOne(arg1).ok) process.exit(1);
    break;
  case "set-publication":
    if (!arg1 || !arg2) fail("usage: case-tool set-publication <slug> <draft|preview|public>");
    setPublication(arg1, arg2);
    break;
  case "new":
    if (!arg1 || arg1 === "all") fail("usage: case-tool new <slug> [title]");
    newCase(arg1, arg2);
    break;
  case "list":
    for (const slug of caseFiles()) {
      const { data } = loadCase(slug);
      console.log(`${slug}\t${data.publication}\t${data.overall?.ledger || "?"}\t${data.title || ""}`);
    }
    break;
  default:
    fail(`unknown command '${command}'`);
}
