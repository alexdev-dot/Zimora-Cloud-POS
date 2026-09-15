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

/* ── Misc ─────────────────────────────────────────────────────────── */

let idCounter = 100;
export function uid(prefix = "id") {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}
