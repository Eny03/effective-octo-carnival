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
  Calculator,
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
  Cell 
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
  "Tutti gli Anni",
  ...Array.from({ length: Math.max(1, CURRENT_YEAR - 2022 + 1) }, (_, i) => {
    const y = CURRENT_YEAR - i;
    if (y === CURRENT_YEAR) return `${y} (In corso)`;
    if (y === 2022) return `${y} (Campagna Fondativa)`;
    return `${y}`;
  }),
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

  const [showGapsDetails, setShowGapsDetails] = useState<boolean>(false);

  // Active view tab synced with URL param: "proposte" | "sondaggi" | "bilancio"
  const urlTab = (searchParams.get("tab") as "proposte" | "sondaggi" | "bilancio") || "proposte";
  const [activeTab, setActiveTabState] = useState<"proposte" | "sondaggi" | "bilancio">(urlTab);

  // Proposals Tab Filters synced with URL
  const initialTopic = searchParams.get("topic") || "Tutti";
  const initialParty = searchParams.get("party") || "Tutti";
  const initialYear = searchParams.get("year") || "Tutti gli Anni";
  const initialQ = searchParams.get("q") || "";

  const [selectedTopic, setSelectedTopicState] = useState<string>(initialTopic);
  const [selectedParty, setSelectedPartyState] = useState<string>(initialParty);
  const [selectedYear, setSelectedYearState] = useState<string>(initialYear);
  const [searchQuery, setSearchQueryState] = useState<string>(initialQ);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Polls Tab Filter
  const [pollCoalitionFilter, setPollCoalitionFilter] = useState<string>("Tutti");

  // State Budget Simulator State
  const [simAmount, setSimAmount] = useState<number>(5.0); // 5 Mld € default
  const [simUnit, setSimUnit] = useState<"mld" | "mln">("mld");

  // Helper to sync state to URL
  const updateURL = (paramsToUpdate: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    for (const [key, value] of Object.entries(paramsToUpdate)) {
      if (value === null || value === "Tutti" || value === "Tutti gli Anni" || value === "") {
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

  const setActiveTab = (tab: "proposte" | "sondaggi" | "bilancio") => {
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
    if (selectedYear !== "Tutti gli Anni") {
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

  // Recharts Poll Data
  const pollChartData = filteredRankings.slice(0, 10).map((p) => ({
    name: p.code || p.name.slice(0, 10),
    fullName: p.name,
    poll: p.poll_percentage,
    truth: p.truthfulness_score,
    reliability: p.financial_reliability_score,
    color: p.color
  }));

  // Budget calculations
  const simAmountMld = simUnit === "mld" ? simAmount : simAmount / 1000;
  const pctSSN = ((simAmountMld / 136.5) * 100).toFixed(1);
  const pctManovra = ((simAmountMld / 30.0) * 100).toFixed(1);
  const pctPIL = ((simAmountMld / 2120.0) * 100).toFixed(2);
  const pctIstruzione = ((simAmountMld / 78.0) * 100).toFixed(1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* 1. HERO BANNER (Light, Clean & High-End Editorial Style) */}
      <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-2xs">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Piattaforma di Intelligence Politico-Economica Autonoma</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            PolitiLens: Trasparenza, Coperture e Fatti Verificati.
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            Monitoraggio continuo degli atti parlamentari, programmi elettorali partendo dal 2022 in poi con aggiornamento costante verso gli sviluppi futuri e verifica delle coperture con parametri ufficiali del <strong>MEF</strong>, <strong>ISTAT</strong> e <strong>Corte dei Conti</strong>.
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
              <p className="text-[10px] text-slate-500 mt-0.5">Parametri MEF / ISTAT</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Coperture Quantificate</div>
              <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                {stats?.quantified_cost_percentage !== undefined ? `${stats.quantified_cost_percentage}%` : "--%"}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Atti formali con Relazione Tecnica MEF</p>
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

          <button
            onClick={() => setActiveTab("bilancio")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "bilancio"
                ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Coins className={`w-4 h-4 ${activeTab === "bilancio" ? "text-amber-600 dark:text-amber-400" : ""}`} />
            <span>Simulatore Bilancio</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              MEF / UPB
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

              {/* Topic chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
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

        {/* TAB 2: SONDAGGI CON RECHARTS */}
        {activeTab === "sondaggi" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Confronto Sondaggi & Affidabilità Finanziaria</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consenso elettorale calcolato dal PollTrackerAgent (YouTrend, SWG, Ipsos, Tecnè) affiancato all'indice di copertura economica MEF.
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
                  title="Aggiorna le percentuali dei sondaggi con le ultime rilevazioni demoscopiche"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${updatingPolls ? "animate-spin" : ""}`} />
                  <span>{updatingPolls ? "Aggiornamento..." : "Aggiorna Sondaggi AI"}</span>
                </button>
              </div>
            </div>

            {pollFeedback && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
                <span>{pollFeedback}</span>
                <Link href="/audit" className="font-bold underline ml-2">
                  Vedi Log Modifiche
                </Link>
              </div>
            )}

            {/* Interactive Recharts Graph */}
            <div className="h-80 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pollChartData}
                  margin={{ top: 10, right: 15, left: -15, bottom: 35 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    interval={0} 
                    angle={-25} 
                    textAnchor="end" 
                    tick={{ fontSize: 10, fill: "#64748b" }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} unit="%" />
                  <Tooltip
                    content={({ active, payload }) => {

                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg text-xs space-y-1 border border-slate-700">
                            <div className="font-bold text-sm flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                              <span>{data.fullName}</span>
                            </div>
                            <div>Sondaggi: <strong>{data.poll}%</strong></div>
                            <div>Veridicità AI: <strong className="text-emerald-400">{data.truth}%</strong></div>
                            <div>Coperture di Bilancio: <strong className="text-amber-400">{data.reliability}%</strong></div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="poll" name="Percentuale Sondaggio (%)" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                    {pollChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "#3b82f6"} />
                    ))}
                  </Bar>
                  <Bar dataKey="reliability" name="Affidabilità Coperture (%)" fill="#10b981" radius={[6, 6, 0, 0]} opacity={0.65} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {filteredRankings.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/parties?code=${item.code}`}
                  className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group"
                >
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
                    <div className="text-xs font-black text-slate-900 dark:text-white font-mono">
                      {item.poll_percentage}%
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      Veridicità: {item.truthfulness_score}%
                    </span>
                    <span className="text-amber-700 dark:text-amber-400 font-semibold">
                      Coperture: {item.financial_reliability_score}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SIMULATORE BILANCIO DELLO STATO */}
        {activeTab === "bilancio" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-500" />
                  <span>Simulatore Interattivo di Spesa Pubblica & Vincoli MEF</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inserisci una cifra stimata per una riforma politica e calcola istantaneamente l'assorbimento delle risorse statali.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={simAmount}
                  onChange={(e) => setSimAmount(parseFloat(e.target.value) || 0)}
                  className="w-24 px-2.5 py-1 text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                />
                <select
                  value={simUnit}
                  onChange={(e) => setSimUnit(e.target.value as "mld" | "mln")}
                  className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-semibold text-slate-700 dark:text-slate-200"
                >
                  <option value="mld">Miliardi € (Mld)</option>
                  <option value="mln">Milioni € (Mln)</option>
                </select>
              </div>
            </div>

            {/* Simulated Impact Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Assorbimento Manovra Annua</div>
                <div className="text-2xl font-black text-blue-950 dark:text-blue-200">{pctManovra}%</div>
                <div className="text-[11px] text-blue-700 dark:text-blue-300">Spazio totale tipico: ~30 Mld €</div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">% Fondo Sanitario (SSN)</div>
                <div className="text-2xl font-black text-emerald-950 dark:text-emerald-200">{pctSSN}%</div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-300">Totale SSN: ~136.5 Mld €</div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">% Spesa Istruzione & Ricerca</div>
                <div className="text-2xl font-black text-purple-950 dark:text-purple-200">{pctIstruzione}%</div>
                <div className="text-[11px] text-purple-700 dark:text-purple-300">Totale MIUR: ~78.0 Mld €</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Impatto sul PIL Nominale</div>
                <div className="text-2xl font-black text-amber-950 dark:text-amber-200">{pctPIL}%</div>
                <div className="text-[11px] text-amber-700 dark:text-amber-300">PIL Italia: ~2.120 Mld €</div>
              </div>
            </div>

            {/* Assessment Note */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">Verifica Vincoli Costituzionali (Art. 81 Cost.):</strong> Una spesa di <strong>{simAmountMld.toFixed(2)} Mld €</strong> rappresenta una quota significativa delle risorse pubbliche annue. 
              {parseFloat(pctManovra) > 20 ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold"> Richiede necessariamente coperture primarie strutturali (tagli lineari o nuove imposte) per evitare procedura di disavanzo UE.</span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold"> È gestibile all'interno degli ordinari saldi di finanza pubblica a fronte di modeste compensazioni.</span>
              )}
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
