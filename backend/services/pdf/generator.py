# DARIVO PRO — Generador de PDF con WeasyPrint
# ⚠️ LEGACY: La generación de PDF en producción ya NO usa este módulo.
#    Los PDFs se generan en Next.js (frontend/src/lib/pdf/) con @react-pdf/renderer
#    y Route Handlers en frontend/src/app/api/pdf/.
#    Se conserva por referencia de plantillas HTML y posible uso local.

from datetime import datetime

from jinja2 import Environment, FileSystemLoader

from config.settings import settings
from core.supabase_client import get_supabase

# Jinja2 para templates HTML
env = Environment(loader=FileSystemLoader(settings.PDF_TEMPLATE_DIR))

def _render_html(template_name: str, context: dict) -> str:
    template = env.get_template(template_name)
    return template.render(**context)

def _generar_pdf_bytes(html_content: str) -> bytes:
    """Convierte HTML → PDF con WeasyPrint"""
    # Import perezoso: WeasyPrint requiere librerías de sistema (pango/cairo)
    # que no hacen falta para arrancar la API ni para los tests.
    from weasyprint import CSS, HTML

    css = CSS(string="""
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; color: #1E293B; background: white; }
        @page { margin: 20mm 15mm; size: A4; }
    """)
    pdf_bytes = HTML(string=html_content).write_pdf(stylesheets=[css])
    return pdf_bytes

def _subir_a_storage(pdf_bytes: bytes, filename: str) -> str:
    """Sube PDF a Supabase Storage y retorna URL pública"""
    supabase = get_supabase()
    bucket = settings.STORAGE_BUCKET_PDF
    path   = f"pdfs/{filename}"

    supabase.storage.from_(bucket).upload(
        path=path,
        file=pdf_bytes,
        file_options={"content-type": "application/pdf"},
    )

    url = supabase.storage.from_(bucket).get_public_url(path)
    return url

async def generar_pdf_cotizacion(cotizacion: dict) -> str:
    """Genera PDF de cotizacion y retorna URL pública"""
    html = _render_html("cotizacion.html", {
        "cotizacion": cotizacion,
        "fecha_generacion": datetime.now().strftime("%d/%m/%Y"),
        "colores": {
            "navy": "#0A1628",
            "blue": "#2563EB",
            "green": "#10B981",
            "amber": "#F59E0B",
        }
    })

    pdf_bytes = _generar_pdf_bytes(html)
    filename  = f"cotizacion-{cotizacion['id']}-{datetime.now().strftime('%Y%m%d')}.pdf"
    url       = _subir_a_storage(pdf_bytes, filename)
    return url

async def generar_pdf_factura(factura: dict) -> str:
    """Genera PDF de factura (formato SUNAT-compatible) y retorna URL"""
    html = _render_html("factura.html", {
        "factura": factura,
        "fecha_generacion": datetime.now().strftime("%d/%m/%Y"),
    })

    inv_num   = str(factura.get("invNum") or factura.get("inv_num") or "SN")
    pdf_bytes = _generar_pdf_bytes(html)
    filename  = f"factura-{inv_num.replace('/','-')}-{datetime.now().strftime('%Y%m%d')}.pdf"
    url       = _subir_a_storage(pdf_bytes, filename)
    return url
