"use client";

import React, { useEffect, useState } from "react";
import { 
  Layers, 
  Filter, 
  ArrowLeftRight, 
  Search, 
  Check, 
  Coins, 
  ExternalLink,
  BookOpen,
  Building2,
  Calendar
} from "lucide-react";
import { 
  fetchComparisonMatrix, 
  fetchParties, 
  ComparisonMatrixResponse, 
  PoliticalParty, 
  PoliticalProposal 
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
  const [viewMode, setViewMode] = useState<"matrix" | "head-to-head">("matrix");

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

  const macroTopics = ["Tutti", ...(matrixData?.macro_argomenti || [])];
  const coalitions = ["Tutte", "Centrodestra", "Centrosinistra", "Movimento 5 Stelle", "Centro / Liberaldemocratici"];

  // Filter parties by coalition
  const filteredParties = parties.filter((p) => {
    if (selectedCoalition === "Tutte") return true;
    return p.coalition.toLowerCase().includes(selectedCoalition.toLowerCase());
  });

  // Filter matrix rows by topic
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Manifesto Dinamico Comparato</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Matrice Comparativa delle Posizioni Politiche
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Confronta istantaneamente le visioni e le proposte dei partiti italiani su ciascun macro-argomento.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setViewMode("matrix")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "matrix"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Matrice Completa
          </button>
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
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Topic Select */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Macro-Argomento
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {macroTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Coalition Select */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Schieramento / Coalizione
            </label>
            <select
              value={selectedCoalition}
              onChange={(e) => setSelectedCoalition(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {coalitions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Cerca nel testo delle proposte
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="es. salario minimo, nucleare, flat tax..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400">
          Caricamento della matrice comparativa in corso...
        </div>
      ) : viewMode === "head-to-head" ? (
        /* Head-to-Head Comparison View */
        <div className="space-y-6">
          {/* Selectors for Party A and Party B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Primo Partito:
              </label>
              <select
                value={partyA}
                onChange={(e) => setPartyA(e.target.value)}
                className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100"
              >
                {parties.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.coalition})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Secondo Partito a Confronto:
              </label>
              <select
                value={partyB}
                onChange={(e) => setPartyB(e.target.value)}
                className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100"
              >
                {parties.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.coalition})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side-by-side topics list */}
          <div className="space-y-6">
            {filteredRows?.map((row) => {
              const cellA = row.parties[partyA];
              const cellB = row.parties[partyB];
              return (
                <div
                  key={row.macro_argomento}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
                >
                  <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TopicBadge topic={row.macro_argomento} />
                      <span className="text-xs font-medium text-slate-500">
                        {row.argomento_dettaglio}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 p-6 gap-6">
                    {/* Party A Column */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cellA?.party_color || "#3b82f6" }}
                        />
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {partyA}
                        </h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium ml-auto">
                          {cellA?.stance_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        {cellA?.sintesi_posizione}
                      </p>
                      {cellA?.proposals?.map((prop) => (
                        <div key={prop.id} className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span>Costo: <strong>{prop.costo_stimato}</strong></span>
                            <StatusBadge status={prop.fact_check_status} size="sm" />
                          </div>
                          {prop.fattibilita_finanziaria && (
                            <div className="text-[11px] italic text-slate-500">
                              {prop.fattibilita_finanziaria}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Party B Column */}
                    <div className="space-y-3 md:pl-6">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cellB?.party_color || "#3b82f6" }}
                        />
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {partyB}
                        </h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium ml-auto">
                          {cellB?.stance_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        {cellB?.sintesi_posizione}
                      </p>
                      {cellB?.proposals?.map((prop) => (
                        <div key={prop.id} className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span>Costo: <strong>{prop.costo_stimato}</strong></span>
                            <StatusBadge status={prop.fact_check_status} size="sm" />
                          </div>
                          {prop.fattibilita_finanziaria && (
                            <div className="text-[11px] italic text-slate-500">
                              {prop.fattibilita_finanziaria}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* View on Mobile: Native Touch Responsive Cards */}
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

                <div className="space-y-3">
                  {filteredParties.map((party) => {
                    const cell = row.parties[party.name];
                    const hasProposals = cell && cell.proposals.length > 0;
                    if (!hasProposals) return null;

                    return (
                      <div
                        key={party.code}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
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

                        <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                          {cell.sintesi_posizione}
                        </p>

                        {cell.proposals[0] && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-500">
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

          {/* View on Desktop: Full 2D Table */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 w-44">
                      Macro-Argomento
                    </th>
                    {filteredParties.map((party) => (
                      <th
                        key={party.code}
                        className="p-4 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[280px] border-l border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: party.color }}
                          />
                          <span>{party.name}</span>
                        </div>
                        <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                          {party.leader || party.coalition}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredRows?.map((row) => (
                    <tr
                      key={row.macro_argomento}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="p-4 font-semibold text-slate-900 dark:text-slate-100 sticky left-0 bg-white dark:bg-slate-900 shadow-xs">
                        <TopicBadge topic={row.macro_argomento} />
                      </td>

                      {filteredParties.map((party) => {
                        const cell = row.parties[party.name];
                        const hasProposals = cell && cell.proposals.length > 0;
                        return (
                          <td
                            key={party.code}
                            className="p-4 align-top border-l border-slate-100 dark:border-slate-800 space-y-2"
                          >
                            {hasProposals ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-semibold text-[11px] text-slate-800 dark:text-slate-200 line-clamp-1">
                                    {cell.stance_type}
                                  </span>
                                  {cell.proposals[0] && (
                                    <StatusBadge
                                      status={cell.proposals[0].fact_check_status}
                                      size="sm"
                                    />
                                  )}
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                                  {cell.sintesi_posizione}
                                </p>
                                {cell.proposals[0] && (
                                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                                    <span>Costo: {cell.proposals[0].costo_stimato}</span>
                                    <a
                                      href={cell.proposals[0].fonte_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                                    >
                                      Fonte <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-slate-400 italic text-[11px] py-2">
                                Nessun atto formale censito di recente
                              </div>
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
