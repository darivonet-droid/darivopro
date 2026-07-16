import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { DarivoChat } from "@/components/darivo/DarivoChat";
import { SoporteTicketsView } from "@/components/soporte/SoporteTicketsView";
import { T } from "@/lib/theme";

export default function EmpresaSoportePage() {
  return (
    <EmpresaShell titulo="Soporte">
      <DarivoChat maxHeight={480} />
      <h2 className="mb-2 mt-6 text-sm font-extrabold" style={{ color: T.text }}>
        Mis casos
      </h2>
      <SoporteTicketsView volverHref="/empresa/mas" volverLabel="← Volver a Más" embedded />
    </EmpresaShell>
  );
}
