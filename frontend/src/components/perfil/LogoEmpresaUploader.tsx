"use client";
// DARIVO PRO — Subida de logo de empresa (Tarea 1, CLAUDE.md 19/07/2026)
// Compartido Móvil/Empresa: actualiza perfiles.logo_url, única fuente de
// verdad leída por ambas plataformas al generar el header de Cotización/Factura.
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 2 * 1024 * 1024;

interface Colores {
  text: string;
  textMid: string;
  accent: string;
  slateD: string;
}

interface Props {
  logoUrl: string | null;
  colores: Colores;
}

export function LogoEmpresaUploader({ logoUrl: logoInicial, colores }: Props) {
  const [logoUrl, setLogoUrl] = useState(logoInicial);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen (PNG o JPG)");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("La imagen no debe superar 2MB");
      return;
    }

    setError(null);
    setSubiendo(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `${user.id}/logo.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("logos")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("logos").getPublicUrl(path);
      const url = `${pub.publicUrl}?t=${Date.now()}`;

      const { error: updErr } = await supabase
        .from("perfiles")
        .update({ logo_url: url })
        .eq("id", user.id);
      if (updErr) throw updErr;

      setLogoUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el logo");
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onQuitar() {
    setError(null);
    setSubiendo(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { error: updErr } = await supabase
        .from("perfiles")
        .update({ logo_url: null })
        .eq("id", user.id);
      if (updErr) throw updErr;

      setLogoUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo quitar el logo");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl"
        style={{ width: 64, height: 64, border: `1.5px solid ${colores.slateD}`, background: "#F8FAFC" }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL dinámica por usuario (bucket público Storage), sin dominio fijo para next/image
          <img src={logoUrl} alt="Logo de la empresa" className="h-full w-full object-contain" />
        ) : (
          <span style={{ fontSize: 9, color: colores.textMid, textAlign: "center" }}>Sin logo</span>
        )}
      </div>
      <div className="flex flex-col items-start gap-1">
        <label className="cursor-pointer text-xs font-bold" style={{ color: colores.accent }}>
          {subiendo ? "Subiendo..." : logoUrl ? "Cambiar logo" : "Subir logo"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={subiendo}
            onChange={onFileChange}
          />
        </label>
        {logoUrl && (
          <button
            type="button"
            onClick={onQuitar}
            disabled={subiendo}
            className="text-xs font-bold"
            style={{ color: colores.textMid }}
          >
            Quitar logo
          </button>
        )}
        {error && (
          <p className="text-xs" style={{ color: "#DC2626" }}>{error}</p>
        )}
        <p className="text-[10px]" style={{ color: colores.textMid }}>
          PNG o JPG, máx. 2MB. Se usa en tus Cotizaciones y Facturas.
        </p>
      </div>
    </div>
  );
}
