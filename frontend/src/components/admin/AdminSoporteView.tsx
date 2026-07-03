"use client";

import Link from "next/link";
import { AdminNotice } from "@/components/admin/AdminTabs";
import { T } from "@/lib/design-system/tokens";

/**
 * Admin Soporte — INC-A01: API /api/soporte/tickets detenida (09-PANEL-ADMIN-SOPORTE.md §11).
 * INC-M01 / INC-B01: bloqueadas hasta decisión propietario vía Agente 1 (DOC-01).
 */
export function AdminSoporteView() {
  return (
    <div>
      <AdminNotice>
        <strong>INC-A01 — Detención conforme auditoría:</strong> el endpoint{" "}
        <code className="font-mono text-xs">/api/soporte/tickets</code> fue eliminado por
        contradicción con <code className="font-mono text-xs">09-PANEL-ADMIN-SOPORTE.md</code> §11
        («No crear endpoints»). Devuelto al Agente 1 para decisión del propietario.
      </AdminNotice>

      <div
        className="rounded-2xl p-6"
        style={{ background: T.white, border: `1px solid ${T.slateD}` }}
      >
        <h2 className="text-sm font-extrabold" style={{ color: T.text }}>
          Gestión de tickets — pendiente autorización
        </h2>
        <p className="mt-3 text-sm" style={{ color: T.textMid }}>
          Los usuarios crean tickets desde <strong>Móvil → Más → Soporte</strong> (almacenamiento
          local del dispositivo). La sincronización con Admin requiere decisión del propietario
          sobre DOC-01 antes de implementar cualquier mecanismo servidor.
        </p>
        <p className="mt-3 text-sm" style={{ color: T.textMid }}>
          Acciones documentadas pendientes (INC-M01): Ver ticket · Responder ticket · Historial.
          Filtro por plan (INC-B01). No implementables sin pipeline autorizado.
        </p>
        <Link
          href="/mas/soporte"
          className="mt-4 inline-block text-sm font-bold"
          style={{ color: T.blue }}
        >
          Ver flujo Móvil Soporte →
        </Link>
      </div>
    </div>
  );
}
