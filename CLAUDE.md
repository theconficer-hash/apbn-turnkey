# APBN Turnkey Simulator
Aplikasi simulasi beban fiskal skema pendanaan unbundling turnkey.

## Tentang Aplikasi
- Backend: FastAPI Python di port 8000 (`cd backend && python run.py`)
- Frontend: React Vite di port 5173 (`cd frontend && npm run dev`), proxy /api → :8000
- Semua nilai moneter dalam Rupiah penuh (bukan juta/miliar)
- Model: anuitas pinjaman + OPEX per tahap, TANPA eskalasi CAPEX

## Alur Kalkulasi
1. calculators/turnkey.py — anuitas & OPEX per tahap, agregat per tahun, metrics
2. Router hanya memanggil kalkulator, tidak ada logika bisnis di router
3. Semua endpoint di prefix /api

## Deploy
- Vercel: static React (frontend/dist) + serverless FastAPI (api/index.py)
- vercel.json wajib "framework": null agar frontend statis tetap tersaji
- Push ke main = auto-redeploy
