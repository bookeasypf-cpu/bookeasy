import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { formatTime } from "@/lib/utils";

export default async function DashboardCalendarPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
  });
  if (!merchant) redirect("/dashboard/profile");

  const today = new Date();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const firstDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  ).getDay();
  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const monthEnd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${daysInMonth}`;

  const bookings = await prisma.booking.findMany({
    where: {
      merchantId: merchant.id,
      date: { gte: monthStart, lte: monthEnd },
      status: { notIn: ["CANCELLED_BY_CLIENT", "CANCELLED_BY_MERCHANT"] },
    },
    include: {
      client: { select: { name: true } },
      service: { select: { name: true } },
    },
    orderBy: { startTime: "asc" },
  });

  const bookingsByDate: Record<string, typeof bookings> = {};
  bookings.forEach((b) => {
    if (!bookingsByDate[b.date]) bookingsByDate[b.date] = [];
    bookingsByDate[b.date].push(b);
  });

  const monthName = today.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="page-transition">
      <h1 className="text-2xl font-bold text-[#0C1B2A] mb-6 capitalize animate-fade-in-up">
        {monthName}
      </h1>
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-gray-500 py-2"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: (firstDay + 6) % 7 }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayBookings = bookingsByDate[dateStr] || [];
              const isToday =
                dateStr === today.toISOString().split("T")[0];
              return (
                <div
                  key={day}
                  className={`min-h-[80px] p-1.5 rounded-xl border text-xs transition-all ${isToday ? "bg-[#0066FF]/10 ring-2 ring-[#0066FF] border-transparent" : "border-gray-100 hover:border-gray-200"}`}
                >
                  <div
                    className={`font-semibold mb-1 ${isToday ? "text-[#0066FF]" : "text-gray-700"}`}
                  >
                    {day}
                  </div>
                  {dayBookings.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className="bg-[#0066FF]/10 text-[#0066FF] rounded-md px-1 py-0.5 mb-0.5 truncate font-medium"
                    >
                      {formatTime(b.startTime)}{" "}
                      {b.client.name?.split(" ")[0] || ""}
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-gray-400 font-medium">
                      +{dayBookings.length - 3}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
