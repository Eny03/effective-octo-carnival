import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "PolitiLens"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./politilens.db")
    
    # Local LLM / Ollama settings (100% open-source)
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_EXTRACTION_MODEL: str = os.getenv("OLLAMA_EXTRACTION_MODEL", "qwen2.5:14b")
    OLLAMA_CHAT_MODEL: str = os.getenv("OLLAMA_CHAT_MODEL", "qwen2.5:14b")
    OLLAMA_EMBED_MODEL: str = os.getenv("OLLAMA_EMBED_MODEL", "bge-m3")
    
    # Ingestion & Scheduler (Scansione e aggiornamento orario continuo)
    INGESTION_INTERVAL_MINUTES: int = int(os.getenv("INGESTION_INTERVAL_MINUTES", "60"))
    MAX_ARTICLES_PER_FEED: int = int(os.getenv("MAX_ARTICLES_PER_FEED", "10"))
    ENABLE_AUTO_SCHEDULER: bool = os.getenv("ENABLE_AUTO_SCHEDULER", "true").lower() == "true"
    
    # Benchmark Parameters (Italia / ISTAT / MEF / Eurostat 2024-2025)
    PIL_NOMINALE_MLD: float = 2120.0        # ~2.120 Mld €
    DEBITO_PUBBLICO_MLD: float = 2950.0     # ~2.950 Mld € (~139% PIL)
    ENTRATE_TRIBUTARIE_MLD: float = 585.0   # ~585 Mld €
    SPESA_SANITARIA_SSN_MLD: float = 136.5  # ~136.5 Mld € (~6.4% PIL)
    SPESA_ISTRUZIONE_MLD: float = 78.0      # ~78 Mld € (~3.7% PIL)
    SPESA_DIFESA_MLD: float = 32.0          # ~32 Mld € (~1.5% PIL)
    MANOVRA_BILANCIO_MEDIA_MLD: float = 30.0 # ~30 Mld € annuali manovra tipica

settings = Settings()
