import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReferralPageClient } from "./ReferralPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Parrainage | BookEasy",
  description: "Invitez vos amis sur BookEasy et gagnez des XP !",
  robots: { index: false, follow: false },
};

export default async function ReferralsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  return <ReferralPageClient />;
}
