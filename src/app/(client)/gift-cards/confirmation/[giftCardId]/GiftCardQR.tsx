"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function GiftCardQR({ code }: { code: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(code, {
      width: 300,
      margin: 2,
      color: { dark: "#0C1B2A", light: "#FFFFFF" },
    }).then(setQrDataUrl);
  }, [code]);

  if (!qrDataUrl) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <img src={qrDataUrl} alt="QR Code carte cadeau" className="w-40 h-40 rounded-xl" />
      <a
        href={qrDataUrl}
        download={`carte-cadeau-${code}.png`}
        className="text-xs text-[#0066FF] hover:underline"
      >
        Télécharger le QR code
      </a>
    </div>
  );
}
