"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Compass, 
  Layers, 
  Building2, 
  ShieldCheck, 
  Bot, 
  Rss, 
  MoreVertical, 
  X,
  Scale,
  History,
  Sun,
  Moon
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("politilens_theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("politilens_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("politilens_theme", "light");
    }
  };

  // Client-side keepalive heartbeat: pings /api/health every 4 minutes while the app is open
  useEffect(() => {
    const keepalive = () => {
      fetch("/api/health").catch(() => {});
    };
    const interval = setInterval(keepalive, 240000);
    return () => clearInterval(interval);
  }, []);

  const allSections = [
    { 
      name: "Dashboard & Panoramica", 
      desc: "Indicatori economici, sondaggi e ultime posizioni censite", 
      href: "/", 
      icon: <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 
    },
    { 
      name: "Manifesto Comparativo", 
      desc: "Confronto testa a testa e matrice 18 partiti su tutti i temi", 
      href: "/compare", 
      icon: <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> 
    },
    { 
      name: "Schede Partiti & Dossier", 
      desc: "Programmi ufficiali, timeline 2022-2026 e radar delle priorità", 
      href: "/parties", 
      icon: <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> 
    },
    { 
      name: "Fact-Check & Bilancio MEF", 
      desc: "Scrutinio coperture art. 81 Cost. e relazioni tecniche ufficiali", 
      href: "/fact-check", 
      icon: <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" /> 
    },
    { 
      name: "Chat AI Istituzionale", 
      desc: "Assistente RAG con citazioni dirette degli atti parlamentari", 
      href: "/chat", 
      icon: <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" /> 
    },
    { 
      name: "Fonti & Web Crawler", 
      desc: "Monitoraggio continuo feed RSS, DDL e canali istituzionali", 
      href: "/sources", 
      icon: <Rss className="w-5 h-5 text-sky-600 dark:text-sky-400" /> 
    },
    { 
      name: "Registro Modifiche & Audit AI", 
      desc: "Tracciamento immutabile di variazioni demoscopiche e verifiche", 
      href: "/audit", 
      icon: <History className="w-5 h-5 text-teal-600 dark:text-teal-400" /> 
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-2xs">
      {/* Institutional Tricolor Top Accent */}
      <div className="h-[3px] w-full it-tricolor-line" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 dark:bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform border border-slate-700/50 shrink-0">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 dark:text-white" />
            </div>
            <div className="min-w-0">
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-[9px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">
                  Repubblica Italiana
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Archivio 2022-2026
                </span>
              </div>
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  PolitiLens
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Osservatorio Istituzionale
                </span>
              </div>
            </div>
          </Link>

          {/* Right Action: Clean Three Dots (⋮) Menu Button - NO duplicate header bar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Parametri MEF & ISTAT</span>
            </div>

            {/* Three Dots (⋮) Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] shadow-2xs"
              aria-label="Tutte le sezioni e strumenti"
              title="Menu principale (⋮)"
            >
              {menuOpen ? (
                <X className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              ) : (
                <MoreVertical className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Full Modal / Drawer from Three Dots (⋮) - Scrollable on both Mobile and PC */}
      {menuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl overflow-y-auto overscroll-contain shadow-2xl border-t border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-28 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Menu PolitiLens • Tutte le Sezioni
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <span>Chiudi</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Navigation Grid containing ALL pages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-4">
              {allSections.map((sec) => {
                const isActive = pathname === sec.href;
                return (
                  <Link
                    key={sec.href}
                    href={sec.href}
                    onClick={() => setMenuOpen(false)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 group ${
                      isActive
                        ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 shadow-2xs"
                        : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-2xs border border-slate-100 dark:border-slate-700 shrink-0 group-hover:scale-105 transition-transform">
                      {sec.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isActive ? "text-blue-900 dark:text-blue-300" : "text-slate-900 dark:text-white"}`}>
                          {sec.name}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Attiva
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {sec.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Footer Options inside Menu */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>Parametri ufficiali MEF, ISTAT, Corte dei Conti & Art. 81 Costituzione</span>
              </div>

              {/* Theme Toggle option available inside menu */}
              <button
                onClick={() => {
                  toggleTheme();
                }}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                <span>{isDark ? "Passa a Tema Chiaro" : "Passa a Tema Scuro"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
