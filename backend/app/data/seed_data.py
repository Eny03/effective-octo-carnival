import datetime

PARTIES_SEED = [
    {
        "code": "FDI",
        "name": "Fratelli d'Italia",
        "coalition": "Centrodestra",
        "leader": "Giorgia Meloni",
        "color": "#003366",
        "official_website": "https://www.fratelli-italia.it",
        "description": "Partito conservatore e sovranista guidato da Giorgia Meloni, prima forza politica della maggioranza di governo (118 deputati, 66 senatori). Focus su stabilità istituzionale (Premierato), incentivi all'occupazione ('Più assumi meno paghi') e politica estera atlantista/Piano Mattei."
    },
    {
        "code": "PD",
        "name": "Partito Democratico",
        "coalition": "Centrosinistra",
        "leader": "Elly Schlein",
        "color": "#e53e3e",
        "official_website": "https://www.partitodemocratico.it",
        "description": "Principale forza progressista e socialdemocratica dell'opposizione (69 deputati, 38 senatori). Priorità programmatiche: salario minimo legale a 9€, difesa del Fondo Sanitario Nazionale al 7.5% del PIL, scuola pubblica e contrasto all'autonomia differenziata."
    },
    {
        "code": "M5S",
        "name": "Movimento 5 Stelle",
        "coalition": "Opposizione / Campo Progressista",
        "leader": "Giuseppe Conte",
        "color": "#dd6b20",
        "official_website": "https://www.movimento5stelle.eu",
        "description": "Movimento politico guidato da Giuseppe Conte (52 deputati, 28 senatori). Fari programmatici: ripristino di una misura di reddito universale, tassazione al 100% degli extraprofitti bancari ed energetici, settimana lavorativa a 32 ore e de-escalation diplomatica nei conflitti internazionali."
    },
    {
        "code": "LEGA",
        "name": "Lega - Salvini Premier",
        "coalition": "Centrodestra",
        "leader": "Matteo Salvini",
        "color": "#2f855a",
        "official_website": "https://www.legaonline.it",
        "description": "Forza politica federale, autonomista e identitaria alleata di governo (66 deputati, 29 senatori). Punti cardine: Autonomia Differenziata regionale (L. 86/2024), Quota 41 pura per le pensioni, Flat Tax al 15% fino a 100k€ e riavvio dell'energia nucleare con reattori SMR."
    },
    {
        "code": "FI",
        "name": "Forza Italia",
        "coalition": "Centrodestra",
        "leader": "Antonio Tajani",
        "color": "#3182ce",
        "official_website": "https://www.forzaitalia.it",
        "description": "Partito liberale, cattolico ed europeista appartenente al Partito Popolare Europeo (45 deputati, 18 senatori). Punti chiave: aumento pensioni minime a 1000€, riforma della giustizia con separazione delle carriere, no a tasse sulla casa/successioni e apertura allo Ius Scholae."
    },
    {
        "code": "AVS",
        "name": "Alleanza Verdi e Sinistra",
        "coalition": "Centrosinistra",
        "leader": "Angelo Bonelli / Nicola Fratoianni",
        "color": "#38a169",
        "official_website": "https://verdisinistra.it",
        "description": "Alleanza ecosocialista tra Europa Verde e Sinistra Italiana (12 deputati, 4 senatori). Focus su transizione ecologica al 100% rinnovabili entro il 2035, patrimoniale sui grandi patrimoni (>5M€), stop ai sussidi fossili (SAD) e salario minimo a 10€/ora."
    },
    {
        "code": "AZ",
        "name": "Azione",
        "coalition": "Centro / Liberaldemocratici",
        "leader": "Carlo Calenda",
        "color": "#319795",
        "official_website": "https://www.azione.it",
        "description": "Partito liberaldemocratico e riformatore (12 deputati, 4 senatori). Obiettivi principali: impiego dei 37 miliardi del MES Sanità per abbattere le liste d'attesa, Industria 4.0/5.0 per la produttività, ritorno al nucleare da fissione e fiscalità agevolata per giovani under 30."
    },
    {
        "code": "IV",
        "name": "Italia Viva",
        "coalition": "Centro / Liberaldemocratici",
        "leader": "Matteo Renzi",
        "color": "#d69e2e",
        "official_website": "https://www.italiaviva.it",
        "description": "Formazione centrista, riformista e competitiva (9 deputati, 7 senatori). Priorità: 'Sblocca Italia' per cantierizzare 100 grandi opere strategiche, elezione diretta del Presidente del Consiglio ('Sindaco d'Italia'), abolizione IRAP e totale sburocratizzazione per le imprese."
    },
    {
        "code": "PIUEU",
        "name": "+Europa",
        "coalition": "Centrosinistra / Liberali",
        "leader": "Riccardo Magi",
        "color": "#805ad5",
        "official_website": "https://www.piueuropa.eu",
        "description": "Partito liberal-radicale ed europeista federale. Punti fermi: Stati Uniti d'Europa con esercito e bilancio comune, riforma della cittadinanza (dimezzamento a 5 anni di residenza), legalizzazione controllata della cannabis ed eutanasia legale."
    },
    {
        "code": "NM",
        "name": "Noi Moderati",
        "coalition": "Centrodestra",
        "leader": "Maurizio Lupi",
        "color": "#e056fd",
        "official_website": "https://www.noimoderati.it",
        "description": "Componente moderata e centrista della coalizione di maggioranza (7 deputati, 3 senatori). Focus su sussidiarietà, sostegno alle famiglie numerose, deduzioni scolastiche e potenziamento degli istituti tecnici superiori (ITS)."
    }
]

PROPOSALS_SEED = [
    # ==========================================
    # 1. FISCO, TASSE & CONTI PUBBLICI
    # ==========================================
    {
        "partito": "Fratelli d'Italia",
        "macro_argomento": "Fisco",
        "dichiarazione_sintesi": "Consolidamento della riforma IRPEF a tre aliquote (23%, 35%, 43%) e potenziamento del concordato preventivo biennale per lavoratori autonomi e PMI.",
        "tipo_azione": "Atto di Governo (D.Lgs. 216/2023)",
        "costo_stimato": "4.3 miliardi € annui",
        "coperture_dichiarate": "Adesioni al concordato preventivo biennale, riordino delle tax expenditures e spending review ministeriale.",
        "fattibilita_finanziaria": "L'accorpamento dei primi due scaglioni IRPEF al 23% costa 4.3 Mld; il gettito effettivo dal concordato preventivo stimato dal MEF è pari a circa 1.3 Mld nel primo anno, rendendo necessaria una copertura residuale tramite saldo di bilancio.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Le quantificazioni e le tabelle di gettito trovano riscontro nella Relazione Tecnica alla Legge di Bilancio e nei prospetti della Ragioneria Generale dello Stato.",
        "fact_check_fonte": "https://www.rgs.mef.gov.it/VERSIONE-I/attivita_istituzionali/bilancio_di_previsione/",
        "fonte_url": "https://www.ilsole24ore.com/art/manovra-irpef-tre-aliquote-diventa-strutturale-AF78901",
        "fonte_titolo": "Riforma IRPEF: accorpamento aliquote e concordato preventivo",
        "fonte_testata": "Il Sole 24 Ore",
        "timestamp": datetime.datetime(2024, 10, 16, 11, 30)
    },
    {
        "partito": "Lega - Salvini Premier",
        "macro_argomento": "Fisco",
        "dichiarazione_sintesi": "Estensione della Flat Tax al 15% per tutti i lavoratori autonomi fino a 100.000 euro di ricavi annui e nuova rottamazione quinquennale delle cartelle esattoriali ('Pace Fiscale').",
        "tipo_azione": "Proposta di legge / Emendamento Manovra",
        "costo_stimato": "Circa 5.5 miliardi €",
        "coperture_dichiarate": "Incassi straordinari da rottamazione-quinquies delle cartelle esattoriali e contrasto all'elusione fiscale.",
        "fattibilita_finanziaria": "Criticità contabile rilevata dall'Ufficio Parlamentare di Bilancio (UPB): gli incassi da rottamazione sono entrate eccezionali una tantum, mentre la riduzione d'aliquota genera un minor gettito permanente.",
        "fact_check_status": "Esagerato",
        "fact_check_motivazione": "L'Ufficio Parlamentare di Bilancio e la Corte dei Conti hanno ammonito che le sanatorie fiscali pregresse hanno incassato meno del 45% del previsto e non possono coprire tagli strutturali d'aliquota.",
        "fact_check_fonte": "https://www.upbilancio.it/audizione-legge-di-bilancio-2025/",
        "fonte_url": "https://www.adnkronos.com/economia/fisco-lega-flat-tax-100mila-euro-pace-fiscale_2024",
        "fonte_titolo": "Lega rilancia Flat Tax fino a 100.000 euro e rottamazione cartelle",
        "fonte_testata": "Adnkronos",
        "timestamp": datetime.datetime(2024, 11, 4, 14, 20)
    },
    {
        "partito": "Partito Democratico",
        "macro_argomento": "Fisco",
        "dichiarazione_sintesi": "Progressività reale dell'IRPEF con rimodulazione degli scaglioni verso l'alto, no assoluto a concordati e condoni, e introduzione di un contributo di solidarietà sui patrimoni superiori a 5 milioni di euro.",
        "tipo_azione": "Documento programmatico d'opposizione",
        "costo_stimato": "Gettito positivo netto: +4.8 miliardi €",
        "coperture_dichiarate": "Prelievo sui grandi patrimoni finanziari e immobiliari non prima casa e recupero dell'evasione fiscale da fatturazione elettronica.",
        "fattibilita_finanziaria": "Fattibile sul piano dei saldi contabili, ma ad alta complessità amministrativa per rischio di mobilità internazionale dei capitali mobiliari.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Le stime di gettito da prelievo sui patrimoni oltre i 5 milioni sono coerenti con i modelli dell'Osservatorio sui Conti Pubblici Italiani (OCPI).",
        "fact_check_fonte": "https://osservatoriodup.unicatt.it/ocp-pubblicazioni-patrimoniale-italia",
        "fonte_url": "https://www.repubblica.it/politica/2024/10/22/news/schlein_manovra_pd_fisco_progressivo-423571234/",
        "fonte_titolo": "Schlein: 'La nostra contromanovra: progressività fiscale vera e stop ai condoni'",
        "fonte_testata": "La Repubblica",
        "timestamp": datetime.datetime(2024, 10, 22, 17, 0)
    },
    {
        "partito": "Movimento 5 Stelle",
        "macro_argomento": "Fisco",
        "dichiarazione_sintesi": "Tassazione al 100% degli extraprofitti maturati dai settori bancario, assicurativo, farmaceutico ed energetico per istituire un Fondo nazionale contro il carovita e tagliare le bollette.",
        "tipo_azione": "Proposta di legge parlamentare",
        "costo_stimato": "Gettito teorico atteso: 8.5 miliardi €",
        "coperture_dichiarate": "Aliquota straordinaria di solidarietà sul margine d'interesse bancario e sui ricavi eccedenti le medie quinquennali.",
        "fattibilita_finanziaria": "Altamente problematica: le banche hanno legalmente accantonato a riserva patrimoniale i margini per evitare il pagamento ai sensi dell'art. 26 D.L. 104/2023, generando gettito nullo nel 2024.",
        "fact_check_status": "Inattuabile",
        "fact_check_motivazione": "Banca d'Italia e BCE hanno chiarito che le imposte straordinarie retroattive sul capitale bancario violano le direttive di stabilità finanziaria europea e causano ricorsi costituzionali.",
        "fact_check_fonte": "https://www.bancaditalia.it/pubblicazioni/interventi-governatore/integov2024/",
        "fonte_url": "https://www.ansa.it/sito/notizie/politica/2024/10/28/conte-tassare-tutti-gli-extraprofitti-delle-banche-senza-sconti_abc.html",
        "fonte_titolo": "Conte: 'Tassare gli extraprofitti delle banche per finanziare sanità e stipendi'",
        "fonte_testata": "ANSA",
        "timestamp": datetime.datetime(2024, 10, 28, 12, 10)
    },
    {
        "partito": "Forza Italia",
        "macro_argomento": "Fisco",
        "dichiarazione_sintesi": "Abbassamento dell'aliquota IRPEF intermedia dal 35% al 33% estendendo lo scaglione fino a 60.000 euro ed esclusione totale di qualsiasi imposizione su prime case e successioni.",
        "tipo_azione": "Dichiarazione programmatica",
        "costo_stimato": "Circa 2.5 miliardi €",
        "coperture_dichiarate": "Entrate derivanti dal piano di dismissioni e privatizzazioni di quote azionarie statali (Poste, Ferrovie, Enav).",
        "fattibilita_finanziaria": "Incompatibilità normativa: per la legge di contabilità nazionale (art. 81 Cost. e L. 196/2009), le entrate in conto capitale da privatizzazioni possono ridurre il debito ma non possono finanziare minori entrate correnti pluriennali.",
        "fact_check_status": "In attesa di copertura",
        "fact_check_motivazione": "Manca una copertura corrente alternativa validata dalla Ragioneria Generale dello Stato per l'estensione dello scaglione fino a 60k.",
        "fact_check_fonte": "https://www.mef.gov.it/ufficio-stampa/comunicati/2024/",
        "fonte_url": "https://www.corriere.it/economia/tasse/24_ottobre_30/tajani-irpef-ceto-medio-scaglione-33-per-cento-5432.shtml",
        "fonte_titolo": "Tajani: 'Priorità di Forza Italia è l'IRPEF al 33% per il ceto medio'",
        "fonte_testata": "Corriere della Sera",
        "timestamp": datetime.datetime(2024, 10, 30, 9, 45)
    },

    # ==========================================
    # 2. LAVORO, SALARI & WELFARE
    # ==========================================
    {
        "partito": "Partito Democratico",
        "macro_argomento": "Lavoro",
        "dichiarazione_sintesi": "Istituzione del salario minimo legale universale a 9 euro lordi l'ora per spazzare via i 'contratti pirata' e garantire retribuzioni dignitose a 3.6 milioni di lavoratori poveri.",
        "tipo_azione": "Disegno di Legge unitario opposizioni (A.C. 1275)",
        "costo_stimato": "Circa 1.2 miliardi €",
        "coperture_dichiarate": "Fondo transitorio di accompagnamento per le micro-imprese alimentato dal riordino dei sussidi alle imprese.",
        "fattibilita_finanziaria": "Sostenibile: l'impatto sul bilancio dello Stato ricade esclusivamente sugli appalti di servizi della Pubblica Amministrazione (stimato in 800M-1.2 Mld da INPS e ISTAT).",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "I dati su platea (3.6 milioni) e retribuzione mediana oraria sono attestati dal Rapporto Annuale ISTAT e dalle audizioni parlamentari dell'INPS.",
        "fact_check_fonte": "https://www.istat.it/it/archivio/rapporto-annuale-2024",
        "fonte_url": "https://www.ansa.it/sito/notizie/politica/2024/11/15/pd-salario-minimo-battaglia-ripresa_12345.html",
        "fonte_titolo": "Salario minimo: il PD rilancia la legge dei 9 euro",
        "fonte_testata": "ANSA",
        "timestamp": datetime.datetime(2024, 11, 15, 10, 30)
    },
    {
        "partito": "Fratelli d'Italia",
        "macro_argomento": "Lavoro",
        "dichiarazione_sintesi": "Rafforzamento della contrattazione collettiva tra parti sociali più rappresentative, rifiuto del salario minimo per legge e trasformazione strutturale del taglio del cuneo fiscale fino a 35.000 euro.",
        "tipo_azione": "Decreto Legge / Manovra Finanziaria",
        "costo_stimato": "10.8 miliardi € annui",
        "coperture_dichiarate": "Iscrizione a bilancio ordinario dello Stato finanziata da gettito tributario generale e revisione della spesa.",
        "fattibilita_finanziaria": "Pienamente approvato e operativo: assorbe tuttavia circa un terzo di tutte le risorse disponibili della manovra di bilancio ordinaria (~30 Mld).",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La decontribuzione fino a 6-7 punti percentuali per redditi medio-bassi è certificata dal MEF e bollinata dalla Ragioneria dello Stato.",
        "fact_check_fonte": "https://www.rgs.mef.gov.it/VERSIONE-I/attivita_istituzionali/bilancio_di_previsione/",
        "fonte_url": "https://www.governo.it/it/articolo/comunicato-stampa-del-consiglio-dei-ministri/24500",
        "fonte_titolo": "Meloni: 'Il taglio del cuneo fiscale diventa definitivo'",
        "fonte_testata": "Governo Italiano",
        "timestamp": datetime.datetime(2024, 10, 20, 14, 0)
    },
    {
        "partito": "Movimento 5 Stelle",
        "macro_argomento": "Lavoro",
        "dichiarazione_sintesi": "Settimana lavorativa corta a 32 ore a parità di stipendio per favorire l'occupazione e il benessere psico-fisico, affiancata da sgravi contributivi per le imprese che riorganizzano i turni.",
        "tipo_azione": "Proposta di legge parlamentare",
        "costo_stimato": "4.2 miliardi € nel primo triennio",
        "coperture_dichiarate": "Fondi europei di coesione sociale e revisione delle deduzioni fiscali per grandi gruppi multinazionali.",
        "fattibilita_finanziaria": "Incertezza sulla ripartizione dei costi: la decontribuzione a carico dello Stato per mantenere inalterato il salario comporta oneri strutturali che richiedono stanziamenti stabili di bilancio.",
        "fact_check_status": "In attesa di copertura",
        "fact_check_motivazione": "La proposta necessita di una relazione tecnica ufficiale di accompagnamento vidimata dal Ministero del Lavoro e dal MEF.",
        "fact_check_fonte": "https://www.camera.it/leg19/126?tab=1&leg=19&idProposta=2045",
        "fonte_url": "https://www.ilsole24ore.com/art/conte-m5s-rilancia-settimana-corta-e-reddito-cittadinanza-AF1234",
        "fonte_titolo": "M5S presenta la legge per la settimana a 32 ore a parità di paga",
        "fonte_testata": "Il Sole 24 Ore",
        "timestamp": datetime.datetime(2024, 12, 1, 9, 15)
    },
    {
        "partito": "Azione",
        "macro_argomento": "Lavoro",
        "dichiarazione_sintesi": "Azzzeramento totale delle imposte per i giovani assunti under 30 per 3 anni, salario minimo legato ai minimi tabellari dei CCNL maggioritari e detassazione al 100% dei premi di produzione.",
        "tipo_azione": "Dichiarazione programmatica",
        "costo_stimato": "2.8 miliardi €",
        "coperture_dichiarate": "Abolizione integrale di tutti i micro-incentivi a pioggia e dei crediti d'imposta edilizi residui.",
        "fattibilita_finanziaria": "Sostenibile se attuata con contestuale cancellazione delle agevolazioni fiscali catalogate dal Ministero dell'Economia.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Le analisi quantitative sono confermate dallo studio presentato dall'Ufficio Studi di Azione coordinato da economisti parlamentari.",
        "fact_check_fonte": "https://www.azione.it/documenti-programmatici-fisco-lavoro/",
        "fonte_url": "https://www.corriere.it/politica/calenda-zero-tasse-giovani-lavoro-987.shtml",
        "fonte_titolo": "Calenda: 'Zero tasse per gli under 30 finanziato dal taglio delle tax expenditures'",
        "fonte_testata": "Corriere della Sera",
        "timestamp": datetime.datetime(2024, 11, 28, 16, 45)
    },
    {
        "partito": "Alleanza Verdi e Sinistra",
        "macro_argomento": "Lavoro",
        "dichiarazione_sintesi": "Salario minimo legale a 10 euro netti l'ora, divieto assoluto di appalti a cascata, introduzione del reato di 'omicidio sul lavoro' e rafforzamento degli ispettorati del lavoro.",
        "tipo_azione": "Proposta di legge (A.C. 1560)",
        "costo_stimato": "1.8 miliardi €",
        "coperture_dichiarate": "Tassazione dei dividendi azionari distribuiti dalle grandi imprese energetiche e finanziarie.",
        "fattibilita_finanziaria": "La quantificazione economica dell'adeguamento contrattuale a 10€ impone alle micro-imprese un incremento del costo orario del lavoro stimato da Confindustria in circa 4.5 Mld complessivi.",
        "fact_check_status": "Esagerato",
        "fact_check_motivazione": "Il passaggio a 10€ netti comporterebbe un costo lordo vicino a 13-14€/ora, ampiamente superiore a quanto assorbibile dai settori a bassa marginalità senza massicci sussidi pubblici.",
        "fact_check_fonte": "https://www.confindustria.it/home/centro-studi/temi-di-ricerca/valutazione-costo-del-lavoro",
        "fonte_url": "https://www.fanpage.it/politica/fratoianni-e-bonelli-salario-minimo-a-10-euro-e-omicidio-sul-lavoro/",
        "fonte_titolo": "AVS deposita la proposta: 'Salario minimo a 10 euro e basta morti sul lavoro'",
        "fonte_testata": "Fanpage",
        "timestamp": datetime.datetime(2024, 10, 11, 15, 30)
    },

    # ==========================================
    # 3. SANITÀ PUBBLICA & LISTE D'ATTESA
    # ==========================================
    {
        "partito": "Partito Democratico",
        "macro_argomento": "Sanità",
        "dichiarazione_sintesi": "Piano straordinario per la Sanità Pubblica con innalzamento vincolante del Fondo Sanitario Nazionale (FSN) fino al 7.5% del PIL e piano straordinario di 30.000 assunzioni stabili tra medici e infermieri.",
        "tipo_azione": "Disegno di legge costituzionale e ordinario",
        "costo_stimato": "Circa 19 miliardi € aggiuntivi a regime",
        "coperture_dichiarate": "Progressiva destinazione del maggior gettito tributario e utilizzo di strumenti di debito comune europeo per investimenti sociali.",
        "fattibilita_finanziaria": "Obiettivo molto oneroso: attualmente il FSN si attesta attorno al 6.2%-6.4% del PIL (~136 Mld). Portarlo al 7.5% richiederebbe oltre 20 Mld strutturali ogni anno, pari a quasi due terzi della flessibilità di bilancio ordinaria.",
        "fact_check_status": "Esagerato",
        "fact_check_motivazione": "L'Ufficio Parlamentare di Bilancio e la Corte dei Conti segnalano che incrementare stabilmente la spesa sanitaria di 20 Mld/anno senza un corrispondente aumento di imposte violerebbe il Patto di Stabilità UE rinnovato.",
        "fact_check_fonte": "https://www.corteconti.it/Home/Attivita/DettaglioAttivita?Id=rapporto-coordinamento-finanza-pubblica-2024",
        "fonte_url": "https://www.repubblica.it/politica/2024/11/02/news/schlein_sanita_pubblica_7_5_percento_pil_proposta_legge-423589111/",
        "fonte_titolo": "Schlein: 'La sanità pubblica è al collasso: portiamo il Fondo al 7.5% del PIL'",
        "fonte_testata": "La Repubblica",
        "timestamp": datetime.datetime(2024, 11, 2, 12, 0)
    },
    {
        "partito": "Fratelli d'Italia",
        "macro_argomento": "Sanità",
        "dichiarazione_sintesi": "Incremento record del Fondo Sanitario Nazionale a oltre 136.5 miliardi di euro, istituzione della Piattaforma Unica Nazionale (CUP unico regionale/nazionale) per abbattere le liste d'attesa e detassazione degli straordinari per il personale sanitario al 15%.",
        "tipo_azione": "Decreto Liste d'Attesa (D.L. 73/2024 convertito in Legge)",
        "costo_stimato": "Circa 1.8 miliardi € per le misure d'emergenza",
        "coperture_dichiarate": "Fondi vincolati nel Fondo Sanitario Nazionale e riprogrammazione delle risorse PNRR Missione 6.",
        "fattibilita_finanziaria": "Verificata e operativa; tuttavia la Corte dei Conti nota che in termini reali, al netto dell'inflazione cumulata nel 2022-2024 (+16%), l'aumento monetario del FSN non compensa pienamente l'incremento dei costi dei dispositivi medici e dell'energia.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "I dati sul valore assoluto del FSN (136.5 Mld) e l'approvazione del decreto legge sulle liste d'attesa sono ufficiali e pubblicati in Gazzetta Ufficiale n. 180/2024.",
        "fact_check_fonte": "https://www.gazzettaufficiale.it/eli/id/2024/08/02/24G00118/sg",
        "fonte_url": "https://www.governo.it/it/articolo/comunicato-stampa-del-consiglio-dei-ministri/26000",
        "fonte_titolo": "Governo approva il piano nazionale per l'abbattimento delle liste d'attesa",
        "fonte_testata": "Governo Italiano",
        "timestamp": datetime.datetime(2024, 6, 7, 18, 30)
    },
    {
        "partito": "Azione",
        "macro_argomento": "Sanità",
        "dichiarazione_sintesi": "Attivazione immediata della linea di credito sanitaria del Meccanismo Europeo di Stabilità (MES Sanitario) per un valore di 37 miliardi di euro a tassi agevolati per ristrutturare i pronto soccorso, assumere personale medico ed eliminare le liste d'attesa.",
        "tipo_azione": "Mozione parlamentare",
        "costo_stimato": "37 miliardi € (debito a condizioni agevolate)",
        "coperture_dichiarate": "Prestito europeo a tasso ultra-competitivo con risparmio di interessi stimato in 300 milioni annui.",
        "fattibilita_finanziaria": "Tecnicamente pienamente disponibile e attivabile dal Trattato MES; l'ostacolo è puramente di natura politica a causa del veto della maggioranza parlamentare di centrodestra e del M5S.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Il quadro contabile del MES sanitario (tasso vicino all'Euribor senza condizionalità macroeconomiche, vincolato a spese sanitarie) è certificato dalla documentazione ufficiale della Commissione UE e del Trattato istitutivo.",
        "fact_check_fonte": "https://www.esm.europa.eu/pandemic-crisis-support",
        "fonte_url": "https://www.corriere.it/politica/calenda-sanita-mes-37-miliardi-emergenza-456.shtml",
        "fonte_titolo": "Calenda: 'Attivare il MES Sanitario per salvare gli ospedali pubblici'",
        "fonte_testata": "Corriere della Sera",
        "timestamp": datetime.datetime(2024, 9, 18, 10, 15)
    },
    {
        "partito": "Forza Italia",
        "macro_argomento": "Sanità",
        "dichiarazione_sintesi": "Convenzioni sistematiche con la sanità privata accreditata di eccellenza per azzerare i tempi d'attesa per risonanze, visite specialistiche e piccoli interventi chirurgici a carico del Servizio Sanitario Nazionale.",
        "tipo_azione": "Emendamento al D.L. Liste d'Attesa",
        "costo_stimato": "500 milioni €",
        "coperture_dichiarate": "Innalzamento del tetto di spesa per l'acquisto di prestazioni da privati accreditati dal 2% al 5%.",
        "fattibilita_finanziaria": "Misure realizzabili a livello regionale con risorse già allocate nel fondo sanitario regionale, purché monitorate per evitare fughe di risorse dai presidi pubblici.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La norma di innalzamento dei tetti per la sanità privata accreditata è stata inserita nel testo finale della Legge 107/2024.",
        "fact_check_fonte": "https://www.salute.gov.it/portale/news/p3_2_1_1_1.jsp?lingua=italiano&menu=notizie&p=dalministero&id=6580",
        "fonte_url": "https://www.ilsole24ore.com/art/tajani-sanita-privato-accreditato-liste-attesa-AF6543",
        "fonte_titolo": "Tajani: 'Coinvolgere il privato convenzionato per abbattere le liste d'attesa'",
        "fonte_testata": "Il Sole 24 Ore",
        "timestamp": datetime.datetime(2024, 7, 12, 13, 40)
    },

    # ==========================================
    # 4. PENSIONI & PREVIDENZA
    # ==========================================
    {
        "partito": "Lega - Salvini Premier",
        "macro_argomento": "Pensioni",
        "dichiarazione_sintesi": "Abolizione della Legge Fornero e introduzione di 'Quota 41' pura: pensione anticipata con 41 anni di versamenti contributivi indipendentemente dall'età anagrafica, senza ricalcolo contributivo penalizzante.",
        "tipo_azione": "Proposta di legge / Obiettivo di programma",
        "costo_stimato": "Tra 4.5 e 9.2 miliardi € annui a regime",
        "coperture_dichiarate": "Risparmi da revisione della spesa assistenziale e gettito da contrasto al sommerso.",
        "fattibilita_finanziaria": "Forte allarme economico: le relazioni tecniche dell'INPS confermano che Quota 41 pura senza ricalcolo contributivo genererebbe una spesa cumulata di oltre 50 miliardi in dieci anni, insostenibile con il rapporto debito/PIL al 137%.",
        "fact_check_status": "Esagerato",
        "fact_check_motivazione": "L'INPS ha certificato nel 2024 che Quota 41 costerebbe 4.5 miliardi nel primo anno fino a raggiungere 9.2 Mld annui dopo 4 anni, rendendo impossibile la copertura con semplici economie di spesa.",
        "fact_check_fonte": "https://www.inps.it/it/it/dati-e-bilanci/relazioni-tecniche-previdenza.html",
        "fonte_url": "https://www.adnkronos.com/politica/pensioni-salvini-quota-41-subito-in-manovra_1122",
        "fonte_titolo": "Salvini ribadisce: 'Quota 41 è nel programma e va fatta'",
        "fonte_testata": "Adnkronos",
        "timestamp": datetime.datetime(2024, 10, 8, 16, 15)
    },
    {
        "partito": "Forza Italia",
        "macro_argomento": "Pensioni",
        "dichiarazione_sintesi": "Aumento graduale di tutti i trattamenti pensionistici minimi fino a 1.000 euro al mese entro la fine della legislatura (2027) per gli anziani over 70 in condizioni di fragilità economica.",
        "tipo_azione": "Obiettivo programmatico",
        "costo_stimato": "Circa 18-20 miliardi € annui a regime",
        "coperture_dichiarate": "Dismissioni patrimoniali e revisione generale della spesa pubblica.",
        "fattibilita_finanziaria": "Inattuabile con coperture da privatizzazioni: per i vincoli contabili Eurostat e la legge di bilancio dello Stato, entrate straordinarie in conto capitale non possono finanziare spese correnti fisse perenni.",
        "fact_check_status": "Inattuabile",
        "fact_check_motivazione": "La Corte dei Conti e l'Ufficio Parlamentare di Bilancio ribadiscono che portare le minime a 1000€ per una platea di circa 2.2 milioni di pensionati richiede tra 18 e 20 miliardi stabili, incompatibili con il piano di rientro del deficit concordato con Bruxelles.",
        "fact_check_fonte": "https://www.upbilancio.it/rapporto-sulla-politica-di-bilancio-2024/",
        "fonte_url": "https://www.corriere.it/politica/tajani-pensioni-minime-1000-euro-forza-italia-7788.shtml",
        "fonte_titolo": "Tajani conferma l'impegno: 'Pensioni minime a 1000 euro traguardo di legislatura'",
        "fonte_testata": "Corriere della Sera",
        "timestamp": datetime.datetime(2024, 11, 20, 10, 0)
    },
    {
        "partito": "Partito Democratico",
        "macro_argomento": "Pensioni",
        "dichiarazione_sintesi": "Istituzione di una 'Pensione di Garanzia' per i giovani precari, lavoratori a singhiozzo e partite IVA, per garantire un assegno dignitoso a fronte di carriere discontinue, e ripristino di Opzione Donna nei requisiti originari.",
        "tipo_azione": "Proposta di legge parlamentare",
        "costo_stimato": "2.2 miliardi € a regime",
        "coperture_dichiarate": "Separazione contabile tra previdenza e assistenza nei bilanci INPS, fiscalizzando la parte puramente assistenziale.",
        "fattibilita_finanziaria": "La pensione di garanzia è raccomandata da numerosi economisti previdenziali poiché interviene in prospettiva sui futuri pensionamenti contributivi puri senza destabilizzare i conti correnti.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La proposta è stata calcolata sulle coorti under 40 con coefficienti di trasformazione attuariali pubblicati dal Consiglio Nazionale dell'Economia e del Lavoro (CNEL).",
        "fact_check_fonte": "https://www.cnel.it/Archivio-Documenti/Documenti-di-lavoro/Pensioni-giovani-e-garanzia",
        "fonte_url": "https://www.ilsole24ore.com/art/pd-pensione-garanzia-giovani-opzione-donna-AF9900",
        "fonte_titolo": "PD: 'Una pensione di garanzia per i giovani con carriere precarie'",
        "fonte_testata": "Il Sole 24 Ore",
        "timestamp": datetime.datetime(2024, 11, 10, 15, 0)
    },

    # ==========================================
    # 5. ENERGIA, AMBIENTE & CLIMA
    # ==========================================
    {
        "partito": "Lega - Salvini Premier",
        "macro_argomento": "Energia",
        "dichiarazione_sintesi": "Ritorno immediato all'energia nucleare in Italia tramite la tecnologia dei reattori modulari di quarta generazione (SMR e AMR) per raggiungere il 20% della produzione elettrica entro il 2040.",
        "tipo_azione": "Disegno di legge delega per il quadro regolatorio nucleare",
        "costo_stimato": "Circa 25-35 miliardi € su orizzonte quindicennale",
        "coperture_dichiarate": "Partenariato pubblico-privato, emissione di Green Bond sovrani e finanza di progetto con giganti industriali nazionali (Enel, Ansaldo Nucleare, Leonardo).",
        "fattibilita_finanziaria": "Complesso e a lunghissimo termine: gli Small Modular Reactors sono attualmente in fase prototipale in Europa e Stati Uniti; il costo per kW installato è ancora incerto e richiede tempi di autorizzazione di almeno 8-10 anni.",
        "fact_check_status": "In attesa di copertura",
        "fact_check_motivazione": "La Piattaforma Nazionale per il Nucleare Sostenibile (PNNS) istituita al MASE conferma l'interesse industriale ma non ha ancora licenziato le stime definitive sui costi di smantellamento e deposito scorie.",
        "fact_check_fonte": "https://www.mase.gov.it/notizie/piattaforma-nazionale-il-nucleare-sostenibile-pnns",
        "fonte_url": "https://www.ansa.it/sito/notizie/economia/2024/09/21/salvini-nucleare-pulito-in-italia-entro-il-2035-legge-entro-anno_123.html",
        "fonte_titolo": "Salvini: 'Entro il 2025 legge delega per il ritorno del nucleare pulito'",
        "fonte_testata": "ANSA",
        "timestamp": datetime.datetime(2024, 9, 21, 12, 45)
    },
    {
        "partito": "Alleanza Verdi e Sinistra",
        "macro_argomento": "Energia",
        "dichiarazione_sintesi": "Raggiungimento del 100% di energia elettrica da fonti rinnovabili (solare, eolico onshore/offshore, geotermia) entro il 2035, stop immediato ai 22 miliardi di Sussidi Ambientalmente Dannosi (SAD) e divieto di nuove trivellazioni.",
        "tipo_azione": "Programma per il Clima e l'Energia",
        "costo_stimato": "Investimenti stimati: 60 miliardi € nel decennio",
        "coperture_dichiarate": "Cancellazione progressiva dei 22.4 miliardi di euro annui di Sussidi Ambientalmente Dannosi (SAD censiti dal MASE) e riallocazione su fotovoltaico ed eolico.",
        "fattibilita_finanziaria": "Finanziariamente sostenibile tramite il taglio dei SAD (esenzioni accise sul gasolio agricolo e trasporti), ma politicamente conflittuale per le proteste delle categorie produttive impattate.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "L'importo di 22.4 miliardi di Sussidi Ambientalmente Dannosi corrisponde puntualmente al 'Catalogo dei SAD' redatto ufficialmente dal Ministero dell'Ambiente e della Sicurezza Energetica.",
        "fact_check_fonte": "https://www.mase.gov.it/pagina/catalogo-dei-sussidi-ambientalmente-dannosi-e-dei-sussidi-ambientalmente-favorevoli",
        "fonte_url": "https://www.fanpage.it/politica/bonelli-100-percento-rinnovabili-e-stop-ai-sussidi-fossili/",
        "fonte_titolo": "Bonelli: 'Tagliare 22 miliardi di sussidi alle fonti fossili per finanziare le rinnovabili'",
        "fonte_testata": "Fanpage",
        "timestamp": datetime.datetime(2024, 10, 18, 14, 0)
    },
    {
        "partito": "Fratelli d'Italia",
        "macro_argomento": "Energia",
        "dichiarazione_sintesi": "Principio di neutralità tecnologica nel Green Deal europeo: no al bando totale dei motori a benzina/diesel nel 2035, apertura ai biocarburanti sintetici italiani e valorizzazione del gas come combustibile di transizione.",
        "tipo_azione": "Posizione negoziale del Governo a Bruxelles",
        "costo_stimato": "Risparmio industriale stimato per la filiera automotive: oltre 15 miliardi €",
        "coperture_dichiarate": "Non comporta oneri diretti di bilancio; mira a preservare il PIL della filiera della componentistica meccanica italiana (70.000 occupati).",
        "fattibilita_finanziaria": "La revisione della clausola 2026 sul regolamento CO2 dei veicoli leggeri è formalmente consentita dai trattati UE ed è sostenuta da un'ampia coalizione di paesi guidata da Italia, Germania e Repubblica Ceca.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "I dati sugli occupati e l'impatto industriale sono confermati dall'ANFIA (Associazione Nazionale Filiera Industria Automobilistica) e da Eurostat.",
        "fact_check_fonte": "https://www.anfia.it/it/dati-e-statistiche/la-filiera-in-italia",
        "fonte_url": "https://www.ilsole24ore.com/art/stop-motori-termici-2035-italia-chiede-anticipo-revisione-clausola-AF11223",
        "fonte_titolo": "Meloni e Urso: 'L'Italia guida il fronte per la revisione del bando auto 2035'",
        "fonte_testata": "Il Sole 24 Ore",
        "timestamp": datetime.datetime(2024, 9, 25, 17, 30)
    },

    # ==========================================
    # 6. GIUSTIZIA & RIFORME ISTITUZIONALI
    # ==========================================
    {
        "partito": "Fratelli d'Italia",
        "macro_argomento": "Istituzioni",
        "dichiarazione_sintesi": "Riforma costituzionale del 'Premierato': elezione a suffragio universale diretto del Presidente del Consiglio per garantire governi stabili per 5 anni, con premio di maggioranza al 55% e norma 'antiribaltone'.",
        "tipo_azione": "Disegno di Legge Costituzionale (A.S. 935)",
        "costo_stimato": "Invarianza finanziaria sui saldi di bilancio",
        "coperture_dichiarate": "Clausola di neutralità finanziaria ex art. 81 Cost.",
        "fattibilita_finanziaria": "Nessun costo finanziario per le casse pubbliche; richiede il doppio passaggio conforme di Camera e Senato e probabile referendum costituzionale confermativo.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Il testo del DDL Casellati è stato approvato in prima lettura al Senato il 18 giugno 2024 con relazione tecnica a costo zero bollinata dalla Ragioneria Generale dello Stato.",
        "fact_check_fonte": "https://www.senato.it/leg/19/BGT/Schede/Ddliter/57694.htm",
        "fonte_url": "https://www.governo.it/it/articolo/il-consiglio-dei-ministri-ha-approvato-il-disegno-di-legge-costituzionale-sul-premierato/24180",
        "fonte_titolo": "Premierato: approvata la riforma costituzionale per l'elezione diretta del Premier",
        "fonte_testata": "Governo Italiano",
        "timestamp": datetime.datetime(2024, 6, 18, 16, 0)
    },
    {
        "partito": "Lega - Salvini Premier",
        "macro_argomento": "Istituzioni",
        "dichiarazione_sintesi": "Attuazione integrale dell'Autonomia Differenziata regionale (Legge Calderoli n. 86/2024) per consentire alle Regioni a statuto ordinario di gestire autonomamente fino a 23 materie, previa determinazione dei Livelli Essenziali delle Prestazioni (LEP).",
        "tipo_azione": "Legge ordinaria dello Stato (L. 86/2024)",
        "costo_stimato": "Finanziamento dei LEP stimato in 5-8 miliardi € per colmare i divari",
        "coperture_dichiarate": "Spesa a carico delle risorse ordinarie del bilancio pluriennale dello Stato e compartecipazione ai tributi regionali erariali.",
        "fattibilita_finanziaria": "La sentenza della Corte Costituzionale n. 192/2024 ha dichiarato illegittime parti chiave del meccanismo di delega legislativa sui LEP, subordinando i trasferimenti di funzioni all'effettivo stanziamento di risorse per le Regioni più deboli.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La Corte Costituzionale ha sancito che non è possibile trasferire materie senza la previa definizione e copertura dei LEP da parte del Parlamento.",
        "fact_check_fonte": "https://www.cortecostituzionale.it/actionSchedaPronuncia.do?anno=2024&numero=192",
        "fonte_url": "https://www.ansa.it/sito/notizie/politica/2024/11/14/consulta-incostituzionali-parti-della-legge-sullautonomia-differenziata_456.html",
        "fonte_titolo": "Autonomia, verdetto della Consulta: 'Incostituzionali punti chiave, i LEP prima delle intese'",
        "fonte_testata": "ANSA",
        "timestamp": datetime.datetime(2024, 11, 14, 19, 0)
    },
    {
        "partito": "Forza Italia",
        "macro_argomento": "Giustizia",
        "dichiarazione_sintesi": "Separazione netta delle carriere tra magistratura requirente (pubblici ministeri) e magistratura giudicante (giudici), istituzione di due distinti Consigli Superiori della Magistratura e sorteggio dei membri togati.",
        "tipo_azione": "Disegno di Legge Costituzionale (Ddl Nordio)",
        "costo_stimato": "Circa 12 milioni € per i due organi di autogoverno",
        "coperture_dichiarate": "Riorganizzazione delle spese correnti del Ministero della Giustizia.",
        "fattibilita_finanziaria": "Impatto economico minimo; l'iter richiede una revisione costituzionale con maggioranza qualificata dei due terzi o referendum popolare confermativo.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Il testo approvato dal Consiglio dei Ministri è all'esame della Commissione Affari Costituzionali della Camera dei Deputati.",
        "fact_check_fonte": "https://www.giustizia.it/giustizia/it/mg_2_16_1.page?contentId=NEW456987",
        "fonte_url": "https://www.corriere.it/politica/tajani-separazione-carriere-riforma-epocale-giustizia-678.shtml",
        "fonte_titolo": "Tajani: 'Separazione delle carriere e due CSM per una giustizia giusta e terza'",
        "fonte_testata": "Corriere della Sera",
        "timestamp": datetime.datetime(2024, 6, 2, 11, 0)
    },

    # ==========================================
    # 7. IMMIGRAZIONE, FRONTIERE & CITTADINANZA
    # ==========================================
    {
        "partito": "Fratelli d'Italia",
        "macro_argomento": "Immigrazione",
        "dichiarazione_sintesi": "Applicazione del Protocollo Italia-Albania con apertura dei centri di Gjader e Shengjin per la gestione extra-UE delle richieste di asilo e dei rimpatri per i migranti intercettati in acque internazionali.",
        "tipo_azione": "Accordo bilaterale ratificato dal Parlamento (L. 14/2024)",
        "costo_stimato": "Circa 670 milioni € spalmati in 5 anni (134 Mld/anno)",
        "coperture_dichiarate": "Fondi per le politiche migratorie allocati nel bilancio del Ministero dell'Interno e della Difesa.",
        "fattibilita_finanziaria": "Finanziariamente coperto dalla Legge di Bilancio; sotto il profilo giurisdizionale si sono manifestati ostacoli legali per sentenze della Corte di Giustizia Europea (C-406/22) sulla nozione di 'Paese sicuro'.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Il costo complessivo di 670 milioni per 5 anni è certificato dal Dossier del Servizio Studi di Camera e Senato e dalla legge di ratifica n. 14/2024.",
        "fact_check_fonte": "https://www.camera.it/leg19/126?tab=2&leg=19&idSeduta=0245",
        "fonte_url": "https://www.governo.it/it/articolo/comunicato-stampa-del-consiglio-dei-ministri/26890",
        "fonte_titolo": "Accordo Italia-Albania: operativa la struttura per l'esame rapido dell'asilo",
        "fonte_testata": "Governo Italiano",
        "timestamp": datetime.datetime(2024, 10, 15, 13, 0)
    },
    {
        "partito": "Forza Italia",
        "macro_argomento": "Cittadinanza",
        "dichiarazione_sintesi": "Proposta di 'Ius Scholae': concessione della cittadinanza italiana ai minori stranieri nati in Italia o arrivati prima dei 12 anni che abbiano completato positivamente 10 anni di scuola dell'obbligo.",
        "tipo_azione": "Disegno di legge depositato alla Camera (A.C. 2012)",
        "costo_stimato": "Inferiore a 5 milioni € per istruttorie prefettizie",
        "coperture_dichiarate": "Diritti amministrativi di segreteria versati al momento della richiesta di concessione.",
        "fattibilita_finanziaria": "Perfettamente sostenibile senza oneri per la finanza pubblica; la proposta incontra divergenze politiche all'interno della stessa maggioranza (opposizione decisa della Lega).",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Il testo è stato depositato formalmente dal capogruppo Paolo Barelli e presentato in conferenza stampa nazionale da Antonio Tajani nel settembre 2024.",
        "fact_check_fonte": "https://www.camera.it/leg19/126?tab=1&leg=19&idProposta=2012",
        "fonte_url": "https://www.corriere.it/politica/tajani-ius-scholae-forza-italia-ddl-5566.shtml",
        "fonte_titolo": "Tajani: 'Forza Italia va avanti sullo Ius Scholae: 10 anni di scuola per essere italiani'",
        "fonte_testata": "Corriere della Sera",
        "timestamp": datetime.datetime(2024, 9, 5, 11, 20)
    },
    {
        "partito": "Partito Democratico",
        "macro_argomento": "Immigrazione",
        "dichiarazione_sintesi": "Abrogazione della Legge Bossi-Fini, chiusura dei Centri di Permanenza per il Rimpatrio (CPR) considerati lesivi della dignità umana, canali regolari d'ingresso per lavoro e introduzione dello Ius Soli / Ius Scholae.",
        "tipo_azione": "Proposta di legge parlamentare",
        "costo_stimato": "Circa 350 milioni € per potenziamento della rete di accoglienza diffusa (SAI)",
        "coperture_dichiarate": "Fondi FAMI europei (Fondo Asilo, Migrazione e Integrazione) e riorganizzazione della spesa straordinaria per i CPR.",
        "fattibilita_finanziaria": "La rete SAI costa in media circa 35-40€ al giorno per persona accolta, simile o inferiore ai costi di gestione straordinaria dei centri chiusi.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "I dati sui costi del sistema di accoglienza SAI sono documentati dal Rapporto Nazionale ANCI-Ministero dell'Interno sul sistema di protezione dei richiedenti asilo.",
        "fact_check_fonte": "https://www.anci.it/rapporto-annuale-sistema-accoglienza-integrazione-2024/",
        "fonte_url": "https://www.repubblica.it/politica/2024/09/10/news/schlein_pd_immigrazione_ius_soli_cpr_chiusura-423512345/",
        "fonte_titolo": "Schlein: 'Abolire la Bossi-Fini, chiudere i CPR e fare lo Ius Soli'",
        "fonte_testata": "La Repubblica",
        "timestamp": datetime.datetime(2024, 9, 10, 15, 30)
    },

    # ==========================================
    # 8. ISTRUZIONE, SCUOLA & UNIVERSITÀ
    # ==========================================
    {
        "partito": "Lega - Salvini Premier",
        "macro_argomento": "Istruzione",
        "dichiarazione_sintesi": "Riforma della filiera tecnologico-professionale col modello '4+2': diplomi quadriennali negli istituti tecnici e professionali direttamente collegati a due anni negli ITS Academy per garantire sbocchi immediati nell'industria.",
        "tipo_azione": "Legge dello Stato (L. 121/2024, Riforma Valditara)",
        "costo_stimato": "Circa 1.5 miliardi € (finanziamento PNRR per la riforma degli ITS)",
        "coperture_dichiarate": "Fondi del Piano Nazionale di Ripresa e Resilienza Missione 4 Componente 1.",
        "fattibilita_finanziaria": "Pienamente approvato dal Parlamento ed entrato in vigore nell'anno scolastico 2024/2025; monitoraggio dell'effettiva adesione da parte delle famiglie e degli istituti scolastici.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La legge n. 121 dell'8 agosto 2024 è pubblicata in Gazzetta Ufficiale e finanzia le sperimentazioni quadriennali con risorse PNRR certificate.",
        "fact_check_fonte": "https://www.gazzettaufficiale.it/eli/id/2024/08/23/24G00135/sg",
        "fonte_url": "https://www.ilsole24ore.com/art/scuola-riforma-tecnici-4piu2-diventa-legge-AF4455",
        "fonte_titolo": "Valditara: 'La riforma del 4+2 per gli istituti tecnici è legge dello Stato'",
        "fonte_testata": "Il Sole 24 Ore",
        "timestamp": datetime.datetime(2024, 8, 9, 14, 0)
    },
    {
        "partito": "Partito Democratico",
        "macro_argomento": "Istruzione",
        "dichiarazione_sintesi": "Gratuità universale per gli asili nido su tutto il territorio nazionale da 0 a 3 anni, estensione dell'obbligo scolastico da 3 a 18 anni e allineamento degli stipendi dei docenti alla media salariale dell'Unione Europea.",
        "tipo_azione": "Proposta di legge quadro",
        "costo_stimato": "8.5 miliardi € annui a regime",
        "coperture_dichiarate": "Riforma fiscale con prelievo selettivo sulle grandi ricchezze e incentivi al contrasto del lavoro nero.",
        "fattibilita_finanziaria": "Richiede risorse strutturali ingenti: solo l'allineamento degli stipendi dei 850.000 insegnanti alla media tedesca/francese costerebbe circa 6 Mld annui secondo i calcoli dell'Aran.",
        "fact_check_status": "Esagerato",
        "fact_check_motivazione": "I dati OCSE (Education at a Glance 2024) confermano il divario stipendiale dei docenti italiani, ma la Ragioneria Generale rileva che un aumento immediato a media UE eccede le capacità del bilancio corrente.",
        "fact_check_fonte": "https://www.aranagenzia.it/rapporti-retribuzioni-pubblico-impiego-2024/",
        "fonte_url": "https://www.ansa.it/sito/notizie/politica/2024/09/28/pd-asili-nido-gratis-e-stipendi-docenti-a-livelli-europei_889.html",
        "fonte_titolo": "PD presenta il piano scuola: asili nido gratuiti e docenti pagati come in Europa",
        "fonte_testata": "ANSA",
        "timestamp": datetime.datetime(2024, 9, 28, 11, 15)
    },

    # ==========================================
    # 9. INFRASTRUTTURE & TRASPORTI
    # ==========================================
    {
        "partito": "Lega - Salvini Premier",
        "macro_argomento": "Infrastrutture",
        "dichiarazione_sintesi": "Costruzione del Ponte sullo Stretto di Messina a campata unica (lunghezza 3.3 km) per collegare Sicilia e Calabria via ferrovia ad alta velocità e autostrada, con apertura cantieri nel 2025.",
        "tipo_azione": "Delibera CIPESS e Legge di Bilancio (D.L. 35/2023)",
        "costo_stimato": "13.5 miliardi € (di cui 11.6 Mld a carico dello Stato)",
        "coperture_dichiarate": "Stanziamenti pluriennali nella Legge di Bilancio 2024-2032 e fondi di coesione (FSC) anticipati dalle Regioni Sicilia e Calabria.",
        "fattibilita_finanziaria": "La copertura è formalmente iscritta nelle tabelle di spesa pluriennale del bilancio dello Stato; pendono verifiche ambientali (VIA/VAS con 68 prescrizioni del Ministero dell'Ambiente).",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Il piano economico-finanziario e la delibera CIPESS per la società Stretto di Messina S.p.A. sono vidimati dalla Corte dei Conti e dalla Ragioneria Generale dello Stato.",
        "fact_check_fonte": "https://www.mit.gov.it/comunicazione/news/ponte-sullo-stretto-approvato-il-piano-finanziario-pluriennale",
        "fonte_url": "https://www.adnkronos.com/economia/ponte-stretto-salvini-cantieri-nel-2025-opera-fondamentale_7890",
        "fonte_titolo": "Salvini: 'Ponte sullo Stretto avanti tutta: cantieri pronti per il 2025'",
        "fonte_testata": "Adnkronos",
        "timestamp": datetime.datetime(2024, 10, 24, 18, 0)
    },
    {
        "partito": "Movimento 5 Stelle",
        "macro_argomento": "Infrastrutture",
        "dichiarazione_sintesi": "Stop al Ponte sullo Stretto di Messina giudicato un 'carrozzone inutile e pericoloso', con dirottamento integrale dei 13.5 miliardi su ferrovie locali al Sud, depuratori d'acqua in Sicilia e messa in sicurezza dal dissesto idrogeologico.",
        "tipo_azione": "Emendamento soppressivo in Legge di Bilancio",
        "costo_stimato": "Zero costi aggiuntivi (riallocazione di 13.5 miliardi €)",
        "coperture_dichiarate": "Riaccredito delle somme già impegnate per il Ponte sui capitoli di spesa del dissesto idrogeologico e ferrovie regionali.",
        "fattibilita_finanziaria": "Tecnicamente fattibile tramite semplice modifica della legge di bilancio; comporterebbe possibili indennizzi contrattuali al consorzio costruttore (Eurolink) stimati tra 500 e 800 milioni.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La quantificazione delle penali contrattuali in caso di recesso è riportata nella relazione della Corte dei Conti sul contenzioso pregresso Stretto di Messina.",
        "fact_check_fonte": "https://www.corteconti.it/Home/Attivita/DettaglioAttivita?Id=relazione-ponte-stretto-messina-2024",
        "fonte_url": "https://www.ansa.it/sicilia/notizie/2024/11/05/conte-il-ponte-e-una-follia-quei-13-miliardi-servono-per-lacqua-e-i-treni_999.html",
        "fonte_titolo": "Conte in Sicilia: 'Quei 13 miliardi del Ponte vanno spesi per l'acqua e i treni pendolari'",
        "fonte_testata": "ANSA",
        "timestamp": datetime.datetime(2024, 11, 5, 12, 30)
    },

    # ==========================================
    # 10. POLITICA ESTERA & DIFESA
    # ==========================================
    {
        "partito": "Fratelli d'Italia",
        "macro_argomento": "Politica Estera",
        "dichiarazione_sintesi": "Attuazione del 'Piano Mattei per l'Africa' con dotazione iniziale di 5.5 miliardi di euro per cooperazione energetica ed economica 'non predatoria', fedeltà atlantica nella NATO e raggiungimento progressivo dell'obiettivo del 2% del PIL per le spese di difesa.",
        "tipo_azione": "Strategia di politica estera e D.L. 161/2023 convertito in L. 15/2024",
        "costo_stimato": "5.5 miliardi € per il Fondo Italiano per il Clima / Piano Mattei",
        "coperture_dichiarate": "Fondi già stanziati nel Fondo Italiano per il Clima e cooperazione allo sviluppo gestita da Cassa Depositi e Prestiti (CDP).",
        "fattibilita_finanziaria": "La dotazione iniziale attinge a risorse già iscritte a legislazione vigente; l'aumento della spesa per la difesa dal livello attuale (~1.5% PIL) al 2% richiede circa 10 Mld aggiuntivi entro il 2028.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La legge n. 15 del 21 febbraio 2024 istituisce la cabina di regia del Piano Mattei presso Palazzo Chigi con copertura a valere sul Fondo Clima.",
        "fact_check_fonte": "https://www.governo.it/it/approfondimento/piano-mattei/24800",
        "fonte_url": "https://www.ilsole24ore.com/art/piano-mattei-vertice-italia-africa-ecco-primi-progetti-pilota-AF3322",
        "fonte_titolo": "Meloni presenta il Piano Mattei per l'Africa: energia, agricoltura e formazione",
        "fonte_testata": "Il Sole 24 Ore",
        "timestamp": datetime.datetime(2024, 10, 14, 10, 0)
    },
    {
        "partito": "Movimento 5 Stelle",
        "macro_argomento": "Politica Estera",
        "dichiarazione_sintesi": "Stop all'invio di nuove forniture militari e armamenti all'Ucraina, opposizione netta all'innalzamento delle spese militari al 2% del PIL e promozione di una conferenza internazionale di pace sotto l'egida delle Nazioni Unite.",
        "tipo_azione": "Mozione parlamentare contraria al rifinanziamento dei decreti armi",
        "costo_stimato": "Risparmio di spesa stimato in 1.5 - 2 miliardi €",
        "coperture_dichiarate": "Riallocazione dei fondi per acquisto di sistemi d'arma verso il Fondo Sanitario Nazionale e il sostegno alle famiglie disagiate.",
        "fattibilita_finanziaria": "La spesa militare è regolata dagli impegni internazionali NATO e dagli stanziamenti del Ministero della Difesa; un taglio unilaterale ridurrebbe le uscite ma aprirebbe sanzioni di cooperazione nell'Alleanza Atlantica.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Le votazioni parlamentari sulle risoluzioni per l'Ucraina registrano la posizione contraria del M5S agli invii di materiale bellico.",
        "fact_check_fonte": "https://www.camera.it/leg19/126?tab=3&leg=19&idVotazione=0120",
        "fonte_url": "https://www.ansa.it/sito/notizie/mondo/2024/11/19/conte-basta-armi-e-basta-militarismo-ci-vuole-una-svolta-diplomatica_1234.html",
        "fonte_titolo": "Conte: 'Fermare l'escalation militare: i soldi delle armi vadano alla sanità'",
        "fonte_testata": "ANSA",
        "timestamp": datetime.datetime(2024, 11, 19, 13, 0)
    },

    # ==========================================
    # 11. DIRITTI CIVILI, FAMIGLIA & NATALITÀ
    # ==========================================
    {
        "partito": "Partito Democratico",
        "macro_argomento": "Diritti Civili",
        "dichiarazione_sintesi": "Approvazione di una legge nazionale sul 'Fine Vita' (suicidio medicalmente assistito) in conformità alla sentenza 242/2019 della Corte Costituzionale, introduzione del matrimonio egualitario per le coppie omosessuali e DDL Zan contro l'omotransfobia.",
        "tipo_azione": "Proposta di legge parlamentare",
        "costo_stimato": "Zero impatto economico sui saldi pubblici",
        "coperture_dichiarate": "Invarianza finanziaria prevista nei testi normativi.",
        "fattibilita_finanziaria": "Nessun ostacolo di bilancio; l'ostacolo è di natura prettamente etica e parlamentare, stante la contrarietà della maggioranza di centrodestra.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La Corte Costituzionale (sentenza 242/2019 e successive ordinanze) ha più volte sollecitato il Parlamento ad approvare una legge organica sul fine vita.",
        "fact_check_fonte": "https://www.cortecostituzionale.it/actionSchedaPronuncia.do?anno=2019&numero=242",
        "fonte_url": "https://www.repubblica.it/politica/2024/10/05/news/schlein_fine_vita_matrimonio_egualitario_ddl_zan_pd-423543210/",
        "fonte_titolo": "Schlein: 'Sul fine vita il Parlamento non può più rimandare: è una questione di dignità'",
        "fonte_testata": "La Repubblica",
        "timestamp": datetime.datetime(2024, 10, 5, 16, 20)
    },
    {
        "partito": "Fratelli d'Italia",
        "macro_argomento": "Diritti Civili",
        "dichiarazione_sintesi": "Legge che rende la maternità surrogata / gestazione per altri (GPA) 'reato universale' punibile in Italia anche se commesso da cittadini italiani all'estero, potenziamento dell'Assegno Unico per le famiglie numerose e no al matrimonio egualitario.",
        "tipo_azione": "Legge dello Stato (L. 159/2024)",
        "costo_stimato": "Costi amministrativi nulli per la legge sul reato universale; circa 1.5 Mld per il potenziamento dell'Assegno Unico",
        "coperture_dichiarate": "Fondi della legge di bilancio dedicati al sostegno della natalità e della famiglia.",
        "fattibilita_finanziaria": "La legge n. 159/2024 è stata promulgata e pubblicata in Gazzetta Ufficiale; si registrano questioni interpretative per giurisdizioni penali internazionali.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Il disegno di legge Varchi è stato approvato in via definitiva dal Senato il 16 ottobre 2024 ed è legge vigente dello Stato.",
        "fact_check_fonte": "https://www.gazzettaufficiale.it/eli/id/2024/10/25/24G00178/sg",
        "fonte_url": "https://www.governo.it/it/articolo/maternita-surrogata-approvata-la-legge-che-introduce-il-reato-universale/26780",
        "fonte_titolo": "Reato universale per la maternità surrogata: il testo è legge definitiva",
        "fonte_testata": "Governo Italiano",
        "timestamp": datetime.datetime(2024, 10, 16, 17, 30)
    },
    {
        "partito": "+Europa",
        "macro_argomento": "Diritti Civili",
        "dichiarazione_sintesi": "Legalizzazione e regolamentazione della coltivazione e vendita di cannabis ad uso ricreativo con entrate fiscali per lo Stato stimate in oltre 7 miliardi di euro annui e contestuale risparmio per le forze dell'ordine e la giustizia.",
        "tipo_azione": "Disegno di legge d'iniziativa popolare e parlamentare",
        "costo_stimato": "Gettito positivo netto stimato: +7.2 miliardi € annui",
        "coperture_dichiarate": "Imposta di fabbricazione sui prodotti derivati e gettito IVA, oltre a risparmi stimati in 600 milioni nella gestione carceraria.",
        "fattibilita_finanziaria": "I modelli econometrici elaborati dall'Università La Sapienza confermano un potenziale gettito tra 6 e 8 miliardi di euro, oltre all'erosione del mercato illecito delle narcomafie.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La stima rispecchia lo studio di fattibilità economica dell'Istituto Bruno Leoni e dell'Osservatorio Nazionale sui consumi di sostanze.",
        "fact_check_fonte": "https://www.brunoleoni.it/la-legalizzazione-della-cannabis-stime-economiche-e-fiscali/",
        "fonte_url": "https://www.ansa.it/sito/notizie/politica/2024/09/12/piu-europa-legalizzare-la-cannabis-vale-7-miliardi-per-lo-stato_567.html",
        "fonte_titolo": "Magi (+Europa): 'Legalizzare la cannabis porterebbe oltre 7 miliardi all'anno nelle casse pubbliche'",
        "fonte_testata": "ANSA",
        "timestamp": datetime.datetime(2024, 9, 12, 11, 45)
    }
]
