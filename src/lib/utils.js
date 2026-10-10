import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const SEVERITY_COLOR = {
  critical: "#e11d48",
  high: "#d97706",
  medium: "#ca8a04",
  low: "#64748b",
  info: "#94a3b8",
};

export const VERDICT_STYLE = {
  malicious: { text: "text-rose-600", ring: "ring-rose-500/40", bg: "bg-rose-500/10", label: "MALICIOUS" },
  suspicious: { text: "text-amber-600", ring: "ring-amber-500/40", bg: "bg-amber-500/10", label: "SUSPICIOUS" },
  benign: { text: "text-emerald-600", ring: "ring-emerald-500/40", bg: "bg-emerald-500/10", label: "BENIGN" },
};

export const DOMAIN_ICON = {
  auth: "key",
  identity: "fingerprint",
  endpoint: "monitor",
  network: "wifi",
  cloud: "cloud",
  email: "mail",
};
