import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
let starting;

async function reachable() {
  try {
    await run(
      "C:/Program Files/PostgreSQL/18/bin/pg_isready.exe",
      ["-h", "127.0.0.1", "-p", "55439", "-t", "1"],
      { windowsHide: true, timeout: 3000 },
    );
    return true;
  } catch {
    return false;
  }
}

export async function ensureLocalPostgres() {
  if (process.env.LOCAL_POSTGRES_AUTOSTART !== "true") return;
  const url = new URL(process.env.DATABASE_URL || "postgresql://invalid");
  if (
    process.platform !== "win32" ||
    url.hostname !== "127.0.0.1" ||
    url.port !== "55439"
  )
    return;
  if (starting) return starting;
  starting = (async () => {
    if (await reachable()) return;
    const directory = path.resolve(".local/postgres");
    const executable = "C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe";
    if (
      !existsSync(path.join(directory, "PG_VERSION")) ||
      !existsSync(executable)
    ) {
      throw new Error("Local PostgreSQL installation is missing; see README.");
    }
    try {
      await run(
        executable,
        [
          "-D",
          directory,
          "-l",
          path.resolve(".local/postgres.log"),
          "-o",
          "-p 55439 -h 127.0.0.1",
          "-w",
          "-t",
          "20",
          "start",
        ],
        { windowsHide: true, timeout: 25000 },
      );
    } catch {
      // Another Next.js worker may have started the same cluster concurrently.
      for (let attempt = 0; attempt < 20; attempt++) {
        if (await reachable()) return;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      throw new Error(
        "Local PostgreSQL could not start; check .local/postgres.log.",
      );
    }
  })();
  try {
    await starting;
  } finally {
    starting = undefined;
  }
}
