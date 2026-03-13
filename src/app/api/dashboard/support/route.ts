import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSupportMessage } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "MERCHANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const merchant = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
      select: { businessName: true, plan: true },
    });

    if (!merchant) {
      return NextResponse.json({ error: "No merchant profile" }, { status: 400 });
    }

    const body = await request.json();
    const { subject, message } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: "Sujet et message requis" }, { status: 400 });
    }

    if (subject.length > 200 || message.length > 2000) {
      return NextResponse.json({ error: "Message trop long" }, { status: 400 });
    }

    const result = await sendSupportMessage({
      merchantName: merchant.businessName,
      merchantEmail: session.user.email!,
      merchantPlan: merchant.plan,
      subject,
      message,
    });

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error || "Erreur d'envoi" }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
