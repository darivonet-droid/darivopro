import { requireProducto } from "@/lib/guards/require-producto";

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireProducto("partner");
  return <>{children}</>;
}
