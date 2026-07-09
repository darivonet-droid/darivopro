// Iconos inline de la landing pública — set propio, no depende del design-system
// de Fable5/Admin/Empresa (LANDING-PAGE-DARIVO-PRO.md §1: "no comparte diseño").

function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function IconList() {
  return (
    <Svg>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </Svg>
  );
}

export function IconSparkle() {
  return (
    <Svg>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    </Svg>
  );
}

export function IconWhatsapp() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm5.8 14.2c-.3.8-1.4 1.5-2.4 1.7-.6.1-1.4.2-4-.9-3.3-1.4-5.5-4.7-5.7-4.9-.2-.2-1.4-1.8-1.4-3.5s.9-2.5 1.2-2.8c.3-.3.6-.4.9-.4h.6c.2 0 .5 0 .7.6.3.7.9 2.4 1 2.6.1.2.1.4 0 .6-.1.2-.2.4-.4.6l-.5.6c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.2 2.4 1.5 2.7 1.7.3.2.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1.3.1 1.9.9 2.2 1.1.3.2.5.2.6.4.1.2.1.9-.2 1.7z" />
    </svg>
  );
}

export function IconMail() {
  return (
    <Svg>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6l-10 7L2 6" />
    </Svg>
  );
}

export function IconClock() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </Svg>
  );
}

export function IconCalculator() {
  return (
    <Svg>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="8.01" y2="11" />
      <line x1="12" y1="11" x2="12.01" y2="11" />
      <line x1="16" y1="11" x2="16.01" y2="11" />
      <line x1="8" y1="15" x2="8.01" y2="15" />
      <line x1="12" y1="15" x2="12.01" y2="15" />
      <line x1="16" y1="15" x2="16.01" y2="15" />
    </Svg>
  );
}

export function IconDocument() {
  return (
    <Svg>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
      <polyline points="14 3 14 8 19 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </Svg>
  );
}

export function IconSend() {
  return (
    <Svg>
      <line x1="21" y1="3" x2="10" y2="14" />
      <polygon points="21 3 14 21 10 14 3 10 21 3" />
    </Svg>
  );
}

export function IconShieldCloud() {
  return (
    <Svg>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    </Svg>
  );
}

export function IconHelmet() {
  return (
    <Svg>
      <path d="M4 15a8 8 0 0116 0v1H4v-1z" />
      <line x1="12" y1="4" x2="12" y2="7" />
      <line x1="2" y1="16" x2="22" y2="16" />
    </Svg>
  );
}

export function IconWrench() {
  return (
    <Svg>
      <path d="M14.7 6.3a4 4 0 10-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2-2 2.5-2.5z" />
    </Svg>
  );
}

export function IconRoller() {
  return (
    <Svg>
      <rect x="3" y="4" width="12" height="6" rx="1.5" />
      <line x1="9" y1="10" x2="9" y2="14" />
      <path d="M9 14a2.5 2.5 0 002.5 2.5c1.5 0 2-1 2-2s-.7-1.5-.7-2.5" />
      <line x1="9" y1="14" x2="9" y2="20" />
    </Svg>
  );
}

export function IconBolt() {
  return (
    <Svg>
      <polygon points="13 2 3 14 11 14 9 22 21 10 13 10 13 2" />
    </Svg>
  );
}

export function IconArrow() {
  return (
    <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
      <line x1="0" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="2" strokeDasharray="3 4" />
      <path d="M20 3l6 5-6 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
