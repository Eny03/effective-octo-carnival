import sys
import os
sys.path.insert(0, os.path.abspath("."))

from app.database import SessionLocal
from app.models import PoliticalProposal
from difflib import SequenceMatcher
from collections import defaultdict

db = SessionLocal()
proposals = db.query(PoliticalProposal).order_by(PoliticalProposal.id).all()
print(f"Initial proposals in DB: {len(proposals)}")

by_group = defaultdict(list)
for p in proposals:
    by_group[(p.partito.strip().lower(), p.macro_argomento.strip().lower())].append(p)

to_delete_ids = set()

for (party, topic), props in by_group.items():
    if len(props) < 2:
        continue
    for i in range(len(props)):
        p1 = props[i]
        if p1.id in to_delete_ids:
            continue
        for j in range(i + 1, len(props)):
            p2 = props[j]
            if p2.id in to_delete_ids:
                continue

            r = SequenceMatcher(None, p1.dichiarazione_sintesi.lower(), p2.dichiarazione_sintesi.lower()).ratio()
            w1 = set(p1.dichiarazione_sintesi.lower().replace(",", " ").replace(".", " ").replace(":", " ").split())
            w2 = set(p2.dichiarazione_sintesi.lower().replace(",", " ").replace(".", " ").replace(":", " ").split())
            # ignore trivial stopwords
            stopwords = {"e", "il", "la", "i", "gli", "le", "di", "a", "da", "in", "con", "su", "per", "tra", "fra", "del", "della", "dei", "delle", "un", "una", "uno", "al", "alla", "ai", "alle"}
            w1 = {w for w in w1 if w not in stopwords and len(w) > 2}
            w2 = {w for w in w2 if w not in stopwords and len(w) > 2}
            
            overlap = len(w1 & w2) / max(len(w1), len(w2)) if max(len(w1), len(w2)) > 0 else 0

            # Check if one is a duplicate of the other
            if r > 0.45 or overlap > 0.40:
                # Prefer the more descriptive or formal one
                # If one has "proposta di legge" or longer text, keep that one
                if len(p1.dichiarazione_sintesi) >= len(p2.dichiarazione_sintesi):
                    kept = p1
                    dropped = p2
                else:
                    kept = p2
                    dropped = p1

                to_delete_ids.add(dropped.id)
                print(f"DUPLICATE DETECTED [{party}] [{topic}] (ratio: {r:.2f}, overlap: {overlap:.2f}):")
                print(f"  KEEP:   ID {kept.id}: {kept.dichiarazione_sintesi[:80]}")
                print(f"  DELETE: ID {dropped.id}: {dropped.dichiarazione_sintesi[:80]}")

print(f"\nTotal proposals to delete: {len(to_delete_ids)}")
db.close()
