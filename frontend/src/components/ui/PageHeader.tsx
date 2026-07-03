// DARIVO PRO — Cabecera de página (DarkHeader + BackBtn)
import { BackBtn } from "@/components/design-system/BackBtn";
import { DarkHeader } from "@/components/design-system/DarkHeader";

interface PageHeaderProps {
  titulo: string;
  subtitulo?: string;
  backHref?: string;
  backLabel?: string;
  accion?: React.ReactNode;
}

export function PageHeader({
  titulo,
  subtitulo,
  backHref,
  backLabel,
  accion,
}: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-30">
      <DarkHeader titulo={titulo} subtitulo={subtitulo} accion={accion}>
        {backHref && <BackBtn href={backHref} label={backLabel} />}
      </DarkHeader>
    </div>
  );
}
