"use client";
// DARIVO PRO — Empresa tab (diseño Fable 5 exacto — inline fields)
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { empresaSchema, type EmpresaForm } from "@/lib/validations";
import { T } from "@/lib/theme";

export function AjustesForm({ inicial, email }: { inicial: EmpresaForm; email: string }) {
  const router   = useRouter();
  const supabase = createClient();
  const mostrarToast = useAppStore((s) => s.mostrarToast);
  const modoOffline  = useAppStore((s) => s.modoOffline);
  const [form, setForm] = useState<EmpresaForm>(inicial);
  const [error, setError]       = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const conectado = !modoOffline;
  const MODULOS = [
    ["perfiles",    "Empresa"    ],
    ["presupuestos","Cotizaciones"],
    ["facturas",    "Facturas"   ],
    ["clientes",    "Clientes"   ],
    ["categorias",  "Catálogo"   ],
    ["documentos",  "PDF / Docs" ],
  ];

  const guardar = async () => {
    setError(null);
    const valido = empresaSchema.safeParse(form);
    if (!valido.success) { setError(valido.error.errors[0]?.message ?? "Revisa los datos"); return; }
    setGuardando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setGuardando(false); return; }
    const { error: dbError } = await supabase
      .from("perfiles")
      .update({
        razon_social:      form.razonSocial,
        ruc:               form.ruc,
        direccion:         form.direccion,
        telefono:          form.telefono || null,
        moneda:            form.moneda,
        simbolo:           form.simbolo,
        cta_detracciones:  form.ctaDetracciones || null,
      })
      .eq("id", user.id);
    setGuardando(false);
    if (dbError) { mostrarToast("No se pudo guardar", "error"); }
    else { mostrarToast("Datos de empresa guardados ✓"); router.refresh(); }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const FIELDS = [
    { label: "Razón social / Nombre", k: "razonSocial"      as keyof EmpresaForm, ph: "Mi Empresa S.A.C." },
    { label: "RUC",                   k: "ruc"              as keyof EmpresaForm, ph: "20XXXXXXXXX"        },
    { label: "Dirección fiscal",      k: "direccion"        as keyof EmpresaForm, ph: "Av. Principal 123, Lima" },
    { label: "Teléfono",              k: "telefono"         as keyof EmpresaForm, ph: "+51 9XX XXX XXX"    },
    { label: "Cta. Detracciones",     k: "ctaDetracciones"  as keyof EmpresaForm, ph: "00-123456789"       },
  ];

  return (
    <div className="fi" style={{ paddingBottom: 20 }}>
      <p style={{ fontSize: 13, color: T.textMid, marginBottom: 12 }}>Estos datos aparecen en todas tus facturas</p>

      {/* Inline fields card */}
      <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.slateD}`, overflow: "hidden", marginBottom: 14 }}>
        {FIELDS.map((f, i) => (
          <div key={f.k} style={{ padding: "13px 16px", borderBottom: i < FIELDS.length - 1 ? `1px solid ${T.slateD}` : "none" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 5 }}>{f.label}</p>
            <input
              value={(form[f.k] as string) ?? ""}
              onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
              placeholder={f.ph}
              style={{ border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: T.text, background: "transparent", width: "100%", fontFamily: "inherit" }}
            />
          </div>
        ))}
      </div>

      {/* Moneda */}
      <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.slateD}`, padding: "13px 16px", marginBottom: 14 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Moneda por defecto</p>
        <div style={{ display: "flex", gap: 8 }}>
          {(["PEN", "USD"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setForm({ ...form, moneda: v, simbolo: v === "PEN" ? "S/" : "$" })}
              style={{ flex: 1, padding: 11, borderRadius: 11, border: `2px solid ${form.moneda === v ? T.blue : T.slateD}`, background: form.moneda === v ? T.bluePale : "none", cursor: "pointer", fontSize: 13, fontWeight: 800, color: form.moneda === v ? T.blue : T.textMid }}
            >
              {v === "PEN" ? "S/ Sol peruano" : "$ Dólar"}
            </button>
          ))}
        </div>
      </div>

      {/* Supabase status card */}
      <div style={{ background: T.navyLight, borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.5 }}>Backend · Supabase</p>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: conectado ? `${T.green}22` : `${T.amber}22`, color: conectado ? T.green : T.amber }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: conectado ? T.green : T.amber }} />
            {conectado ? "Conectado" : "Sin conexión"}
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {MODULOS.map(([id, label]) => (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: conectado ? T.green : "rgba(255,255,255,0.2)", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>{id}</p>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p style={{ fontSize: 13, fontWeight: 600, color: T.red, marginBottom: 10 }}>{error}</p>}

      {/* Save button */}
      <button
        type="button"
        onClick={guardar}
        disabled={guardando}
        style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${T.blue},${T.blueL})`, color: T.white, fontSize: 15, fontWeight: 800, boxShadow: `0 4px 16px ${T.blue}35`, marginBottom: 10, opacity: guardando ? 0.7 : 1 }}
      >
        {guardando ? "Guardando…" : "Guardar cambios"}
      </button>

      {/* Cuenta / sesión */}
      <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.slateD}`, padding: "14px 16px", marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Cuenta</p>
        <p style={{ fontSize: 13, color: T.text, marginBottom: 12 }}>{email}</p>
        <button
          type="button"
          onClick={cerrarSesion}
          style={{ width: "100%", padding: 12, borderRadius: 12, border: `1.5px solid ${T.red}30`, background: T.redPale, cursor: "pointer", fontSize: 14, fontWeight: 700, color: T.red }}
        >
          Cerrar sesión
        </button>
      </div>

      <p style={{ fontSize: 10, color: T.textLight, textAlign: "center", paddingBottom: 8 }}>
        DARIVO PRO v1.0 · Hecho para construir más rápido
      </p>
    </div>
  );
}
