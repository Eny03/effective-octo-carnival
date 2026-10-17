import React from "react";
import { ExternalLink, Calendar, Coins, ShieldAlert, BookOpen, Layers } from "lucide-react";
import { PoliticalProposal } from "@/lib/api";
import { StatusBadge } from "./StatusBadge";
import { TopicBadge } from "./TopicBadge";

interface ProposalCardProps {
  proposal: PoliticalProposal;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const formattedDate = proposal.timestamp
    ? new Date(proposal.timestamp).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const partyColor = proposal.party_color || "#3b82f6";

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Top Party Accent Line */}
      <div className="h-1.5 w-full" style={{ backgroundColor: partyColor }} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: partyColor }}
            />
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {proposal.partito}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <TopicBadge topic={proposal.macro_argomento} />
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {proposal.tipo_azione}
            </span>
          </div>
        </div>

        {/* Synthesis */}
        <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed mb-4 flex-1">
          {proposal.dichiarazione_sintesi}
        </p>

        {/* Economic Section */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 text-xs mb-3 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>Impatto Economico & Coperture</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
            <div>
              <span className="text-slate-500">Costo Stimato:</span>{" "}
              <strong className="text-slate-900 dark:text-slate-200">{proposal.costo_stimato}</strong>
            </div>
            <div>
              <span className="text-slate-500">Coperture:</span>{" "}
              <span className="italic">{proposal.coperture_dichiarate}</span>
            </div>
          </div>
          {proposal.fattibilita_finanziaria && (
            <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
              <span className="font-medium text-slate-700 dark:text-slate-200">Vincoli di Bilancio:</span>{" "}
              {proposal.fattibilita_finanziaria}
            </div>
          )}
        </div>

        {/* Fact-Checking Section */}
        <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-lg p-3 text-xs border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
              <span>Verifica Fattibilità Istituzionale</span>
            </div>
            <StatusBadge status={proposal.fact_check_status} size="sm" />
          </div>
          {proposal.fact_check_motivazione && (
            <p className="text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
              {proposal.fact_check_motivazione}
            </p>
          )}
          {proposal.fact_check_fonte && (
            <a
              href={proposal.fact_check_fonte}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <BookOpen className="w-3 h-3" />
              <span>Riferimento Istituzionale (ISTAT / UPB / Corte dei Conti)</span>
            </a>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formattedDate}
        </span>
        <a
          href={proposal.fonte_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <span>{proposal.fonte_testata || "Fonte Primaria"}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
