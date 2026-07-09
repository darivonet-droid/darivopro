# DARIVO PRO — Tests básicos de la API
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health() -> None:
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok", "service": "darivo-pro-api"}


def test_endpoints_requieren_auth() -> None:
    for path in ("/api/v1/cotizaciones", "/api/v1/facturas", "/api/v1/clientes", "/api/v1/catalogo"):
        res = client.get(path)
        assert res.status_code == 422  # falta header Authorization


def test_whatsapp_requiere_service_key() -> None:
    res = client.post(
        "/api/v1/whatsapp/enviar",
        json={"to": "51999999999", "message": "hola"},
        headers={"X-Service-Key": "clave-incorrecta"},
    )
    assert res.status_code == 403
