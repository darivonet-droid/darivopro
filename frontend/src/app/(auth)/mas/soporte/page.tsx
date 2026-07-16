import { PageHeader } from "@/components/ui/PageHeader";
import { DarivoChat } from "@/components/darivo/DarivoChat";
import { SoporteTicketsView } from "@/components/soporte/SoporteTicketsView";
import { T } from "@/lib/theme";

export default function SoportePage() {
  return (
    <div>
      <PageHeader titulo="Soporte" subtitulo="Escríbele a Darivo o revisa tus casos" />
      <main className="px-4 py-4">
        <DarivoChat />
        <h2 className="mb-2 mt-6 text-sm font-extrabold" style={{ color: T.text }}>
          Mis casos
        </h2>
        <SoporteTicketsView volverHref="/mas" volverLabel="← Volver a Más" embedded />
      </main>
    </div>
  );
}
