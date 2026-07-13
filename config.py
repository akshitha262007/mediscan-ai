"""
config.py — MediScan AI application configuration.
Reads from environment variables in production; falls back to dev defaults locally.
"""

import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    # ── Security ─────────────────────────────────────────────────────────────
    # Set SECRET_KEY as an environment variable in production — NEVER commit a
    # real key here.
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-only-secret-change-in-prod-abc123')

    # ── Session & Remember-me ─────────────────────────────────────────────────
    # Keep "Remember me" sessions alive for 30 days
    from datetime import timedelta
    REMEMBER_COOKIE_DURATION  = timedelta(days=30)
    REMEMBER_COOKIE_HTTPONLY  = True
    REMEMBER_COOKIE_SAMESITE  = 'Lax'
    SESSION_COOKIE_SAMESITE   = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)   # regular session = 7 days

    # ── Database ──────────────────────────────────────────────────────────────
    # Railway / Render inject DATABASE_URL for Postgres.
    # Falls back to local SQLite for development.
    _db_url = os.environ.get('DATABASE_URL', '')
    if _db_url.startswith('postgres://'):          # SQLAlchemy requires postgresql://
        _db_url = _db_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = _db_url or (
        'sqlite:///' + os.path.join(BASE_DIR, 'database', 'mediscan.db')
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ── File storage ──────────────────────────────────────────────────────────
    UPLOAD_FOLDER  = os.path.join(BASE_DIR, '_uploads')
    REPORTS_FOLDER = os.path.join(BASE_DIR, 'reports')
    ELA_FOLDER     = os.path.join(BASE_DIR, 'static', 'ela_outputs')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024          # 16 MB

    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'pdf'}

    # ── Tesseract ─────────────────────────────────────────────────────────────
    # On the deployment server Tesseract is installed via the nixpacks/apt config
    # and lives on PATH — no hardcoded Windows path needed.
    TESSERACT_PATH = os.environ.get(
        'TESSERACT_PATH',
        r'C:\Program Files\Tesseract-OCR\tesseract.exe'   # local Windows fallback
    )
