import re
import hashlib
from typing import Tuple, List, Optional
from bs4 import BeautifulSoup
import httpx
from app.ingestion.sources_config import PARTY_ALIASES, MACRO_TOPICS_KEYWORDS

def clean_html(raw_html: str) -> str:
    """Removes scripts, styles, navigations, and extracts clean article text."""
    soup = BeautifulSoup(raw_html, "lxml")
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "svg"]):
        tag.decompose()
    
    # Try finding main article container
    article_tag = soup.find("article") or soup.find("main") or soup.find(class_=re.compile(r"article|content|post-body|entry-content", re.I))
    target = article_tag if article_tag else soup.body or soup
    
    text = target.get_text(separator=" ", strip=True)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def compute_content_hash(text: str) -> str:
    """Computes a SHA256 hash for deduplication."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def detect_entities(text: str) -> Tuple[List[str], List[str]]:
    """
    Detects which political parties and macro-topics are mentioned in the text.
    Returns: (matched_parties, matched_topics)
    """
    lower_text = text.lower()
    matched_parties = []
    matched_topics = []
    
    for party, aliases in PARTY_ALIASES.items():
        for alias in aliases:
            pattern = r"\b" + re.escape(alias) + r"\b"
            if re.search(pattern, lower_text):
                matched_parties.append(party)
                break

    for topic, keywords in MACRO_TOPICS_KEYWORDS.items():
        for kw in keywords:
            pattern = r"\b" + re.escape(kw) + r"\b"
            if re.search(pattern, lower_text):
                matched_topics.append(topic)
                break
                
    return matched_parties, matched_topics

async def fetch_article_text(url: str, timeout: float = 10.0) -> Optional[str]:
    """Asynchronously fetches the URL content and cleans it."""
    headers = {
        "User-Agent": "PolitiLens-Bot/1.0 (PolitiLens Open-Source Political Analyzer; neutral academic research)"
    }
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True, headers=headers) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                return clean_html(resp.text)
    except Exception as e:
        print(f"[TextExtractor] Error fetching {url}: {e}")
    return None
