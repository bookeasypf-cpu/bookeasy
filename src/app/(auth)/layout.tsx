import Link from "next/link";
import { Calendar } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Calendar className="h-8 w-8 text-indigo-600" />
        <span className="text-2xl font-bold text-gray-900">BookEasy</span>
      </Link>
      {children}
    </div>
  );
}
