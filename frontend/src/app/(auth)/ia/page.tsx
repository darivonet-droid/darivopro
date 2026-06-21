import { IAPresupuestoFlow } from "@/components/presupuesto/IAPresupuestoFlow";
import { T } from "@/lib/theme";

export default function IAPage() {
  return (
    <div className="min-h-screen" style={{ background: "#F8FAFF" }}>
      <header className="px-5 pb-5 pt-6" style={{ background: T.navy }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: T.blue }}
          >
            <svg
              width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black" style={{ color: T.white }}>
              Asistente IA
            </h1>
            <p className="text-xs" style={{ color: T.textLight }}>
              Cotización en segundos con Claude
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        <IAPresupuestoFlow />
      </main>
    </div>
  );
}
