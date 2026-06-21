"use client";
// DARIVO PRO — Tab raíz del módulo Informes
import { useCallback, useState } from "react";
import { T } from "@/lib/theme";
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

export function InformesTab() {
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
                ? { background: T.blue, color: T.white }
                : { background: "transparent", color: T.textMid }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {sub === "semanal"    && <InformeSemanal    datos={semana}    cargando={cargando} onLoad={onLoadSemanal}    />}
      {sub === "mensual"    && <InformeMensual    datos={mes}       cargando={cargando} onLoad={onLoadMensual}    />}
      {sub === "trimestral" && <InformeTrimestral datos={trimestre} cargando={cargando} onLoad={onLoadTrimestral} />}

    </div>
  );
}
