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
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight,
  RefreshCw,
  Building2,
  FileText,
  Clock
} from "lucide-react";
import { fetchStatsOverview, fetchProposals, fetchSchedulerStatus, StatsOverview, PoliticalProposal } from "@/lib/api";
import { ProposalCard } from "@/components/ProposalCard";
import { StatusBadge } from "@/components/StatusBadge";
import { TopicBadge } from "@/components/TopicBadge";

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [recentProposals, setRecentProposals] = useState<PoliticalProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, propsData, schedData] = await Promise.all([
        fetchStatsOverview(),
        fetchProposals({ limit: 6 }),
        fetchSchedulerStatus().catch(() => null)
      ]);
      setStats(statsData);
      setRecentProposals(propsData);
      setSchedulerStatus(schedData);
    } catch (err: any) {
      console.error(err);
      setError("Impossibile caricare i dati dal server backend. Assicurati che l'API backend sia attiva sulla porta 8000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Scale className="w-3.5 h-3.5" />
            <span>Osservatorio Politico Autonomo 100% Open-Source</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Mappa le posizioni dei partiti. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-300">
              Verifica fatti, costi e coperture.
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            PolitiLens monitora continuamente agenzie di stampa (ANSA, Sole 24 Ore, Adnkronos), atti parlamentari e programmi ufficiali.
            Estrae schemi strutturati comparabili, valuta la fattibilità economica rispetto ai vincoli di bilancio dello Stato ed espone un chatbot RAG rigorosamente neutrale.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <Layers className="w-4 h-4" />
              <span>Manifesto Dinamico</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Interroga PolitiLens AI</span>
            </Link>
            <Link
              href="/fact-check"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Osservatorio Fact-Checking</span>
            </Link>
          </div>
        </div>

        {/* Decorative background grid pattern */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <Scale className="w-96 h-96 text-white" />
        </div>
      </section>

      {/* Hourly Auto-Update Live Status Banner */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Clock className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border-2 border-white dark:border-slate-900" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Scansione e Aggiornamento Continuo Ogni 1 Ora</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Attivo 24/7
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              L'AI scansiona ogni 60 minuti tutti i feed ANSA, Sole 24 Ore e Adnkronos per rilevare nuove posizioni e rivalutare le coperture finanziarie.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
          <span>Prossimo ciclo programmato:</span>
          <strong className="text-blue-600 dark:text-blue-400">
            {schedulerStatus?.next_run_time
              ? new Date(schedulerStatus.next_run_time).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
              : "Tra circa 1 ora"}
          </strong>
        </div>
      </section>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Riprova</span>
          </button>
        </div>
      )}

      {/* Primary KPI Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Proposals */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Posizioni Tracciate</span>
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {loading ? "..." : stats?.total_proposals || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Estrapolate da atti formali e notizie primarie</p>
        </div>

        {/* Card 2: Parties Monitored */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Partiti Mappati</span>
            <Building2 className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {loading ? "..." : stats?.total_parties || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Tutto l'arco parlamentare italiano</p>
        </div>

        {/* Card 3: Economic Quantification */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Indice di Quantificazione</span>
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {loading ? "..." : `${stats?.quantified_cost_percentage || 0}%`}
          </div>
          <p className="text-xs text-slate-500 mt-1">Proposte con stima di costo dichiarata</p>
        </div>

        {/* Card 4: Verified vs Feasible */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Verifica Istituzionale</span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {loading ? "..." : stats?.fact_check_distribution?.["Verificato"] || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Proposte con dati e fattibilità confermati</p>
        </div>
      </section>

      {/* Institutional Reality Check Radar */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Benchmark Istituzionali di Bilancio (La realtà oggettiva dei conti)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dati ufficiali ISTAT, MEF, Banca d'Italia ed Eurostat utilizzati da PolitiLens per verificare la fattibilità di ogni promessa elettorale.
            </p>
          </div>
          <Link
            href="/fact-check"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Dettagli Fact-Checking</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-medium text-slate-500">PIL Nominale Annuo</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">~2.120 Mld €</div>
            <div className="text-[10px] text-slate-500 mt-1">Fonte: ISTAT 2024</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-medium text-slate-500">Rapporto Debito / PIL</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">137,3%</div>
            <div className="text-[10px] text-slate-500 mt-1">Totale debito: 2.950 Mld €</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-medium text-slate-500">Fondo Sanitario Nazionale</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">136,5 Mld €</div>
            <div className="text-[10px] text-slate-500 mt-1">6,4% del PIL (Corte dei Conti)</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-medium text-slate-500">Manovra di Bilancio Media</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">~30 Mld €</div>
            <div className="text-[10px] text-slate-500 mt-1">Capacità ordinaria annua MEF</div>
          </div>
        </div>
      </section>

      {/* Thematic Distribution & Fact-Check Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Macro-Argomenti Monitorati
          </h3>
          <div className="space-y-3">
            {stats?.proposals_by_topic &&
              Object.entries(stats.proposals_by_topic).map(([topic, count]) => {
                const total = stats.total_proposals || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={topic} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{topic}</span>
                      <span className="text-slate-500">{count} posizioni ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Fact-Checking Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Esito dei Controlli di Fattibilità
          </h3>
          <div className="space-y-3">
            {stats?.fact_check_distribution &&
              Object.entries(stats.fact_check_distribution).map(([status, count]) => {
                const total = stats.total_proposals || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={status} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={status} size="sm" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {count} <span className="text-xs font-normal text-slate-500">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* AI Neutrality Statement */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xs border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Garanzia di Imparzialità</span>
            </div>
            <h4 className="text-base font-bold text-white">Linee Guida Etiche di PolitiLens</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Il nostro algoritmo non esprime giudizi morali. Se una proposta viene classificata come "Inattuabile", la motivazione rimanda rigorosamente alle tabelle della Ragioneria Generale dello Stato o dell'ISTAT, senza mai denigrare l'ideologia del partito.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-800/80">
            <Link
              href="/chat"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md"
            >
              <Bot className="w-4 h-4" />
              <span>Chiedi al Chatbot Neutrale</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Documented Proposals Stream */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Ultime Posizioni Politiche Censite
            </h2>
            <p className="text-xs text-slate-500">
              Aggiornamento in tempo reale dai feed ufficiali e dalle sedute parlamentari.
            </p>
          </div>
          <Link
            href="/compare"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Visualizza Tutte</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Caricamento delle proposte in corso...</div>
        ) : recentProposals.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
            Nessuna proposta trovata.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentProposals.map((prop) => (
              <ProposalCard key={prop.id} proposal={prop} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
