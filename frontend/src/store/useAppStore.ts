// DARIVO PRO — Estado global (Zustand)
"use client";
import { create } from "zustand";
import type { EmpresaData } from "@/types";

interface ToastState {
  mensaje: string;
  tipo: "ok" | "error";
}

interface AppState {
  empresa: EmpresaData | null;
  toast: ToastState | null;
  setEmpresa: (empresa: EmpresaData | null) => void;
  mostrarToast: (mensaje: string, tipo?: ToastState["tipo"]) => void;
  ocultarToast: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  empresa: null,
  toast: null,
  setEmpresa: (empresa) => set({ empresa }),
  mostrarToast: (mensaje, tipo = "ok") => {
    set({ toast: { mensaje, tipo } });
    setTimeout(() => set({ toast: null }), 2600);
  },
  ocultarToast: () => set({ toast: null }),
}));
