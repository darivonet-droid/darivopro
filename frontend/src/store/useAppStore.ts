// DARIVO PRO — Estado global (Zustand)
"use client";
import { create } from "zustand";
import type { UpgradeRazon } from "@/lib/plan-limits";
import type { EmpresaData } from "@/types";

interface ToastState {
  mensaje: string;
  tipo: "ok" | "error";
}

interface UpgradeState {
  abierto: boolean;
  razon: UpgradeRazon;
}

interface AppState {
  empresa: EmpresaData | null;
  toast: ToastState | null;
  upgrade: UpgradeState | null;
  modoOffline: boolean;
  redLenta: boolean;
  setEmpresa: (empresa: EmpresaData | null) => void;
  mostrarToast: (mensaje: string, tipo?: ToastState["tipo"]) => void;
  ocultarToast: () => void;
  mostrarUpgrade: (razon: UpgradeRazon) => void;
  cerrarUpgrade: () => void;
  setModoOffline: (v: boolean) => void;
  setRedLenta: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  empresa: null,
  toast: null,
  upgrade: null,
  modoOffline: false,
  redLenta: false,
  setEmpresa: (empresa) => set({ empresa }),
  mostrarToast: (mensaje, tipo = "ok") => {
    set({ toast: { mensaje, tipo } });
    setTimeout(() => set({ toast: null }), 2600);
  },
  ocultarToast: () => set({ toast: null }),
  mostrarUpgrade: (razon) => set({ upgrade: { abierto: true, razon } }),
  cerrarUpgrade: () => set({ upgrade: null }),
  setModoOffline: (modoOffline) => set({ modoOffline }),
  setRedLenta: (redLenta) => set({ redLenta }),
}));
