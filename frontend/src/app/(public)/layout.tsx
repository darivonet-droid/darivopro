import { T } from "@/lib/theme";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">

      {/* ── Header navy ─────────────────────────────────────── */}
      <header style={{ background: T.navy }}>
        <div className="flex h-[64px] items-center justify-center gap-2.5 px-6">
          {/* Ícono */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: T.blue }}
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          {/* Nombre */}
          <span className="text-xl font-black tracking-tight" style={{ color: T.white }}>
            DARIVO{" "}
            <span style={{ color: T.blueL }}>PRO</span>
          </span>
        </div>
      </header>

      {/* ── Body claro ──────────────────────────────────────── */}
      <main
        className="flex flex-1 flex-col items-center px-5 py-8 pb-14"
        style={{ background: "#F8FAFF" }}
      >
        <div className="w-full" style={{ maxWidth: 390 }}>
          {children}
        </div>
      </main>

    </div>
  );
}
