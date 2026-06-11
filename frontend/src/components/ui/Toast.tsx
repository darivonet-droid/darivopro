"use client";
// DARIVO PRO — Toast global (lee del store Zustand)
import { useAppStore } from "@/store/useAppStore";
import { T } from "@/lib/theme";

export function Toast() {
  const toast = useAppStore((s) => s.toast);
  if (!toast) return null;

  return (
    <div
      className="pi fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-bold shadow-lg"
      style={{
        background: toast.tipo === "ok" ? T.navy : T.red,
        color: T.white,
        maxWidth: 360,
      }}
    >
      {toast.mensaje}
    </div>
  );
}
