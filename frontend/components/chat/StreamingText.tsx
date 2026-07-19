"use client";

import { useEffect, useState } from "react";

interface Props {
  text: string;
  onDone?: () => void;
  delayMs?: number;
  mode?: "word" | "char";
  cursor?: boolean;
}

function tokenize(text: string, mode: "word" | "char"): string[] {
  if (mode === "char") return Array.from(text);
  return text.match(/\S+\s*/g) ?? [];
}

export function StreamingText({
  text,
  onDone,
  delayMs = 32,
  mode = "word",
  cursor = true,
}: Props) {
  const tokens = tokenize(text, mode);
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
    const jitter =
      mode === "word" && next.length > 8 ? delayMs + 12 : delayMs;
    const t = window.setTimeout(() => setCount((c) => c + 1), jitter);
    return () => window.clearTimeout(t);
  }, [count, tokens, delayMs, mode, onDone]);

  const shown = tokens.slice(0, count).join("");
  const done = count >= tokens.length;

  return (
    <span className="whitespace-pre-wrap">
      {shown}
      {cursor && !done && (
        <span
          aria-hidden
          className="ml-[1px] inline-block h-[1.05em] w-[2px] translate-y-[3px] bg-current align-baseline"
          style={{ animation: "cursor-blink 900ms steps(2, end) infinite" }}
        />
      )}
    </span>
  );
}
