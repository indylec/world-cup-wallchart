"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ManualResult, Score } from "./types";

interface PredictionState {
  manualResults: Record<string, ManualResult>;
  setResult: (matchId: string, score: Score) => void;
  clearResult: (matchId: string) => void;
  clearAll: () => void;
}

export const usePredictions = create<PredictionState>()(
  persist(
    (set) => ({
      manualResults: {},
      setResult: (matchId, score) =>
        set((state) => ({
          manualResults: {
            ...state.manualResults,
            [matchId]: {
              matchId,
              score,
              enteredAt: new Date().toISOString(),
            },
          },
        })),
      clearResult: (matchId) =>
        set((state) => {
          const next = { ...state.manualResults };
          delete next[matchId];
          return { manualResults: next };
        }),
      clearAll: () => set({ manualResults: {} }),
    }),
    { name: "wcwc-predictions-v1" },
  ),
);
