"use client";

import React, { useEffect, useState } from "react";
import { 
  Layers, 
  ArrowLeftRight, 
  Search, 
  ExternalLink,
  Building2,
  Calendar
} from "lucide-react";
import { 
  fetchComparisonMatrix, 
  fetchParties, 
  ComparisonMatrixResponse, 
  PoliticalParty 
} from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { TopicBadge } from "@/components/TopicBadge";

export default function ComparePage() {
  const [matrixData, setMatrixData] = useState<ComparisonMatrixResponse | null>(null);
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTopic, setSelectedTopic] = useState<string>("Tutti");
  const [selectedCoalition, setSelectedCoalition] = useState<string>("Tutte");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"matrix" | "head-to-head">("head-to-head");

  // Head-to-Head selection
  const [partyA, setPartyA] = useState<string>("Fratelli d'Italia");
  const [partyB, setPartyB] = useState<string>("Partito Democratico");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [matrix, partiesList] = await Promise.all([
          fetchComparisonMatrix(),
          fetchParties()
        ]);
        setMatrixData(matrix);
        setParties(partiesList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const defaultMacroTopics = [
    "Tutti",
    "Fisco",
    "Lavoro",
    "Sanità",
    "Pensioni",
    "Energia",
    "Istituzioni",
    "Immigrazione",
    "Cittadinanza",
    "Istruzione",
    "Infrastrutture",
    "Politica Estera",
    "Diritti Civili"
  ];
  const macroTopics = matrixData?.macro_argomenti?.length ? ["Tutti", ...matrixData.macro_argomenti] : defaultMacroTopics;
  const coalitions = ["Tutte", "Centrodestra", "Centrosinistra", "Movimento 5 Stelle", "Centro / Liberaldemocratici"];

  // Filter parties by coalition
  const filteredParties = parties.filter((p) => {
    if (selectedCoalition === "Tutte") return true;
    return p.coalition.toLowerCase().includes(selectedCoalition.toLowerCase());
  });

  // Filter matrix rows by topic & search
  const filteredRows = matrixData?.matrix.filter((row) => {
    if (selectedTopic !== "Tutti" && row.macro_argomento !== selectedTopic) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const topicMatches = row.macro_argomento.toLowerCase().includes(q);
      const contentMatches = Object.values(row.parties).some((c) =>
        c.sintesi_posizione.toLowerCase().includes(q)
      );
      return topicMatches || contentMatches;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Confronto Posizioni
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Mappa e confronta le visioni dei partiti italiani su ciascun macro-tema.
          </p>
        </div>

        {/* View Switcher */}
        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode("head-to-head")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "head-to-head"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Testa a Testa</span>
          </button>
          <button
            onClick={() => setViewMode("matrix")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "matrix"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Tutti i Partiti
          </button>
        </div>
      </div>

      {/* Quick Topic Chips (Mobile First Scrollable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {macroTopics.map((topic) => {
          const isSelected = selectedTopic === topic;
          return (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {topic}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cerca un argomento o parola chiave (es. salario minimo, flat tax, nucleare)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">
          Caricamento della matrice comparativa...
        </div>
      ) : viewMode === "head-to-head" ? (
        /* Head-to-Head Comparison View */
        <div className="space-y-6">
          {/* Party Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Primo Partito
              </label>
              <select
                value={partyA}
                onChange={(e) => setPartyA(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-hidden"
              >
                {parties.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.coalition})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Secondo Partito
              </label>
              <select
                value={partyB}
                onChange={(e) => setPartyB(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-hidden"
              >
                {parties.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.coalition})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="space-y-4">
            {filteredRows?.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                Nessun argomento trovato per i filtri selezionati.
              </div>
            ) : (
              filteredRows?.map((row) => {
                const cellA = row.parties[partyA];
                const cellB = row.parties[partyB];
                return (
                  <div
                    key={row.macro_argomento}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
                  >
                    <div className="bg-slate-50 dark:bg-slate-800/60 px-4 sm:px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <TopicBadge topic={row.macro_argomento} />
                      <span className="text-[11px] text-slate-400 font-medium">
                        {row.argomento_dettaglio}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 p-4 sm:p-6 gap-4 sm:gap-6">
                      {/* Party A */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: cellA?.party_color || "#3b82f6" }}
                            />
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                              {partyA}
                            </h4>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {cellA?.stance_type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {cellA?.sintesi_posizione}
                        </p>
                        {cellA?.proposals?.[0] && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Costo: <strong className="text-slate-700 dark:text-slate-300">{cellA.proposals[0].costo_stimato}</strong></span>
                            <StatusBadge status={cellA.proposals[0].fact_check_status} size="sm" />
                          </div>
                        )}
                      </div>

                      {/* Party B */}
                      <div className="space-y-2.5 pt-4 md:pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: cellB?.party_color || "#3b82f6" }}
                            />
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                              {partyB}
                            </h4>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {cellB?.stance_type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {cellB?.sintesi_posizione}
                        </p>
                        {cellB?.proposals?.[0] && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Costo: <strong className="text-slate-700 dark:text-slate-300">{cellB.proposals[0].costo_stimato}</strong></span>
                            <StatusBadge status={cellB.proposals[0].fact_check_status} size="sm" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Full Party Matrix View */
        <div className="space-y-4">
          {/* Mobile view */}
          <div className="block md:hidden space-y-4">
            {filteredRows?.map((row) => (
              <div
                key={row.macro_argomento}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <TopicBadge topic={row.macro_argomento} />
                  <span className="text-[11px] text-slate-400">Tutti i partiti</span>
                </div>

                <div className="space-y-2.5">
                  {filteredParties.map((party) => {
                    const cell = row.parties[party.name];
                    const hasProposals = cell && cell.proposals.length > 0;
                    if (!hasProposals) return null;

                    return (
                      <div
                        key={party.code}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: party.color }}
                            />
                            <span>{party.name}</span>
                          </div>
                          {cell.proposals[0] && (
                            <StatusBadge
                              status={cell.proposals[0].fact_check_status}
                              size="sm"
                            />
                          )}
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                          {cell.sintesi_posizione}
                        </p>

                        {cell.proposals[0] && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-[10px] text-slate-500">
                            <span>Costo: <strong>{cell.proposals[0].costo_stimato}</strong></span>
                            <a
                              href={cell.proposals[0].fonte_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-0.5"
                            >
                              Fonte <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 w-44">
                      Tema
                    </th>
                    {filteredParties.map((party) => (
                      <th
                        key={party.code}
                        className="p-4 text-xs font-bold text-slate-900 dark:text-white min-w-[240px] border-l border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: party.color }}
                          />
                          <span>{party.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredRows?.map((row) => (
                    <tr key={row.macro_argomento} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4 font-semibold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900">
                        <TopicBadge topic={row.macro_argomento} />
                      </td>
                      {filteredParties.map((party) => {
                        const cell = row.parties[party.name];
                        const hasProposals = cell && cell.proposals.length > 0;
                        return (
                          <td key={party.code} className="p-4 align-top border-l border-slate-100 dark:border-slate-800 space-y-1.5">
                            {hasProposals ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-semibold text-[11px] text-slate-800 dark:text-slate-200">
                                    {cell.stance_type}
                                  </span>
                                  {cell.proposals[0] && (
                                    <StatusBadge status={cell.proposals[0].fact_check_status} size="sm" />
                                  )}
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                                  {cell.sintesi_posizione}
                                </p>
                                {cell.proposals[0] && (
                                  <div className="text-[10px] text-slate-500 pt-1">
                                    Costo: <strong>{cell.proposals[0].costo_stimato}</strong>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-slate-400 italic text-[11px]">Nessun dato</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
