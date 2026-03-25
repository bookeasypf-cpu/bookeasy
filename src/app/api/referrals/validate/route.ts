import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ valid: false });
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
