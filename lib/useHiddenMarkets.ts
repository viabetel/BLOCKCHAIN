"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "limero:hiddenMarkets";

export function useHiddenMarkets() {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHidden(new Set(JSON.parse(raw)));
    } catch {}
    setMounted(true);
  }, []);

  const hide = (addr: string) => {
    const next = new Set(hidden);
    next.add(addr.toLowerCase());
    setHidden(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  };

  const unhide = (addr: string) => {
    const next = new Set(hidden);
    next.delete(addr.toLowerCase());
    setHidden(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  };

  const isHidden = (addr: string) => hidden.has(addr.toLowerCase());

  return { hidden, hide, unhide, isHidden, mounted };
}
