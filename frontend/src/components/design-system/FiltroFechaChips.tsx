import { T } from "@/lib/design-system/tokens";
import type { FiltroFecha } from "@/lib/utils";

const OPCIONES: { id: FiltroFecha; label: string }[] = [
  { id: "hoy", label: "Hoy" },
  { id: "semana", label: "Semanal" },
  { id: "mes", label: "Mensual" },
];

interface Props {
  activo: FiltroFecha | null;
  onChange: (f: FiltroFecha | null) => void;
}

/**
 * Chips Hoy/Semanal/Mensual — toggle (tocar el activo lo desactiva, sin filtro).
 * Componente único reutilizado en Clientes, Facturas y Nueva factura (selector
 * "Cliente guardado"), mismo estilo de chip que ya usa Facturas para sus filtros
 * de estado (rounded-full, activo en T.blue).
 */
export function FiltroFechaChips({ activo, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {OPCIONES.map((o) => {
        const isActive = activo === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(isActive ? null : o.id)}
            className="shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors"
            style={{
              background: isActive ? T.blue : T.slateD,
              color: isActive ? T.white : T.textMid,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
