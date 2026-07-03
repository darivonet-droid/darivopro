import { GRADIENTS, RADII, T } from "@/lib/design-system/tokens";

interface DarkHeaderProps {
  titulo: string;
  subtitulo?: string;
  pt?: number;
  badge?: React.ReactNode;
  accion?: React.ReactNode;
  children?: React.ReactNode;
}

/** Fable 5 §6.1 — DarkHeader */
export function DarkHeader({
  titulo,
  subtitulo,
  pt = 20,
  badge,
  accion,
  children,
}: DarkHeaderProps) {
  return (
    <header
      className="fi relative px-[18px] pb-[22px]"
      style={{
        paddingTop: pt,
        background: GRADIENTS.header,
        borderBottomLeftRadius: RADII.header,
        borderBottomRightRadius: RADII.header,
      }}
    >
      {(badge || accion) && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>{badge}</div>
          {accion}
        </div>
      )}
      <h1
        className="font-black leading-tight"
        style={{ color: T.white, fontSize: 20 }}
      >
        {titulo}
      </h1>
      {subtitulo && (
        <p className="mt-0.5 text-[13px] font-semibold" style={{ color: T.textLight }}>
          {subtitulo}
        </p>
      )}
      {children}
    </header>
  );
}
