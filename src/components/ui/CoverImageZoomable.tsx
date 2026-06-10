"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface CoverImageZoomableProps {
  src: string;
  alt: string;
}

/**
 * Hero cover image cliquable. Tap → ouvre l'image en lightbox plein
 * écran avec fond noir. Évite le pinch-zoom involontaire qui décalait
 * la mise en page de la fiche merchant.
 *
 * Le rendu inline est strictement identique à un `<Image fill priority>`
 * — on enveloppe juste dans un <button> pour rendre la zone tappable
 * sans casser le layout absolute du hero (badges, BackButton, etc.).
 */
export function CoverImageZoomable({ src, alt }: CoverImageZoomableProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute inset-0 w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
        aria-label="Agrandir l'image de couverture"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-label="Image de couverture en grand"
          onClick={close}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Image contain — fit dans la viewport, pas crop */}
          <div
            className="relative w-full h-full max-w-7xl max-h-screen p-4 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
