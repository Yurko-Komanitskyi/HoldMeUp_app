import * as React from 'react';

export interface StopwatchState {
  seconds:  number;
  running:  boolean;
  saved:    boolean;
}

export interface StopwatchActions {
  start:  () => void;
  pause:  () => void;
  reset:  () => void;
  setSeconds: (value: number) => void;
}

export function useStopwatch(): StopwatchState & StopwatchActions {
  const [seconds, setSecondsState]   = React.useState(0);
  const [running, setRunning]   = React.useState(false);
  const [saved,   setSaved]     = React.useState(false);
  const intervalRef             = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const start = React.useCallback(() => {
    if (running) return;
    setRunning(true);
    setSaved(false);
    intervalRef.current = setInterval(() => setSecondsState((s) => s + 1), 1000);
  }, [running]);

  const pause = React.useCallback(() => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsState((s) => {
      if (s > 0) setSaved(true);
      return s;
    });
  }, []);

  const reset = React.useCallback(() => {
    setRunning(false);
    setSaved(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsState(0);
  }, []);

  const setSeconds = React.useCallback((value: number) => {
    setSecondsState(Math.max(0, Math.floor(value)));
    setSaved(value > 0);
  }, []);

  return { seconds, running, saved, start, pause, reset, setSeconds };
}

export function formatStopwatch(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
