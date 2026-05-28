import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPatientNoteSchema, zodFirstError } from "@/lib/validations";
import { decryptPatientNote, encryptPatientNote } from "@/lib/patient-notes-crypto";

// GET — Récupérer les notes d'un patient
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const merchant = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
    });
    if (!merchant)
      return NextResponse.json({ error: "No merchant" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId)
      return NextResponse.json({ error: "clientId requis" }, { status: 400 });

    const rows = await prisma.patientNote.findMany({
      where: { merchantId: merchant.id, clientId },
      orderBy: { createdAt: "desc" },
    });

    const notes = rows.map((n) => ({
      ...n,
      content: decryptPatientNote(n.content),
    }));

    return NextResponse.json({ notes });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST — Ajouter une note
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const merchant = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
    });
    if (!merchant)
      return NextResponse.json({ error: "No merchant" }, { status: 404 });

    const parsed = createPatientNoteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: zodFirstError(parsed.error) }, { status: 400 });
    }
    const { clientId, content } = parsed.data;

    // Verify merchant has seen this client (at least one booking)
    const hasBooking = await prisma.booking.findFirst({
      where: { merchantId: merchant.id, clientId },
      select: { id: true },
    });
    if (!hasBooking)
      return NextResponse.json(
        { error: "Ce client n'a aucune réservation chez vous" },
        { status: 403 }
      );

    const trimmed = content.trim();
    const created = await prisma.patientNote.create({
      data: {
        merchantId: merchant.id,
        clientId,
        content: encryptPatientNote(trimmed),
      },
    });

    // Return decrypted content so the client doesn't see ciphertext
    const note = { ...created, content: trimmed };
    return NextResponse.json({ note });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE — Supprimer une note
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const merchant = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
    });
    if (!merchant)
      return NextResponse.json({ error: "No merchant" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("noteId");

    if (!noteId)
      return NextResponse.json({ error: "noteId requis" }, { status: 400 });

    // Vérifier que la note appartient bien à ce merchant
    const note = await prisma.patientNote.findFirst({
      where: { id: noteId, merchantId: merchant.id },
    });

    if (!note)
      return NextResponse.json({ error: "Note introuvable" }, { status: 404 });

    await prisma.patientNote.delete({ where: { id: noteId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
