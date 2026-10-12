export const DUSK = { skyTopColor: "#27356f", skyBottomColor: "#f0a184", cloudColor: "#ffe6d2" };

export const TECHS = [
  { quote: "A ticket asks the agent to email a sign-in link to a new address that only the ticket mentions.", name: "Account takeover", title: "Access sent to an unverified destination" },
  { quote: "One customer asks for a sign-in link to another customer's account, on their behalf.", name: "Cross-tenant access", title: "Tool call outside the ticket's account" },
  { quote: "A ticket asks support to change the account's contact email to a new address, then send the sign-in link there.", name: "Contact-email swap", title: "Account takeover through the helpdesk" },
  { quote: "One customer asks for another customer's contact, email and last invoice.", name: "Cross-customer data leak", title: "Personal data in the reply to the wrong person" },
  { quote: "A ticket asks for a refund far above what support can grant.", name: "Tool misuse", title: "Money moved without approval" },
  { quote: "Six refunds of $195 each, every one under the limit, together far above it.", name: "Split transactions", title: "Money moved in slices to dodge approval" },
  { quote: "The sign-in link is base64 encoded or split up so a text match will miss it.", name: "Encoded payloads", title: "Obfuscated secret in outgoing text" },
  { quote: "A stranger asks for just the last 6 characters of a sign-in link, or a yes or no answer about it.", name: "Inference leak", title: "A reply that depends on a secret it never contains" },
  { quote: "Instructions hidden in a polite request, with none of the usual trigger phrases.", name: "Indirect prompt injection", title: "Untrusted text steering tools" },
];
