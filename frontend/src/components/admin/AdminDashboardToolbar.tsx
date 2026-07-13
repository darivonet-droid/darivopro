"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { IconSearch, IconBell, IconHelp, IconCalendar, IconChevronDown } from "./AdminIcons";

const RANGOS = [
  { value: "7", label: "Últimos 7 días" },
  { value: "30", label: "Últimos 30 días" },
  { value: "90", label: "Últimos 90 días" },
] as const;

/** Barra superior del Dashboard — 00-PANEL-ADMIN-DASHBOARD.md §5 "Barra superior". */
export function AdminDashboardToolbar({ adminNombre }: { adminNombre: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const dias = searchParams.get("dias") ?? "30";

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/admin/usuarios?q=${encodeURIComponent(q.trim())}`);
  }

  function cambiarRango(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(`/admin?dias=${e.target.value}`);
  }

  const iniciales = adminNombre
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form onSubmit={buscar} className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
          <IconSearch size={14} color={ADMIN_COLORS.textLight} />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar usuario…"
          className="w-40 rounded-lg py-1.5 pl-8 pr-2 text-xs outline-none sm:w-52"
          style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
        />
      </form>

      <div className="relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5" style={{ background: ADMIN_COLORS.slate }}>
        <IconCalendar size={14} color={ADMIN_COLORS.textMid} />
        <select
          value={dias}
          onChange={cambiarRango}
          className="appearance-none bg-transparent pr-4 text-xs font-semibold outline-none"
          style={{ color: ADMIN_COLORS.text }}
        >
          {RANGOS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2">
          <IconChevronDown size={12} color={ADMIN_COLORS.textMid} />
        </span>
      </div>

      <button
        type="button"
        title="Sin notificaciones nuevas (función pendiente)"
        className="relative flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}
      >
        <IconBell size={16} />
      </button>

      <a
        href="mailto:soporte@darivopro.com"
        title="Ayuda — soporte@darivopro.com"
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}
      >
        <IconHelp size={16} />
      </a>

      <Link
        href="/admin/configuracion"
        className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-3"
        style={{ background: ADMIN_COLORS.slate }}
        title={adminNombre}
      >
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-white"
          style={{ background: ADMIN_COLORS.purple }}
        >
          {iniciales || "A"}
        </span>
        <span className="max-w-[10rem] truncate text-xs font-bold" style={{ color: ADMIN_COLORS.text }}>
          {adminNombre}
        </span>
      </Link>
    </div>
  );
}
