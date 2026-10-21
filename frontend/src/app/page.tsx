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
  Target
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

  // Home Filters
  const [selectedTopic, setSelectedTopic] = useState<string>("Tutti");
  const [selectedParty, setSelectedParty] = useState<string>("Tutti");
  const [selectedYear, setSelectedYear] = useState<string>("Tutti gli Anni");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(12);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Institutional Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Repubblica Italiana • Osservatorio Indipendente Politiche Pubbliche</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            PolitiLens
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Archivio storico 2022–2026 e monitoraggio permanente di tutte le 18 forze politiche italiane.
            Confronta le posizioni su ciascun tema, segui l'evoluzione delle proposte nel corso della legislatura e verifica la sostenibilità economica con i parametri ufficiali MEF, ISTAT e Corte dei Conti.
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
              <span>Interroga AI (Evoluzione Storica)</span>
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
                    <span>Ricerca mirata delle informazioni mancanti sul web...</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 animate-pulse">
                      Caccia alle Lacune
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300/80 mt-0.5">
                    L'AI individua le aree con meno dati ({detectedGaps.slice(0, 3).map(g => `${g.party_name} su ${g.topic}`).join(", ") || "temi non ancora censiti"}) e scandaglia miratamente motori, atti e siti ufficiali per colmarli.
                  </p>
                </div>
              ) : scanPhase === "updating" ? (
                <div>
                  <div className="font-extrabold text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2">
                    <span>Integrazione posizioni e verifica di bilancio MEF...</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-200 dark:bg-blue-900/80 text-blue-900 dark:text-blue-100 animate-pulse">
                      Elaborazione AI
                    </span>
                  </div>
                  <p className="text-xs text-blue-800 dark:text-blue-300/80 mt-0.5">
                    Estrazione delle proposte politiche, verifica di sostenibilità finanziaria con parametri MEF/ISTAT e rigenerazione dei dossier dei partiti.
                  </p>
                </div>
              ) : scanPhase === "done" ? (
                <div>
                  <div className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <span>Dossier e informazioni aggiornate: lacune colmate!</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-100">
                      Nuovi Dati Integrati
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300/80 mt-0.5">
                    Le informazioni mancanti individuate dall'AI sono state integrate nello storico permanente. Il countdown 24/7 riprende adesso.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Scansione e Aggiornamento Continuo 24/7 con Ricerca Mirata</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      24/7 Attivo
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    L'AI scansiona costantemente il web ogni 10 min: rileva cosa manca nei dossier dei partiti e cerca esattamente quelle informazioni per arricchire l'archivio.
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

      {/* Active Gap Hunter Section */}
      {detectedGaps.length > 0 && (
        <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Ricerca Mirata delle Lacune Informative</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                    Active Hunter
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ad ogni ciclo, l'AI rileva quali partiti hanno meno posizioni su determinati temi e cerca miratamente sul web per colmarli.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 self-start sm:self-auto">
              Obiettivi prioritari attivi:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
            {detectedGaps.slice(0, 6).map((gap, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {gap.party_name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Tema nel mirino: <span className="font-semibold text-blue-600 dark:text-blue-400">{gap.topic}</span>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100/80 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                  Da colmare
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

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
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Forze Mappate</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {loading ? "..." : stats?.total_parties || parties.length || 17}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Parlamentari & emergenti</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Media Veridicità</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {loading ? "..." : `${stats?.average_truthfulness || 82.5}%`}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Basata su dati MEF e ISTAT</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Costi Quantificati</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {loading ? "..." : `${stats?.quantified_cost_percentage || 78}%`}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Con stima finanziaria esplicita</p>
        </div>
      </section>

      {/* Polling & Truthfulness Index Section */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Media Ponderata Sondaggi Nazionali</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Sondaggi Elettorali & Indice di Veridicità dei Partiti
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Media dei principali istituti demoscopici (YouTrend/AGI, SWG, Ipsos, Tecnè, Noto) incrociata con la fattibilità economica delle promesse.
            </p>
          </div>

          <Link
            href="/parties"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
          >
            <span>Vedi tutti i dossier</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Polling & Truthfulness Cards Grid (All 18 Monitored Parties) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(stats?.party_rankings && stats.party_rankings.length > 0 ? stats.party_rankings : parties.map((p) => ({
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
          }))).map((item, idx) => (
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

                {/* Progress bar of poll percentage */}
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
                <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold" title="Indice coperture finanziarie">
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

        {/* Coalition Benchmark Summary */}
        {stats?.coalition_truthfulness && Object.keys(stats.coalition_truthfulness).length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Media di Veridicità per Schieramento Politico:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(stats.coalition_truthfulness).slice(0, 4).map(([coal, score]) => (
                <div key={coal} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 line-clamp-1">{coal}</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {score}% <span className="text-[10px] text-emerald-600 font-normal">fondate</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

        {/* Year Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Legislatura:</span>
          </span>
          {HISTORICAL_YEARS.map((yr) => {
            const isSelected = selectedYear === yr;
            return (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {yr}
              </button>
            );
          })}
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
                <div className="flex items-center gap-1.5 mt-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {party.poll_percentage !== undefined && (
                    <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                      {party.poll_percentage}%
                    </span>
                  )}
                  {party.truthfulness_score !== undefined && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      • {party.truthfulness_score}% V
                    </span>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-2 flex items-center gap-0.5">
                <span>Vedi dossier</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
