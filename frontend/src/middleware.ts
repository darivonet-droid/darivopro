// DARIVO PRO — Middleware: refresca la sesión Supabase y protege rutas
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  esAdministradorDarivo,
  esPartnerAutorizado,
  puedeAccederEmpresa,
} from "@/lib/acceso-producto";

interface CookieASetear {
  name: string;
  value: string;
  options?: CookieOptions;
}

const RUTAS_PUBLICAS = ["/login", "/registro", "/recuperar", "/nueva-contrasena", "/precios", "/auth/callback"];
// /nueva-contrasena: el usuario llega con sesión de recuperación — no redirigir al dashboard
const RUTAS_SOLO_INVITADO = ["/login", "/registro", "/recuperar"];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookies: CookieASetear[]) {
          cookies.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const esPublica = RUTAS_PUBLICAS.some((r) => req.nextUrl.pathname.startsWith(r));

  if (!user && !esPublica && req.nextUrl.pathname !== "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (user && RUTAS_SOLO_INVITADO.some((r) => req.nextUrl.pathname.startsWith(r))) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  const path = req.nextUrl.pathname;
  if (user) {
    if (path.startsWith("/admin") && !esAdministradorDarivo(user.email)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("acceso", "admin_denegado");
      return NextResponse.redirect(url);
    }
    if (path.startsWith("/partner") && !esPartnerAutorizado(user.email)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("acceso", "partner_denegado");
      return NextResponse.redirect(url);
    }
    if (path.startsWith("/empresa") && !(await puedeAccederEmpresa(supabase, user))) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("acceso", "empresa_denegado");
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
