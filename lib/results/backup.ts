import "server-only";

import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import type { TournamentResultsFile } from "@/types/results";

const BACKUP_DIR = path.join(process.cwd(), "data", "backups", "results");
const MAX_BACKUPS = 20;

function backupFileName(): string {
  const iso = new Date().toISOString().slice(0, 19);
  const safe = iso.replace(/:/g, "-");
  return `results-${safe}.json`;
}

function ensureBackupDir(): void {
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function pruneOldBackups(): void {
  ensureBackupDir();
  const files = readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith("results-") && f.endsWith(".json"))
    .map((f) => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      mtime: statSync(path.join(BACKUP_DIR, f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  for (const file of files.slice(MAX_BACKUPS)) {
    try {
      unlinkSync(file.path);
    } catch {
      // ignore
    }
  }
}

/** Sauvegarde une copie horodatée avant chaque écriture — conserve les 20 dernières versions */
export function backupResultsJson(current: TournamentResultsFile): void {
  ensureBackupDir();
  const dest = path.join(BACKUP_DIR, backupFileName());
  writeFileSync(dest, `${JSON.stringify(current, null, 2)}\n`, "utf-8");
  pruneOldBackups();
}

export function backupsDirectory(): string {
  return BACKUP_DIR;
}
