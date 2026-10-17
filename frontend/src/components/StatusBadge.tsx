import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const normStatus = status?.toLowerCase() || "";
  
  let colorClasses = "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  let icon = <HelpCircle className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />;

  if (normStatus.includes("verificato")) {
    colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    icon = <CheckCircle2 className={size === "sm" ? "w-3 h-3" : "w-4 h-4 text-emerald-600 dark:text-emerald-400"} />;
  } else if (normStatus.includes("copertura")) {
    colorClasses = "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
    icon = <AlertTriangle className={size === "sm" ? "w-3 h-3" : "w-4 h-4 text-amber-600 dark:text-amber-400"} />;
  } else if (normStatus.includes("esagerato")) {
    colorClasses = "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800";
    icon = <AlertCircle className={size === "sm" ? "w-3 h-3" : "w-4 h-4 text-orange-600 dark:text-orange-400"} />;
  } else if (normStatus.includes("inattuabile") || normStatus.includes("fake") || normStatus.includes("infondato")) {
    colorClasses = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800";
    icon = <XCircle className={size === "sm" ? "w-3 h-3" : "w-4 h-4 text-rose-600 dark:text-rose-400"} />;
  }

  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${padding} ${colorClasses}`}>
      {icon}
      <span>{status}</span>
    </span>
  );
}
