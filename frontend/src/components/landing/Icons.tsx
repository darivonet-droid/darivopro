// Iconos inline de la landing pública — set propio, no depende del design-system
// de Fable5/Admin/Empresa (LANDING-PAGE-DARIVO-PRO.md §1: "no comparte diseño").

function Svg({ children }: { children: React.ReactNode }) {
  // Todos los usos van junto a un texto visible (label, título) — son
  // decorativos, así que se ocultan de lectores de pantalla para no
  // duplicar el anuncio del mismo contenido dos veces.
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
      aria-hidden="true"
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

export function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

export function IconChatBubble() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  );
}

export function IconBuilding() {
  return (
    <Svg>
      <rect x="4" y="3" width="10" height="18" rx="1" />
      <rect x="16" y="9" width="5" height="12" rx="1" />
      <line x1="7" y1="7" x2="7" y2="7.01" />
      <line x1="11" y1="7" x2="11" y2="7.01" />
      <line x1="7" y1="11" x2="7" y2="11.01" />
      <line x1="11" y1="11" x2="11" y2="11.01" />
      <line x1="7" y1="15" x2="7" y2="15.01" />
      <line x1="11" y1="15" x2="11" y2="15.01" />
    </Svg>
  );
}

export function IconSmartphone() {
  return (
    <Svg>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </Svg>
  );
}

export function IconHandshake() {
  return (
    <Svg>
      <path d="M3 11l4.5-4.5a2 2 0 012.8 0l1.2 1.2" />
      <path d="M21 11l-4.5-4.5a2 2 0 00-2.8 0L12.5 7.7" />
      <path d="M7 13l3 3a1.8 1.8 0 002.5 0 1.8 1.8 0 000-2.5l-2.7-2.8" />
      <path d="M9.8 15.8l1 1a1.8 1.8 0 002.5 0 1.8 1.8 0 000-2.5" />
      <path d="M3 11l3 3M21 11l-3 3" />
    </Svg>
  );
}

export function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
