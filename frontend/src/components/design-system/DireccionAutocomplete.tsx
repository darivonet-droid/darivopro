"use client";
// DARIVO PRO — Campo de dirección con Google Maps Places Autocomplete.
// Sin NEXT_PUBLIC_GOOGLE_MAPS_API_KEY configurada, se comporta como un
// input de texto libre normal (sin sugerencias, sin errores en consola).
import { useEffect, useRef } from "react";
import { T } from "@/lib/design-system/tokens";

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: Record<string, unknown>
          ) => {
            addListener: (event: string, handler: () => void) => { remove: () => void };
            getPlace: () => { formatted_address?: string };
          };
        };
      };
    };
  }
}

let mapsScriptPromise: Promise<void> | null = null;

function cargarGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window !== "undefined" && window.google?.maps?.places) return Promise.resolve();
  if (mapsScriptPromise) return mapsScriptPromise;
  mapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps"));
    document.head.appendChild(script);
  });
  return mapsScriptPromise;
}

/** Mismo estilo visual que components/ui/Input.tsx — no se toca ese componente compartido. */
export function DireccionAutocomplete({ label = "Dirección", value, onChange, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !inputRef.current) return;

    let listener: { remove: () => void } | null = null;
    let cancelado = false;

    cargarGoogleMaps(apiKey)
      .then(() => {
        if (cancelado || !inputRef.current || !window.google?.maps?.places) return;
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          fields: ["formatted_address"],
          componentRestrictions: { country: "pe" },
        });
        listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) onChange(place.formatted_address);
        });
      })
      .catch(() => {
        // Sin conexión / key inválida: el campo sigue funcionando como texto libre.
      });

    return () => {
      cancelado = true;
      listener?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
          {label}
        </span>
      )}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-colors focus:ring-2 focus:ring-blue-500/40"
        style={{ background: T.white, color: T.text, border: `1.5px solid ${T.slateD}` }}
      />
    </label>
  );
}
