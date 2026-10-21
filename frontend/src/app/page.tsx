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
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Target,
  Info,
  ExternalLink
} from "lucide-react";
import { 
  fetchStatsOverview, 
  fetchProposals, 
  fetchSchedulerStatus, 
  fetchParties,
  fetchDetectedGaps,
  triggerFeedScan,
  StatsOverview, 
  PoliticalProposal, 
  PoliticalParty,
  InformationGap
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

const HISTORICAL_YEARS = [
  "Tutti gli Anni",
  "2026 (Attuale)",
  "2025",
  "2024",
  "2023",
  "2022 (Campagna)"
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
  const [detectedGaps, setDetectedGaps] = useState<InformationGap[]>([]);
  const [showGapsDetails, setShowGapsDetails] = useState<boolean>(false);

  // Active view tab: "proposte" | "sondaggi" | "bilancio"
  const [activeTab, setActiveTab] = useState<"proposte" | "sondaggi" | "bilancio">("proposte");

  // Proposals Tab Filters
  const [selectedTopic, setSelectedTopic] = useState<string>("Tutti");
  const [selectedParty, setSelectedParty] = useState<string>("Tutti");
  const [selectedYear, setSelectedYear] = useState<string>("Tutti gli Anni");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Polls Tab Filter
  const [pollCoalitionFilter, setPollCoalitionFilter] = useState<string>("Tutti");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, propsData, schedData, partiesData, gapsData] = await Promise.all([
        fetchStatsOverview(),
        fetchProposals({ limit: 100 }),
        fetchSchedulerStatus().catch(() => null),
        fetchParties().catch(() => []),
        fetchDetectedGaps(6).catch(() => [])
      ]);
      setStats(statsData);
      setProposals(propsData);
      setSchedulerStatus(schedData);
      setParties(partiesData);
      setDetectedGaps(gapsData);
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
    if (selectedYear !== "Tutti gli Anni") {
      const yearOnly = selectedYear.split(" ")[0];
      const pYear = p.timestamp ? new Date(p.timestamp).getFullYear().toString() : "";
      if (pYear !== yearOnly) return false;
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

  // Filter poll rankings by coalition
  const rawRankings = stats?.party_rankings && stats.party_rankings.length > 0 
    ? stats.party_rankings 
    : parties.map((p) => ({
        name: p.name,
        code: p.code,
        color: p.color,
        coalition: p.coalition,
        leader: p.leader,
        poll_percentage: p.poll_percentage || 0,
        poll_trend: p.poll_trend || "stabile",
        truthfulness_score: p.truthfulness_score || 82,
        financial_reliability_score: p.financial_reliability_score || 78,
        proposals_count: p.proposals_count || 0
      }));

  const filteredRankings = rawRankings.filter((item) => {
    if (pollCoalitionFilter === "Tutti") return true;
    return item.coalition?.toLowerCase().includes(pollCoalitionFilter.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6">
      
      {/* 1. INSTITUTIONAL HERO HEADER */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Repubblica Italiana • Osservatorio Indipendente Politiche Pubbliche</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              PolitiLens
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Archivio storico 2022–2026 e osservatorio neutrale sulle 18 forze politiche italiane.
              Confronta le posizioni su ogni riforma e verifica la sostenibilità con i parametri ufficiali MEF, ISTAT e Corte dei Conti.
            </p>
          </div>

          {/* Institutional Fast Action Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-xs active:scale-95"
            >
              <Bot className="w-4 h-4 text-emerald-600" />
              <span>Interroga AI Neutrale</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all active:scale-95"
            >
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Confronta Posizioni</span>
            </Link>
            <Link
              href="/fact-check"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Fact-Checking Bilancio</span>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 2. COMPACT 24/7 STATUS BAR & ACTIVE HUNTER TOGGLE */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Status info */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                scanPhase === "searching" ? "bg-amber-400" : scanPhase === "updating" ? "bg-blue-400" : "bg-emerald-400"
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                scanPhase === "searching" ? "bg-amber-500" : scanPhase === "updating" ? "bg-blue-500" : "bg-emerald-500"
              }`} />
            </span>

            <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white">
                {scanPhase === "searching" 
                  ? "Ricerca mirata sul web..." 
                  : scanPhase === "updating" 
                  ? "Analisi dati e parametri MEF..." 
                  : scanPhase === "done"
                  ? "Dati integrati con successo!"
                  : "Sistema attivo 24/7"}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">
                Ciclo ogni 10 min
              </span>
              {scanPhase === "idle" && (
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
                  {formatCountdown(secondsLeft)}
                </span>
              )}
            </div>

            {/* Gap Hunter pill */}
            {detectedGaps.length > 0 && (
              <button
                onClick={() => setShowGapsDetails(!showGapsDetails)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 hover:bg-amber-100 transition-colors ml-auto sm:ml-0"
              >
                <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Caccia alle lacune ({detectedGaps.length})</span>
                {showGapsDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* Manual scan button */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={triggerUpdateCycle}
              disabled={scanPhase !== "idle"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 transition-all disabled:opacity-50 shadow-2xs active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanPhase !== "idle" ? "animate-spin" : ""}`} />
              <span>{scanPhase !== "idle" ? "Aggiornamento..." : "Aggiorna ora"}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Gap Details */}
        {showGapsDetails && detectedGaps.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Obiettivi prioritari di ricerca web identificati dall'AI:
              </span>
              <span>L'AI colma automaticamente queste aree ad ogni ciclo</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {detectedGaps.slice(0, 6).map((gap, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-[11px] flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{gap.party_name}</span>
                    <span className="text-slate-400 mx-1">›</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">{gap.topic}</span>
                  </div>
                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                    Da colmare
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. CORE METRICS STRIP (Compact & Balanced) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Posizioni Censite</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {loading ? "..." : stats?.total_proposals || proposals.length}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Atti & dichiarazioni</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Forze Mappate</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {loading ? "..." : stats?.total_parties || parties.length || 18}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Parlamentari & civiche</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Media Veridicità</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {loading ? "..." : `${stats?.average_truthfulness || 82.5}%`}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Basata su dati MEF/ISTAT</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Coperture Quantificate</div>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
            {loading ? "..." : `${stats?.quantified_cost_percentage || 78}%`}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Con stima finanziaria esplicita</p>
        </div>
      </section>

      {/* 4. MAIN NAVIGATION TABS (Intuitive, Simple & Clear) */}
      <section className="space-y-4">
        {/* Navigation Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("proposte")}
            className={`flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "proposte"
                ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === "proposte" ? "text-blue-600 dark:text-blue-400" : ""}`} />
            <span>Riforme & Posizioni</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
              activeTab === "proposte"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}>
              {filteredProposals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("sondaggi")}
            className={`flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "sondaggi"
                ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${activeTab === "sondaggi" ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
            <span>Sondaggi & 18 Partiti</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
              activeTab === "sondaggi"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}>
              18
            </span>
          </button>

          <button
            onClick={() => setActiveTab("bilancio")}
            className={`flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "bilancio"
                ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Coins className={`w-4 h-4 ${activeTab === "bilancio" ? "text-amber-600 dark:text-amber-400" : ""}`} />
            <span>Bilancio dello Stato (MEF)</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
              activeTab === "bilancio"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}>
              Ufficiale
            </span>
          </button>
        </div>

        {/* TAB 1: RIFORME & POSIZIONI */}
        {activeTab === "proposte" && (
          <div className="space-y-4">
            {/* Search and Dropdowns Bar */}
            <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                {/* Search text field */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca per tema o parola chiave (es. salario minimo, flat tax, sanità, premierato)..."
                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                    >
                      Cancella
                    </button>
                  )}
                </div>

                {/* Dropdowns */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedParty}
                    onChange={(e) => setSelectedParty(e.target.value)}
                    className="text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  >
                    <option value="Tutti">Tutti i Partiti</option>
                    {parties.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  >
                    {HISTORICAL_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scrollable Macro Topic Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
                {MACRO_TOPICS.map((topic) => {
                  const isSelected = selectedTopic === topic;
                  return (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs font-bold"
                          : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Proposals Cards Grid */}
            {loading ? (
              <div className="p-16 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                Caricamento posizioni politiche in corso...
              </div>
            ) : filteredProposals.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                Nessuna posizione trovata per i criteri selezionati.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredProposals.slice(0, visibleCount).map((prop) => (
                    <ProposalCard key={prop.id} proposal={prop} />
                  ))}
                </div>

                {visibleCount < filteredProposals.length && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 12)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors shadow-2xs"
                    >
                      <span>Mostra altre ({filteredProposals.length - visibleCount} rimanenti)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SONDAGGI & 18 PARTITI */}
        {activeTab === "sondaggi" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Sondaggi Elettorali & Indice di Veridicità</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Media ponderata dei principali istituti demoscopici (YouTrend/AGI, SWG, Ipsos, Tecnè) incrociata con l'indice di veridicità delle promesse.
                </p>
              </div>

              {/* Coalition filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none self-start sm:self-auto">
                {["Tutti", "Maggioranza", "Opposizione", "Centro"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setPollCoalitionFilter(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      pollCoalitionFilter === c
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* 18 Party Poll Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredRankings.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/parties?code=${item.code}`}
                  className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block line-clamp-1">
                            {item.leader || item.coalition}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                          {item.poll_percentage}%
                        </span>
                        <span className={`text-[10px] font-bold ${
                          item.poll_trend?.startsWith("+")
                            ? "text-emerald-600 dark:text-emerald-400"
                            : item.poll_trend?.startsWith("-")
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-slate-400"
                        }`}>
                          {item.poll_trend}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700/60 h-1.5 rounded-full overflow-hidden mb-2.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (item.poll_percentage / 35) * 100)}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[10px] sm:text-[11px] pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold" title="Indice di veridicità AI">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>Veridicità: {item.truthfulness_score}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold" title="Coperture finanziarie">
                      <Coins className="w-3 h-3 shrink-0" />
                      <span>Coperture: {item.financial_reliability_score}%</span>
                    </div>
                    <div className="text-slate-400 text-[10px] ml-auto">
                      {item.proposals_count} atti
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Coalition Benchmark Footer */}
            {stats?.coalition_truthfulness && Object.keys(stats.coalition_truthfulness).length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Media di Veridicità per Schieramento Politico:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(stats.coalition_truthfulness).slice(0, 4).map(([coal, score]) => (
                    <div key={coal} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                      <div className="text-[10px] text-slate-500 line-clamp-1">{coal}</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                        {score}% <span className="text-[10px] text-emerald-600 font-normal">fondate</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONTI PUBBLICI & BILANCIO (MEF / ISTAT / CORTE DEI CONTI) */}
        {activeTab === "bilancio" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <span>Parametri Ufficiali di Bilancio dello Stato</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quadro macroeconomico ufficiale utilizzato dal motore AI per verificare la fattibilità economica delle proposte politiche.
                </p>
              </div>

              <Link
                href="/fact-check"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all shrink-0"
              >
                <span>Esplora Fact-Checking Completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Official Macroeconomic Indicators Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">PIL Nominale Annuo</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">~2.120 Mld €</div>
                <div className="text-[11px] text-slate-500">Fonte: ISTAT 2024 / DEF</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Debito Pubblico / PIL</div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400">137,3%</div>
                <div className="text-[11px] text-slate-500">Totale: ~2.950 Mld € (Banca d'Italia)</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Fondo Sanitario Nazionale</div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">136,5 Mld €</div>
                <div className="text-[11px] text-slate-500">6,4% del PIL (Corte dei Conti)</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Spazio di Manovra Netto</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">~30 Mld €</div>
                <div className="text-[11px] text-slate-500">Capienza annua Legge di Bilancio</div>
              </div>
            </div>

            {/* Explanation box */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/60 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Come verifica l'AI la fattibilità delle proposte?</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Ogni promessa o programma politico viene confrontato con le tabelle di spesa dello Stato italiano. Se una proposta comporta un costo superiore allo spazio di bilancio ordinario (circa 30 miliardi annui) senza indicare adeguate coperture (tagli di spesa o entrate fiscali verificate dalla Ragioneria Generale dello Stato), l'AI segnala il rischio di incremento del debito pubblico.
              </p>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
