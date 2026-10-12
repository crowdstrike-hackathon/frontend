import React, { useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

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
    <div className="rounded-3xl border border-slate-200 bg-white p-2.5 shadow-lg shadow-sky-900/5">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Sender address, e.g. someone@example.com" aria-label="Sender address" className="h-9 rounded-full text-[13px]" />
        <Select value={account} onValueChange={pick}>
          <SelectTrigger className="h-9 rounded-full text-[13px]" aria-label="Matched account">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>No account matched</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.id} · {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-2 flex items-end gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={onKey}
          rows={2}
          placeholder="Write a ticket as a customer, or as an attacker. Try to make Nova leak a key."
          className="max-h-40 min-h-[52px] flex-1 resize-none border-0 px-2 shadow-none focus-visible:ring-0"
        />
        {busy ? (
          <Button size="icon" variant="outline" onClick={onStop} aria-label="Stop the run">
            <Square />
          </Button>
        ) : (
          <Button size="icon" disabled={!ready} onClick={send} aria-label="Send ticket">
            <ArrowUp />
          </Button>
        )}
      </div>
    </div>
  );
}
