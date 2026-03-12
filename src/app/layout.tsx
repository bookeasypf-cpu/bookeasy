import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BookEasy - Réservez vos rendez-vous en ligne",
  description:
    "Plateforme de réservation en ligne pour coiffeurs, barbers, esthéticiennes et tous les commerçants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <SessionProvider>
          {children}
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
        </SessionProvider>
      </body>
    </html>
  );
}
