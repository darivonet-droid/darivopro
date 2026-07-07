"use client";
import { useCallback, useEffect, useRef } from "react";
import {
  DRAFT_STORAGE_KEY,
  type CotizacionDraft,
} from "@/lib/cotizacion-ia";

const DEFAULT: CotizacionDraft = {
  clientName: "",
  phone: "",
  city: "",
  items: [],
  margin: 40,
  notes: "",
  iaResult: null,
};

export function useCotizacionDraft(
  draft: CotizacionDraft,
  enabled = true
) {
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const cargar = useCallback((): CotizacionDraft | null => {
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
