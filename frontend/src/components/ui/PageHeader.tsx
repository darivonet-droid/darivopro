// DARIVO PRO — Cabecera de página
import Link from "next/link";
import { T } from "@/lib/theme";

interface PageHeaderProps {
  titulo: string;
  subtitulo?: string;
  backHref?: string;
  accion?: React.ReactNode;
}

export function PageHeader({ titulo, subtitulo, backHref, accion }: PageHeaderProps) {
  return (
    <header
      className="fi sticky top-0 z-30 px-4 pb-4 pt-5"
      style={{
        background: `linear-gradient(160deg, ${T.navy} 0%, ${T.navyLight} 100%)`,
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {backHref && (
            <Link
              href={backHref}
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: T.navyLight, color: T.white }}
              aria-label="Volver"
            >
              ←
            </Link>
          )}
          <div>
            <h1 className="text-lg font-black tracking-tight" style={{ color: T.white }}>{titulo}</h1>
            {subtitulo && <p className="text-xs" style={{ color: T.textLight }}>{subtitulo}</p>}
          </div>
        </div>
        {accion}
      </div>
    </header>
  );
}
