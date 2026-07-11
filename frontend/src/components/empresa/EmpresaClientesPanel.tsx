"use client";
// DARIVO PRO Empresa — Lista de clientes + panel lateral de ficha
// (03-MODULO-CLIENTES-EMPRESA.md §4/§6: tabla + panel ~360-400px al
// seleccionar, sin salir del shell de escritorio — antes navegaba a la
// ruta de Móvil y sacaba al Gerente de EmpresaShell. Corregido 12/07/2026.)
import { useEffect, useState } from "react";
import { AdminTable } from "@/components/admin/AdminUi";
import { ClienteFichaView } from "@/components/clientes/ClienteFichaView";
import { useClientes } from "@/hooks/useClientes";
import { useAppStore } from "@/store/useAppStore";
import { soloDigitos, fmtPEN } from "@/lib/utils";
import { T } from "@/lib/design-system/tokens";
import type { Cliente, Cotizacion, Factura } from "@/types";

export interface EmpresaClienteRow {
  id: string;
  nombre: string;
  ciudad?: string;
  telefono?: string;
  cotizacionesCount: number;
  aprobadasCount: number;
  totalFinal: number;
}

interface FichaData {
  cliente: Cliente;
  cotizaciones: Cotizacion[];
  facturas: Factura[];
}

const FORM_VACIO = { nombre: "", telefono: "", ciudad: "" };

export function EmpresaClientesPanel({ iniciales }: { iniciales: EmpresaClienteRow[] }) {
  const [clientes, setClientes] = useState(iniciales);
  const [buscar, setBuscar] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ficha, setFicha] = useState<FichaData | null>(null);
  const [fichaLoading, setFichaLoading] = useState(false);
  const [mostrandoForm, setMostrandoForm] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const { crear, obtenerFicha, loading } = useClientes();
  const mostrarToast = useAppStore((s) => s.mostrarToast);

  useEffect(() => { setClientes(iniciales); }, [iniciales]);

  const filtrados = clientes.filter(
    (c) => !buscar.trim() || c.nombre.toLowerCase().includes(buscar.trim().toLowerCase())
  );

  const abrirFicha = async (id: string) => {
    setSelectedId(id);
    setFichaLoading(true);
    const data = await obtenerFicha(id);
    setFicha(data);
    setFichaLoading(false);
    if (!data) mostrarToast("No se pudo cargar la ficha del cliente", "error");
  };

  const cerrarFicha = () => {
    setSelectedId(null);
    setFicha(null);
  };

  const guardarNuevo = async () => {
    setErrorForm(null);
    if (form.nombre.trim().length < 2) { setErrorForm("Ingresa el nombre"); return; }
    if (soloDigitos(form.telefono).length < 6) { setErrorForm("Ingresa un teléfono válido"); return; }

    const creado = await crear({
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      ciudad: form.ciudad.trim() || undefined,
    });
    if (creado) {
      setClientes((prev) =>
        [
          ...prev,
          {
            id: creado.id,
            nombre: creado.nombre,
            ciudad: creado.ciudad,
            telefono: creado.telefono,
            cotizacionesCount: 0,
            aprobadasCount: 0,
            totalFinal: 0,
          },
        ].sort((a, b) => a.nombre.localeCompare(b.nombre))
      );
      setForm(FORM_VACIO);
      setMostrandoForm(false);
      mostrarToast("Cliente guardado ✓");
    } else {
      mostrarToast("No se pudo guardar el cliente", "error");
    }
  };

  const filaActivaIndex = selectedId ? filtrados.findIndex((c) => c.id === selectedId) : undefined;

  return (
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Buscar cliente…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="min-w-[200px] flex-1 rounded-xl border px-4 py-2 text-sm"
            style={{ borderColor: T.slateD }}
          />
          <button
            type="button"
            onClick={() => setMostrandoForm((v) => !v)}
            className="rounded-xl px-4 py-2 text-sm font-bold text-white"
            style={{ background: T.blue }}
          >
            + Nuevo cliente
          </button>
        </div>

        {mostrandoForm && (
          <div
            className="mb-4 flex flex-col gap-2 rounded-2xl p-4"
            style={{ background: T.white, border: `1px solid ${T.slateD}` }}
          >
            <input
              placeholder="Nombre *"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: T.slateD }}
              autoFocus
            />
            <input
              placeholder="Teléfono (WhatsApp) *"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: T.slateD }}
            />
            <input
              placeholder="Ciudad (opcional)"
              value={form.ciudad}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
              className="rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: T.slateD }}
            />
            {errorForm && <p className="text-xs font-semibold" style={{ color: T.red }}>{errorForm}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setMostrandoForm(false); setErrorForm(null); }}
                className="flex-1 rounded-xl px-3 py-2 text-sm font-bold"
                style={{ background: T.slate, color: T.textMid }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={guardarNuevo}
                className="flex-1 rounded-xl px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                style={{ background: T.blue }}
              >
                {loading ? "Guardando…" : "Guardar cliente"}
              </button>
            </div>
          </div>
        )}

        <AdminTable
          headers={["Cliente", "Ciudad", "Cotizaciones", "Aprobadas", "Total S/"]}
          vacio="Sin clientes todavía"
          onRowClick={(i) => void abrirFicha(filtrados[i].id)}
          filaActivaIndex={filaActivaIndex}
          rows={filtrados.map((c) => [
            <div key="nombre" className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                style={{ background: `linear-gradient(135deg, ${T.blue}, ${T.blueL})` }}
              >
                {c.nombre.slice(0, 2).toUpperCase()}
              </div>
              <span className="font-semibold">{c.nombre}</span>
            </div>,
            c.ciudad ?? "—",
            c.cotizacionesCount,
            c.aprobadasCount,
            <span key="total" className="font-bold" style={{ color: T.blue }}>
              {fmtPEN(c.totalFinal)}
            </span>,
          ])}
        />
      </div>

      {selectedId && (
        <div
          className="w-[380px] shrink-0 rounded-2xl p-4"
          style={{ background: T.slate, border: `1px solid ${T.slateD}`, maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}
        >
          <button
            type="button"
            onClick={cerrarFicha}
            className="mb-3 text-sm font-bold"
            style={{ color: T.blue }}
          >
            ← Clientes
          </button>

          {fichaLoading || !ficha ? (
            <p className="py-8 text-center text-sm" style={{ color: T.textMid }}>
              Cargando ficha…
            </p>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${T.blue}, ${T.blueL})` }}
                >
                  {ficha.cliente.nombre.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-black" style={{ color: T.text }}>
                    {ficha.cliente.nombre}
                  </p>
                  {ficha.cliente.ciudad && (
                    <p className="text-xs" style={{ color: T.textMid }}>{ficha.cliente.ciudad}</p>
                  )}
                </div>
              </div>
              <ClienteFichaView
                cliente={ficha.cliente}
                cotizaciones={ficha.cotizaciones}
                facturas={ficha.facturas}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
