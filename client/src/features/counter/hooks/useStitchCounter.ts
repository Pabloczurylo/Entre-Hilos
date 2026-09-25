import { useState, useEffect } from 'react';

export interface StitchCounterState {
  projectName: string;
  round: number;
  stitch: number;
}

const STORAGE_KEY = 'entre_hilos_stitch_counter';

const DEFAULT_STATE: StitchCounterState = {
  projectName: 'Mi Proyecto',
  round: 1,
  stitch: 0,
};

export function useStitchCounter() {
  const [state, setState] = useState<StitchCounterState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save stitch counter in localStorage', err);
    }
  }, [state]);

  const incrementStitch = () => setState((prev) => ({ ...prev, stitch: prev.stitch + 1 }));
  const decrementStitch = () =>
    setState((prev) => ({ ...prev, stitch: Math.max(0, prev.stitch - 1) }));

  const incrementRound = () =>
    setState((prev) => ({ ...prev, round: prev.round + 1, stitch: 0 }));
  const decrementRound = () =>
    setState((prev) => ({
      ...prev,
      round: Math.max(1, prev.round - 1),
      stitch: 0,
    }));

  const setProjectName = (name: string) =>
    setState((prev) => ({ ...prev, projectName: name }));

  const resetCounter = () => setState(DEFAULT_STATE);

  return {
    ...state,
    incrementStitch,
    decrementStitch,
    incrementRound,
    decrementRound,
    setProjectName,
    resetCounter,
  };
}
