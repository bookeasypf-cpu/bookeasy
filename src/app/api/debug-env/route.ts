import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
    googleIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 12) || "NOT SET",
    hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    secretPrefix: process.env.GOOGLE_CLIENT_SECRET?.substring(0, 8) || "NOT SET",
    nextauthUrl: process.env.NEXTAUTH_URL || "NOT SET",
    hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
    nodeEnv: process.env.NODE_ENV,
  });
}
