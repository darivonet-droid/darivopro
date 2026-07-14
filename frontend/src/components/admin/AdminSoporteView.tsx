"use client";

import Link from "next/link";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { CodeNotice } from "@/components/common/CodeNotice";

/**
 * Admin Soporte — INC-A01: API /api/soporte/tickets detenida (09-PANEL-ADMIN-SOPORTE.md §11).
 * INC-M01 / INC-B01: bloqueadas hasta decisión propietario vía Agente 1 (DOC-01).
 */
export function AdminSoporteView() {
  return (
    <div>
      <CodeNotice code="INC-A01" detalle className="mb-4" />

      <div
        className="rounded-2xl p-6"
        style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
      >
        <h2 className="text-sm font-extrabold" style={{ color: ADMIN_COLORS.text }}>
          Gestión de tickets — pendiente autorización
        </h2>
        <p className="mt-3 text-sm" style={{ color: ADMIN_COLORS.textMid }}>
          Los usuarios crean tickets desde <strong>Móvil → Más → Soporte</strong> (almacenamiento
          local del dispositivo). La sincronización con Admin requiere decisión del propietario
          sobre DOC-01 antes de implementar cualquier mecanismo servidor.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <CodeNotice code="INC-M01" />
          <CodeNotice code="INC-B01" />
        </div>
        <Link
          href="/mas/soporte"
          className="mt-4 inline-block text-sm font-bold"
          style={{ color: ADMIN_COLORS.purple }}
        >
          Ver flujo Móvil Soporte →
        </Link>
      </div>
    </div>
  );
}
