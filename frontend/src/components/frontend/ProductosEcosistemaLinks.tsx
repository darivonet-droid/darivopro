import Link from "next/link";
import {
  esAdministradorDarivo,
  esPartnerAutorizado,
} from "@/lib/acceso-producto";
import { createServerClient } from "@/lib/supabase/server";
import { T } from "@/lib/theme";

interface Props {
  email: string | null | undefined;
}

export async function ProductosEcosistemaLinks({ email }: Props) {
  const admin = esAdministradorDarivo(email);
  const partner = await esPartnerAutorizado(email, createServerClient());

  return (
    <div
      className="mt-4 rounded-2xl p-4"
      style={{ background: T.white, border: `1px solid ${T.slateD}` }}
    >
      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
        Otros productos
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {admin && (
          <Link
            href="/admin"
            className="rounded-xl px-3 py-2 text-xs font-bold text-white"
            style={{ background: T.navy }}
          >
            Admin →
          </Link>
        )}
        <Link
          href="/empresa"
          className="rounded-xl px-3 py-2 text-xs font-bold"
          style={{ background: T.bluePale, color: T.blue }}
        >
          Empresa →
        </Link>
        {partner && (
          <Link
            href="/partner"
            className="rounded-xl px-3 py-2 text-xs font-bold"
            style={{ background: T.tealPale, color: T.teal }}
          >
            Partner →
          </Link>
        )}
      </div>
    </div>
  );
}
