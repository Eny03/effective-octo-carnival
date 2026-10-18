"use client";

import React from "react";
import { 
  Building2, 
  ExternalLink, 
  CheckCircle2, 
  TrendingUp, 
  Coins, 
  ShieldCheck, 
  Layers,
  ChevronRight
} from "lucide-react";

interface MarkdownMessageProps {
  content: string;
}

// Inline parser for bold, italic, links, and code
function renderInline(text: string): React.ReactNode[] {
  // Regex matches: [link](url) | **bold** | *italic* | `code`
  const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const fullMatch = match[0];
    if (fullMatch.startsWith("[") && match[2] && match[3]) {
      // Link
      parts.push(
        <a
          key={match.index}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-0.5"
        >
          <span>{match[2]}</span>
          <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
        </a>
      );
    } else if (fullMatch.startsWith("**") && match[4]) {
      // Bold
      parts.push(
        <strong key={match.index} className="font-extrabold text-slate-900 dark:text-white">
          {match[4]}
        </strong>
      );
    } else if (fullMatch.startsWith("*") && match[5]) {
      // Italic
      parts.push(
        <em key={match.index} className="italic text-slate-700 dark:text-slate-300">
          {match[5]}
        </em>
      );
    } else if (fullMatch.startsWith("`") && match[6]) {
      // Code / Tag
      parts.push(
        <code
          key={match.index}
          className="font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60"
        >
          {match[6]}
        </code>
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let currentList: string[] = [];
  let inList = false;

  const flushList = (keyPrefix: number) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${keyPrefix}`} className="my-2 space-y-1.5 pl-1">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-2" />
              <div className="flex-1">{renderInline(item)}</div>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
    inList = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check if line is a bullet item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      currentList.push(trimmed.slice(2));
      continue;
    }

    // If we were in a list and hit a non-list line, flush the list
    if (inList) {
      flushList(i);
    }

    // Empty line / spacer
    if (!trimmed) {
      elements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Divider
    if (trimmed === "---" || trimmed === "***") {
      elements.push(
        <hr
          key={`hr-${i}`}
          className="my-3 border-t border-slate-200 dark:border-slate-800"
        />
      );
      continue;
    }

    // Heading 3: ###
    if (trimmed.startsWith("### ")) {
      const headingText = trimmed.slice(4);
      elements.push(
        <div
          key={`h3-${i}`}
          className="mt-3.5 mb-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 first:border-0 first:pt-0"
        >
          <h3 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            {renderInline(headingText)}
          </h3>
        </div>
      );
      continue;
    }

    // Heading 4: ####
    if (trimmed.startsWith("#### ")) {
      const headingText = trimmed.slice(5);
      elements.push(
        <h4
          key={`h4-${i}`}
          className="mt-2.5 mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1"
        >
          {renderInline(headingText)}
        </h4>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      elements.push(
        <div
          key={`quote-${i}`}
          className="my-2 pl-3 py-1 border-l-2 border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 rounded-r-lg text-xs text-slate-700 dark:text-slate-300 italic"
        >
          {renderInline(trimmed.slice(2))}
        </div>
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <p
        key={`p-${i}`}
        className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed my-1"
      >
        {renderInline(trimmed)}
      </p>
    );
  }

  // Flush any remaining list items at the end
  if (inList) {
    flushList(lines.length);
  }

  return <div className="space-y-0.5">{elements}</div>;
}
