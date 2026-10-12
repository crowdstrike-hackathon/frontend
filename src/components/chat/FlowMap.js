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
const TOOL_ICON = { read_ticket: FileText, search_kb: Search, get_customer: UserRound, get_api_key: KeyRound, issue_refund: CircleDollarSign, send_email: Mail, reply: MessageSquareReply };

const SOURCE_STYLE = {
  trusted: { fill: "rgba(45,212,191,0.10)", stroke: "rgba(45,212,191,0.55)", text: "#99F6E4", tag: null },
  requester: { fill: "rgba(56,189,248,0.10)", stroke: "rgba(56,189,248,0.55)", text: "#BAE6FD", tag: null },
  untrusted: { fill: "rgba(251,146,60,0.14)", stroke: "rgba(251,146,60,0.85)", text: "#FED7AA", tag: "untrusted" },
};
const STATUS_STYLE = {
  allowed: { fill: "rgba(148,163,184,0.10)", stroke: "rgba(148,163,184,0.45)", text: "#E2E8F0", tag: null },
  approved: { fill: "rgba(148,163,184,0.10)", stroke: "rgba(148,163,184,0.45)", text: "#E2E8F0", tag: "approved" },
  failed: { fill: "rgba(148,163,184,0.06)", stroke: "rgba(148,163,184,0.30)", text: "#94A3B8", tag: "failed" },
  held: { fill: "rgba(251,191,36,0.12)", stroke: "rgba(251,191,36,0.80)", text: "#FDE68A", tag: "held" },
  blocked: { fill: "rgba(248,113,113,0.14)", stroke: "rgba(248,113,113,0.90)", text: "#FECACA", tag: "blocked" },
  denied: { fill: "rgba(248,113,113,0.14)", stroke: "rgba(248,113,113,0.90)", text: "#FECACA", tag: "denied" },
  leaked: { fill: "rgba(239,68,68,0.32)", stroke: "#EF4444", text: "#FEE2E2", tag: "leaked" },
};
const EDGE_STYLE = {
  trusted: { color: "rgba(148,163,184,0.55)", width: 1.3, flow: true },
  untrusted: { color: "#FB923C", width: 2, flow: true },
  secret: { color: "#FBBF24", width: 2, flow: true },
  record: { color: "#C4B5FD", width: 1.6, flow: true },
  out: { color: "rgba(148,163,184,0.55)", width: 1.3, flow: true },
  held: { color: "#FBBF24", width: 1.4, flow: false },
  stopped: { color: "#F87171", width: 1.6, flow: false },
  leak: { color: "#EF4444", width: 2.2, flow: true },
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
  return (
    <g className="cursor-pointer" style={{ opacity: dim ? 0.16 : 1, transition: "opacity 300ms" }} onClick={onClick}>
      {pulse && (
        <rect x={x - 3} y={y - 3} width={NODE_W + 6} height={NODE_H + 6} rx={11} fill="none" stroke={style.stroke} strokeWidth={1.5} className="flowmap-pulse" />
      )}
      <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={9} fill={style.fill} stroke={style.stroke} strokeWidth={selected ? 2.2 : 1} strokeDasharray={dashed ? "5 4" : undefined} />
      {Icon && <Icon x={x + 12} y={y + NODE_H / 2 - 8} width={16} height={16} color={style.text} strokeWidth={1.8} />}
      <text x={x + 36} y={y + 20} fill={style.text} fontSize={12.5} fontWeight={600} fontFamily={mono ? "Geist Mono, SF Mono, Menlo, monospace" : undefined}>{title}</text>
      <text x={x + 36} y={y + 36} fill={style.text} fillOpacity={0.62} fontSize={11}>{sub}</text>
      {tag && (
        <text x={x + NODE_W - 6} y={y - 4} fill={style.stroke} fontSize={9} fontWeight={600} textAnchor="end" letterSpacing="0.08em">{tag.toUpperCase()}</text>
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
    <g style={{ opacity: dim ? 0.08 : 1, transition: "opacity 300ms" }}>
      <title>{label}</title>
      <path d={d} fill="none" stroke={s.color} strokeWidth={s.width} strokeOpacity={s.flow ? 0.25 : 0.55} strokeDasharray={wall ? "4 4" : undefined} />
      {s.flow && <path d={d} fill="none" stroke={s.color} strokeWidth={s.width} strokeDasharray="3 11" strokeLinecap="round" className="flowmap-dash" />}
      {wall && (
        <g>
          <rect x={mx - 12} y={my - 12} width={24} height={24} rx={6} fill="#071A33" stroke={s.color} strokeWidth={1.4} />
          {kind === "stopped"
            ? <ShieldX x={mx - 8} y={my - 8} width={16} height={16} color={s.color} strokeWidth={2} />
            : <Hand x={mx - 7} y={my - 7} width={14} height={14} color={s.color} strokeWidth={2} />}
        </g>
      )}
    </g>
  );
}

export default function FlowMap({ turn }) {
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
    <div className="overflow-hidden rounded-lg border border-[#13325C] bg-[#071A33] text-slate-200">
      <style>{`
        @keyframes flowmap-dash { to { stroke-dashoffset: -28; } }
        @keyframes flowmap-pulse { 0%,100% { opacity: .15; } 50% { opacity: .7; } }
        @media (prefers-reduced-motion: no-preference) {
          .flowmap-dash { animation: flowmap-dash 1.1s linear infinite; }
          .flowmap-pulse { animation: flowmap-pulse 2.2s ease-in-out infinite; }
        }
      `}</style>
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
        <span className="text-[12.5px] font-semibold tracking-wide text-white">Information map</span>
        <span className="truncate text-[12px] text-slate-400">Where each piece of information came from, and where it went</span>
        <button onClick={replay} className="ml-auto flex shrink-0 items-center gap-1.5 rounded-md border border-white/15 px-2.5 py-1 text-[12px] text-slate-200 transition-colors hover:bg-white/10">
          <Play className="h-3 w-3" /> Replay
        </button>
      </div>
      <div className="grid grid-cols-3 px-4 pt-3 text-center text-[10.5px] font-medium uppercase tracking-[0.12em] text-slate-500">
        <span>Where it came from</span>
        <span>What the agent did</span>
        <span>Where it went</span>
      </div>
      <svg viewBox={`0 0 ${W} ${height}`} width="100%" role="img" aria-label="Information flow map" className="block">
        <defs>
          <pattern id="flowmap-dots" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(148,163,184,0.10)" />
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
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 pb-2 text-[11px] text-slate-400">
        <Legend color="#FB923C" label="From the stranger's email" />
        <Legend color="#FBBF24" label="Carries a secret" />
        <Legend color="rgba(148,163,184,0.8)" label="Trusted" />
        <span className="flex items-center gap-1.5"><ShieldX className="h-3 w-3 text-red-400" /> Stopped by Riposte</span>
      </div>
      <div className={cn("border-t border-white/10 px-4 py-3 text-[13px] leading-relaxed", focus ? "text-slate-100" : "text-slate-300")}>
        {info}
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <svg width="18" height="6" aria-hidden="true"><line x1="0" y1="3" x2="18" y2="3" stroke={color} strokeWidth="2" strokeDasharray="3 3" /></svg>
      {label}
    </span>
  );
}
