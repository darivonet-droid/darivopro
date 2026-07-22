"use client";
import { useState } from "react";
import { T } from "@/lib/theme";
import { TabPillSelector } from "@/components/design-system/TabPillSelector";
import { AjustesForm } from "@/components/ajustes/AjustesForm";
import { CategoriasManager } from "@/components/ajustes/CategoriasManager";
import { MasOpcionesList } from "@/components/mas/MasOpcionesList";
import { MisTarifasTab } from "@/components/mas/MisTarifasTab";
import type { EmpresaForm } from "@/lib/validations";

/** Pestañas oficiales — 07-MODULO-MAS.md §2. Exclusivo Darivo Pro Móvil
 * desde 22/07/2026: Darivo Pro Empresa ya no usa este componente — sus 3
 * pestañas (Categorías / Mis Tarifas / Empresa) pasan a ser pantallas
 * propias del sidebar (07-MODULO-MAS-EMPRESA.md §5.1/§5.2, Visión §16
 * excepción de navegación Empresa). */
type Tab = "categorias" | "tarifas" | "empresa";

interface MasTabsProps {
  email: string;
  inicial: EmpresaForm;
  esBusiness?: boolean;
  /** Rol Técnico (Tarea 2, CLAUDE.md 17/07/2026): nunca ve "Mis planes"; ve
   * "Informes" solo si su Gerente se lo habilitó. */
  ocultarMisPlanes?: boolean;
  ocultarInformes?: boolean;
  /**
   * Rol Técnico (Etapa 7, CLAUDE.md 21/07/2026, decisión 4): "Mis Tarifas"
   * es exclusiva del Gerente — el Técnico solo consulta precios, nunca los
   * administra. Divergencia real detectada en la Etapa 6 (la arquitectura
   * oficial ya lo decía, pero no existía ningún bloqueo en código): esta
   * prop cierra ese gap.
   */
  ocultarTarifas?: boolean;
}

export function MasTabs({
  email,
  inicial,
  esBusiness,
  ocultarMisPlanes,
  ocultarInformes,
  ocultarTarifas,
}: MasTabsProps) {
  const [tab, setTab] = useState<Tab>("categorias");

  const TABS: { id: Tab; label: string }[] = [
    { id: "categorias", label: "Categorías" },
    ...(ocultarTarifas ? [] : [{ id: "tarifas" as const, label: "Mis Tarifas" }]),
    { id: "empresa", label: "Empresa" },
  ];

  return (
    <div>
      <TabPillSelector tabs={TABS} active={tab} onChange={setTab} />
      <div className="mt-[18px]">
        {tab === "categorias" && (
          <div>
            <p className="mb-3.5 text-[13px]" style={{ color: T.textMid }}>
              Activa capítulos y añade tus propias partidas
            </p>
            <CategoriasManager />
          </div>
        )}
        {tab === "tarifas" && !ocultarTarifas && <MisTarifasTab />}
        {tab === "empresa" && <AjustesForm email={email} inicial={inicial} />}

        <MasOpcionesList
          esBusiness={esBusiness}
          ocultarMisPlanes={ocultarMisPlanes}
          ocultarInformes={ocultarInformes}
        />
      </div>
    </div>
  );
}
