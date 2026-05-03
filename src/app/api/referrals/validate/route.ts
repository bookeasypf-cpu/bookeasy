import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicEnumLimiter } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code || code.length < 4 || code.length > 20) {
    return NextResponse.json({ valid: false });
  }

  // Rate limit per IP to prevent bulk enumeration of valid codes
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  try {
    const { success } = await publicEnumLimiter.limit(`refval-${ip}`);
    if (!success) {
      return NextResponse.json({ valid: false }, { status: 429 });
    }
  } catch {
    // Fail open if Redis is down
  }

  const user = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { name: true },
  });

  if (!user) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    referrerName: user.name || "Un utilisateur BookEasy",
  });
}
