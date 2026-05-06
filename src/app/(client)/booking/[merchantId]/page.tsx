import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookingFlow from "./BookingFlow";

export const dynamic = "force-dynamic";

interface BookingPageProps {
  params: Promise<{ merchantId: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { merchantId } = await params;

  // Server-side fetch — eliminates the client waterfall (page load → JS
  // parse → useEffect → API call → render). Data is now ready when the
  // client component renders.
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId, isActive: true },
    select: {
      id: true,
      businessName: true,
      xpPerBooking: true,
      paymentPolicy: true,
      sector: { select: { slug: true } },
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          duration: true,
          price: true,
          xpAmount: true,
        },
      },
    },
  });

  if (!merchant) notFound();

  return <BookingFlow merchantId={merchantId} initialMerchant={merchant} />;
}
