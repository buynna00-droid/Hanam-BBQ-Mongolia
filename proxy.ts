import { NextResponse, type NextRequest } from "next/server";
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  const language = request.nextUrl.pathname.split("/")[1];
  headers.set(
    "x-hanam-language",
    ["mn", "ko", "en"].includes(language) ? language : "en",
  );
  return NextResponse.next({ request: { headers } });
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
