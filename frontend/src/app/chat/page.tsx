"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Scale, 
  ExternalLink, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Layers,
  ArrowRight
} from "lucide-react";
import { sendChatMessage, ChatQueryResponse, CitationItem } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { TopicBadge } from "@/components/TopicBadge";

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
    title: "Fisco & Cuneo Fiscale",
    query: "Quali sono le differenze tra Fratelli d'Italia e il PD sul taglio del cuneo e la Flat Tax?",
    mode: "confronto_diretto",
  },
  {
    title: "Verifica Coperture Pensioni",
    query: "La proposta di aumento delle pensioni minime a 1000 euro ha coperture finanziarie realistiche?",
    mode: "fact_check",
  },
  {
    title: "Nucleare vs Rinnovabili",
    query: "Cosa propongono i partiti sulla transizione energetica e il nucleare?",
    mode: "comparativo",
  },
  {
    title: "Sanità & Liste d'Attesa",
    query: "Quali sono le proposte per il Fondo Sanitario Nazionale e le liste d'attesa?",
    mode: "comparativo",
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Benvenuto su **PolitiLens AI**, il chatbot comparativo e neutrale per la politica italiana.\n\nPuoi pormi qualsiasi domanda sulle posizioni dei partiti, confrontare programmi contrapposti o richiedere verifiche di fattibilità economica sulle proposte elettorali. Tutte le risposte sono rigorosamente neutrali e tracciate con fonti istituzionali (ISTAT, MEF, Corte dei Conti, testate giornalistiche).",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<string>("comparativo");
  const [loading, setLoading] = useState(false);

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
          "Si è verificato un errore di connessione con il motore di analisi neutrale. Assicurati che il backend sia attivo su `http://localhost:8000`.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Conversazione azzerata. Poni una nuova domanda o seleziona uno dei suggerimenti tematici in basso.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base text-slate-900 dark:text-white">
                PolitiLens AI
              </h1>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                RAG Neutrale
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Risposte basate su evidenze documentate senza alcun giudizio morale o preferenza elettorale
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setMode("comparativo")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mode === "comparativo"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Comparativo
            </button>
            <button
              onClick={() => setMode("confronto_diretto")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mode === "confronto_diretto"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Testa a Testa
            </button>
            <button
              onClick={() => setMode("fact_check")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mode === "fact_check"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Fact-Check
            </button>
          </div>

          <button
            onClick={handleReset}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Azzera conversazione"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-3xl space-y-3 ${isUser ? "items-end" : "items-start"}`}>
                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-xs"
                      : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.disclaimer && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-blue-500" />
                      <span>{msg.disclaimer}</span>
                    </div>
                  )}
                </div>

                {/* Citations Box */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Fonti Primarie & Documenti Ufficiali Utilizzati ({msg.citations.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="bg-white dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700 text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {c.partito}
                            </span>
                            <StatusBadge status={c.fact_check_status} size="sm" />
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                            {c.sintesi}
                          </p>
                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                            <span>{c.fonte_testata || "Atti"} • {c.timestamp}</span>
                            <a
                              href={c.fonte_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                            >
                              Apri fonte <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`text-[10px] text-slate-400 px-1 ${isUser ? "text-right" : "text-left"}`}>
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start items-center text-xs text-slate-500">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2 font-medium">Recupero evidenze e formulazione neutrale...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      {messages.length <= 2 && (
        <div className="pb-3 shrink-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Domande di partenza consigliate:
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STARTER_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query, p.mode)}
                className="shrink-0 text-left px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-xs text-slate-700 dark:text-slate-300 transition-all shadow-2xs hover:shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="font-semibold">{p.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Bar */}
      <div className="pt-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Chiedi un confronto neutrale su temi, proposte o coperture (es. salario minimo, fisco, sanità)..."
            disabled={loading}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2.5 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors shadow-xs"
            aria-label="Invia domanda"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
