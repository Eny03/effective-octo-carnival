import sys
sys.path.append('backend')
from app.database import SessionLocal
from app.models import PoliticalProposal
from difflib import SequenceMatcher

db = SessionLocal()
props = db.query(PoliticalProposal).all()
print(f"Total proposals: {len(props)}")

# 1. Check exact or near duplicate titles across different parties
print("\n--- Checking Cross-Party Duplicates (Overlap > 70%) ---")
for i, p1 in enumerate(props):
    for p2 in props[i+1:]:
        if p1.partito != p2.partito:
            ratio = SequenceMatcher(None, p1.dichiarazione_sintesi.lower(), p2.dichiarazione_sintesi.lower()).ratio()
            if ratio > 0.70:
                print(f"DUPLICATE RATIO {ratio:.2f}:")
                print(f"  [{p1.id}] {p1.partito} ({p1.macro_argomento}): {p1.dichiarazione_sintesi}")
                print(f"  [{p2.id}] {p2.partito} ({p2.macro_argomento}): {p2.dichiarazione_sintesi}")

# 2. Check duplicate proposals for the SAME party
print("\n--- Checking Intra-Party Duplicates (Same Party & Topic, Overlap > 60%) ---")
for i, p1 in enumerate(props):
    for p2 in props[i+1:]:
        if p1.partito == p2.partito and p1.macro_argomento == p2.macro_argomento:
            ratio = SequenceMatcher(None, p1.dichiarazione_sintesi.lower(), p2.dichiarazione_sintesi.lower()).ratio()
            if ratio > 0.60:
                print(f"INTRA-PARTY DUPLICATE RATIO {ratio:.2f}:")
                print(f"  [{p1.id}] {p1.partito} ({p1.macro_argomento}): {p1.dichiarazione_sintesi}")
                print(f"  [{p2.id}] {p2.partito} ({p2.macro_argomento}): {p2.dichiarazione_sintesi}")

# 3. Check for press artifacts, quotes, or weird punctuation
print("\n--- Checking for Press Artifacts & Weird Phrasing ---")
SUSPECT_PATTERNS = [
    'dichiarazione di', 'secondo quanto', 'ha affermato', 'ha dichiarato',
    'ha spiegato', 'ha detto', 'punto di vista', 'nel corso di',
    'quotidiano', 'notizie', 'notizia', 'giornale', 'ansa', 'adnkronos',
    'tg', 'diretta', 'puntata', 'video', 'foto', 'clicca', 'scopri',
    'bonus', 'guida', 'esempi'
]
for p in props:
    low = p.dichiarazione_sintesi.lower()
    for pat in SUSPECT_PATTERNS:
        if pat in low:
            print(f"SUSPECT ARTIFACT ({pat}): [{p.id}] {p.partito} ({p.macro_argomento}): {p.dichiarazione_sintesi}")
            break

db.close()
