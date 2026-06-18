"use client";
import { useState } from "react";
import { T } from "@/lib/theme";
import { AjustesForm } from "./AjustesForm";
import type { EmpresaForm } from "@/lib/validations";

type Tab = "empresa" | "tarifas" | "categorias";

interface ConfigTabsProps {
  email:    string;
  inicial:  EmpresaForm;
  tarifas:  { svc_id: string; precio: number }[];
}

export function ConfigTabs({ email, inicial, tarifas }: ConfigTabsProps) {
  const [tab, setTab] = useState<Tab>("empresa");

  const TABS: { id: Tab; label: string }[] = [
    { id: "empresa",     label: "Empresa"     },
    { id: "tarifas",     label: "Mis Tarifas" },
    { id: "categorias",  label: "Categorías"  },
  ];

  return (
    <div>
      {/* Selector de tabs */}
      <div
        className="mb-4 flex rounded-2xl p-1"
        style={{ background: T.navyLight }}
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-1 rounded-xl py-2 text-xs font-bold transition-all"
            style={
              tab === id
                ? { background: T.blue,      color: T.white }
                : { background: "transparent", color: T.textLight }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tab === "empresa"    && <EmpresaTab email={email} inicial={inicial} />}
      {tab === "tarifas"    && <TarifasTab tarifas={tarifas} />}
      {tab === "categorias" && <CategoriasTab />}
    </div>
  );
}

/* ─── Tab: Empresa ─────────────────────────────────────────── */
function EmpresaTab({ email, inicial }: { email: string; inicial: EmpresaForm }) {
  return <AjustesForm email={email} inicial={inicial} />;
}

/* ─── Tab: Mis Tarifas ─────────────────────────────────────── */
function TarifasTab({ tarifas }: { tarifas: { svc_id: string; precio: number }[] }) {
  if (tarifas.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-3 rounded-2xl p-8 text-center"
        style={{ background: T.navyLight }}
      >
        <div className="text-3xl">💰</div>
        <p className="text-sm font-semibold" style={{ color: T.white }}>
          Sin tarifas personalizadas
        </p>
        <p className="text-xs leading-relaxed" style={{ color: T.textLight }}>
          Cuando edites el precio de una partida en un presupuesto, aquí aparecerá tu tarifa guardada.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tarifas.map((t) => (
        <div
          key={t.svc_id}
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: T.navyLight }}
        >
          <span className="text-sm font-medium" style={{ color: T.white }}>
            {t.svc_id}
          </span>
          <span className="text-sm font-bold" style={{ color: T.blueL }}>
            S/ {t.precio.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Tab: Categorías ──────────────────────────────────────── */
const CAPITULOS = [
  { id: "albanileria",   label: "Albañilería",    emoji: "🧱", color: "#F59E0B" },
  { id: "fontaneria",    label: "Fontanería",     emoji: "🔧", color: "#0D9488" },
  { id: "electricidad",  label: "Electricidad",   emoji: "⚡", color: "#D97706" },
  { id: "pintura",       label: "Pintura",        emoji: "🎨", color: "#2563EB" },
  { id: "carpinteria",   label: "Carpintería",    emoji: "🪵", color: "#92400E" },
  { id: "climatizacion", label: "Climatización",  emoji: "❄️", color: "#7C3AED" },
];

function CategoriasTab() {
  return (
    <div className="flex flex-col gap-2">
      {CAPITULOS.map((c) => (
        <div
          key={c.id}
          className="flex items-center gap-3 rounded-xl px-4 py-3.5"
          style={{ background: T.navyLight }}
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-base"
            style={{ background: `${c.color}22` }}
          >
            {c.emoji}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: T.white }}>{c.label}</p>
          </div>
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: c.color }}
          />
        </div>
      ))}
      <p className="mt-2 text-center text-xs" style={{ color: T.textLight }}>
        Gestión de categorías personalizadas — próximamente
      </p>
    </div>
  );
}
