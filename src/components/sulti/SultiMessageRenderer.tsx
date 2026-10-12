import React, { useState } from 'react';
import { 
  Volume2, Copy, Check, ExternalLink, MapPin, Sparkles, 
  CheckCircle2, XCircle, Lightbulb, BookOpen, AlertTriangle, 
  RotateCcw, Code, Table as TableIcon 
} from 'lucide-react';
import { speakBisaya } from '../../utils/audio';
import { sounds } from '../../utils/soundEffects';

interface SultiMessageRendererProps {
  content: string;
  translation?: string;
  phoneticGuide?: string;
  role?: 'user' | 'assistant' | 'system';
  targetLanguage?: string;
  vocabularyBreakdown?: { term?: string; bisaya?: string; meaning?: string; english?: string; pos?: string }[];
  corrections?: {
    original?: string;
    improved?: string;
    explanation?: string;
    example?: string;
  };
  suggestedFollowUps?: string[];
  culturalTip?: string;
  groundingSources?: { title: string; uri: string }[];
  mapsLinks?: { title: string; uri: string }[];
  codeBlock?: { language: string; code: string };
  tableData?: { headers: string[]; rows: string[][] };
  onSelectSuggestion?: (text: string) => void;
  onRetry?: () => void;
  isError?: boolean;
}

export const SultiMessageRenderer: React.FC<SultiMessageRendererProps> = ({
  content,
  translation,
  phoneticGuide,
  role = 'assistant',
  targetLanguage = 'cebuano',
  vocabularyBreakdown,
  corrections,
  suggestedFollowUps,
  culturalTip,
  groundingSources,
  mapsLinks,
  codeBlock,
  tableData,
  onSelectSuggestion,
  onRetry,
  isError = false,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);

  const handleCopy = (text: string, type: 'code' | 'table') => {
    sounds.playTap();
    navigator.clipboard?.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedTable(true);
      setTimeout(() => setCopiedTable(false), 2000);
    }
  };

  const handleSpeak = async (textToSpeak: string) => {
    sounds.playTap();
    setIsPlayingAudio(true);
    await speakBisaya(textToSpeak, 0.88);
    setIsPlayingAudio(false);
  };

  // Helper parser for Markdown elements in text:
  // Extracts markdown tables if embedded in text
  const renderFormattedMarkdown = (rawText: string) => {
    if (!rawText) return null;

    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    const flushTable = (keyIdx: number) => {
      if (tableHeaders.length > 0) {
        const tableString = [
          tableHeaders.join(' | '),
          tableHeaders.map(() => '---').join(' | '),
          ...tableRows.map((r) => r.join(' | ')),
        ].join('\n');

        elements.push(
          <div key={`table-${keyIdx}`} className="my-2.5 overflow-hidden rounded-xl border border-stone-200 dark:border-white/10 bg-white/50 dark:bg-black/20">
            <div className="flex items-center justify-between px-3 py-1.5 bg-stone-100 dark:bg-[#152B37] border-b border-stone-200 dark:border-white/10 text-[11px] font-mono font-semibold text-stone-600 dark:text-stone-300">
              <span className="flex items-center gap-1.5">
                <TableIcon className="w-3.5 h-3.5 text-teal-500" />
                <span>Structured Comparison Table</span>
              </span>
              <button
                onClick={() => handleCopy(tableString, 'table')}
                className="flex items-center gap-1 hover:text-teal-400 cursor-pointer transition-colors"
                title="Copy Table Markdown"
              >
                {copiedTable ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTable ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 dark:bg-[#11222D]">
                    {tableHeaders.map((th, hIdx) => (
                      <th key={hIdx} className="p-2 font-bold text-stone-900 dark:text-white border-b border-stone-200 dark:border-white/10">
                        {th.trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-white/5">
                  {tableRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-teal-500/5 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2 text-stone-700 dark:text-stone-300">
                          {cell.trim()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
      inTable = false;
      tableHeaders = [];
      tableRows = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Table row detection (| col1 | col2 |)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const cells = line.split('|').map((s) => s.trim()).filter((s, idx, arr) => idx > 0 && idx < arr.length - 1);
        // Skip separator row (|---|---|)
        if (cells.every((c) => /^[-:]+$/.test(c))) {
          continue;
        }
        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
        continue;
      } else if (inTable) {
        flushTable(i);
      }

      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={i} className="text-xs sm:text-sm font-bold font-display text-teal-600 dark:text-teal-400 mt-2.5 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h3 key={i} className="text-sm sm:text-base font-extrabold font-display text-stone-900 dark:text-white mt-3 mb-1.5">
            {line.replace('## ', '')}
          </h3>
        );
        continue;
      }
      if (line.startsWith('# ')) {
        elements.push(
          <h2 key={i} className="text-base sm:text-lg font-black font-display text-stone-900 dark:text-white mt-3 mb-2">
            {line.replace('# ', '')}
          </h2>
        );
        continue;
      }

      // Blockquote (> ...)
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} className="my-1.5 pl-3 border-l-2 border-teal-500 text-xs text-stone-600 dark:text-stone-300 italic bg-teal-500/5 py-1 rounded-r-lg">
            {line.replace('> ', '')}
          </blockquote>
        );
        continue;
      }

      // Unordered lists (- or *)
      if (/^[-*]\s+/.test(line)) {
        const text = line.replace(/^[-*]\s+/, '');
        elements.push(
          <div key={i} className="flex items-start gap-2 text-xs leading-relaxed text-stone-800 dark:text-stone-200 my-0.5">
            <span className="text-teal-500 font-bold shrink-0 mt-0.5">•</span>
            <span>{parseInlineFormatting(text)}</span>
          </div>
        );
        continue;
      }

      // Ordered lists (1. , 2. )
      if (/^\d+\.\s+/.test(line)) {
        const match = line.match(/^(\d+)\.\s+(.*)/);
        if (match) {
          elements.push(
            <div key={i} className="flex items-start gap-2 text-xs leading-relaxed text-stone-800 dark:text-stone-200 my-1">
              <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-300 text-[10px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                {match[1]}
              </span>
              <span>{parseInlineFormatting(match[2])}</span>
            </div>
          );
          continue;
        }
      }

      // Standard paragraph
      if (line.trim().length > 0) {
        elements.push(
          <p key={i} className="text-xs sm:text-sm leading-relaxed text-stone-800 dark:text-stone-200 my-1">
            {parseInlineFormatting(line)}
          </p>
        );
      }
    }

    if (inTable) {
      flushTable(lines.length);
    }

    return elements;
  };

  // Helper parser for inline **bold** and *italic*
  const parseInlineFormatting = (text: string): React.ReactNode => {
    // Regex for bold **text**
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-stone-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index} className="italic text-teal-600 dark:text-teal-300">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-2.5">
      {/* Primary Message Content */}
      <div className="prose prose-invert max-w-none text-xs sm:text-sm">
        {renderFormattedMarkdown(content)}
      </div>

      {/* Phonetic Pronunciation Guide */}
      {phoneticGuide && (
        <div className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/40 text-[11px] text-teal-800 dark:text-teal-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Phonetics:
            </span>
            <span className="font-mono italic truncate">{phoneticGuide}</span>
          </div>
          <button
            onClick={() => handleSpeak(content)}
            disabled={isPlayingAudio}
            className="p-1 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900 text-teal-600 dark:text-teal-300 shrink-0 cursor-pointer active:scale-90 transition-transform"
            title="Listen to pronunciation"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse text-teal-400' : ''}`} />
          </button>
        </div>
      )}

      {/* English Translation Toggle */}
      {translation && (
        <div className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 italic flex items-center justify-between gap-2 pt-0.5">
          <div className="truncate">
            {showTranslation ? `"${translation}"` : 'Translation hidden'}
          </div>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="text-[10px] font-medium text-teal-600 dark:text-teal-400 hover:underline shrink-0 cursor-pointer"
          >
            {showTranslation ? 'Hide' : 'Translate'}
          </button>
        </div>
      )}

      {/* Language Corrections Card (Distinguishing original vs improved vs explanation) */}
      {corrections && corrections.original && (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold text-xs">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Language Correction & Better Phrasing</span>
          </div>
          
          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-1.5 text-rose-700 dark:text-rose-400">
              <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-[10px] font-bold uppercase">Original: </span>
                <span className="line-through">{corrections.original}</span>
              </div>
            </div>

            <div className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <span className="font-mono text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Improved: </span>
                <span className="font-bold">{corrections.improved}</span>
              </div>
            </div>

            {corrections.explanation && (
              <p className="text-[11px] text-stone-600 dark:text-stone-300 bg-white/60 dark:bg-black/30 p-2 rounded-xl mt-1">
                <span className="font-bold">Why: </span>
                {corrections.explanation}
              </p>
            )}

            {corrections.example && (
              <div className="text-[11px] text-teal-700 dark:text-teal-300 italic pt-0.5">
                Natural example: "{corrections.example}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vocabulary and Phrase Breakdown Cards */}
      {vocabularyBreakdown && vocabularyBreakdown.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>Vocabulary & Phrasing Breakdown</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {vocabularyBreakdown.map((item, idx) => {
              const term = item.term || item.bisaya || '';
              const meaning = item.meaning || item.english || '';
              return (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-stone-100 dark:bg-[#152B37] border border-stone-200 dark:border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-stone-900 dark:text-white truncate flex items-center gap-1">
                      <span>{term}</span>
                      {item.pos && (
                        <span className="text-[9px] font-mono px-1 rounded bg-stone-200 dark:bg-white/10 text-stone-600 dark:text-stone-400">
                          {item.pos}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      {meaning}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSpeak(term)}
                    className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-white/10 text-stone-500 dark:text-stone-300 shrink-0 cursor-pointer"
                    title={`Pronounce ${term}`}
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cultural & Etiquette Tip */}
      {culturalTip && (
        <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-[11px] text-purple-900 dark:text-purple-200 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold">Cultural Tip: </span>
            {culturalTip}
          </div>
        </div>
      )}

      {/* Grounding Citations (Google Search & Google Maps) */}
      {(groundingSources && groundingSources.length > 0) || (mapsLinks && mapsLinks.length > 0) ? (
        <div className="pt-1 space-y-1">
          <div className="text-[10px] font-mono uppercase text-stone-400">Sources & Grounding:</div>
          <div className="flex flex-wrap gap-1.5">
            {groundingSources?.map((source, sIdx) => (
              <a
                key={sIdx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#152B37] text-[10px] font-mono text-teal-600 dark:text-teal-300 border border-stone-200 dark:border-white/10 hover:border-teal-500 transition-colors"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                <span className="truncate max-w-[140px]">{source.title || 'Web Citation'}</span>
              </a>
            ))}
            {mapsLinks?.map((map, mIdx) => (
              <a
                key={mIdx}
                href={map.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40 hover:border-emerald-500 transition-colors"
              >
                <MapPin className="w-2.5 h-2.5" />
                <span className="truncate max-w-[140px]">{map.title || 'Location Pin'}</span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {/* Structured Code Block (with copy button) */}
      {codeBlock && (
        <div className="my-2 rounded-xl overflow-hidden border border-stone-300 dark:border-white/10 bg-stone-900 text-stone-100 font-mono text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 bg-stone-800 border-b border-stone-700 text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <Code className="w-3 h-3 text-teal-400" />
              <span>{codeBlock.language || 'code'}</span>
            </span>
            <button
              onClick={() => handleCopy(codeBlock.code, 'code')}
              className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3 overflow-x-auto text-xs leading-relaxed text-teal-200">
            <code>{codeBlock.code}</code>
          </pre>
        </div>
      )}

      {/* Error state card with retry action */}
      {isError && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/50 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Connection timeout or failed response.</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Suggested Follow-up Replies Chips */}
      {suggestedFollowUps && suggestedFollowUps.length > 0 && onSelectSuggestion && (
        <div className="pt-2 space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
            Suggested Next Replies:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedFollowUps.map((suggestion, sIdx) => (
              <button
                key={sIdx}
                onClick={() => {
                  sounds.playTap();
                  onSelectSuggestion(suggestion);
                }}
                className="text-left px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#152B37] hover:bg-teal-50 dark:hover:bg-teal-950/50 text-stone-800 dark:text-stone-200 hover:text-teal-600 dark:hover:text-teal-300 text-xs border border-stone-200 dark:border-white/10 hover:border-teal-500/50 cursor-pointer active:scale-98 transition-all shadow-xs"
              >
                💬 {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
