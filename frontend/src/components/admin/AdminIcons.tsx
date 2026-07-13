/** Iconos inline (stroke, sin dependencia externa) para KPIs y barra superior de Admin. */

type IconProps = { size?: number; color?: string };

function base(children: React.ReactNode, { size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function IconUsers(props: IconProps) {
  return base(
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>,
    props
  );
}

export function IconCreditCard(props: IconProps) {
  return base(
    <>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </>,
    props
  );
}

export function IconCash(props: IconProps) {
  return base(
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 9v.01M18 15v.01" />
    </>,
    props
  );
}

export function IconUserPlus(props: IconProps) {
  return base(
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="17" y1="11" x2="23" y2="11" />
    </>,
    props
  );
}

export function IconTicket(props: IconProps) {
  return base(
    <>
      <path d="M2 9a3 3 0 1 0 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 1 1 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v3z" />
      <line x1="13" y1="5" x2="13" y2="19" strokeDasharray="2 2" />
    </>,
    props
  );
}

export function IconSearch(props: IconProps) {
  return base(
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>,
    props
  );
}

export function IconBell(props: IconProps) {
  return base(
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </>,
    props
  );
}

export function IconHelp(props: IconProps) {
  return base(
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>,
    props
  );
}

export function IconCalendar(props: IconProps) {
  return base(
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>,
    props
  );
}

export function IconChevronDown(props: IconProps) {
  return base(<polyline points="6 9 12 15 18 9" />, props);
}
