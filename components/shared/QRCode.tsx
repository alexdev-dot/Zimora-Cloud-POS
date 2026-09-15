"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";

export function QRCode({
  value,
  size = 100,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <QRCodeSVG
        value={value || "0000000000000"}
        size={size}
        level="L"
        includeMargin={false}
      />
    </div>
  );
}
