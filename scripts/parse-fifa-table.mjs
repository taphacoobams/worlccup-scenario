/**
 * Parses data.txt → clean fifa-official-mappings.json
 * Run: node scripts/parse-fifa-table.mjs [path-to-data.txt]
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseDataLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("Groupes")) return null;

  const parts = trimmed.split(/\t+/).map((s) => s.trim());
  const qualified_groups = [];
  const mapping = [];

  for (const p of parts) {
    if (!p) continue;
    if (/^3[A-L]$/.test(p)) mapping.push(p);
    else if (/^[A-L]$/.test(p)) qualified_groups.push(p);
  }

  if (qualified_groups.length !== 8 || mapping.length !== 8) return null;

  return { qualified_groups, mapping };
}

const inputPath =
  process.argv[2] ?? join(__dirname, "..", "data", "third-place-combinations.txt");

const text = readFileSync(inputPath, "utf8");
const scenarios = text.split("\n").map(parseDataLine).filter(Boolean);

if (scenarios.length !== 495) {
  console.warn(`Warning: parsed ${scenarios.length} scenarios, expected 495`);
}

const lines = ['{\n  "scenarios": ['];
scenarios.forEach((s, i) => {
  const comma = i < scenarios.length - 1 ? "," : "";
  lines.push(
    `    {\n      "qualified_groups": ${JSON.stringify(s.qualified_groups)},\n      "mapping": ${JSON.stringify(s.mapping)}\n    }${comma}`
  );
});
lines.push("  ]\n}\n");

writeFileSync(
  join(__dirname, "..", "data", "fifa-official-mappings.json"),
  lines.join("\n")
);

console.log(`Wrote ${scenarios.length} scenarios to data/fifa-official-mappings.json`);
