import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ── Formatting ───────────────────────────────────────────────────── */

export function formatKES(value: number, opts?: { cents?: boolean }) {
  const digits = opts?.cents ? 2 : 0;
  return (
    "KSh " +
    value.toLocaleString("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
  );
}

export function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

export function compactKES(value: number) {
  if (Math.abs(value) >= 1_000_000)
    return (value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1) + "M";
  if (Math.abs(value) >= 1_000)
    return (value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1) + "k";
  return String(value);
}

export function formatDate(iso: string, withTime = false) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (!withTime) return date;
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function percentChange(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_TONES = [
  "bg-teal-100 text-teal-800",
  "bg-sky-100 text-sky-800",
  "bg-amber-100 text-amber-800",
  "bg-violet-100 text-violet-800",
  "bg-rose-100 text-rose-800",
  "bg-emerald-100 text-emerald-800",
  "bg-indigo-100 text-indigo-800",
];

export function avatarTone(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

/* ── Dates relative to "now" (for mock data) ──────────────────────── */

export function isoAgo(opts: { days?: number; hours?: number; minutes?: number }) {
  const totalMs = (((opts.days ?? 0) * 24 + (opts.hours ?? 0)) * 60 + (opts.minutes ?? 0)) * 60000;
  return new Date(Date.now() - totalMs).toISOString();
}

export function isoAhead(opts: { days?: number; hours?: number }) {
  const totalMs = ((opts.days ?? 0) * 24 + (opts.hours ?? 0)) * 3600000;
  return new Date(Date.now() + totalMs).toISOString();
}

/* ── Downloads ────────────────────────────────────────────────────── */

export function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  downloadBlob(filename, csv, "text/csv;charset=utf-8;");
}

export function printArea() {
  window.print();
}

/* ── Receipt/Invoice Print & Download ──────────────────────────────── */

export function printReceiptOrInvoice(data: any, documentType: "receipt" | "invoice" = "receipt") {
  // Create a print-specific container
  const printContainer = document.createElement('div');
  printContainer.className = 'print-container';
  printContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    z-index: 9999;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  `;
  
  // Store original body content
  const originalContent = document.body.innerHTML;
  
  // For now, we'll use a simplified approach that will be enhanced later
  // This is a placeholder that uses the existing print functionality
  window.print();
}

export function downloadReceiptAsHTML(data: any, documentType: "receipt" | "invoice" = "receipt") {
  // Get settings from localStorage
  const settingsKey = documentType === "invoice" ? "zimora-invoice-settings" : "zimora-receipt-settings";
  const settings = JSON.parse(localStorage.getItem(settingsKey) || "{}");
  
  const kes = (n: number) =>
    "KSh " + n.toLocaleString("en-US", { minimumFractionDigits: n % 1 === 0 ? 0 : 2 });
  
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const docTitle = settings.documentTitle || (documentType === "invoice" ? "INVOICE" : "RECEIPT");
  const headerMessage = settings.headerMessage || (documentType === "invoice" ? "Tax Invoice" : "Official Receipt");
  const footer = settings.footer || "Thank you for your business!";
  const fileName = `${documentType}-${data.orderNo}.html`;
  
  // Determine styling based on template
  const template = settings.template || (documentType === "invoice" ? "professional" : "classic");
  const isClassic = template === "classic";
  const isModern = template === "modern";
  const isProfessional = template === "professional";
  const isMinimal = template === "minimal";
  
  const rows = data.items
    .map((i: any) => {
      let itemRow = `<td>${i.name}`;
      if (settings.showItemSku && i.sku) {
        itemRow += ` <span style="font-size:10px;color:#666">(${i.sku})</span>`;
      }
      itemRow += ` &times; ${i.qty}</td>`;
      itemRow += `<td style="text-align:right">${kes(i.qty * i.unitPrice)}</td>`;
      return `<tr>${itemRow}</tr>`;
    })
    .join("");

  const font = isClassic ? "ui-monospace, monospace" : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const headerAlign = isMinimal ? "left" : "center";
  const totalBorder = isProfessional ? "border-top: 3px solid #000" : "border-top: 2px solid #111";
  
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docTitle} ${data.orderNo}</title>
  <style>
    body { font-family: ${font}; max-width: 400px; margin: 24px auto; color: #111; line-height: 1.4; }
    .header { text-align: ${headerAlign}; margin-bottom: 16px; }
    .header h2 { margin: 0; font-size: ${isProfessional ? "20px" : "18px"}; font-weight: bold; }
    .header p { margin: 4px 0; font-size: 12px; color: #555; }
    .header-message { font-size: 11px; color: #666; font-style: ${isProfessional ? "normal" : "italic"}; margin-bottom: 8px; }
    .meta { margin: 12px 0; font-size: 12px; }
    .meta-row { display: flex; justify-content: space-between; margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    td { padding: 4px 0; font-size: 12px; }
    .total-row { font-size: ${isProfessional ? "16px" : "14px"}; font-weight: bold; ${totalBorder}; padding-top: 8px; margin-top: 8px; }
    .footer { text-align: center; margin-top: 16px; font-size: 11px; color: #555; }
    hr { border: none; border-top: ${isModern ? "2px solid #000" : "1px solid #ddd"}; margin: 12px 0; }
  </style>
</head>
<body>
  <div class="header">
    ${settings.headerMessage ? `<p class="header-message">${headerMessage}</p>` : ""}
    <h2>${docTitle}</h2>
    ${settings.showBusinessInfo ? `
    <p>Zimora Supermarket</p>
    <p>Shop L23, Sarit Centre, Westlands, Nairobi · Tel +254 720 000 111</p>
    ` : ""}
  </div>
  <hr/>
  <div class="meta">
    <div class="meta-row"><span>${documentType === "invoice" ? "Invoice" : "Receipt"} #:</span> <strong>${data.orderNo}</strong></div>
    <div class="meta-row"><span>Date:</span> <span>${formatDate(data.date)}</span></div>
    ${settings.showCashier ? `<div class="meta-row"><span>Served by:</span> <span>${data.cashier}</span></div>` : ""}
    ${settings.showCustomer && data.customerName && data.customerName !== "Walk-in Customer" ? 
      `<div class="meta-row"><span>Customer:</span> <span>${data.customerName}</span></div>` : ""}
  </div>
  <hr/>
  <table>${rows}</table>
  <hr/>
  <table>
    <tr><td>Subtotal</td><td style="text-align:right">${kes(data.subtotal)}</td></tr>
    ${data.discount > 0 ? `<tr><td>Discount</td><td style="text-align:right">−${kes(data.discount)}</td></tr>` : ""}
    ${settings.showTax ? `<tr><td>VAT (16%)</td><td style="text-align:right">${kes(data.tax)}</td></tr>` : ""}
    <tr class="total-row"><td>TOTAL</td><td style="text-align:right">${kes(data.total)}</td></tr>
  </table>
  ${settings.showPaymentDetails ? `
  <hr/>
  <div class="meta">
    <div class="meta-row"><span>Paid via:</span> <span>${data.paymentMethod}</span></div>
    ${data.paymentRef ? `<div class="meta-row"><span>Ref:</span> <span>${data.paymentRef}</span></div>` : ""}
    ${data.change !== undefined && data.change > 0 ? 
      `<div class="meta-row"><span>Change:</span> <span>${kes(data.change)}</span></div>` : ""}
  </div>
  ` : ""}
  <div class="footer">
    ${footer.split("\n").map((line: string) => `<p>${line}</p>`).join("")}
    <p>Powered by Zimora Cloud POS</p>
  </div>
</body>
</html>`;

  downloadBlob(fileName, html, "text/html");
  return fileName;
}

export function downloadReceiptAsPDF(data: any, documentType: "receipt" | "invoice" = "receipt") {
  // For now, use HTML download as placeholder
  // TODO: Implement proper PDF generation with jsPDF
  return downloadReceiptAsHTML(data, documentType);
}

// Improved PDF generation using jsPDF (to be implemented)
export async function generateReceiptPDF(data: any, documentType: "receipt" | "invoice" = "receipt") {
  // Import jsPDF dynamically
  const { jsPDF } = await import('jspdf');
  
  // Get settings from localStorage
  const settingsKey = documentType === "invoice" ? "zimora-invoice-settings" : "zimora-receipt-settings";
  const settings = JSON.parse(localStorage.getItem(settingsKey) || "{}");
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200] // Receipt format: 80mm width
  });

  const kes = (n: number) =>
    "KSh " + n.toLocaleString("en-US", { minimumFractionDigits: n % 1 === 0 ? 0 : 2 });
  
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const docTitle = settings.documentTitle || (documentType === "invoice" ? "INVOICE" : "RECEIPT");
  const headerMessage = settings.headerMessage || (documentType === "invoice" ? "Tax Invoice" : "Official Receipt");
  const footer = settings.footer || "Thank you for your business!";
  const margin = 5;
  let y = margin;

  // Header
  if (settings.headerMessage) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text(headerMessage, 40, y, { align: 'center' });
    y += 3;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(docTitle, 40, y, { align: 'center' });
  y += 5;
  
  if (settings.showBusinessInfo) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Zimora Supermarket', 40, y, { align: 'center' });
    y += 3;
    doc.text('Shop L23, Sarit Centre, Westlands, Nairobi', 40, y, { align: 'center' });
    y += 3;
    doc.text('Tel +254 720 000 111', 40, y, { align: 'center' });
    y += 5;
  }

  // Divider
  doc.line(margin, y, 75, y);
  y += 4;

  // Meta info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${documentType === "invoice" ? "Invoice" : "Receipt"} #: ${data.orderNo}`, margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${formatDate(data.date)}`, margin, y);
  y += 4;
  
  if (settings.showCashier) {
    doc.text(`Served by: ${data.cashier}`, margin, y);
    y += 4;
  }
  
  if (settings.showCustomer && data.customerName && data.customerName !== "Walk-in Customer") {
    doc.text(`Customer: ${data.customerName}`, margin, y);
    y += 4;
  }

  // Divider
  doc.line(margin, y, 75, y);
  y += 4;

  // Items
  doc.setFontSize(8);
  data.items.forEach((item: any) => {
    if (y > 180) {
      doc.addPage();
      y = margin;
    }
    
    let itemText = item.name;
    if (settings.showItemSku && item.sku) {
      itemText += ` (${item.sku})`;
    }
    
    const line = `${itemText} x${item.qty}`;
    doc.text(line, margin, y);
    doc.text(kes(item.qty * item.unitPrice), 75, y, { align: 'right' });
    y += 4;
  });

  // Divider
  doc.line(margin, y, 75, y);
  y += 4;

  // Totals
  doc.text(`Subtotal: ${kes(data.subtotal)}`, margin, y);
  y += 4;
  
  if (data.discount > 0) {
    doc.text(`Discount: -${kes(data.discount)}`, margin, y);
    y += 4;
  }
  
  if (settings.showTax) {
    doc.text(`VAT (16%): ${kes(data.tax)}`, margin, y);
    y += 4;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`TOTAL: ${kes(data.total)}`, margin, y);
  y += 6;

  // Payment info
  if (settings.showPaymentDetails) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Paid via: ${data.paymentMethod}`, margin, y);
    y += 4;
    
    if (data.paymentRef) {
      doc.text(`Ref: ${data.paymentRef}`, margin, y);
      y += 4;
    }
    
    if (data.change !== undefined && data.change > 0) {
      doc.text(`Change: ${kes(data.change)}`, margin, y);
      y += 4;
    }
  }

  // Footer
  doc.line(margin, y, 75, y);
  y += 6;
  
  doc.setFontSize(7);
  const footerLines = footer.split('\n');
  footerLines.forEach((line: string) => {
    doc.text(line, 40, y, { align: 'center' });
    y += 3;
  });
  y += 2;
  doc.text('Powered by Zimora Cloud POS', 40, y, { align: 'center' });

  const fileName = `${documentType}-${data.orderNo}.pdf`;
  doc.save(fileName);
  return fileName;
}

// Advanced PDF generation that can capture React components
export async function generateReceiptFromComponent(componentElement: HTMLElement, fileName: string) {
  // This would require html2canvas or similar library to capture the component
  // For now, this is a placeholder for future enhancement
  console.log('Advanced PDF generation from component - to be implemented');
  return fileName;
}

/* ── Misc ─────────────────────────────────────────────────────────── */

let idCounter = 100;
export function uid(prefix = "id") {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}
