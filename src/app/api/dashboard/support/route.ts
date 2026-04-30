import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSupportMessage } from "@/lib/email";
import { supportMessageSchema, zodFirstError } from "@/lib/validations";

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

    const parsed = supportMessageSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: zodFirstError(parsed.error) }, { status: 400 });
    }
    const { subject, message } = parsed.data;

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
