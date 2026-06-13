/**
 * Importe les images stades FIFA 2026 depuis DigitalHub.
 * Usage: npm run import-stadium-images [-- --force] [-- --db]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";
import {
  CANONICAL_STADIUM_NAMES,
  FIFA_STADIUM_IMAGES,
  canonicalVenueName,
  getFifaStadiumImageUrl,
  getStadiumPublicPath,
  slugifyVenue,
} from "../lib/stadium-images";

const ROOT = path.join(__dirname, "..");
const FIXTURES_PATH = path.join(ROOT, "data", "fixtures.json");
const STADIUMS_DIR = path.join(ROOT, "public", "stadiums");
const THUMBS_DIR = path.join(STADIUMS_DIR, "thumbs");
const THUMB_WIDTH = 400;
const THUMB_HEIGHT = 225;

type JsonFixture = {
  id: number;
  venue: { name: string; city: string };
  venueImage?: string;
  [key: string]: unknown;
};

const args = new Set(process.argv.slice(2));
const force = args.has("--force");
const useDb = args.has("--db") || Boolean(process.env.DATABASE_URL?.trim());

async function downloadImage(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buffer);
}

async function createThumb(source: string, dest: string): Promise<void> {
  await sharp(source)
    .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: "cover", position: "centre" })
    .jpeg({ quality: 82 })
    .toFile(dest);
}

function extractVenueName(fixture: JsonFixture): string {
  const venue = fixture.venue;
  if (typeof venue === "string") return venue.trim();
  if (venue && typeof venue === "object" && "name" in venue) {
    return String(venue.name).trim();
  }
  return "";
}

async function loadFixturesFromDb(): Promise<JsonFixture[]> {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.fixture.findMany({
      include: { venue: true },
      orderBy: { legacyId: "asc" },
    });
    return rows.map((f) => ({
      id: f.legacyId,
      venue: {
        name: f.venue?.name ?? "",
        city: f.venue?.city ?? "",
      },
      venueImage: f.venue?.image ?? undefined,
    }));
  } finally {
    await prisma.$disconnect();
  }
}

function loadFixturesFromJson(): JsonFixture[] {
  return JSON.parse(readFileSync(FIXTURES_PATH, "utf-8")) as JsonFixture[];
}

async function updateDbVenueImages(
  imageByVenueName: Map<string, string>
): Promise<void> {
  const prisma = new PrismaClient();
  try {
    let updated = 0;
    for (const [venueName, imagePath] of imageByVenueName) {
      const result = await prisma.venue.updateMany({
        where: { name: venueName },
        data: { image: imagePath },
      });
      updated += result.count;
    }
    console.log(`\nPostgreSQL: ${updated} enregistrement(s) Venue mis à jour`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  mkdirSync(STADIUMS_DIR, { recursive: true });
  mkdirSync(THUMBS_DIR, { recursive: true });

  const fixtures = existsSync(FIXTURES_PATH)
    ? loadFixturesFromJson()
    : useDb
      ? await loadFixturesFromDb()
      : [];

  if (fixtures.length === 0) {
    console.error("Aucun match trouvé (data/fixtures.json ou --db).");
    process.exit(1);
  }

  const venueNamesFromFixtures = [
    ...new Set(fixtures.map(extractVenueName).filter(Boolean)),
  ];

  const slugJobs = new Map<
    string,
    { canonicalName: string; url: string; venueNames: Set<string> }
  >();

  for (const name of venueNamesFromFixtures) {
    const canonical = canonicalVenueName(name);
    const url = getFifaStadiumImageUrl(name);
    if (!url) {
      console.warn(`⚠ Stadium image not found:\n- ${name}`);
      continue;
    }
    const slug = slugifyVenue(canonical);
    const existing = slugJobs.get(slug);
    if (existing) {
      existing.venueNames.add(name);
    } else {
      slugJobs.set(slug, {
        canonicalName: canonical,
        url,
        venueNames: new Set([name]),
      });
    }
  }

  let imported = 0;
  const imageByVenueName = new Map<string, string>();

  for (const [slug, job] of slugJobs) {
    const dest = path.join(STADIUMS_DIR, `${slug}.jpg`);
    const thumbDest = path.join(THUMBS_DIR, `${slug}.jpg`);
    const publicPath = `/stadiums/${slug}.jpg`;

    const needsDownload = force || !existsSync(dest);

    try {
      if (needsDownload) {
        await downloadImage(job.url, dest);
      }
      if (force || !existsSync(thumbDest) || needsDownload) {
        await createThumb(dest, thumbDest);
      }
      console.log(`✓ ${job.canonicalName}`);
      imported += 1;
      for (const alias of job.venueNames) {
        imageByVenueName.set(alias, publicPath);
      }
    } catch (err) {
      console.warn(
        `⚠ Échec import ${job.canonicalName}: ${err instanceof Error ? err.message : err}`
      );
    }
  }

  const canonicalImported = CANONICAL_STADIUM_NAMES.filter((name) => {
    const slug = slugifyVenue(name);
    return existsSync(path.join(STADIUMS_DIR, `${slug}.jpg`));
  }).length;

  let enriched = 0;
  for (const fixture of fixtures) {
    const venueName = extractVenueName(fixture);
    const imagePath = imageByVenueName.get(venueName) ?? getStadiumPublicPath(venueName);
    if (imagePath) {
      fixture.venueImage = imagePath;
      enriched += 1;
    }
  }

  if (existsSync(FIXTURES_PATH)) {
    writeFileSync(FIXTURES_PATH, `${JSON.stringify(fixtures, null, 2)}\n`);
    console.log(`\n${enriched} match(s) enrichis → data/fixtures.json`);
  }

  if (useDb && imageByVenueName.size > 0) {
    await updateDbVenueImages(imageByVenueName);
  }

  console.log(
    `\n${canonicalImported}/${CANONICAL_STADIUM_NAMES.length} stadium images imported`
  );

  const missingCanonical = CANONICAL_STADIUM_NAMES.filter(
    (name) => !existsSync(path.join(STADIUMS_DIR, `${slugifyVenue(name)}.jpg`))
  );
  if (missingCanonical.length > 0) {
    console.warn("\nStades canoniques manquants:");
    for (const name of missingCanonical) {
      const mapped = FIFA_STADIUM_IMAGES[name] ? "mapping OK" : "pas de mapping";
      console.warn(`  - ${name} (${mapped})`);
    }
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
