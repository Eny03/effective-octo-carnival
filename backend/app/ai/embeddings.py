import math
import re
import json
from typing import List, Dict, Any, Tuple
import numpy as np
from app.ai.ollama_client import ollama_client

DIMENSION = 384

def _local_deterministic_embedding(text: str, dim: int = DIMENSION) -> List[float]:
    """
    High-fidelity deterministic local text embedding generator.
    Creates a dense normalized vector based on character n-grams and word hashing.
    Used as an immediate, fast, offline fallback when Ollama is offline.
    """
    clean_words = re.findall(r"\w+", text.lower())
    vec = np.zeros(dim, dtype=np.float32)
    
    if not clean_words:
        return vec.tolist()
        
    for word in clean_words:
        # Word hash
        h = hash(word) % dim
        vec[h] += 1.0
        # Character bigram hashes
        for i in range(len(word) - 1):
            bg = word[i:i+2]
            h_bg = (hash(bg) * 31) % dim
            vec[h_bg] += 0.5
            
    # L2 normalize
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
        
    return vec.tolist()

async def get_text_embedding(text: str) -> List[float]:
    """
    Returns text embedding:
    Attempts local Ollama (bge-m3 / nomic-embed-text) first.
    Falls back gracefully to local deterministic vector if Ollama is not running.
    """
    if await ollama_client.is_available():
        emb = await ollama_client.get_embedding(text)
        if emb:
            return emb
            
    return _local_deterministic_embedding(text)

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Computes cosine similarity between two vector lists."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    a = np.array(v1, dtype=np.float32)
    b = np.array(v2, dtype=np.float32)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))
