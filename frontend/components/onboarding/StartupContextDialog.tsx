"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import type { StartupContext, StartupStage } from "@/lib/types";

const STAGES: { value: StartupStage; label: string; hint: string }[] = [
  { value: "idea", label: "Idea", hint: "Still figuring out what to build." },
  { value: "building", label: "Building", hint: "Prototype in progress." },
  { value: "launching", label: "Launching", hint: "About to ship or just shipped." },
  { value: "growing", label: "Growing", hint: "Have users, want more." },
];

interface Props {
  open: boolean;
  initial?: StartupContext | null;
  onSave: (context: StartupContext) => void;
  onSkip: () => void;
}

export function StartupContextDialog({ open, initial, onSave, onSkip }: Props) {
  const [idea, setIdea] = useState(initial?.idea ?? "");
  const [problem, setProblem] = useState(initial?.problem ?? "");
  const [icp, setIcp] = useState(initial?.icp ?? "");
  const [stage, setStage] = useState<StartupStage>(initial?.stage ?? "idea");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      idea: idea.trim(),
      problem: problem.trim(),
      icp: icp.trim(),
      stage,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onSkip(); }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background p-6 shadow-xl outline-none">
          <Dialog.Title className="text-xl font-semibold tracking-tight">
            Tell your team about the startup
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            Fill this in once. Every agent reads from it, so their advice stays consistent.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">The one-liner</span>
              <textarea
                required
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="A tool that lets solo founders spin up an AI cofounder team on a canvas."
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium">The problem, and who has it</span>
              <textarea
                required
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Solo founders stall in week one because they don't have a team to bounce ideas off."
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Your first customer</span>
              <textarea
                required
                value={icp}
                onChange={(e) => setIcp(e.target.value)}
                placeholder="Technical solo founders on X/HN who've quit a job in the last six months to build something."
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </label>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Where are you</legend>
              <div className="grid grid-cols-2 gap-2">
                {STAGES.map((s) => (
                  <label
                    key={s.value}
                    className={`flex cursor-pointer flex-col gap-0.5 rounded-lg border px-3 py-2 text-sm transition ${
                      stage === s.value
                        ? "border-foreground bg-foreground/5"
                        : "border-border hover:border-foreground/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="stage"
                      value={s.value}
                      checked={stage === s.value}
                      onChange={() => setStage(s.value)}
                      className="sr-only"
                    />
                    <span className="font-medium">{s.label}</span>
                    <span className="text-xs text-muted-foreground">{s.hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onSkip}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </button>
              <button
                type="submit"
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/85"
              >
                Save context
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
