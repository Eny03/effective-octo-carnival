import React from "react";
import { 
  Briefcase, 
  TrendingUp, 
  Zap, 
  Leaf, 
  HeartPulse, 
  GraduationCap, 
  Scale, 
  Globe 
} from "lucide-react";

interface TopicBadgeProps {
  topic: string;
}

export function TopicBadge({ topic }: TopicBadgeProps) {
  let icon = <TrendingUp className="w-3 h-3 shrink-0" />;
  let color = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60";

  switch (topic?.toLowerCase()) {
    case "lavoro":
      icon = <Briefcase className="w-3 h-3 shrink-0" />;
      color = "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60";
      break;
    case "economia":
    case "fisco":
      icon = <TrendingUp className="w-3 h-3 shrink-0" />;
      color = "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60";
      break;
    case "energia":
      icon = <Zap className="w-3 h-3 shrink-0" />;
      color = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60";
      break;
    case "ambiente":
      icon = <Leaf className="w-3 h-3 shrink-0" />;
      color = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60";
      break;
    case "sanità":
    case "sanita":
      icon = <HeartPulse className="w-3 h-3 shrink-0" />;
      color = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60";
      break;
    case "istruzione":
      icon = <GraduationCap className="w-3 h-3 shrink-0" />;
      color = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60";
      break;
    case "diritti civili":
    case "giustizia":
      icon = <Scale className="w-3 h-3 shrink-0" />;
      color = "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/60";
      break;
    case "esteri":
    case "politica estera":
      icon = <Globe className="w-3 h-3 shrink-0" />;
      color = "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60";
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold border whitespace-nowrap shrink-0 shadow-2xs ${color}`}>
      {icon}
      <span>{topic}</span>
    </span>
  );
}
