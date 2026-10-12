import React, { useMemo, useRef, useState } from "react";
import { ArrowUp, AtSign, Square, Ticket, UserRound } from "lucide-react";
import { cn } from "../../lib/utils";

const TRIGGER = /(^|\s)@([\w-]*)$/;

export default function Composer({ tickets, customers, busy, onSend, onStop }) {
  const [text, setText] = useState("");
  const [query, setQuery] = useState(null);
  const [cursor, setCursor] = useState(0);
  const field = useRef(null);

  const options = useMemo(
    () => [
      ...tickets.map((t) => ({ id: t.id, label: t.title || t.subject, hint: t.from, icon: Ticket })),
      ...customers.map((c) => ({ id: c.id, label: c.name, hint: c.contact || c.email, icon: UserRound })),
    ],
    [tickets, customers]
  );

  const matches = useMemo(() => {
    if (query === null) return [];
    const q = query.toLowerCase();
    return options.filter((o) => o.id.toLowerCase().includes(q) || o.label.toLowerCase().includes(q)).slice(0, 8);
  }, [options, query]);

  const open = matches.length > 0;
  const ready = text.trim() && !busy;

  const track = (value, caret) => {
    const found = value.slice(0, caret).match(TRIGGER);
    setQuery(found ? found[2] : null);
    setCursor(0);
  };

  const change = (e) => {
    setText(e.target.value);
    track(e.target.value, e.target.selectionStart);
  };

  const pick = (option) => {
    const el = field.current;
    const caret = el.selectionStart;
    const before = text.slice(0, caret).replace(TRIGGER, (_, lead) => `${lead}@${option.id} `);
    const next = before + text.slice(caret);
    setText(next);
    setQuery(null);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(before.length, before.length);
    });
  };

  const mention = () => {
    const el = field.current;
    const caret = el.selectionStart;
    const lead = caret > 0 && !/\s$/.test(text.slice(0, caret)) ? " @" : "@";
    const next = text.slice(0, caret) + lead + text.slice(caret);
    setText(next);
    track(next, caret + lead.length);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret + lead.length, caret + lead.length);
    });
  };

  const send = () => {
    if (!ready) return;
    onSend(text.trim());
    setText("");
    setQuery(null);
  };

  const onKey = (e) => {
    if (open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const step = e.key === "ArrowDown" ? 1 : -1;
        setCursor((c) => (c + step + matches.length) % matches.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        pick(matches[cursor]);
        return;
      }
      if (e.key === "Escape") {
        setQuery(null);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="relative">
      {open && (
        <ul role="listbox" aria-label="References" className="absolute bottom-full left-0 z-20 mb-2 w-full max-w-md overflow-hidden rounded-lg border border-line-strong bg-white p-1 shadow-md">
          {matches.map((o, i) => {
            const Icon = o.icon;
            return (
              <li key={o.id} role="option" aria-selected={i === cursor}>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(o);
                  }}
                  onMouseEnter={() => setCursor(i)}
                  className={cn("flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left", i === cursor && "bg-paper-3")}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-ink-3" />
                  <span className="w-[4.5rem] shrink-0 font-mono text-[11.5px] text-ink-3">{o.id}</span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{o.label}</span>
                  <span className="hidden max-w-[40%] truncate text-[11.5px] text-ink-4 sm:block">{o.hint}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="rounded-2xl border border-line-strong bg-white shadow-[0_2px_8px_rgba(11,42,85,0.06)] transition-colors focus-within:border-ink-4">
        <textarea
          ref={field}
          value={text}
          onChange={change}
          onKeyDown={onKey}
          onClick={(e) => track(text, e.target.selectionStart)}
          onBlur={() => setQuery(null)}
          rows={2}
          aria-label="Message Nova"
          placeholder="Message Nova. Type @ to bring in a ticket or a customer."
          className="block max-h-40 min-h-[56px] w-full resize-none bg-transparent px-4 pt-3.5 text-[15px] leading-relaxed text-ink placeholder:text-ink-4 focus:outline-none"
        />
        <div className="flex items-center gap-2 px-2.5 pb-2.5 pt-1">
          <button onClick={mention} aria-label="Reference a ticket or customer" className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink">
            <AtSign className="h-4 w-4" />
          </button>
          <span className="flex-1" />
          {busy ? (
            <button onClick={onStop} aria-label="Stop" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-white transition-colors hover:bg-ink-2">
              <Square className="h-3 w-3 fill-current" />
            </button>
          ) : (
            <button onClick={send} disabled={!ready} aria-label="Send" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-dark disabled:opacity-40">
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
