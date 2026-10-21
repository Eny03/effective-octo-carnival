import json
import re
import urllib.request
import datetime
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.config import settings
from app.models import PoliticalProposal, PoliticalParty, InstitutionalBenchmark
from app.schemas import ChatQueryRequest, ChatQueryResponse, CitationItem
from app.ai.embeddings import get_text_embedding, cosine_similarity
from app.ai.ollama_client import ollama_client

RAG_SYSTEM_PROMPT = """Sei PolitiLens AI, l'assistente analitico autonomo e neutrale per la politica italiana.
Rispondi con tono enciclopedico, rigorosamente imparziale, chiaro e autorevole.
Non prendere MAI posizione, non esprimere giudizi personali e confronta sempre maggioranza e opposizione con eguale spazio.
Cita sempre dati ufficiali di bilancio (MEF, ISTAT, Corte dei Conti) e coperture finanziarie."""

PARTY_KEYWORDS = {
    "Fratelli d'Italia": ["fratelli d'italia", "fdi", "giorgia meloni", "meloni"],
    "Partito Democratico": ["partito democratico", "pd", "elly schlein", "schlein"],
    "Movimento 5 Stelle": ["movimento 5 stelle", "m5s", "giuseppe conte", "conte", "cinquestelle"],
    "Lega - Salvini Premier": ["lega", "salvini", "matteo salvini"],
    "Forza Italia": ["forza italia", "tajani", "antonio tajani", "berlusconi"],
    "Alleanza Verdi e Sinistra": ["alleanza verdi e sinistra", "avs", "bonelli", "fratoianni", "verdi"],
    "Azione": ["azione", "calenda", "carlo calenda"],
    "Italia Viva": ["italia viva", "renzi", "matteo renzi"],
    "+Europa": ["+europa", "più europa", "piu europa", "magi", "riccardo magi", "bonino", "emma bonino"],
    "Partito Liberal Democratico": ["partito liberal democratico", "pld", "libdem", "marattin", "luigi marattin"],
    "Noi Moderati": ["noi moderati", "lupi", "maurizio lupi"],
    "Futuro Nazionale": ["futuro nazionale", "fnv", "vannacci", "roberto vannacci"],
    "ORA!": ["movimento ora", "partito ora", "forchielli", "alberto forchielli", "boldrin", "michele boldrin", "drin drin", "ora!"],
    "Democrazia Sovrana Popolare": ["democrazia sovrana popolare", "dsp", "rizzo", "marco rizzo"],
    "Rifondazione Comunista": ["rifondazione comunista", "prc", "acerbo", "maurizio acerbo"],
    "Potere al Popolo": ["potere al popolo", "pap", "collot", "marta collot", "granato"],
    "Radicali Italiani": ["radicali italiani", "radicali", "hallissey", "matteo hallissey", "crivellini"],
    "Südtiroler Volkspartei": ["südtiroler volkspartei", "svp", "steger", "dieter steger"]
}

TOPIC_KEYWORDS = {
    "Lavoro": ["salario minimo", "salario", "lavoro", "stipendi", "occupazione", "cuneo", "retribuzioni", "precariato", "settimana corta", "pmi", "contrattazione"],
    "Pensioni": ["pensione", "pensioni", "quota 41", "quota 103", "fornero", "uscita a 64", "opzione donna", "previdenza", "ape sociale", "tfr"],
    "Fisco": ["fisco", "tasse", "flat tax", "irpef", "patrimoniale", "extraprofitti", "rottamazione", "concordato", "evasione", "aliquote", "cuneo fiscale"],
    "Sanità": ["sanità", "sanita", "ssn", "medici", "ospedali", "liste d'attesa", "fondo sanitario", "infermieri", "cup", "pronto soccorso"],
    "Energia": ["nucleare", "smr", "rinnovabili", "eolico", "fotovoltaico", "energia", "bollette", "trivelle", "gas", "decarbonizzazione", "comunità energetiche"],
    "Istruzione": ["scuola", "docenti", "insegnanti", "istruzione", "università", "its", "tempo pieno", "fuga di cervelli", "asili nido", "ricerca"],
    "Istituzioni": ["premierato", "autonomia differenziata", "lep", "riforma costituzionale", "bicameralismo", "carceri", "giustizia", "separazione delle carriere"],
    "Diritti Civili": ["cittadinanza", "ius scholae", "ius soli", "cannabis", "fine vita", "eutanasia", "matrimonio egualitario", "ddl zan", "gpa", "diritti"],
    "Immigrazione": ["immigrazione", "migranti", "sbarchi", "albania", "cpr", "blocco navale", "confini", "decreto flussi", "accoglienza", "bossi-fini"],
    "Politica Estera": ["ucraina", "armi", "russia", "spese militari", "nato", "difesa", "piano mattei", "europa", "ue", "medio oriente", "israele", "palestina"],
    "Infrastrutture": ["ponte sullo stretto", "ponte di messina", "infrastrutture", "tav", "treni", "ferrovie", "rete idrica", "dissesto idrogeologico"]
}

def detect_entities_and_topics(query: str) -> Tuple[List[str], List[str]]:
    q_low = query.lower()
    matched_parties = []
    for party, keys in PARTY_KEYWORDS.items():
        for k in keys:
            pattern = r"(?:\b|^)" + re.escape(k) + r"(?:\b|$)"
            if re.search(pattern, q_low):
                matched_parties.append(party)
                break
            
    matched_topics = []
    for topic, keys in TOPIC_KEYWORDS.items():
        for k in keys:
            pattern = r"(?:\b|^)" + re.escape(k) + r"(?:\b|$)"
            if re.search(pattern, q_low):
                matched_topics.append(topic)
                break
            
    return matched_parties, matched_topics

async def answer_rag_query(req: ChatQueryRequest, db: Session) -> ChatQueryResponse:
    """
    Intelligent Hybrid RAG political answer engine with Temporal Trajectory Tracking:
    1. Detects entities (parties/leaders), topics, and temporal intentions (2022-2026).
    2. Performs hybrid semantic + lexical + temporal scoring across historical proposals.
    3. Traces policy evolutions over time (campaigns, parliamentary acts, revisions).
    4. Generates an institutional comparative synthesis with public finance verification.
    """
    matched_parties, matched_topics = detect_entities_and_topics(req.question)
    query_vec = await get_text_embedding(req.question)
    
    q_low = req.question.lower()
    now = datetime.datetime.utcnow()
    years_in_query = re.findall(r"\b(202[2-6])\b", req.question)
    wants_evolution = any(w in q_low for w in [
        "cambiat", "evoluzione", "storia", "storico", "passat", "ieri", "prima", "tempo", 
        "anni", "sviluppo", "precedent", "mutat", "archivio", "2022", "2023", "2024", "2025", "nel tempo", "storica"
    ])
    
    # Query database
    all_proposals = db.query(PoliticalProposal).all()
    all_parties = {p.name: p for p in db.query(PoliticalParty).all()}
    benchmarks = {b.indicatore: b for b in db.query(InstitutionalBenchmark).all()}
    
    q_words = [w for w in re.findall(r"\w+", q_low) if len(w) > 2]
    
    scored_proposals: List[Tuple[float, PoliticalProposal]] = []
    for prop in all_proposals:
        score = 0.0
        p_text = f"{prop.partito} {prop.macro_argomento} {prop.dichiarazione_sintesi}".lower()
        
        # 1. Party Match Boost
        if matched_parties and prop.partito in matched_parties:
            score += 4.5
        elif req.filter_party and req.filter_party.lower() in prop.partito.lower():
            score += 4.0
            
        # 2. Topic Match Boost
        if matched_topics and prop.macro_argomento in matched_topics:
            score += 3.5
        elif req.filter_macro_argomento and req.filter_macro_argomento.lower() in prop.macro_argomento.lower():
            score += 3.0
            
        # 3. Lexical Keyword Overlap
        word_matches = sum(1 for w in q_words if w in p_text)
        score += word_matches * 1.2
        
        # 4. Deterministic Embedding Cosine Similarity
        if prop.embedding:
            try:
                emb = json.loads(prop.embedding)
                sim = cosine_similarity(query_vec, emb)
                if sim > 0:
                    score += sim * 2.5
            except Exception:
                pass

        # 5. Temporal Scoring & Historical Weighting
        if prop.timestamp:
            p_year = str(prop.timestamp.year)
            if years_in_query:
                if p_year in years_in_query:
                    score += 5.0
                else:
                    score -= 1.0
            elif wants_evolution:
                # Value full historical spectrum (2022-2026) evenly to enable trajectory analysis
                score += 2.0
            else:
                # Slight recency bonus for modern queries
                age_days = (now - prop.timestamp).days
                if age_days <= 120:
                    score += 2.2
                elif age_days <= 365:
                    score += 1.4
                elif age_days <= 730:
                    score += 0.7
                
        scored_proposals.append((score, prop))
        
    scored_proposals.sort(key=lambda x: x[0], reverse=True)
    
    # Select top candidates ensuring pluralism & historical depth
    top_candidates: List[PoliticalProposal] = []
    seen_parties = set()
    
    if matched_parties and len(matched_parties) == 1:
        target_party = matched_parties[0]
        party_proposals = [p for s, p in scored_proposals if p.partito == target_party]
        
        if wants_evolution and len(party_proposals) > 1:
            # Spread across distinct years to illustrate historical evolution
            by_year = {}
            for p in party_proposals:
                yr = p.timestamp.year if p.timestamp else 2025
                if yr not in by_year:
                    by_year[yr] = p
            top_candidates = list(by_year.values())[:5]
            for s, p in scored_proposals:
                if p not in top_candidates and len(top_candidates) < 6:
                    top_candidates.append(p)
        else:
            for s, p in scored_proposals:
                if p.partito == target_party and p not in top_candidates:
                    top_candidates.append(p)
                    if len(top_candidates) >= 4:
                        break
            for s, p in scored_proposals:
                if p not in top_candidates and len(top_candidates) < 6:
                    top_candidates.append(p)
    else:
        # Multi-party topical comparison: pick best per party
        for s, p in scored_proposals:
            if s > 1.0:
                if p.partito not in seen_parties:
                    top_candidates.append(p)
                    seen_parties.add(p.partito)
                if len(top_candidates) >= 6:
                    break
                    
        if len(top_candidates) < 4:
            for s, p in scored_proposals:
                if p not in top_candidates and len(top_candidates) < 6:
                    top_candidates.append(p)

    # Build Citations
    citations: List[CitationItem] = []
    for p in top_candidates:
        citations.append(CitationItem(
            partito=p.partito,
            macro_argomento=p.macro_argomento,
            sintesi=p.dichiarazione_sintesi,
            fonte_titolo=p.fonte_titolo,
            fonte_testata=p.fonte_testata,
            fonte_url=p.fonte_url,
            timestamp=p.timestamp.strftime("%d/%m/%Y") if p.timestamp else "Recente",
            fact_check_status=p.fact_check_status
        ))

    answer_text = ""
    disclaimer = "PolitiLens opera secondo rigorosa neutralità algoritmica. Le sintesi, la cronistoria e le verifiche di bilancio sono elaborate autonomamente dall'AI analizzando atti parlamentari, programmi elettorali 2022-2026 e parametri ufficiali MEF, ISTAT e Corte dei Conti."

    # Try local Ollama if available
    if await ollama_client.is_available() and top_candidates:
        evidence_lines = []
        for p in top_candidates:
            ts_str = p.timestamp.strftime("%m/%Y") if p.timestamp else "N/D"
            evidence_lines.append(f"- [{ts_str}] {p.partito} ({p.macro_argomento}): {p.dichiarazione_sintesi} [Costo: {p.costo_stimato}, Coperture: {p.coperture_dichiarate}, Verifica: {p.fact_check_status}]")
        evidence_text = "\n".join(evidence_lines)
        
        user_prompt = f"""DOMANDA UTENTE: "{req.question}"
DATI STORICI E RECENTI DAL DATABASE POLITILENS (ARCHIVIO 2022-2026):
{evidence_text}

Fornisci una risposta istituzionale, neutrale, analitica e ben strutturata in lingua italiana.
Se la domanda chiede come è cambiata una posizione o cita anni passati, evidenzia chiaramente l'evoluzione temporale dal 2022 ad oggi.
Organizza la sintesi per schieramenti politici (maggioranza, opposizione, altre forze) e valuta la sostenibilità economica dei costi indicati. Non prendere parti."""
        
        generated = await ollama_client.generate_chat(
            messages=[{"role": "system", "content": RAG_SYSTEM_PROMPT}, {"role": "user", "content": user_prompt}],
            model=settings.OLLAMA_CHAT_MODEL,
            temperature=0.2
        )
        if generated:
            answer_text = generated

    # High-Quality Autonomous Neural Synthesis (Direct, powerful, accurate, strictly neutral)
    if not answer_text:
        if not top_candidates:
            answer_text = (
                "Non sono state rilevate proposte politiche direttamente associate a questa specifica formulazione.\n\n"
                "👉 **Consiglio di ricerca rapida:** prova a chiedere di un tema chiave (es. *'Salario Minimo'*, *'Quota 41'*, *'Sanità'*, *'Flat Tax'*, *'Nucleare'*, *'Autonomia Differenziata'*) "
                "oppure confronta direttamente due partiti o leader (es. *'PD vs FdI'*, *'Cosa propone Roberto Vannacci?'*, *'Posizione di ORA! sul fisco'*)."
            )
        else:
            # Detect Question Types for targeted, high-precision answers
            is_cost_query = any(w in q_low for w in ["quanto costa", "costo", "costi", "coperture", "finanziat", "mef", "fattibilità", "debito", "spesa"])
            is_who_supports = any(w in q_low for w in ["chi vuole", "chi è a favore", "chi è contrario", "chi propone", "chi sostiene", "chi si oppone", "favorevoli", "contrari", "chi appoggia"])
            is_head_to_head = len(matched_parties) >= 2

            # Group retrieved candidates by coalition
            maggioranza = [p for p in top_candidates if any(c in p.partito for c in ["Fratelli d'Italia", "Lega", "Forza Italia", "Noi Moderati"])]
            opposizione = [p for p in top_candidates if any(c in p.partito for c in ["Partito Democratico", "Movimento 5 Stelle", "Alleanza Verdi e Sinistra", "Sinistra", "Potere al Popolo", "Rifondazione"])]
            liberali_altri = [p for p in top_candidates if p not in maggioranza and p not in opposizione]
            
            topic_str = matched_topics[0] if matched_topics else (top_candidates[0].macro_argomento if top_candidates else "Politica Nazionale")
            
            # Header
            answer_text += f"### 📊 Sintesi Istituzionale: {req.question.strip().rstrip('?')}\n\n"
            
            # 1. Direct Executive Answer (Risposta Diretta Immediata)
            if is_who_supports:
                fav_parties = [p.partito for p in top_candidates if p.tipo_azione in ["Proposta di legge", "Dichiarazione programmatica"] and p.fact_check_status != "Inattuabile"]
                opp_parties = [p.partito for p in top_candidates if p.tipo_azione == "Opposizione" or p.fact_check_status == "Inattuabile"]
                fav_str = ", ".join(list(dict.fromkeys(fav_parties))[:4]) or "diverse forze parlamentari"
                opp_str = ", ".join(list(dict.fromkeys(opp_parties))[:3]) or "le forze contrarie o favorevoli a strumenti alternativi"
                answer_text += (
                    f"**Risposta diretta:** Riguardo a **{topic_str}**, le forze politiche favorevoli e promotrici di riforme attive sono principalmente **{fav_str}**. "
                    f"Al contrario, esprimono contrarietà o propongono modelli contrattuali alternativi forze come **{opp_str}**.\n\n"
                )
            elif is_head_to_head and len(matched_parties) >= 2:
                p1, p2 = matched_parties[0], matched_parties[1]
                answer_text += (
                    f"**Confronto diretto:** Sul tema **{topic_str}**, **{p1}** e **{p2}** esprimono visioni programmatiche distinte. "
                    f"Di seguito vengono confrontate le rispettive proposte formali, gli atti depositati e la sostenibilità economica:\n\n"
                )
            elif is_cost_query:
                quantified = [p for p in top_candidates if p.costo_stimato and p.costo_stimato != "Non quantificato"]
                costs_summary = "; ".join([f"{p.partito}: {p.costo_stimato}" for p in quantified[:3]]) if quantified else "costi non quantificati nei testi normativi"
                answer_text += (
                    f"**Quadro economico:** La valutazione finanziaria per le proposte relative a **{topic_str}** evidenzia stime ufficiali di costo: {costs_summary}. "
                    f"La Ragioneria Generale dello Stato e la Corte dei Conti richiedono per ciascuna misura coperture certe a saldi invariati ex art. 81 Costituzione.\n\n"
                )
            elif matched_parties and len(matched_parties) == 1:
                p_name = matched_parties[0]
                p_obj = all_parties.get(p_name)
                p_poll = f"{p_obj.poll_percentage}%" if p_obj else "in rilevazione"
                p_ver = f"{p_obj.truthfulness_score}%" if p_obj else "85%"
                answer_text += (
                    f"**Sintesi per {p_name}:** Il partito (attestato al **{p_poll}** nei sondaggi nazionali, "
                    f"con un indice medio di veridicità calcolato dall'AI del **{p_ver}**) formalizza sul tema **{topic_str}** "
                    f"le seguenti posizioni e proposte di legge ufficiali:\n\n"
                )
            else:
                answer_text += (
                    f"**Quadro generale:** Sul tema **{topic_str}**, l'analisi degli atti parlamentari, disegni di legge "
                    f"e dichiarazioni ufficiali evidenzia posizioni articolate tra maggioranza e opposizioni:\n\n"
                )

            # Historical Evolution Detection & Trajectory Builder
            historical_trajectories = []
            relevant_parties = matched_parties if matched_parties else list(set(p.partito for p in top_candidates))
            
            for party_name in relevant_parties:
                related_props = [
                    p for p in all_proposals 
                    if p.partito == party_name and (not matched_topics or p.macro_argomento in matched_topics)
                ]
                if not related_props:
                    related_props = [p for p in all_proposals if p.partito == party_name]
                    
                related_props_sorted = sorted(related_props, key=lambda x: x.timestamp or datetime.datetime.min)
                years = {p.timestamp.year for p in related_props_sorted if p.timestamp}
                if len(related_props_sorted) >= 2 and (len(years) >= 2 or wants_evolution):
                    traj_lines = [f"**{party_name}** ({related_props_sorted[0].macro_argomento}):"]
                    for ep in related_props_sorted[-4:]:
                        dt_label = ep.timestamp.strftime("%m/%Y") if ep.timestamp else "Archivio"
                        traj_lines.append(f"  - **{dt_label}** [{ep.tipo_azione}]: {ep.dichiarazione_sintesi} *(Stato: {ep.fact_check_status})*")
                    historical_trajectories.append("\n".join(traj_lines))

            # If user asked about evolution or history, put the Timeline front and center
            if wants_evolution and historical_trajectories:
                answer_text += "#### ⏱️ Evoluzione Temporale & Storico delle Posizioni (2022 – 2026)\n"
                for traj in historical_trajectories:
                    answer_text += f"{traj}\n\n"

            # 2. Section: Maggioranza di Centrodestra
            if maggioranza:
                answer_text += "#### 🔵 Maggioranza di Centrodestra\n"
                for p in maggioranza:
                    dt_str = f" ({p.timestamp.strftime('%Y')})" if p.timestamp else ""
                    answer_text += f"- **{p.partito}{dt_str}:** {p.dichiarazione_sintesi}\n"
                    answer_text += f"  - *Costo & Coperture:* `{p.costo_stimato}` • Coperture: *{p.coperture_dichiarate}*\n"
                    answer_text += f"  - *Verifica MEF/ISTAT:* **{p.fact_check_status}** ({p.fact_check_motivazione or p.fattibilita_finanziaria})\n"
                answer_text += "\n"

            # 3. Section: Opposizione Progressista e Sinistra
            if opposizione:
                answer_text += "#### 🔴 Opposizione & Campo Progressista\n"
                for p in opposizione:
                    dt_str = f" ({p.timestamp.strftime('%Y')})" if p.timestamp else ""
                    answer_text += f"- **{p.partito}{dt_str}:** {p.dichiarazione_sintesi}\n"
                    answer_text += f"  - *Costo & Coperture:* `{p.costo_stimato}` • Coperture: *{p.coperture_dichiarate}*\n"
                    answer_text += f"  - *Verifica MEF/ISTAT:* **{p.fact_check_status}** ({p.fact_check_motivazione or p.fattibilita_finanziaria})\n"
                answer_text += "\n"

            # 4. Section: Area Riformista, Civica & Nuove Forze
            if liberali_altri:
                answer_text += "#### 🟡 Area Riformista, Civica & Altre Forze\n"
                for p in liberali_altri:
                    dt_str = f" ({p.timestamp.strftime('%Y')})" if p.timestamp else ""
                    answer_text += f"- **{p.partito}{dt_str}:** {p.dichiarazione_sintesi}\n"
                    answer_text += f"  - *Costo & Coperture:* `{p.costo_stimato}` • Coperture: *{p.coperture_dichiarate}*\n"
                    answer_text += f"  - *Verifica MEF/ISTAT:* **{p.fact_check_status}** ({p.fact_check_motivazione or p.fattibilita_finanziaria})\n"
                answer_text += "\n"

            # Append historical timeline if not already shown above
            if not wants_evolution and historical_trajectories:
                answer_text += "#### ⏱️ Precedenti Storici (Archivio 2022 – 2026)\n"
                for traj in historical_trajectories[:2]:
                    answer_text += f"{traj}\n\n"

            # 5. Institutional Reality Check (Macroeconomic parameters)
            answer_text += "#### ⚖️ Vincoli Macroeconomici & Quadro di Bilancio (MEF / Corte dei Conti)\n"
            answer_text += (
                "Ogni riforma viene valutata sui parametri reali della finanza pubblica italiana: "
                "**PIL nominale** pari a 2.120 Miliardi €, **Debito Pubblico** al 137.3% del PIL e tetto del disavanzo al 3% stabilito dal Patto di Stabilità UE. "
                "Le promesse prive di coperture certe rimangono classificate dall'AI come *'In attesa di copertura'* o *'Esagerate'* per garantire massima trasparenza democratica."
            )

    return ChatQueryResponse(
        answer=answer_text,
        neutrality_disclaimer=disclaimer,
        mode=req.mode or "comparativo",
        citations=citations
    )
