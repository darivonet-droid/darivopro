"use client";

import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";

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
    <div className="mb-6 flex flex-wrap gap-2 border-b pb-3" style={{ borderColor: ADMIN_COLORS.slateD }}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className="rounded-lg px-4 py-2 text-sm font-bold transition-colors"
          style={{
            background: active === tab ? ADMIN_COLORS.purple : ADMIN_COLORS.slate,
            color: active === tab ? ADMIN_COLORS.white : ADMIN_COLORS.textMid,
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
      style={{ background: ADMIN_COLORS.amberPale, color: ADMIN_COLORS.amberD }}
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
    success: { bg: ADMIN_COLORS.greenPale, color: ADMIN_COLORS.greenD },
    warning: { bg: ADMIN_COLORS.amberPale, color: ADMIN_COLORS.amberD },
    danger: { bg: "#FEE2E2", color: "#B91C1C" },
    neutral: { bg: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid },
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
