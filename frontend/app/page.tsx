"use client";

import {
  ArrowRight,
  CheckCircle2,
  ListChecks,
  Megaphone,
  Palette,
  Sparkles,
  Target,
  Telescope,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AgentCard } from "@/components/canvas/AgentCard";
import { AGENTS, getAgentById } from "@/lib/agents";
import type { Agent } from "@/lib/types";

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 620ms ease-out ${delay}ms, transform 620ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const ICON_MAP: Record<string, typeof Telescope> = {
  Telescope,
  ListChecks,
  Megaphone,
  Target,
  Palette,
};

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-200"
      style={{
        backgroundColor: scrolled ? "rgba(10, 10, 10, 0.72)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #1a1a1a" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-baseline gap-2 text-[15px] font-semibold tracking-tight text-neutral-100"
        >
          <span>mindmap-os</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/demo"
            className="rounded-md px-3 py-1.5 font-mono text-[12px] text-neutral-400 transition-colors hover:text-neutral-100"
          >
            try demo
          </Link>
          <Link
            href="/sign-in"
            className="rounded-md bg-neutral-100 px-3.5 py-1.5 text-[12.5px] font-medium text-neutral-950 transition-colors hover:bg-white"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroPreview() {
  // 0: researcher thinking; 1: researcher done → pm starts + line draws;
  // 2: pm thinking, line marching; 3: pm done, line fading; loop
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const durations = [1800, 500, 2200, 900];
    let cancelled = false;
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;
    function step() {
      if (cancelled) return;
      setPhase(i);
      timeout = setTimeout(() => {
        i = (i + 1) % durations.length;
        step();
      }, durations[i]);
    }
    step();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  const researcher = getAgentById("researcher");
  const pm = getAgentById("pm");
  if (!researcher || !pm) return null;

  const researcherPos = { x: 40, y: 40 };
  const pmPos = { x: 460, y: 200 };

  const researcherWorking = phase === 0;
  const pmWorking = phase === 1 || phase === 2;
  const showLine = phase === 1 || phase === 2 || phase === 3;
  const lineOpacity = phase === 3 ? 0.35 : 1;

  const fromPortX = researcherPos.x + 280;
  const fromPortY = researcherPos.y + 92;
  const toPortX = pmPos.x;
  const toPortY = pmPos.y + 92;
  const bendX = fromPortX + 40;

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: 780, height: 400 }}
    >
      <svg
        className="absolute left-0 top-0 overflow-visible"
        style={{
          width: 1,
          height: 1,
          opacity: showLine ? lineOpacity : 0,
          transition: "opacity 400ms ease-out",
        }}
        aria-hidden
      >
        <path
          d={`M ${fromPortX} ${fromPortY} L ${bendX} ${fromPortY} L ${bendX} ${toPortY} L ${toPortX} ${toPortY}`}
          fill="none"
          stroke={researcher.accentColor}
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 6"
          style={{ animation: "wire-flow 0.9s linear infinite" }}
        />
      </svg>
      <AgentCard
        agent={researcher}
        x={researcherPos.x}
        y={researcherPos.y}
        working={researcherWorking}
      />
      <AgentCard agent={pm} x={pmPos.x} y={pmPos.y} working={pmWorking} />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative pt-16 pb-24">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <div
          className="mb-6 inline-flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.16em]"
          style={{ color: "#c2410c" }}
        >
          <span>$</span>
          <span>your ai cofounder team</span>
        </div>
        <h1 className="mx-auto max-w-4xl text-balance text-[52px] font-semibold leading-[1.02] tracking-tight text-neutral-100 md:text-[68px]">
          Five{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(100deg, #fef3c7 0%, #f97316 45%, #fbbf24 100%)",
            }}
          >
            specialist AI cofounders
          </span>
          .
          <br />
          One canvas. Zero hires.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-[16px] leading-relaxed text-neutral-400">
          The team you&apos;d hire if you weren&apos;t going alone. Available the
          moment you paste in your idea.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 rounded-md bg-neutral-100 px-5 py-2.5 text-[13.5px] font-medium text-neutral-950 transition-colors hover:bg-white"
          >
            Start Building
            <ArrowRight size={14} strokeWidth={2.25} />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-transparent px-5 py-2.5 font-mono text-[13px] text-neutral-300 transition-colors hover:border-neutral-600 hover:text-neutral-100"
          >
            watch it work →
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-14 max-w-5xl px-6">
        <div
          className="relative overflow-hidden rounded-xl border"
          style={{
            backgroundColor: "#0a0a0a",
            borderColor: "#1f1f1f",
            aspectRatio: "16 / 9",
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 border-b"
            style={{
              backgroundColor: "rgba(15, 15, 15, 0.85)",
              borderBottomColor: "#1a1a1a",
              backdropFilter: "blur(4px)",
            }}
          >
            <div className="mx-auto flex h-full max-w-md items-center justify-center gap-2 font-mono text-[10.5px] text-neutral-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span>demo.mindmap-os · auto-playing</span>
            </div>
          </div>
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="border-y border-neutral-900 py-6">
      <Reveal>
        <p className="mx-auto max-w-3xl px-6 text-center font-mono text-[11.5px] text-neutral-500">
          Built for solo founders who&apos;d rather ship than hire.
        </p>
      </Reveal>
    </section>
  );
}

function TeamCard({ agent }: { agent: Agent }) {
  const Icon = ICON_MAP[agent.icon] ?? Telescope;
  return (
    <div
      className="group relative overflow-hidden rounded-md transition-transform duration-200 hover:-translate-y-1"
      style={{
        backgroundColor: "#0a0a0a",
        borderTop: `1px solid ${agent.accentColor}`,
        borderRight: "1px solid #1f1f1f",
        borderBottom: "1px solid #1f1f1f",
        borderLeft: `1px solid ${agent.accentColor}`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${agent.accentColor}44, 0 0 24px ${agent.accentColor}22`,
        }}
      />
      <div
        className="flex h-6 items-center gap-2 border-b px-2.5"
        style={{ backgroundColor: "#0f0f0f", borderBottomColor: "#1f1f1f" }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full transition-colors duration-150 group-hover:!bg-[--dot]"
            style={
              {
                backgroundColor: "#3a1c1c",
                ["--dot" as string]: agent.accentColor,
              } as React.CSSProperties
            }
          />
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "#3a2f18" }}
          />
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "#1a3325" }}
          />
        </div>
        <span className="font-mono text-[10.5px] tracking-tight text-neutral-500">
          {agent.id}@mindmap-os
        </span>
      </div>
      <div className="flex flex-col gap-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-sm border"
            style={{
              backgroundColor: "#131313",
              borderColor: "#242424",
              color: agent.color,
            }}
          >
            <Icon size={16} strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-[13.5px] font-semibold leading-tight tracking-tight text-neutral-100">
              {agent.name}
            </div>
            <div className="mt-0.5 font-mono text-[10.5px] leading-none text-neutral-500">
              {agent.title.toLowerCase()}
            </div>
          </div>
        </div>
        <div
          className="flex items-baseline gap-1.5 font-mono text-[11px] leading-tight"
          style={{ color: "#a3a3a3" }}
        >
          <span style={{ color: agent.accentColor }}>$</span>
          <span className="text-neutral-500">status:</span>
          <span className="text-neutral-300 transition-colors duration-150 group-hover:text-neutral-100">
            <span className="group-hover:hidden">idle</span>
            <span className="hidden group-hover:inline-flex">
              thinking
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    animation: "thinking-dot 1.2s ease-in-out infinite",
                    animationDelay: `${i * 180}ms`,
                  }}
                >
                  .
                </span>
              ))}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function FiveAgents() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="mb-12 text-center">
          <div
            className="mb-3 inline-block font-mono text-[11.5px] uppercase tracking-[0.16em]"
            style={{ color: "#c2410c" }}
          >
            $ ls ./team
          </div>
          <h2 className="text-[36px] font-semibold tracking-tight text-neutral-100 md:text-[44px]">
            Meet your team
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[14.5px] text-neutral-500">
            Five specialists, one shared context. They read each other&apos;s
            work.
          </p>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {AGENTS.map((agent, i) => (
          <Reveal key={agent.id} delay={80 * i}>
            <TeamCard agent={agent} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Tell us your idea",
      description:
        "One paragraph. Or one sentence. Every agent reads from the same context.",
      Icon: Sparkles,
    },
    {
      number: "02",
      title: "Watch your team get to work",
      description:
        "Cards light up. Sub-processes fan out. The system reasons in the open.",
      Icon: Terminal,
    },
    {
      number: "03",
      title: "Walk away with a plan",
      description:
        "Not a to-do list. A PRD, a launch plan, positioning, prospect list, brand direction.",
      Icon: CheckCircle2,
    },
  ];

  return (
    <section
      className="border-y border-neutral-900 py-24"
      style={{ backgroundColor: "#080808" }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mb-12 text-center">
            <div
              className="mb-3 inline-block font-mono text-[11.5px] uppercase tracking-[0.16em]"
              style={{ color: "#c2410c" }}
            >
              $ ./how-it-works
            </div>
            <h2 className="text-[36px] font-semibold tracking-tight text-neutral-100 md:text-[44px]">
              How it works
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map(({ number, title, description, Icon }, i) => (
            <Reveal key={number} delay={100 * i}>
              <div
                className="h-full rounded-lg border p-6"
                style={{ backgroundColor: "#0a0a0a", borderColor: "#1a1a1a" }}
              >
                <div className="mb-5 flex items-center justify-between">
                  <span
                    className="font-mono text-[11px] tracking-[0.12em]"
                    style={{ color: "#c2410c" }}
                  >
                    {number}
                  </span>
                  <Icon
                    size={16}
                    strokeWidth={1.75}
                    className="text-neutral-500"
                  />
                </div>
                <h3 className="text-[17px] font-semibold tracking-tight text-neutral-100">
                  {title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-500">
                  {description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-28 text-center">
      <Reveal>
        <h2 className="text-balance text-[36px] font-semibold leading-tight tracking-tight text-neutral-100 md:text-[48px]">
          Stop context-switching between five ChatGPT tabs.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] text-neutral-500">
          Give your idea a team. Ship in a week what would have taken a quarter
          of indecision.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 rounded-md bg-neutral-100 px-5 py-2.5 text-[13.5px] font-medium text-neutral-950 transition-colors hover:bg-white"
          >
            Start Building
            <ArrowRight size={14} strokeWidth={2.25} />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-transparent px-5 py-2.5 font-mono text-[13px] text-neutral-300 transition-colors hover:border-neutral-600 hover:text-neutral-100"
          >
            watch it work →
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="border-t py-8"
      style={{ backgroundColor: "#080808", borderTopColor: "#1a1a1a" }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6">
        <span className="text-[13px] font-semibold tracking-tight text-neutral-300">
          mindmap-os
        </span>
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/Shashwat711/mindmap-os"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11.5px] text-neutral-500 transition-colors hover:text-neutral-200"
          >
            github
          </a>
          <span className="font-mono text-[11px] text-neutral-600">
            © 2026 mindmap-os
          </span>
        </div>
      </div>
    </footer>
  );
}

function useDarkBody() {
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#0a0a0a";
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, []);
}

export default function LandingPage() {
  useDarkBody();
  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "#0a0a0a",
        color: "#e5e5e5",
      }}
    >
      <Nav />
      <Hero />
      <SocialProof />
      <FiveAgents />
      <HowItWorks />
      <FinalCTA />
      <Footer />
    </main>
  );
}
