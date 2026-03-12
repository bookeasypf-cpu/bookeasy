import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/Card";
import { User, Mail } from "lucide-react";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil</h1>
      <Card>
        <CardContent className="py-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {session.user.name || "Utilisateur"}
              </h2>
              <p className="text-sm text-gray-500 capitalize">
                {session.user.role === "MERCHANT"
                  ? "Professionnel"
                  : "Client"}
              </p>
            </div>
          </div>
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">
                {session.user.email}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
