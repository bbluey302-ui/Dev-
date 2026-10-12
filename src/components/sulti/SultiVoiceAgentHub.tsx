import React, { useState } from 'react';
import { 
  ArrowLeft, Mic, Clock, Sparkles, Check, ChevronRight, 
  Target, Volume2, Shield, AlertCircle, Info, Star 
} from 'lucide-react';
import { AiCoach, AiCoachId, MajorAiLanguage } from '../../types/aiHub';
import { AI_COACHES, getCoachById } from '../../data/aiCoachesData';
import { sounds } from '../../utils/soundEffects';

interface SultiVoiceAgentHubProps {
  currentLanguage: MajorAiLanguage;
  onBackToHub: () => void;
  onStartVoiceSession: (config: {
    coachId: AiCoachId;
    targetLanguage: MajorAiLanguage;
    scenarioTitle: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  }) => void;
}

export const SultiVoiceAgentHub: React.FC<SultiVoiceAgentHubProps> = ({
  currentLanguage,
  onBackToHub,
  onStartVoiceSession,
}) => {
  const [selectedCoachId, setSelectedCoachId] = useState<AiCoachId>(() => {
    if (currentLanguage === 'filipino') return 'mika';
    if (currentLanguage === 'english') return 'adam';
    return 'jen';
  });

  const [configuringCoach, setConfiguringCoach] = useState<AiCoach | null>(null);
  const [targetLang, setTargetLang] = useState<MajorAiLanguage>(currentLanguage);
  const [selectedScenarioGoal, setSelectedScenarioGoal] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');

  const handleOpenConfig = (coach: AiCoach) => {
    sounds.playTap();
    setConfiguringCoach(coach);
    setSelectedCoachId(coach.id);
    setTargetLang(coach.primaryLanguage);
    setSelectedScenarioGoal(coach.practiceExamples[0] || 'Everyday conversational practice');
  };

  const handleStartSession = () => {
    if (!configuringCoach) return;
    sounds.playTap();
    onStartVoiceSession({
      coachId: configuringCoach.id,
      targetLanguage: targetLang,
      scenarioTitle: selectedScenarioGoal,
      difficulty,
    });
  };

  return (
    <div className="space-y-5 pb-12 select-none animate-in fade-in duration-200">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => {
            sounds.playTap();
            onBackToHub();
          }}
          className="p-2 rounded-2xl bg-stone-100 dark:bg-[#11222D] hover:bg-stone-200 dark:hover:bg-[#152B37] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-white/10 flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sulti Hub</span>
        </button>

        {/* Free Plan Limit Notice Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold">
          <Clock className="w-3.5 h-3.5" />
          <span>2-minute free sessions</span>
        </div>
      </div>

      {/* Screen Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-black text-stone-900 dark:text-white">
          Sulti AI Voice Coaches
        </h1>
        <p className="text-xs text-[#8E9BAE]">
          Select an AI specialist to practice live speaking, pronunciation, and confidence.
        </p>
      </div>

      {/* 2-Minute Free Session Explanation Banner */}
      <div className="p-3.5 rounded-2xl bg-[#11222D] border border-cyan-500/30 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
          <Mic className="w-4 h-4" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <span>Live Voice Practice with Whisper Speech Feedback</span>
          </div>
          <p className="text-[11px] text-stone-300 leading-relaxed">
            Free users can enjoy <strong>2-minute speaking sessions</strong> with AI evaluation, live transcription, and post-session pronunciation tips.
          </p>
        </div>
      </div>

      {/* Coaches Directory (5 Required Personas) */}
      <div className="space-y-3">
        {AI_COACHES.map((coach) => {
          return (
            <div
              key={coach.id}
              className="p-4 rounded-3xl bg-white dark:bg-[#11222D] hover:bg-stone-50 dark:hover:bg-[#152B37] border border-stone-200 dark:border-white/10 hover:border-cyan-500/50 transition-all shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <img
                      src={coach.avatar}
                      alt={coach.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-500/40 shrink-0"
                    />
                    <span className="absolute -bottom-1 -right-1 text-sm bg-stone-900 px-1 rounded-md shadow-xs">
                      {coach.flag}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-black text-sm sm:text-base text-stone-900 dark:text-white truncate">
                        {coach.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 font-bold shrink-0">
                        {coach.role}
                      </span>
                    </div>
                    <div className="text-xs text-teal-600 dark:text-teal-400 font-semibold truncate">
                      {coach.specialty}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate mt-0.5">
                      Languages: {coach.supportedLanguages.map((l) => (l === 'cebuano' ? 'Bisaya' : l)).join(', ')}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenConfig(coach)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-xs shrink-0"
                >
                  <span>Select Coach</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-stone-600 dark:text-[#8E9BAE] leading-relaxed">
                {coach.description}
              </p>

              {/* Recommended Practice Examples */}
              <div className="pt-2 border-t border-stone-100 dark:border-white/5 space-y-1">
                <div className="text-[10px] font-mono uppercase text-stone-400 font-semibold">
                  Recommended Scenarios:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {coach.practiceExamples.slice(0, 3).map((ex, exIdx) => (
                    <span
                      key={exIdx}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-black/30 border border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300 truncate max-w-full"
                    >
                      • {ex}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================================= */}
      {/* COACH CONFIGURATION MODAL / SHEET                                       */}
      {/* ======================================================================= */}
      {configuringCoach && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#11222D] rounded-t-3xl sm:rounded-3xl border border-stone-200 dark:border-white/15 p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={configuringCoach.avatar}
                  alt={configuringCoach.name}
                  className="w-10 h-10 rounded-2xl object-cover border border-cyan-500/40"
                />
                <div>
                  <h3 className="font-display font-black text-sm text-stone-900 dark:text-white">
                    {configuringCoach.name}
                  </h3>
                  <p className="text-xs text-cyan-400 font-medium">{configuringCoach.role}</p>
                </div>
              </div>
              <button
                onClick={() => setConfiguringCoach(null)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Target Language Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900 dark:text-white">
                Target Speaking Language:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['cebuano', 'filipino', 'english'] as MajorAiLanguage[]).map((lang) => {
                  const isSupported = configuringCoach.supportedLanguages.includes(lang);
                  const isSelected = targetLang === lang;
                  return (
                    <button
                      key={lang}
                      disabled={!isSupported}
                      onClick={() => setTargetLang(lang)}
                      className={`p-2 rounded-2xl text-xs font-bold text-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-600 text-white border-cyan-400 shadow-xs'
                          : isSupported
                          ? 'bg-stone-50 dark:bg-black/30 border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-300 hover:border-cyan-400'
                          : 'opacity-40 cursor-not-allowed bg-stone-100 dark:bg-white/5 border-transparent text-stone-400'
                      }`}
                    >
                      <div className="capitalize">{lang === 'cebuano' ? 'Bisaya' : lang}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Practice Goal / Scenario Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900 dark:text-white">
                Practice Goal / Scenario:
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {configuringCoach.practiceExamples.map((ex, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedScenarioGoal(ex)}
                    className={`p-2.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      selectedScenarioGoal === ex
                        ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 text-stone-900 dark:text-white font-bold ring-1 ring-cyan-500/30'
                        : 'bg-stone-50 dark:bg-black/30 border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:border-cyan-400'
                    }`}
                  >
                    <span>{ex}</span>
                    {selectedScenarioGoal === ex && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900 dark:text-white">
                Difficulty Level:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDifficulty(lvl)}
                    className={`p-2 rounded-2xl text-xs font-bold text-center border transition-all cursor-pointer ${
                      difficulty === lvl
                        ? 'bg-teal-600 text-white border-teal-400 shadow-xs'
                        : 'bg-stone-50 dark:bg-black/30 border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Duration & Free Plan Notice */}
            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                <Clock className="w-4 h-4" />
                <span>Session Duration: 2 Minutes (Free Plan)</span>
              </div>
              <p className="text-[11px] text-cyan-300/80 leading-relaxed">
                Free sessions run up to 2 minutes with visible countdown and Whisper speech analysis. Your session automatically concludes with a full score and coach recommendations.
              </p>
            </div>

            {/* Start Button */}
            <div className="pt-2">
              <button
                onClick={handleStartSession}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-display font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Start 2-Minute Voice Session</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
