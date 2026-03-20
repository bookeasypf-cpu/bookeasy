import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription - BookEasy",
  description:
    "Créez votre compte BookEasy gratuitement. Rejoignez la plateforme de réservation en ligne en Polynésie française.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
