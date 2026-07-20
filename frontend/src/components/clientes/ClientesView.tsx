"use client";
// DARIVO PRO — Gestión de clientes
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PaginacionLista } from "@/components/ui/PaginacionLista";
import { FiltroFechaChips } from "@/components/design-system/FiltroFechaChips";
import { useClientes } from "@/hooks/useClientes";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useAppStore } from "@/store/useAppStore";
import { soloDigitos, cumpleFiltroFecha, validarTelefono, type FiltroFecha } from "@/lib/utils";
import { T } from "@/lib/theme";
import type { Cliente } from "@/types";

export type ClienteConConteo = Cliente & { cotizaciones: number; ultimaCotizacion?: string };

const FORM_VACIO = { nombre: "", telefono: "", ruc: "", ciudad: "", email: "" };

export function ClientesView({ iniciales }: { iniciales: ClienteConConteo[] }) {
  const router = useRouter();
  const [clientes, setClientes] = useState<ClienteConConteo[]>(iniciales);
  const [mostrandoForm, setMostrandoForm] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState<string | null>(null);
  const [filtroFecha, setFiltroFecha] = useState<FiltroFecha | null>(null);
  const { crear, loading } = useClientes();
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const filtrados = useMemo(
    () => clientes.filter((c) => cumpleFiltroFecha(c.ultimaCotizacion, filtroFecha)),
    [clientes, filtroFecha]
  );
  const { slice, hayMas, cargarMas, total, visible } = usePaginatedList(filtrados);
  const telefonoError = validarTelefono(form.telefono).mensaje;

  // Lectura fresca: siempre prevalece lo que envía el servidor
  useEffect(() => { setClientes(iniciales); }, [iniciales]);

  const guardar = async () => {
    setError(null);
    // Solo Nombre y Teléfono son obligatorios (estilo WhatsApp)
    if (form.nombre.trim().length < 2) { setError("Ingresa el nombre"); return; }
    if (soloDigitos(form.telefono).length < 6) { setError("Ingresa un teléfono válido"); return; }
    if (!validarTelefono(form.telefono).valido) { setError(validarTelefono(form.telefono).mensaje!); return; }

    const creado = await crear({
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      ruc: form.ruc.trim() || undefined,
      ciudad: form.ciudad.trim() || undefined,
      email: form.email.trim() || undefined,
    });
    if (creado) {
      setClientes((prev) =>
        [...prev, { ...creado, cotizaciones: 0 }].sort((a, b) => a.nombre.localeCompare(b.nombre))
      );
      setForm(FORM_VACIO);
      setMostrandoForm(false);
      mostrarToast("Cliente guardado ✓");
    } else {
      mostrarToast("No se pudo guardar el cliente", "error");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {mostrandoForm ? (
        <Card>
          <div className="flex flex-col gap-3">
            <Input label="Nombre *" placeholder="Nombre o razón social" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} autoFocus />
            <Input
              label="Teléfono (WhatsApp) *"
              placeholder="51 999 999 999"
              inputMode="tel"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              error={telefonoError}
            />
            <Input label="RUC / DNI (opcional)" placeholder="11 u 8 dígitos" inputMode="numeric" value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} />
            <Input label="Ciudad (opcional)" placeholder="Ej: Lima" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
            <Input label="Correo electrónico (opcional)" type="email" placeholder="cliente@correo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <p className="text-[11px]" style={{ color: T.textMid }}>
              Solo necesitas nombre y teléfono. El resto lo puedes completar después en la ficha del cliente.
            </p>
            {error && <p className="text-sm font-semibold" style={{ color: T.red }}>{error}</p>}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => { setMostrandoForm(false); setError(null); }}>Cancelar</Button>
              <Button full disabled={loading} onClick={guardar}>{loading ? "Guardando…" : "Guardar cliente"}</Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button full onClick={() => setMostrandoForm(true)}>+ Nuevo cliente</Button>
      )}

      {!mostrandoForm && <FiltroFechaChips activo={filtroFecha} onChange={setFiltroFecha} />}

      {filtrados.length === 0 && !mostrandoForm && (
        <EmptyState
          emoji="👷"
          titulo={clientes.length === 0 ? "Sin clientes todavía" : "Sin clientes en este filtro"}
          descripcion={
            clientes.length === 0
              ? "Guarda tus clientes para crear cotizaciones aún más rápido."
              : "Ningún cliente tiene una cotización en este rango de fecha."
          }
        />
      )}

      {slice.map((c) => (
        <div
          key={c.id}
          onClick={() => router.push(`/clientes/${c.id}`)}
          className="cursor-pointer rounded-2xl bg-white px-4 py-4 shadow-sm transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black"
                style={{ background: T.bluePale, color: T.blue }}
              >
                {c.nombre.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: T.text }}>{c.nombre}</div>
                <div className="text-xs" style={{ color: T.textMid }}>
                  {c.telefono || "Sin teléfono"}
                  {" · "}
                  {c.cotizaciones} cotizaci{c.cotizaciones === 1 ? "ón" : "ones"}
                </div>
              </div>
            </div>
            <span className="text-lg" style={{ color: T.textLight }}>›</span>
          </div>
        </div>
      ))}
      <PaginacionLista visible={visible} total={total} hayMas={hayMas} onCargarMas={cargarMas} />
    </div>
  );
}
