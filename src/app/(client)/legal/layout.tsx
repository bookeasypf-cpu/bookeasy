import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0066FF] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/" className="font-bold text-lg">
            <span className="text-[#0C1B2A] dark:text-white">Book</span>
            <span className="text-[#0066FF]">Easy</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <article className="legal-content [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 dark:[&_h1]:text-white [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 dark:[&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-gray-100 dark:[&_h2]:border-gray-800 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-gray-800 dark:[&_h3]:text-gray-200 [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:text-gray-600 dark:[&_p]:text-gray-400 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-2 [&_li]:text-gray-600 dark:[&_li]:text-gray-400 [&_li]:leading-relaxed [&_a]:text-[#0066FF] [&_a]:font-medium hover:[&_a]:underline [&_strong]:text-gray-800 dark:[&_strong]:text-gray-200">
          {children}
        </article>
      </main>

      {/* Bottom nav */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap gap-6 text-sm text-gray-500">
          <Link href="/legal/mentions-legales" className="hover:text-[#0066FF] transition-colors">
            Mentions légales
          </Link>
          <Link href="/legal/cgu" className="hover:text-[#0066FF] transition-colors">
            Conditions générales
          </Link>
          <Link href="/legal/confidentialite" className="hover:text-[#0066FF] transition-colors">
            Politique de confidentialité
          </Link>
        </div>
      </footer>
    </div>
  );
}
