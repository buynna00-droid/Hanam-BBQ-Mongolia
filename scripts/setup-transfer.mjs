import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";

const password = randomBytes(24).toString("hex");
try {
  writeFileSync(
    ".env",
    [
      `POSTGRES_PASSWORD=${password}`,
      `DATABASE_URL=postgresql://hanam:${password}@127.0.0.1:54329/hanam`,
      `SESSION_SECRET=${randomBytes(32).toString("hex")}`,
      "SITE_URL=http://localhost:3000",
      "LOCAL_POSTGRES_AUTOSTART=false",
      "ADMIN_NAME=",
      "ADMIN_EMAIL=",
      "ADMIN_PASSWORD=",
      "",
    ].join("\n"),
    { flag: "wx", mode: 0o600 },
  );
  console.log(
    "Created fresh local credentials in .env. Next: docker compose up -d --wait",
  );
} catch (error) {
  if (error.code === "EEXIST")
    console.error(".env already exists; preserved without changes.");
  else console.error("Could not create .env.");
  process.exitCode = 1;
}
