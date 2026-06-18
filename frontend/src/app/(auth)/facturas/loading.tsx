import { ListaSkeleton } from "@/components/ui/Skeleton";

export default function LoadingFacturas() {
  return (
    <div className="px-4 py-4">
      <ListaSkeleton filas={5} />
    </div>
  );
}
