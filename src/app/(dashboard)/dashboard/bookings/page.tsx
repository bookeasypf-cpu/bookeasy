import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDate, formatTime, formatPrice } from "@/lib/utils";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
} from "@/lib/constants";
import { BookingActions } from "./BookingActions";

export default async function DashboardBookingsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
  });
  if (!merchant) redirect("/dashboard/profile");

  const bookings = await prisma.booking.findMany({
    where: { merchantId: merchant.id },
    include: {
      client: { select: { name: true, email: true } },
      service: { select: { name: true } },
    },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
    take: 50,
  });

  const pending = bookings.filter((b) => b.status === "PENDING");
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
  const other = bookings.filter(
    (b) => !["PENDING", "CONFIRMED"].includes(b.status)
  );

  function BookingList({
    items,
    title,
  }: {
    items: typeof bookings;
    title: string;
  }) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[#0C1B2A] mb-4">
          {title} ({items.length})
        </h2>
        {items.length > 0 ? (
          <div className="space-y-3 stagger-children">
            {items.map((b) => (
              <Card key={b.id} className="rounded-2xl card-hover border-0 shadow-sm">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#0C1B2A]">
                          {b.client.name || b.client.email}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BOOKING_STATUS_COLORS[b.status] || ""}`}
                        >
                          {BOOKING_STATUS_LABELS[b.status] || b.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {b.service.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatDate(b.date)} &middot;{" "}
                        {formatTime(b.startTime)} - {formatTime(b.endTime)}
                      </p>
                      {b.notes && (
                        <p className="text-sm text-gray-500 mt-1 italic">
                          &ldquo;{b.notes}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#0C1B2A]">
                        {formatPrice(b.totalPrice)}
                      </span>
                      <BookingActions
                        bookingId={b.id}
                        status={b.status}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Aucun</p>
        )}
      </section>
    );
  }

  return (
    <div className="page-transition">
      <h1 className="text-2xl font-bold text-[#0C1B2A] mb-6 animate-fade-in-up">Rendez-vous</h1>
      <BookingList items={pending} title="En attente" />
      <BookingList items={confirmed} title="Confirm\u00e9s" />
      <BookingList items={other} title="Pass\u00e9s / Annul\u00e9s" />
    </div>
  );
}
