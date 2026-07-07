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
import { CotizacionesList } from "@/components/cotizacion/CotizacionesList";
import { FacturaCard } from "@/components/facturacion/FacturaCard";
import { useClientes } from "@/hooks/useClientes";
import { useAppStore } from "@/store/useAppStore";
import { T } from "@/lib/theme";
import type { Cliente, Factura, Cotizacion } from "@/types";

interface Props {
  cliente: Cliente;
  cotizaciones: Cotizacion[];
  facturas: Factura[];
}

export function ClienteFichaView({ cliente, cotizaciones, facturas }: Props) {
  const router = useRouter();
  const { actualizar, loading } = useClientes();
  const mostrarToast = useAppStore((s) => s.mostrarToast);

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nombre:    cliente.nombre,
    telefono:  cliente.telefono ?? "",
    ruc:       cliente.ruc ?? "",
    direccion: cliente.direccion ?? "",
    ciudad:    cliente.ciudad ?? "",
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
      notas:     cliente.notas ?? "",
    });
  }, [cliente]);

  const guardar = async () => {
    if (form.nombre.trim().length < 2) { mostrarToast("Ingresa el nombre", "error"); return; }
    const ok = await actualizar(cliente.id, {
      nombre:    form.nombre.trim(),
      telefono:  form.telefono.trim(),
      ruc:       form.ruc.trim() || undefined,
      direccion: form.direccion.trim() || undefined,
      ciudad:    form.ciudad.trim() || undefined,
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

  return (
    <div className="flex flex-col gap-4">
      {/* ── Datos de contacto ─────────────────────────────── */}
      <Card>
        {editando ? (
          <div className="flex flex-col gap-3">
            <Input label="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <Input label="Teléfono (WhatsApp)" inputMode="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <Input label="RUC / DNI" inputMode="numeric" value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} />
            <Input label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
            <Input label="Ciudad" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
            <Input label="Notas" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEditando(false)}>Cancelar</Button>
              <Button full disabled={loading} onClick={guardar}>{loading ? "Guardando…" : "Guardar"}</Button>
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
              {cliente.notas && <p className="text-xs" style={{ color: T.textMid }}>📝 {cliente.notas}</p>}
            </div>
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="shrink-0 rounded-xl px-3 py-2 text-xs font-bold"
              style={{ background: T.bluePale, color: T.blue }}
            >
              Editar
            </button>
          </div>
        )}
      </Card>

      {/* ── Nueva cotización para este cliente ─────────────── */}
      <Link
        href={`/cotizaciones/nuevo?cliente=${cliente.id}`}
        className="flex items-center justify-center rounded-2xl py-3.5 text-sm font-extrabold text-white"
        style={{ background: `linear-gradient(135deg,${T.blue},${T.blueL})`, boxShadow: `0 4px 16px ${T.blue}35` }}
      >
        + Nueva cotización para este cliente
      </Link>

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
          <CotizacionesList iniciales={cotizaciones} facturarMode="preguntar" soloHistorial />
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
    </div>
  );
}
