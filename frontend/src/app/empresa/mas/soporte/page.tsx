import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { SoporteTicketsView } from "@/components/soporte/SoporteTicketsView";

export default function EmpresaSoportePage() {
  return (
    <EmpresaShell titulo="Soporte">
      <SoporteTicketsView volverHref="/empresa/mas" volverLabel="← Volver a Más" embedded />
    </EmpresaShell>
  );
}
