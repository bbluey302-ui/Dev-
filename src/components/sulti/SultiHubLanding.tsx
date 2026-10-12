import React from 'react';
import { 
  MessageSquare, Mic, Sparkles, Clock, ArrowRight, 
  ChevronRight, History 
} from 'lucide-react';
import { AiConversation, AiVoiceSession, MajorAiLanguage } from '../../types/aiHub';
import { getCoachById } from '../../data/aiCoachesData';
import { sounds } from '../../utils/soundEffects';

interface SultiHubLandingProps {
  userName?: string;
  targetLanguage: MajorAiLanguage;
  onSelectLanguage?: (lang: MajorAiLanguage) => void;
  onNavigateToChat: () => void;
  onNavigateToVoice: () => void;
  onOpenConversation: (convoId: string) => void;
  onReviewVoiceSession?: (session: AiVoiceSession) => void;
  recentConversations: AiConversation[];
  recentVoiceSessions: AiVoiceSession[];
  onOpenProfile?: () => void;
}

export const SultiHubLanding: React.FC<SultiHubLandingProps> = ({
  onNavigateToChat,
  onNavigateToVoice,
  onOpenConversation,
  onReviewVoiceSession,
  recentConversations,
  recentVoiceSessions,
}) => {
  return (
    <div className="space-y-6 pb-12 select-none animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* MAIN HERO HEADING                                                         */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#11222D] via-[#0E1A25] to-[#0A121D] border border-teal-500/20 shadow-lg relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-1.5 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-teal-400" />
            <span>AI Conversational & Voice Intelligence</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-display font-black text-white leading-tight">
            Meet SULTI — Your Personal AI Language Coach
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed">
            Practice real conversations, improve your speaking skills, and learn at your own pace.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRIMARY OPTIONS: CHAT AGENT & VOICE AGENT CARDS                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* OPTION A: SULTI AI CHAT AGENT */}
        <div
          onClick={() => {
            sounds.playTap();
            onNavigateToChat();
          }}
          className="group relative p-4 rounded-3xl bg-[#11222D] hover:bg-[#152B37] border border-white/10 hover:border-teal-500/50 shadow-md hover:shadow-teal-500/10 transition-all cursor-pointer flex flex-col justify-between active:scale-[0.99]"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5 text-teal-400" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-stone-300">
                Interactive
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-black text-base text-white group-hover:text-teal-300 transition-colors">
                Sulti AI Chat Agent
              </h3>
              <p className="text-xs text-[#8E9BAE] leading-relaxed">
                Practice real-world scenarios, learn vocabulary, receive corrections, and continue conversations whenever you want.
              </p>
            </div>

            {/* Supporting Labels */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-teal-950/60 border border-teal-800/40 text-teal-300 font-medium">
                Scenario Practice
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-stone-300 font-medium">
                Persistent Chat
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-stone-300 font-medium">
                Smart Feedback
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs font-bold text-teal-400 group-hover:text-teal-300">
            <span>Explore Chat Agents</span>
            <div className="w-7 h-7 rounded-xl bg-teal-500/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* OPTION B: SULTI AI VOICE AGENT */}
        <div
          onClick={() => {
            sounds.playTap();
            onNavigateToVoice();
          }}
          className="group relative p-4 rounded-3xl bg-[#11222D] hover:bg-[#152B37] border border-white/10 hover:border-cyan-500/50 shadow-md hover:shadow-cyan-500/10 transition-all cursor-pointer flex flex-col justify-between active:scale-[0.99]"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5 text-cyan-400" />
              </div>
              {/* Free-Plan Indicator Badge */}
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <Clock className="w-3 h-3" />
                <span>2-minute free session</span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-black text-base text-white group-hover:text-cyan-300 transition-colors">
                Sulti AI Voice Agent
              </h3>
              <p className="text-xs text-[#8E9BAE] leading-relaxed">
                Speak with specialized AI coaches and improve your pronunciation, confidence, and conversational fluency.
              </p>
            </div>

            {/* Supporting Labels */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-medium">
                Live Speaking
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-stone-300 font-medium">
                Roleplay
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-stone-300 font-medium">
                Pronunciation Feedback
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
            <span>Explore Voice Agents</span>
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CONTINUE LEARNING (Recent Activity & History)                          */}
      {/* ========================================================================= */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-500" />
            <h3 className="font-display font-black text-sm text-stone-900 dark:text-white">
              Continue Learning & Recent Activity
            </h3>
          </div>
        </div>

        {/* Check if user has any recent chat conversations */}
        {recentConversations.length === 0 ? (
          /* Empty State for New Users */
          <div className="p-6 rounded-3xl bg-stone-100 dark:bg-[#11222D] border border-stone-200 dark:border-white/10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center mx-auto text-2xl">
              🌱
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-bold text-sm text-stone-900 dark:text-white">
                Ready to begin your language journey?
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                No past chat sessions yet. Choose <strong className="text-teal-400">Sulti AI Chat Agent</strong> for interactive scenario practice or try the live voice drills.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={onNavigateToChat}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer transition-all shadow-xs"
              >
                Start First Chat
              </button>
              <button
                onClick={onNavigateToVoice}
                className="px-3.5 py-1.5 rounded-xl bg-stone-200 dark:bg-white/10 hover:bg-stone-300 dark:hover:bg-white/20 text-stone-800 dark:text-white font-bold text-xs cursor-pointer transition-all"
              >
                Try Voice Coach
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Recent Chat Conversations */}
            {recentConversations.slice(0, 3).map((convo) => {
              const coach = getCoachById(convo.agentId);
              return (
                <div
                  key={convo.id}
                  onClick={() => {
                    sounds.playTap();
                    onOpenConversation(convo.id);
                  }}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#11222D] hover:bg-stone-50 dark:hover:bg-[#152B37] border border-stone-200 dark:border-white/10 hover:border-teal-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={coach.avatar}
                      alt={coach.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-teal-500/30"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-stone-900 dark:text-white truncate">
                          {convo.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-400 shrink-0">
                          {convo.targetLanguage}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {convo.lastMessagePreview || `Conversation with ${coach.name}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-stone-400 hidden sm:inline">
                      {new Date(convo.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <button className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 font-bold text-xs flex items-center gap-1">
                      <span>Resume</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
