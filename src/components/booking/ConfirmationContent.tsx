"use client";

import { useEffect, useState } from "react";
import { Confetti } from "@/components/ui/Confetti";

interface ConfirmationContentProps {
  children: React.ReactNode;
}

export function ConfirmationContent({ children }: ConfirmationContentProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Confetti trigger={showConfetti} />
      {children}
    </>
  );
}
