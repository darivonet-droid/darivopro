# DARIVO PRO — FastAPI Backend
# python -m uvicorn main:app --reload --port 8000

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1 import cotizaciones, facturas, clientes, catalogo, pdf, whatsapp
from config.settings import settings

app = FastAPI(
    title="DARIVO PRO API",
    version="1.0.0",
    description="Backend para DARIVO PRO — SaaS de construcción Perú/LATAM",
)

# CORS — solo dominios permitidos
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(cotizaciones.router, prefix="/api/v1/cotizaciones", tags=["cotizaciones"])
app.include_router(facturas.router,     prefix="/api/v1/facturas",     tags=["facturas"])
app.include_router(clientes.router,     prefix="/api/v1/clientes",     tags=["clientes"])
app.include_router(catalogo.router,     prefix="/api/v1/catalogo",     tags=["catalogo"])
app.include_router(pdf.router,          prefix="/api/v1/pdf",          tags=["pdf"])
app.include_router(whatsapp.router,     prefix="/api/v1/whatsapp",     tags=["whatsapp"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "darivo-pro-api"}
