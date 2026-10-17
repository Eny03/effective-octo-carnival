# Configuration of monitored political RSS feeds, official institutions, and media sources

MONITORED_FEEDS = [
    {
        "name": "ANSA Politica & Istituzioni",
        "url": "https://www.ansa.it/sito/ansait_rss.xml",
        "category": "Agenzia Nazionale",
        "reliability": "Alta",
        "is_active": True
    },
    {
        "name": "Il Sole 24 Ore - Politica & Economia",
        "url": "https://www.ilsole24ore.com/rss/italia--politica.xml",
        "category": "Finanza & Istituzioni",
        "reliability": "Alta",
        "is_active": True
    },
    {
        "name": "Adnkronos Politica",
        "url": "https://www.adnkronos.com/feed/politica.xml",
        "category": "Agenzia Nazionale",
        "reliability": "Alta",
        "is_active": True
    },
    {
        "name": "RaiNews Politica",
        "url": "https://www.rainews.it/rss/politica.xml",
        "category": "Servizio Pubblico",
        "reliability": "Alta",
        "is_active": True
    }
]

# Party detection aliases to accurately map textual mentions to normalized party codes
PARTY_ALIASES = {
    "Fratelli d'Italia": ["fratelli d'italia", "fdi", "giorgia meloni", "meloni", "crosetto", "lollobrigida", "donzelli"],
    "Partito Democratico": ["partito democratico", "pd", "elly schlein", "schlein", "provenzano", "boccia", "braga"],
    "Movimento 5 Stelle": ["movimento 5 stelle", "m5s", "giuseppe conte", "conte", "cinquestelle", "5 stelle", "appendino", "patuanelli"],
    "Lega - Salvini Premier": ["lega", "lega - salvini premier", "matteo salvini", "salvini", "giorgetti", "calderoli", "crippa", "fedriga"],
    "Forza Italia": ["forza italia", "fi", "antonio tajani", "tajani", "barelli", "ronzulli", "gasparri", "berlusconi"],
    "Alleanza Verdi e Sinistra": ["alleanza verdi e sinistra", "alleanza verdi sinistra", "avs", "verdi e sinistra", "angelo bonelli", "nicola fratoianni", "bonelli", "fratoianni", "europa verde", "sinistra italiana"],
    "Azione": ["azione", "carlo calenda", "calenda", "marattin", "gelmini", "carfagna", "benzoni"],
    "Italia Viva": ["italia viva", "iv", "matteo renzi", "renzi", "boschi", "faraone", "marattin"],
    "+Europa": ["+europa", "più europa", "piu europa", "riccardo magi", "magi", "emma bonino", "bonino", "della vedova"]
}

# Macro-topics detection keywords
MACRO_TOPICS_KEYWORDS = {
    "Lavoro": ["salario minimo", "lavoro", "occupazione", "cuneo fiscale", "contratti", "inps", "disoccupazione", "precariato", "stage", "settimana corta", "pensioni", "quota 41", "fornero"],
    "Economia": ["fisco", "tasse", "flat tax", "irpef", "iva", "manovra", "patrimoniale", "debito pubblico", "pil", "def", "extraprofitti", "privatizzazioni", "bilancio", "inflazione", "superbonus"],
    "Energia": ["nucleare", "rinnovabili", "eolico", "fotovoltaico", "gas", "smr", "bollette", "caro energia", "transizione energetica", "idrogeno", "mase", "trivelle"],
    "Ambiente": ["clima", "siccità", "inquinamento", "co2", "decarbonizzazione", "green deal", "dissesto idrogeologico", "sad", "biodiversità", "auto elettriche"],
    "Sanità": ["sanità", "ssn", "medici", "infermieri", "ospedali", "liste d'attesa", "pronto soccorso", "fondo sanitario", "mes sanitario", "ticket"],
    "Istruzione": ["scuola", "università", "docenti", "insegnanti", "istruzione", "its", "ricerca", "stipendi docenti", "tempo pieno", "valditara", "maturità"],
    "Diritti Civili": ["diritti civili", "giustizia", "magistrati", "csm", "separazione delle carriere", "ius scholae", "cittadinanza", "carceri", "fine vita", "matrimonio egualitario", "adozioni"],
    "Esteri": ["ucraina", "russia", "medio oriente", "gaza", "israele", "nato", "spese militari", "difesa europea", "eurobond", "piano mattei", "europa", "ue", "politica estera"]
}
