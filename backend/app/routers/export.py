from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.calculators.turnkey import simulate
from app.exporters.excel import build_excel
from app.models.assumptions import Assumptions

router = APIRouter()


@router.post("/export")
def export_excel(assumptions: Assumptions):
    aktif = [t for t in assumptions.tahapan if t.aktif and t.capex > 0]
    if not aktif:
        raise HTTPException(
            status_code=422,
            detail="Aktifkan minimal satu tahap dengan nilai CAPEX lebih dari 0.",
        )
    hasil = simulate(assumptions)
    data = build_excel(hasil, assumptions.model_dump())
    return Response(
        content=data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="Simulasi_APBN_Turnkey.xlsx"'},
    )
