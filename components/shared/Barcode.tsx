"use client";

import * as React from "react";
import JsBarcode from "jsbarcode";

export function Barcode({
  value,
  height = 40,
  displayValue = true,
  format,
  width = 1.6,
  className,
}: {
  value: string;
  height?: number;
  displayValue?: boolean;
  format?: string;
  width?: number;
  className?: string;
}) {
  const ref = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    try {
      JsBarcode(ref.current, value, {
        format: format ?? (value.length === 13 && /^\d+$/.test(value) ? "EAN13" : "CODE128"),
        height,
        width,
        displayValue,
        fontSize: 12,
        margin: 4,
        lineColor: "#0f172a",
      });
    } catch {
      /* invalid barcode value — render nothing */
    }
  }, [value, height, displayValue, format, width]);

  return <svg ref={ref} className={className} role="img" aria-label={`Barcode ${value}`} />;
}
