"""Entrypoint FastAPI untuk Vercel Python Serverless Function.

Vercel mendeteksi variabel `app` (ASGI) dan menyajikannya. Rute /api/* diarahkan
ke fungsi ini oleh vercel.json; FastAPI sudah memakai prefix /api.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend"))

from app.main import app  # noqa: E402,F401
