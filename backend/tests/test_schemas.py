# DARIVO PRO — Tests de schemas Pydantic
import pytest
from pydantic import ValidationError

from models.schemas import EmpresaData, PresupuestoIn


def test_ruc_valido() -> None:
    empresa = EmpresaData(razonSocial="Constructora SAC", ruc="20123456789", direccion="Av. Lima 123")
    assert empresa.ruc == "20123456789"


def test_ruc_invalido() -> None:
    with pytest.raises(ValidationError):
        EmpresaData(razonSocial="X", ruc="123", direccion="Y")


def test_margen_fuera_de_rango() -> None:
    with pytest.raises(ValidationError):
        PresupuestoIn(
            clientName="Juan",
            items=[],
            margin=500,
            totalBase=0,
            totalLabor=0,
            totalFinal=0,
        )
