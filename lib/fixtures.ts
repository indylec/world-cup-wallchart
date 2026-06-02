"use client";

import useSWR from "swr";
import type { Fixtures } from "./types";

const fetcher = async (url: string): Promise<Fixtures> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load fixtures: ${res.status}`);
  return res.json();
};

export function useFixtures() {
  return useSWR<Fixtures>("/api/matches", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60_000,
  });
}
