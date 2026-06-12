/**
 * Traduit les bios Guardian (EN → FR) dans players.json.
 * Usage: npx tsx scripts/translate-players.ts [--force]
 */
import * as fs from "fs";
import * as path from "path";

interface FlatPlayer {
  id: number;
  name: string;
  bio?: string;
  bioEn?: string;
}

const CHUNK_SIZE = 4000;
const DELAY_MS = 250;
const SAVE_EVERY = 25;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunkText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let rest = text;

  while (rest.length > maxLen) {
    let cut = rest.lastIndexOf(". ", maxLen);
    if (cut < maxLen * 0.5) cut = rest.lastIndexOf(" ", maxLen);
    if (cut < maxLen * 0.3) cut = maxLen;
    chunks.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }

  if (rest) chunks.push(rest);
  return chunks;
}

async function translateChunk(text: string, retries = 3): Promise<string> {
  const url =
    "https://translate.googleapis.com/translate_a/single" +
    `?client=gtx&sl=en&tl=fr&dt=t&q=${encodeURIComponent(text)}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as [Array<[string]>, ...unknown[]];
      return data[0].map((part) => part[0]).join("");
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(1000 * attempt);
    }
  }
  return text;
}

async function translateBio(text: string): Promise<string> {
  const chunks = chunkText(text, CHUNK_SIZE);
  const parts: string[] = [];
  for (const chunk of chunks) {
    parts.push(await translateChunk(chunk));
    if (chunks.length > 1) await sleep(DELAY_MS);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function looksFrench(text: string): boolean {
  const sample = text.slice(0, 200).toLowerCase();
  const frenchHints = [
    " il ",
    " elle ",
    " les ",
    " des ",
    " dans ",
    " pour ",
    " avec ",
    " après ",
    " avant ",
    " équipe ",
    " joueur ",
    " sélection ",
    " coupe du monde ",
    "é",
    "è",
    "à",
    "ç",
  ];
  const englishHints = [" the ", " he ", " she ", " with ", " after ", " before ", " team ", " player "];
  const fr = frenchHints.filter((h) => sample.includes(h)).length;
  const en = englishHints.filter((h) => sample.includes(h)).length;
  return fr >= 2 && fr > en;
}

async function main() {
  const force = process.argv.includes("--force");
  const missingOnly = process.argv.includes("--missing");
  const dataDir = path.join(__dirname, "..", "data");
  const playersPath = path.join(dataDir, "players.json");

  const players: FlatPlayer[] = JSON.parse(fs.readFileSync(playersPath, "utf-8"));
  const toTranslate = players.filter((p) => p.bio?.trim());

  let translated = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Bios à traiter : ${toTranslate.length}`);

  for (let i = 0; i < toTranslate.length; i++) {
    const player = toTranslate[i];

    if (missingOnly && player.bio?.trim() && looksFrench(player.bio)) {
      skipped++;
      continue;
    }

    if (!force && !missingOnly && player.bio && looksFrench(player.bio)) {
      skipped++;
      continue;
    }

    if (!player.bio?.trim() && !player.bioEn?.trim()) {
      skipped++;
      continue;
    }

    const english = player.bioEn ?? player.bio!;
    try {
      const french = await translateBio(english);
      player.bioEn = english;
      player.bio = french;
      translated++;

      if (translated % SAVE_EVERY === 0) {
        fs.writeFileSync(playersPath, JSON.stringify(players, null, 2));
        console.log(`  … ${translated} traduits (sauvegarde)`);
      }

      await sleep(DELAY_MS);
    } catch (err) {
      failed++;
      console.warn(`  ✗ ${player.name}: ${err instanceof Error ? err.message : err}`);
      await sleep(2000);
    }
  }

  fs.writeFileSync(playersPath, JSON.stringify(players, null, 2));

  console.log("\nTraduction terminée :");
  console.log(`  Traduits : ${translated}`);
  console.log(`  Ignorés (déjà FR) : ${skipped}`);
  console.log(`  Échecs : ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
