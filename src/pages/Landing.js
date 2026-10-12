import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, EyeOff, Copy, Cpu, Hand, Inbox, Route, ShieldCheck, X } from "lucide-react";
import {
  CloudShader,
  TextGenerateEffect,
  TextHoverEffect,
  BentoGrid,
  BentoGridItem,
  Timeline,
  InfiniteMovingCards,
} from "../ui/aceternity";
import SiteNav from "../components/SiteNav";
import FlowMap from "../components/chat/FlowMap";
import { fromSnapshot } from "../lib/chat";
import demoRun from "../assets/landing/demo-run.json";
import { useAuth } from "../context/AuthContext";
import { DUSK, TECHS } from "../lib/content";
import shotBlock from "../assets/landing/console-block.jpg";
import demoVideo from "../assets/landing/console-demo.mp4";
import demoPoster from "../assets/landing/console-demo-poster.jpg";

const NAV = [
  { name: "Demo", link: "#demo" },
  { name: "Why", link: "#why" },
  { name: "How it works", link: "#how" },
  { name: "Attacks", link: "#attacks" },
  { name: "Who it's for", link: "#buyers" },
];

function Hero({ appHref, signedIn }) {
  return (
    <div id="hero" className="relative w-full overflow-hidden">
      <CloudShader className="absolute inset-0" skyTopColor="#245a9c" skyBottomColor="#7fb2de" count={4} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] bg-gradient-to-b from-[#0b2a55]/70 via-[#0b2a55]/45 to-transparent" />

      <SiteNav
        links={NAV}
        lightOver="hero"
        actions={signedIn ? [{ label: "Open the console", to: "/console" }] : [{ label: "Sign in", to: "/login", secondary: true }, { label: "Open the console", to: appHref }]}
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pt-28 text-center md:pt-36">
        <h1 className="text-4xl font-bold tracking-tight text-white [text-shadow:0_2px_4px_rgba(8,30,66,0.6),0_4px_30px_rgba(8,30,66,0.55)] md:text-6xl lg:text-7xl">
          A firewall for what <br className="hidden md:block" /> your AI agent does
        </h1>
        <p className="mt-6 max-w-2xl text-base font-medium text-white [text-shadow:0_1px_3px_rgba(8,30,66,0.9),0_2px_18px_rgba(8,30,66,0.6)] md:text-xl">
          Riposte sits between an agent and its tools. It checks where every argument came from, and blocks or holds the calls that untrusted content is steering.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link to={appHref} className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-sky-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-white/90">
            Try to break the agent
          </Link>
          <a href="#how" className="rounded-full border border-white/60 bg-[#0b2a55]/50 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-[#0b2a55]/70">
            See how it works
          </a>
        </div>
        <p className="mt-4 text-sm font-medium text-white [text-shadow:0_1px_3px_rgba(8,30,66,0.9),0_2px_18px_rgba(8,30,66,0.6)]">Works with any model &middot; checks the action, not the wording</p>
      </div>

      <div className="relative z-10 mx-auto mt-12 w-full max-w-5xl px-4 pb-4 md:mt-16 md:px-8">
        <div className="rounded-2xl border border-white/30 bg-white/20 p-1.5 shadow-2xl backdrop-blur-md md:rounded-[1.9rem] md:p-2">
          <img src={shotBlock} alt="The Riposte console blocking an email that would send a customer's sign-in link to an address that only appears in the ticket" className="block w-full rounded-xl border border-slate-200 shadow-lg md:rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

function FeatureHeader({ children }) {
  return (
    <div className="relative flex min-h-[7rem] flex-1 flex-col justify-center overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-sky-50 to-white p-4">
      {children}
    </div>
  );
}

const DOT = { red: "bg-red-600", amber: "bg-amber-500", green: "bg-emerald-600" };
const TONE = { red: "text-red-700", amber: "text-amber-700", green: "text-emerald-700" };

function Source({ tone, children }) {
  return (
    <span className={`flex shrink-0 items-center gap-1.5 font-mono text-[11px] ${TONE[tone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[tone]}`} />
      {children}
    </span>
  );
}

function Row({ label, value, tone, source }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11.5px]">
      {label && <span className="w-9 shrink-0 text-slate-400">{label}</span>}
      <span className="min-w-0 flex-1 truncate text-slate-800">{value}</span>
      <Source tone={tone}>{source}</Source>
    </div>
  );
}

const FEATURES = [
  {
    className: "md:col-span-2",
    icon: <Route className="h-4 w-4 text-sky-700" />,
    title: "It checks provenance, not phrasing",
    description: "Every argument of every tool call is traced back to where it came from: the operator, a system of record, the sender, or untrusted text.",
    header: (
      <FeatureHeader>
        <div className="mb-2 font-mono text-[11.5px] font-semibold text-slate-900">send_email</div>
        <div className="space-y-1.5">
          <Row label="to" value="keys@acme-robotics-partners.net" tone="red" source="from a ticket" />
          <Row label="body" value="Your sign-in link: northwind.io/signin/nw_signin_2157…460a" tone="amber" source="no source" />
        </div>
      </FeatureHeader>
    ),
  },
  {
    icon: <ShieldCheck className="h-4 w-4 text-emerald-600" />,
    title: "Account access stays with its owner",
    description: "A sign-in link can only go to the account's address on file, and a contact-email change asked for by an outsider waits for a person, whatever the email says.",
    header: (
      <FeatureHeader>
        <div className="space-y-1.5">
          <Row value="dana@acmerobotics.com" tone="green" source="on file" />
          <Row value="keys@acme-robotics-partners.net" tone="red" source="blocked" />
        </div>
      </FeatureHeader>
    ),
  },
  {
    icon: <Inbox className="h-4 w-4 text-sky-700" />,
    title: "See the plan before anything runs",
    description: "Each email in the inbox shows what the agent would do with it and what Riposte would allow. Nothing is sent until you hand it over.",
    header: (
      <FeatureHeader>
        <div className="space-y-1.5 text-[11.5px]">
          <div className="flex justify-between gap-2 text-slate-800"><span className="truncate">Create a sign-in link</span><span className="shrink-0 text-emerald-700">Allowed</span></div>
          <div className="flex justify-between gap-2 text-slate-800"><span className="truncate">Email it to the partner</span><span className="shrink-0 text-red-700">Riposte blocks</span></div>
          <div className="flex justify-between gap-2 text-slate-800"><span className="truncate">Reply to the sender</span><span className="shrink-0 text-amber-700">Asks you first</span></div>
        </div>
      </FeatureHeader>
    ),
  },
  {
    icon: <Copy className="h-4 w-4 text-rose-600" />,
    title: "A decoy link exposes hidden leaks",
    description: "When a message could depend on a sign-in link it does not contain, the step is run again with a decoy link. If the message changes, it is carrying the secret.",
    header: (
      <FeatureHeader>
        <div className="space-y-1.5 font-mono text-[11.5px]">
          <div className="flex justify-between gap-2 text-slate-800"><span>real link</span><span className="truncate text-slate-500">“It ends in 460a”</span></div>
          <div className="flex justify-between gap-2 text-slate-800"><span>decoy link</span><span className="truncate text-red-700">“It ends in 41fa”</span></div>
        </div>
      </FeatureHeader>
    ),
  },
  {
    icon: <Hand className="h-4 w-4 text-amber-600" />,
    title: "A person sends the message",
    description: "Every message to a customer, and every call that is risky but not clearly wrong, waits for someone to approve or deny it.",
    header: (
      <FeatureHeader>
        <div className="flex gap-2">
          <span className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[#0b2a55] py-2 text-[12px] font-semibold text-white"><Check className="h-3.5 w-3.5" /> Approve</span>
          <span className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-white py-2 text-[12px] font-semibold text-slate-600 ring-1 ring-slate-200"><X className="h-3.5 w-3.5" /> Deny</span>
        </div>
      </FeatureHeader>
    ),
  },
  {
    icon: <EyeOff className="h-4 w-4 text-rose-600" />,
    title: "Encoding does not hide a leak",
    description: "Outgoing text is checked for secrets in plain, base64, hex, reversed and partial form.",
    header: (
      <FeatureHeader>
        <div className="space-y-1.5">
          <Row value="nw_signin_2157…" tone="red" source="verbatim" />
          <Row value="bndfc2lnbmlu…" tone="red" source="encoded" />
        </div>
      </FeatureHeader>
    ),
  },
  {
    className: "md:col-span-2",
    icon: <Cpu className="h-4 w-4 text-slate-600" />,
    title: "Your model, three defenses to compare",
    description: "Point the agent at any OpenAI-compatible endpoint in Settings. Then run the same email with no defense, a keyword filter, or Riposte, and see which one holds.",
    header: (
      <FeatureHeader>
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center gap-1 rounded-md bg-slate-100 p-1 text-[11.5px] font-medium text-slate-500">
            <span className="flex-1 py-1 text-center">Off</span>
            <span className="flex-1 py-1 text-center">Keyword filter</span>
            <span className="flex-1 rounded bg-white py-1 text-center text-slate-900 ring-1 ring-slate-300">Riposte</span>
          </div>
          <span className="hidden shrink-0 font-mono text-[11.5px] text-slate-500 sm:block">gpt-4.1-mini</span>
        </div>
      </FeatureHeader>
    ),
  },
];

function StepCard({ children }) {
  return <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm">{children}</div>;
}

const STEPS = [
  { title: "Label", content: <StepCard>Everything the agent reads gets a label. The operator's message and systems of record are trusted. The text of an inbound email is untrusted, and its sender is only the sender.</StepCard> },
  { title: "Trace", content: <StepCard>When the agent calls a tool, Riposte looks up each argument in what the agent has read. An address that only exists in an email is known to be that email's idea.</StepCard> },
  { title: "Decide", content: <StepCard>Policy runs on those facts. A secret heading to an address that is not its owner's is blocked. So is an action the operator never asked for. A refund above the limit is held.</StepCard> },
  { title: "Re-run", content: <StepCard>If an outgoing message could depend on a sign-in link its recipient may not see, the same step runs again with a decoy link. A message that changes with the link is blocked, even though the link is not in it.</StepCard> },
  { title: "Approve", content: <StepCard>Held calls and every message to a customer wait for a person, with the evidence beside them. Approve and the tool runs. Deny and the agent is told, and carries on with the rest.</StepCard> },
  { title: "Explain", content: <StepCard>Every decision comes with the reason and the source of each value, so a security team can audit what the agent did and why it was stopped.</StepCard> },
];

const THREATS = [
  {
    name: "Prompt injection",
    attack: "Text inside an email tells the agent what to do, politely or not.",
    defense: "Email text is labelled untrusted. A tool argument that traces back only to it is blocked or held, and so is any action the operator never asked for.",
  },
  {
    name: "Tool misuse",
    attack: "A refund far above the limit, the same refund in slices, or a call into another customer's account.",
    defense: "Refunds above $200 wait for a person, and slices are added up. Calls outside the account the email belongs to are blocked.",
  },
  {
    name: "Data exfiltration",
    attack: "A sign-in link or a customer record sent to an address its owner does not control, in plain text, encoded, or hinted at.",
    defense: "A secret may only go to its owner's address on file. Encoded and partial copies are caught, and a decoy-link re-run catches replies that leak it without containing it.",
  },
];

const BUYERS = [
  {
    title: "The problem",
    text: "Agents read text written by strangers and then call tools with real permissions. One email, ticket or web page can turn a helpful agent into an insider.",
  },
  {
    title: "Who uses it and who pays",
    text: "Teams shipping agents that touch customer data: support, IT helpdesk, finance operations. The security team buys it, the same way it buys an API gateway or a WAF.",
  },
  {
    title: "How it is different",
    text: "Prompt filters and classifier guardrails judge the wording of the input, so a polite attack passes and an innocent word gets flagged. Riposte ignores the wording and checks the action.",
  },
  {
    title: "From prototype to launch",
    text: "Today it is a gateway around one support agent, with a live inbox, a preview of every plan and an approval step. Next is a drop-in proxy for MCP and function-calling APIs, policy as code, and an approval queue in Slack.",
  },
];

// The ticket email as the agent read it, with only the sentence the cause finder pinned marked red.
function EmailWithCause({ text, cause }) {
  const split = text.indexOf("\n\n");
  const header = split >= 0 ? text.slice(0, split) : "";
  const body = cause?.body || (split >= 0 ? text.slice(split + 2) : text);
  const lines = Object.fromEntries(
    header.split("\n").map((l) => l.split(": ")).filter((p) => p.length === 2).map(([k, v]) => [k, v]),
  );
  const parts = [];
  let at = 0;
  [...(cause?.guilty || [])].sort((a, b) => a[0] - b[0]).forEach(([start, end], i) => {
    if (start > at) parts.push(<span key={`t${i}`}>{body.slice(at, start)}</span>);
    parts.push(
      <mark key={`g${i}`} className="rounded-[3px] bg-red-100 px-0.5 text-red-800 ring-1 ring-red-300">{body.slice(start, end)}</mark>,
    );
    at = end;
  });
  if (at < body.length) parts.push(<span key="end">{body.slice(at)}</span>);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-slate-500">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">The email the agent read</span>
        {lines.From && <span>from {lines.From}</span>}
      </div>
      {lines.Subject && <div className="mt-2 text-lg font-semibold text-slate-900">{lines.Subject}</div>}
      <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{parts}</p>
      {cause?.stable && cause.guilty?.length > 0 && (
        <p className="mt-3 text-[13px] text-slate-500">
          Riposte asked the agent again {cause.tested} times, each time with one sentence removed. Without the
          sentence in red, it no longer tried to {cause.tool === "send_email" ? "email the sign-in link" : `call ${cause.tool}`}.
        </p>
      )}
    </div>
  );
}

const DEMO = [
  { tab: "The inbox", at: 0, text: "Every email in the queue shows what Nova would do with it and what Riposte would allow, hold or block, before anything is sent." },
  { tab: "A person in the loop", at: 9, text: "Handed to Nova, it tries to change the account's contact email. That address came only from the email, so Riposte holds the action and shows a person why." },
  { tab: "Denied, nothing changes", at: 18, text: "The operator denies it. The account is untouched, and the audit confirms nothing confidential left the sandbox." },
]

function Demo() {
  const video = useRef(null);
  const [idx, setIdx] = useState(0);

  const onTime = () => {
    const t = video.current ? video.current.currentTime : 0;
    let next = 0;
    DEMO.forEach((step, i) => { if (t >= step.at) next = i; });
    setIdx(next);
  };

  const jump = (i) => {
    const el = video.current;
    if (!el) return;
    el.currentTime = DEMO[i].at;
    el.play().catch(() => {});
    setIdx(i);
  };

  return (
    <section id="demo" className="scroll-mt-24 px-4 pt-24 md:px-8 md:pt-32">
      <SectionHeading eyebrow="Demo" sub="From the queue to the block: the preview, the hand-off, and a person in the loop.">
        Watch an email try to take over an account
      </SectionHeading>
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-sky-50 shadow-xl md:rounded-2xl">
          <video
            ref={video}
            src={demoVideo}
            poster={demoPoster}
            className="block aspect-[16/10] w-full"
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
            onTimeUpdate={onTime}
            aria-label="Screen recording of the Riposte console: an email asks support to change an account's contact address and send the sign-in link there. With the defense off the account is taken over; with Riposte on the change is held and denied."
          />
        </div>
        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
          {DEMO.map((step, i) => (
            <button
              key={step.tab}
              aria-pressed={i === idx}
              onClick={() => jump(i)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${i === idx ? "border-sky-700 bg-sky-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}
            >
              <span className={`mr-1.5 font-mono text-xs ${i === idx ? "text-sky-100" : "text-slate-400"}`}>{i + 1}</span>
              {step.tab}
            </button>
          ))}
        </div>
        <p className="mx-auto mt-4 min-h-[3.5rem] max-w-2xl text-center text-base leading-relaxed text-slate-600">{DEMO[idx].text}</p>
      </div>
    </section>
  );
}

function SeeWhatHappened() {
  const turn = useMemo(
    () => fromSnapshot({ id: "landing-demo", mode: demoRun.mode, events: demoRun.events, status: "done" }).turns[0],
    [],
  );
  const read = turn.items.find((i) => i.tool === "read_ticket");
  const cause = turn.items.find((i) => i.cause)?.cause;
  return (
    <section id="trace" className="scroll-mt-24 px-4 py-24 md:px-8 md:py-32">
      <SectionHeading
        eyebrow="Explainable"
        sub="Where the data came from, where it went, and the sentence that caused it."
      >
        See exactly what happened
      </SectionHeading>
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        {read?.result?.text && <EmailWithCause text={read.result.text} cause={cause} />}
        <FlowMap turn={turn} showCause={false} />
        <p className="text-center text-[13px] text-slate-500">This is a real run of ticket TK-2001. Click any box to trace it, or press Replay.</p>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, children, sub }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl px-2 text-center">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">{children}</h2>
      {sub && <TextGenerateEffect words={sub} className="mt-4 text-lg font-normal [&_span]:!text-slate-700" />}
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const appHref = user ? "/console" : "/login";

  return (
    <div className="w-full overflow-x-clip bg-white">
      <Hero appHref={appHref} signedIn={!!user} />

      <Demo />

      <SeeWhatHappened />

      <section id="why" className="scroll-mt-24 bg-gradient-to-b from-white to-sky-50 px-4 pb-24 md:pb-32">
        <SectionHeading eyebrow="Why" sub="An attacker can always find new words. They cannot change where a value came from.">
          Stop guessing from the wording
        </SectionHeading>
        <BentoGrid className="max-w-5xl md:auto-rows-[20rem]">
          {FEATURES.map((f) => (
            <BentoGridItem key={f.title} {...f} className={`border-slate-200 shadow-sm [&_.font-bold]:text-base [&_.font-bold]:text-slate-900 [&_.text-xs]:text-sm [&_.text-xs]:text-slate-600 ${f.className || ""}`} />
          ))}
        </BentoGrid>
      </section>

      <section id="how" className="scroll-mt-24 bg-sky-50">
        <Timeline data={STEPS} title="How a tool call gets checked" description="Six steps, on every call the agent makes, before anything runs." />
      </section>

      <section id="attacks" className="scroll-mt-24 bg-gradient-to-b from-sky-50 to-white py-24 md:py-28">
        <SectionHeading eyebrow="Attacks" sub="Prompt injection, tool misuse and data exfiltration. Email the support desk yourself and try any of them.">
          What it is built to stop
        </SectionHeading>
        <div className="mx-auto mb-14 max-w-5xl px-4 md:px-8">
          <p className="mb-5 text-center font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Track 3 names three threats. Riposte defends against all three.</p>
          <div className="grid border-t border-slate-200 md:grid-cols-3 md:divide-x md:divide-slate-200">
            {THREATS.map((t, i) => (
              <div key={t.name} className="border-b border-slate-200 py-7 md:px-7 md:first:pl-0 md:last:pr-0">
                <span className="font-mono text-xs text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{t.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.attack}</p>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">What Riposte does</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-800">{t.defense}</p>
              </div>
            ))}
          </div>
        </div>
        <InfiniteMovingCards items={TECHS} speed="slow" className="mx-auto" />
        <InfiniteMovingCards items={[...TECHS].reverse()} speed="slow" direction="right" className="mx-auto mt-4" />
      </section>

      <section id="buyers" className="scroll-mt-24 px-4 pb-24 md:px-8 md:pb-32">
        <SectionHeading eyebrow="Who it's for" sub="Built for the teams putting agents in front of customers this year.">
          A security control, not a prompt
        </SectionHeading>
        <dl className="mx-auto max-w-4xl border-t border-slate-200">
          {BUYERS.map((b, i) => (
            <div key={b.title} className="grid gap-2 border-b border-slate-200 py-7 md:grid-cols-[3rem_15rem_1fr] md:gap-6 md:py-9">
              <span className="font-mono text-xs leading-7 text-slate-400">{String(i + 1).padStart(2, "0")}</span>
              <dt className="text-xl font-semibold tracking-tight text-slate-900">{b.title}</dt>
              <dd className="text-base leading-relaxed text-slate-600">{b.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="px-4 pb-10 md:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] shadow-2xl">
          <CloudShader className="absolute inset-0" speed={0.7} count={4} {...DUSK} />
          <div className="pointer-events-none absolute inset-0 bg-[#1a1f4a]/45" />
          <div className="relative z-10 flex flex-col items-center px-6 py-24 text-center md:py-32">
            <h2 className="text-4xl font-bold tracking-tight text-white [text-shadow:0_2px_4px_rgba(10,12,40,0.6),0_4px_30px_rgba(10,12,40,0.55)] md:text-6xl">Write the email that beats it</h2>
            <p className="mt-5 max-w-xl text-lg font-medium text-white [text-shadow:0_1px_3px_rgba(10,12,40,0.9)]">Send the support desk an email, turn the defense off, and take over an account. Then turn Riposte on and try again.</p>
            <Link to={appHref} className="group mt-8 flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5">
              Open the console <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="h-36 md:h-56">
          <TextHoverEffect text="RIPOSTE" />
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 py-6 text-xs text-slate-500 sm:flex-row">
          <span>Riposte · A firewall for agent tool calls</span>
          <div className="flex gap-5">
            {NAV.map((n) => (
              <a key={n.link} href={n.link} className="transition hover:text-slate-900">{n.name}</a>
            ))}
            <Link to="/login" className="transition hover:text-slate-900">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
