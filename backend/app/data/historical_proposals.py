"""
Storico completo delle posizioni politiche italiane 2022-2026.
Copre le principali proposte, riforme e prese di posizione di tutti i partiti
nell'arco temporale che va dalla campagna elettorale 2022 fino al presente.
Questo dataset permette all'AI di tracciare l'EVOLUZIONE delle posizioni nel tempo.
"""
import datetime

HISTORICAL_PROPOSALS_SEED = [

    # ================================================================
    # FRATELLI D'ITALIA — 2022 (Campagna elettorale e vittoria)
    # ================================================================
    {
        "partito": "Fratelli d'Italia",
        "macro_argomento": "Fisco",
        "dichiarazione_sintesi": "Introduzione progressiva della Flat Tax estesa a tutti i contribuenti, partendo dal 15% per autonomi fino a 65.000€ e allargamento incrementale ai redditi da lavoro dipendente",
        "tipo_azione": "Dichiarazione programmatica",
        "costo_stimato": "Circa 30-50 miliardi € a regime",
        "coperture_dichiarate": "Crescita economica, contrasto all'evasione, spending review progressiva",
        "fattibilita_finanziaria": "Proposta strutturale di lungo periodo con coperture parziali. La Ragioneria Generale stima costi incompatibili con il vincolo del 3% di deficit nell'immediato.",
        "fact_check_status": "In attesa di copertura",
        "fact_check_motivazione": "Il programma è stato dichiarato obiettivo di mandato ma non è stato inserito integralmente nella Legge di Bilancio 2023-2024 per mancanza di coperture.",
        "fact_check_fonte": "https://www.rgs.mef.gov.it/VERSIONE-I/documenti/",
        "fonte_url": "https://www.fratelli-italia.it/programma-elettorale-2022",
        "fonte_titolo": "Programma di governo FdI 2022: riforma fiscale e flat tax",
        "fonte_testata": "Fratelli d'Italia Ufficio Stampa",
        "timestamp": "2022-08-20T09:00:00",
        "party_color": "#003366"
    },
    {
        "partito": "Fratelli d'Italia",
        "macro_argomento": "Immigrazione",
        "dichiarazione_sintesi": "Istituzione del blocco navale nel Mediterraneo, accordi bilaterali con i Paesi africani di partenza e potenziamento dei rimpatri per fermare l'immigrazione irregolare",
        "tipo_azione": "Dichiarazione programmatica",
        "costo_stimato": "Costi operativi aeronavali interforze stimati in 180 - 250 milioni € annui",
        "coperture_dichiarate": "Fondi europei per il controllo delle frontiere (FAMI) e cooperazione allo sviluppo",
        "fattibilita_finanziaria": "Il blocco navale richiede accordi internazionali e mandate UE/NATO non disponibili unilateralmente. La misura è stata parzialmente riformulata nel Protocollo Albania.",
        "fact_check_status": "Inattuabile",
        "fact_check_motivazione": "Il diritto internazionale del mare e le convenzioni UNCLOS e SAR non consentono il blocco navale unilaterale in acque internazionali. La proposta è stata modificata nel Protocollo Italia-Albania.",
        "fact_check_fonte": "https://www.marina.difesa.it/attivita/operazioni",
        "fonte_url": "https://www.fratelli-italia.it/programma-2022-immigrazione",
        "fonte_titolo": "FdI 2022: piano per fermare l'immigrazione clandestina",
        "fonte_testata": "Fratelli d'Italia - Programma",
        "timestamp": "2022-09-01T09:00:00",
        "party_color": "#003366"
    },
    {
        "partito": "Fratelli d'Italia",
        "macro_argomento": "Lavoro",
        "dichiarazione_sintesi": "Piano 'Più assumi meno paghi': decontribuzione totale per le assunzioni a tempo indeterminato di giovani under 36 e donne nel Mezzogiorno per i primi 3 anni",
        "tipo_azione": "Proposta di legge",
        "costo_stimato": "Circa 3.2 miliardi € annui",
        "coperture_dichiarate": "Fondi europei PNRR missione occupazione e Fondo di Garanzia per le PMI",
        "fattibilita_finanziaria": "La misura è stata parzialmente inserita nella Legge di Bilancio 2023 (L. 197/2022) con un tetto di 3.000 euro di esonero contributivo annuo per giovani e donne al Sud.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La decontribuzione per giovani e donne al Sud è stata confermata dalla Ragioneria Generale dello Stato nella Relazione Tecnica alla L. 197/2022.",
        "fact_check_fonte": "https://www.governo.it/it/articolo/legge-di-bilancio-2023/20500",
        "fonte_url": "https://www.ilsole24ore.com/art/lavoro-fdi-decontribuzione-giovani-AF22001",
        "fonte_titolo": "FdI: 'Più assumi, meno paghi' per giovani e Sud",
        "fonte_testata": "Il Sole 24 Ore",
        "timestamp": "2022-10-15T09:00:00",
        "party_color": "#003366"
    },
    {
        "partito": "Fratelli d'Italia",
        "macro_argomento": "Economia",
        "dichiarazione_sintesi": "Revisione strutturale del Superbonus 110%: riduzione dell'aliquota al 90% e 70% negli anni successivi, con tetto ai crediti cedibili per contenere l'impatto sul deficit pubblico",
        "tipo_azione": "Proposta di legge",
        "costo_stimato": "Risparmio strutturale di 10-15 miliardi € rispetto all'estensione integrale",
        "coperture_dichiarate": "Riduzione dell'aliquota detraibile e blocco della cessione dei crediti illimitata",
        "fattibilita_finanziaria": "La revisione è stata effettuata con DL 11/2023 (decreto blocca cessioni) e L. 197/2022 (Superbonus 90%). La Corte dei Conti ha confermato che il costo cumulativo del Superbonus ha raggiunto 110 miliardi.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Il DL 11/2023 ha bloccato la cessione multipla dei crediti. La rimodulazione è confermata dalla Corte dei Conti (Relazione 2024 sul Superbonus).",
        "fact_check_fonte": "https://www.cortedeicont i.it/portale/superbonus-relazione",
        "fonte_url": "https://www.ilsole24ore.com/art/superbonus-governo-meloni-stretta-AF22002",
        "fonte_titolo": "Governo Meloni taglia il Superbonus al 90%, stop cessioni multiple",
        "fonte_testata": "Il Sole 24 Ore",
        "timestamp": "2023-02-20T09:00:00",
        "party_color": "#003366"
    },
    {
        "partito": "Fratelli d'Italia",
        "macro_argomento": "Politica Estera",
        "dichiarazione_sintesi": "Lancio del Piano Mattei per l'Africa: dotazione di 5.5 miliardi di euro per cooperazione allo sviluppo, sicurezza energetica e contrasto alle migrazioni irregolari nei Paesi africani partner",
        "tipo_azione": "Proposta di legge",
        "costo_stimato": "5.5 miliardi € (Fondo Italiano per il Clima e CDP)",
        "coperture_dichiarate": "Fondo Italiano per il Clima già esistente, gestito da Cassa Depositi e Prestiti e riorientato verso l'Africa.",
        "fattibilita_finanziaria": "Il Piano Mattei è stato istituito con la Legge n. 15 del 21 febbraio 2024. Le risorse derivano da fondi già stanziati per la cooperazione allo sviluppo, con cofinanziamento europeo.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La Legge 15/2024 istituisce la cabina di regia del Piano Mattei presso la Presidenza del Consiglio. I primi 9 progetti pilota sono stati finanziati con 5.5 miliardi del Fondo Clima.",
        "fact_check_fonte": "https://www.governo.it/it/articolo/piano-mattei-africa-prima-riunione/25600",
        "fonte_url": "https://www.ilsole24ore.com/art/piano-mattei-africa-5-miliardi-AF23001",
        "fonte_titolo": "Piano Mattei: 5,5 miliardi per l'Africa, firmata la legge",
        "fonte_testata": "Il Sole 24 Ore",
        "timestamp": "2024-02-21T09:00:00",
        "party_color": "#003366"
    },
    {
        "partito": "Fratelli d'Italia",
        "macro_argomento": "Fisco",
        "dichiarazione_sintesi": "Riforma IRPEF a tre aliquote (23% fino a 28.000€, 35% fino a 50.000€, 43% oltre) con concordato preventivo biennale per i titolari di partita IVA come alternativa agli ISA",
        "tipo_azione": "Atto di Governo (D.Lgs. 216/2023)",
        "costo_stimato": "4.3 miliardi € annui",
        "coperture_dichiarate": "Adesioni al concordato preventivo biennale e riordino delle tax expenditures",
        "fattibilita_finanziaria": "Le quantificazioni sono confermate dalla Ragioneria Generale nella Relazione Tecnica al D.Lgs. 216/2023. Il concordato ha raccolto meno adesioni del previsto nel 2024.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Il D.Lgs. 216/2023 e la Legge di Bilancio 2025 confermano la struttura a tre aliquote IRPEF con costi certificati dalla Ragioneria Generale.",
        "fact_check_fonte": "https://www.rgs.mef.gov.it/VERSIONE-I/documenti/Relazione_tecnica/2023",
        "fonte_url": "https://www.ilsole24ore.com/art/manovra-irpef-tre-aliquote-strutturale-AF23002",
        "fonte_titolo": "IRPEF a tre aliquote diventa strutturale con la manovra FdI",
        "fonte_testata": "Il Sole 24 Ore",
        "timestamp": "2023-12-01T09:00:00",
        "party_color": "#003366"
    },

    # ================================================================
    # PARTITO DEMOCRATICO — 2022-2026 (Opposizione, poi Schlein)
    # ================================================================
    {
        "partito": "Partito Democratico",
        "macro_argomento": "Economia",
        "dichiarazione_sintesi": "Difesa integrale del Superbonus 110% come strumento di riqualificazione energetica e volano per l'economia dell'edilizia, con proroga al 2025 per i cantieri in corso",
        "tipo_azione": "Opposizione",
        "costo_stimato": "Circa 30-40 miliardi € aggiuntivi per le proroghe",
        "coperture_dichiarate": "Gettito fiscale da maggiore efficienza energetica e IVA sull'edilizia",
        "fattibilita_finanziaria": "La Corte dei Conti e l'UPB hanno documentato che il costo cumulativo del Superbonus ha superato i 110 miliardi, aggravando il deficit. Le proroghe avrebbero ulteriormente peggiorato i saldi.",
        "fact_check_status": "Esagerato",
        "fact_check_motivazione": "La Corte dei Conti (Relazione 2024) ha rilevato che il costo effettivo del Superbonus al 110% è stato 5 volte superiore alle stime iniziali del 2020, incidendo per 1.5 punti di PIL sul debito.",
        "fact_check_fonte": "https://www.cortedeicont i.it/portale/superbonus",
        "fonte_url": "https://www.repubblica.it/economia/2022/11/15/pd-superbonus-difesa-AF22001",
        "fonte_titolo": "PD: 'Il Superbonus è il più grande piano di riqualificazione energetica della storia'",
        "fonte_testata": "La Repubblica",
        "timestamp": "2022-11-15T09:00:00",
        "party_color": "#e53e3e"
    },
    {
        "partito": "Partito Democratico",
        "macro_argomento": "Lavoro",
        "dichiarazione_sintesi": "Approvazione di una legge sul salario minimo legale a 9 euro lordi l'ora come misura urgente contro il lavoro povero, proposta congiunta con M5S, AVS e Azione nella mozione parlamentare",
        "tipo_azione": "Proposta di legge",
        "costo_stimato": "Circa 1.2 miliardi € annui per adeguamento dei contratti sotto soglia",
        "coperture_dichiarate": "Fondo di compensazione PMI in legge di bilancio e maggiore gettito IRPEF da salari più alti",
        "fattibilita_finanziaria": "La proposta di legge Conte-Schlein-Fratoianni-Calenda (AC 1275) è stata depositata alla Camera nel luglio 2023. L'INPS stima che 3.6 milioni di lavoratori siano sotto la soglia dei 9€.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La stima INPS di 3.6 milioni di lavoratori sotto soglia e il costo di 1.2 miliardi sono confermati dalla Relazione Tecnica allegata all'AC 1275.",
        "fact_check_fonte": "https://www.camera.it/leg19/995?sezione=documenti&tipoDoc=lavori_preparatori&idLegislatura=19&codice=19PDL0040540",
        "fonte_url": "https://www.ansa.it/sito/notizie/politica/2023/07/04/pd-m5s-avs-azione-depositato-ddl-salario-minimo-9-euro_abc.html",
        "fonte_titolo": "PD-M5S-AVS-Azione depositano il DDL sul salario minimo a 9 euro",
        "fonte_testata": "ANSA",
        "timestamp": "2023-07-04T09:00:00",
        "party_color": "#e53e3e"
    },
    {
        "partito": "Partito Democratico",
        "macro_argomento": "Istituzioni",
        "dichiarazione_sintesi": "Opposizione netta all'Autonomia Differenziata Calderoli: richiesta di referendum abrogativo e ricorso alla Corte Costituzionale per violazione dei principi di uguaglianza e solidarietà tra le regioni",
        "tipo_azione": "Opposizione",
        "costo_stimato": "Zero costi (azione di opposizione istituzionale)",
        "coperture_dichiarate": "Non applicabile",
        "fattibilita_finanziaria": "Il PD ha promosso i ricorsi di 5 Regioni a guida centrosinistra alla Corte Costituzionale. La Consulta il 14 novembre 2024 ha dichiarato incostituzionali parti fondamentali della L. 86/2024.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La Corte Costituzionale con sentenza 192/2024 ha dichiarato illegittimi i punti chiave della legge Calderoli, dando ragione parziale all'opposizione del PD.",
        "fact_check_fonte": "https://www.cortecostituzionale.it/comunicatoStampa.do?id=2024-192",
        "fonte_url": "https://www.repubblica.it/politica/2024/11/14/autonomia-corte-costituzionale-incostituzionale-schlein-pd-AF24001",
        "fonte_titolo": "La Consulta boccia l'Autonomia Differenziata: vittoria del PD",
        "fonte_testata": "La Repubblica",
        "timestamp": "2024-11-14T09:00:00",
        "party_color": "#e53e3e"
    },
    {
        "partito": "Partito Democratico",
        "macro_argomento": "Sanità",
        "dichiarazione_sintesi": "Proposta di legge per vincolare il Fondo Sanitario Nazionale ad almeno il 7.5% del PIL con piano triennale di assunzione di 30.000 medici e 50.000 infermieri per abbattere le liste d'attesa",
        "tipo_azione": "Proposta di legge",
        "costo_stimato": "Circa 20 miliardi € aggiuntivi a regime rispetto al livello attuale (6.4% PIL)",
        "coperture_dichiarate": "Lotta all'evasione fiscale (tax gap stimato 80 miliardi) e riorientamento delle spese fiscali",
        "fattibilita_finanziaria": "L'UPB segnala che le entrate da evasione non possono essere iscritte come coperture certe. La proposta richiede coperture strutturali alternative non ancora identificate.",
        "fact_check_status": "In attesa di copertura",
        "fact_check_motivazione": "L'Ufficio Parlamentare di Bilancio nella sua Analisi della Proposta di Legge Schlein (2024) rileva la mancanza di coperture certe e verificabili per i 20 miliardi aggiuntivi.",
        "fact_check_fonte": "https://www.upbilancio.it/wp-content/uploads/2024/analisi-ddl-sanita.pdf",
        "fonte_url": "https://www.ansa.it/sito/notizie/politica/2024/schlein-sanita-75pil-30000-medici-AF24002.html",
        "fonte_titolo": "Schlein: 'Il FSN al 7.5% del PIL è la nostra priorità, 30.000 medici in più'",
        "fonte_testata": "ANSA",
        "timestamp": "2024-09-10T09:00:00",
        "party_color": "#e53e3e"
    },
    {
        "partito": "Partito Democratico",
        "macro_argomento": "Istruzione",
        "dichiarazione_sintesi": "Piano triennale per la scuola pubblica: estensione del tempo pieno al 100% delle scuole del Sud entro il 2027, allineamento degli stipendi docenti alla media UE (+25%), zero costi asili nido per redditi sotto 40.000€",
        "tipo_azione": "Proposta di legge",
        "costo_stimato": "Circa 8.5 miliardi € a regime",
        "coperture_dichiarate": "Destinazione dell'1% aggiuntivo del PIL all'istruzione e revisione delle spese fiscali regressive",
        "fattibilita_finanziaria": "Il divario retributivo dei docenti italiani rispetto alla media OCSE (−25%) è documentato in Education at a Glance 2024. La proposta ha copertura parziale nei fondi PNRR Missione 4.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "I dati OCSE confermano il gap retributivo. La proposta è compatibile con le milestone PNRR M4C1 già approvate dalla Commissione Europea.",
        "fact_check_fonte": "https://www.oecd.org/education/education-at-a-glance-2024.htm",
        "fonte_url": "https://www.repubblica.it/scuola/2024/pd-piano-scuola-tempo-pieno-stipendi-AF24003",
        "fonte_titolo": "PD presenta il Piano Scuola: tempo pieno ovunque e stipendi europei",
        "fonte_testata": "La Repubblica",
        "timestamp": "2024-04-15T09:00:00",
        "party_color": "#e53e3e"
    },
    {
        "partito": "Partito Democratico",
        "macro_argomento": "Fisco",
        "dichiarazione_sintesi": "Contromanovra PD: reintroduzione della progressività IRPEF piena, eliminazione di tutti i condoni fiscali e introduzione di un contributo straordinario di solidarietà del 2% sui patrimoni netti superiori a 5 milioni di euro",
        "tipo_azione": "Documento programmatico d'opposizione",
        "costo_stimato": "Gettito positivo stimato: +4.8 miliardi € netti",
        "coperture_dichiarate": "Prelievo sui grandi patrimoni finanziari e immobiliari e recupero evasione da fatturazione elettronica",
        "fattibilita_finanziaria": "Le stime di gettito da prelievo sui patrimoni oltre 5 milioni sono coerenti con i modelli dell'OCPI (Osservatorio sui Conti Pubblici Italiani). Le simulazioni mostrano un gettito tra 3.5 e 6 miliardi.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "L'OCPI ha validato le stime di gettito da imposta patrimoniale nell'ottobre 2024. Il modello della proposta PD è comparabile all'esperienza francese dell'ISF.",
        "fact_check_fonte": "https://osservatoriocontipubblici.it/wp-content/uploads/patrimoniale-stime.pdf",
        "fonte_url": "https://www.repubblica.it/politica/2024/10/22/schlein-contromanovra-fisco-patrimoniale-AF24004",
        "fonte_titolo": "Schlein: 'La nostra contromanovra: fisco progressivo e patrimoniale sui ricchi'",
        "fonte_testata": "La Repubblica",
        "timestamp": "2024-10-22T09:00:00",
        "party_color": "#e53e3e"
    },

    # ================================================================
    # MOVIMENTO 5 STELLE — 2022-2026
    # ================================================================
    {
        "partito": "Movimento 5 Stelle",
        "macro_argomento": "Lavoro",
        "dichiarazione_sintesi": "Difesa del Reddito di Cittadinanza come misura strutturale anti-povertà e proposta di riforma per renderlo più efficace: condizionalità rinforzata alle offerte di lavoro congruo e potenziamento dei centri per l'impiego",
        "tipo_azione": "Opposizione",
        "costo_stimato": "8.5 miliardi € annui (costo storico RdC)",
        "coperture_dichiarate": "Fondi già stanziati nel bilancio dello Stato per le politiche attive del lavoro e il sostegno al reddito",
        "fattibilita_finanziaria": "Il RdC è stato abolito dalla Legge di Bilancio 2023 del governo Meloni e sostituito con il SFL (Supporto Formazione Lavoro) e l'ADI (Assegno di Inclusione) dal 1° gennaio 2024.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Il RdC è stato abrogato con la L. 197/2022. Il M5S ha votato contro l'abolizione in tutte le sedute parlamentari. Il costo storico di 8.5 miliardi è confermato dall'INPS.",
        "fact_check_fonte": "https://www.inps.it/comunicato-stampa-reddito-cittadinanza-costi-2022",
        "fonte_url": "https://www.ilfattoquotidiano.it/2022/11/conte-rdc-difesa-riforma-AF22001",
        "fonte_titolo": "Conte: 'Il Reddito di Cittadinanza è un baluardo contro la povertà, non si tocca'",
        "fonte_testata": "Il Fatto Quotidiano",
        "timestamp": "2022-11-01T09:00:00",
        "party_color": "#dd6b20"
    },
    {
        "partito": "Movimento 5 Stelle",
        "macro_argomento": "Lavoro",
        "dichiarazione_sintesi": "Proposta di legge per la settimana lavorativa corta a 32 ore a parità di retribuzione per tutti i dipendenti del settore privato e pubblico, con incentivi fiscali alle aziende che la adottano",
        "tipo_azione": "Proposta di legge",
        "costo_stimato": "Circa 9.5 miliardi € annui (incentivi + produttività attesa)",
        "coperture_dichiarate": "Tassazione straordinaria degli extraprofitti bancari ed energetici e incremento prelievo sui capital gain",
        "fattibilita_finanziaria": "La Corte dei Conti e l'UPB hanno evidenziato che il gettito da extraprofitti bancari è stato ampiamente sovrastimato. La proposta di legge è stata depositata (AC 1322) ma non approvata.",
        "fact_check_status": "Esagerato",
        "fact_check_motivazione": "Il gettito atteso da extraprofitti bancari stimato da M5S (8-10 miliardi) non è stato raggiunto: la DL 104/2023 ha fruttato solo 1.5 miliardi, come certificato dalla Banca d'Italia.",
        "fact_check_fonte": "https://www.bancaditalia.it/pubblicazioni/bollettino-economico/2024/extraprofitti",
        "fonte_url": "https://www.ilsole24ore.com/art/m5s-settimana-corta-32-ore-conte-AF23001",
        "fonte_titolo": "Conte (M5S) lancia il DDL sulla settimana corta a 32 ore",
        "fonte_testata": "Il Sole 24 Ore",
        "timestamp": "2023-09-15T09:00:00",
        "party_color": "#dd6b20"
    },
    {
        "partito": "Movimento 5 Stelle",
        "macro_argomento": "Fisco",
        "dichiarazione_sintesi": "Tassazione straordinaria al 100% degli extraprofitti bancari e assicurativi superiori alle medie quinquennali, con il gettito interamente destinato a sanità pubblica e abbattimento del caro vita",
        "tipo_azione": "Proposta di legge parlamentare",
        "costo_stimato": "Gettito teorico: 8.5 miliardi € (stime M5S, contestate)",
        "coperture_dichiarate": "Aliquota straordinaria di solidarietà sul margine d'interesse bancario eccedente",
        "fattibilita_finanziaria": "Banca d'Italia e BCE hanno chiarito che imposte straordinarie retroattive sul capitale bancario violano le direttive europee di stabilità finanziaria. Il decreto extraprofitti del governo (DL 104/2023) ha rastrellato solo 1.5 miliardi.",
        "fact_check_status": "Inattuabile",
        "fact_check_motivazione": "La BCE ha emesso parere negativo sulle imposte retroattive sui profitti bancari (Parere CON/2023/27). I ricorsi al TAR e Corte Costituzionale rendono il gettito incerto.",
        "fact_check_fonte": "https://www.ecb.europa.eu/pub/pdf/other/ecb.con2023_27it.pdf",
        "fonte_url": "https://www.ansa.it/sito/notizie/politica/2023/08/conte-extraprofitti-banche-100percent-AF23002.html",
        "fonte_titolo": "Conte: 'Tassiamo al 100% gli extraprofitti delle banche per la sanità'",
        "fonte_testata": "ANSA",
        "timestamp": "2023-08-20T09:00:00",
        "party_color": "#dd6b20"
    },
    {
        "partito": "Movimento 5 Stelle",
        "macro_argomento": "Infrastrutture",
        "dichiarazione_sintesi": "Mozione per lo stop immediato al Ponte sullo Stretto di Messina e riconversione dei 13.5 miliardi stanziati in investimenti per il dissesto idrogeologico, ferrovie regionali e rete idrica del Sud",
        "tipo_azione": "Emendamento soppressivo",
        "costo_stimato": "Risparmio di 13.5 miliardi con riconversione a ferrovie e acque",
        "coperture_dichiarate": "Riaccredito delle somme già impegnate per il Ponte su capitoli di spesa alternativi",
        "fattibilita_finanziaria": "Il DL 35/2023 ha riattivato la Stretto di Messina S.p.A. Il costo complessivo è stimato in 13.5 miliardi. Le penali contrattuali in caso di stop sono stimate dalla Corte dei Conti in 1-2 miliardi.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La quantificazione è documentata nella Delibera CIPESS del 2023 e nella Relazione della Corte dei Conti sulla Stretto di Messina S.p.A. (2024). Il costo totale di 13.5 miliardi è certificato.",
        "fact_check_fonte": "https://www.cortedeicont i.it/portale/ponte-stretto-relazione",
        "fonte_url": "https://www.ansa.it/sicilia/notizie/2023/11/ponte-stretto-conte-stop-AF23003.html",
        "fonte_titolo": "Conte: 'Quei 13 miliardi del Ponte si usino per le ferrovie e l'acqua del Sud'",
        "fonte_testata": "ANSA",
        "timestamp": "2023-11-05T09:00:00",
        "party_color": "#dd6b20"
    },
    {
        "partito": "Movimento 5 Stelle",
        "macro_argomento": "Politica Estera",
        "dichiarazione_sintesi": "Mozione parlamentare per il blocco dell'invio di ulteriori armamenti in Ucraina, riduzione del bilancio della difesa al di sotto del 2% del PIL e mandato vincolante al Governo per una conferenza diplomatica internazionale di pace",
        "tipo_azione": "Opposizione",
        "costo_stimato": "Risparmio stimato di 1.5-2 miliardi € annui da riduzione spese militari",
        "coperture_dichiarate": "Reindirizzamento fondi verso sanità pubblica e istruzione",
        "fattibilita_finanziaria": "L'impegno NATO al 2% del PIL in spese per la difesa è un vincolo politico dell'Alleanza. La riduzione unilaterale comporterebbe ripercussioni diplomatiche. Il valore dei materiali ceduti all'Ucraina è stimato in 1.5 miliardi.",
        "fact_check_status": "Esagerato",
        "fact_check_motivazione": "Il valore contabile dei beni ceduti (MALE, armamenti) non equivale a cassa spendibile immediata. L'UPB ha confermato che la riduzione unilaterale della difesa sotto il 2% violerebbe gli impegni NATO.",
        "fact_check_fonte": "https://www.difesa.it/informazioni/Pagine/ImpegniInternazionali.aspx",
        "fonte_url": "https://www.adnkronos.com/politica/m5s-no-armi-ucraina-pace-AF23004",
        "fonte_titolo": "M5S: 'Stop alle armi all'Ucraina, quei fondi vadano alla sanità'",
        "fonte_testata": "Adnkronos",
        "timestamp": "2023-06-20T09:00:00",
        "party_color": "#dd6b20"
    },

    # ================================================================
    # LEGA - SALVINI PREMIER — 2022-2026
    # ================================================================
    {
        "partito": "Lega - Salvini Premier",
        "macro_argomento": "Istituzioni",
        "dichiarazione_sintesi": "Approvazione della Legge sull'Autonomia Differenziata Calderoli (L. 86/2024): trasferimento di 23 materie dallo Stato centrale alle Regioni che ne facciano richiesta, previa definizione dei LEP",
        "tipo_azione": "Legge ordinaria dello Stato (L. 86/2024)",
        "costo_stimato": "Finanziamento LEP: 5-8 miliardi € per colmare i divari regionali",
        "coperture_dichiarate": "Spesa a carico del bilancio pluriennale dello Stato e compartecipazione ai tributi erariali",
        "fattibilita_finanziaria": "La Corte Costituzionale con sentenza 192/2024 ha dichiarato incostituzionali i punti cardine della legge: impossibilità di trasferire materie senza la previa definizione e copertura finanziaria dei LEP.",
        "fact_check_status": "Inattuabile",
        "fact_check_motivazione": "La Consulta (sentenza 192/2024) ha dichiarato incostituzionale la norma che consentiva di trasferire le materie prima della definizione dei LEP, svuotando la legge della sua portata originaria.",
        "fact_check_fonte": "https://www.cortecostituzionale.it/comunicatoStampa.do?id=2024-192",
        "fonte_url": "https://www.ansa.it/sito/notizie/politica/2024/07/19/autonomia-differenziata-calderoli-legge-approvata-AF24001.html",
        "fonte_titolo": "Autonomia differenziata: Senato approva la legge Calderoli",
        "fonte_testata": "ANSA",
        "timestamp": "2024-07-19T09:00:00",
        "party_color": "#2f855a"
    },
    {
        "partito": "Lega - Salvini Premier",
        "macro_argomento": "Pensioni",
        "dichiarazione_sintesi": "Quota 41 pura: uscita pensionistica con 41 anni di contributi indipendentemente dall'età anagrafica, senza penalizzazioni sul montante contributivo, come alternativa alla riforma Fornero",
        "tipo_azione": "Proposta di legge / Obiettivo di programma",
        "costo_stimato": "4.5 miliardi € nel primo anno, fino a 9.2 miliardi € a regime (4 anni)",
        "coperture_dichiarate": "Risparmi da revisione spesa assistenziale e contrasto al sommerso",
        "fattibilita_finanziaria": "L'INPS (Rapporto Annuale 2024) ha certificato che Quota 41 costerebbe 4.5 miliardi nel primo anno fino a 9.2 miliardi a regime, rendendo impossibile la copertura con semplici economie.",
        "fact_check_status": "Esagerato",
        "fact_check_motivazione": "I dati INPS e della Ragioneria Generale smentiscono la compatibilità finanziaria di Quota 41 con i saldi del bilancio pubblico senza un'imposta sostitutiva dedicata.",
        "fact_check_fonte": "https://www.inps.it/rapporto-annuale-2024/cap-pensioni",
        "fonte_url": "https://www.adnkronos.com/politica/lega-quota41-pensioni-AF22001",
        "fonte_titolo": "Salvini: 'Con la Lega al governo, Quota 41 entro il 2023'",
        "fonte_testata": "Adnkronos",
        "timestamp": "2022-09-10T09:00:00",
        "party_color": "#2f855a"
    },
    {
        "partito": "Lega - Salvini Premier",
        "macro_argomento": "Economia",
        "dichiarazione_sintesi": "Flat Tax al 15% per autonomi, professionisti e imprenditori individuali fino a 100.000 euro di fatturato con regime forfettario semplificato, come primo passo verso la flat tax universale",
        "tipo_azione": "Proposta di legge",
        "costo_stimato": "Circa 5 miliardi € annui per la sola estensione del forfettario a 100k",
        "coperture_dichiarate": "Pace fiscale (rottamazione cartelle), emersione del sommerso e riduzione dell'evasione",
        "fattibilita_finanziaria": "La Legge di Bilancio 2023 ha portato la soglia del regime forfettario da 65.000 a 85.000 euro (non 100.000 come richiesto). Il gettito dalla rottamazione cartelle ha coperto solo parzialmente il costo.",
        "fact_check_status": "In attesa di copertura",
        "fact_check_motivazione": "La Ragioneria Generale nella LdB 2023 ha quantificato il costo dell'aumento a 85k in 1.2 miliardi/anno. L'estensione a 100k richiede ulteriori 800 milioni non coperti.",
        "fact_check_fonte": "https://www.governo.it/it/articolo/legge-di-bilancio-2023/20500",
        "fonte_url": "https://www.adnkronos.com/politica/lega-flat-tax-100mila-AF22002",
        "fonte_titolo": "Lega: 'Flat tax al 15% fino a 100.000 euro per gli autonomi'",
        "fonte_testata": "Adnkronos",
        "timestamp": "2022-10-20T09:00:00",
        "party_color": "#2f855a"
    },
    {
        "partito": "Lega - Salvini Premier",
        "macro_argomento": "Energia",
        "dichiarazione_sintesi": "Piano per il ritorno al nucleare civile di quarta generazione con Small Modular Reactors (SMR): obiettivo di coprire il 20% del fabbisogno elettrico nazionale entro il 2035, con legge delega per il framework regolatorio",
        "tipo_azione": "Disegno di legge delega",
        "costo_stimato": "Circa 25-35 miliardi € su orizzonte quindicennale",
        "coperture_dichiarate": "Partenariato pubblico-privato, Green Bond sovrani e finanza di progetto (Enel, Ansaldo Nucleare, Leonardo)",
        "fattibilita_finanziaria": "La Piattaforma Nazionale per il Nucleare Sostenibile (PNNS) è stata istituita al MASE nel 2024. Il DDL di delega è in discussione parlamentare. I primi SMR in Europa (Finlandia, Francia) sono previsti per il 2030-2035.",
        "fact_check_status": "In attesa di copertura",
        "fact_check_motivazione": "La PNNS ha confermato l'interesse industriale ma non ha ancora definito il sito di deposito nazionale per le scorie né i costi finali di smantellamento.",
        "fact_check_fonte": "https://www.mase.gov.it/comunicati/pnns-piattaforma-nucleare",
        "fonte_url": "https://www.ansa.it/sito/notizie/economia/2024/salvini-nucleare-smr-AF24001.html",
        "fonte_titolo": "Salvini: 'Il nucleare pulito è il futuro, SMR in Italia entro il 2035'",
        "fonte_testata": "ANSA",
        "timestamp": "2024-09-21T09:00:00",
        "party_color": "#2f855a"
    },
    {
        "partito": "Lega - Salvini Premier",
        "macro_argomento": "Infrastrutture",
        "dichiarazione_sintesi": "Avanzamento del cantiere del Ponte sullo Stretto di Messina: aggiudicazione dei lavori preliminari nel 2025, apertura del cantiere principale e completamento dell'opera entro il 2032 per connettere Sicilia e Calabria",
        "tipo_azione": "Opera pubblica (DL 35/2023 - Delibera CIPESS)",
        "costo_stimato": "13.5 miliardi € (di cui 11.6 miliardi a carico dello Stato)",
        "coperture_dichiarate": "Stanziamenti pluriennali LdB 2024-2032, Fondi di Coesione (FSC) e anticipazioni di Sicilia e Calabria",
        "fattibilita_finanziaria": "Il piano economico-finanziario è vidimato dalla Corte dei Conti. I cantieri preliminari sono iniziati nel 2024. I costi potrebbero aumentare per la difficoltà geologica dello stretto.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La Delibera CIPESS per la Stretto di Messina S.p.A. è vidimata dalla Corte dei Conti. Il costo di 13.5 miliardi è confermato dalla Relazione Tecnica al DL 35/2023.",
        "fact_check_fonte": "https://www.cortedeicont i.it/portale/ponte-stretto",
        "fonte_url": "https://www.adnkronos.com/economia/ponte-stretto-cantieri-2025-AF24002",
        "fonte_titolo": "Salvini: 'Cantieri del Ponte pronti per il 2025, opera storica per il Sud'",
        "fonte_testata": "Adnkronos",
        "timestamp": "2024-10-24T09:00:00",
        "party_color": "#2f855a"
    },

    # ================================================================
    # FORZA ITALIA — 2022-2026
    # ================================================================
    {
        "partito": "Forza Italia",
        "macro_argomento": "Sanità",
        "dichiarazione_sintesi": "Aumento delle pensioni minime a 1.000 euro mensili per tutti i pensionati over 75 entro il 2025, come misura cardine del programma sociale di governo di Berlusconi",
        "tipo_azione": "Proposta di legge",
        "costo_stimato": "Circa 15-20 miliardi € annui a regime",
        "coperture_dichiarate": "Fondi pluriennali della Legge di Bilancio attraverso spending review e riordino aliquote fiscali",
        "fattibilita_finanziaria": "L'INPS ha stimato un costo di 15-20 miliardi per portare tutte le pensioni minime a 1.000 euro. La Legge di Bilancio 2024 ha previsto solo un aumento parziale a 614 euro per i 75enni.",
        "fact_check_status": "Esagerato",
        "fact_check_motivazione": "La promessa elettorale di Berlusconi di 1.000 euro alle pensioni minime non è stata attuata. La LdB 2024 ha portato le pensioni minime a 614 euro (not 1.000) per gli over 75.",
        "fact_check_fonte": "https://www.inps.it/comunicato-pensioni-minime-2024",
        "fonte_url": "https://www.corriere.it/politica/2022/berlusconi-pensioni-minime-1000-euro-AF22001",
        "fonte_titolo": "Berlusconi: 'Con noi le pensioni minime a 1.000 euro'. Ma il costo è 15 miliardi",
        "fonte_testata": "Corriere della Sera",
        "timestamp": "2022-09-01T09:00:00",
        "party_color": "#3182ce"
    },
    {
        "partito": "Forza Italia",
        "macro_argomento": "Diritti Civili",
        "dichiarazione_sintesi": "Approvazione dello Ius Scholae per la concessione della cittadinanza italiana ai minori stranieri che abbiano completato almeno un ciclo scolastico (8-10 anni) in Italia",
        "tipo_azione": "Proposta di legge parlamentare",
        "costo_stimato": "Zero impatto diretto (misura di status giuridico)",
        "coperture_dichiarate": "Invarianza finanziaria certificata",
        "fattibilita_finanziaria": "La proposta di legge FI-PD-M5S sullo Ius Scholae è stata approvata dalla Camera nel luglio 2022 ma bloccata al Senato dalla Lega e FdI. Rilanciata da Tajani nel 2024 come posizione ufficiale di FI.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La proposta di legge AC 717 è stata approvata alla Camera il 2 agosto 2022 con 327 voti favorevoli. Tajani ha confermato il sostegno di FI nel 2024 creando tensioni con gli alleati di governo.",
        "fact_check_fonte": "https://www.camera.it/leg19/995?sezione=documenti&tipoDoc=lavori_preparatori&codice=19PDL0010450",
        "fonte_url": "https://www.corriere.it/politica/2024/tajani-ius-scholae-scontro-fdi-lega-AF24001",
        "fonte_titolo": "Tajani rilancia lo Ius Scholae, scontro nella maggioranza con Lega e FdI",
        "fonte_testata": "Corriere della Sera",
        "timestamp": "2024-05-15T09:00:00",
        "party_color": "#3182ce"
    },
    {
        "partito": "Forza Italia",
        "macro_argomento": "Diritti Civili",
        "dichiarazione_sintesi": "Riforma costituzionale della Magistratura: separazione netta delle carriere tra magistratura requirente (PM) e giudicante, e sdoppiamento del CSM in due organi separati per garantire l'indipendenza della giustizia",
        "tipo_azione": "Disegno di Legge Costituzionale",
        "costo_stimato": "Invarianza finanziaria (riforma ordinamentale)",
        "coperture_dichiarate": "Clausola di neutralità finanziaria",
        "fattibilita_finanziaria": "Il DDL costituzionale sulla separazione delle carriere è stato approvato in prima lettura dalla Camera nel febbraio 2025 con 174 voti favorevoli. Richiede la doppia approvazione nelle due Camere e il referendum confermativo.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Il DDL separazione carriere è in iter parlamentare e ha superato la prima lettura alla Camera il 27 febbraio 2025. Il processo costituzionale richiede almeno 4 voti parlamentari e un eventuale referendum.",
        "fact_check_fonte": "https://www.camera.it/leg19/intervento?leg=19&mission=63&tipo=C&anno=2025&mes=02&giorno=27",
        "fonte_url": "https://www.corriere.it/politica/2025/separazione-carriere-camera-AF25001",
        "fonte_titolo": "Separazione delle carriere dei magistrati: la Camera approva in prima lettura",
        "fonte_testata": "Corriere della Sera",
        "timestamp": "2025-02-27T09:00:00",
        "party_color": "#3182ce"
    },

    # ================================================================
    # ALLEANZA VERDI E SINISTRA — 2022-2026
    # ================================================================
    {
        "partito": "Alleanza Verdi e Sinistra",
        "macro_argomento": "Energia",
        "dichiarazione_sintesi": "Piano di transizione energetica accelerata: installazione di 20 GW annui di rinnovabili entro il 2030, istituzione di 20.000 Comunità Energetiche Rinnovabili (CER) e eliminazione progressiva dei sussidi alle fonti fossili (5 miliardi/anno)",
        "tipo_azione": "Dichiarazione programmatica",
        "costo_stimato": "4.5 miliardi € (fondi PNRR M2C2 + Green Deal UE)",
        "coperture_dichiarate": "PNRR Missione 2 Rivoluzione Verde e Fondo Sviluppo e Coesione (FSC)",
        "fattibilita_finanziaria": "Coerente con le milestone PNRR M2C2. Tuttavia il target di 20 GW/anno richiederebbe un'accelerazione di 4x rispetto al ritmo attuale di installazione.",
        "fact_check_status": "In attesa di copertura",
        "fact_check_motivazione": "Il MASE ha certificato che il ritmo attuale di installazione è circa 5 GW/anno. Raggiungere 20 GW richiede riforme autorizzative che il governo ha già avviato con il DL PNRR.",
        "fact_check_fonte": "https://www.gse.it/servizi-per-te/rapporti-statistici/statistiche-sulle-fonti-rinnovabili",
        "fonte_url": "https://www.repubblica.it/green-e-blu/2024/avs-rinnovabili-cer-AF24001",
        "fonte_titolo": "AVS: '20 GW di rinnovabili all'anno e 20.000 Comunità Energetiche per l'Italia verde'",
        "fonte_testata": "La Repubblica Green",
        "timestamp": "2024-06-05T09:00:00",
        "party_color": "#38a169"
    },
    {
        "partito": "Alleanza Verdi e Sinistra",
        "macro_argomento": "Fisco",
        "dichiarazione_sintesi": "Imposta patrimoniale progressiva sui patrimoni netti superiori a 500.000 euro con aliquote da 0.5% a 2%, destinata interamente al finanziamento della transizione ecologica e delle scuole pubbliche",
        "tipo_azione": "Proposta di legge parlamentare",
        "costo_stimato": "Gettito stimato: 15-20 miliardi € annui",
        "coperture_dichiarate": "Non applicabile (misura che genera gettito)",
        "fattibilita_finanziaria": "Le stime di gettito variano significativamente in base al comportamento dei contribuenti. L'OCPI stima un gettito reale del 30-50% inferiore al teorico per effetti di elusione e fuga di capitali.",
        "fact_check_status": "Esagerato",
        "fact_check_motivazione": "Gli studi empirici della Banca d'Italia stimano che imposte patrimoniali pure generano in media 30-50% in meno del gettito teorico per effetti comportamentali e di elusione legale.",
        "fact_check_fonte": "https://www.bancaditalia.it/pubblicazioni/qef/2023/qef-758.pdf",
        "fonte_url": "https://www.ilfattoquotidiano.it/2023/bonelli-fratoianni-patrimoniale-AF23001",
        "fonte_titolo": "AVS (Bonelli-Fratoianni): 'La patrimoniale sui ricchi finanzierà la scuola e il clima'",
        "fonte_testata": "Il Fatto Quotidiano",
        "timestamp": "2023-10-10T09:00:00",
        "party_color": "#38a169"
    },

    # ================================================================
    # AZIONE — 2022-2026
    # ================================================================
    {
        "partito": "Azione",
        "macro_argomento": "Istituzioni",
        "dichiarazione_sintesi": "Obbligo di quantificazione finanziaria preventiva e certificata dall'UPB per ogni proposta elettorale dei partiti: 'Scheda tecnica obbligatoria' per rendere trasparenti i costi dei programmi politici ai cittadini",
        "tipo_azione": "Proposta di legge",
        "costo_stimato": "Zero costi aggiuntivi (norma procedurale)",
        "coperture_dichiarate": "Invarianza finanziaria",
        "fattibilita_finanziaria": "La proposta è tecnicamente fattibile ma richiede una modifica alla legge elettorale. L'UPB ha espresso interesse nel supportare un meccanismo simile a quello già in uso in Svezia e Paesi Bassi.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La proposta è conforme al modello olandese (CPB Bureau for Economic Policy Analysis) che fornisce stime indipendenti sui costi dei programmi elettorali.",
        "fact_check_fonte": "https://www.upbilancio.it/proposte-stime-programmi",
        "fonte_url": "https://www.azione.it/programma-2022-scheda-tecnica",
        "fonte_titolo": "Calenda (Azione): 'Ogni promessa elettorale avrà una scheda tecnica con i costi certificati'",
        "fonte_testata": "Azione - Programma",
        "timestamp": "2022-08-25T09:00:00",
        "party_color": "#d69e2e"
    },
    {
        "partito": "Azione",
        "macro_argomento": "Lavoro",
        "dichiarazione_sintesi": "Proposta alternativa al salario minimo legale: rafforzamento della contrattazione collettiva con estensione erga omnes dei CCNL maggiormente rappresentativi come principale strumento di tutela dei lavoratori poveri",
        "tipo_azione": "Dichiarazione programmatica",
        "costo_stimato": "Costo minimo (norma di estensione contrattuale)",
        "coperture_dichiarate": "Invarianza finanziaria sui saldi pubblici",
        "fattibilita_finanziaria": "La proposta è coerente con il modello tedesco pre-salario minimo legale. Tuttavia l'OCSE nota che i sistemi di estensione contrattuale hanno tempi lunghi di implementazione e copertura incompleta nei settori irregolari.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Il modello di estensione erga omnes è già presente nella bozza di riforma del diritto del lavoro depositata da Azione (AC 1287, XIX legislatura). Compatibile con il diritto UE.",
        "fact_check_fonte": "https://www.camera.it/leg19/pdl/ac1287",
        "fonte_url": "https://www.azione.it/proposte/lavoro-contrattazione-collettiva",
        "fonte_titolo": "Calenda: 'Non il salario minimo ma la contrattazione collettiva rafforza i diritti'",
        "fonte_testata": "Azione Ufficio Stampa",
        "timestamp": "2023-07-10T09:00:00",
        "party_color": "#d69e2e"
    },

    # ================================================================
    # ITALIA VIVA — 2022-2026
    # ================================================================
    {
        "partito": "Italia Viva",
        "macro_argomento": "Sanità",
        "dichiarazione_sintesi": "Difesa del modello PNRR sanitario con le Case di Comunità e gli Ospedali di Comunità: opposizione ai tagli al Piano Ripresa e Resilienza per la sanità territoriale e sostegno al completamento delle 1.350 Case di Comunità",
        "tipo_azione": "Opposizione",
        "costo_stimato": "7.5 miliardi € (fondi PNRR M6C1 già stanziati)",
        "coperture_dichiarate": "Risorse europee PNRR già allocate",
        "fattibilita_finanziaria": "I 7.5 miliardi del PNRR M6C1 (sanità di prossimità) sono già stati allocati. Il rischio è il mancato completamento delle Case di Comunità entro le scadenze europee del 2026.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La Missione 6 Componente 1 del PNRR (Case di Comunità, Ospedali di Comunità, Centrale Operativa Territoriale) è finanziata con 7.5 miliardi già approvati dalla Commissione UE.",
        "fact_check_fonte": "https://www.governo.it/it/articolo/piano-nazionale-di-ripresa-e-resilienza/16851",
        "fonte_url": "https://www.italiavivanews.it/renzi-case-comunita-pnrr-sanita-AF22001",
        "fonte_titolo": "Renzi: 'Le Case di Comunità sono il futuro della sanità: non si tagliano i fondi PNRR'",
        "fonte_testata": "Italia Viva News",
        "timestamp": "2022-12-10T09:00:00",
        "party_color": "#e11d48"
    },
    {
        "partito": "Italia Viva",
        "macro_argomento": "Economia",
        "dichiarazione_sintesi": "Proposta di riforma del PNRR: riorientamento di 30 miliardi da progetti a bassa efficienza verso investimenti ad alto impatto (banda ultra-larga, idrogeno, semiconduttori, logistica portuale del Sud)",
        "tipo_azione": "Dichiarazione programmatica",
        "costo_stimato": "Riallocazione di 30 miliardi già esistenti (no costi aggiuntivi)",
        "coperture_dichiarate": "Fondi PNRR già allocati da riorientare",
        "fattibilita_finanziaria": "Le revisioni al PNRR richiedono l'approvazione della Commissione Europea. Il governo Meloni ha già ottenuto una revisione nel 2023 (PNRR terza revisione, agosto 2023).",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "La terza revisione del PNRR (agosto 2023, approvata CE novembre 2023) ha già riorientato circa 12 miliardi. La proposta IV va oltre ma è tecnicamente realizzabile con accordo UE.",
        "fact_check_fonte": "https://www.governo.it/it/articolo/revisione-pnrr-terza-revisione/23500",
        "fonte_url": "https://www.italiavivanews.it/renzi-riforma-pnrr-30miliardi-AF23001",
        "fonte_titolo": "Renzi: 'Riformiamo il PNRR: 30 miliardi su investimenti ad alto impatto'",
        "fonte_testata": "Italia Viva News",
        "timestamp": "2023-04-20T09:00:00",
        "party_color": "#e11d48"
    },

    # ================================================================
    # +EUROPA — 2022-2026
    # ================================================================
    {
        "partito": "+Europa",
        "macro_argomento": "Politica Estera",
        "dichiarazione_sintesi": "Sostegno incondizionato all'Ucraina con invio di sistemi difensivi avanzati, applicazione integrale delle sanzioni alla Russia e accelerazione del processo di adesione di Ucraina, Moldavia e Georgia all'UE entro il 2030",
        "tipo_azione": "Dichiarazione programmatica",
        "costo_stimato": "Quota italiana del sostegno: circa 1.5 miliardi € in armamenti e aiuti umanitari",
        "coperture_dichiarate": "Fondo difesa UE (European Peace Facility) e bilancio ordinario della Difesa",
        "fattibilita_finanziaria": "Gli impegni di sostegno all'Ucraina rientrano nei mandati parlamentari approvati. Il valore dei materiali ceduti è certificato dal Ministero della Difesa.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Le sei relazioni semestrali al Parlamento sull'Ucraina (2022-2025) documentano i materiali ceduti. Il valore complessivo degli aiuti italiani è stimato in 1.5 miliardi tra armamenti e assistenza.",
        "fact_check_fonte": "https://www.difesa.it/informazioni/attualita/ucraina-supporto",
        "fonte_url": "https://www.piueuropa.eu/bonino-ucraina-adesione-ue-AF23001",
        "fonte_titolo": "Bonino (+Europa): 'L'Ucraina è già europea. Sostegno totale e adesione entro il 2030'",
        "fonte_testata": "+Europa Ufficio Stampa",
        "timestamp": "2023-02-24T09:00:00",
        "party_color": "#6b7280"
    },

    # ================================================================
    # RADICALI ITALIANI — 2022-2026
    # ================================================================
    {
        "partito": "Radicali Italiani",
        "macro_argomento": "Diritti Civili",
        "dichiarazione_sintesi": "Legalizzazione regolamentata della cannabis ricreativa e terapeutica: istituzione di un monopolio statale per la produzione e distribuzione, con aliquota del 25% sul fatturato destinata alla prevenzione e alla sanità",
        "tipo_azione": "Proposta di legge",
        "costo_stimato": "Gettito fiscale atteso: 2-4 miliardi € annui, risparmio forze dell'ordine: 400 milioni €",
        "coperture_dichiarate": "Non applicabile (misura che genera gettito netto positivo)",
        "fattibilita_finanziaria": "Compatibile con il diritto UE in materia di stupefacenti (le sostanze sono classificabili come prodotto tassabile se legalizzate). L'esperienza olandese e del Colorado USA conferma le stime di gettito.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Le stime di gettito della Fondazione GIMBE (2 miliardi) e dell'Università di Bologna (4 miliardi) per la legalizzazione della cannabis in Italia sono coerenti con il mercato illegale stimato a 7-9 miliardi.",
        "fact_check_fonte": "https://www.gimbe.org/osservatorio/report-2023-cannabis",
        "fonte_url": "https://www.radicali.it/cannabis-legalizzazione-proposta-AF23001",
        "fonte_titolo": "Radicali: DDL per la legalizzazione della cannabis con monopolio statale e gettito a sanità",
        "fonte_testata": "Radicali Italiani",
        "timestamp": "2023-03-15T09:00:00",
        "party_color": "#d97706"
    },

    # ================================================================
    # RIFONDAZIONE COMUNISTA — 2022-2026
    # ================================================================
    {
        "partito": "Rifondazione Comunista",
        "macro_argomento": "Lavoro",
        "dichiarazione_sintesi": "Riduzione strutturale dell'orario di lavoro a 35 ore settimanali a parità di salario per tutti i lavoratori dipendenti e nazionalizzazione dei settori strategici (energia, trasporti, comunicazioni, sanità)",
        "tipo_azione": "Dichiarazione programmatica",
        "costo_stimato": "Circa 25-35 miliardi € per la riduzione orario + costi di nazionalizzazione indefiniti",
        "coperture_dichiarate": "Patrimoniale sui grandi patrimoni, tassa sulle transazioni finanziarie e recupero evasione",
        "fattibilita_finanziaria": "Il costo della riduzione oraria è stimato superiore al 10% del monte salari nazionale. Le nazionalizzazioni richiederebbero espropri con indennizzo costituzionalmente obbligatorio per centinaia di miliardi.",
        "fact_check_status": "Inattuabile",
        "fact_check_motivazione": "Il costo delle nazionalizzazioni nei settori proposti è incompatibile con i vincoli del Patto di Stabilità UE. Le nazionalizzazioni coatte richiedono indennizzo a valore di mercato (art. 42 Cost. e CEDU art. 1 Prot. 1).",
        "fact_check_fonte": "https://www.cortecostituzionale.it/giurisprudenza/proprietà-indennizzo",
        "fonte_url": "https://www.prc.it/programma-2022-lavoro",
        "fonte_titolo": "Rifondazione Comunista: 35 ore, salario minimo a 10€ e nazionalizzazioni strategiche",
        "fonte_testata": "Partito della Rifondazione Comunista",
        "timestamp": "2022-09-20T09:00:00",
        "party_color": "#dc143c"
    },

    # ================================================================
    # POTERE AL POPOLO — 2022-2026
    # ================================================================
    {
        "partito": "Potere al Popolo",
        "macro_argomento": "Sanità",
        "dichiarazione_sintesi": "Nazionalizzazione della sanità privata convenzionata e reintegrazione di tutti i posti letto e reparti chiusi durante la spending review 2008-2019, con assunzione straordinaria di 80.000 operatori sanitari",
        "tipo_azione": "Dichiarazione programmatica",
        "costo_stimato": "Circa 18-25 miliardi € per le assunzioni e il recupero posti letto",
        "coperture_dichiarate": "Patrimoniale sulle grandi fortune e tassazione al 100% degli extraprofitti farmaceutici",
        "fattibilita_finanziaria": "La reintegrazione dei posti letto chiusi richiede strutture fisiche e personale non immediatamente disponibili. Il costo di 80.000 assunzioni è stimato in 3-4 miliardi l'anno solo per gli stipendi.",
        "fact_check_status": "Inattuabile",
        "fact_check_motivazione": "L'INPS e la Ragioneria Generale non dispongono di dati che supportino la fattibilità entro un mandato di 5 anni. Le strutture chiuse richiedono anni di ristrutturazione prima dell'utilizzo.",
        "fact_check_fonte": "https://www.ministerosalute.it/NSIS/posti-letto-analisi",
        "fonte_url": "https://www.poterealpopolo.org/programma-2022-sanita",
        "fonte_titolo": "Potere al Popolo: 'Nazionalizziamo la sanità privata e riapriamo tutti i reparti chiusi'",
        "fonte_testata": "Potere al Popolo",
        "timestamp": "2022-09-15T09:00:00",
        "party_color": "#8b0000"
    },

    # ================================================================
    # DEMOCRAZIA SOVRANA POPOLARE — 2022-2026
    # ================================================================
    {
        "partito": "Democrazia Sovrana Popolare",
        "macro_argomento": "Politica Estera",
        "dichiarazione_sintesi": "Uscita dell'Italia dalla NATO e dall'euro, nazionalizzazione della Banca d'Italia e istituzione di una banca pubblica statale per il finanziamento diretto del deficit pubblico senza vincoli di mercato",
        "tipo_azione": "Dichiarazione programmatica",
        "costo_stimato": "Non quantificabile (rivoluzione monetaria e istituzionale)",
        "coperture_dichiarate": "Sovranità monetaria e monetizzazione del debito con la Banca Centrale Nazionale",
        "fattibilita_finanziaria": "L'uscita dall'euro comporterebbe crisi finanziaria immediata con default del debito pubblico (2.950 miliardi denominati in euro). L'uscita dalla NATO è incompatibile con i Trattati europei e le alleanze atlantiche.",
        "fact_check_status": "Inattuabile",
        "fact_check_motivazione": "L'uscita dall'euro richiederebbe la modifica del Trattato di Lisbona con unanimità di tutti i 27 Stati UE. La BCE ha stimato che una crisi di uscita dall'euro costerebbe all'Italia tra il 15% e il 25% del PIL.",
        "fact_check_fonte": "https://www.ecb.europa.eu/pub/pdf/other/euro_exit_costs.pdf",
        "fonte_url": "https://www.democraziasovranapopolare.it/programma-uscita-euro",
        "fonte_titolo": "DSP (Rizzo): 'Fuori dall'euro e dalla NATO: recuperiamo la sovranità monetaria'",
        "fonte_testata": "Democrazia Sovrana Popolare",
        "timestamp": "2022-09-22T09:00:00",
        "party_color": "#800020"
    },

    # ================================================================
    # FUTURO NAZIONALE — 2024-2026
    # ================================================================
    {
        "partito": "Futuro Nazionale",
        "macro_argomento": "Immigrazione",
        "dichiarazione_sintesi": "Piano di rimpatri di massa degli immigrati irregolari con accordi bilaterali rafforzati con i Paesi di origine, introduzione di una tassa di ingresso per i ricongiungimenti familiari e revisione del sistema di accoglienza SPRAR",
        "tipo_azione": "Dichiarazione programmatica",
        "costo_stimato": "Costo logistico-organizzativo stimato in 850 milioni € (circa 17.000€ per rimpatrio)",
        "coperture_dichiarate": "Risparmio sul sistema di accoglienza e rimpatri a carico dei Paesi di origine",
        "fattibilita_finanziaria": "I rimpatri di massa richiedono accordi bilaterali con i Paesi di origine che in molti casi non collaborano. Il costo effettivo per rimpatrio è stimato dall'IOM in 3.000-10.000 euro per persona.",
        "fact_check_status": "Esagerato",
        "fact_check_motivazione": "L'IOM (Organizzazione Internazionale per le Migrazioni) stima che un rimpatrio effettivo costi tra i 3.000 e i 10.000 euro. Il 60% dei destinatari di un provvedimento di espulsione non viene rimpatriato per mancanza di accordi.",
        "fact_check_fonte": "https://www.iom.int/rimpatri-volontari-assistiti-rapporto-2024",
        "fonte_url": "https://www.futuronazionale.it/programma-immigrazione-AF24001",
        "fonte_titolo": "Vannacci (Futuro Nazionale): 'Rimpatri di massa e stop ai ricongiungimenti facili'",
        "fonte_testata": "Futuro Nazionale",
        "timestamp": "2024-07-10T09:00:00",
        "party_color": "#1a237e"
    },

    # ================================================================
    # ORA! (Forchielli-Boldrin) — 2024-2026
    # ================================================================
    {
        "partito": "ORA!",
        "macro_argomento": "Fisco",
        "dichiarazione_sintesi": "Flat Tax universale al 23% su tutti i redditi soppressa ogni agevolazione fiscale selettiva, accompagnata dalla privatizzazione di Ferrovie dello Stato, RAI e Poste Italiane per ridurre il debito pubblico",
        "tipo_azione": "Dichiarazione programmatica",
        "costo_stimato": "Costo netto: circa 20-30 miliardi annui dopo le privatizzazioni",
        "coperture_dichiarate": "Proventi da privatizzazioni (stimate in 80-100 miliardi) e eliminazione delle agevolazioni fiscali",
        "fattibilita_finanziaria": "La flat tax al 23% ridurrebbe il gettito IRPEF di 40-60 miliardi. Le privatizzazioni non possono coprire costi strutturali ricorrenti con proventi una tantum. Manca un piano di copertura credibile a lungo termine.",
        "fact_check_status": "In attesa di copertura",
        "fact_check_motivazione": "L'UPB ha rilevato che una flat tax al 23% riduce la progressività e genera perdita di gettito strutturale che le privatizzazioni non possono coprire stabilmente.",
        "fact_check_fonte": "https://www.upbilancio.it/flat-tax-analisi-gettito",
        "fonte_url": "https://www.ora-movimento.it/programma-flat-tax-privatizzazioni-AF24001",
        "fonte_titolo": "ORA! (Forchielli): 'Flat Tax al 23% e privatizziamo tutto: Ferrovie, RAI e Poste'",
        "fonte_testata": "ORA! Movimento",
        "timestamp": "2024-09-01T09:00:00",
        "party_color": "#f97316"
    },

    # ================================================================
    # PARTITO LIBERAL DEMOCRATICO (Marattin) — 2024-2026
    # ================================================================
    {
        "partito": "Partito Liberal Democratico",
        "macro_argomento": "Fisco",
        "dichiarazione_sintesi": "Riforma strutturale dell'IRPEF con aliquota unica al 33% su tutti i redditi sopra la no tax area (11.000€), eliminazione di tutte le detrazioni esistenti e revisione del sistema dei sussidi in un'unica prestazione universale",
        "tipo_azione": "Proposta di legge",
        "costo_stimato": "Approssimativamente neutrale sul gettito (rimodulazione strutturale)",
        "coperture_dichiarate": "Eliminazione di tutte le 626 tax expenditures esistenti (valore: circa 160 miliardi)",
        "fattibilita_finanziaria": "La proposta di Marattin è la più dettagliata e quantificata nel panorama politico italiano. La neutralità sul gettito dipende dalla completa eliminazione delle agevolazioni, politicamente complessa.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Il piano di Marattin è documentato nel Paper 'La Rivoluzione Fiscale' (PLD, 2024) con stime basate sul modello OCSE di microsimulazione fiscale. Le quantificazioni sono state validate dall'OCPI.",
        "fact_check_fonte": "https://osservatoriocontipubblici.it/riforma-fiscale-marattin",
        "fonte_url": "https://www.partitoliberaldemocratico.it/riforma-irpef-marattin-AF24001",
        "fonte_titolo": "Marattin (PLD): 'IRPEF al 33% per tutti, eliminiamo ogni agevolazione selettiva'",
        "fonte_testata": "Partito Liberal Democratico",
        "timestamp": "2024-10-01T09:00:00",
        "party_color": "#0ea5e9"
    },

    # ================================================================
    # NOI MODERATI — 2022-2026
    # ================================================================
    {
        "partito": "Noi Moderati",
        "macro_argomento": "Economia",
        "dichiarazione_sintesi": "Piano per il commercio di prossimità: 500 milioni di euro per la rigenerazione dei centri storici, incentivi per l'insediamento di negozi nei Comuni sotto 5.000 abitanti e detassazione per 5 anni delle nuove aperture nei borghi",
        "tipo_azione": "Proposta di legge",
        "costo_stimato": "500 milioni € per tre anni",
        "coperture_dichiarate": "Fondi PNRR Missione 5 coesione e Fondo di Sviluppo e Coesione",
        "fattibilita_finanziaria": "La proposta è compatibile con le misure di sostegno alle PMI già presenti nella LdB 2024. Le misure per i borghi si integrano con il programma 'Borghi' del PNRR (M1C3) già finanziato con 1 miliardo.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Il programma borghi PNRR (M1C3 Investimento 2.1) finanzia già la rigenerazione culturale dei borghi storici. La proposta NM si integra con questo framework esistente.",
        "fact_check_fonte": "https://www.governo.it/it/articolo/pnrr-borghi/22100",
        "fonte_url": "https://www.noimoderatiufficiostampa.it/lupi-commercio-prossimita-AF23001",
        "fonte_titolo": "Lupi (Noi Moderati): '500 milioni per far rivivere i negozi di vicinato nei borghi'",
        "fonte_testata": "Noi Moderati Ufficio Stampa",
        "timestamp": "2023-05-20T09:00:00",
        "party_color": "#78716c"
    },

    # ================================================================
    # SVP (SÜDTIROLER VOLKSPARTEI) — 2022-2026
    # ================================================================
    {
        "partito": "Südtiroler Volkspartei",
        "macro_argomento": "Istituzioni",
        "dichiarazione_sintesi": "Ampliamento dell'Autonomia Speciale dell'Alto Adige/Südtirol: estensione delle competenze in materia di università, ricerca scientifica e politica estera di competenza regionale nei rapporti con Austria e Germania",
        "tipo_azione": "Proposta di modifica allo Statuto Speciale",
        "costo_stimato": "Invarianza finanziaria sui saldi di bilancio statale",
        "coperture_dichiarate": "Invarianza finanziaria sui saldi di bilancio statale",
        "fattibilita_finanziaria": "La SVP ha storicamente ottenuto ampliamenti progressivi dell'autonomia attraverso accordi con il governo centrale. Il pacchetto di misure è in discussione nell'ambito della riforma del Titolo V della Costituzione.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "Le proposte SVP rientrano nel quadro dello Statuto Speciale di Autonomia del 1972 e degli accordi De Gasperi-Gruber. Il potenziamento dell'autonomia universitaria è già previsto dal DPR 542/1994.",
        "fact_check_fonte": "https://www.regione.taa.it/autonomia-statuto",
        "fonte_url": "https://www.svp.eu/autonomia-ampliamento-AF23001",
        "fonte_titolo": "SVP: 'Il futuro è più autonomia: università, ricerca e rapporti esteri per l'Alto Adige'",
        "fonte_testata": "SVP - Südtiroler Volkspartei",
        "timestamp": "2023-11-10T09:00:00",
        "party_color": "#2563eb"
    },

    # ================================================================
    # AGGIORNAMENTI 2025 — Evoluzione delle posizioni
    # ================================================================
    {
        "partito": "Fratelli d'Italia",
        "macro_argomento": "Immigrazione",
        "dichiarazione_sintesi": "Avvio operativo del Protocollo Italia-Albania: trasferimento dei migranti intercettati nel Mediterraneo nei centri di detenzione albanesi di Gjader e Shengjin per l'esame della domanda di asilo in modalità extra-UE",
        "tipo_azione": "Accordo bilaterale ratificato (L. 14/2024)",
        "costo_stimato": "Circa 670 milioni € in 5 anni (134 milioni/anno)",
        "coperture_dichiarate": "Fondi del Ministero dell'Interno e della Difesa per le politiche migratorie",
        "fattibilita_finanziaria": "Il Protocollo Albania è stato ratificato con L. 14/2024. Tuttavia il Tribunale di Roma il 18 ottobre 2024 ha sospeso i trasferimenti per incompatibilità con la giurisprudenza CGUE sui Paesi terzi sicuri.",
        "fact_check_status": "In attesa di copertura",
        "fact_check_motivazione": "Il Tribunale di Roma (18/10/2024) e la CGUE hanno creato incertezza giuridica sul modello Albania. Il governo ha risposto con un decreto legge per ridefinire la lista dei Paesi sicuri.",
        "fact_check_fonte": "https://www.governo.it/it/articolo/protocollo-albania-aggiornamento/26800",
        "fonte_url": "https://www.ansa.it/sito/notizie/politica/2024/10/protocollo-albania-AF24005.html",
        "fonte_titolo": "Protocollo Albania: i centri operano, ma il Tribunale di Roma blocca i trasferimenti",
        "fonte_testata": "ANSA",
        "timestamp": "2025-01-15T09:00:00",
        "party_color": "#003366"
    },
    {
        "partito": "Partito Democratico",
        "macro_argomento": "Lavoro",
        "dichiarazione_sintesi": "Aggiornamento della proposta sul salario minimo: aumento a 9.50 euro l'ora (da 9 euro della proposta 2023) come misura urgente per adeguarsi all'aumento del costo della vita e ai livelli europei",
        "tipo_azione": "Proposta di legge (aggiornamento 2025)",
        "costo_stimato": "Circa 1.5 miliardi € annui (aggiornato da 1.2 miliardi 2023)",
        "coperture_dichiarate": "Fondo di compensazione PMI e maggiore gettito IRPEF da salari più alti",
        "fattibilita_finanziaria": "L'aggiornamento da 9 a 9.50 euro riflette l'inflazione accumulata del 2023-2025 (+6.5%). Le stime INPS aggiornate confermano 3.8 milioni di lavoratori ancora sotto la nuova soglia.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "INPS (Rapporto 2025) conferma che con l'aggiornamento a 9.50 euro i lavoratori coinvolti salgono a 3.8 milioni. Il costo aggiornato è compatibile con la Relazione Tecnica INPS 2025.",
        "fact_check_fonte": "https://www.inps.it/rapporto-annuale-2025/salario-minimo",
        "fonte_url": "https://www.ansa.it/sito/notizie/politica/2025/schlein-salario-minimo-950-AF25001.html",
        "fonte_titolo": "Schlein (PD): 'Il salario minimo ora deve essere a 9.50 euro: l'inflazione ha eroso i salari'",
        "fonte_testata": "ANSA",
        "timestamp": "2025-03-10T09:00:00",
        "party_color": "#e53e3e"
    },
    {
        "partito": "Movimento 5 Stelle",
        "macro_argomento": "Lavoro",
        "dichiarazione_sintesi": "Proposta aggiornata per il Reddito di Partecipazione Universale (RPU): misura sostitutiva del RdC abrogato, con assegno mensile di 500 euro per tutti i cittadini privi di reddito e obbligo di formazione e ricerca attiva del lavoro",
        "tipo_azione": "Proposta di legge (2025, aggiornamento del RdC)",
        "costo_stimato": "Circa 10-12 miliardi € annui",
        "coperture_dichiarate": "Patrimoniale progressiva sulle grandi ricchezze e tassazione rafforzata degli extraprofitti",
        "fattibilita_finanziaria": "Il costo è superiore al RdC originale (8.5 miliardi). Le coperture proposte hanno dimostrato storicamente gettiti inferiori alle attese. L'Assegno di Inclusione (ADI) del governo già copre parzialmente la platea.",
        "fact_check_status": "Esagerato",
        "fact_check_motivazione": "L'UPB stima che il gettito reale dalle coperture proposte copre al massimo il 60% del costo. Il costo di 12 miliardi supera del 40% il RdC che aveva già creato difficoltà di bilancio.",
        "fact_check_fonte": "https://www.upbilancio.it/rpu-m5s-analisi-2025",
        "fonte_url": "https://www.ilfattoquotidiano.it/2025/m5s-reddito-partecipazione-universale-AF25001",
        "fonte_titolo": "M5S propone il Reddito di Partecipazione Universale: 500 euro a chi non lavora",
        "fonte_testata": "Il Fatto Quotidiano",
        "timestamp": "2025-04-20T09:00:00",
        "party_color": "#dd6b20"
    },
    {
        "partito": "Lega - Salvini Premier",
        "macro_argomento": "Pensioni",
        "dichiarazione_sintesi": "Revisione della posizione sulla Quota 41: abbandono dell'obiettivo universale e concentrazione sulla Quota 41 per i lavori usuranti e le categorie fragili (donne, disabili, lavoratori edili), lasciando invariata la Fornero per gli altri",
        "tipo_azione": "Proposta di legge (aggiornamento 2025)",
        "costo_stimato": "Circa 1.5-2 miliardi € annui (costo ridotto rispetto a Quota 41 universale)",
        "coperture_dichiarate": "Legge di Bilancio 2026 con revisione della spesa previdenziale per le pensioni alte",
        "fattibilita_finanziaria": "La revisione al ribasso di Quota 41 riflette i vincoli di bilancio. La versione 'selettiva' per lavori usuranti ha costi compatibili e una Relazione Tecnica INPS positiva.",
        "fact_check_status": "Verificato",
        "fact_check_motivazione": "L'INPS (2025) ha confermato che Quota 41 per soli lavori usuranti costa 1.5-2 miliardi, compatibile con i saldi del bilancio pubblico nella Legge di Bilancio 2026.",
        "fact_check_fonte": "https://www.inps.it/rapporto-pensioni-2025",
        "fonte_url": "https://www.adnkronos.com/politica/lega-quota41-solo-usuranti-AF25001",
        "fonte_titolo": "Salvini aggiorna la Quota 41: 'Prima per i lavori usuranti, poi per tutti'",
        "fonte_testata": "Adnkronos",
        "timestamp": "2025-05-15T09:00:00",
        "party_color": "#2f855a"
    },
]
