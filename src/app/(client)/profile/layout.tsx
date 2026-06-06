import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon profil | BookEasy",
  robots: { index: false, follow: false },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
