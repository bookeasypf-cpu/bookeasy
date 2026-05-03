import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserProfileSchema, zodFirstError } from "@/lib/validations";

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    await prisma.$transaction(async (tx) => {
      // Delete reviews (no cascade on clientId)
      await tx.review.deleteMany({ where: { clientId: userId } });

      // Delete bookings as client (no cascade on clientId)
      await tx.booking.deleteMany({ where: { clientId: userId } });

      // Delete the user — cascades: accounts, sessions, merchant (→ services,
      // photos, schedules, blocked_slots, bookings as merchant), notifications,
      // xp_transactions, xp_redemptions, favorites, push_subscriptions,
      // patient_notes, referrals
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) { console.error("[profile] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, image: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) { console.error("[profile] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const parsed = updateUserProfileSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: zodFirstError(parsed.error) }, { status: 400 });
    }
    const { name, phone, image } = parsed.data;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        image: image || null,
      },
      select: { id: true, name: true, email: true, phone: true, role: true, image: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) { console.error("[profile] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
