import { useCallback, useEffect, useRef, useState } from "react";
import { defaultTimerPreset, type TimerPreset } from "../model/presets";
import {
  storedTimerStateSchema,
  type StoredTimerState,
} from "../model/timerStateSchema";

export type TimerStatus = "idle" | "running" | "paused" | "completed";

type TimerState = {
  durationSeconds: number;
  remainingSeconds: number;
  status: TimerStatus;
};

const TIMER_STORAGE_KEY = "focusambient.active-timer.v1";

function getTimerStorageKey(storageOwnerId: string) {
  return `${TIMER_STORAGE_KEY}.${encodeURIComponent(storageOwnerId)}`;
}

function createInitialTimer(preset: TimerPreset): StoredTimerState {
  return {
    preset,
    durationSeconds: preset.durationSeconds,
    remainingSeconds: preset.durationSeconds,
    status: "idle",
    endsAt: null,
    sessionId: crypto.randomUUID(),
  };
}

function loadTimer(storageKey: string, initialPreset: TimerPreset) {
  try {
    const storedValue = window.localStorage.getItem(storageKey);
    if (!storedValue) return createInitialTimer(initialPreset);

    const result = storedTimerStateSchema.safeParse(JSON.parse(storedValue));
    if (!result.success) return createInitialTimer(initialPreset);

    return {
      ...result.data,
      sessionId: result.data.sessionId ?? crypto.randomUUID(),
    };
  } catch {
    return createInitialTimer(initialPreset);
  }
}

export function useTimer(
  storageOwnerId: string,
  initialPreset: TimerPreset = defaultTimerPreset,
) {
  const storageKey = getTimerStorageKey(storageOwnerId);
  const initialTimerRef = useRef<StoredTimerState | null>(null);
  if (initialTimerRef.current === null) {
    initialTimerRef.current = loadTimer(storageKey, initialPreset);
  }

  const initialTimer = initialTimerRef.current;
  const [preset, setPreset] = useState<TimerPreset>(initialTimer.preset);
  const [sessionId, setSessionId] = useState(
    initialTimer.sessionId ?? crypto.randomUUID(),
  );
  const [state, setState] = useState<TimerState>({
    durationSeconds: initialTimer.durationSeconds,
    remainingSeconds: initialTimer.remainingSeconds,
    status: initialTimer.status,
  });
  const endsAtRef = useRef<number | null>(initialTimer.endsAt);

  const saveTimer = useCallback(
    (nextPreset: TimerPreset, nextState: TimerState) => {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          sessionId,
          preset: nextPreset,
          ...nextState,
          endsAt: endsAtRef.current,
        }),
      );
    },
    [sessionId, storageKey],
  );

  const syncRemainingTime = useCallback(() => {
    if (endsAtRef.current === null) return;

    const remainingSeconds = Math.max(
      0,
      Math.ceil((endsAtRef.current - Date.now()) / 1_000),
    );

    setState((current) => {
      if (remainingSeconds === 0) {
        endsAtRef.current = null;
        return { ...current, remainingSeconds: 0, status: "completed" };
      }

      return { ...current, remainingSeconds };
    });
  }, []);

  useEffect(() => {
    saveTimer(preset, state);
  }, [preset, saveTimer, state]);

  useEffect(() => {
    if (state.status !== "running") return;

    syncRemainingTime();
    const intervalId = window.setInterval(syncRemainingTime, 250);

    return () => window.clearInterval(intervalId);
  }, [state.status, syncRemainingTime]);

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key !== storageKey || !event.newValue) return;
      try {
        const result = storedTimerStateSchema.safeParse(
          JSON.parse(event.newValue),
        );
        if (!result.success) return;

        endsAtRef.current = result.data.endsAt;
        setSessionId(result.data.sessionId ?? crypto.randomUUID());
        setPreset(result.data.preset);
        setState({
          durationSeconds: result.data.durationSeconds,
          remainingSeconds: result.data.remainingSeconds,
          status: result.data.status,
        });
      } catch {
        // Ignore damaged timer data from another browser tab.
      }
    };

    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, [storageKey]);

  const start = useCallback(() => {
    setState((current) => {
      if (current.remainingSeconds === 0 || current.status === "running") {
        return current;
      }

      endsAtRef.current = Date.now() + current.remainingSeconds * 1_000;
      return { ...current, status: "running" };
    });
  }, []);

  const pause = useCallback(() => {
    if (endsAtRef.current === null) return;

    const remainingSeconds = Math.max(
      0,
      Math.ceil((endsAtRef.current - Date.now()) / 1_000),
    );
    endsAtRef.current = null;
    setState((current) => ({
      ...current,
      remainingSeconds,
      status: remainingSeconds === 0 ? "completed" : "paused",
    }));
  }, []);

  const reset = useCallback(() => {
    endsAtRef.current = null;
    setSessionId(crypto.randomUUID());
    setState((current) => ({
      ...current,
      remainingSeconds: current.durationSeconds,
      status: "idle",
    }));
  }, []);

  const selectPreset = useCallback(
    (nextPreset: TimerPreset = defaultTimerPreset) => {
      endsAtRef.current = null;
      setSessionId(crypto.randomUUID());
      setPreset(nextPreset);
      setState({
        durationSeconds: nextPreset.durationSeconds,
        remainingSeconds: nextPreset.durationSeconds,
        status: "idle",
      });
    },
    [],
  );

  return {
    ...state,
    sessionId,
    preset,
    start,
    pause,
    reset,
    selectPreset,
  };
}
