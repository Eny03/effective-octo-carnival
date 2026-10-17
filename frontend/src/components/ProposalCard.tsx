import React from "react";
import { ExternalLink, Calendar, Coins, ShieldCheck, ArrowUpRight } from "lucide-react";
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
      })
    : "";

  const partyColor = proposal.party_color || "#3b82f6";

  return (
    <article className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs">
      <div>
        {/* Top: Party & Topic */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: partyColor }}
            />
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 tracking-tight">
              {proposal.partito}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <TopicBadge topic={proposal.macro_argomento} />
          </div>
        </div>

        {/* Clear Core Statement */}
        <p className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-snug mb-4">
          {proposal.dichiarazione_sintesi}
        </p>

        {/* Minimal Economic & Fact-Check Pills */}
        <div className="space-y-2 mb-4">
          {/* Economics */}
          <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 text-[11px]">Costo & Coperture:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate max-w-[190px]">
              {proposal.costo_stimato !== "Non quantificato" ? proposal.costo_stimato : "Non quantificato"}
            </span>
          </div>

          {/* Fact-Check Status & Brief Reasoning */}
          <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Verifica:</span>
              <StatusBadge status={proposal.fact_check_status} size="sm" />
            </div>
            {proposal.fact_check_motivazione && (
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed pt-0.5">
                {proposal.fact_check_motivazione}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 font-mono">
          <Calendar className="w-3 h-3 text-slate-400" />
          {formattedDate}
        </span>
        <a
          href={proposal.fonte_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
        >
          <span>{proposal.fonte_testata || "Fonte"}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
}
