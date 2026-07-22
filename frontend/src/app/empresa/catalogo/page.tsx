"use client";
// DARIVO PRO EMPRESA — Catálogo · Mis Tarifas (07-MODULO-MAS-EMPRESA.md §5.1)
// Entrada directa del sidebar (posición 6) desde 22/07/2026 — antes vivía
// como pestañas "Categorías"/"Mis Tarifas" dentro de la pantalla "Más",
// ya retirada (Visión §16 excepción de navegación Empresa). Reutiliza los
// mismos componentes que Móvil (CategoriasManager, MisTarifasTab) — misma
// lógica de negocio, solo cambia el contenedor de navegación.
import { useState } from "react";
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { empresaModulo } from "@/lib/empresa-modules";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { TabPillSelector } from "@/components/design-system/TabPillSelector";
import { CategoriasManager } from "@/components/ajustes/CategoriasManager";
import { MisTarifasTab } from "@/components/mas/MisTarifasTab";

type Tab = "categorias" | "tarifas";

export default function EmpresaCatalogoPage() {
  const mod = empresaModulo("catalogo");
  const [tab, setTab] = useState<Tab>("categorias");

  const TABS: { id: Tab; label: string }[] = [
    { id: "categorias", label: "Categorías" },
    { id: "tarifas", label: "Mis Tarifas" },
  ];

  return (
    <EmpresaShell titulo={mod.label}>
      <p className="mb-4 text-sm" style={{ color: ADMIN_COLORS.textMid }}>
        Activa capítulos, añade tus propias partidas y personaliza tus precios — reutiliza flujo Móvil
      </p>
      <div className="max-w-2xl">
        <TabPillSelector tabs={TABS} active={tab} onChange={setTab} />
        <div className="mt-[18px]">
          {tab === "categorias" && <CategoriasManager />}
          {tab === "tarifas" && <MisTarifasTab esEmpresa />}
        </div>
      </div>
    </EmpresaShell>
  );
}
