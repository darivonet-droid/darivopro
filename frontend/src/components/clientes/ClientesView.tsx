"use client";
// DARIVO PRO — Gestión de clientes
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { useClientes } from "@/hooks/useClientes";
import { useAppStore } from "@/store/useAppStore";
import { clienteSchema } from "@/lib/validations";
import { T } from "@/lib/theme";
import type { Cliente } from "@/types";

const FORM_VACIO = { nombre: "", telefono: "", ruc: "", direccion: "", ciudad: "" };

export function ClientesView({ iniciales }: { iniciales: Cliente[] }) {
  const [clientes, setClientes] = useState(iniciales);
  const [mostrandoForm, setMostrandoForm] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState<string | null>(null);
  const { crear, eliminar, loading } = useClientes();
  const mostrarToast = useAppStore((s) => s.mostrarToast);

  const guardar = async () => {
    setError(null);
    const valido = clienteSchema.safeParse(form);
    if (!valido.success) {
      setError(valido.error.errors[0]?.message ?? "Revisa los datos");
      return;
    }
    const creado = await crear({
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim() || undefined,
      ruc: form.ruc.trim() || undefined,
      direccion: form.direccion.trim() || undefined,
      ciudad: form.ciudad.trim() || undefined,
    });
    if (creado) {
      setClientes((prev) => [...prev, creado].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setForm(FORM_VACIO);
      setMostrandoForm(false);
      mostrarToast("Cliente guardado ✓");
    } else {
      mostrarToast("No se pudo guardar el cliente", "error");
    }
  };

  const borrar = async (id: string) => {
    const ok = await eliminar(id);
    if (ok) {
      setClientes((prev) => prev.filter((c) => c.id !== id));
      mostrarToast("Cliente eliminado");
    } else {
      mostrarToast("No se pudo eliminar", "error");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {mostrandoForm ? (
        <Card>
          <div className="flex flex-col gap-3">
            <Input label="Nombre *" placeholder="Nombre o razón social" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} autoFocus />
            <Input label="Teléfono (WhatsApp)" placeholder="51 999 999 999" inputMode="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <Input label="RUC / DNI" placeholder="11 u 8 dígitos" inputMode="numeric" value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} />
            <Input label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
            <Input label="Ciudad" placeholder="Ej: Lima" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
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

      {clientes.length === 0 && !mostrandoForm && (
        <EmptyState
          emoji="👷"
          titulo="Sin clientes todavía"
          descripcion="Guarda tus clientes para crear presupuestos aún más rápido."
        />
      )}

      {clientes.map((c) => (
        <Card key={c.id}>
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
                  {[c.telefono, c.ciudad].filter(Boolean).join(" · ") || "Sin datos de contacto"}
                </div>
              </div>
            </div>
            <button
              onClick={() => borrar(c.id)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-black"
              style={{ background: T.redPale, color: T.red }}
              aria-label={`Eliminar ${c.nombre}`}
            >
              ×
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
