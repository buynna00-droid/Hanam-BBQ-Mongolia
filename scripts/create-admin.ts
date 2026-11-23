import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "../lib/db";
async function main() {
  const email = z.email().parse(process.env.ADMIN_EMAIL).toLowerCase();
  const password = z
    .string()
    .min(12)
    .max(72)
    .refine((value) => Buffer.byteLength(value, "utf8") <= 72)
    .parse(process.env.ADMIN_PASSWORD);
  const name = z.string().trim().min(1).parse(process.env.ADMIN_NAME);
  if (await db.adminUser.findUnique({ where: { email } }))
    throw new Error(
      "Account already exists. Use staff management to change it.",
    );
  await db.adminUser.create({
    data: {
      email,
      name,
      passwordHash: await hash(password, 12),
      role: "SUPER_ADMIN",
    },
  });
  console.log(
    "Initial administrator created. Remove ADMIN_PASSWORD from your environment.",
  );
}
main()
  .catch(() => {
    console.error(
      "Admin creation failed: check database, unique email, ADMIN_NAME, and a 12–72 character ADMIN_PASSWORD.",
    );
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
