import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const failures = [];

const locales = {
  ca: {
    label: "CA",
    expectedText:
      "Forma part de GUIAPINEDA i fes que més persones et trobin. Ja pots afegir-hi la teva activitat de manera clara i senzilla.",
    obsoleteText: "Estem preparant",
    title: "Tens un comerç o ofereixes un servei a Pineda?",
    button: "Vull aparèixer a GUIAPINEDA",
    soon: "Properament",
    normalizedHash: "7796e9f1477397126cdc68782516d85861c2aeb07713292861d74f79d2d017e1",
  },
  es: {
    label: "ES",
    expectedText:
      "Forma parte de GUIAPINEDA y haz que más personas te encuentren. Ya puedes añadir tu actividad de forma clara y sencilla.",
    obsoleteText: "Estamos preparando",
    title: "¿Tienes un comercio u ofreces un servicio en Pineda?",
    button: "Quiero aparecer en GUIAPINEDA",
    soon: "Próximamente",
    normalizedHash: "93d8161147b327caacacc8237ff542c7cabebf8c94205779d6226486dfcb39e0",
  },
  en: {
    label: "EN",
    expectedText:
      "Join GUIAPINEDA and help more people find you. You can now add your activity in a clear and simple way.",
    obsoleteText: "We are preparing",
    title: "Do you run a business or offer a service in Pineda?",
    button: "I want to join GUIAPINEDA",
    soon: "Add your business",
    normalizedHash: "8e4349a3561e7a8b2897c0a880f17c8a959cc059f33e6372e261b5dcc21628fe",
  },
};

const protectedFiles = {
  "src/pages/index.astro": "e7e86621abeda891da4880d65d795339ba9f89538ede718e6730c333e0926bc1",
  "src/templates/CategoryPage.astro":
    "623a6d53bd24776645b85417df1cf23a4fed0efdfa80c9c8e72c3b2e4456cd80",
  "src/templates/SubcategoryPage.astro":
    "2b4d842249a1e364c22219e7e27eac107514fd290c34e8e3f9d3124563e78de9",
  "src/templates/CommerceSignupPage.astro":
    "c73dffcb25c4462e687d7e0ffcdbccf648509353660d36773416a9fb9461317f",
  "src/components/CommerceSignupFlow.astro":
    "01f2b6e880810e3afeb18139cf0df4d8a8ec9fd8e2c5f132bdec64d5e7179033",
  "scripts/qa/commerce-submission-qa.mjs":
    "1336d29544cc76835e5092dd3991ed8f836d1587189c32b2e9c5ee778a0712cf",
};

const allowedChangedPaths = new Set([
  "src/i18n/ca.json",
  "src/i18n/es.json",
  "src/i18n/en.json",
  "scripts/qa/commerce-cta-live-copy-qa.mjs",
  "specs/010-commerce-cta-live-copy/spec.md",
  "specs/010-commerce-cta-live-copy/checklists/requirements.md",
  "specs/010-commerce-cta-live-copy/plan.md",
  "specs/010-commerce-cta-live-copy/research.md",
  "specs/010-commerce-cta-live-copy/data-model.md",
  "specs/010-commerce-cta-live-copy/quickstart.md",
  "specs/010-commerce-cta-live-copy/tasks.md",
]);

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const read = (path) => readFileSync(resolve(repoRoot, path), "utf8");

function addFailure(scope, detail) {
  failures.push(`FAIL [${scope}] ${detail}`);
}

function validateLocales() {
  const propertyPattern = /(\"businessCtaText\"\s*:\s*)\"(?:[^\"\\\\]|\\\\.)*\"/g;

  for (const [locale, contract] of Object.entries(locales)) {
    const path = `src/i18n/${locale}.json`;
    let raw;
    let parsed;

    try {
      raw = read(path);
      parsed = JSON.parse(raw);
    } catch (error) {
      addFailure(contract.label, `invalid locale JSON: ${error.message}`);
      continue;
    }

    const textProblems = [];
    const rawProperties = [...raw.matchAll(propertyPattern)];
    const observedText = parsed?.home?.businessCtaText;

    if (rawProperties.length !== 1) {
      textProblems.push(`raw businessCtaText count ${rawProperties.length}, expected 1`);
    }
    if (observedText !== contract.expectedText) {
      textProblems.push("exact approved copy mismatch");
    }
    if (typeof observedText !== "string" || observedText.includes(contract.obsoleteText)) {
      textProblems.push(`obsolete wording present: ${contract.obsoleteText}`);
    }
    if (textProblems.length > 0) {
      addFailure(contract.label, `businessCtaText: ${textProblems.join("; ")}`);
    }

    const protectedValues = {
      businessCtaTitle: contract.title,
      businessCtaButton: contract.button,
      businessCtaSoon: contract.soon,
    };
    for (const [key, expected] of Object.entries(protectedValues)) {
      if (parsed?.home?.[key] !== expected) {
        addFailure(contract.label, `${key} differs from its protected value`);
      }
    }

    if (rawProperties.length === 1) {
      const normalized = raw.replace(
        propertyPattern,
        '$1"__FEATURE_010_BUSINESS_CTA_TEXT__"',
      );
      if (sha256(normalized) !== contract.normalizedHash) {
        addFailure(contract.label, "normalized locale fingerprint mismatch");
      }
    }
  }
}

function validateProtectedFilesAndRoutes() {
  for (const [path, expectedHash] of Object.entries(protectedFiles)) {
    const raw = read(path);
    if (sha256(raw) !== expectedHash) {
      addFailure("PROTECTED", `${path} fingerprint mismatch`);
    }
  }

  const consumers = [
    "src/pages/index.astro",
    "src/templates/CategoryPage.astro",
    "src/templates/SubcategoryPage.astro",
  ];
  const routes = ["/alta-comerc/", "/es/alta-comercio/", "/en/businesses/add-a-business/"];
  for (const path of consumers) {
    const source = read(path);
    for (const route of routes) {
      if (!source.includes(route)) {
        addFailure("ROUTES", `${path} does not contain ${route}`);
      }
    }
  }

  if (!read("src/pages/index.astro").includes("t.home.businessCtaText")) {
    addFailure("CONSUMER", "homepage no longer consumes t.home.businessCtaText directly");
  }
}

function validateAllowlist() {
  const result = spawnSync(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all"],
    { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  if (result.status !== 0) {
    addFailure("ALLOWLIST", `git status failed: ${result.stderr.trim()}`);
    return;
  }

  for (const line of result.stdout.split("\n").filter(Boolean)) {
    const indexStatus = line[0];
    const path = line.slice(3);
    if (indexStatus !== " " && indexStatus !== "?") {
      addFailure("ALLOWLIST", `staged path detected: ${path}`);
    }
    if (!allowedChangedPaths.has(path)) {
      addFailure("ALLOWLIST", `unexpected changed path: ${path}`);
    }
  }
}

function validateActiveResources() {
  const allowedResources = new Set(["PipeWrap", "TTYWrap"]);
  const unexpected = process
    .getActiveResourcesInfo()
    .filter((resource) => !allowedResources.has(resource))
    .sort();
  if (unexpected.length > 0) {
    addFailure("RESOURCES", `unexpected active resources: ${unexpected.join(", ")}`);
  }
}

function finish() {
  validateActiveResources();
  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(failure);
    }
    console.error(`RESULT: FAIL (${failures.length} grouped failures)`);
    process.exitCode = 1;
    return;
  }

  console.log("PASS: Feature 010 Commerce CTA live copy QA");
}

try {
  validateLocales();
  validateProtectedFilesAndRoutes();
  validateAllowlist();
} catch (error) {
  addFailure("HARNESS", error instanceof Error ? error.message : String(error));
}

finish();
