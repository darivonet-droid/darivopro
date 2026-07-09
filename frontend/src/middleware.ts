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

const RUTAS_PUBLICAS = ["/login", "/registro", "/recuperar", "/nueva-contrasena", "/precios", "/contacto", "/terminos", "/privacidad", "/auth/callback"];
// /nueva-contrasena: el usuario llega con sesión de recuperación — no redirigir al dashboard
const RUTAS_SOLO_INVITADO = ["/login", "/registro", "/recuperar"];

// ── Enrutado por subdominio (PREPARADO, DESACTIVADO por defecto) ──────────────
// Mapea cada subdominio real de producción a la sección raíz de su panel.
// Se activa SOLO cuando SUBDOMAIN_ROUTING_ENABLED === "1" (ver .env.example).
// En localhost/desarrollo y en el apex (darivopro.com) es un no-op total:
// los hostnames aquí terminan en ".darivopro.com", que no ocurre en local.
// No tocar next.config.mjs ni vercel.json hasta conectar el dominio en Vercel.
const SUBDOMINIOS: Record<string, string> = {
  app: "/dashboard", // Darivo Pro Móvil
  empresa: "/empresa", // Darivo Pro Empresa
  admin: "/admin", // Darivo Pro Admin
  partner: "/partner", // Panel Partner
};

/** Devuelve la sección base del subdominio *.darivopro.com, o null si no aplica. */
function baseDeSubdominio(host: string | null): string | null {
  if (!host) return null;
  const h = host.split(":")[0].toLowerCase();
  const sufijo = ".darivopro.com";
  if (!h.endsWith(sufijo)) return null; // apex, localhost, IPs → no aplica
  const sub = h.slice(0, -sufijo.length);
  return SUBDOMINIOS[sub] ?? null;
}

export async function middleware(req: NextRequest) {
  // Rewrite por hostname: solo la raíz "/" del subdominio se reescribe a la
  // sección del panel; el resto de rutas ya usan paths absolutos y pasan igual.
  // La protección de auth de más abajo se aplica luego en la navegación normal.
  if (process.env.SUBDOMAIN_ROUTING_ENABLED === "1") {
    const base = baseDeSubdominio(req.headers.get("host"));
    if (base && req.nextUrl.pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = base;
      return NextResponse.rewrite(url);
    }
  }

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
  // `.*\\..*` excluye archivos estáticos de public/ (imágenes, manifest.json,
  // sw.js, icons/…): sin esta exclusión, un visitante anónimo recibía
  // 307 → /login hasta para un .jpg, y el optimizador de next/image
  // devolvía 400 al recibir HTML en lugar de la imagen.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)"],
};
