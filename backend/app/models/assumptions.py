"""Skema input simulasi APBN Turnkey (Pydantic)."""
from typing import List

from pydantic import BaseModel, Field


class Tahap(BaseModel):
    nama: str = "Tahap 1"
    capex: float = Field(0, ge=0, description="CAPEX dalam Rupiah penuh")
    tahun_mulai_konstruksi: int = Field(2027, ge=2020, le=2060)
    durasi_konstruksi: int = Field(3, ge=1, le=15)
    aktif: bool = True


class Assumptions(BaseModel):
    cost_of_debt: float = Field(0.06, ge=0, le=0.5, description="desimal, mis. 0.06")
    opex_rate: float = Field(0.01, ge=0, le=0.2, description="% CAPEX per tahun, desimal")
    tenor: int = Field(20, ge=1, le=50)
    masa_operasi: int = Field(30, ge=1, le=80)
    tahun_mulai: int = Field(2026, ge=2020, le=2060)
    tahapan: List[Tahap] = []
