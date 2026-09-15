"use client";

import * as React from "react";

/**
 * Brief skeleton flash on first mount so pages demonstrate their loading states,
 * then render real content — mimics an API fetch in the UI prototype.
 */
export function useSimulatedLoading(ms = 550) {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

/** Locks body scroll while a touch drawer is open (mobile cart on POS). */
export function useLockBodyScroll(locked: boolean) {
  React.useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

/** Reads a localStorage-backed JSON state (receipt settings, integrations…). */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = React.useState<T>(initial);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue({ ...initial, ...(JSON.parse(raw) as T) });
    } catch {
      /* ignore */
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = React.useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [key]
  );

  return [value, update, ready] as const;
}


