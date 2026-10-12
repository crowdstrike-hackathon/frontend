const BOARD_COLS = 22;
const BOARD_ROWS = 6;

function frame(lines) {
  const top = Math.floor((BOARD_ROWS - lines.length) / 2);
  return Array.from({ length: BOARD_ROWS }, (_, r) => {
    const line = lines[r - top] || "";
    const cells = line.replace(/\{[A-Z]\}/g, "#").length;
    return " ".repeat(Math.max(0, Math.floor((BOARD_COLS - cells) / 2))) + line;
  });
}

export const BOARD_FRAMES = [
  frame(["{B}{B} TICKET RECEIVED {B}{B}", "", "TEXT IS UNTRUSTED", "AGENT STARTS WORK"]),
  frame(["{R}{R} SEND EMAIL BLOCKED {R}{R}", "", "KEY TO WRONG ADDRESS", "SOURCE: THE TICKET"]),
  frame(["{Y}{Y} REFUND ON HOLD {Y}{Y}", "", "ABOVE THE LIMIT", "WAITING FOR A PERSON"]),
  frame(["{G}{G} REPLY ALLOWED {G}{G}", "", "NO SECRETS INSIDE", "TICKET RESOLVED"]),
];

export const DUSK = { skyTopColor: "#27356f", skyBottomColor: "#f0a184", cloudColor: "#ffe6d2" };

export const TECHS = [
  { quote: "A ticket asks the agent to email a key to a new address that only the ticket mentions.", name: "Data exfiltration", title: "Secret to an unverified destination" },
  { quote: "One customer asks for another customer's key, on their behalf.", name: "Cross-tenant access", title: "Tool call outside the ticket's account" },
  { quote: "A sender who is not on file asks for the key to be pasted into the reply.", name: "Reply-channel leak", title: "Secret in the answer to a stranger" },
  { quote: "A ticket asks for a refund far above what support can grant.", name: "Tool misuse", title: "Money moved without approval" },
  { quote: "The key is base64 encoded or split up so a text match will miss it.", name: "Encoded payloads", title: "Obfuscated secret in outgoing text" },
  { quote: "Instructions hidden in a polite request, with none of the usual trigger phrases.", name: "Indirect prompt injection", title: "Untrusted text steering tools" },
];
