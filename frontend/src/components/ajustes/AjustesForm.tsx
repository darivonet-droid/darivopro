"use client";
// DARIVO PRO — Ajustes: datos de la empresa + sesión
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { empresaSchema, type EmpresaForm } from "@/lib/validations";
import { T } from "@/lib/theme";

export function AjustesForm({ inicial, email }: { inicial: EmpresaForm; email: string }) {
  const router = useRouter();
  const supabase = createClient();
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const modoOffline = useAppStore((s) => s.modoOffline);
  const [form, setForm] = useState<EmpresaForm>(inicial);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Estado real de conexión: la página cargó datos desde Supabase, así que
  // el backend responde salvo que estemos en modo offline detectado por la PWA.
  const conectado = !modoOffline;
  const MODULOS = [
    ["perfiles", "Empresa"],
    ["presupuestos", "Cotizaciones"],
    ["facturas", "Facturas"],
    ["clientes", "Clientes"],
    ["categorias", "Catálogo"],
    ["documentos", "PDF / Docs"],
  ];

  const guardar = async () => {
    setError(null);
    const valido = empresaSchema.safeParse(form);
    if (!valido.success) {
      setError(valido.error.errors[0]?.message ?? "Revisa los datos");
      return;
    }
    setGuardando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setGuardando(false); return; }
    const { error: dbError } = await supabase
      .from("perfiles")
      .update({
        razon_social: form.razonSocial,
        ruc: form.ruc,
        direccion: form.direccion,
        telefono: form.telefono || null,
        moneda: form.moneda,
        simbolo: form.simbolo,
        cta_detracciones: form.ctaDetracciones || null,
      })
      .eq("id", user.id);
    setGuardando(false);
    if (dbError) {
      mostrarToast("No se pudo guardar", "error");
    } else {
      mostrarToast("Datos de empresa guardados ✓");
      router.refresh();
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Resumen navy: datos reales de la empresa + estado real de Supabase */}
      <div className="su rounded-2xl px-5 py-4" style={{ background: T.navy }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-black" style={{ color: T.white }}>
              {form.razonSocial || "Sin razón social"}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
              RUC {form.ruc || "—"} · {form.simbolo} {form.moneda}
            </p>
          </div>
          <span
            className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
            style={{
              background: conectado ? `${T.green}22` : `${T.amber}22`,
              color: conectado ? T.green : T.amber,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: conectado ? T.green : T.amber }}
            />
            {conectado ? "Conectado" : "Sin conexión"}
          </span>
        </div>

        <p
          className="mb-3 mt-4 text-[11px] font-bold uppercase tracking-wide"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Backend · Supabase
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {MODULOS.map(([id, label]) => (
            <div key={id} className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: conectado ? T.green : "rgba(255,255,255,0.25)" }}
              />
              <div className="min-w-0">
                <p className="truncate font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {id}
                </p>
                <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-extrabold" style={{ color: T.text }}>Mi empresa</h2>
        <div className="flex flex-col gap-3">
          <Input label="Razón social *" placeholder="Ej: Construcciones Pérez SAC" value={form.razonSocial} onChange={(e) => setForm({ ...form, razonSocial: e.target.value })} />
          <Input label="RUC *" placeholder="11 dígitos" inputMode="numeric" maxLength={11} value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} />
          <Input label="Dirección fiscal *" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          <Input label="Teléfono" inputMode="tel" value={form.telefono ?? ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <Input
            label="Cuenta detracciones (Banco de la Nación)"
            placeholder="Ej: 00-123456789"
            inputMode="numeric"
            value={form.ctaDetracciones ?? ""}
            onChange={(e) => setForm({ ...form, ctaDetracciones: e.target.value })}
          />

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>Moneda</span>
            <div className="flex gap-2">
              {(["PEN", "USD"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setForm({ ...form, moneda: m, simbolo: m === "PEN" ? "S/" : "$" })}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-transform active:scale-95"
                  style={
                    form.moneda === m
                      ? { background: T.blue, color: T.white }
                      : { background: T.white, color: T.textMid, border: `1.5px solid ${T.slateD}` }
                  }
                >
                  {m === "PEN" ? "S/ Soles" : "$ Dólares"}
                </button>
              ))}
            </div>
          </label>

          {error && <p className="text-sm font-semibold" style={{ color: T.red }}>{error}</p>}
          <Button full disabled={guardando} onClick={guardar}>
            {guardando ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-extrabold" style={{ color: T.text }}>Cuenta</h2>
        <p className="mt-1 text-xs" style={{ color: T.textMid }}>{email}</p>
        <div className="mt-3">
          <Button variant="danger" full onClick={cerrarSesion}>Cerrar sesión</Button>
        </div>
      </Card>

      <p className="pb-4 text-center text-[10px]" style={{ color: T.textLight }}>
        DARIVO PRO v1.0 · Hecho para construir más rápido
      </p>
    </div>
  );
}
