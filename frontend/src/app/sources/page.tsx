"use client";

import React, { useEffect, useState } from "react";
import { 
  Rss, 
  RefreshCw, 
  Play, 
  FileCode, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  Shield,
  Layers,
  Database,
  Target
} from "lucide-react";
import { 
  fetchMonitoredSources, 
  fetchIngestionLogs, 
  fetchDetectedGaps,
  triggerFeedScan, 
  submitManualIngest,
  IngestionLog,
  PoliticalProposal,
  InformationGap
} from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { ProposalCard } from "@/components/ProposalCard";

export default function SourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [logs, setLogs] = useState<IngestionLog[]>([]);
  const [gaps, setGaps] = useState<InformationGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Manual ingest form state
  const [manualUrl, setManualUrl] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualText, setManualText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractedProposals, setExtractedProposals] = useState<PoliticalProposal[]>([]);
  const [extractError, setExtractError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [srcs, lgs, gps] = await Promise.all([
        fetchMonitoredSources(),
        fetchIngestionLogs(),
        fetchDetectedGaps(8)
      ]);
      setSources(srcs);
      setLogs(lgs);
      setGaps(gps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerScan = async () => {
    try {
      setIsScanning(true);
      setScanMessage(null);
      const res = await triggerFeedScan();
      setScanMessage("Scansione asincrona avviata con successo! I feed RSS vengono analizzati dal parser.");
      setTimeout(() => {
        loadData();
      }, 3000);
    } catch (err: any) {
      setScanMessage("Errore nell'avvio della scansione.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim() && !manualUrl.trim()) return;

    try {
      setExtracting(true);
      setExtractError(null);
      setExtractedProposals([]);
      const result = await submitManualIngest({
        url: manualUrl || undefined,
        title: manualTitle || undefined,
        raw_text: manualText || undefined,
      });
      setExtractedProposals(result);
      loadData();
    } catch (err: any) {
      setExtractError("Errore durante l'estrazione: " + (err.message || "Verificare il testo inserito"));
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 mb-2">
            <Rss className="w-3.5 h-3.5" />
            <span>Pipeline di Ingestion & Audit Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Monitoraggio Fonti, Ingestion & Trasparenza
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Scansione autonoma continua 24/7 ogni 10 minuti di tutto il web: motori di ricerca, agenzie di stampa (ANSA, Sole 24 Ore, Rai, Quotidiani), canali ufficiali di ogni partito, manifesti ed eventi.
          </p>
        </div>

        <button
          onClick={handleTriggerScan}
          disabled={isScanning}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md disabled:opacity-60 transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
          <span>{isScanning ? "Scansione web in corso..." : "Esegui Scansione Web Ora"}</span>
        </button>
      </div>

      {scanMessage && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Active Information Gap Targets */}
      {gaps.length > 0 && (
        <section className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Obiettivi di Ricerca Mirata Attiva (Active Gap Hunter)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Auto-Learning
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  L'AI individua autonomamente le lacune informative nei programmi dei 18 partiti e caccia sul web esattamente le posizioni mancanti ad ogni ciclo di aggiornamento.
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-semibold self-start sm:self-auto">
              {gaps.length} lacune nel mirino
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
            {gaps.map((gap, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {gap.party_name}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">
                    Score {gap.gap_score}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  Tema: <strong className="text-blue-600 dark:text-blue-400">{gap.topic}</strong>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {gap.reason}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Grid: Monitored Feeds & Manual Ingestion Extractor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Monitored Feeds List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" />
            <span>Feed RSS & Agenzie Istituzionali Monitorate</span>
          </h2>

          <div className="space-y-3">
            {sources.map((src, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{src.name}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Categoria: <strong>{src.category}</strong> • Affidabilità: {src.reliability}
                  </div>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1 font-mono line-clamp-1"
                  >
                    <span>{src.url}</span>
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </a>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Attivo
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Ingest & Extract Tool (Mission Brief 4.B) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-500" />
              <span>Estrazione Schematizzata Diretta (Sezione 4.B)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Inserisci un articolo o comunicato stampa ufficiale per avviare l'analisi semantica, l'estrazione JSON strutturata e il fact-checking finanziario.
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                URL Articolo o Comunicato (Opzionale se incolli il testo)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Titolo Notizia / Comunicato
              </label>
              <input
                type="text"
                placeholder="es. Dichiarazione su proposta di legge..."
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Corpo del Testo dell'Articolo o Proposta
              </label>
              <textarea
                rows={4}
                placeholder="Incolla qui il testo dell'articolo di agenzia o il comunicato del partito..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {extractError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{extractError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={extracting || (!manualText.trim() && !manualUrl.trim())}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md disabled:opacity-50 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{extracting ? "Analisi ed Estrazione in corso..." : "Estrai e Salva nel Database"}</span>
            </button>
          </form>

          {/* Extracted Results Showcase */}
          {extractedProposals.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>{extractedProposals.length} Posizione/i estratta/e con successo!</span>
              </div>
              <div className="space-y-3">
                {extractedProposals.map((p) => (
                  <ProposalCard key={p.id} proposal={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ingestion Transparency Audit Logs */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Registro di Controllo e Trasparenza delle Scansioni (Audit Log)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 font-semibold">Data & Ora</th>
                <th className="p-3 font-semibold">Sorgente Monitorata</th>
                <th className="p-3 font-semibold">Articoli Analizzati</th>
                <th className="p-3 font-semibold">Posizioni Estratte</th>
                <th className="p-3 font-semibold">Stato</th>
                <th className="p-3 font-semibold">Note di Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-mono text-slate-500">
                    {new Date(log.timestamp).toLocaleString("it-IT")}
                  </td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    {log.source_name}
                  </td>
                  <td className="p-3 font-mono">{log.articles_found}</td>
                  <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {log.proposals_extracted}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        log.status === "SUCCESS"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 max-w-xs truncate">
                    {log.log_message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
