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
  const [form, setForm] = useState<EmpresaForm>(inicial);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

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
      <Card>
        <h2 className="mb-3 text-sm font-extrabold" style={{ color: T.text }}>Mi empresa</h2>
        <div className="flex flex-col gap-3">
          <Input label="Razón social *" placeholder="Ej: Construcciones Pérez SAC" value={form.razonSocial} onChange={(e) => setForm({ ...form, razonSocial: e.target.value })} />
          <Input label="RUC *" placeholder="11 dígitos" inputMode="numeric" maxLength={11} value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} />
          <Input label="Dirección fiscal *" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          <Input label="Teléfono" inputMode="tel" value={form.telefono ?? ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />

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
