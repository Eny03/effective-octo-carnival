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
    const saved = localStorage.getItem("politiclens_theme") || localStorage.getItem("politilens_theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll and handle Escape key when lateral menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("politiclens_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("politiclens_theme", "light");
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
      desc: "Indicatori economici reali, sondaggi e ultime posizioni censite", 
      href: "/", 
      icon: <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 
    },
    { 
      name: "Manifesto Comparativo", 
      desc: "Confronto testa a testa e matrice di tutte le forze politiche", 
      href: "/compare", 
      icon: <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> 
    },
    { 
      name: "Schede Partiti & Dossier", 
      desc: "Programmi ufficiali, posizioni verificate e sintesi strategica", 
      href: "/parties", 
      icon: <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> 
    },
    { 
      name: "Fact-Check Finanziario & Sostenibilità", 
      desc: "Scrutinio coperture finanziarie, fattibilità economica e vincoli di bilancio", 
      href: "/fact-check", 
      icon: <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" /> 
    },
    { 
      name: "Chat AI Neutrale & Atti Parlamentari", 
      desc: "Assistente RAG indipendente con citazioni verificate dei programmi e degli atti", 
      href: "/chat", 
      icon: <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" /> 
    },
    { 
      name: "Fonti & Web Crawler", 
      desc: "Monitoraggio continuo feed RSS, DDL e canali pubblici", 
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
    <>
      <header className="sticky top-0 z-40 w-full max-w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-2xs">
        {/* Subtle Accent Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 dark:bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform border border-slate-700/50 shrink-0">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 dark:text-white" />
              </div>
              <div className="min-w-0">
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-[9px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">
                    Monitoraggio Civico Indipendente
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Live • Tempo Reale
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 leading-tight">
                  <span className="font-extrabold text-sm sm:text-base lg:text-lg tracking-tight text-slate-900 dark:text-white">
                    PoliticLens
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    Analisi Politica Autonoma
                  </span>
                </div>
              </div>
            </Link>

            {/* Right Action: Live Status Indicator & Three Dots (⋮) Menu Button */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Monitoraggio Continuo Live</span>
              </div>

              {/* Three Dots (⋮) Button */}
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-2 sm:px-2.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] shadow-2xs relative z-50 cursor-pointer"
                aria-label="Menu laterale (tutte le sezioni)"
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
      </header>

      {/* Lateral Slide-Over Drawer (Right Side) - Works 100% reliably on PC and Mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-[150] flex justify-end">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Right-Side Lateral Drawer Panel */}
          <aside 
            className="relative z-10 w-full sm:w-[420px] h-full max-h-screen bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Menu di navigazione"
          >
            {/* Header with Title and Close Button */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    PoliticLens Menu
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Navigazione & Strumenti Civici
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Chiudi menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Navigation List */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1">
                Sezioni della Piattaforma
              </div>

              {allSections.map((sec) => {
                const isActive = pathname === sec.href;
                return (
                  <Link
                    key={sec.href}
                    href={sec.href}
                    onClick={() => setMenuOpen(false)}
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-3 group ${
                      isActive
                        ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 shadow-2xs"
                        : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-2xs border border-slate-100 dark:border-slate-700 shrink-0 group-hover:scale-105 transition-transform">
                      {sec.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs sm:text-sm font-bold ${isActive ? "text-blue-900 dark:text-blue-300" : "text-slate-900 dark:text-white"}`}>
                          {sec.name}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
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

            {/* Footer inside Drawer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tema Visivo:</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{isDark ? "Tema Chiaro" : "Tema Scuro"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <span>Aggiornato in tempo reale con fonti pubbliche e atti ufficiali</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
