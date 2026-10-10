import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const SEVERITY_COLOR = {
  critical: "#ff3b5c",
  high: "#f5a623",
  medium: "#d8cf4a",
  low: "#5b6b82",
  info: "#45526a",
};

export const VERDICT_STYLE = {
  malicious: { text: "text-red", ring: "ring-red/40", bg: "bg-red/10", label: "MALICIOUS" },
  suspicious: { text: "text-amber", ring: "ring-amber/40", bg: "bg-amber/10", label: "SUSPICIOUS" },
  benign: { text: "text-lime", ring: "ring-lime/40", bg: "bg-lime/10", label: "BENIGN" },
};

export const DOMAIN_ICON = {
  auth: "key",
  identity: "fingerprint",
  endpoint: "monitor",
  network: "wifi",
  cloud: "cloud",
  email: "mail",
};
