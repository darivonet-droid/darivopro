import { Button } from "@/components/ui/Button";
import { T } from "@/lib/theme";

interface Props {
  visible: number;
  total: number;
  hayMas: boolean;
  onCargarMas: () => void;
}

export function PaginacionLista({ visible, total, hayMas, onCargarMas }: Props) {
  if (total <= 20) return null;
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <p className="text-xs font-semibold" style={{ color: T.textMid }}>
        Mostrando {visible} de {total}
      </p>
      {hayMas && (
        <Button variant="ghost" onClick={onCargarMas}>
          Cargar más
        </Button>
      )}
    </div>
  );
}
