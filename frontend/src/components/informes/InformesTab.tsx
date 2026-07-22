"use client";
// DARIVO PRO — Tab raíz del módulo Informes
import { useCallback, useState } from "react";
import { T } from "@/lib/theme";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { useInformes } from "@/hooks/useInformes";
import { InformeSemanal }   from "./InformeSemanal";
import { InformeMensual }   from "./InformeMensual";
import { InformeTrimestral } from "./InformeTrimestral";

type SubTab = "semanal" | "mensual" | "trimestral";

const SUBTABS: { id: SubTab; label: string }[] = [
  { id: "semanal",     label: "Semanal"     },
  { id: "mensual",     label: "Mensual"     },
  { id: "trimestral",  label: "Trimestral"  },
];

interface InformesTabProps {
  /** Empresa desktop (pestaña Expediente de Cierre) pasa true para que el
   * selector de sub-pestaña activo use ADMIN_COLORS — Móvil sigue con el
   * azul por defecto (22/07/2026, corrección de la migración parcial de
   * Empresa a ADMIN_COLORS). Nota: los 3 componentes hijos (InformeSemanal/
   * Mensual/Trimestral) siguen en azul de Fable 5, sin migrar — fuera de
   * alcance de esta corrección, ver hallazgo adicional en
   * docs-internos/tareas/2026-07-22-verificacion-admin-colors-empresa.md. */
  esEmpresa?: boolean;
}

export function InformesTab({ esEmpresa }: InformesTabProps = {}) {
  const [sub, setSub] = useState<SubTab>("semanal");
  const {
    semana, mes, trimestre, cargando,
    cargarSemana, cargarMes, cargarTrimestre,
  } = useInformes();

  const onLoadSemanal    = useCallback(() => { if (!semana)    cargarSemana();    }, [semana,    cargarSemana]);
  const onLoadMensual    = useCallback(() => { if (!mes)       cargarMes();       }, [mes,       cargarMes]);
  const onLoadTrimestral = useCallback(() => { if (!trimestre) cargarTrimestre(); }, [trimestre, cargarTrimestre]);

  return (
    <div className="flex flex-col gap-4">

      {/* Sub-tabs */}
      <div
        className="flex rounded-2xl p-1"
        style={{ background: T.slate }}
      >
        {SUBTABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSub(id)}
            className="flex-1 rounded-xl py-2 text-xs font-bold transition-all"
            style={
              sub === id
                ? { background: esEmpresa ? ADMIN_COLORS.purple : T.blue, color: T.white }
                : { background: "transparent", color: T.textMid }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {sub === "semanal"    && <InformeSemanal    datos={semana}    cargando={cargando} onLoad={onLoadSemanal}    esEmpresa={esEmpresa} />}
      {sub === "mensual"    && <InformeMensual    datos={mes}       cargando={cargando} onLoad={onLoadMensual}    esEmpresa={esEmpresa} />}
      {sub === "trimestral" && <InformeTrimestral datos={trimestre} cargando={cargando} onLoad={onLoadTrimestral} esEmpresa={esEmpresa} />}

    </div>
  );
}
