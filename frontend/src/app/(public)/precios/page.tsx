import type { Metadata } from "next";
import { PreciosView } from "@/components/precios/PreciosView";

export const metadata: Metadata = {
  title: "Precios — DARIVO PRO",
  description: "Planes Básico y Pro para cotizaciones y facturas de obra en Perú.",
};

export default function PreciosPage() {
  return <PreciosView />;
}
