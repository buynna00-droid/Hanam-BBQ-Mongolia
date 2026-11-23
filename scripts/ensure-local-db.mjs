import { ensureLocalPostgres } from "./local-postgres.mjs";

try {
  await ensureLocalPostgres();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
