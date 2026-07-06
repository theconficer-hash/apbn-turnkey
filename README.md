# 🏛️ Simulator APBN Turnkey

Aplikasi simulasi beban fiskal skema pendanaan **unbundling turnkey** untuk
infrastruktur perlindungan banjir. Backend FastAPI + frontend React (Vite),
dengan dua halaman: **Input Asumsi** dan **Hasil Simulasi**.

## Model Perhitungan

| Komponen         | Formula                                             |
|------------------|-----------------------------------------------------|
| Anuitas pinjaman | `CAPEX × r / (1 − (1+r)^−tenor)` per tahun          |
| OPEX tahunan     | `CAPEX × opex_rate`                                 |
| Beban per tahun  | Σ (anuitas + OPEX) semua tahap aktif                |

Cicilan & OPEX tiap tahap mulai setelah konstruksi tahap tersebut selesai.

## Struktur

```
apbn-turnkey/
├── api/index.py          # Entrypoint Vercel serverless (FastAPI)
├── vercel.json           # Konfigurasi deploy Vercel
├── requirements.txt      # Deps Python utk Vercel function
├── backend/
│   ├── run.py            # Dev server lokal (uvicorn :8000)
│   └── app/
│       ├── main.py
│       ├── models/assumptions.py
│       ├── calculators/turnkey.py
│       └── routers/simulate.py
└── frontend/             # React + Vite + Tailwind (:5173)
    └── src/
        ├── pages/AssumptionsPage.jsx
        ├── pages/ResultsPage.jsx
        └── store/useSimStore.js
```

## Menjalankan Lokal

```bash
# Backend (port 8000)
cd backend && pip install -r requirements.txt && python run.py

# Frontend (port 5173, proxy /api → :8000)
cd frontend && npm install && npm run dev
```

## Deploy (Vercel)

Satu proyek Vercel menyajikan build statis React di root dan FastAPI sebagai
Python serverless function di `/api` (lihat `vercel.json`, `framework: null`).
Push ke `main` = auto-redeploy.
