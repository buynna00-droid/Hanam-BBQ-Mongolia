import { cookies, headers } from "next/headers";
import {
  createHash,
  randomBytes,
  timingSafeEqual,
  createHmac,
} from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "./db";
import { canWrite, canManageStaff } from "./validation";
export const digest = (s: string) =>
  createHash("sha256").update(s).digest("hex");
export async function currentUser() {
  const token = (await cookies()).get("hanam_session")?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: digest(token) },
    include: { user: true },
  });
  return session && session.expiresAt > new Date() && session.user.isActive
    ? session.user
    : null;
}
export async function requireUser(write = false, staff = false) {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  if ((write && !canWrite(user.role)) || (staff && !canManageStaff(user.role)))
    throw new Error("Access denied");
  return user;
}
export async function startSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  await db.session.create({ data: { id: digest(token), userId, expiresAt } });
  (await cookies()).set("hanam_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}
function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32)
    throw new Error("SESSION_SECRET must contain at least 32 characters");
  return s;
}
export async function csrfToken() {
  const session = (await cookies()).get("hanam_session")?.value ?? "login";
  const hour = Math.floor(Date.now() / 3600000);
  return `${hour}.${createHmac("sha256", secret()).update(`${session}:${hour}`).digest("hex")}`;
}
export async function verifyCsrf(form: FormData) {
  const h = await headers();
  const origin = h.get("origin");
  if (
    !origin ||
    origin !== new URL(process.env.SITE_URL ?? "http://localhost:3000").origin
  )
    throw new Error("Invalid request origin");
  const token = String(form.get("csrf") ?? "");
  const [hour, hash] = token.split(".");
  if (
    !/^\d+$/.test(hour) ||
    Math.abs(Math.floor(Date.now() / 3600000) - Number(hour)) > 1 ||
    !/^[a-f0-9]{64}$/.test(hash ?? "")
  )
    throw new Error("Expired form");
  const session = (await cookies()).get("hanam_session")?.value ?? "login";
  const expected = createHmac("sha256", secret())
    .update(`${session}:${hour}`)
    .digest();
  if (!timingSafeEqual(Buffer.from(hash, "hex"), expected))
    throw new Error("Invalid form");
}
