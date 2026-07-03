import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { EmpresaEmpleadosView } from "@/components/empresa/EmpresaEmpleadosView";

export default function EmpresaEmpleadosPage() {
  return (
    <EmpresaShell titulo="Empleados">
      <EmpresaEmpleadosView />
    </EmpresaShell>
  );
}
