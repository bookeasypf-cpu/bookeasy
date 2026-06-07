import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";
import { InstallBanner } from "@/components/ui/InstallBanner";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { ServiceWorkerProvider } from "@/components/providers/ServiceWorkerProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bookeasy.me"),
  title: "BookEasy - Réservez vos rendez-vous en ligne",
  description:
    "Réservez vos rendez-vous beauté, bien-être et services en Polynésie française.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BookEasy",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "BookEasy - Réservez vos rendez-vous en ligne",
    description:
      "Réservez vos rendez-vous beauté, bien-être et services en Polynésie française.",
    siteName: "BookEasy",
    locale: "fr_FR",
    type: "website",
    url: "https://bookeasy.me",
    images: [
      {
        url: "/og-cover.jpg?v=4",
        width: 1200,
        height: 630,
        alt: "BookEasy — Réservation en ligne en Polynésie française",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BookEasy - Réservez vos rendez-vous en ligne",
    description:
      "Réservez vos rendez-vous beauté, bien-être et services en Polynésie française.",
    images: ["/og-cover.jpg?v=4"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0066FF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://bookeasy.me/#organization",
                  name: "BookEasy",
                  url: "https://bookeasy.me",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://bookeasy.me/icon-512x512.png",
                    width: 512,
                    height: 512,
                  },
                  description:
                    "Plateforme de réservation en ligne pour les professionnels de la beauté, du bien-être et des services en Polynésie française.",
                  areaServed: {
                    "@type": "Country",
                    name: "Polynésie française",
                    sameAs: "https://fr.wikipedia.org/wiki/Polyn%C3%A9sie_fran%C3%A7aise",
                  },
                  contactPoint: {
                    "@type": "ContactPoint",
                    email: "bookeasy.pf@gmail.com",
                    contactType: "customer service",
                    availableLanguage: "French",
                  },
                  sameAs: [],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://bookeasy.me/#website",
                  url: "https://bookeasy.me",
                  name: "BookEasy",
                  publisher: { "@id": "https://bookeasy.me/#organization" },
                  inLanguage: "fr-PF",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: "https://bookeasy.me/search?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-slate-100 dark:bg-gray-950 text-[#0C1B2A] dark:text-slate-100`}>
        <SessionProvider>
          <ThemeProvider>
          <SmoothScrollProvider />
          <ScrollProgress />
          {children}
          <ServiceWorkerProvider />
          <AnalyticsProvider />
          <Analytics />
          <InstallBanner />
          <CookieBanner />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "0.75rem",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
              },
            }}
          />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
