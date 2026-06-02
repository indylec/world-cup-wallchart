"use client";

import { useFixtures } from "@/lib/fixtures";

export function DataSourceBadge() {
  const { data, error, isLoading } = useFixtures();

  let label = "loading fixtures…";
  let tone = "var(--color-ink-soft)";

  if (error) {
    label = "offline — manual mode";
    tone = "var(--color-red)";
  } else if (!isLoading && data) {
    const hasTeams = data.teams.length > 0;
    label = hasTeams
      ? `live data · ${data.teams.length} teams · ${data.matches.length} matches`
      : "placeholder data — add FOOTBALL_DATA_API_KEY to .env.local";
    tone = hasTeams ? "var(--color-jade)" : "var(--color-mustard)";
  }

  return (
    <p
      className="heading-block text-[10px] mt-4 tracking-[0.2em] no-print"
      style={{ color: `color-mix(in srgb, ${tone} 90%, black)` }}
    >
      · {label} ·
    </p>
  );
}
