import { DarivoChat } from "@/components/darivo/DarivoChat";
import { T } from "@/lib/theme";

export const metadata = {
  title: "Soporte",
  description: "Escríbele a Darivo, el soporte de Darivo Pro.",
};

export default function SoportePublicoPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 20px rgba(10,22,40,0.09)" }}>
        <h1 className="mb-1 text-xl font-extrabold" style={{ color: T.text }}>
          Soporte
        </h1>
        <p className="mb-4 text-sm" style={{ color: T.textMid }}>
          ¿Dudas sobre Darivo Pro, planes o precios? Escríbele a Darivo.
        </p>
        <DarivoChat maxHeight={440} />
      </div>
    </div>
  );
}
