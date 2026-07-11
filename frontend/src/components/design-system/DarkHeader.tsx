import { GRADIENTS, RADII, T } from "@/lib/design-system/tokens";

interface DarkHeaderProps {
  titulo: string;
  subtitulo?: string;
  pt?: number;
  /** Caja de icono a la izquierda del título — QuoteScreen usa I.zap (16-SISTEMA-DE-DISEÑO-FABLE5.md §11.3) */
  icono?: React.ReactNode;
  /** Contenido antes del título (p.ej. BackBtn) — orden exacto de fable-5-diseño.jsx: Volver → icono+título → children */
  preTitulo?: React.ReactNode;
  badge?: React.ReactNode;
  accion?: React.ReactNode;
  children?: React.ReactNode;
}

/** Fable 5 §6.1 — DarkHeader */
export function DarkHeader({
  titulo,
  subtitulo,
  pt = 20,
  icono,
  preTitulo,
  badge,
  accion,
  children,
}: DarkHeaderProps) {
  const titleBlock = (
    <>
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
    </>
  );

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
      {(badge || (accion && !icono)) && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>{badge}</div>
          {!icono && accion}
        </div>
      )}
      {preTitulo}
      {icono ? (
        <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: T.blue }}
          >
            {icono}
          </div>
          <div className="min-w-0 flex-1">{titleBlock}</div>
          {accion}
        </div>
      ) : (
        titleBlock
      )}
      {children}
    </header>
  );
}
