"use client";

import { useEffect, useState } from "react";
import { TIMEZONE_OPTIONS, resolveTimezone, useTimezone } from "@/lib/timezone";

export function TimezoneSelector() {
  const { timezone, setTimezone } = useTimezone();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const resolved = mounted ? resolveTimezone(timezone) : "UTC";

  return (
    <label className="flex items-center gap-2 heading-block text-[10px] tracking-[0.18em] text-[color:var(--color-ink-soft)] no-print">
      <span>Zone</span>
      <select
        value={timezone}
        onChange={(e) => setTimezone(e.target.value)}
        className="bg-[color:var(--color-paper-deep)] border border-[color:var(--color-ink)] px-2 py-1 text-[11px] tracking-normal font-sans cursor-pointer focus:outline-none focus:ring-2 focus:ring-[color:var(--color-red)]"
      >
        {TIMEZONE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {mounted && timezone === "auto" && (
        <span className="text-[9px] text-[color:var(--color-dust)] normal-case tracking-normal">
          → {resolved}
        </span>
      )}
    </label>
  );
}
