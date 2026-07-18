"use client";
import Link from "next/link";
import { T } from "@/lib/theme";
import { CerrarSesionButton } from "@/components/CerrarSesionButton";

export interface MasOpcion {
  href: string;
  titulo: string;
  subtitulo: string;
  emoji: string;
  color: string;
  bg: string;
}

const OPCIONES: MasOpcion[] = [
  {
    href: "/mas/perfil",
    titulo: "Perfil del usuario",
    subtitulo: "Nombre, foto y datos de acceso",
    emoji: "👤",
    color: T.blue,
    bg: T.bluePale,
  },
  {
    href: "/mas/informes",
    titulo: "Informes",
    subtitulo: "Semana · Mes · Anual",
    emoji: "📊",
    color: T.greenD,
    bg: T.greenPale,
  },
  {
    href: "/mas/documentos",
    titulo: "Documentos",
    subtitulo: "Facturas y cotizaciones por período",
    emoji: "📄",
    color: T.amberD,
    bg: T.amberPale,
  },
  {
    href: "/mas/plan",
    titulo: "Mi Plan",
    subtitulo: "Planes que escalan contigo",
    emoji: "💼",
    color: T.purple,
    bg: T.purplePale,
  },
  {
    href: "/mas/ia-preferencias",
    titulo: "Calculadora inteligente — Preferencias",
    subtitulo: "Ajustes del asistente",
    emoji: "🤖",
    color: T.purple,
    bg: T.purplePale,
  },
  {
    href: "/mas/soporte",
    titulo: "Soporte",
    subtitulo: "Crear y consultar tickets",
    emoji: "🎧",
    color: T.teal,
    bg: T.tealPale,
  },
  {
    href: "/mas/preferencias",
    titulo: "Preferencias generales",
    subtitulo: "Idioma, notificaciones y moneda",
    emoji: "⚙️",
    color: T.textMid,
    bg: T.slate,
  },
];

const OPCION_EMPRESA: MasOpcion = {
  href: "/empresa",
  titulo: "Darivo Pro Empresa",
  subtitulo: "Empleados, roles personalizados y panel de escritorio",
  emoji: "🏢",
  color: T.blue,
  bg: T.bluePale,
};

interface MasOpcionesListProps {
  /** Plan Business da acceso al producto Darivo Pro Empresa (04 §6, nota de nomenclatura) */
  esBusiness?: boolean;
  /** Rol Técnico (Tarea 2, CLAUDE.md 17/07/2026): nunca ve "Mis planes"; ve
   * "Informes" solo si su Gerente se lo habilitó. */
  ocultarMisPlanes?: boolean;
  ocultarInformes?: boolean;
}

export function MasOpcionesList({ esBusiness, ocultarMisPlanes, ocultarInformes }: MasOpcionesListProps) {
  let opciones = esBusiness ? [...OPCIONES, OPCION_EMPRESA] : OPCIONES;
  if (ocultarMisPlanes) opciones = opciones.filter((o) => o.href !== "/mas/plan");
  if (ocultarInformes) opciones = opciones.filter((o) => o.href !== "/mas/informes");
  return (
    <div className="mt-6">
      <p
        className="mb-3 text-xs font-bold uppercase tracking-wide"
        style={{ color: T.textMid }}
      >
        Más opciones
      </p>
      <div className="flex flex-col gap-2.5">
        {opciones.map((op) => (
          <Link
            key={op.href}
            href={op.href}
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-transform active:scale-[0.98]"
            style={{ background: T.white, border: `1.5px solid ${T.slateD}` }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
              style={{ background: op.bg }}
            >
              {op.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold" style={{ color: T.text }}>
                {op.titulo}
              </p>
              <p className="text-xs" style={{ color: T.textMid }}>
                {op.subtitulo}
              </p>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={T.textLight}
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        ))}
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
          style={{ background: T.redPale, border: `1.5px solid ${T.red}30` }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
            style={{ background: T.white }}
          >
            🚪
          </div>
          <CerrarSesionButton
            className="flex-1 text-left text-sm font-bold"
            style={{ color: T.red }}
          />
        </div>
      </div>
    </div>
  );
}
