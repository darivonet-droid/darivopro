"use client";
// DARIVO PRO — Ficha de cliente (vista)
// Muestra datos de contacto editables + historial de cotizaciones (con sus botones)
// + facturas asociadas (estado real). No guarda copias de estado: todo viene del server.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { DireccionAutocomplete } from "@/components/design-system/DireccionAutocomplete";
import { CotizacionesList } from "@/components/cotizacion/CotizacionesList";
import { FacturaCard } from "@/components/facturacion/FacturaCard";
import { useClientes } from "@/hooks/useClientes";
import { useAppStore } from "@/store/useAppStore";
import { soloDigitos, fmtPEN, validarTelefono } from "@/lib/utils";
import { T } from "@/lib/theme";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import type { Cliente, Factura, Cotizacion } from "@/types";

interface Props {
  cliente: Cliente;
  cotizaciones: Cotizacion[];
  facturas: Factura[];
  /** Base del wizard de cotización. Empresa la sustituye por
   * "/empresa/cotizaciones/nuevo" (capa de presentación de escritorio,
   * 05-MODULO-COTIZACIONES-EMPRESA.md) — Móvil sigue usando la ruta por defecto. */
  nuevaCotizacionHref?: string;
  /** Base del editor de facturas. Empresa la sustituye por "/empresa/facturas/nueva"
   * (06-MODULO-FACTURAS-EMPRESA.md) — Móvil sigue usando la ruta por defecto. */
  nuevaFacturaHref?: string;
  /** Empresa desktop pasa true para que el acento azul de Fable 5 (WhatsApp/
   * Email/stats/Editar/CTA/Factura) se muestre en `ADMIN_COLORS` (morado) —
   * Móvil sigue con el azul por defecto, sin cambios (22/07/2026, corrección
   * de la migración parcial de Empresa a ADMIN_COLORS). */
  esEmpresa?: boolean;
}

export function ClienteFichaView({ cliente, cotizaciones, facturas, nuevaCotizacionHref = "/cotizaciones/nuevo", nuevaFacturaHref = "/facturas/nueva", esEmpresa }: Props) {
  const accent = esEmpresa ? ADMIN_COLORS.purple : T.blue;
  const accentPale = esEmpresa ? ADMIN_COLORS.purplePale : T.bluePale;
  const accentGradEnd = esEmpresa ? ADMIN_COLORS.purpleDark : T.blueL;
  const accentSolid = esEmpresa ? ADMIN_COLORS.purpleDark : T.navy;
  const router = useRouter();
  const { actualizar, eliminar, loading } = useClientes();
  const mostrarToast = useAppStore((s) => s.mostrarToast);

  const [editando, setEditando] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [form, setForm] = useState({
    nombre:    cliente.nombre,
    telefono:  cliente.telefono ?? "",
    ruc:       cliente.ruc ?? "",
    direccion: cliente.direccion ?? "",
    ciudad:    cliente.ciudad ?? "",
    email:     cliente.email ?? "",
    notas:     cliente.notas ?? "",
  });

  // Re-sincroniza el formulario si el servidor envía datos nuevos
  useEffect(() => {
    setForm({
      nombre:    cliente.nombre,
      telefono:  cliente.telefono ?? "",
      ruc:       cliente.ruc ?? "",
      direccion: cliente.direccion ?? "",
      ciudad:    cliente.ciudad ?? "",
      email:     cliente.email ?? "",
      notas:     cliente.notas ?? "",
    });
  }, [cliente]);

  // Estadísticas de la ficha (03-MODULO-CLIENTES-EMPRESA.md §6.3) — mismo
  // cálculo que EmpresaClientesPanel/page.tsx usa para la tabla de lista.
  const aprobadas = cotizaciones.filter((c) => c.status === "Aprobado").length;
  const totalFinal = cotizaciones.reduce((s, c) => s + c.totalFinal, 0);

  const abrirWhatsApp = () => {
    const digitos = soloDigitos(cliente.telefono ?? "");
    if (digitos.length < 6) { mostrarToast("Este cliente no tiene teléfono registrado", "error"); return; }
    const numero = digitos.startsWith("51") ? digitos : `51${digitos}`;
    window.open(`https://wa.me/${numero}`, "_blank", "noopener,noreferrer");
  };

  const llamar = () => {
    const digitos = soloDigitos(cliente.telefono ?? "");
    if (digitos.length < 6) { mostrarToast("Este cliente no tiene teléfono registrado", "error"); return; }
    window.location.href = `tel:${digitos}`;
  };

  const email = () => {
    if (!cliente.email) { mostrarToast("Este cliente no tiene correo registrado", "error"); return; }
    window.location.href = `mailto:${cliente.email}`;
  };

  const guardar = async () => {
    if (form.nombre.trim().length < 2) { mostrarToast("Ingresa el nombre", "error"); return; }
    const telefonoValido = validarTelefono(form.telefono);
    if (!telefonoValido.valido) { mostrarToast(telefonoValido.mensaje!, "error"); return; }
    const ok = await actualizar(cliente.id, {
      nombre:    form.nombre.trim(),
      telefono:  form.telefono.trim(),
      ruc:       form.ruc.trim() || undefined,
      direccion: form.direccion.trim() || undefined,
      ciudad:    form.ciudad.trim() || undefined,
      email:     form.email.trim() || undefined,
      notas:     form.notas.trim() || undefined,
    });
    if (ok) {
      setEditando(false);
      mostrarToast("Datos actualizados ✓");
      router.refresh();
    } else {
      mostrarToast("No se pudo actualizar", "error");
    }
  };

  const confirmarEliminar = async () => {
    setEliminando(true);
    const ok = await eliminar(cliente.id);
    setEliminando(false);
    if (ok) {
      mostrarToast("Cliente eliminado");
      router.push("/clientes");
      router.refresh();
    } else {
      mostrarToast("No se pudo eliminar", "error");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Acciones rápidas de contacto (§6.2) ─────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={abrirWhatsApp}
          className="flex flex-col items-center gap-1 rounded-xl py-3 text-xs font-bold"
          style={{ background: "#25D36618", color: "#128C7E" }}
        >
          💬 WhatsApp
        </button>
        <button
          type="button"
          onClick={llamar}
          className="flex flex-col items-center gap-1 rounded-xl py-3 text-xs font-bold"
          style={{ background: T.greenPale, color: T.greenD }}
        >
          📞 Llamar
        </button>
        <button
          type="button"
          onClick={email}
          className="flex flex-col items-center gap-1 rounded-xl py-3 text-xs font-bold"
          style={{ background: accentPale, color: accent }}
        >
          ✉️ Email
        </button>
      </div>

      {/* ── Tarjetas de estadísticas (§6.3) ─────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl py-3 text-center" style={{ background: accentPale }}>
          <p className="text-lg font-black" style={{ color: accent }}>{cotizaciones.length}</p>
          <p className="text-[10px] font-bold uppercase" style={{ color: accent }}>Cotizaciones</p>
        </div>
        <div className="rounded-xl py-3 text-center" style={{ background: T.greenPale }}>
          <p className="text-lg font-black" style={{ color: T.greenD }}>{aprobadas}</p>
          <p className="text-[10px] font-bold uppercase" style={{ color: T.greenD }}>Aprobadas</p>
        </div>
        <div className="rounded-xl py-3 text-center" style={{ background: T.amberPale }}>
          <p className="text-sm font-black" style={{ color: T.amberD }}>{fmtPEN(totalFinal)}</p>
          <p className="text-[10px] font-bold uppercase" style={{ color: T.amberD }}>Total S/</p>
        </div>
      </div>

      {/* ── Datos de contacto ─────────────────────────────── */}
      <Card>
        {editando ? (
          <div className="flex flex-col gap-3">
            <Input label="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <Input
              label="Teléfono (WhatsApp)"
              inputMode="tel"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              error={validarTelefono(form.telefono).mensaje}
            />
            <Input label="RUC / DNI" inputMode="numeric" value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} />
            <DireccionAutocomplete value={form.direccion} onChange={(v) => setForm({ ...form, direccion: v })} />
            <Input label="Ciudad" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
            <Input label="Correo electrónico" type="email" placeholder="cliente@correo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Notas" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEditando(false)}>Cancelar</Button>
              <Button
                full
                disabled={loading}
                onClick={guardar}
                style={esEmpresa ? { background: `linear-gradient(135deg,${accent},${accentGradEnd})` } : undefined}
              >
                {loading ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold" style={{ color: T.text }}>{cliente.nombre}</p>
              <p className="text-xs" style={{ color: T.textMid }}>{cliente.telefono || "Sin teléfono"}</p>
              {cliente.ruc && <p className="text-xs" style={{ color: T.textMid }}>RUC/DNI: {cliente.ruc}</p>}
              {(cliente.direccion || cliente.ciudad) && (
                <p className="text-xs" style={{ color: T.textMid }}>
                  {[cliente.direccion, cliente.ciudad].filter(Boolean).join(" · ")}
                </p>
              )}
              {cliente.email && <p className="text-xs" style={{ color: T.textMid }}>✉️ {cliente.email}</p>}
              {cliente.notas && <p className="text-xs" style={{ color: T.textMid }}>📝 {cliente.notas}</p>}
            </div>
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="shrink-0 rounded-xl px-3 py-2 text-xs font-bold"
              style={{ background: accentPale, color: accent }}
            >
              Editar
            </button>
          </div>
        )}
      </Card>

      {/* ── Nueva cotización para este cliente ─────────────── */}
      <Link
        href={`${nuevaCotizacionHref}?cliente=${cliente.id}`}
        className="flex items-center justify-center rounded-2xl py-3.5 text-sm font-extrabold text-white"
        style={{ background: `linear-gradient(135deg,${accent},${accentGradEnd})`, boxShadow: `0 4px 16px ${accent}35` }}
      >
        + Nueva cotización para este cliente
      </Link>

      {/* ── Nueva factura para este cliente — elegir Boleta/Factura ─── */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`${nuevaFacturaHref}?tipo=boleta&cliente=${cliente.id}`}
          className="flex items-center justify-center gap-1.5 rounded-2xl py-3 text-xs font-extrabold text-white"
          style={{ background: T.green }}
        >
          👤 Boleta
        </Link>
        <Link
          href={`${nuevaFacturaHref}?tipo=factura&cliente=${cliente.id}`}
          className="flex items-center justify-center gap-1.5 rounded-2xl py-3 text-xs font-extrabold text-white"
          style={{ background: accentSolid }}
        >
          🏢 Factura
        </Link>
      </div>

      {/* ── Historial de cotizaciones ──────────────────────── */}
      <div>
        <p className="mb-2 px-1 text-[11px] font-extrabold uppercase tracking-wide" style={{ color: T.textMid }}>
          Cotizaciones ({cotizaciones.length})
        </p>
        {cotizaciones.length === 0 ? (
          <div className="rounded-2xl bg-white py-8 text-center shadow-sm">
            <p className="text-sm font-semibold" style={{ color: T.textMid }}>
              Sin cotizaciones todavía
            </p>
          </div>
        ) : (
          <CotizacionesList iniciales={cotizaciones} soloHistorial nuevaCotizacionHref={nuevaCotizacionHref} nuevaFacturaHref={nuevaFacturaHref} />
        )}
      </div>

      {/* ── Facturas asociadas ─────────────────────────────── */}
      {facturas.length > 0 && (
        <div>
          <p className="mb-2 px-1 text-[11px] font-extrabold uppercase tracking-wide" style={{ color: T.textMid }}>
            Facturas ({facturas.length})
          </p>
          <div className="flex flex-col gap-3">
            {facturas.map((f) => <FacturaCard key={f.invId} factura={f} />)}
          </div>
        </div>
      )}

      {/* ── Eliminar cliente — siempre con confirmación explícita ─── */}
      <Card>
        {confirmandoEliminar ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold" style={{ color: T.red }}>
              ¿Seguro que quieres eliminar a {cliente.nombre}?
            </p>
            <p className="text-xs" style={{ color: T.textMid }}>
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setConfirmandoEliminar(false)} disabled={eliminando}>Cancelar</Button>
              <Button full variant="danger" disabled={eliminando} onClick={confirmarEliminar}>
                {eliminando ? "Eliminando…" : "Sí, eliminar"}
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmandoEliminar(true)}
            className="w-full text-center text-xs font-bold"
            style={{ color: T.red }}
          >
            Eliminar cliente
          </button>
        )}
      </Card>
    </div>
  );
}
