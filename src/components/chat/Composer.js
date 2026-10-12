import React, { useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const NONE = "none";

export default function Composer({ customers, busy, onSend, onStop }) {
  const [from, setFrom] = useState("");
  const [account, setAccount] = useState(NONE);
  const [body, setBody] = useState("");

  const pick = (value) => {
    setAccount(value);
    const customer = customers.find((c) => c.id === value);
    if (customer && !from.trim()) setFrom(customer.email);
  };

  const ready = body.trim() && from.trim().length >= 3 && !busy;

  const send = () => {
    if (!ready) return;
    const text = body.trim();
    const firstLine = text.split("\n")[0];
    onSend({
      from: from.trim(),
      customer_id: account === NONE ? null : account,
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
        placeholder="Write a ticket as a customer, or as an attacker"
        className="block max-h-40 min-h-[56px] w-full resize-none bg-transparent px-4 pt-3.5 text-[15px] leading-relaxed text-ink placeholder:text-ink-4 focus:outline-none"
      />
      <div className="flex items-center gap-2 px-2.5 pb-2.5 pt-1">
        <label className="flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[12.5px] focus-within:border-ink-4 sm:max-w-[250px]">
          <span className="shrink-0 text-ink-4">From</span>
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="someone@example.com"
            aria-label="Sender address"
            className="min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-4 focus:outline-none"
          />
        </label>
        <Select value={account} onValueChange={pick}>
          <SelectTrigger className="hidden h-8 w-auto max-w-[220px] border-line px-2.5 text-[12.5px] text-ink-2 sm:flex" aria-label="Matched account">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>No account matched</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.id} · {c.name}</SelectItem>
            ))}
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
