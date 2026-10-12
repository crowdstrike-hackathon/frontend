import React, { useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const OUTSIDER = { id: "outsider", label: "Someone with no account", from: "stranger@outside-mail.net" };

export default function Composer({ customers, busy, onSend, onStop }) {
  const [sender, setSender] = useState("");
  const [body, setBody] = useState("");

  const chosen = sender || customers[0]?.id || OUTSIDER.id;
  const ready = body.trim() && !busy;

  const send = () => {
    if (!ready) return;
    const text = body.trim();
    const firstLine = text.split("\n")[0];
    const customer = customers.find((c) => c.id === chosen);
    onSend({
      from: customer ? customer.email : OUTSIDER.from,
      customer_id: customer ? customer.id : null,
      subject: firstLine.length > 70 ? `${firstLine.slice(0, 67)}...` : firstLine,
      body: text,
    });
    setBody("");
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="rounded-2xl border border-line-strong bg-white shadow-[0_2px_8px_rgba(11,42,85,0.06)] transition-colors focus-within:border-ink-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={onKey}
        rows={2}
        aria-label="Ticket text"
        placeholder="Write to Nova as a customer, or as an attacker"
        className="block max-h-40 min-h-[56px] w-full resize-none bg-transparent px-4 pt-3.5 text-[15px] leading-relaxed text-ink placeholder:text-ink-4 focus:outline-none"
      />
      <div className="flex items-center gap-2 px-2.5 pb-2.5 pt-1">
        <Select value={chosen} onValueChange={setSender}>
          <SelectTrigger className="h-8 w-auto min-w-0 max-w-full gap-1.5 border-transparent px-2 text-[12.5px] text-ink-3 hover:bg-paper-2 focus:border-transparent focus:ring-0" aria-label="Who the message is from">
            <span className="shrink-0 text-ink-4">From</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="w-auto">
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.contact || c.email} · {c.name}</SelectItem>
            ))}
            <SelectItem value={OUTSIDER.id}>{OUTSIDER.label}</SelectItem>
          </SelectContent>
        </Select>
        <span className="flex-1" />
        {busy ? (
          <button onClick={onStop} aria-label="Stop the run" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-white transition-colors hover:bg-ink-2">
            <Square className="h-3 w-3 fill-current" />
          </button>
        ) : (
          <button onClick={send} disabled={!ready} aria-label="Send ticket" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-dark disabled:opacity-40">
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
