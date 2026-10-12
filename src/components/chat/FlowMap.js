import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AtSign, BadgeCheck, BookOpen, CircleDollarSign, Database, FileText, KeyRound, Mail, MessageSquareReply,
  Play, Search, ShieldX, UserRound, Hand, Send,
} from "lucide-react";
import { buildFlowGraph, describe, summarize, traceFrom } from "../../lib/flowmap";
import { cn } from "../../lib/utils";

const W = 760;
const NODE_W = 196;
const NODE_H = 50;
const GAP = 14;
const PAD = 18;
const COL_X = [PAD, (W - NODE_W) / 2, W - PAD - NODE_W];

const SOURCE_ICON = { operator: UserRound, mail: Mail, at: AtSign, match: BadgeCheck, key: KeyRound, record: Database, book: BookOpen };
const TOOL_ICON = { read_ticket: FileText, search_kb: Search, get_customer: UserRound, create_login_link: KeyRound, change_contact_email: AtSign, issue_refund: CircleDollarSign, send_email: Mail, reply: MessageSquareReply };

const INK = "#0B2A55";
const INK_3 = "#566A87";
const RED = "#DC2626";
const AMBER = "#D97706";
const GREEN = "#059669";
const SKY = "#0369A1";
const SLATE = "#8194AC";
const HAIR = "rgba(11,42,85,0.16)";

const SOURCE_STYLE = {
  trusted: { accent: GREEN, tag: null },
  requester: { accent: SLATE, tag: null },
  untrusted: { accent: RED, tag: "untrusted", tint: "rgba(220,38,38,0.05)" },
};
const STATUS_STYLE = {
  allowed: { accent: SLATE, tag: null },
  approved: { accent: GREEN, tag: "approved" },
  failed: { accent: SLATE, tag: "failed", muted: true },
  held: { accent: AMBER, tag: "held", tint: "rgba(217,119,6,0.06)" },
  blocked: { accent: RED, tag: "blocked", tint: "rgba(220,38,38,0.05)" },
  denied: { accent: RED, tag: "denied", tint: "rgba(220,38,38,0.05)" },
  leaked: { accent: RED, tag: "leaked", solid: true },
};
const EDGE_STYLE = {
  trusted: { color: "rgba(11,42,85,0.38)", width: 1.2, flow: true },
  untrusted: { color: RED, width: 1.7, flow: true },
  secret: { color: AMBER, width: 1.7, flow: true },
  record: { color: SKY, width: 1.5, flow: true },
  out: { color: "rgba(11,42,85,0.38)", width: 1.2, flow: true },
  held: { color: AMBER, width: 1.4, flow: false },
  stopped: { color: RED, width: 1.5, flow: false },
  leak: { color: RED, width: 2.2, flow: true },
};
const OUT_WORD = { leaked: "Leaked", allowed: "Sent", approved: "Sent after approval", failed: "Failed", held: "Waiting for a person", blocked: "Never sent", denied: "Never sent" };

function clip(text, n) {
  const s = String(text || "");
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function column(list, x, height) {
  const total = list.length * NODE_H + Math.max(0, list.length - 1) * GAP;
  const top = (height - total) / 2;
  return Object.fromEntries(list.map((n, i) => [n.id, { x, y: top + i * (NODE_H + GAP) }]));
}

function Node({ x, y, style, icon: Icon, title, sub, tag, mono, dim, selected, pulse, dashed, onClick }) {
  const solid = style.solid;
  const text = solid ? "#FFFFFF" : style.muted ? INK_3 : INK;
  const subText = solid ? "rgba(255,255,255,0.82)" : INK_3;
  const clip = `flowmap-clip-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g className="flowmap-node cursor-pointer" style={{ opacity: dim ? 0.2 : 1, transition: "opacity 300ms" }} onClick={onClick}>
      {pulse && (
        <rect x={x - 4} y={y - 4} width={NODE_W + 8} height={NODE_H + 8} rx={10} fill="none" stroke={style.accent} strokeWidth={1.5} className="flowmap-pulse" />
      )}
      <clipPath id={clip}><rect x={x} y={y} width={NODE_W} height={NODE_H} rx={7} /></clipPath>
      <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={7} fill={solid ? style.accent : "#FFFFFF"} />
      {style.tint && <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={7} fill={style.tint} />}
      {!solid && <rect x={x} y={y} width={3} height={NODE_H} fill={style.accent} clipPath={`url(#${clip})`} />}
      <rect className="flowmap-frame" x={x} y={y} width={NODE_W} height={NODE_H} rx={7} fill="none"
        stroke={selected ? INK : solid ? style.accent : HAIR} strokeWidth={selected ? 1.6 : 1} strokeDasharray={dashed ? "4 3" : undefined} />
      {Icon && <Icon x={x + 14} y={y + NODE_H / 2 - 8} width={16} height={16} color={solid ? "#FFFFFF" : INK_3} strokeWidth={1.7} />}
      <text x={x + 38} y={y + 21} fill={text} fontSize={12.5} fontWeight={600} fontFamily={mono ? "Geist Mono, SF Mono, Menlo, monospace" : undefined}>{title}</text>
      <text x={x + 38} y={y + 37} fill={subText} fontSize={11}>{sub}</text>
      {tag && (
        <g>
          <circle cx={x + NODE_W - 12 - tag.length * 5.6 - 8} cy={y + 17} r={2.5} fill={solid ? "#FFFFFF" : style.accent} />
          <text x={x + NODE_W - 10} y={y + 20.5} fill={solid ? "#FFFFFF" : style.accent} fontSize={9.5} textAnchor="end" fontFamily="Geist Mono, SF Mono, Menlo, monospace">{tag}</text>
        </g>
      )}
    </g>
  );
}

function Edge({ from, to, kind, dim, label }) {
  const s = EDGE_STYLE[kind] || EDGE_STYLE.trusted;
  const x1 = from.x + NODE_W;
  const y1 = from.y + NODE_H / 2;
  const x2 = to.x - 2;
  const y2 = to.y + NODE_H / 2;
  const d = `M${x1} ${y1} C${x1 + 46} ${y1}, ${x2 - 46} ${y2}, ${x2} ${y2}`;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const wall = kind === "stopped" || kind === "held";
  return (
    <g className="flowmap-in" style={{ opacity: dim ? 0.1 : 1, transition: "opacity 300ms" }}>
      <title>{label}</title>
      <path d={d} fill="none" stroke={s.color} strokeWidth={s.width} strokeOpacity={s.flow ? 0.22 : 0.6} strokeDasharray={wall ? "4 4" : undefined} />
      {s.flow && <path d={d} fill="none" stroke={s.color} strokeWidth={s.width} strokeDasharray="3 11" strokeLinecap="round" className="flowmap-dash" />}
      {wall && (
        <g>
          <rect x={mx - 11} y={my - 11} width={22} height={22} rx={6} fill="#FFFFFF" stroke={s.color} strokeWidth={1.2} />
          {kind === "stopped"
            ? <ShieldX x={mx - 7} y={my - 7} width={14} height={14} color={s.color} strokeWidth={2} />
            : <Hand x={mx - 6.5} y={my - 6.5} width={13} height={13} color={s.color} strokeWidth={2} />}
        </g>
      )}
    </g>
  );
}

export default function FlowMap({ turn, showCause = true }) {
  const graph = useMemo(() => buildFlowGraph(turn), [turn]);
  const [focus, setFocus] = useState(null);
  const [shown, setShown] = useState(Infinity);
  const timer = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  const height = Math.max(graph.sources.length, graph.actions.length, graph.outcomes.length, 1) * (NODE_H + GAP) - GAP + PAD * 2;
  const pos = {
    ...column(graph.sources, COL_X[0], height),
    ...column(graph.actions, COL_X[1], height),
    ...column(graph.outcomes, COL_X[2], height),
  };
  const traced = focus ? traceFrom(graph, focus) : null;
  const order = Object.fromEntries([...graph.sources, ...graph.actions, ...graph.outcomes].map((n) => [n.id, n.order]));
  const visible = (id) => (order[id] ?? 0) < shown;
  const lastStep = graph.actions.length;

  const replay = () => {
    clearInterval(timer.current);
    setFocus(null);
    setShown(0);
    let step = 0;
    timer.current = setInterval(() => {
      step += 1;
      setShown(step);
      if (step >= lastStep) clearInterval(timer.current);
    }, 750);
  };

  const untrustedFeedsStop = graph.sources.some(
    (s) => s.kind === "untrusted" && graph.edges.some((e) => e.from === s.id && ["blocked", "denied", "held"].includes(graph.actions.find((a) => a.id === e.to)?.status)),
  );
  const info = focus ? describe(graph, focus) : summarize(graph);

  return (
    <div className="overflow-hidden rounded-md border border-line bg-white/60 text-ink-2">
      <style>{`
        @keyframes flowmap-dash { to { stroke-dashoffset: -28; } }
        @keyframes flowmap-pulse { 0%,100% { opacity: .1; } 50% { opacity: .55; } }
        @keyframes flowmap-in { from { opacity: 0; } to { opacity: 1; } }
        .flowmap-node:hover .flowmap-frame { stroke: rgba(11,42,85,0.42); }
        @media (prefers-reduced-motion: no-preference) {
          .flowmap-dash { animation: flowmap-dash 1.1s linear infinite; }
          .flowmap-pulse { animation: flowmap-pulse 2.2s ease-in-out infinite; }
          .flowmap-node, .flowmap-in { animation: flowmap-in .4s ease-out both; }
        }
      `}</style>
      <div className="flex items-center gap-3 border-b border-line px-3 py-2">
        <span className="text-[12.5px] font-semibold text-ink">Information map</span>
        <span className="truncate text-[12px] text-ink-3">Where each piece of information came from, and where it went</span>
        <button onClick={replay} className="ml-auto flex shrink-0 items-center gap-1.5 rounded-md border border-line bg-white/70 px-2.5 py-1 text-[12px] font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink">
          <Play className="h-3 w-3" /> Replay
        </button>
      </div>
      <div className="grid grid-cols-3 px-3 pt-3.5 text-center text-[12.5px] font-medium text-ink-3">
        <span>Where it came from</span>
        <span>What the agent did</span>
        <span>Where it went</span>
      </div>
      <svg viewBox={`0 0 ${W} ${height}`} width="100%" role="img" aria-label="Information flow map" className="block">
        <defs>
          <pattern id="flowmap-dots" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="rgba(11,42,85,0.09)" />
          </pattern>
        </defs>
        <rect width={W} height={height} fill="url(#flowmap-dots)" onClick={() => setFocus(null)} />
        {graph.edges.map((e, i) => (
          visible(e.from) && visible(e.to) && pos[e.from] && pos[e.to] ? (
            <Edge key={i} from={pos[e.from]} to={pos[e.to]} kind={e.kind}
              dim={traced && !(traced.has(e.from) && traced.has(e.to))}
              label={e.args.length ? `Carries: ${e.args.join(", ")}` : ""} />
          ) : null
        ))}
        {graph.sources.map((s) => visible(s.id) && (
          <Node key={s.id} {...pos[s.id]} style={SOURCE_STYLE[s.kind] || SOURCE_STYLE.trusted} icon={SOURCE_ICON[s.icon]}
            title={s.label} sub={clip(s.sub, 26)} tag={SOURCE_STYLE[s.kind]?.tag}
            dim={traced && !traced.has(s.id)} selected={focus === s.id}
            pulse={s.kind === "untrusted" && untrustedFeedsStop && !focus}
            onClick={() => setFocus(focus === s.id ? null : s.id)} />
        ))}
        {graph.actions.map((a) => visible(a.id) && (
          <Node key={a.id} {...pos[a.id]} style={STATUS_STYLE[a.status]} icon={TOOL_ICON[a.tool]} mono
            title={a.label} sub={clip(a.sub, 26)} tag={STATUS_STYLE[a.status]?.tag}
            dim={traced && !traced.has(a.id)} selected={focus === a.id}
            onClick={() => setFocus(focus === a.id ? null : a.id)} />
        ))}
        {graph.outcomes.map((o) => visible(o.id) && (
          <Node key={o.id} {...pos[o.id]} style={STATUS_STYLE[o.status]} icon={o.kind === "account" ? CircleDollarSign : Send}
            title={clip(o.label, 20)} sub={`${OUT_WORD[o.status] || o.status}${o.count > 1 ? ` · ${o.count} actions` : ""}`}
            dashed={o.status === "blocked" || o.status === "denied"} pulse={o.status === "leaked" && !focus}
            dim={traced && !traced.has(o.id)} selected={focus === o.id}
            onClick={() => setFocus(focus === o.id ? null : o.id)} />
        ))}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 pb-2.5 pt-1 text-[11px] text-ink-3">
        <Legend color={RED} label="From the stranger's email" />
        <Legend color={AMBER} label="Carries a secret" />
        <Legend color="rgba(11,42,85,0.45)" label="Trusted" />
        <Legend color={SKY} label="Customer record" />
        <span className="flex items-center gap-1.5"><ShieldX className="h-3 w-3 text-red-600" /> Stopped by Riposte</span>
      </div>
      <div className={cn("border-t border-line px-3 py-2.5 text-[13px] leading-relaxed", focus ? "text-ink" : "text-ink-2")}>
        {info}
      </div>
      {showCause && (graph.cause || graph.finding) && <EmailCause cause={graph.cause} />}
    </div>
  );
}

// Points to the email itself, where the cause finder's sentence is marked; the email isn't repeated here.
function EmailCause({ cause }) {
  let text;
  if (!cause) text = "Finding the sentence in the email that caused this\u2026";
  else if (!cause.stable) text = "The agent didn't repeat the action when asked again, so no sentence could be pinned down.";
  else if (!cause.guilty.length) text = `No single sentence in the email did it on its own: removing any one of the ${cause.tested} still led to ${cause.tool}.`;
  else text = `The sentence that made the agent call ${cause.tool} is marked red in the email, in the read_ticket step above.`;
  return <div className="border-t border-white/10 px-4 py-3 text-[12.5px] text-slate-400">{text}</div>;
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <svg width="18" height="6" aria-hidden="true"><line x1="0" y1="3" x2="18" y2="3" stroke={color} strokeWidth="2" strokeDasharray="3 3" /></svg>
      {label}
    </span>
  );
}
