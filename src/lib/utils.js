import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const SEVERITY_COLOR = {
  critical: "#fb7185",
  high: "#fb923c",
  medium: "#facc15",
  low: "#94a3b8",
  info: "#64748b",
};

export const VERDICT_STYLE = {
  malicious: { text: "text-rose-300", ring: "ring-rose-500/40", bg: "bg-rose-500/15", label: "MALICIOUS" },
  suspicious: { text: "text-amber-300", ring: "ring-amber-500/40", bg: "bg-amber-500/15", label: "SUSPICIOUS" },
  benign: { text: "text-emerald-300", ring: "ring-emerald-500/40", bg: "bg-emerald-500/15", label: "BENIGN" },
};

export const DOMAIN_ICON = {
  auth: "key",
  identity: "fingerprint",
  endpoint: "monitor",
  network: "wifi",
  cloud: "cloud",
  email: "mail",
};
