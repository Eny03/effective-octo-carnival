"use client";

import React, { useEffect, useState } from "react";
import { 
  Building2, 
  ExternalLink, 
  User, 
  Layers, 
  Coins, 
  Calendar,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Search,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
  Globe,
  Share2
} from "lucide-react";
import { 
  fetchParties, 
  fetchPartyDetail, 
  PoliticalParty, 
  PoliticalProposal,
  AIDossierData 
} from "@/lib/api";
import { ProposalCard } from "@/components/ProposalCard";
import { StatusBadge } from "@/components/StatusBadge";
import { TopicBadge } from "@/components/TopicBadge";

export default function PartiesPage() {
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [selectedParty, setSelectedParty] = useState<PoliticalParty | null>(null);
  const [partyProposals, setPartyProposals] = useState<PoliticalProposal[]>([]);
  const [topicDistribution, setTopicDistribution] = useState<Record<string, number>>({});
  const [partyDossier, setPartyDossier] = useState<AIDossierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [filterCoalition, setFilterCoalition] = useState<string>("Tutte");
  const [selectedTopic, setSelectedTopic] = useState<string>("Tutti");
  const [activeTab, setActiveTab] = useState<"dossier" | "web_news" | "proposals">("dossier");

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const data = await fetchParties();
        setParties(data);
        if (data.length > 0) {
          let chosen = data[0];
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const codeParam = params.get("code");
            if (codeParam) {
              const match = data.find(
                (p) => p.code.toLowerCase() === codeParam.toLowerCase() || p.name.toLowerCase().includes(codeParam.toLowerCase())
              );
              if (match) chosen = match;
            }
          }
          selectParty(chosen);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const selectParty = async (party: PoliticalParty) => {
    try {
      setSelectedParty(party);
      setSelectedTopic("Tutti");
      setLoadingDossier(true);
      const detail = await fetchPartyDetail(party.id);
      setPartyProposals(detail.proposals || []);
      setTopicDistribution(detail.topic_distribution || {});
      setPartyDossier(detail.dossier || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDossier(false);
    }
  };

  const coalitions = [
    "Tutte",
    "Centrodestra",
    "Centrosinistra",
    "Movimento 5 Stelle",
    "Centro / Liberaldemocratici",
    "Sinistra Radicale",
    "Sovranismo Popolare",
    "Autonomie Regionali"
  ];

  const filteredParties = parties.filter((p) => {
    if (filterCoalition === "Tutte") return true;
    return p.coalition.toLowerCase().includes(filterCoalition.toLowerCase());
  });

  const displayedProposals = partyProposals.filter((p) => {
    if (selectedTopic !== "Tutti" && !p.macro_argomento.toLowerCase().includes(selectedTopic.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Dossier & Sondaggi Elettorali Aggiornati dall'AI</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Dossier e Programmi dei Partiti ({parties.length} Forze Politiche)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          L'intelligenza artificiale dell'app scansiona tutto il web ogni 10 minuti, confronta dichiarazioni, manifesti ed eventi e calcola la media ponderata dei sondaggi elettorali nazionali.
        </p>
      </div>

      {/* Horizontal Party Selector for Mobile & Quick Taps */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filteredParties.map((p) => {
          const isSelected = selectedParty?.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => selectParty(p)}
              className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs ring-2 ring-blue-500/30"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="truncate">{p.name}</span>
              {p.poll_percentage !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100/80 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-mono font-bold">
                  {p.poll_percentage}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Sidebar + Detailed Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Sidebar: Detailed Party List */}
        <div className="hidden lg:block lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Forze Politiche ({filteredParties.length})
            </span>
            <select
              value={filterCoalition}
              onChange={(e) => setFilterCoalition(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              {coalitions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            {filteredParties.map((p) => {
              const isSelected = selectedParty?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => selectParty(p)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-slate-50 dark:bg-slate-800/80 border-blue-500 shadow-xs ring-1 ring-blue-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {p.leader || p.coalition}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] px-1 py-0.2 rounded font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/40">
                          {p.truthfulness_score}% Veridicità
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end">
                    {p.poll_percentage !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">
                          {p.poll_percentage}%
                        </span>
                        <span className={`text-[9px] font-bold ${
                          p.poll_trend?.startsWith("+")
                            ? "text-emerald-600 dark:text-emerald-400"
                            : p.poll_trend?.startsWith("-")
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-slate-400"
                        }`}>
                          {p.poll_trend}
                        </span>
                      </div>
                    )}
                    <span className="text-[10px] font-semibold text-slate-400 mt-1">
                      {p.proposals_count} atti
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Comprehensive AI Dossier Content */}
        <div className="lg:col-span-8 space-y-5">
          {selectedParty ? (
            <div className="space-y-5">
              {/* Party Profile Header Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: selectedParty.color }}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pt-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: selectedParty.color }} />
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {selectedParty.name}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Schieramento: <strong>{selectedParty.coalition}</strong> {selectedParty.leader && `• Leader: ${selectedParty.leader}`}
                    </p>

                    {/* Live Poll & Veridicità Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-2.5">
                      {selectedParty.poll_percentage !== undefined && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Sondaggi: {selectedParty.poll_percentage}% ({selectedParty.poll_trend || "stabile"})</span>
                        </span>
                      )}
                      {selectedParty.truthfulness_score !== undefined && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Veridicità: {selectedParty.truthfulness_score}%</span>
                        </span>
                      )}
                      {selectedParty.financial_reliability_score !== undefined && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                          <Coins className="w-3.5 h-3.5" />
                          <span>Coperture: {selectedParty.financial_reliability_score}%</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {selectedParty.poll_sources || "Media ponderata Supermedia YouTrend/AGI, SWG, Ipsos, Tecnè, Noto"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {selectedParty.official_website && (
                      <a
                        href={selectedParty.official_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <span>Sito Ufficiale</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {selectedParty.description && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {selectedParty.description}
                  </p>
                )}

                {/* Sub-Tabs: AI Dossier, Web News, Catalog of Proposals */}
                <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 overflow-x-auto scrollbar-none pb-1">
                  <button
                    onClick={() => setActiveTab("dossier")}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "dossier"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Dossier Strategico AI</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("web_news")}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "web_news"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Dichiarazioni & Web ({partyDossier?.dichiarazioni_recenti_web?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("proposals")}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "proposals"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Atti & Posizioni ({partyProposals.length})</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: AI Strategic Dossier View */}
              {activeTab === "dossier" && (
                <div className="space-y-4">
                  {partyDossier ? (
                    <>
                      {/* Strategic Synthesis Card */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <span>Sintesi Strategica Elaborata dall'AI</span>
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {partyDossier.ultimo_aggiornamento_web}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {partyDossier.sintesi_strategica}
                        </p>

                        {/* Quick KPI stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Atti Totali</div>
                            <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                              {partyDossier.statistiche_atti.totale_atti}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-center border border-emerald-100 dark:border-emerald-900/40">
                            <div className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">Verificati</div>
                            <div className="text-base font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                              {partyDossier.statistiche_atti.verificati}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-center border border-amber-100 dark:border-amber-900/40">
                            <div className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold">In Attesa Coperture</div>
                            <div className="text-base font-black text-amber-700 dark:text-amber-300 mt-0.5">
                              {partyDossier.statistiche_atti.in_attesa_copertura}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-center border border-blue-100 dark:border-blue-900/40">
                            <div className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">Fattibilità Globale</div>
                            <div className="text-base font-black text-blue-700 dark:text-blue-300 mt-0.5">
                              {partyDossier.score_affidabilita}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Fact-Checking & Polling Statistics Card */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>Statistiche Demoscopiche & Fact-Checking AI</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              Analisi della Veridicità e Consenso Nazionale per {selectedParty.name}
                            </h3>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Dati aggregati da tutto il web 24/7
                          </span>
                        </div>

                        {/* Visual Gauges Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          {/* Polling Average */}
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span className="font-semibold">Media Sondaggi Nazionali</span>
                              <span className={`text-[10px] font-bold ${
                                selectedParty.poll_trend?.startsWith("+")
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : selectedParty.poll_trend?.startsWith("-")
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-slate-400"
                              }`}>
                                {selectedParty.poll_trend || "stabile"}
                              </span>
                            </div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                              {selectedParty.poll_percentage}%
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${Math.min(100, ((selectedParty.poll_percentage || 0) / 35) * 100)}%`,
                                  backgroundColor: selectedParty.color
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug">
                              {selectedParty.poll_sources || "Media ponderata Supermedia YouTrend/AGI, SWG, Ipsos, Tecnè, Noto"}
                            </p>
                          </div>

                          {/* Truthfulness Score */}
                          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                            <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                              <span className="font-semibold">Indice di Veridicità AI</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                              {selectedParty.truthfulness_score}%
                            </div>
                            <div className="w-full bg-emerald-200 dark:bg-emerald-900/60 h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                style={{ width: `${selectedParty.truthfulness_score || 0}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 leading-snug">
                              {partyDossier.statistiche_atti.verificati} atti verificati su {partyDossier.statistiche_atti.totale_atti} con fonti istituzionali (MEF, ISTAT, UPB).
                            </p>
                          </div>

                          {/* Financial Reliability */}
                          <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-2">
                            <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                              <span className="font-semibold">Coperture Finanziarie</span>
                              <Coins className="w-3.5 h-3.5 text-amber-600" />
                            </div>
                            <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono">
                              {selectedParty.financial_reliability_score}%
                            </div>
                            <div className="w-full bg-amber-200 dark:bg-amber-900/60 h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                                style={{ width: `${selectedParty.financial_reliability_score || 0}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 leading-snug">
                              Atti con stima economica conforme ai vincoli del Patto di Stabilità UE (deficit ≤ 3%).
                            </p>
                          </div>
                        </div>

                        {/* Breakdown Explanation */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            Metodologia di calcolo dell'Intelligenza Artificiale:
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[10px]">
                            L'AI raccoglie costantemente informazioni da motori di ricerca, agenzie di stampa, atti della Camera/Senato e canali dei partiti.
                            Le posizioni rimangono memorizzate nello storico persistente senza azzeramenti: se una dichiarazione viene modificata o aggiornata, l'AI aggiorna la posizione esistente.
                            La veridicità misura la percentuale di proposte con relazioni tecniche attendibili rispetto a quelle non quantificate o esagerate.
                          </p>
                        </div>
                      </div>

                      {/* Key Policy Pillars */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-500" />
                          <span>Pilastri Programmatici Chiave Rilevati dal Web</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {partyDossier.pilastri_programmatici.map((pil, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                  {pil.tema}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-400">
                                  {pil.tipo_azione}
                                </span>
                              </div>

                              <p className="text-xs font-medium text-slate-900 dark:text-slate-100 line-clamp-3">
                                {pil.proposta_chiave}
                              </p>

                              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                  <span>Costo: <strong className="text-slate-900 dark:text-white">{pil.costo}</strong></span>
                                  <span>Coperture: <strong className="text-slate-900 dark:text-white">{pil.coperture}</strong></span>
                                </div>
                                <div className="text-slate-500 text-[10px] leading-relaxed line-clamp-2">
                                  {pil.motivazione}
                                </div>
                              </div>

                              {pil.fonte_url && (
                                <a
                                  href={pil.fonte_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-mono pt-1"
                                >
                                  <span>Fonte: {pil.fonte_testata}</span>
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Historical Evolution Timeline (2022 - 2026) */}
                      {partyDossier.evoluzione_storica_legislatura && partyDossier.evoluzione_storica_legislatura.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span>Evoluzione della Linea Politica (2022 – 2026)</span>
                            </h3>
                            <span className="text-[10px] font-semibold text-slate-400">
                              Traiettoria della Legislatura
                            </span>
                          </div>

                          <div className="space-y-2.5 pt-1">
                            {partyDossier.evoluzione_storica_legislatura.map((step, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                              >
                                <span className="shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-mono">
                                  {step.periodo}
                                </span>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">
                                  {step.sintesi}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Institutional Audit: Strengths & Vulnerabilities */}
                      {(partyDossier.punti_di_forza || partyDossier.criticita_osservatorio) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {partyDossier.punti_di_forza && (
                            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Punti di Forza Programmatici</span>
                              </div>
                              <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                                {partyDossier.punti_di_forza}
                              </p>
                            </div>
                          )}

                          {partyDossier.criticita_osservatorio && (
                            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                <span>Criticità & Vincoli Finanziari</span>
                              </div>
                              <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                                {partyDossier.criticita_osservatorio}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Financial Feasibility Audit */}
                      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                              Audit Finanziario & Vincoli di Bilancio
                            </h4>
                          </div>
                          {partyDossier.valutazione_finanziaria.impegno_economico_stimato && (
                            <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900 self-start sm:self-auto">
                              Impegno Stimato: {partyDossier.valutazione_finanziaria.impegno_economico_stimato}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {partyDossier.valutazione_finanziaria.analisi_coperture}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border">
                      Dossier in elaborazione da parte dell'AI...
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Web Declarations & Live News */}
              {activeTab === "web_news" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span>Dichiarazioni, Interviste & Notizie Rilevate dal Web</span>
                    </h3>
                  </div>

                  {partyDossier?.dichiarazioni_recenti_web && partyDossier.dichiarazioni_recenti_web.length > 0 ? (
                    <div className="space-y-3">
                      {partyDossier.dichiarazioni_recenti_web.map((quote, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{quote.fonte}</span>
                            <span className="font-mono">{quote.data}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                            "{quote.dichiarazione}"
                          </p>
                          {quote.url && (
                            <a
                              href={quote.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline pt-1 font-mono"
                            >
                              <span>Leggi notizia originale</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border">
                      Nessuna dichiarazione web recente rilevata al momento.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Detailed Proposals Stream */}
              {activeTab === "proposals" && (
                <div className="space-y-4">
                  {/* Topic Filter Chips */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Filtra Atti per Tema:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedTopic("Tutti")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          selectedTopic === "Tutti"
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        Tutti ({partyProposals.length})
                      </button>
                      {Object.entries(topicDistribution).map(([topic, count]) => (
                        <button
                          key={topic}
                          onClick={() => setSelectedTopic(topic)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            selectedTopic === topic
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          <span>{topic}</span>
                          <span className="text-[10px] opacity-70">({count})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {displayedProposals.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                      Nessun atto trovato per questo tema.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {displayedProposals.map((prop) => (
                        <ProposalCard key={prop.id} proposal={prop} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 text-center text-xs text-slate-400">
              Seleziona un partito per visualizzarne il dossier completo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
