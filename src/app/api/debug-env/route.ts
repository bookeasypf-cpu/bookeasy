import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
    googleIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) || "MISSING",
    hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    secretPrefix: process.env.GOOGLE_CLIENT_SECRET?.substring(0, 8) || "MISSING",
    nextauthUrl: process.env.NEXTAUTH_URL || "MISSING",
    hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
  });
}
