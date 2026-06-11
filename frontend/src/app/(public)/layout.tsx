import { T } from "@/lib/theme";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col px-6 pb-10 pt-14" style={{ background: T.navy }}>
      <div className="mb-10 text-center">
        <div className="text-3xl font-black tracking-tight" style={{ color: T.white }}>
          DARIVO <span style={{ color: T.blueL }}>PRO</span>
        </div>
        <p className="mt-1 text-xs" style={{ color: T.textLight }}>
          Presupuestos y facturas en menos de 60 segundos
        </p>
      </div>
      {children}
    </div>
  );
}
