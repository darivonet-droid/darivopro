import { DarkHeader } from "@/components/design-system/DarkHeader";
import { IACotizacionFlow } from "@/components/cotizacion/IACotizacionFlow";
import { GRADIENTS, T } from "@/lib/design-system/tokens";

export default function IAPage() {
  return (
    <div className="min-h-screen" style={{ background: "#F8FAFF" }}>
      <DarkHeader
        titulo="IA"
        subtitulo="Cotización en segundos con OpenAI"
        accion={
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: GRADIENTS.ia }}
          >
            <span className="text-lg">✨</span>
          </div>
        }
      />

      <main className="px-4 py-4">
        <IACotizacionFlow />
      </main>
    </div>
  );
}
