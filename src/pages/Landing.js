import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Check, CircleAlert, EyeOff, Copy, Cpu, Hand, Inbox, Rocket, Route, Scale, ShieldCheck, X } from "lucide-react";
import {
  CloudShader,
  TextFlippingBoard,
  TextGenerateEffect,
  TextHoverEffect,
  BentoGrid,
  BentoGridItem,
  Timeline,
  InfiniteMovingCards,
} from "../ui/aceternity";
import SiteNav from "../components/SiteNav";
import { useAuth } from "../context/AuthContext";
import { BOARD_FRAMES, DUSK, TECHS } from "../lib/content";
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
          <img src={shotBlock} alt="The Riposte console blocking an email that would send a customer's API key to an address that only appears in the ticket" className="block w-full rounded-xl border border-slate-200 shadow-lg md:rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

const DEMO = [
  { tab: "An email arrives", at: 0, text: "Every inbound email shows what Nova would do with it and what Riposte would allow, before anything is sent." },
  { tab: "No defense", at: 7, text: "A polite ticket asks for the API key to go to a partner address. With nothing checking the tool calls, the key leaves." },
  { tab: "Riposte on", at: 14.6, text: "Same ticket, same model. The email is blocked because the address appears only in the ticket, and the key may only go to its owner." },
  { tab: "A person decides", at: 24.3, text: "The reply to the customer waits for the operator to approve it, and only then goes out." },
];

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
      <SectionHeading eyebrow="Demo" sub="One support inbox, one agent, and the same ticket with and without the firewall.">
        Watch a ticket try to steal a key
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
            aria-label="Screen recording of the Riposte console: an email asks for an API key to be sent to an outside address, the key leaves with the defense off, and Riposte blocks the same request"
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

function StatusBoard() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % BOARD_FRAMES.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="px-4 py-24 md:py-32">
      <SectionHeading eyebrow="Live status" sub="The agent proposes, Riposte checks, and a person sends the message.">
        Every tool call, called out as it happens
      </SectionHeading>
      <div className="dark">
        <TextFlippingBoard rows={BOARD_FRAMES[idx]} duration={0.5} />
      </div>
    </section>
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
          <Row label="body" value="Here is the API key: nw_live_b377…9cee" tone="amber" source="no source" />
        </div>
      </FeatureHeader>
    ),
  },
  {
    icon: <ShieldCheck className="h-4 w-4 text-emerald-600" />,
    title: "Secrets stay with their owner",
    description: "A customer's key can only travel to that customer's address on file, whatever the email says.",
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
          <div className="flex justify-between gap-2 text-slate-800"><span className="truncate">Fetch the API key</span><span className="shrink-0 text-emerald-700">Allowed</span></div>
          <div className="flex justify-between gap-2 text-slate-800"><span className="truncate">Email it to the partner</span><span className="shrink-0 text-red-700">Riposte blocks</span></div>
          <div className="flex justify-between gap-2 text-slate-800"><span className="truncate">Reply to the sender</span><span className="shrink-0 text-amber-700">Asks you first</span></div>
        </div>
      </FeatureHeader>
    ),
  },
  {
    icon: <Copy className="h-4 w-4 text-rose-600" />,
    title: "A decoy key exposes hidden leaks",
    description: "When a message could depend on a key it does not contain, the step is run again with a decoy key. If the message changes, it is carrying the secret.",
    header: (
      <FeatureHeader>
        <div className="space-y-1.5 font-mono text-[11.5px]">
          <div className="flex justify-between gap-2 text-slate-800"><span>real key</span><span className="truncate text-slate-500">“It ends in 9cee”</span></div>
          <div className="flex justify-between gap-2 text-slate-800"><span>decoy key</span><span className="truncate text-red-700">“It ends in 41fa”</span></div>
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
          <Row value="nw_live_b377…" tone="red" source="verbatim" />
          <Row value="bndfbGl2ZV9i…" tone="red" source="encoded" />
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
  { title: "Re-run", content: <StepCard>If an outgoing message could depend on a key its recipient may not see, the same step runs again with a decoy key. A message that changes with the key is blocked, even though the key is not in it.</StepCard> },
  { title: "Approve", content: <StepCard>Held calls and every message to a customer wait for a person, with the evidence beside them. Approve and the tool runs. Deny and the agent is told, and carries on with the rest.</StepCard> },
  { title: "Explain", content: <StepCard>Every decision comes with the reason and the source of each value, so a security team can audit what the agent did and why it was stopped.</StepCard> },
];

const BUYERS = [
  {
    icon: <CircleAlert className="h-4 w-4 text-rose-600" />,
    title: "The problem",
    text: "Agents read text written by strangers and then call tools with real permissions. One email, ticket or web page can turn a helpful agent into an insider.",
  },
  {
    icon: <Building2 className="h-4 w-4 text-sky-600" />,
    title: "Who uses it and who pays",
    text: "Teams shipping agents that touch customer data: support, IT helpdesk, finance operations. The security team buys it, the same way it buys an API gateway or a WAF.",
  },
  {
    icon: <Scale className="h-4 w-4 text-emerald-600" />,
    title: "How it is different",
    text: "Prompt filters and classifier guardrails judge the wording of the input, so a polite attack passes and an innocent word gets flagged. Riposte ignores the wording and checks the action.",
  },
  {
    icon: <Rocket className="h-4 w-4 text-amber-600" />,
    title: "From prototype to launch",
    text: "Today it is a gateway around one support agent, with a live inbox, a preview of every plan and an approval step. Next is a drop-in proxy for MCP and function-calling APIs, policy as code, and an approval queue in Slack.",
  },
];

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

      <StatusBoard />

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
        <SectionHeading eyebrow="Attacks" sub="The console has a live inbox. Email the support desk yourself and watch what the agent tries to do. These are the ways people try.">
          What it is built to stop
        </SectionHeading>
        <InfiniteMovingCards items={TECHS} speed="slow" className="mx-auto" />
        <InfiniteMovingCards items={[...TECHS].reverse()} speed="slow" direction="right" className="mx-auto mt-4" />
      </section>

      <section id="buyers" className="scroll-mt-24 px-4 pb-24 md:px-8 md:pb-32">
        <SectionHeading eyebrow="Who it's for" sub="Built for the teams putting agents in front of customers this year.">
          A security control, not a prompt
        </SectionHeading>
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
          {BUYERS.map((b) => (
            <div key={b.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-sky-50 ring-1 ring-sky-100">{b.icon}</span>
                <h3 className="text-base font-semibold text-slate-900">{b.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-10 md:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] shadow-2xl">
          <CloudShader className="absolute inset-0" speed={0.7} count={4} {...DUSK} />
          <div className="pointer-events-none absolute inset-0 bg-[#1a1f4a]/45" />
          <div className="relative z-10 flex flex-col items-center px-6 py-24 text-center md:py-32">
            <h2 className="text-4xl font-bold tracking-tight text-white [text-shadow:0_2px_4px_rgba(10,12,40,0.6),0_4px_30px_rgba(10,12,40,0.55)] md:text-6xl">Write the email that beats it</h2>
            <p className="mt-5 max-w-xl text-lg font-medium text-white [text-shadow:0_1px_3px_rgba(10,12,40,0.9)]">Send the support desk an email, turn the defense off, and steal a key. Then turn Riposte on and try again.</p>
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
