import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { ReferralPageClient } from "./ReferralPageClient";

export const metadata = {
  title: "Parrainage | BookEasy",
  description: "Invitez vos amis sur BookEasy et gagnez des XP !",
};

export default async function ReferralsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return <ReferralPageClient />;
}
