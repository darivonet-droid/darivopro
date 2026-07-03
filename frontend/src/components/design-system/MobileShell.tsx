import { MOBILE_MAX_WIDTH } from "@/lib/design-system/tokens";

/** Contenedor Mobile First — Fable 5 §2.1 (390px) */
export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative mx-auto min-h-screen w-full"
      style={{ maxWidth: MOBILE_MAX_WIDTH }}
    >
      {children}
    </div>
  );
}
