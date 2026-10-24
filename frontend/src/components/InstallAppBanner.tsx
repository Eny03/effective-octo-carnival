"use client";

import React, { useState, useEffect } from "react";
import { Smartphone, X, Share, PlusSquare, ArrowRight } from "lucide-react";

export function InstallAppBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Check if running inside standalone PWA mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (!isStandalone) {
      // Check user agent for mobile
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipad|ipod|android|mobile/.test(userAgent);
      const isApple = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isApple);
      
      const dismissed = localStorage.getItem("politiclens_pwa_dismissed") || localStorage.getItem("politilens_pwa_dismissed");
      if (isMobile && !dismissed) {
        setShow(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("politiclens_pwa_dismissed", "true");
  };

  if (!show) return null;

  return (
    <>
      {/* Discreet Mobile Banner */}
      <div className="md:hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sticky top-16 z-40 w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-2.5 flex-1 pr-2 min-w-0 cursor-pointer" onClick={() => setModalOpen(true)}>
          <div className="p-1 rounded-lg bg-white/20 shrink-0">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold truncate block">Usa PoliticLens come App su Telefono!</span>
            <p className="text-[11px] text-blue-200 truncate">Tocca per istruzioni di installazione rapida</p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 text-white/70 hover:text-white"
          aria-label="Chiudi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Modal with step-by-step installation instructions */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Installa PoliticLens su Telefono
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              PoliticLens è una <strong>Progressive Web App (PWA)</strong>. Puoi aggiungerla alla schermata Home del tuo smartphone per aprirla a schermo intero come un'app nativa:
            </p>

            {isIOS ? (
              <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400">
                  <Share className="w-4 h-4" />
                  <span>Istruzioni per iPhone / Safari:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <li>Tocca l'icona <strong>Condividi</strong> in basso in Safari (il quadrato con la freccia verso l'alto).</li>
                  <li>Scorri e tocca <strong>"Aggiungi a schermata Home"</strong>.</li>
                  <li>Premi <strong>"Aggiungi"</strong> in alto a destra. L'icona apparirà tra le tue app!</li>
                </ol>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                  <PlusSquare className="w-4 h-4" />
                  <span>Istruzioni per Android / Chrome:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <li>Tocca i <strong>tre puntini (⋮)</strong> in alto a destra in Chrome.</li>
                  <li>Seleziona <strong>"Installa applicazione"</strong> o <strong>"Aggiungi a schermata Home"</strong>.</li>
                  <li>Conferma l'installazione. Si aprirà come app standalone!</li>
                </ol>
              </div>
            )}

            <button
              onClick={() => setModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 transition-colors"
            >
              Ho capito
            </button>
          </div>
        </div>
      )}
    </>
  );
}
