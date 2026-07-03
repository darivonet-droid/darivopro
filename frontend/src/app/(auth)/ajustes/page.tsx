import { redirect } from "next/navigation";

/** Compatibilidad — ruta oficial: /mas (07-MODULO-MAS.md) */
export default function AjustesRedirect() {
  redirect("/mas");
}
