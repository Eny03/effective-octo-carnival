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
  Menu, 
  X,
  Scale,
  History,
  Sun,
  Moon
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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


  const navLinks = [
    { name: "Dashboard", href: "/", icon: <Compass className="w-4 h-4" /> },
    { name: "Manifesto", href: "/compare", icon: <Layers className="w-4 h-4" /> },
    { name: "Partiti", href: "/parties", icon: <Building2 className="w-4 h-4" /> },
    { name: "Fact-Check", href: "/fact-check", icon: <ShieldCheck className="w-4 h-4" /> },
    { name: "Chat AI", href: "/chat", icon: <Bot className="w-4 h-4" /> },
    { name: "Fonti", href: "/sources", icon: <Rss className="w-4 h-4" /> },
    { name: "Log Modifiche", href: "/audit", icon: <History className="w-4 h-4" /> },
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
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white truncate">
                  PolitiLens
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Osservatorio Istituzionale
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Neutrality Pill & Theme Toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Parametri MEF & ISTAT</span>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title={isDark ? "Passa a Tema Chiaro" : "Passa a Tema Scuro"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              <span className="hidden xl:inline">{isDark ? "Tema Chiaro" : "Tema Scuro"}</span>
            </button>
          </div>


          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Apri menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Tools, Audit & Settings - Anti-Repetition with Bottom Bar) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Strumenti di Intelligence & Impostazioni
          </div>
          
          <div className="space-y-1">
            <Link
              href="/sources"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                pathname === "/sources"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Rss className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span>Fonti & Crawler Web</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono">Live</span>
              </div>
            </Link>

            <Link
              href="/audit"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                pathname === "/audit"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <History className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span>Registro Modifiche & Audit AI</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-mono">Trasparenza</span>
              </div>
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                <span>Aspetto Visivo</span>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {isDark ? "Tema Scuro (Attivo)" : "Tema Chiaro (Attivo)"}
              </span>
            </button>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Parametri ufficiali MEF, ISTAT, Corte dei Conti & Art. 81 Cost.</span>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
