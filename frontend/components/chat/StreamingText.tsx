"use client";

import { useEffect, useState } from "react";

interface Props {
  text: string;
  onDone?: () => void;
  wordDelayMs?: number;
}

function tokenize(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [];
}

export function StreamingText({ text, onDone, wordDelayMs = 32 }: Props) {
  const tokens = tokenize(text);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
  }, [text]);

  useEffect(() => {
    if (count >= tokens.length) {
      onDone?.();
      return;
    }
    const next = tokens[count];
    const jitter = next.length > 8 ? wordDelayMs + 12 : wordDelayMs;
    const t = window.setTimeout(() => setCount((c) => c + 1), jitter);
    return () => window.clearTimeout(t);
  }, [count, tokens, wordDelayMs, onDone]);

  const shown = tokens.slice(0, count).join("");
  const done = count >= tokens.length;

  return (
    <span className="whitespace-pre-wrap">
      {shown}
      {!done && (
        <span
          aria-hidden
          className="ml-[1px] inline-block h-[1.05em] w-[2px] translate-y-[3px] bg-current align-baseline"
          style={{ animation: "cursor-blink 900ms steps(2, end) infinite" }}
        />
      )}
    </span>
  );
}
