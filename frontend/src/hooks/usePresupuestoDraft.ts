"use client";
import { useCallback, useEffect, useRef } from "react";
import {
  DRAFT_STORAGE_KEY,
  type PresupuestoDraft,
} from "@/lib/presupuesto-ia";

const DEFAULT: PresupuestoDraft = {
  clientName: "",
  phone: "",
  city: "",
  items: [],
  margin: 40,
  notes: "",
  iaResult: null,
};

export function usePresupuestoDraft(
  draft: PresupuestoDraft,
  enabled = true
) {
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const cargar = useCallback((): PresupuestoDraft | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return null;
      return { ...DEFAULT, ...JSON.parse(raw) };
    } catch {
      return null;
    }
  }, []);

  const limpiar = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftRef.current));
    }, 30_000);
    return () => clearInterval(id);
  }, [enabled]);

  return { cargar, limpiar };
}
