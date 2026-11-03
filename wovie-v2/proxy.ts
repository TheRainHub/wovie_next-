import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Personal pages need a signed-in user; everyone else goes to the login form
// and comes back afterwards. (Next 16 calls this file proxy, not middleware.)
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });

  if (!token) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("view", "login");
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/lists/:path*"],
};
