/**
 * Télécharge third-table-source.json (Annexe C FIFA, 495 combinaisons)
 * Usage: node scripts/fetch-fifa-third-table.mjs
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, "..", "data", "third-table-source.json");

const url =
  "https://raw.githubusercontent.com/floholz/wm-pickems/main/internal/bracket/data/third_table.json";

const res = await fetch(url);
if (!res.ok) throw new Error(`Échec téléchargement: ${res.status}`);

const data = await res.json();
const keys = Object.keys(data);
if (keys.length !== 495) {
  console.warn(`Attention: ${keys.length} combinaisons (attendu 495)`);
}

writeFileSync(out, JSON.stringify(data, null, 2) + "\n");
console.log(`Écrit ${keys.length} combinaisons → data/third-table-source.json`);
