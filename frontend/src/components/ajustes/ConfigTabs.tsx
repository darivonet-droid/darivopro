"use client";
import { useState } from "react";
import { T } from "@/lib/theme";
import { AjustesForm } from "./AjustesForm";
import { CategoriasManager } from "./CategoriasManager";
import { InformesTab } from "@/components/informes/InformesTab";
import type { EmpresaForm } from "@/lib/validations";

type Tab = "empresa" | "tarifas" | "categorias" | "informes";

interface ConfigTabsProps {
  email:    string;
  inicial:  EmpresaForm;
  tarifas:  { svc_id: string; precio: number }[];
}

export function ConfigTabs({ email, inicial, tarifas }: ConfigTabsProps) {
  const [tab, setTab] = useState<Tab>("empresa");

  const TABS: { id: Tab; label: string }[] = [
    { id: "empresa",    label: "Empresa"    },
    { id: "tarifas",    label: "Tarifas"    },
    { id: "categorias", label: "Categorías" },
    { id: "informes",   label: "📊 Informes" },
  ];

  return (
    <div>
      {/* Selector de tabs */}
      <div
        className="mb-4 flex flex-wrap gap-1 rounded-2xl p-1"
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
      {tab === "categorias" && <CategoriasManager />}
      {tab === "informes"   && <InformesTab />}
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
          Cuando edites el precio de una partida en una cotización, aquí aparecerá tu tarifa guardada.
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

