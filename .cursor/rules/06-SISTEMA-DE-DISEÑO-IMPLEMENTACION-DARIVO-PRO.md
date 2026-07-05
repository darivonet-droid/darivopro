# 06 – SISTEMA DE DISEÑO – IMPLEMENTACIÓN DARIVO PRO

**Versión:** 1.0

**Fecha:** 03/07/2026

**Estado:** Documento técnico oficial — capa de implementación

**Referencias:**

* `01-darivo-pro-movil/16-SISTEMA-DE-DISEÑO-FABLE5.md` v1.7 (Móvil)
* `03-darivo-pro-empresa/16-SISTEMA-DE-DISEÑO-EMPRESA.md` v2.5 (Empresa)
* `02-darivo-pro-admin/00-PANEL-ADMIN-DASHBOARD.md` (Admin layout)
* `docs/02-darivo-pro-movil/fable-5-diseño.jsx` (referencia JSX)

---

# 1. Objetivo

Documentar la **implementación del sistema de diseño** en el frontend Next.js: tokens, iconografía, componentes reutilizables y layouts por producto.

---

# 2. Arquitectura de archivos

```
frontend/src/lib/design-system/
  tokens.ts          — Paleta T, radii, sombras, gradientes, tipografía
  icons.tsx          — Objeto I oficial (Icon component)
  admin-tokens.ts    — Layout Panel Admin
  empresa-tokens.ts  — Layout Darivo Pro Empresa
  index.ts

frontend/src/components/design-system/
  DarkHeader.tsx     — §6.1
  BackBtn.tsx        — §6.2
  TabPillSelector.tsx— §6.9
  StepDots.tsx       — §2.4 wizard
  Toggle.tsx         — §6.9
  MobileShell.tsx    — §2.1 max 390px

frontend/src/lib/theme.ts — Re-export backward-compatible
frontend/src/components/ui/ — Button, Card, Pill, Toast, BottomNav (alineados Fable 5)
```

---

# 3. Darivo Pro Móvil (Fable 5)

## 3.1 Tokens

Objeto `T` idéntico a Fable 5 §3.1. Constantes adicionales:

| Constante | Valor | Uso |
|-----------|-------|-----|
| `MOBILE_MAX_WIDTH` | 390 | Contenedor `(auth)` |
| `WHATSAPP.icon` | `#25D366` | Botones WA |
| `CIERRE_ACCENT` | `#6D28D9` | Nav activa módulo Cierre |
| `GRADIENTS.ia` | morado | Botón central IA |

## 3.2 Iconografía

Componente `<Icon name="..." />` — inventario completo §5.1 (home, users, sparkle, receipt, etc.).

## 3.3 Componentes implementados

| Componente MD | Implementación | Estado |
|---------------|----------------|--------|
| DarkHeader §6.1 | `DarkHeader`, `PageHeader` | ✅ |
| BackBtn §6.2 | `BackBtn` | ✅ |
| Cards §6.3 | `Card` | ✅ |
| Botones §6.4 | `Button` (gradiente primario) | ✅ |
| Pill §6.5 | `Pill` (opacidad 18%) | ✅ |
| Toast §6.6 | `Toast` | ✅ |
| BottomNav §6.7 | `BottomNav` + indicador activo + iconos I | ✅ |
| Tab pill §6.9 | `TabPillSelector` (Más) | ✅ |
| Toggle §6.9 | `Toggle` | ✅ |
| StepDots §2.4 | `StepDots` | ✅ |

## 3.4 Layout Mobile First

* `MobileShell` en `(auth)/layout.tsx` — 390px centrado
* Rutas Admin/Empresa/Partner: **ancho completo** (root layout sin max-width)
* `globals.css`: animaciones `su`, `fi`, `pi`; tap highlight; overscroll-behavior

## 3.5 Tipografía

Inter vía `next/font/google` — pesos 400–900 (§4).

---

# 4. Darivo Pro Empresa

Tokens: `EMPRESA_LAYOUT` — sidebar 240px, fondo navy, contenido slate, acento Cierre `#6D28D9`.

Shell: `EmpresaShell.tsx` consume tokens.

Patrones visuales por módulo: documentados en MD Empresa §6 — implementación UI completa pendiente iteraciones post-scaffold (Tarea 05).

---

# 5. Darivo Pro Admin

Tokens: `ADMIN_LAYOUT` — sidebar 256px, referencia Dashboard §4.

Shell: `AdminShell.tsx` consume tokens.

Diseño por módulo: MD `02-darivo-pro-admin/` — UI funcional pendiente iteraciones.

---

# 6. Imágenes oficiales

Las imágenes de referencia viven en la documentación oficial (`.cursor/rules/` y assets del propietario).

**Regla:** no interpretar imágenes para inventar funcionalidad — prevalece el MD (§2 de cada módulo).

Copia en `frontend/public/design/` — pendiente despliegue de assets binarios al repositorio (deuda DT-06-01).

---

# 7. Deuda técnica

| ID | Descripción | Tarea |
|----|-------------|-------|
| DT-06-01 | Assets PNG oficiales en `/public/design/` | Propietario |
| DT-06-02 | FloatBar, PDFModal, InvoiceModal bottom-sheet | Iteración UI |
| DT-06-03 | StepDots integrado en wizard cotización (Selección → Cantidades → Resumen → Cliente — `05` v1.6) | Frontend |
| DT-06-04 | Toggle en CategoriasManager | Frontend |
| DT-06-05 | UI Admin/Empresa módulo a módulo | Post-06 |

---

# 8. Estado del documento

**Versión:** 1.0 · **Tarea 06 cerrada** (03/07/2026)

**Fin del documento.**
