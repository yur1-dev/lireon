// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();

  // Clear all NextAuth cookies
  const nextAuthCookies = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Secure-next-auth.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
  ];

  const response = NextResponse.json({ success: true });

  // Delete all NextAuth cookies
  nextAuthCookies.forEach((cookieName) => {
    response.cookies.delete(cookieName);
  });

  return response;
}
