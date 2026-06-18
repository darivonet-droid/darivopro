"use client";
// DARIVO PRO — Wizard de nuevo presupuesto (objetivo: < 60 segundos)
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NuevaPartidaModal } from "@/components/presupuesto/NuevaPartidaModal";
import { usePresupuesto } from "@/hooks/usePresupuesto";
import { usePresupuestoDraft } from "@/hooks/usePresupuestoDraft";
import { useAppStore } from "@/store/useAppStore";
import { CATALOGO, partidaALinea } from "@/lib/catalog";
import { presupuestoSchema } from "@/lib/validations";
import { fmtPEN } from "@/lib/utils";
import { T } from "@/lib/theme";
import type { LineaPresupuesto } from "@/types";

const PASOS = ["Cliente", "Partidas", "Resumen"] as const;

export function NuevoPresupuestoWizard() {
  const router = useRouter();
  const { crear, loading } = usePresupuesto();
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const mostrarUpgrade = useAppStore((s) => s.mostrarUpgrade);

  const [paso, setPaso] = useState(0);
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [capituloActivo, setCapituloActivo] = useState(CATALOGO[0].id);
  const [items, setItems] = useState<LineaPresupuesto[]>([]);
  const [margin, setMargin] = useState(40);
  const [notes, setNotes] = useState("");
  const [errorPaso, setErrorPaso] = useState<string | null>(null);
  const [modalPartida, setModalPartida] = useState(false);

  const draft = { clientName, phone, city, items, margin, notes, iaResult: null };
  const { cargar, limpiar } = usePresupuestoDraft(draft);

  useEffect(() => {
    const saved = cargar();
    if (saved && saved.items.length > 0) {
      setClientName(saved.clientName);
      setPhone(saved.phone);
      setCity(saved.city);
      setItems(saved.items);
      setMargin(saved.margin);
      setNotes(saved.notes);
    }
  }, [cargar]);

  const totalBase  = useMemo(() => items.reduce((s, it) => s + it.subtotal, 0), [items]);
  const totalLabor = Math.round(totalBase * margin) / 100;
  const totalFinal = totalBase + totalLabor;

  const agregar = (capId: string, svcId: string) => {
    const cap = CATALOGO.find((c) => c.id === capId);
    const partida = cap?.partidas.find((p) => p.id === svcId);
    if (!cap || !partida) return;
    setItems((prev) =>
      prev.some((it) => it.svcId === svcId)
        ? prev.filter((it) => it.svcId !== svcId)
        : [...prev, partidaALinea(cap, partida)]
    );
  };

  const cambiarQty = (svcId: string, qty: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.svcId === svcId
          ? { ...it, qty, subtotal: Math.round(it.unitPrice * qty * 100) / 100 }
          : it
      )
    );
  };

  const avanzar = () => {
    setErrorPaso(null);
    if (paso === 0 && clientName.trim().length < 2) {
      setErrorPaso("Ingresa el nombre del cliente");
      return;
    }
    if (paso === 1 && items.length === 0) {
      setErrorPaso("Agrega al menos una partida");
      return;
    }
    setPaso((p) => p + 1);
  };

  const guardar = async () => {
    const payload = {
      clientName: clientName.trim(),
      phone: phone.trim() || undefined,
      city: city.trim() || undefined,
      items,
      margin,
      totalBase,
      totalLabor,
      totalFinal,
      status: "Borrador" as const,
      notes: notes.trim() || undefined,
    };
    const valido = presupuestoSchema.safeParse(payload);
    if (!valido.success) {
      setErrorPaso(valido.error.errors[0]?.message ?? "Revisa los datos");
      return;
    }
    const creado = await crear(payload, mostrarUpgrade);
    if (creado) {
      limpiar();
      mostrarToast("Presupuesto creado ✓");
      router.push("/presupuestos");
      router.refresh();
    } else {
      mostrarToast("No se pudo guardar el presupuesto", "error");
    }
  };

  const capitulo = CATALOGO.find((c) => c.id === capituloActivo) ?? CATALOGO[0];

  return (
    <div className="px-4 py-4">
      {/* Indicador de pasos */}
      <div className="mb-5 flex items-center gap-2">
        {PASOS.map((nombre, i) => (
          <div key={nombre} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="h-1.5 w-full rounded-full transition-colors"
              style={{ background: i <= paso ? T.blue : T.slateD }}
            />
            <span className="text-[10px] font-bold" style={{ color: i <= paso ? T.blue : T.textLight }}>
              {nombre}
            </span>
          </div>
        ))}
      </div>

      {/* Paso 1: Cliente */}
      {paso === 0 && (
        <div className="su flex flex-col gap-4">
          <Input label="Nombre del cliente *" placeholder="Ej: Juan Pérez" value={clientName} onChange={(e) => setClientName(e.target.value)} autoFocus />
          <Input label="Teléfono (WhatsApp)" placeholder="51 999 999 999" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Ciudad" placeholder="Ej: Lima" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
      )}

      {/* Paso 2: Partidas */}
      {paso === 1 && (
        <div className="su">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3">
            {CATALOGO.map((cap) => (
              <button
                key={cap.id}
                onClick={() => setCapituloActivo(cap.id)}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-transform active:scale-95"
                style={
                  cap.id === capituloActivo
                    ? { background: cap.color, color: T.white }
                    : { background: T.white, color: T.textMid, border: `1.5px solid ${T.slateD}` }
                }
              >
                <span>{cap.emoji}</span>
                {cap.nombre}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {capitulo.partidas.map((p) => {
              const linea = items.find((it) => it.svcId === p.id);
              return (
                <div
                  key={p.id}
                  className="rounded-2xl p-3.5 shadow-sm transition-colors"
                  style={{
                    background: T.white,
                    border: `1.5px solid ${linea ? capitulo.color : "transparent"}`,
                  }}
                >
                  <button onClick={() => agregar(capitulo.id, p.id)} className="flex w-full items-center justify-between text-left">
                    <div>
                      <div className="text-sm font-bold" style={{ color: T.text }}>{p.nombre}</div>
                      <div className="text-xs" style={{ color: T.textMid }}>
                        {fmtPEN(p.precio)} / {p.unidad}
                      </div>
                    </div>
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-base font-black"
                      style={
                        linea
                          ? { background: capitulo.color, color: T.white }
                          : { background: T.slate, color: T.textMid }
                      }
                    >
                      {linea ? "✓" : "+"}
                    </div>
                  </button>

                  {linea && (
                    <div className="fi mt-3 flex items-center justify-between gap-3 border-t pt-3" style={{ borderColor: T.slateD }}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase" style={{ color: T.textMid }}>
                          Cant. ({p.unidad})
                        </span>
                        <input
                          type="number"
                          min={0.5}
                          step={0.5}
                          value={linea.qty}
                          onChange={(e) => cambiarQty(p.id, Math.max(0.5, Number(e.target.value)))}
                          className="w-20 rounded-lg px-2.5 py-1.5 text-center text-sm font-bold outline-none"
                          style={{ background: T.slate, color: T.text }}
                        />
                      </div>
                      <span className="text-sm font-black" style={{ color: T.navy }}>{fmtPEN(linea.subtotal)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {items.length > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: T.navy }}>
              <span className="text-xs font-bold" style={{ color: T.slateDD }}>
                {items.length} partida{items.length === 1 ? "" : "s"} seleccionada{items.length === 1 ? "" : "s"}
              </span>
              <span className="text-sm font-black" style={{ color: T.white }}>{fmtPEN(totalBase)}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setModalPartida(true)}
            className="mt-4 w-full rounded-2xl py-3.5 text-sm font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${T.amber} 0%, ${T.blue} 100%)`,
            }}
          >
            + Nueva partida personalizada
          </button>
        </div>
      )}

      <NuevaPartidaModal
        open={modalPartida}
        categoria={capitulo}
        onClose={() => setModalPartida(false)}
        onAdd={(linea) => setItems((prev) => [...prev, linea])}
      />

      {/* Paso 3: Resumen */}
      {paso === 2 && (
        <div className="su flex flex-col gap-4">
          <div className="rounded-2xl p-4 shadow-sm" style={{ background: T.white }}>
            <div className="text-sm font-extrabold" style={{ color: T.text }}>{clientName}</div>
            {(city || phone) && (
              <div className="text-xs" style={{ color: T.textMid }}>
                {[city, phone].filter(Boolean).join(" · ")}
              </div>
            )}
            <div className="mt-3 flex flex-col gap-1.5 border-t pt-3" style={{ borderColor: T.slateD }}>
              {items.map((it) => (
                <div key={it.svcId} className="flex justify-between text-xs">
                  <span style={{ color: T.textMid }}>
                    {it.svcLabel} × {it.qty} {it.unit}
                  </span>
                  <span className="font-bold" style={{ color: T.text }}>{fmtPEN(it.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-4 shadow-sm" style={{ background: T.white }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase" style={{ color: T.textMid }}>Mano de obra</span>
              <span className="text-sm font-black" style={{ color: T.blue }}>{margin}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="mt-2 w-full"
              style={{ accentColor: T.blue }}
            />
            <div className="mt-3 flex flex-col gap-1.5 border-t pt-3 text-sm" style={{ borderColor: T.slateD }}>
              <div className="flex justify-between">
                <span style={{ color: T.textMid }}>Partidas</span>
                <span className="font-bold" style={{ color: T.text }}>{fmtPEN(totalBase)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: T.textMid }}>Mano de obra ({margin}%)</span>
                <span className="font-bold" style={{ color: T.text }}>{fmtPEN(totalLabor)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-black" style={{ borderColor: T.slateD, color: T.navy }}>
                <span>TOTAL</span>
                <span>{fmtPEN(totalFinal)}</span>
              </div>
            </div>
          </div>

          <Input label="Notas (opcional)" placeholder="Ej: incluye materiales" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      )}

      {errorPaso && (
        <p className="pi mt-3 text-center text-sm font-semibold" style={{ color: T.red }}>{errorPaso}</p>
      )}

      {/* Navegación */}
      <div className="mt-6 flex gap-3">
        {paso > 0 && (
          <Button variant="ghost" onClick={() => { setErrorPaso(null); setPaso((p) => p - 1); }}>
            ← Atrás
          </Button>
        )}
        {paso < PASOS.length - 1 ? (
          <Button full onClick={avanzar}>Continuar →</Button>
        ) : (
          <Button full variant="success" disabled={loading} onClick={guardar}>
            {loading ? "Guardando…" : `Guardar presupuesto · ${fmtPEN(totalFinal)}`}
          </Button>
        )}
      </div>
    </div>
  );
}
