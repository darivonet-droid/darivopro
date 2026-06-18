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
| WhatsApp  | Meta Cloud API                    |               |
| PDF       | WeasyPrint + Jinja2               |               |

## Setup en 5 minutos

```bash
# 1. Clonar
git clone https://github.com/tu-org/darivo-pro.git
cd darivo-pro

# 2. Variables de entorno
cp frontend/.env.example frontend/.env.local   # frontend
cp backend/.env.example backend/.env            # backend
# Editar con tus keys de Supabase, WhatsApp, etc.

# 3. Supabase — ejecutar migración
# Ir a supabase.com > SQL Editor > pegar supabase/migrations/001_initial.sql

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
```bash
npm install -g @railway/cli
railway login
railway init
railway up
# Agregar variables de entorno en Railway Dashboard
```

### Supabase
```bash
npx supabase login
npx supabase db push   # aplica migraciones
```

## Estructura del proyecto
```
darivo-pro/
├── .cursor/rules/          # Reglas Cursor AI por capa
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
│   ├── services/whatsapp/  # Meta Cloud API sender
│   ├── models/             # Pydantic schemas
│   ├── config/             # Settings (Pydantic Settings v2)
│   ├── tests/              # Pytest
│   └── Dockerfile          # Deploy Railway (incluye libs de WeasyPrint)
├── supabase/
│   └── migrations/         # SQL — tablas, RLS, triggers, storage
│       ├── 001_initial.sql # perfiles, presupuestos, items, facturas, partidas, precios
│       └── 002_clientes.sql# tabla clientes
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
WA_PHONE_NUMBER_ID
WA_ACCESS_TOKEN
WA_VERIFY_TOKEN
SERVICE_KEY
RAILWAY_TOKEN
```
