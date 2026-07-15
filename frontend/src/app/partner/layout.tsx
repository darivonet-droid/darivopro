import type { Metadata } from "next";
import { requireProducto } from "@/lib/guards/require-producto";

// Manifest/appleWebApp propios de Partner — independientes por completo de
// Móvil ((auth)/layout.tsx, onboarding/layout.tsx usan /manifest.json) y sin
// nada en Admin/Empresa (no declaran manifest). Ver CLAUDE.md "PWA de
// Partner" (15/07/2026) para el detalle de la separación.
export const metadata: Metadata = {
  manifest: "/partner-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Darivo Partner",
  },
};

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireProducto("partner");
  return <>{children}</>;
}
