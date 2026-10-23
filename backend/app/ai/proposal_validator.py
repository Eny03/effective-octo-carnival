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
    "PA", "FSN", "MEF", "CIPE", "CIPESS", "INPS", "ISTAT", "AI", "CER", "LSU", "LPU"
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

RHETORICAL_SLOGAN_PATTERNS = [
    r"^(?:restituire|dare)\s+diritti\s+a\s+chi\b",
    r"^(?:dare|vogliamo dare)\s+voce\s+a\b",
    r"^mettere\s+al\s+centro\b",
    r"^stare\s+vicino\s+a\b",
    r"^lottare\s+per\b",
    r"^combattere\s+per\b",
    r"^ascoltare\s+(?:i bisogni|la voce|il popolo)\b",
    r"^cambiare\s+passo\b",
    r"^dire\s+basta\s+a\b",
    r"^difendere\s+il\s+futuro\b",
    r"^nessuno\s+deve\s+rimanere\s+indietro\b",
    r"^un\s+nuovo\s+inizio\s+per\b",
    r"^la\s+nostra\s+priorit[àa]\s+(?:è|saranno)\s+i\s+cittadini\b",
    r"^governo\s+bocciato\b",
    r"^opposizione\s+senza\s+idee\b"
]

POLICY_DOMAIN_NOUNS = [
    # Lavoro & Previdenza
    r"\bpension", r"\bprevidenz", r"\bcontribut", r"\btfr\b", r"\bsalari", r"\bstipend",
    r"\bcuneo\b", r"\blsu\b", r"\blpu\b", r"\bcontratt", r"\blavorator", r"\bammortizzator",
    r"\blicenziament", r"\bcassa integrazione", r"\bprecari", r"\bassunzion", r"\btirocin",
    r"\bpmi\b", r"\bimpres", r"\bddl\b", r"\bdecreto\b", r"\blegge\b", r"\bdisegno di legge\b",
    r"\bemendament", r"\bmozione\b", r"\bordine del giorno\b", r"\borario di lavoro\b",
    r"\b32 ore\b", r"\bquota 41\b", r"\bopzione donna\b",
    # Fisco & Economia
    r"\birpef\b", r"\biva\b", r"\bires\b", r"\bimpost", r"\btass", r"\bdetrazion",
    r"\bdeduzion", r"\baliquot", r"\bno tax area\b", r"\bbonus\b", r"\bextraprofitt",
    r"\bevasion", r"\bconcordato\b", r"\bflat tax\b", r"\baccis", r"\bbilancio\b",
    r"\bdebito\b", r"\bpil\b", r"\bfondo\b", r"\bfinanziament", r"\bsovraindebitament",
    r"\bpignorament", r"\briscossion", r"\bspesa\b",
    # Sanità & Sociale
    r"\bsanit[àa]", r"\bssn\b", r"\bfsn\b", r"\bospedal", r"\bmedici\b", r"\binfermier",
    r"\bliste d'attesa", r"\bprestazioni sanitarie", r"\bfarmac", r"\brsa\b", r"\bdisabilit",
    r"\basili nido", r"\bconged", r"\bnatalit", r"\bassegno unico",
    # Istituzioni, Giustizia, Diritti
    r"\bgiustizia\b", r"\bmagistrat", r"\bcsm\b", r"\bcarcer", r"\bprocess", r"\bseparazione delle carriere",
    r"\bpremierato\b", r"\breferendum\b", r"\bautonomia\b", r"\blep\b", r"\bcostituzion",
    r"\bcittadinanz", r"\bius scholae\b", r"\bius soli\b", r"\bfine vita\b", r"\beutanasia\b",
    r"\bcannabis\b", r"\bimmigrazion", r"\bmigrant", r"\bfrontiere\b", r"\brimpatri\b", r"\bcpr\b",
    # Energia, Ambiente, Infrastrutture, Scuola, Esteri
    r"\brinnovabil", r"\bnucleare\b", r"\bsmr\b", r"\bemission", r"\bfotovoltaic", r"\beolic",
    r"\bidrogeologic", r"\brigenerazion", r"\btransizione\b", r"\brifiut", r"\bponte\b",
    r"\bferrovi", r"\btrasport", r"\bscuola\b", r"\buniversit", r"\bdocent", r"\bricerca\b",
    r"\bdifesa\b", r"\barmamenti\b", r"\barm[ie]\b", r"\bnato\b", r"\bue\b", r"\bunione europea\b"
]

def sanitize_and_validate_proposal_statement(text: Optional[str]) -> Optional[str]:
    """
    Rigorously validates and cleans a political proposal statement.
    Returns the clean, complete statement, or None if the statement is incomplete,
    truncated, a vague political slogan, or non-policy journalistic noise.
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

    # 7. Discard purely rhetorical or empty campaign slogans
    for pat in RHETORICAL_SLOGAN_PATTERNS:
        if re.search(pat, cleaned, re.IGNORECASE):
            return None

    # 8. Must contain at least ONE concrete public policy concept / domain noun
    has_policy_noun = any(re.search(pat, cleaned_lower) for pat in POLICY_DOMAIN_NOUNS)
    if not has_policy_noun:
        return None

    # 9. Discard if ends with colon, semicolon, comma or dash
    if cleaned.endswith((':', ';', ',', '-', '–', '—', '/', '\\')):
        return None

    return cleaned
