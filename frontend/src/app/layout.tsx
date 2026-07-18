import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://darivopro.com";

export const metadata: Metadata = {
  // Sin esto, la imagen de opengraph-image.png se resolvía con una URL
  // relativa al compartir el enlace — WhatsApp/redes no la mostraban.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DARIVO PRO",
    template: "%s — Darivo Pro",
  },
  description: "Cotizaciones y facturas de reformas en menos de 60 segundos",
  // apple-touch-icon: usa la convención de archivo estático de Next
  // (src/app/apple-icon.png, igual que icon.png) en vez de metadata.icons
  // manual — Next sobrescribe metadata.icons por completo cuando detecta un
  // icon.png de convención y no encuentra su contraparte apple-icon, así que
  // un override manual aquí quedaba silenciosamente descartado.
  // manifest y appleWebApp: movidos a (auth)/layout.tsx y onboarding/layout.tsx
  // (solo Móvil) — Admin y Empresa son paneles de escritorio, no deben ser
  // instalables como PWA.
  openGraph: {
    siteName: "Darivo Pro",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563EB",
  // Sin esto, env(safe-area-inset-*) resuelve siempre a 0px en toda la app
  // (Android/iOS ignoran el inset si el viewport no declara "cover") — lo
  // necesita cualquier elemento fixed pegado a un borde (BottomNav, FloatBar).
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
