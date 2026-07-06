from fastapi import APIRouter, HTTPException

from app.calculators.turnkey import simulate
from app.models.assumptions import Assumptions

router = APIRouter()


@router.post("/simulate")
def run_simulation(assumptions: Assumptions):
    aktif = [t for t in assumptions.tahapan if t.aktif and t.capex > 0]
    if not aktif:
        raise HTTPException(
            status_code=422,
            detail="Aktifkan minimal satu tahap dengan nilai CAPEX lebih dari 0.",
        )
    return simulate(assumptions)
