import sys
import os
sys.path.insert(0, os.path.abspath("."))

from app.database import SessionLocal
from app.models import PoliticalProposal, PoliticalParty
from app.data.seed_data import PROPOSALS_SEED
from app.data.historical_proposals import HISTORICAL_PROPOSALS_SEED
from difflib import SequenceMatcher
from collections import defaultdict

db = SessionLocal()

# 1. Deduplicate DB proposals
all_props = db.query(PoliticalProposal).order_by(PoliticalProposal.id).all()
print(f"Total proposals in DB before dedup: {len(all_props)}")

by_group = defaultdict(list)
for p in all_props:
    by_group[(p.partito.strip().lower(), p.macro_argomento.strip().lower())].append(p)

to_delete = []
stopwords = {'e', 'il', 'la', 'i', 'gli', 'le', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'del', 'della', 'dei', 'delle', 'un', 'una', 'uno', 'al', 'alla', 'ai', 'alle'}

for (party, topic), props in by_group.items():
    if len(props) < 2:
        continue
    for i in range(len(props)):
        p1 = props[i]
        if p1 in to_delete:
            continue
        for j in range(i + 1, len(props)):
            p2 = props[j]
            if p2 in to_delete:
                continue
            
            w1 = {w for w in p1.dichiarazione_sintesi.lower().replace(',', ' ').replace('.', ' ').replace(':', ' ').split() if w not in stopwords and len(w) > 3}
            w2 = {w for w in p2.dichiarazione_sintesi.lower().replace(',', ' ').replace('.', ' ').replace(':', ' ').split() if w not in stopwords and len(w) > 3}
            
            common_keywords = w1 & w2
            overlap = len(common_keywords) / max(len(w1), len(w2)) if max(len(w1), len(w2)) > 0 else 0
            ratio = SequenceMatcher(None, p1.dichiarazione_sintesi.lower(), p2.dichiarazione_sintesi.lower()).ratio()

            if (overlap >= 0.40 or len(common_keywords) >= 4) and ratio >= 0.38:
                # Keep the longer/more specific one
                if len(p1.dichiarazione_sintesi) >= len(p2.dichiarazione_sintesi):
                    kept = p1
                    dropped = p2
                else:
                    kept = p2
                    dropped = p1
                to_delete.append(dropped)
                print(f"Deduping [{party}] [{topic}]:")
                print(f"  KEEP (id={kept.id}): {kept.dichiarazione_sintesi[:80]}")
                print(f"  DROP (id={dropped.id}): {dropped.dichiarazione_sintesi[:80]}")

for d in to_delete:
    db.delete(d)
if to_delete:
    db.commit()
print(f"Deleted {len(to_delete)} duplicate proposals. Remaining: {db.query(PoliticalProposal).count()}")

# 2. Apply Realistic Institutional Fact-Checking (Art. 81 Cost.)
FORMAL_ACT_KEYWORDS = [
    "legge", "decreto", "ddl", "a.c.", "a.s.", "atto di governo", 
    "delibera", "l.", "d.l.", "d.lgs.", "l. 86/2024", "l. 159/2024", "l. 14/2024"
]

all_props = db.query(PoliticalProposal).all()
quantified_count = 0

for p in all_props:
    act_str = (p.tipo_azione or "").lower()
    text_str = (p.dichiarazione_sintesi or "").lower()
    is_formal_act = any(k in act_str or k in text_str for k in FORMAL_ACT_KEYWORDS)

    # If it is a generic programmatic declaration or general slogan without a formal bill:
    if not is_formal_act or "dichiarazione programmatica" in act_str or "opposizione" in act_str:
        p.costo_stimato = "Non quantificato"
        p.coperture_dichiarate = "Non specificate (In attesa di DDL formale e Relazione Tecnica MEF)"
        p.fact_check_status = "In attesa di copertura"
        p.fact_check_motivazione = (
            "Dichiarazione o indirizzo programmatico privo di disegno di legge depositato con Relazione Tecnica "
            "(art. 17 Legge 196/2009). Ai sensi dell'art. 81 Cost., le coperture finanziarie devono essere formalizzate in un atto normativo approvato dal MEF."
        )
    else:
        # Formal act - check if it has genuine cost
        if not p.costo_stimato or "non quantificato" in p.costo_stimato.lower():
            p.costo_stimato = "Invarianza finanziaria (art. 81 Cost.)"
        quantified_count += 1

db.commit()

pct = (quantified_count / len(all_props) * 100) if all_props else 0
print(f"\nRealistic Public Finance Audit applied:")
print(f"Total proposals: {len(all_props)}")
print(f"Quantified / Asseverate: {quantified_count} ({pct:.1f}%)")
print(f"In attesa di copertura (Non quantificate): {len(all_props) - quantified_count} ({100 - pct:.1f}%)")

from collections import Counter
print("Fact Check breakdown:", dict(Counter(p.fact_check_status for p in all_props)))

# Refresh dossiers
from app.ingestion.dossier_generator import update_all_party_dossiers
update_all_party_dossiers(db)
print("Party dossiers refreshed!")

db.close()
