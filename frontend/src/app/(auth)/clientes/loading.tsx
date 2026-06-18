import { ListaSkeleton } from "@/components/ui/Skeleton";

export default function LoadingClientes() {
  return (
    <div className="px-4 py-4">
      <ListaSkeleton filas={6} />
    </div>
  );
}
