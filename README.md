# DARIVO PRO 🏗️
> SaaS mobile-first para presupuestos y facturación de reformas — Perú / LATAM
> **Objetivo: presupuesto o factura en < 60 segundos**

## Stack
| Capa      | Tecnología                        | Deploy        |
|-----------|-----------------------------------|---------------|
| Frontend  | Next.js 14 + TypeScript           | **Vercel**    |
| Backend   | FastAPI (Python 3.11)             | **Railway**   |
| Base datos| PostgreSQL + Auth + Storage       | **Supabase**  |
| CI/CD     | GitHub Actions                    | **GitHub**    |
| WhatsApp  | Enlace `wa.me` (patrón aprobado — §6.3 AM) | Next.js Route Handler |
| PDF       | WeasyPrint + Jinja2               |               |

## Setup en 5 minutos

```bash
# 1. Clonar
git clone https://github.com/tu-org/darivo-pro.git
cd darivo-pro

# 2. Variables de entorno
cp frontend/.env.example frontend/.env.local   # frontend
cp backend/.env.example backend/.env            # backend
# Editar con tus keys de Supabase, etc.

# 3. Supabase — esquema oficial (32 tablas)
# Requiere Docker para entorno local
cp supabase/.env.example supabase/.env   # SUPABASE_ACCESS_TOKEN + SUPABASE_DB_PASSWORD
npx supabase start
npx supabase db reset   # baseline + seed.sql → esquema completo

# Remoto (proyecto vacío o tras reset en Dashboard)
npx supabase login
npx supabase link --project-ref vyrtokggypcmpforglch
npx supabase db push

# 4. Frontend
cd frontend
npm install
npm run dev   # → http://localhost:3000

# 5. Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Deploy producción

### Frontend → Vercel
```bash
# Conectar repo GitHub a Vercel (automático)
# Agregar variables de entorno en Vercel Dashboard:
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, BACKEND_URL, SERVICE_KEY
```

### Backend → Railway
1. Crear servicio en Railway con **Root Directory: `backend`**
2. Builder: **Dockerfile** (usa `backend/railway.toml`)
3. Variables en Railway Dashboard (mínimo para arrancar):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
   - `SERVICE_KEY` (legacy)
   - ~~`WA_PHONE_NUMBER_ID`, `WA_ACCESS_TOKEN`~~ — **no requeridos** (WhatsApp producto usa `wa.me` en frontend; ver §6.3 Arquitectura Maestra)
4. GitHub Secret: `RAILWAY_TOKEN` (Account → Tokens → crear token)
5. El servicio debe llamarse **`darivo-pro-api`** o cambiar el nombre en `.github/workflows/deploy.yml`

```bash
cd backend
railway login
railway link
railway up
```

> **Nota:** WhatsApp y PDF funcionan en Next.js (Vercel) con enlace `wa.me`. El backend FastAPI es **opcional/legacy**; el módulo `services/whatsapp/` (Meta Cloud API) está **deprecado** y excluido del producto oficial.

### Supabase
```bash
# Local (Docker)
npx supabase start
npx supabase db reset

# Remoto
npx supabase login
npx supabase link --project-ref vyrtokggypcmpforglch
npx supabase db push
```

En **CI (GitHub Actions)**, el job `supabase-migrate` ejecuta:
1. `supabase link --project-ref vyrtokggypcmpforglch`
2. `supabase db push`

Secrets requeridos en GitHub:
- `SUPABASE_ACCESS_TOKEN` — [Account Tokens](https://supabase.com/dashboard/account/tokens)
- `SUPABASE_DB_PASSWORD` — Project → Settings → Database

Project ref producción: `vyrtokggypcmpforglch`

## Estructura del proyecto
```
darivo-pro/
├── .cursor/rules/          # Reglas Cursor AI por capa + documentación oficial MD
│   ├── 01-darivo-pro-movil/
│   ├── 02-darivo-pro-admin/
│   ├── 03-darivo-pro-empresa/
│   ├── 05-darivo-pro-partner/
│   └── informes/           # Informes de implementación (Tarea 01+)
├── docs/                   # Prototipos de diseño (referencia; no producción)
├── .github/workflows/      # CI/CD — tests + deploy automático
├── frontend/               # Next.js 14 App Router + TypeScript
│   └── src/
│       ├── app/            # Rutas + Route Handlers (API)
│       ├── components/     # UI atoms + módulos (presupuesto, factura)
│       ├── hooks/          # usePresupuesto, useFactura, useClientes
│       ├── lib/            # theme.ts, utils.ts, supabase clients
│       ├── store/          # Zustand — estado global
│       └── types/          # Tipos TypeScript compartidos
├── backend/                # FastAPI Python
│   ├── api/v1/             # Endpoints REST (presupuestos, facturas, clientes, catálogo, pdf, whatsapp)
│   ├── core/               # Auth (JWT Supabase) + cliente Supabase service-role
│   ├── services/pdf/       # WeasyPrint PDF generator + plantillas Jinja2
│   ├── services/whatsapp/  # DEPRECATED — Meta Cloud API (excluido §6.3 AM; usar frontend wa.me)
│   ├── models/             # Pydantic schemas
│   ├── config/             # Settings (Pydantic Settings v2)
│   ├── tests/              # Pytest
│   └── Dockerfile          # Deploy Railway (incluye libs de WeasyPrint)
├── supabase/
│   ├── config.toml         # Config CLI (requerido para db push en CI)
│   ├── seed.sql            # Datos iniciales (productos, planes, catálogo)
│   └── migrations/         # Única fuente de verdad DDL
│       └── 20260705120000_baseline_v2.sql   # 32 tablas · baseline oficial
├── frontend/.env.example   # Template → copiar a frontend/.env.local
├── backend/.env.example    # Template → copiar a backend/.env
├── .env.example            # Índice de dónde va cada variable
└── README.md
```

## Secrets necesarios (GitHub → Settings → Secrets)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_SERVICE_KEY
SUPABASE_ACCESS_TOKEN
SUPABASE_DB_PASSWORD
SUPABASE_PROJECT_REF   # opcional; CI usa vyrtokggypcmpforglch
# WA_PHONE_NUMBER_ID, WA_ACCESS_TOKEN, WA_VERIFY_TOKEN — solo legacy backend (deprecado)
SERVICE_KEY
RAILWAY_TOKEN
```
