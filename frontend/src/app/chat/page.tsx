"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Scale, 
  ExternalLink, 
  BookOpen, 
  RotateCcw,
  Copy,
  Check,
  CornerDownRight,
  HelpCircle,
  TrendingUp,
  Building2
} from "lucide-react";
import { sendChatMessage, ChatQueryResponse, CitationItem } from "@/lib/api";
import { MarkdownMessage } from "@/components/MarkdownMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: CitationItem[];
  disclaimer?: string;
  timestamp: string;
}

const STARTER_PROMPTS = [
  {
    title: "Salario Minimo",
    query: "Quali sono le proposte sul salario minimo a confronto?",
    mode: "comparativo",
  },
  {
    title: "Cuneo & Flat Tax",
    query: "Quali sono le differenze tra Fratelli d'Italia e il PD su cuneo fiscale e Flat Tax?",
    mode: "confronto_diretto",
  },
  {
    title: "Pensioni Minime",
    query: "L'aumento delle pensioni minime ha coperture finanziarie realistiche secondo il MEF?",
    mode: "fact_check",
  },
  {
    title: "Nucleare vs Rinnovabili",
    query: "Cosa propongono i partiti sulla transizione energetica e il ritorno al nucleare?",
    mode: "comparativo",
  },
  {
    title: "Futuro Nazionale vs ORA!",
    query: "Quali sono le posizioni di Futuro Nazionale rispetto a ORA! su fisco e liberalizzazioni?",
    mode: "confronto_diretto",
  },
  {
    title: "Fondo Sanitario",
    query: "Quali sono le proposte dei partiti sulla spesa sanitaria e il taglio delle liste d'attesa?",
    mode: "comparativo",
  },
];

const FOLLOW_UP_SUGGESTIONS = [
  "Quali sono le coperture finanziarie previste?",
  "Cosa propone l'opposizione a riguardo?",
  "Quali vincoli impone il bilancio dello Stato (MEF/ISTAT)?",
  "Confronta con i dati dei sondaggi elettorali"
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Ciao! Sono l'osservatore autonomo neutrale di **PolitiLens**.\n\nAnalizzo costantemente l'intero web, gli atti parlamentari e i documenti ufficiali per offrirti **confronti imparziali**, sintesi programmatiche e verifiche di sostenibilità economica basate sui dati reali di bilancio (**MEF, ISTAT, UPB, Corte dei Conti**).\n\nPuoi pormi qualsiasi domanda, confrontare più partiti o verificare le coperture di una legge.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<string>("comparativo");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string, selectedMode?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const currentMode = selectedMode || mode;
    const userMsg: Message = {
      role: "user",
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response: ChatQueryResponse = await sendChatMessage({
        question: queryText,
        mode: currentMode,
      });

      const assistantMsg: Message = {
        role: "assistant",
        content: response.answer,
        citations: response.citations,
        disclaimer: response.neutrality_disclaimer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        role: "assistant",
        content:
          "Si è verificato un errore di connessione con il motore di analisi neutrale. Riprova tra qualche istante.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, index: number) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Conversazione azzerata. Poni una nuova domanda o tocca uno dei suggerimenti in alto.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2 sm:py-4 flex flex-col h-[calc(100dvh-5.5rem)] md:h-[calc(100vh-8.5rem)]">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm text-slate-900 dark:text-white">
                PolitiLens AI
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Neutrale 100%
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Analisi imparziale da tutto il web & dati istituzionali
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs"
          title="Azzera conversazione"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nuova Chat</span>
        </button>
      </div>

      {/* Suggested Queries Chips */}
      <div className="flex items-center gap-2 py-2.5 overflow-x-auto shrink-0 scrollbar-none border-b border-slate-100 dark:border-slate-800/60">
        <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
          Temi:
        </span>
        {STARTER_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query, p.mode)}
            disabled={loading}
            className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 shadow-2xs"
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`flex gap-2.5 sm:gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl sm:max-w-3xl space-y-2.5 ${isUser ? "items-end" : "items-start w-full"}`}>
                <div
                  className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed relative group ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-xs shadow-xs ml-auto max-w-xl"
                      : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-xs"
                  }`}
                >
                  {/* Rich Rendered Content */}
                  {isUser ? (
                    <div className="font-medium whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="space-y-1">
                      <MarkdownMessage content={msg.content} />
                    </div>
                  )}

                  {/* Disclaimer */}
                  {msg.disclaimer && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{msg.disclaimer}</span>
                    </div>
                  )}

                  {/* Copy message button */}
                  {!isUser && (
                    <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                      <span className="font-mono text-[10px]">{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopy(msg.content, index)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 rounded-md"
                        title="Copia risposta"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copiato</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copia</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Official Citations */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-wider">
                      <BookOpen className="w-3 h-3 text-indigo-500" />
                      <span>Fonti Ufficiali Utilizzate ({msg.citations.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700 text-[11px] space-y-0.5"
                        >
                          <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                            {c.partito} — {c.macro_argomento}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-2">
                            {c.fonte_testata || c.fonte_titolo || c.sintesi}
                          </div>
                          {c.fonte_url && (
                            <a
                              href={c.fonte_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 pt-0.5 font-semibold"
                            >
                              <span>Vedi documento</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up suggestions under assistant message */}
                {!isUser && index === messages.length - 1 && !loading && (
                  <div className="pt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <CornerDownRight className="w-3 h-3 text-slate-400" />
                      Approfondisci:
                    </span>
                    {FOLLOW_UP_SUGGESTIONS.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(suggestion)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-2.5 items-center text-xs text-slate-400">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Analisi neutrale di tutti i partiti e verifica coperture...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="pt-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xs focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500 transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Chiedi un confronto, una proposta o la fattibilità finanziaria..."
            className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 hover:opacity-90 disabled:opacity-30 transition-all active:scale-95 shrink-0 shadow-xs"
          >
            <span>Invia</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
