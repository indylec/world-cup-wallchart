"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TimezoneOption {
  value: string;
  label: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: "auto", label: "Auto (browser)" },
  { value: "UTC", label: "UTC" },
  { value: "America/Los_Angeles", label: "Los Angeles (PT)" },
  { value: "America/Denver", label: "Denver (MT)" },
  { value: "America/Chicago", label: "Chicago (CT)" },
  { value: "America/New_York", label: "New York (ET)" },
  { value: "America/Mexico_City", label: "Mexico City" },
  { value: "America/Toronto", label: "Toronto" },
  { value: "America/Vancouver", label: "Vancouver" },
  { value: "America/Sao_Paulo", label: "São Paulo" },
  { value: "America/Buenos_Aires", label: "Buenos Aires" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris / Berlin" },
  { value: "Europe/Madrid", label: "Madrid" },
  { value: "Europe/Moscow", label: "Moscow" },
  { value: "Africa/Cairo", label: "Cairo" },
  { value: "Africa/Lagos", label: "Lagos" },
  { value: "Africa/Johannesburg", label: "Johannesburg" },
  { value: "Asia/Riyadh", label: "Riyadh" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Tehran", label: "Tehran" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Seoul", label: "Seoul" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Australia/Sydney", label: "Sydney" },
];

interface TimezoneState {
  timezone: string;
  setTimezone: (tz: string) => void;
}

export const useTimezone = create<TimezoneState>()(
  persist(
    (set) => ({
      timezone: "auto",
      setTimezone: (timezone) => set({ timezone }),
    }),
    { name: "wcwc-timezone-v1" },
  ),
);

export function resolveTimezone(tz: string): string {
  if (tz !== "auto") return tz;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
