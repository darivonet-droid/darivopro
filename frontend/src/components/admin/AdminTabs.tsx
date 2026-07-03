"use client";

import { T } from "@/lib/design-system/tokens";

export function AdminTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b pb-3" style={{ borderColor: T.slateD }}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className="rounded-lg px-4 py-2 text-sm font-bold transition-colors"
          style={{
            background: active === tab ? T.blue : T.slate,
            color: active === tab ? T.white : T.textMid,
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export function AdminNotice({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-4 rounded-xl px-4 py-3 text-xs"
      style={{ background: T.amberPale, color: T.amberD }}
    >
      {children}
    </div>
  );
}

export function AdminBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "success" | "warning" | "danger" | "neutral";
}) {
  const styles = {
    success: { bg: T.greenPale, color: T.greenD },
    warning: { bg: T.amberPale, color: T.amberD },
    danger: { bg: "#FEE2E2", color: "#B91C1C" },
    neutral: { bg: T.slate, color: T.textMid },
  }[tone];
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
      style={{ background: styles.bg, color: styles.color }}
    >
      {label}
    </span>
  );
}
