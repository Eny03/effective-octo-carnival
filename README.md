# ⚖️ PolitiLens — Analizzatore e Comparatore Politico Autonomo

> **Piattaforma autonoma, 100% open-source e a costo zero di licenze** per il monitoraggio in tempo reale, la schematizzazione neutrale e il fact-checking finanziario delle posizioni politiche italiane su macro-argomenti chiave.

---

## 🏛️ 1. Obiettivo e Principi Etici Fondamentali

1. **Neutralità Politica Assoluta:** L'algoritmo non esprime giudizi morali, favoritismi ideologici o condanne. Il tono è enciclopedico, comparativo e basato su evidenze formali.
2. **Architettura 100% Open-Source & Self-Hosted:** Nessuna dipendenza obbligatoria da API a pagamento (OpenAI, Anthropic). Utilizza modelli LLM locali tramite Ollama / vLLM (`qwen2.5:14b`, `llama3.3:70b`) e database open-source (`pgvector` / `SQLite`).
3. **Tracciabilità delle Fonti:** Ogni proposta, spesa o verifica rimanda con link ipertestuale alla fonte primaria (ANSA, Sole 24 Ore, Adnkronos, RaiNews, Gazzetta Ufficiale, ISTAT, atti parlamentari).
4. **Verifica Fake & Fattibilità Finanziaria:** Le proposte sono verificate secondo la logica scalare:
   - `Verificato`
   - `In attesa di copertura`
   - `Esagerato`
   - `Inattuabile` / `Fake / Infondato`
   - `Non verificabile`
   Ogni stima finanziaria è messa a confronto con i dati ufficiali di bilancio (PIL ~2.120 Mld, Debito/PIL 137.3%, Fondo Sanitario 136.5 Mld, media manovra ~30 Mld).

---

## 🛠️ 2. Architettura Tecnologica

```
                             [Fonti Primarie]
         (ANSA, Sole 24 Ore, Adnkronos, RaiNews, Atti Parlamentari)
                                     │
                                     ▼
                    ┌─────────────────────────────────┐
                    │  Ingestion & Scraper Engine     │
                    │  (feedparser, BeautifulSoup,     │
                    │   content deduplication SHA256) │
                    └────────────────┬────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────┐
                    │    AI Extraction & Schema 4.B   │
                    │  (Ollama: qwen2.5 / llama3.3    │
                    │   + Heuristic Fallback Engine)  │
                    └────────────────┬────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────┐
                    │ Institutional Fact-Check Engine │
                    │ (Cross-check ISTAT, UPB, MEF,   │
                    │  Corte dei Conti, Art. 81 Cost) │
                    └────────────────┬────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────┐
                    │    Database & Semantic Search   │
                    │  (PostgreSQL + pgvector /       │
                    │   SQLite Dense Embeddings)      │
                    └───────┬─────────────────┬───────┘
                            │                 │
            ┌───────────────┘                 └───────────────┐
            ▼                                                 ▼
┌──────────────────────┐                           ┌─────────────────────┐
│  Manifesto Dinamico  │                           │  PolitiLens AI Chat │
│  (Matrice 2D Temi vs │                           │  (RAG Comparativo   │
│   Partiti & Stances) │                           │   & Neutral Mode)   │
└───────────┬──────────┘                           └──────────┬──────────┘
            │                                                 │
            └───────────────────────┬─────────────────────────┘
                                    │
                                    ▼
                     ┌──────────────────────────────┐
                     │  Frontend Next.js App Router │
                     │  (Tailwind CSS, Lucide UI)   │
                     └──────────────────────────────┘
```

- **Backend:** Python 3.11+, FastAPI (REST API asincrone).
- **Database & Vettori:** PostgreSQL con estensione `pgvector` (supportato) e fallback incorporato per `SQLite` ad alta efficienza.
- **AI & LLM Locale:** Client asincrono compatibile Ollama con supporto a `qwen2.5:14b`, `llama3.3:70b`, `mistral-nemo` e modelli di embedding `bge-m3` o `nomic-embed-text`. Include un motore di fallback deterministico ad alta fedeltà che rende l'app funzionante al 100% anche offline!
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons.

---

## 📁 3. Moduli Funzionali Implementati

### A. Pipeline di Ingestion e Normalizzazione
- Monitoraggio automatico di feed RSS generalisti e istituzionali (ANSA Politica, Sole 24 Ore, Adnkronos, RaiNews).
- Pulizia HTML, estrazione del testo principale, deduzione dei partiti ed entità menzionate, calcolo hash SHA256 per deduplicazione.
- Scheduler continuo asincrono (`APScheduler`) a intervalli configurabili e scansione manuale su richiesta.
- **Strumento di Ingestion Diretta:** modulo per incollare qualsiasi URL o testo di comunicato stampa con estrazione istantanea dello schema JSON.

### B. Motore AI di Estrazione & Schematizzazione
Estrae da ogni documento il JSON strutturato rigoroso richiesto dalla Sezione 4.B del Mission Brief:
```json
{
  "partito": "Nome Partito",
  "macro_argomento": "Economia | Energia | Ambiente | Diritti Civili | Esteri | Lavoro | Sanità | Istruzione",
  "dichiarazione_sintesi": "Sintesi neutrale della proposta o presa di posizione",
  "tipo_azione": "Proposta di legge | Dichiarazione programmatica | Opposizione | Emendamento",
  "impatto_economico": {
    "costo_stimato": "Cifra in € o 'Non quantificato'",
    "coperture_dichiarate": "Da dove il partito intende prendere i fondi",
    "fattibilita_finanziaria": "Analisi oggettiva basata su vincoli di bilancio / PIL"
  },
  "fact_check": {
    "status": "Verificato | Non verificabile | Esagerato | Fake / Infondato | In attesa di copertura",
    "motivazione_oggettiva": "Perché è bollata come fake o inattuabile (dati ISTAT, Eurostat, Corte dei Conti)",
    "fonte_verifica": "Link o riferimento istituzionale"
  },
  "fonte_url": "URL dell'articolo/documento",
  "timestamp": "ISO 8601"
}
```

### C. Manifesto Dinamico (Comparatore Politico)
- **Matrice 2D completa:** visualizza l'intera griglia Macro-Argomento × Partito.
- **Modalità Testa a Testa:** seleziona due partiti (es. Fratelli d'Italia vs Partito Democratico) per confrontare le loro posizioni tema per tema, con badge di stance ("Favorevole/Riformista", "Contrario/Opposizione", "Focalizzato su Coperture").
- Filtri interattivi per Schieramento/Coalizione e ricerca testuale.

### D. Chatbot RAG Politicamente Neutrale ("PolitiLens AI")
- Motore RAG con ricerca semantica per embedding vettoriali.
- 3 modalità operative:
  1. `Comparativo`: Panoramica bilanciata delle posizioni di tutti i partiti.
  2. `Testa a Testa`: Confronto diretto tra due forze contrapposte.
  3. `Fact-Check`: Focus esclusivo su coperture, congruità finanziaria e vincoli di bilancio.
- Citazione automatica delle fonti con schede documentali e disclaimer di neutralità.

### E. Dashboard di Sintesi e Analisi
- Distribuzione tematica per partito e macro-argomento.
- Indice di Quantificazione Finanziaria (% di proposte con costi reali stimati vs "Non quantificato").
- Radar Macroeconomico con benchmark ufficiali ISTAT, MEF e Corte dei Conti.

---

## 🚀 4. Guida di Avvio Rapido

### Opzione 1: Avvio Locale Diretto (Consigliato per Sviluppo)

1. **Requisiti:** Python 3.11+, Node.js 18+.
2. **Installazione dipendenze Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```
3. **Installazione dipendenze Frontend:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```
4. **Avvio di PolitiLens con singolo comando:**
   ```bash
   python run_politilens.py
   # oppure su Windows:
   start.bat
   ```
5. Apri nel browser:
   - **Frontend Web App:** [http://localhost:3000](http://localhost:3000)
   - **Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Opzione 2: Avvio con Docker Compose (PostgreSQL + pgvector)

```bash
docker-compose up --build
```
I servizi saranno disponibili:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL pgvector: `localhost:5432`

---

## 🤖 5. Configurazione Modello Locale Ollama (Opzionale)

PolitiLens include un motore euristico istituzionale integrato che funziona immediatamente out-of-the-box anche senza Ollama attivo.

Per abilitare l'inferenza LLM locale avanzata:
1. Installa [Ollama](https://ollama.ai)
2. Scarica il modello consigliato per lingua italiana e sintesi:
   ```bash
   ollama pull qwen2.5:14b
   # oppure per il modello di embedding:
   ollama pull bge-m3
   ```
3. Avvia Ollama:
   ```bash
   ollama serve
   ```
PolitiLens rileverà automaticamente la connessione locale su `http://localhost:11434` e la utilizzerà per tutte le estrazioni e per il chatbot RAG!

---

## 📜 6. Licenza e Garanzia Etica
PolitiLens è rilasciato sotto licenza open-source MIT. Zero costi di licenza o API proprietarie.
Tutti i riferimenti numerici citati sono verificati sui database pubblici di ISTAT, Ministero dell'Economia e delle Finanze, Corte dei Conti, Eurostat e Banca d'Italia.
