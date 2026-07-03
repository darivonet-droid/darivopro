"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { T } from "@/lib/theme";
import type { EstadoTicket } from "@/lib/soporte-types";

/** Almacenamiento local Móvil — sync Admin pendiente decisión propietario (INC-A01 · DOC-01) */
const STORAGE_KEY = "darivo_tickets_soporte";

interface TicketLocal {
  id: string;
  asunto: string;
  descripcion: string;
  estado: EstadoTicket;
  fecha: string;
}

interface SoporteTicketsViewProps {
  volverHref: string;
  volverLabel?: string;
  embedded?: boolean;
}

export function SoporteTicketsView({
  volverHref,
  volverLabel = "← Volver",
  embedded = false,
}: SoporteTicketsViewProps) {
  const [tickets, setTickets] = useState<TicketLocal[]>([]);
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    try {
      setTickets(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as TicketLocal[]);
    } catch {
      setTickets([]);
    }
  }, []);

  const crearTicket = () => {
    if (!asunto.trim() || !descripcion.trim()) return;
    const nuevo: TicketLocal = {
      id: crypto.randomUUID(),
      asunto: asunto.trim(),
      descripcion: descripcion.trim(),
      estado: "Nuevo",
      fecha: new Date().toLocaleDateString("es-PE"),
    };
    const next = [nuevo, ...tickets];
    setTickets(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setAsunto("");
    setDescripcion("");
    setMostrarForm(false);
  };

  return (
    <div>
      {!embedded && (
        <PageHeader titulo="Soporte" subtitulo="Crear y consultar tickets" />
      )}
      <main className={embedded ? "" : "px-4 py-4"}>
        <button
          type="button"
          onClick={() => setMostrarForm(true)}
          className="mb-4 w-full rounded-2xl py-3.5 text-sm font-extrabold text-white"
          style={{ background: T.teal }}
        >
          + Nueva incidencia
        </button>

        {mostrarForm && (
          <div
            className="mb-4 rounded-2xl p-4"
            style={{ background: T.white, border: `1.5px solid ${T.slateD}` }}
          >
            <input
              placeholder="Asunto"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              className="mb-2 w-full rounded-xl border px-3 py-2.5 text-sm"
              style={{ borderColor: T.slateD }}
            />
            <textarea
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="mb-3 w-full rounded-xl border px-3 py-2.5 text-sm"
              style={{ borderColor: T.slateD }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold"
                style={{ border: `1px solid ${T.slateD}`, color: T.textMid }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={crearTicket}
                className="flex-[2] rounded-xl py-2.5 text-sm font-bold text-white"
                style={{ background: T.teal }}
              >
                Enviar
              </button>
            </div>
            <p className="mt-2 text-[10px]" style={{ color: T.textLight }}>
              Almacenamiento local — sincronización Admin pendiente (INC-A01 · DOC-01).
            </p>
          </div>
        )}

        {tickets.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: T.textMid }}>
            No tienes tickets aún
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl px-4 py-3"
                style={{ background: T.white, border: `1px solid ${T.slateD}` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold" style={{ color: T.text }}>
                    {t.asunto}
                  </p>
                  <EstadoBadge estado={t.estado} />
                </div>
                <p className="mt-1 text-xs" style={{ color: T.textMid }}>
                  {t.descripcion}
                </p>
                <p className="mt-1 text-[10px]" style={{ color: T.textLight }}>
                  {t.fecha}
                </p>
              </div>
            ))}
          </div>
        )}

        <Link href={volverHref} className="mt-6 block text-center text-sm font-bold" style={{ color: T.blue }}>
          {volverLabel}
        </Link>
      </main>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: EstadoTicket }) {
  const colors: Record<EstadoTicket, { bg: string; color: string }> = {
    Nuevo: { bg: T.bluePale, color: T.blue },
    "En proceso": { bg: T.amberPale, color: T.amberD },
    Resuelto: { bg: T.greenPale, color: T.greenD },
  };
  const s = colors[estado];
  return (
    <span
      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      {estado}
    </span>
  );
}
