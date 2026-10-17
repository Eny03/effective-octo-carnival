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
  Search
} from "lucide-react";
import { fetchParties, fetchPartyDetail, PoliticalParty, PoliticalProposal } from "@/lib/api";
import { ProposalCard } from "@/components/ProposalCard";
import { StatusBadge } from "@/components/StatusBadge";
import { TopicBadge } from "@/components/TopicBadge";

export default function PartiesPage() {
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [selectedParty, setSelectedParty] = useState<PoliticalParty | null>(null);
  const [partyProposals, setPartyProposals] = useState<PoliticalProposal[]>([]);
  const [topicDistribution, setTopicDistribution] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [filterCoalition, setFilterCoalition] = useState<string>("Tutte");
  const [selectedTopic, setSelectedTopic] = useState<string>("Tutti");

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const data = await fetchParties();
        setParties(data);
        if (data.length > 0) {
          selectParty(data[0]);
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDossier(false);
    }
  };

  const coalitions = ["Tutte", "Centrodestra", "Centrosinistra", "Movimento 5 Stelle", "Centro / Liberaldemocratici"];

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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Dossier e Programmi dei Partiti
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Analisi delle forze parlamentari: leadership, visioni ideologiche, proposte formali e verifiche di fattibilità economica.
        </p>
      </div>

      {/* Horizontal Party Selector for Smartphones (One-Tap Touch) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filteredParties.map((p) => {
          const isSelected = selectedParty?.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => selectParty(p)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm ring-2 ring-blue-500/30"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Detailed Party Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Sidebar: Detailed Party List */}
        <div className="hidden lg:block lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Partiti ({filteredParties.length})
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
                      ? "bg-slate-50 dark:bg-slate-800/80 border-blue-500 shadow-xs"
                      : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {p.leader || p.coalition}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {p.proposals_count} atti
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Party Dossier Content */}
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
                  </div>

                  {selectedParty.official_website && (
                    <a
                      href={selectedParty.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto"
                    >
                      <span>Sito Ufficiale</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {selectedParty.description && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {selectedParty.description}
                  </p>
                )}

                {/* Topic Breakdown filter chips for this party */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Filtra per Tema nel Dossier:
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
              </div>

              {/* Proposals Stream */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>Atti & Posizioni Formalizzate ({displayedProposals.length})</span>
                  </h3>
                </div>

                {loadingDossier ? (
                  <div className="p-12 text-center text-xs text-slate-400">
                    Caricamento delle posizioni del partito...
                  </div>
                ) : displayedProposals.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                    Nessuna proposta trovata per questo tema.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedProposals.map((prop) => (
                      <ProposalCard key={prop.id} proposal={prop} />
                    ))}
                  </div>
                )}
              </div>
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
