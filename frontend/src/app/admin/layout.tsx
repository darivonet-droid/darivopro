import { requireProducto } from "@/lib/guards/require-producto";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireProducto("admin");
  return <>{children}</>;
}
