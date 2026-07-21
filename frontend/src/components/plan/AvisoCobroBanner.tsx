// DARIVO PRO — Banner de mora de cobro (21/07/2026)
// Refuerzo de UI del modo solo lectura: el bloqueo real vive en RLS
// (es_cuenta_solo_lectura(), migración 20260721120000). Server Component —
// se monta en (auth)/layout.tsx (Móvil) y empresa/layout.tsx (Empresa).
// Admin y Partner nunca lo ven (obtenerEstadoCobro() los excluye).
import { obtenerEstadoCobro } from "@/lib/mora-pagos";

function fechaLima(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PE", {
    timeZone: "America/Lima",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export async function AvisoCobroBanner() {
  const cobro = await obtenerEstadoCobro();
  if (cobro.estado === "ok") return null;

  if (cobro.estado === "gracia") {
    return (
      <div
        role="alert"
        style={{
          background: "#FEF3C7",
          color: "#92400E",
          border: "1px solid #F59E0B",
          borderRadius: 12,
          padding: "10px 14px",
          margin: "10px 14px 0",
          fontSize: 13,
          lineHeight: 1.45,
        }}
      >
        <strong>Tu último cobro no se pudo procesar.</strong> Regulariza tu pago
        desde &ldquo;Mi Plan&rdquo; antes del {fechaLima(cobro.limite)} — pasada
        esa fecha tu cuenta quedará en modo solo lectura.
      </div>
    );
  }

  return (
    <div
      role="alert"
      style={{
        background: "#FEE2E2",
        color: "#991B1B",
        border: "1px solid #EF4444",
        borderRadius: 12,
        padding: "10px 14px",
        margin: "10px 14px 0",
        fontSize: 13,
        lineHeight: 1.45,
      }}
    >
      <strong>Tu cuenta está en modo solo lectura</strong> por un cobro
      pendiente desde el {fechaLima(cobro.desde)}. Puedes seguir viendo tus
      datos, pero no crear ni editar. Regulariza el pago desde &ldquo;Mi
      Plan&rdquo; para reactivar tu cuenta.
    </div>
  );
}
