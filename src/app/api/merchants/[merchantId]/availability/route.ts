import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/slots";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  const { merchantId } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!date || !serviceId) {
    return NextResponse.json(
      { error: "date and serviceId are required" },
      { status: 400 }
    );
  }

  const slots = await getAvailableSlots(merchantId, date, serviceId);

  return NextResponse.json({ slots });
}
