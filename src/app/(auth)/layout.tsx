import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-white to-[#EFF6FF] dark:from-gray-950 dark:via-gray-950 dark:to-[#0C1B2A]">
      {/* Background decorative orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#0066FF]/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#00B4D8]/5 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-[#0066FF]/3 rounded-full blur-3xl" />

      {/* Logo */}
      <Link href="/" className="relative flex items-center gap-2 mb-8 group animate-fade-in-up">
        <Image
          src="/logo-icon.svg"
          alt="BookEasy"
          width={36}
          height={36}
          className="shrink-0 group-hover:scale-110 transition-transform duration-300"
          priority
        />
        <span className="flex items-center gap-0.5">
          <span className="text-2xl font-bold text-[#0C1B2A] dark:text-white tracking-tight">
            Book
          </span>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#0066FF] to-[#00B4D8] bg-clip-text text-transparent">
            Easy
          </span>
        </span>
      </Link>

      {/* Card with entrance animation */}
      <div className="relative animate-scale-in w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
