"use client";

import * as React from "react";
import { Barcode as BarcodeIcon, Download, Printer, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { SettingsPanel, ToggleRow } from "@/components/settings/SettingsPanel";
import { Button } from "@/components/ui/button";
import { FormField, Input, NativeSelect } from "@/components/ui/input";
import { Barcode } from "@/components/shared/Barcode";
import { QRCode } from "@/components/shared/QRCode";
import { formatKES } from "@/lib/utils";
import { downloadBlob } from "@/lib/utils";
import { generateRandomBarcode } from "@/lib/utils/barcode";

const FORMATS = ["EAN13", "CODE128", "UPC", "CODE39", "QRCODE"] as const;

export default function BarcodeGeneratorPage() {
  const [productId, setProductId] = React.useState(generateRandomBarcode("EAN13"));
  const [format, setFormat] = React.useState<(typeof FORMATS)[number]>("EAN13");
  const [copies, setCopies] = React.useState("12");
  const [showPrice, setShowPrice] = React.useState(true);
  const [customPrice, setCustomPrice] = React.useState("");
  const price = customPrice ? parseFloat(customPrice) || 0 : 0;

  function labelValue() {
    return productId;
  }

  function generateRandom() {
    const randomBarcode = generateRandomBarcode(format);
    setProductId(randomBarcode);
    setCustomPrice("");
    toast.success("Random barcode generated", { description: `Generated ${format} barcode: ${randomBarcode}` });
  }

  function handleFormatChange(newFormat: (typeof FORMATS)[number]) {
    setFormat(newFormat);
    // Always generate a new random barcode when format changes
    const randomBarcode = generateRandomBarcode(newFormat);
    setProductId(randomBarcode);
    setCustomPrice("");
  }

  function print() {
    window.print();
  }

  function download() {
    const svg = document.querySelector(".barcode-label svg")?.outerHTML ?? "";
    const safeFileName = productId.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    const fileName = format === "QRCODE" ? `qrcode-${safeFileName}.svg` : `barcode-${safeFileName}.svg`;
    const successMessage = format === "QRCODE" ? "QR Code downloaded" : "Barcode downloaded";
    downloadBlob(fileName, svg, "image/svg+xml");
    toast.success(successMessage, { description: fileName });
  }

  const copiesNum = Math.min(Math.max(parseInt(copies) || 1, 1), 40);

  return (
    <div className="space-y-4">
      <SettingsPanel title="Barcode generator" description="Create scannable shelf labels for your products">
        <div className="grid gap-3.5 sm:grid-cols-2">
          <FormField label="Product Name/Barcode" htmlFor="bc-product">
            <div className="flex gap-2">
              <Input
                id="bc-product"
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  setCustomPrice("");
                }}
                placeholder="Random barcode (click refresh to generate new)"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generateRandom}
                title="Generate random barcode"
              >
                <RefreshCw className="size-4" />
              </Button>
            </div>
          </FormField>
          <FormField label="Barcode format" htmlFor="bc-format" hint="EAN13 works with most retail scanners, QRCode for mobile scanning. Click refresh button for new random barcode.">
            <NativeSelect
              id="bc-format"
              value={format}
              onChange={(e) => handleFormatChange(e.target.value as (typeof FORMATS)[number])}
            >
              {FORMATS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField label="Label copies" htmlFor="bc-copies" hint="How many labels to print per sheet">
            <Input
              id="bc-copies"
              inputMode="numeric"
              value={copies}
              onChange={(e) => setCopies(e.target.value.replace(/[^0-9]/g, ""))}
              className="tabular-nums"
            />
          </FormField>
          <FormField label="Override price (KSh)" htmlFor="bc-price" hint="Optional — for promo pricing on the label">
            <Input
              id="bc-price"
              inputMode="decimal"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              className="tabular-nums"
            />
          </FormField>
        </div>
      </SettingsPanel>

      <SettingsPanel
        title="Label preview"
        description={`Print-ready ${format === "QRCODE" ? "QR code" : "barcode"} labels`}
        footer={
          <>
            <Button variant="outline" onClick={download}>
              <Download /> Download SVG
            </Button>
            <Button onClick={print}>
              <Printer /> Print labels
            </Button>
          </>
        }
      >
        <div className="barcode-label print-area rounded-xl border border-border bg-white p-5">
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: Math.min(copiesNum, 12) }).map((_, i) => (
              <div
                key={i}
                className="w-[190px] rounded-lg border border-slate-200 bg-white p-2.5 text-center shadow-sm"
              >
                <p className="truncate text-[12px] font-semibold text-slate-900">{productId.substring(0, 15)}</p>
                <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                  {format} Format
                </p>
                <div className="my-1.5 flex justify-center">
                  {format === "QRCODE" ? (
                    <QRCode value={labelValue()} size={85} />
                  ) : (
                    <Barcode value={labelValue()} format={format} height={34} width={1.4} />
                  )}
                </div>
                {showPrice && (
                  <p className="rounded bg-slate-900 py-0.5 text-[13px] font-bold text-white tabular-nums">
                    {formatKES(price)}
                  </p>
                )}
              </div>
            ))}
          </div>
          {copiesNum > 12 && (
            <p className="mt-3 text-center text-xs text-slate-500">
              Preview shows 12 of {copiesNum} labels — all will print.
            </p>
          )}
        </div>
        <ToggleRow
          label="Show price on label"
          description="Print the shelf price under the barcode"
          checked={showPrice}
          onCheckedChange={setShowPrice}
        />
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BarcodeIcon className="size-3.5" />
          Standard label size 38×25mm · compatible with Zebra, TSC and Brother thermal printers. QR codes support mobile scanning.
        </p>
      </SettingsPanel>
    </div>
  );
}
