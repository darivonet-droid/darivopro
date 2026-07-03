"use client";
import { useAppStore } from "@/store/useAppStore";
import { RADII, SHADOWS, T } from "@/lib/design-system/tokens";

/** Fable 5 §6.6 — Toast */
export function Toast() {
  const toast = useAppStore((s) => s.toast);
  if (!toast) return null;

  return (
    <div
      className="pi fixed left-1/2 z-50 -translate-x-1/2 text-[13px] font-bold"
      style={{
        top: 22,
        background: T.navyLight,
        color: T.white,
        maxWidth: 360,
        borderRadius: RADII.modal,
        padding: "12px 20px",
        boxShadow: SHADOWS.toast,
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {toast.mensaje}
    </div>
  );
}
