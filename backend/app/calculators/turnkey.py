"""Engine simulasi APBN Turnkey.

Logika per tahap (mengikuti model Simulasi Semarang, tanpa eskalasi):
  1. Anuitas pinjaman aktif pada [selesai_konstruksi, selesai_konstruksi + tenor)
  2. OPEX aktif pada [selesai_konstruksi, selesai_konstruksi + masa_operasi)
  3. Total beban per tahun = jumlah anuitas + OPEX semua tahap aktif
"""
from app.models.assumptions import Assumptions


def hitung_anuitas(pokok: float, rate: float, tenor: int) -> float:
    """Pembayaran tahunan tetap (anuitas) untuk pinjaman `pokok` selama `tenor` tahun."""
    if pokok <= 0 or tenor <= 0:
        return 0.0
    if rate == 0:
        return pokok / tenor
    return pokok * rate / (1 - (1 + rate) ** -tenor)


def simulate(a: Assumptions) -> dict:
    tahapan = [t for t in a.tahapan if t.aktif and t.capex > 0]

    # Horizon simulasi: sampai cicilan & operasi tahap terakhir selesai
    tahun_akhir = a.tahun_mulai
    for t in tahapan:
        selesai = t.tahun_mulai_konstruksi + t.durasi_konstruksi
        tahun_akhir = max(tahun_akhir, selesai + a.tenor, selesai + a.masa_operasi)
    years = list(range(a.tahun_mulai, tahun_akhir + 1))

    per_tahap = []
    total_anuitas = {y: 0.0 for y in years}
    total_opex = {y: 0.0 for y in years}

    for t in tahapan:
        selesai_k = t.tahun_mulai_konstruksi + t.durasi_konstruksi
        anuitas = hitung_anuitas(t.capex, a.cost_of_debt, a.tenor)
        opex = t.capex * a.opex_rate

        anuitas_per_tahun = {}
        opex_per_tahun = {}
        for y in years:
            av = anuitas if selesai_k <= y < selesai_k + a.tenor else 0.0
            ov = opex if selesai_k <= y < selesai_k + a.masa_operasi else 0.0
            if av:
                anuitas_per_tahun[y] = av
            if ov:
                opex_per_tahun[y] = ov
            total_anuitas[y] += av
            total_opex[y] += ov

        per_tahap.append({
            "nama": t.nama,
            "capex": t.capex,
            "anuitas_tahunan": anuitas,
            "opex_tahunan": opex,
            "total_beban_tahunan": anuitas + opex,
            "mulai_konstruksi": t.tahun_mulai_konstruksi,
            "selesai_konstruksi": selesai_k - 1,
            "cicilan_mulai": selesai_k,
            "cicilan_selesai": selesai_k + a.tenor - 1,
            "operasi_selesai": selesai_k + a.masa_operasi - 1,
            "total_cicilan": anuitas * a.tenor,
            "anuitas_per_tahun": anuitas_per_tahun,
            "opex_per_tahun": opex_per_tahun,
        })

    total_beban = {y: total_anuitas[y] + total_opex[y] for y in years}
    tahun_aktif = [y for y in years if total_beban[y] > 0]

    beban_puncak = max(total_beban.values()) if tahun_aktif else 0.0
    tahun_puncak = max(total_beban, key=total_beban.get) if tahun_aktif else None

    return {
        "years": years,
        "tahun_aktif": tahun_aktif,
        "per_tahap": per_tahap,
        "total_anuitas": total_anuitas,
        "total_opex": total_opex,
        "total_beban": total_beban,
        "metrics": {
            "total_capex": sum(t.capex for t in tahapan),
            "beban_puncak": beban_puncak,
            "tahun_puncak": tahun_puncak,
            "total_kumulatif": sum(total_beban.values()),
            "total_anuitas_kumulatif": sum(total_anuitas.values()),
            "total_opex_kumulatif": sum(total_opex.values()),
            "jumlah_tahap": len(tahapan),
        },
    }
