"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  ExternalLink,
  Percent,
  SlidersHorizontal
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  Cell,
  LabelList 
} from "recharts";
import { 
  fetchStatsOverview, 
  fetchProposals, 
  fetchSchedulerStatus, 
  fetchParties,
  fetchDetectedGaps,
  triggerFeedScan,
  triggerPollUpdate,
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

const CURRENT_YEAR = new Date().getFullYear();
const HISTORICAL_YEARS = [
  "Tutti i Periodi",
  `${CURRENT_YEAR} (In corso / Live)`,
  "Posizioni Recenti (2024–2025)",
  "Sviluppi Futuri / DDL"
];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [proposals, setProposals] = useState<PoliticalProposal[]>([]);
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);
  const [scanPhase, setScanPhase] = useState<"idle" | "searching" | "updating" | "done">("idle");
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);
  const [updatingPolls, setUpdatingPolls] = useState<boolean>(false);
  const [pollFeedback, setPollFeedback] = useState<string | null>(null);
  const [detectedGaps, setDetectedGaps] = useState<InformationGap[]>([]);
  const [lastPollTime, setLastPollTime] = useState<string>("");

  const [showGapsDetails, setShowGapsDetails] = useState<boolean>(false);

  // Active view tab synced with URL param: "proposte" | "sondaggi"
  const urlTab = (searchParams.get("tab") as "proposte" | "sondaggi") || "proposte";
  const [activeTab, setActiveTabState] = useState<"proposte" | "sondaggi">(urlTab);

  // Proposals Tab Filters synced with URL
  const initialTopic = searchParams.get("topic") || "Tutti";
  const initialParty = searchParams.get("party") || "Tutti";
  const initialYear = searchParams.get("year") || "Tutti i Periodi";
  const initialQ = searchParams.get("q") || "";

  const [selectedTopic, setSelectedTopicState] = useState<string>(initialTopic);
  const [selectedParty, setSelectedPartyState] = useState<string>(initialParty);
  const [selectedYear, setSelectedYearState] = useState<string>(initialYear);
  const [searchQuery, setSearchQueryState] = useState<string>(initialQ);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Polls Tab Filter
  const [pollCoalitionFilter, setPollCoalitionFilter] = useState<string>("Tutti");

  // Helper to sync state to URL
  const updateURL = (paramsToUpdate: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    for (const [key, value] of Object.entries(paramsToUpdate)) {
      if (value === null || value === "Tutti" || value === "Tutti i Periodi" || value === "Tutti gli Anni" || value === "") {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    }
    const search = current.toString();
    const query = search ? `?${search}` : "";
    startTransition(() => {
      router.replace(`/${query}`, { scroll: false });
    });
  };

  const setActiveTab = (tab: "proposte" | "sondaggi") => {
    setActiveTabState(tab);
    updateURL({ tab: tab === "proposte" ? null : tab });
  };

  const setSelectedTopic = (topic: string) => {
    setSelectedTopicState(topic);
    updateURL({ topic });
  };

  const setSelectedParty = (party: string) => {
    setSelectedPartyState(party);
    updateURL({ party });
  };

  const setSelectedYear = (year: string) => {
    setSelectedYearState(year);
    updateURL({ year });
  };

  const setSearchQuery = (q: string) => {
    setSearchQueryState(q);
    updateURL({ q });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, propsData, schedData, partiesData, gapsData] = await Promise.all([
        fetchStatsOverview(),
        fetchProposals({ limit: 120 }),
        fetchSchedulerStatus().catch(() => null),
        fetchParties().catch(() => []),
        fetchDetectedGaps(4)
      ]);
      setStats(statsData);
      setProposals(propsData);
      setSchedulerStatus(schedData);
      setParties(partiesData);
      setDetectedGaps(gapsData);
    } catch (err: any) {
      console.error(err);
      setError("Impossibile caricare i dati della dashboard. Verifica la connessione al server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setLastPollTime(new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));

    // Automated 10-minute polling update via internet search
    const pollInterval = setInterval(async () => {
      try {
        await triggerPollUpdate();
        const [statsData, partiesData] = await Promise.all([
          fetchStatsOverview(),
          fetchParties()
        ]);
        setStats(statsData);
        setParties(partiesData);
        setLastPollTime(new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
      } catch (err) {
        console.error("Auto poll interval notice:", err);
      }
    }, 600000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleTriggerScan = async () => {
    try {
      setScanPhase("searching");
      setScanFeedback("Scansione autonoma del web avviata in background...");
      await triggerFeedScan();
      setTimeout(async () => {
        setScanPhase("updating");
        setScanFeedback("Consensus Multi-AI e aggiornamento dossier in corso...");
        setTimeout(async () => {
          await loadData();
          setScanPhase("done");
          setScanFeedback("Aggiornamento completato con successo!");
          setTimeout(() => {
            setScanPhase("idle");
            setScanFeedback(null);
          }, 3500);
        }, 1500);
      }, 1500);
    } catch (e) {
      setScanPhase("idle");
      setScanFeedback("Errore nell'avvio della scansione.");
    }
  };

  const handleUpdatePolls = async () => {
    try {
      setUpdatingPolls(true);
      setPollFeedback(null);
      const res = await triggerPollUpdate();
      setPollFeedback(res.message);
      const [statsData, partiesData] = await Promise.all([
        fetchStatsOverview(),
        fetchParties()
      ]);
      setStats(statsData);
      setParties(partiesData);
      setLastPollTime(new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
    } catch (e: any) {
      setPollFeedback("Errore durante l'aggiornamento dei sondaggi.");
    } finally {
      setUpdatingPolls(false);
    }
  };

  // Filter proposals
  const filteredProposals = proposals.filter((p) => {
    if (selectedTopic !== "Tutti" && p.macro_argomento !== selectedTopic) return false;
    if (selectedParty !== "Tutti" && !p.partito.toLowerCase().includes(selectedParty.toLowerCase())) return false;
    if (selectedYear !== "Tutti i Periodi" && selectedYear !== "Tutti gli Anni") {
      const pYear = p.timestamp ? new Date(p.timestamp).getFullYear() : 0;
      if (selectedYear.includes("Sviluppi Futuri")) {
        if (pYear < CURRENT_YEAR) return false;
      } else if (!selectedYear.includes(pYear.toString())) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (p.dichiarazione_sintesi + " " + p.partito + " " + p.macro_argomento).toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Filter rankings for polls
  const filteredRankings = (stats?.party_rankings || []).filter((item) => {
    if (pollCoalitionFilter === "Tutti") return true;
    if (pollCoalitionFilter === "Maggioranza") return item.coalition.toLowerCase().includes("centrodestra");
    if (pollCoalitionFilter === "Opposizione") return item.coalition.toLowerCase().includes("centrosinistra") || item.coalition.toLowerCase().includes("opposizione");
    if (pollCoalitionFilter === "Centro") return item.coalition.toLowerCase().includes("centro") || item.coalition.toLowerCase().includes("terzo polo");
    return true;
  });

  // Recharts Poll Data (Pure Electoral Polls - NO coperture)
  const pollChartData = filteredRankings.slice(0, 10).map((p) => {
    const partyMatch = parties.find((party) => party.code === p.code || party.name === p.name);
    return {
      name: p.code || p.name.slice(0, 8),
      fullName: p.name,
      poll: p.poll_percentage,
      trend: p.poll_trend || partyMatch?.poll_trend || "stabile",
      sources: partyMatch?.poll_sources || "Media YouTrend/SWG/Ipsos",
      color: p.color
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* 1. HERO BANNER (Light, Clean & High-End Editorial Style) */}
      <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-2xs">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Piattaforma Civica in Continua Evoluzione Autonoma</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            PoliticLens: Idee Politiche in Tempo Reale, Trasparenza e Fatti Verificati.
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            Osservatorio indipendente e neutrale: monitoraggio in tempo reale e in continuo aggiornamento autonomo per permettere a tutti i cittadini di osservare le idee politiche, confrontarle e verificarne la sostenibilità economica.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
            >
              <Bot className="w-4 h-4" />
              <span>Interroga il Chatbot RAG Stream</span>
            </Link>

            <Link
              href="/compare"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition-all"
            >
              <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Manifesto Dinamico 2D</span>
            </Link>

            <button
              onClick={handleTriggerScan}
              disabled={scanPhase !== "idle"}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all disabled:opacity-50 ml-auto"
              title="Avvia scansione continua dei feed e del web"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanPhase !== "idle" ? "animate-spin text-blue-600" : ""}`} />
              <span className="hidden sm:inline">Scansione AI Live</span>
            </button>
          </div>

          {scanFeedback && (
            <div className="mt-2 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 px-3 py-1.5 rounded-xl animate-fadeIn">
              {scanFeedback}
            </div>
          )}
        </div>
      </section>


      {/* 2. STATS OVERVIEW CARDS (WITH SKELETONS) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs animate-pulse space-y-2">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-2 w-32 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
          ))
        ) : (
          <>
            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Posizioni Censite</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {stats?.total_proposals || proposals.length}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Atti parlamentari & dichiarazioni</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Forze Mappate</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {stats?.total_parties || parties.length || 18}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Parlamentari & civiche</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Media Veridicità</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {stats?.average_truthfulness !== undefined ? `${stats.average_truthfulness}%` : "--%"}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Fact-checking: aderenza a dati e fatti reali</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Coperture Economiche</div>
              <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                {stats?.quantified_cost_percentage !== undefined ? `${stats.quantified_cost_percentage}%` : "--%"}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Proposte con fonti di finanziamento indicate</p>
            </div>

          </>
        )}
      </section>

      {/* 3. MAIN NAVIGATION TABS */}
      <section className="space-y-4">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("proposte")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "proposte"
                ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === "proposte" ? "text-blue-600 dark:text-blue-400" : ""}`} />
            <span>Riforme & Posizioni</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {filteredProposals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("sondaggi")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "sondaggi"
                ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${activeTab === "sondaggi" ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
            <span>Sondaggi & Grafici</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Recharts
            </span>
          </button>
        </div>


        {/* TAB 1: RIFORME & POSIZIONI */}
        {activeTab === "proposte" && (
          <div className="space-y-4">
            {/* Filter Controls Bar */}
            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca per tema o parola chiave (es. salario minimo, flat tax, sanità)..."
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

                <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
                  <select
                    value={selectedParty}
                    onChange={(e) => setSelectedParty(e.target.value)}
                    className="w-full min-w-0 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 sm:px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-medium truncate"
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
                    className="w-full min-w-0 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 sm:px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-hidden font-medium truncate"
                  >
                    {HISTORICAL_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic chips - Wraps cleanly on Desktop PC and Mobile */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                  Macro-Tema:
                </span>
                {MACRO_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                      selectedTopic === topic
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Proposals Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs animate-pulse p-4 space-y-3">
                    <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800/60 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredProposals.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
                <p className="text-sm font-semibold">Nessuna proposta trovata con i filtri selezionati.</p>
                <button
                  onClick={() => {
                    setSelectedTopic("Tutti");
                    setSelectedParty("Tutti");
                    setSelectedYear("Tutti gli Anni");
                    setSearchQuery("");
                  }}
                  className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  Resetta tutti i filtri
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredProposals.slice(0, visibleCount).map((prop) => (
                  <ProposalCard key={prop.id} proposal={prop} />
                ))}
              </div>
            )}

            {filteredProposals.length > visibleCount && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-xs"
                >
                  Carica altre proposte ({filteredProposals.length - visibleCount} rimanenti)
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SONDAGGI (INTENZIONI DI VOTO PURE - SENZA COPERTURE) */}
        {activeTab === "sondaggi" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Barometro Elettorale Nazionale: Intenzioni di Voto</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Media ponderata dei sondaggi elettorali (YouTrend/AGI, SWG Tg La7, Ipsos, Tecnè) aggiornata costantemente via web crawler.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                  {["Tutti", "Maggioranza", "Opposizione", "Centro"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setPollCoalitionFilter(c)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        pollCoalitionFilter === c
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleUpdatePolls}
                  disabled={updatingPolls}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors disabled:opacity-50"
                  title="Aggiorna le percentuali dei sondaggi interrogando le ultime fonti web"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${updatingPolls ? "animate-spin" : ""}`} />
                  <span>{updatingPolls ? "Ricerca Web in corso..." : "Aggiorna Ora"}</span>
                </button>
              </div>
            </div>

            {/* 10-Minute Auto Crawler Status Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>Aggiornamento automatico attivo ogni 10 minuti tramite ricerche web continue</span>
              </div>
              <div className="text-[11px] text-emerald-800 dark:text-emerald-400 font-mono">
                Ultimo check demoscopico: <strong>{lastPollTime || "In tempo reale"}</strong>
              </div>
            </div>

            {pollFeedback && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
                <span>{pollFeedback}</span>
                <Link href="/audit" className="font-bold underline ml-2">
                  Vedi Registro Modifiche
                </Link>
              </div>
            )}

            {/* Pure Electoral Polls Chart (Only Voting % - NO coperture) */}
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pollChartData}
                  margin={{ top: 25, right: 15, left: -15, bottom: 35 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    interval={0} 
                    angle={-20} 
                    textAnchor="end" 
                    tick={{ fontSize: 11, fontWeight: 600, fill: "#64748b" }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} unit="%" domain={[0, 'dataMax + 4']} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-xl text-xs space-y-2 border border-slate-700 min-w-[210px]">
                            <div className="font-bold text-sm flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: data.color }} />
                              <span>{data.fullName}</span>
                            </div>
                            <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
                              <span className="text-slate-400 text-xs">Intenzioni di Voto:</span>
                              <span className="text-lg font-black text-white font-mono">{data.poll}%</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Trend Settimanale:</span>
                              <span className={`font-bold px-1.5 py-0.2 rounded ${
                                data.trend?.includes("+")
                                  ? "bg-emerald-950 text-emerald-400"
                                  : data.trend?.includes("-")
                                  ? "bg-rose-950 text-rose-400"
                                  : "bg-slate-800 text-slate-300"
                              }`}>
                                {data.trend || "stabile"}
                              </span>
                            </div>
                            {data.sources && (
                              <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800 leading-tight">
                                {data.sources}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="poll" name="Percentuale di Voto (%)" radius={[8, 8, 0, 0]}>
                    {pollChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "#3b82f6"} />
                    ))}
                    <LabelList dataKey="poll" position="top" formatter={(val: any) => `${val}%`} className="text-[11px] font-bold fill-slate-700 dark:fill-slate-200" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Polls Cards Grid (Clean Electoral View - NO coperture) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {filteredRankings.map((item, idx) => {
                const partyMatch = parties.find((p) => p.code === item.code || p.name === item.name);
                const trendStr = item.poll_trend || partyMatch?.poll_trend || "stabile";
                const sourceStr = partyMatch?.poll_sources || "Media mobile YouTrend / SWG / Ipsos";
                
                return (
                  <Link
                    key={idx}
                    href={`/parties?code=${item.code}`}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group shadow-2xs hover:shadow-xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: item.color }} />
                          <div className="min-w-0">
                            <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug block">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-tight">
                              {item.coalition}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-black text-slate-900 dark:text-white font-mono leading-none">
                            {item.poll_percentage}%
                          </div>
                          <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded mt-1 ${
                            trendStr.includes("+")
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400"
                              : trendStr.includes("-")
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {trendStr}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 leading-tight">
                      {sourceStr}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        <div className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
