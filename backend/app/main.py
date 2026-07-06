from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import export, simulate

app = FastAPI(title="APBN Turnkey Simulator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # izinkan akses dari frontend mana pun (localhost & domain Vercel)
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulate.router, prefix="/api")
app.include_router(export.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok", "app": "APBN Turnkey Simulator"}
