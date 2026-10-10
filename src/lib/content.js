const BOARD_COLS = 22;
const BOARD_ROWS = 6;

// Lays lines out centred on the flipping board. {R} {B} {Y} {G} are colour tiles.
function frame(lines) {
  const top = Math.floor((BOARD_ROWS - lines.length) / 2);
  return Array.from({ length: BOARD_ROWS }, (_, r) => {
    const line = lines[r - top] || "";
    const cells = line.replace(/\{[A-Z]\}/g, "#").length;
    return " ".repeat(Math.max(0, Math.floor((BOARD_COLS - cells) / 2))) + line;
  });
}

export const BOARD_FRAMES = [
  frame(["{R}{R} RED TEAM ONLINE {R}{R}", "", "PROMPT INJECTION", "IN TICKET 48213"]),
  frame(["{B}{B} BLUE TEAM READY {B}{B}", "", "VERDICT: MALICIOUS", "CONFIDENCE 88%"]),
  frame(["{Y}{Y} DECOY FLAGGED {Y}{Y}", "", "AV UPDATE IS NOISE", "DECEPTION FILTERED"]),
  frame(["{G}{G} ANALYST APPROVED {G}{G}", "", "SESSIONS REVOKED", "ATTACK CONTAINED"]),
];

export const DUSK = { skyTopColor: "#27356f", skyBottomColor: "#f0a184", cloudColor: "#ffe6d2" };

export const TECHS = [
  { quote: "Hidden instructions hijack the Nova assistant via a support ticket.", name: "Prompt Injection", title: "T1566.002 · Initial Access" },
  { quote: "Push-bombing until a sleepy user approves an MFA prompt.", name: "MFA Fatigue", title: "T1621 · Credential Access" },
  { quote: "A service account reads AWS credentials it should never touch.", name: "Cloud Credentials", title: "T1552.005 · Credential Access" },
  { quote: "A hijacked session escalates toward production access.", name: "Valid Accounts", title: "T1078 · Lateral Movement" },
  { quote: "Customer PII is staged and pushed to an unknown ASN.", name: "Cloud Exfil", title: "T1530 · Exfiltration" },
];

// CrowdStrike lists Austin, Texas as its headquarters.
export const GLOBE_PINS = [
  { lat: 37.3541, lng: -121.9552, label: "Santa Clara, CA", note: "37.35° N, 121.96° W", letter: "S", colors: ["#0284c7", "#38bdf8"] },
  { lat: 30.2672, lng: -97.7431, label: "CrowdStrike HQ", note: "Austin, TX · 30.27° N, 97.74° W", letter: "C", colors: ["#e11d48", "#fb7185"] },
];
