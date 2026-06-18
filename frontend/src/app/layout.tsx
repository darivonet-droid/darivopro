import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DARIVO PRO",
  description: "Presupuestos y facturas de reformas en menos de 60 segundos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Darivo Pro",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563EB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="mx-auto min-h-screen" style={{ maxWidth: 390 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
