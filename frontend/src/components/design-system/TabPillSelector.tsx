import { T, RADII } from "@/lib/design-system/tokens";

interface TabPillSelectorProps<T extends string> {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}

/** Fable 5 §6.9 — Selector pill (Más, filtros) */
export function TabPillSelector<T extends string>({
  tabs,
  active,
  onChange,
}: TabPillSelectorProps<T>) {
  return (
    <div
      className="flex"
      style={{
        background: T.slateD,
        borderRadius: RADII.tabPill,
        padding: 4,
      }}
    >
      {tabs.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="flex-1 border-none py-2.5 text-[13px] transition-all"
            style={{
              borderRadius: 10,
              cursor: "pointer",
              background: isActive ? T.white : "transparent",
              color: isActive ? T.text : T.textMid,
              fontWeight: isActive ? 800 : 600,
              boxShadow: isActive ? "0 1px 5px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
