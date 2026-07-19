"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "sending") return;
    setStatus("sending");
    setError(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (err) throw err;
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-[20px] border border-border bg-card p-8 shadow-raised">
        <div className="mb-6 flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            mindmap-os
          </span>
          <span className="text-xs text-muted-foreground">Your AI cofounder team</span>
        </div>

        {status === "sent" ? (
          <div className="space-y-2">
            <h1 className="text-[15px] font-semibold text-foreground">
              Check your email
            </h1>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              We sent a magic link to{" "}
              <span className="text-foreground">{email}</span>. Click the link to
              sign in.
            </p>
            <button
              onClick={() => {
                setStatus("idle");
                setEmail("");
              }}
              className="mt-4 text-[12px] text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[13px] font-medium text-foreground"
              >
                Sign in with your email
              </label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={status === "sending"}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13.5px] outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/25 disabled:opacity-50"
              />
              <p className="text-[11px] text-muted-foreground">
                We&apos;ll email you a magic link. No password.
              </p>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!email.trim() || status === "sending"}
              className="w-full rounded-md bg-foreground py-2 text-[13px] font-medium text-background transition-colors hover:bg-foreground/85 disabled:opacity-40"
            >
              {status === "sending" ? "Sending..." : "Send magic link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
