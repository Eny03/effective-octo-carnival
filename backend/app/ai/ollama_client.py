import json
from typing import Optional, Dict, Any, List
import httpx
from app.config import settings

class OllamaClient:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        
    async def is_available(self) -> bool:
        """Checks if local Ollama server is running and reachable."""
        try:
            async with httpx.AsyncClient(timeout=1.5) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    async def list_models(self) -> List[str]:
        """Returns list of installed local models in Ollama."""
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    return [m["name"] for m in data.get("models", [])]
        except Exception:
            pass
        return []

    async def generate_chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.1,
        format_json: bool = False
    ) -> Optional[str]:
        """
        Calls Ollama chat endpoint with specified messages.
        Supports structured JSON mode if format_json is True.
        """
        selected_model = model or settings.OLLAMA_EXTRACTION_MODEL
        payload: Dict[str, Any] = {
            "model": selected_model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }
        if format_json:
            payload["format"] = "json"

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(f"{self.base_url}/api/chat", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("message", {}).get("content", "")
                else:
                    print(f"[OllamaClient] HTTP error {res.status_code}: {res.text}")
        except Exception as e:
            print(f"[OllamaClient] Request failed: {e}")
        return None

    async def get_embedding(self, text: str, model: Optional[str] = None) -> Optional[List[float]]:
        """Calls Ollama embeddings endpoint."""
        embed_model = model or settings.OLLAMA_EMBED_MODEL
        payload = {
            "model": embed_model,
            "prompt": text
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(f"{self.base_url}/api/embeddings", json=payload)
                if res.status_code == 200:
                    return res.json().get("embedding")
        except Exception as e:
            print(f"[OllamaClient] Embedding failed: {e}")
        return None

ollama_client = OllamaClient()
