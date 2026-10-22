import sys
import os
sys.path.insert(0, os.path.abspath("."))

from app.database import SessionLocal
from app.models import PoliticalProposal, PoliticalParty
from collections import defaultdict
from difflib import SequenceMatcher

db = SessionLocal()
proposals = db.query(PoliticalProposal).all()
print(f"Total proposals in DB: {len(proposals)}")

by_party_topic = defaultdict(list)
for p in proposals:
    by_party_topic[(p.partito, p.macro_argomento)].append(p)

duplicates_found = []
for (party, topic), props in by_party_topic.items():
    if len(props) > 1:
        for i in range(len(props)):
            for j in range(i + 1, len(props)):
                p1 = props[i]
                p2 = props[j]
                ratio = SequenceMatcher(None, p1.dichiarazione_sintesi.lower(), p2.dichiarazione_sintesi.lower()).ratio()
                # Also check common keywords
                words1 = set(p1.dichiarazione_sintesi.lower().split())
                words2 = set(p2.dichiarazione_sintesi.lower().split())
                overlap = len(words1 & words2) / max(len(words1), len(words2))
                if ratio > 0.45 or overlap > 0.4:
                    duplicates_found.append((party, topic, p1, p2, ratio, overlap))

print(f"\nDuplicates / Near duplicates found: {len(duplicates_found)}")
for party, topic, p1, p2, ratio, overlap in duplicates_found:
    print(f"\n[{party}] [{topic}] (similarity: {ratio:.2f}, overlap: {overlap:.2f})")
    print(f"  ID {p1.id}: {p1.dichiarazione_sintesi}")
    print(f"  ID {p2.id}: {p2.dichiarazione_sintesi}")

# Also check how many proposals have "Non quantificato"
non_quant = db.query(PoliticalProposal).filter(
    (PoliticalProposal.costo_stimato == "Non quantificato") | 
    (PoliticalProposal.costo_stimato.ilike("%non quantificato%"))
).count()
print(f"\nProposals with 'Non quantificato': {non_quant} / {len(proposals)}")

# Status breakdown
from collections import Counter
status_counts = Counter(p.fact_check_status for p in proposals)
print(f"\nStatus breakdown: {dict(status_counts)}")

db.close()
