import Link from "next/link";
import { Icon } from "@/lib/design-system/icons";
import { T } from "@/lib/design-system/tokens";

interface BackBtnProps {
  href: string;
  label?: string;
}

/** Fable 5 §6.2 — BackBtn */
export function BackBtn({ href, label = "Volver" }: BackBtnProps) {
  return (
    <Link
      href={href}
      className="mb-2 inline-flex items-center gap-1.5"
      style={{ color: T.textLight, fontSize: 13, fontWeight: 600 }}
    >
      <Icon name="back" size={18} color={T.textLight} />
      {label}
    </Link>
  );
}
