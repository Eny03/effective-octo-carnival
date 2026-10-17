"use client";

import React, { useState } from "react";
import { ExternalLink, Calendar, Coins, ShieldCheck, ArrowUpRight, ChevronRight, Eye } from "lucide-react";
import { PoliticalProposal } from "@/lib/api";
import { StatusBadge } from "./StatusBadge";
import { TopicBadge } from "./TopicBadge";
import { ProposalDetailModal } from "./ProposalDetailModal";

interface ProposalCardProps {
  proposal: PoliticalProposal;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const formattedDate = proposal.timestamp
    ? new Date(proposal.timestamp).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
      })
    : "";

  const partyColor = proposal.party_color || "#3b82f6";

  return (
    <>
      <article 
        onClick={() => setIsDetailOpen(true)}
        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 hover:border-blue-400/80 dark:hover:border-blue-600/80 hover:shadow-md transition-all flex flex-col justify-between shadow-2xs cursor-pointer select-none relative"
      >
        <div>
          {/* Top: Party & Topic */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
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

          {/* Clear, Concise Headline */}
          <h3 className="text-slate-900 dark:text-slate-100 text-sm font-bold leading-snug mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {proposal.dichiarazione_sintesi}
          </h3>

          {/* Minimal Economic & Fact-Check Summary */}
          <div className="space-y-2 mb-3">
            {/* Economics */}
            <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 text-[11px]">Costo:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate max-w-[190px]">
                {proposal.costo_stimato !== "Non quantificato" ? proposal.costo_stimato : "Non quantificato"}
              </span>
            </div>

            {/* Fact-Check Status */}
            <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-[11px] font-semibold text-slate-500">Verifica Istituzionale:</span>
              <StatusBadge status={proposal.fact_check_status} size="sm" />
            </div>
          </div>
        </div>

        {/* Footer Info & Expand Trigger */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 font-mono text-slate-400">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formattedDate}
          </span>
          
          <div className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
            <span>Dettagli & Fonti</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </article>

      {/* Modal Dialog */}
      <ProposalDetailModal
        proposal={proposal}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  );
}
