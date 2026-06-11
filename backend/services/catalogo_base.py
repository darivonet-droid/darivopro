# DARIVO PRO — Catálogo base de partidas de obra (precios referenciales PEN)
# Debe mantenerse en sincronía con frontend/src/lib/catalog.ts

CATALOGO_BASE: list[dict] = [
    {
        "id": "albanileria", "nombre": "Albañilería", "emoji": "🧱", "color": "#F59E0B",
        "partidas": [
            {"id": "alb-muro",          "nombre": "Muro de ladrillo",          "tipo": "m2",     "precio": 85.0,  "unidad": "m²"},
            {"id": "alb-tarrajeo",      "nombre": "Tarrajeo de paredes",       "tipo": "m2",     "precio": 35.0,  "unidad": "m²"},
            {"id": "alb-piso-ceramico", "nombre": "Piso cerámico instalado",   "tipo": "m2",     "precio": 55.0,  "unidad": "m²"},
            {"id": "alb-contrapiso",    "nombre": "Contrapiso",                "tipo": "m2",     "precio": 45.0,  "unidad": "m²"},
            {"id": "alb-demolicion",    "nombre": "Demolición de muro",        "tipo": "m2",     "precio": 30.0,  "unidad": "m²"},
        ],
    },
    {
        "id": "fontaneria", "nombre": "Fontanería", "emoji": "🚿", "color": "#0D9488",
        "partidas": [
            {"id": "fon-punto-agua",    "nombre": "Punto de agua",             "tipo": "unidad", "precio": 120.0, "unidad": "pto"},
            {"id": "fon-punto-desague", "nombre": "Punto de desagüe",          "tipo": "unidad", "precio": 140.0, "unidad": "pto"},
            {"id": "fon-inodoro",       "nombre": "Instalación de inodoro",    "tipo": "unidad", "precio": 150.0, "unidad": "und"},
            {"id": "fon-lavadero",      "nombre": "Instalación de lavadero",   "tipo": "unidad", "precio": 130.0, "unidad": "und"},
            {"id": "fon-ducha",         "nombre": "Instalación de ducha",      "tipo": "unidad", "precio": 180.0, "unidad": "und"},
            {"id": "fon-reparacion",    "nombre": "Reparación de fuga",        "tipo": "hora",   "precio": 60.0,  "unidad": "h"},
        ],
    },
    {
        "id": "electricidad", "nombre": "Electricidad", "emoji": "⚡", "color": "#D97706",
        "partidas": [
            {"id": "ele-punto-luz",     "nombre": "Punto de luz",              "tipo": "unidad", "precio": 90.0,  "unidad": "pto"},
            {"id": "ele-tomacorriente", "nombre": "Tomacorriente",             "tipo": "unidad", "precio": 75.0,  "unidad": "pto"},
            {"id": "ele-tablero",       "nombre": "Tablero eléctrico",         "tipo": "unidad", "precio": 350.0, "unidad": "und"},
            {"id": "ele-cableado",      "nombre": "Cableado",                  "tipo": "m2",     "precio": 25.0,  "unidad": "m²"},
            {"id": "ele-luminaria",     "nombre": "Instalación de luminaria",  "tipo": "unidad", "precio": 45.0,  "unidad": "und"},
        ],
    },
    {
        "id": "pintura", "nombre": "Pintura", "emoji": "🎨", "color": "#2563EB",
        "partidas": [
            {"id": "pin-interior",      "nombre": "Pintura interior (2 manos)","tipo": "m2",     "precio": 18.0,  "unidad": "m²"},
            {"id": "pin-exterior",      "nombre": "Pintura exterior",          "tipo": "m2",     "precio": 22.0,  "unidad": "m²"},
            {"id": "pin-empaste",       "nombre": "Empaste de paredes",        "tipo": "m2",     "precio": 15.0,  "unidad": "m²"},
            {"id": "pin-puerta",        "nombre": "Pintado de puerta",         "tipo": "unidad", "precio": 80.0,  "unidad": "und"},
        ],
    },
    {
        "id": "carpinteria", "nombre": "Carpintería", "emoji": "🪚", "color": "#92400E",
        "partidas": [
            {"id": "car-puerta",        "nombre": "Puerta contraplacada instalada", "tipo": "unidad", "precio": 380.0, "unidad": "und"},
            {"id": "car-closet",        "nombre": "Closet de melamina",        "tipo": "m2",     "precio": 320.0, "unidad": "m²"},
            {"id": "car-zocalo",        "nombre": "Zócalo / contrazócalo",     "tipo": "m2",     "precio": 12.0,  "unidad": "ml"},
            {"id": "car-reparacion",    "nombre": "Reparación de carpintería", "tipo": "hora",   "precio": 70.0,  "unidad": "h"},
        ],
    },
    {
        "id": "climatizacion", "nombre": "Climatización", "emoji": "❄️", "color": "#7C3AED",
        "partidas": [
            {"id": "cli-split",         "nombre": "Instalación A/C split",     "tipo": "unidad", "precio": 450.0, "unidad": "und"},
            {"id": "cli-mantenimiento", "nombre": "Mantenimiento A/C",         "tipo": "unidad", "precio": 120.0, "unidad": "und"},
            {"id": "cli-ducto",         "nombre": "Ductería",                  "tipo": "m2",     "precio": 95.0,  "unidad": "ml"},
            {"id": "cli-extractor",     "nombre": "Extractor de aire",         "tipo": "unidad", "precio": 160.0, "unidad": "und"},
        ],
    },
]
