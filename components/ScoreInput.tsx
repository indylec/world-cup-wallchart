"use client";

import { useEffect, useState } from "react";
import { usePredictions } from "@/lib/store";
import { getScore } from "@/lib/results";
import type { Match, Score } from "@/lib/types";

interface Props {
  match: Match;
  knockout?: boolean;
  size?: "sm" | "md";
}

export function ScoreInput({ match, knockout = false, size = "sm" }: Props) {
  const manual = usePredictions((s) => s.manualResults);
  const setResult = usePredictions((s) => s.setResult);
  const clearResult = usePredictions((s) => s.clearResult);

  const stored = getScore(match, manual);
  const [home, setHome] = useState(toField(stored?.home));
  const [away, setAway] = useState(toField(stored?.away));

  useEffect(() => {
    setHome(toField(stored?.home));
    setAway(toField(stored?.away));
  }, [stored?.home, stored?.away]);

  const commit = (h: string, a: string) => {
    const hn = parse(h);
    const an = parse(a);
    if (hn == null && an == null) {
      clearResult(match.id);
      return;
    }
    if (hn == null || an == null) return;
    const score: Score = { home: hn, away: an };
    setResult(match.id, score);
  };

  const disabled = knockout && !match.home && !match.away;

  const boxClass =
    size === "md"
      ? "w-9 h-9 text-base"
      : "w-7 h-7 text-sm";

  return (
    <span className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <ScoreBox
        value={home}
        disabled={disabled}
        onChange={(v) => {
          setHome(v);
          commit(v, away);
        }}
        className={boxClass}
      />
      <span className="text-[color:var(--color-ink-soft)] text-xs">–</span>
      <ScoreBox
        value={away}
        disabled={disabled}
        onChange={(v) => {
          setAway(v);
          commit(home, v);
        }}
        className={boxClass}
      />
    </span>
  );
}

function ScoreBox({
  value,
  onChange,
  disabled,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  className: string;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={2}
      value={value}
      disabled={disabled}
      onChange={(e) => {
        const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
        onChange(v);
      }}
      className={`text-center font-mono border border-[color:var(--color-ink)] bg-[color:var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-red)] disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      aria-label="score"
    />
  );
}

function toField(n: number | undefined): string {
  return Number.isFinite(n) ? String(n) : "";
}

function parse(s: string): number | null {
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
