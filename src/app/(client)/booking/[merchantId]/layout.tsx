import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function BookingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ merchantId: string }>;
}) {
  const session = await getSession();
  if (!session?.user) {
    const { merchantId } = await params;
    redirect(`/login?callbackUrl=/booking/${merchantId}`);
  }
  return children;
}
