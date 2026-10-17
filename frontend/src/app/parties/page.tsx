"use client";

import React, { useEffect, useState } from "react";
import { 
  Building2, 
  ExternalLink, 
  User, 
  Layers, 
  Filter, 
  Coins, 
  Calendar,
  CheckCircle2,
  FileText
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-2">
          <Building2 className="w-3.5 h-3.5" />
          <span>Dossier Istituzionali dei Partiti</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Mappa e Programmi dei Partiti Politici Italiani
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Dossier completi delle forze politiche parlamentari: coalizioni, leadership, posizioni storiche e verifiche di fattibilità.
        </p>
      </div>

      {/* Main Grid: Left Column Party Selector, Right Column Detailed Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Party List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Partiti Monitorati ({filteredParties.length})
            </h2>
            <select
              value={filterCoalition}
              onChange={(e) => setFilterCoalition(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-slate-800 dark:text-slate-200"
            >
              {coalitions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Caricamento elenco partiti...</div>
            ) : (
              filteredParties.map((p) => {
                const isSelected = selectedParty?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => selectParty(p)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-white dark:bg-slate-900 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                        : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3.5 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {p.leader ? `Leader: ${p.leader}` : p.coalition}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {p.proposals_count} atti
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Party Dossier */}
        <div className="lg:col-span-8 space-y-6">
          {selectedParty ? (
            <div className="space-y-6">
              {/* Party Profile Header Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-2"
                  style={{ backgroundColor: selectedParty.color }}
                />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pt-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: selectedParty.color }}
                      />
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white">
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto"
                    >
                      <span>Sito Ufficiale</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {selectedParty.description && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    {selectedParty.description}
                  </p>
                )}

                {/* Topic Breakdown for this Party */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Distribuzione per Macro-Tema nel Dossier
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(topicDistribution).map(([topic, count]) => (
                      <div
                        key={topic}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <TopicBadge topic={topic} />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Proposals Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span>Atti, Proposte e Posizioni Formalizzate ({partyProposals.length})</span>
                  </h3>
                </div>

                {loadingDossier ? (
                  <div className="p-12 text-center text-slate-400">
                    Caricamento del dossier proposte...
                  </div>
                ) : partyProposals.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                    Nessuna proposta formalizzata censita per questo partito.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partyProposals.map((prop) => (
                      <ProposalCard key={prop.id} proposal={prop} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400">
              Seleziona un partito dall'elenco a sinistra per visualizzare il dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
