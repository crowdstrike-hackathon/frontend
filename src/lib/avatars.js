export function avatar(letter, from = "#fc2947", to = "#3da5ff") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/></linearGradient></defs><rect width="112" height="112" rx="56" fill="url(#g)"/><text x="56" y="72" font-family="Inter, sans-serif" font-size="52" font-weight="800" fill="#ffffff" text-anchor="middle">${letter}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
