from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import simulate

app = FastAPI(title="APBN Turnkey Simulator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # izinkan akses dari frontend mana pun (localhost & domain Vercel)
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulate.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok", "app": "APBN Turnkey Simulator"}
