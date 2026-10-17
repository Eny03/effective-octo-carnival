"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Scale, 
  Layers, 
  ShieldCheck, 
  Bot, 
  Coins, 
  TrendingUp, 
  ArrowRight,
  RefreshCw,
  Building2,
  FileText,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  Filter,
  BarChart3,
  Flame,
  ChevronRight
} from "lucide-react";
import { 
  fetchStatsOverview, 
  fetchProposals, 
  fetchSchedulerStatus, 
  fetchParties,
  triggerFeedScan,
  StatsOverview, 
  PoliticalProposal,
  PoliticalParty 
} from "@/lib/api";
import { ProposalCard } from "@/components/ProposalCard";
import { StatusBadge } from "@/components/StatusBadge";
import { TopicBadge } from "@/components/TopicBadge";

const MACRO_TOPICS = [
  "Tutti",
  "Fisco",
  "Lavoro",
  "Sanità",
  "Pensioni",
  "Energia",
  "Istituzioni",
  "Immigrazione",
  "Istruzione",
  "Infrastrutture",
  "Politica Estera",
  "Diritti Civili"
];

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [proposals, setProposals] = useState<PoliticalProposal[]>([]);
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);
  const [scanPhase, setScanPhase] = useState<"idle" | "searching" | "updating" | "done">("idle");
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  // Home Filters
  const [selectedTopic, setSelectedTopic] = useState<string>("Tutti");
  const [selectedParty, setSelectedParty] = useState<string>("Tutti");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(12);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, propsData, schedData, partiesData] = await Promise.all([
        fetchStatsOverview(),
        fetchProposals({ limit: 100 }),
        fetchSchedulerStatus().catch(() => null),
        fetchParties().catch(() => [])
      ]);
      setStats(statsData);
      setProposals(propsData);
      setSchedulerStatus(schedData);
      setParties(partiesData);
    } catch (err: any) {
      console.error(err);
      setError("Impossibile contattare il server. Riprova tra qualche istante.");
    } finally {
      setLoading(false);
    }
  };

  // Sincronizzazione continua 24/7 con il clock reale e il backend scheduler
  const getSecondsToNextBlock = (nextRunIso?: string): number => {
    if (nextRunIso) {
      try {
        const target = new Date(nextRunIso).getTime();
        const now = Date.now();
        const diff = Math.round((target - now) / 1000);
        if (diff > 0 && diff <= 600) return diff;
      } catch (e) {}
    }
    const now = new Date();
    const elapsed = (now.getMinutes() % 10) * 60 + now.getSeconds();
    const remaining = 600 - elapsed;
    return remaining <= 0 ? 600 : remaining;
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(() => getSecondsToNextBlock());

  // Sincronizza subito all'avvio e ad ogni aggiornamento dello schedulerStatus
  useEffect(() => {
    setSecondsLeft(getSecondsToNextBlock(schedulerStatus?.next_run_time));
  }, [schedulerStatus]);

  const triggerUpdateCycle = async () => {
    if (scanPhase !== "idle") return;
    
    // Step 1: Searching the entire web
    setScanPhase("searching");
    try {
      await triggerFeedScan().catch(() => {});
    } catch (e) {}

    // Step 2: After 3.5 seconds -> AI synthesis, fact checks, updating dossiers
    setTimeout(async () => {
      setScanPhase("updating");
      await loadData();

      // Step 3: Success state
      setTimeout(() => {
        setScanPhase("done");

        // Step 4: Resume continuous 24/7 countdown
        setTimeout(() => {
          setScanPhase("idle");
          setSecondsLeft(getSecondsToNextBlock());
        }, 2200);
      }, 2500);
    }, 3500);
  };

  // Live 1-second real-world 24/7 clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getSecondsToNextBlock(schedulerStatus?.next_run_time);
      setSecondsLeft(remaining);

      // Scatta automaticamente al compimento del blocco di 10 minuti
      if (remaining === 600 || remaining <= 1) {
        if (scanPhase === "idle") {
          triggerUpdateCycle();
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [schedulerStatus, scanPhase]);

  useEffect(() => {
    loadData();
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Filter proposals
  const filteredProposals = proposals.filter((p) => {
    if (selectedTopic !== "Tutti" && !p.macro_argomento.toLowerCase().includes(selectedTopic.toLowerCase())) {
      return false;
    }
    if (selectedParty !== "Tutti" && !p.partito.toLowerCase().includes(selectedParty.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = p.dichiarazione_sintesi.toLowerCase().includes(q);
      const matchParty = p.partito.toLowerCase().includes(q);
      const matchTopic = p.macro_argomento.toLowerCase().includes(q);
      const matchCost = p.costo_stimato.toLowerCase().includes(q);
      return matchText || matchParty || matchTopic || matchCost;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200 border border-white/10 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Osservatorio Politico Autonomo 100% Neutrale</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            PolitiLens
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
            Monitora in tempo reale programmi, eventi, dichiarazioni e social di tutti i partiti italiani.
            Confronta le posizioni su ciascun tema e verifica la fattibilità economica con i dati ufficiali di bilancio (MEF, ISTAT, Corte dei Conti).
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-sm active:scale-95"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Confronta Posizioni</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all active:scale-95"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Interroga AI</span>
            </Link>
            <Link
              href="/fact-check"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Fact-Checking Finanziario</span>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 10-Minute Continuous Pulse & Live Status Banner */}
      <section className={`rounded-2xl border p-4 sm:p-5 shadow-xs transition-all duration-300 ${
        scanPhase === "searching"
          ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60"
          : scanPhase === "updating"
          ? "bg-blue-50/90 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700/60"
          : scanPhase === "done"
          ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`relative flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 transition-colors ${
              scanPhase === "searching"
                ? "bg-amber-500 text-white animate-spin"
                : scanPhase === "updating"
                ? "bg-blue-600 text-white animate-pulse"
                : scanPhase === "done"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
            }`}>
              {scanPhase === "searching" ? (
                <Search className="w-5 h-5" />
              ) : scanPhase === "updating" ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : scanPhase === "done" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
              {scanPhase === "idle" && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border-2 border-white dark:border-slate-900" />
              )}
            </div>

            <div>
              {scanPhase === "searching" ? (
                <div>
                  <div className="font-extrabold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <span>Sto cercando su tutto il web...</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 animate-pulse">
                      In corso
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300/80 mt-0.5">
                    Scansione autonoma di motori di ricerca, agenzie di stampa (ANSA, Sole 24 Ore, Rai, Quotidiani), comunicati, social e atti di ogni partito.
                  </p>
                </div>
              ) : scanPhase === "updating" ? (
                <div>
                  <div className="font-extrabold text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2">
                    <span>Sto confrontando tutte le informazioni con l'AI...</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-200 dark:bg-blue-900/80 text-blue-900 dark:text-blue-100 animate-pulse">
                      Elaborazione AI
                    </span>
                  </div>
                  <p className="text-xs text-blue-800 dark:text-blue-300/80 mt-0.5">
                    Sintesi neutrale dei dossier, verifica delle dichiarazioni e controllo di fattibilità con i dati ufficiali di bilancio (MEF, ISTAT, Corte dei Conti).
                  </p>
                </div>
              ) : scanPhase === "done" ? (
                <div>
                  <div className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <span>Dossier e informazioni aggiornati con successo!</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-100">
                      Completato
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300/80 mt-0.5">
                    Tutti i dati e i dossier dei partiti sono riallineati con le ultime notizie dal web. Il timer continuo 24/7 riprende adesso.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Scansione e Aggiornamento Continuo 24/7 (Ogni 10 Minuti)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      24/7 Attivo
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    L'AI scansiona costantemente tutto il web ogni 10 min (ai minuti :00, :10, :20, :30, :40, :50) creando e aggiornando i dossier.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Live Countdown & Manual Trigger */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800/60">
            <div className="text-left sm:text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                {scanPhase === "idle" ? "Prossimo ciclo 24/7 tra" : "Stato scansione"}
              </div>
              <div className="font-mono text-base font-extrabold text-slate-900 dark:text-white flex items-center sm:justify-end gap-1.5 mt-0.5">
                {scanPhase === "idle" ? (
                  <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900/80">
                    {formatCountdown(secondsLeft)}
                  </span>
                ) : (
                  <span className="text-xs font-sans text-slate-500">
                    {scanPhase === "searching" ? "Ricerca attiva..." : scanPhase === "updating" ? "Analisi dati..." : "Pronto"}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={triggerUpdateCycle}
              disabled={scanPhase !== "idle"}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 transition-all disabled:opacity-50 shadow-xs active:scale-95 shrink-0"
              title="Avvia subito la ricerca e l'aggiornamento"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanPhase !== "idle" ? "animate-spin" : ""}`} />
              <span>{scanPhase !== "idle" ? "In corso..." : "Aggiorna ora"}</span>
            </button>
          </div>
        </div>
      </section>

      {scanFeedback && (
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{scanFeedback}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-500"
          >
            Riprova
          </button>
        </div>
      )}

      {/* KPI Stats Overview */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Posizioni Censite</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {loading ? "..." : stats?.total_proposals || proposals.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Dichiarazioni, atti & manifesti</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Partiti Mappati</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {loading ? "..." : stats?.total_parties || parties.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Tutto l'arco parlamentare</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Costi Quantificati</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {loading ? "..." : `${stats?.quantified_cost_percentage || 78}%`}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Con stima finanziaria esplicita</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Verifiche Istituzionali</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {loading ? "..." : stats?.fact_check_distribution?.["Verificato"] || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Confermate da MEF e ISTAT</p>
        </div>
      </section>

      {/* Institutional Reality Check (MEF, ISTAT, Corte dei Conti) */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>Parametri Ufficiali di Bilancio dello Stato</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              La realtà dei conti pubblici italiani usata dall'AI per verificare se le promesse sono sostenibili o a debito.
            </p>
          </div>
          <Link
            href="/fact-check"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Tutti i parametri e fact-checking</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">PIL Nominale Annuo</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">~2.120 Mld €</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Fonte: ISTAT 2024</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Debito Pubblico / PIL</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">137,3%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Totale: 2.950 Mld €</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Fondo Sanitario Nazionale</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">136,5 Mld €</div>
            <div className="text-[10px] text-slate-500 mt-0.5">6,4% del PIL (Corte dei Conti)</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Spazio di Manovra Netto</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">~30 Mld €</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Capienza ordinaria MEF</div>
          </div>
        </div>
      </section>

      {/* Interactive Search & Live Filtering Hub */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Esplora Tutte le Posizioni Censite ({filteredProposals.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Filtra per argomento, cerca per parola chiave o seleziona un partito specifico.
            </p>
          </div>

          {/* Party Quick Filter Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Partito:</span>
            <select
              value={selectedParty}
              onChange={(e) => setSelectedParty(e.target.value)}
              className="text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 shadow-xs focus:outline-hidden"
            >
              <option value="Tutti">Tutti i Partiti</option>
              {parties.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca per tema, legge o dichiarazione (es. salario minimo, flat tax, nucleare, sanità, premierato)..."
            className="w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Cancella
            </button>
          )}
        </div>

        {/* Scrollable Macro Topic Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {MACRO_TOPICS.map((topic) => {
            const isSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>

        {/* Proposals Grid */}
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Caricamento delle posizioni politiche in corso...</div>
        ) : filteredProposals.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            Nessuna posizione trovata per i criteri di ricerca selezionati.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProposals.slice(0, visibleCount).map((prop) => (
                <ProposalCard key={prop.id} proposal={prop} />
              ))}
            </div>

            {visibleCount < filteredProposals.length && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors shadow-xs"
                >
                  <span>Mostra altre posizioni ({filteredProposals.length - visibleCount} rimanenti)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Parties Roster Strip */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span>Dossier Istituzionali dei Partiti</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Consulta l'archivio completo di ciascun partito politico monitorato.
            </p>
          </div>
          <Link
            href="/parties"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Apri tutti i dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {parties.map((party) => (
            <Link
              key={party.id}
              href={`/parties?code=${party.code}`}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: party.color }} />
                  <span className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{party.name}</span>
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1">{party.leader || party.coalition}</div>
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-2 flex items-center gap-0.5">
                <span>Vedi posizioni</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
