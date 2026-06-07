// Selects the Prisma datasource provider from the DATABASE_PROVIDER env var so
// the same codebase runs on SQLite locally (zero setup) and PostgreSQL in the
// cloud — without ever hand-editing prisma/schema.prisma.
//
//   DATABASE_PROVIDER unset / "sqlite"  -> provider = "sqlite"   (local dev)
//   DATABASE_PROVIDER = "postgresql"    -> provider = "postgresql" (production)
//
// Runs during `postinstall` and `vercel-build`. The rewrite is idempotent and,
// on hosts like Vercel, only touches the ephemeral build filesystem.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const allowed = new Set(["sqlite", "postgresql", "mysql"]);
const provider = (process.env.DATABASE_PROVIDER || "sqlite").trim();

if (!allowed.has(provider)) {
  console.error(`[db-provider] Unknown DATABASE_PROVIDER "${provider}". Use sqlite | postgresql | mysql.`);
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "..", "prisma", "schema.prisma");

const schema = readFileSync(schemaPath, "utf8");
// Only the datasource block carries a db provider (the generator uses
// "prisma-client-js"), so this targeted replace is safe.
const next = schema.replace(
  /provider\s*=\s*"(sqlite|postgresql|mysql)"/,
  `provider = "${provider}"`
);

if (next !== schema) {
  writeFileSync(schemaPath, next);
  console.log(`[db-provider] datasource provider set to "${provider}".`);
} else {
  console.log(`[db-provider] datasource provider already "${provider}".`);
}
