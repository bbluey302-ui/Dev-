import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Send, Mic, Volume2, Sparkles, MoreVertical, 
  Trash2, Edit2, Archive, Check, X, RotateCcw, AlertTriangle, 
  Smile, BookOpen, Layers, Lightbulb, Compass, Loader2 
} from 'lucide-react';
import { AiConversation, AiChatMessage, MajorAiLanguage } from '../../types/aiHub';
import { getCoachById } from '../../data/aiCoachesData';
import { SultiMessageRenderer } from './SultiMessageRenderer';
import { startAudioRecording, AudioRecorderController } from '../../utils/audio';
import { sounds } from '../../utils/soundEffects';

interface SultiChatWorkspaceProps {
  conversation: AiConversation;
  messages: AiChatMessage[];
  onBack: () => void;
  onSendMessage: (text: string) => Promise<void>;
  onRename: (newTitle: string) => void;
  onArchive: (archive: boolean) => void;
  onDelete: () => void;
}

export const SultiChatWorkspace: React.FC<SultiChatWorkspaceProps> = ({
  conversation,
  messages,
  onBack,
  onSendMessage,
  onRename,
  onArchive,
  onDelete,
}) => {
  const coach = getCoachById(conversation.agentId);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(conversation.title);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRecorderRef = useRef<AudioRecorderController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isRecording]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    sounds.playTap();
    setInputText('');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await onSendMessage(text);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setErrorMessage('Could not deliver message to coach. Please check your connection and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVoiceInput = async () => {
    sounds.playTap();
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (audioRecorderRef.current) {
        try {
          const res = await audioRecorderRef.current.stop();
          if (res.base64Audio) {
            // Transcribe audio via existing whisper transcribe endpoint
            const transcriptRes = await fetch('/api/sulti/transcribe-audio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: res.base64Audio,
                mimeType: res.mimeType,
                targetLanguage: conversation.targetLanguage,
              }),
            });
            const data = await transcriptRes.json();
            if (data.transcript) {
              setInputText((prev) => (prev ? `${prev} ${data.transcript}` : data.transcript));
            }
          }
        } catch (err) {
          console.warn('Voice input transcription error:', err);
        }
      }
    } else {
      // Start recording
      const controller = await startAudioRecording();
      if (controller) {
        audioRecorderRef.current = controller;
        setIsRecording(true);
      }
    }
  };

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      sounds.playTap();
      onRename(titleInput.trim());
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-130px)] sm:h-[calc(100dvh-135px)] w-full bg-stone-50 dark:bg-[#0A121D] rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-white/10 overflow-hidden shadow-xl animate-in fade-in select-none">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (Coach Profile, Scenario Tag, Title, Actions Menu)          */}
      {/* ========================================================================= */}
      <div className="px-3.5 py-3 bg-white dark:bg-[#11222D] border-b border-stone-200 dark:border-white/10 flex items-center justify-between gap-2 shrink-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => {
              sounds.playTap();
              onBack();
            }}
            className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-white/10 text-stone-600 dark:text-stone-300 cursor-pointer transition-colors shrink-0"
            title="Back to Conversations"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <img
            src={coach.avatar}
            alt={coach.name}
            className="w-9 h-9 rounded-2xl object-cover shrink-0 border border-teal-500/30"
          />

          <div className="min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-black/40 text-xs font-bold text-stone-900 dark:text-white border border-teal-500"
                  autoFocus
                />
                <button onClick={handleSaveTitle} className="text-teal-500 p-0.5">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <h3 className="font-display font-black text-xs sm:text-sm text-stone-900 dark:text-white truncate">
                  {conversation.title}
                </h3>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5 cursor-pointer"
                  title="Rename"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-500 dark:text-stone-400 truncate">
              <span className="font-semibold text-teal-600 dark:text-teal-400">{coach.name}</span>
              <span>•</span>
              <span className="capitalize">{conversation.targetLanguage === 'cebuano' ? 'Bisaya' : conversation.targetLanguage}</span>
              {conversation.scenarioTitle && (
                <>
                  <span>•</span>
                  <span className="truncate">{conversation.scenarioTitle}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Menu Toggle */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-white/10 text-stone-500 dark:text-stone-400 cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-2xl bg-white dark:bg-[#152B37] border border-stone-200 dark:border-white/15 shadow-xl py-1 z-30 space-y-0.5">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setIsEditingTitle(true);
                }}
                className="w-full px-3 py-1.5 text-left text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/10 flex items-center gap-2 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-teal-500" />
                <span>Rename Title</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onArchive(conversation.status !== 'archived');
                }}
                className="w-full px-3 py-1.5 text-left text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/10 flex items-center gap-2 cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5 text-amber-500" />
                <span>{conversation.status === 'archived' ? 'Restore' : 'Archive'}</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (confirm('Delete this conversation workspace permanently?')) {
                    onDelete();
                  }
                }}
                className="w-full px-3 py-1.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Session</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SCROLLABLE MESSAGES CONTAINER                                          */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto text-xl">
              💬
            </div>
            <p className="font-bold text-stone-900 dark:text-white">Start your conversation!</p>
            <p>Send a message or choose a suggestion below.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <img
                    src={coach.avatar}
                    alt={coach.name}
                    className="w-7 h-7 rounded-xl object-cover shrink-0 mt-1 border border-teal-500/30"
                  />
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-3.5 shadow-xs ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-[#11222D] text-stone-900 dark:text-white border border-stone-200 dark:border-white/10 rounded-bl-xs'
                  }`}
                >
                  {isUser ? (
                    <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  ) : (
                    <SultiMessageRenderer
                      content={msg.content}
                      translation={msg.translation}
                      phoneticGuide={msg.phoneticGuide}
                      vocabularyBreakdown={msg.vocabularyBreakdown}
                      corrections={msg.corrections}
                      suggestedFollowUps={msg.suggestedFollowUps}
                      culturalTip={msg.culturalTip}
                      groundingSources={msg.groundingSources}
                      mapsLinks={msg.mapsLinks}
                      codeBlock={msg.codeBlock}
                      tableData={msg.tableData}
                      onSelectSuggestion={(reply) => handleSend(reply)}
                    />
                  )}

                  <div className={`text-[9px] font-mono mt-1 ${isUser ? 'text-teal-200 text-right' : 'text-stone-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* AI Typing / Loading Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 justify-start">
            <img
              src={coach.avatar}
              alt={coach.name}
              className="w-7 h-7 rounded-xl object-cover shrink-0 border border-teal-500/30 animate-pulse"
            />
            <div className="p-3 rounded-2xl bg-white dark:bg-[#11222D] border border-stone-200 dark:border-white/10 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <Loader2 className="w-3.5 h-3.5 text-teal-500 animate-spin" />
              <span>{coach.name} is typing feedback & response...</span>
            </div>
          </div>
        )}

        {/* Error Message with Retry */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => handleSend()}
              className="px-2 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ========================================================================= */}
      {/* 3. INPUT COMPOSER (Text input, Voice Mic, Send Button)                    */}
      {/* ========================================================================= */}
      <div className="p-3 bg-white dark:bg-[#11222D] border-t border-stone-200 dark:border-white/10 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            className={`p-2.5 rounded-2xl transition-all cursor-pointer active:scale-95 shrink-0 ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-stone-100 dark:bg-black/40 hover:bg-stone-200 dark:hover:bg-white/10 text-stone-600 dark:text-stone-300'
            }`}
            title={isRecording ? 'Stop Recording' : 'Dictate with Voice'}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${coach.name} in ${conversation.targetLanguage === 'cebuano' ? 'Bisaya' : conversation.targetLanguage}...`}
            disabled={isLoading}
            className="flex-1 px-3.5 py-2.5 rounded-2xl bg-stone-100 dark:bg-black/40 border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-teal-500 transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:hover:bg-teal-600 text-white font-bold transition-all cursor-pointer active:scale-95 shrink-0 shadow-xs"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
