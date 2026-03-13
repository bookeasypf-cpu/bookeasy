"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  code: string;
  size?: number;
}

export default function QRCodeDisplay({ code, size = 180 }: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <QRCodeSVG
          value={code}
          size={size}
          level="H"
          bgColor="#ffffff"
          fgColor="#0C1B2A"
          includeMargin={false}
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-2">
        Le commerçant peut scanner ce QR code
      </p>
    </div>
  );
}
