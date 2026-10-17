"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Compass, 
  Layers, 
  Bot, 
  ShieldCheck, 
  Building2 
} from "lucide-react";

export function MobileTabBar() {
  const pathname = usePathname();

  const tabs = [
    { name: "Home", href: "/", icon: <Compass className="w-5 h-5" /> },
    { name: "Confronta", href: "/compare", icon: <Layers className="w-5 h-5" /> },
    { name: "AI Chat", href: "/chat", icon: <Bot className="w-5 h-5" />, highlight: true },
    { name: "Fact-Check", href: "/fact-check", icon: <ShieldCheck className="w-5 h-5" /> },
    { name: "Partiti", href: "/parties", icon: <Building2 className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl px-1 py-1 safe-area-pb">
      <div className="grid grid-cols-5 items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.highlight && !isActive && (
                <span className="absolute top-1 right-3 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              )}
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? "bg-blue-50 dark:bg-blue-950/60 scale-110" : ""
                }`}
              >
                {tab.icon}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
