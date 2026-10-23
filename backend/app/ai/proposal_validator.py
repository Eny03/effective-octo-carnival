import re
from typing import Optional

DISALLOWED_ENDINGS = (
    '...', '..', '…', ' -', ' --', ':', ';', ',', 
    ' lo', ' la', ' il', ' le', ' i', ' gli', ' un', ' uno', ' una', 
    ' pr', ' di', ' a', ' da', ' in', ' con', ' su', ' per', ' tra', ' fra', 
    ' del', ' dello', ' della', ' dei', ' degli', ' delle', 
    ' ed', ' ad', ' e', ' o', ' ma', ' se', ' che', 
    ' al', ' allo', ' alla', ' ai', ' agli', ' alle', 
    ' dal', ' dallo', ' dalla', ' dai', ' dagli', ' dalle', 
    ' nel', ' nello', ' nella', ' nei', ' negli', ' nelle', 
    ' sul', ' sullo', ' sulla', ' sui', ' sugli', ' sulle'
)

ALLOWED_UPPERCASE_ACRONYMS = {
    "UE", "PIL", "SSN", "SMR", "DDL", "CSM", "LEP", "UPB", "IVA", "TFR", 
    "PA", "FSN", "MEF", "CIPE", "CIPESS", "INPS", "ISTAT", "AI", "CER"
}

JOURNALISTIC_CLICKBAIT_PATTERNS = [
    r"^perch[ée]\s+",
    r"^guida,?\s+esempi",
    r"^come funziona\b",
    r"^a chi spetta\b",
    r"^bonus e detrazioni\b",
    r"^\s*-\s*[a-zA-Z]",
    r"^uscita a \d+ anni con \d+ di contributi",
    r"^il programma di\b",
    r"^interrogazione al governo",
    r"^[«\"']?sanit[àa],?\s+\w+:\s*interrogazione",
    r"^[«\"']?fondo nazionale con contributo",
    r"^[«\"']?fisco:\s*presentata in cassazione"
]

def sanitize_and_validate_proposal_statement(text: Optional[str]) -> Optional[str]:
    """
    Rigorously validates and cleans a political proposal statement.
    Returns the clean, complete statement, or None if the statement is incomplete,
    truncated, or non-policy journalistic noise.
    """
    if not text:
        return None

    cleaned = text.strip()
    
    # 1. Fix stuck quotation marks without space (e.g. '"30%"epartiranno' -> '"30%" e partiranno')
    # Note: Do NOT space single apostrophe (') which is normal Italian elision (l'ora, d'attesa, etc.)
    cleaned = re.sub(r'([”"»])([a-zA-ZÀ-ÿ])', r'\1 \2', cleaned)
    cleaned = re.sub(r'([a-zA-ZÀ-ÿ])([“"«])', r'\1 \2', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    # 2. Check minimum length for a complete policy proposal
    if len(cleaned) < 35:
        return None

    # 3. Discard if contains ellipsis or suspension dots
    if '...' in cleaned or '…' in cleaned or '..' in cleaned:
        return None

    # 4. Discard if ends with dangling prepositions, articles, conjunctions or punctuation
    cleaned_lower = cleaned.lower()
    for ending in DISALLOWED_ENDINGS:
        if cleaned_lower.endswith(ending):
            return None

    # 5. Discard if ends with cut-off word or dangling single/double letters
    if re.search(r'\s[a-zA-Z]{1,2}$', cleaned):
        last_word = cleaned.split()[-1].strip(".,;:?!'\"")
        if not (last_word.isupper() and last_word in ALLOWED_UPPERCASE_ACRONYMS):
            return None

    # 6. Discard journalistic clickbait or article headlines
    for pat in JOURNALISTIC_CLICKBAIT_PATTERNS:
        if re.search(pat, cleaned, re.IGNORECASE):
            return None

    # 7. Discard if ends with colon, semicolon, comma or dash
    if cleaned.endswith((':', ';', ',', '-', '–', '—', '/', '\\')):
        return None

    return cleaned
