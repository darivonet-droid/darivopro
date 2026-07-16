"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { T } from "@/lib/theme";
import type { EstadoTicket, SoporteTicket } from "@/lib/soporte-types";

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
  const [tickets, setTickets] = useState<SoporteTicket[]>([]);
  const [cargando, setCargando] = useState(true);
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cargarTickets = async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/soporte/tickets");
      const json = await res.json();
      if (res.ok) setTickets(json.data as SoporteTicket[]);
    } catch {
      /* deja la lista como estaba */
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarTickets();
  }, []);

  const crearTicket = async () => {
    if (!asunto.trim() || !descripcion.trim() || enviando) return;
    setEnviando(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/soporte/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asunto: asunto.trim(), descripcion: descripcion.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "No se pudo enviar el caso");
        return;
      }
      setTickets((prev) => [json.data as SoporteTicket, ...prev]);
      setAsunto("");
      setDescripcion("");
      setMostrarForm(false);
    } catch {
      setErrorMsg("No se pudo enviar el caso — revisa tu conexión");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      {!embedded && (
        <PageHeader titulo="Mis casos" subtitulo="Crear y consultar tus casos con el equipo" />
      )}
      <main className={embedded ? "" : "px-4 py-4"}>
        <button
          type="button"
          onClick={() => setMostrarForm(true)}
          className="mb-4 w-full rounded-2xl py-3.5 text-sm font-extrabold text-white"
          style={{ background: T.teal }}
        >
          + Nuevo caso
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
            {errorMsg && (
              <p className="mb-2 text-xs font-semibold" style={{ color: T.red }}>
                {errorMsg}
              </p>
            )}
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
                disabled={enviando}
                className="flex-[2] rounded-xl py-2.5 text-sm font-bold text-white"
                style={{ background: T.teal, opacity: enviando ? 0.6 : 1 }}
              >
                {enviando ? "Enviando…" : "Enviar"}
              </button>
            </div>
          </div>
        )}

        {cargando ? (
          <p className="py-8 text-center text-sm" style={{ color: T.textMid }}>
            Cargando…
          </p>
        ) : tickets.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: T.textMid }}>
            No tienes casos aún
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
                  {new Date(t.createdAt).toLocaleDateString("es-PE")}
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
    Abierto: { bg: T.bluePale, color: T.blue },
    "En progreso": { bg: T.amberPale, color: T.amberD },
    Resuelto: { bg: T.greenPale, color: T.greenD },
    Cerrado: { bg: T.slate, color: T.textMid },
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
