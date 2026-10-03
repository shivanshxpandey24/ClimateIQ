"""
AeroResilience Configuration
Pure Python config — supports .env reading without hard-coded secrets.
"""
import os
from pathlib import Path

# Load .env file if present in backend/ or root
env_paths = [
    Path(__file__).parent / ".env",
    Path(__file__).parent.parent / ".env",
    Path(__file__).parent.parent / "frontend" / ".env",
]

for p in env_paths:
    if p.exists():
        try:
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip('"').strip("'")
                        if k:
                            os.environ[k] = v
        except Exception:
            pass


class Settings:
    PROJECT_NAME: str = "AeroResilience API"
    VERSION: str = "1.0.0"
    DEMO_MODE: bool = True
    OPENAQ_API_KEY: str = ""
    OPENAQ_BASE_URL: str = "https://api.openaq.org/v3"
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    def __init__(self):
        self.DEMO_MODE = os.environ.get("DEMO_MODE", "true").lower() != "false"
        self.OPENAQ_API_KEY = os.environ.get("OPENAQ_API_KEY", "").strip()
        self.OPENAQ_BASE_URL = os.environ.get("OPENAQ_BASE_URL", "https://api.openaq.org/v3").strip()
        origins_env = os.environ.get("CORS_ORIGINS", "")
        if origins_env:
            self.CORS_ORIGINS = [o.strip() for o in origins_env.split(",")]


settings = Settings()
