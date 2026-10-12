import React, { useState } from 'react';
import { 
  Play, ChevronRight, Mic, MessageSquare, Layers, BookOpen, 
  Flame, Award, Zap, Sparkles, Target, ArrowRight, CheckCircle2, 
  Circle, Trophy, BarChart2, Star, ShieldCheck, Compass, Check,
  UserPlus, UserCheck, ExternalLink, Users, Map
} from 'lucide-react';
import { Lesson, UserProfile, Module } from '../../types';
import { CourseData, COURSES } from '../../data/coursesData';
import { TOOLKIT_MODULES, ToolkitModule } from '../../data/toolkitModulesData';
import { sounds } from '../../utils/soundEffects';
import { TutorDirectoryModal } from '../tutor/TutorDirectoryModal';
import { ApplyTutorModal } from '../tutor/ApplyTutorModal';
import { LinkedInIcon } from '../tutor/LinkedInIcon';
import { getApprovedTutors, Tutor, TutorLanguage } from '../../data/tutorsData';

interface LearnDashboardProps {
  profile?: UserProfile;
  nextLesson: Lesson;
  nextLessonModule?: Module;
  courses?: CourseData[];
  onStartLesson: (lesson: Lesson) => void;
  onSelectCourse: (course: CourseData) => void;
  onOpenQuickPractice: (tool: string) => void;
  onOpenSulti?: (prompt?: string) => void;
  onGoToProfile?: () => void;
}

export const LearnDashboard: React.FC<LearnDashboardProps> = ({
  profile,
  nextLesson,
  nextLessonModule,
  courses = COURSES,
  onStartLesson,
  onSelectCourse,
  onOpenQuickPractice,
  onOpenSulti,
  onGoToProfile,
}) => {
  const currentCourse = courses[0]; // Beginner Bisaya
  const streak = profile?.streakDays ?? 7;
  const xp = profile?.xp ?? 1240;
  const speakingScore = profile?.speechScoreAverage ?? 86;
  const vocabCount = profile?.vocabularyMastered ?? 74;

  // Course category filter state: default to Cebuano or saved preference (3 language buttons only)
  const [courseCategoryFilter, setCourseCategoryFilter] = useState<'cebuano' | 'filipino' | 'english'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sultiai_selected_language');
      if (saved === 'cebuano' || saved === 'filipino' || saved === 'english') {
        return saved as 'cebuano' | 'filipino' | 'english';
      }
    }
    return 'cebuano';
  });

  // Filter courses by selected language category
  const filteredCourses = courses.filter((c) => {
    return c.languageCategory === courseCategoryFilter;
  });

  // View state for Learning Toolkit: show first 6 or all 13 modules
  const [showAllModules, setShowAllModules] = useState(false);

  // Tutor Hub State
  const [showTutorDirectory, setShowTutorDirectory] = useState(false);
  const [tutorFilter, setTutorFilter] = useState<TutorLanguage | 'all'>('all');
  const [showApplyTutorModal, setShowApplyTutorModal] = useState(false);
  const [activeTutorsList, setActiveTutorsList] = useState<Tutor[]>(() => getApprovedTutors());

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = profile?.name?.split(' ')[0] || 'Genesis';
    if (hour < 12) {
      return `Good morning, ${name} 👋`;
    } else if (hour < 18) {
      return `Good afternoon, ${name} 👋`;
    } else {
      return `Good evening, ${name} 👋`;
    }
  };

  const displayedModules = showAllModules ? TOOLKIT_MODULES : TOOLKIT_MODULES.slice(0, 6);

  // Beginner Bisaya Roadmap Milestones
  const ROADMAP_STEPS = [
    { title: 'Foundation', status: 'done' },
    { title: 'Everyday Bisaya', status: 'done' },
    { title: 'Real Conversations', status: 'current' },
    { title: 'Real-World Practice', status: 'locked' },
    { title: 'Speaking Challenge', status: 'locked' },
    { title: 'Assessment', status: 'locked' },
    { title: 'Certificate', status: 'locked' },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. COURSES & ROADMAPS (INTERACTIVE LEARNING PATHS) — PRIMARY VIEW         */}
      {/* ========================================================================= */}
      <div className="space-y-3.5">
        {/* Section Header */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-500/30 shadow-2xs">
              <Map className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-display font-black uppercase tracking-wider text-stone-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                <span>Courses & Roadmaps</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-700/40 font-bold uppercase">
                  Interactive Paths
                </span>
              </h2>
              <p className="text-[10.5px] text-stone-500 dark:text-stone-400 font-medium">
                Choose your learning language and explore step-by-step milestone roadmaps
              </p>
            </div>
          </div>
        </div>

        {/* Course Language Category Filter Tabs (3 languages: Cebuano/Bisaya, Filipino/Tagalog, English) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/60 rounded-2xl border border-stone-200/80 dark:border-white/5 text-xs font-bold">
          {[
            { id: 'cebuano', label: '🇵🇭 Cebuano / Bisaya' },
            { id: 'filipino', label: '🇵🇭 Filipino / Tagalog' },
            { id: 'english', label: '🌎 English' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playTap();
                setCourseCategoryFilter(cat.id as 'cebuano' | 'filipino' | 'english');
                if (typeof window !== 'undefined') {
                  localStorage.setItem('sultiai_selected_language', cat.id);
                }
              }}
              className={`px-2 py-2.5 rounded-xl text-center whitespace-nowrap transition-all cursor-pointer font-bold text-xs truncate ${
                courseCategoryFilter === cat.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Dynamic Categorized Course Cards with Rich Roadmap Previews */}
        <div className="space-y-3">
          {filteredCourses.map((courseItem) => {
            const flag = courseItem.languageCategory === 'filipino' ? '🇵🇭' : courseItem.languageCategory === 'english' ? '🌎' : '🇵🇭';
            return (
              <div 
                key={courseItem.id}
                onClick={() => {
                  sounds.playTap();
                  onSelectCourse(courseItem);
                }}
                className="p-4 sm:p-5 bg-white dark:bg-[#11222D] hover:bg-stone-50 dark:hover:bg-[#152B37] rounded-3xl border border-stone-200/90 dark:border-white/10 shadow-xs hover:shadow-sm transition-all cursor-pointer group space-y-3.5 relative overflow-hidden"
              >
                {/* Accent glow corner */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/5 dark:bg-teal-400/5 rounded-full blur-xl pointer-events-none" />

                {/* Card Title Row */}
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg">{flag}</span>
                      <h3 className="font-display font-black text-sm sm:text-base text-stone-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {courseItem.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-black uppercase bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-500/30">
                        {courseItem.level}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                      {courseItem.subtitle}
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-mono font-black text-xs text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 border border-teal-200/60 dark:border-teal-700/40 px-2.5 py-1 rounded-xl shadow-2xs">
                      {courseItem.progressPercent}%
                    </span>
                    <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500 mt-0.5">
                      {courseItem.completedLessonsCount}/{courseItem.totalLessons} lessons
                    </span>
                  </div>
                </div>

                {/* Roadmap Milestone Steps Ribbon */}
                {courseItem.roadmapSteps && courseItem.roadmapSteps.length > 0 && (
                  <div className="p-2.5 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-stone-150 dark:border-white/5 space-y-1.5 relative z-10">
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">
                      <span>Curriculum Roadmap</span>
                      <span className="text-teal-600 dark:text-teal-400">
                        {courseItem.roadmapSteps.length} Milestones
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      {courseItem.roadmapSteps.slice(0, 5).map((step, idx) => (
                        <div
                          key={step.id}
                          className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg bg-white dark:bg-[#11222D] border border-stone-200/70 dark:border-white/10 text-[10px] font-mono font-bold text-stone-600 dark:text-stone-300"
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[9px] flex items-center justify-center font-black">
                            {idx + 1}
                          </span>
                          <span className="truncate max-w-[90px]">{step.title}</span>
                        </div>
                      ))}
                      {courseItem.roadmapSteps.length > 5 && (
                        <span className="text-[10px] font-mono text-stone-400 px-1 font-bold">
                          +{courseItem.roadmapSteps.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress Bar & Open Roadmap Button */}
                <div className="space-y-2 relative z-10">
                  <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden p-0.5 border border-stone-200/50 dark:border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-300"
                      style={{ width: `${courseItem.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                    <span>{courseItem.totalLessons} Lessons · {courseItem.estimatedHours}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playTap();
                        onSelectCourse(courseItem);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <span>Explore Roadmap</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2.5 FIND A PERSONAL TUTOR (HUMAN TUTOR HUB)                                */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs px-1">
          <div>
            <span className="font-display font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 text-[11px]">
              Find a Tutor
            </span>
            <span className="text-[10px] text-stone-400 block font-medium">
              Practice with a real language tutor and improve your confidence.
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              setTutorFilter('all');
              setShowTutorDirectory(true);
            }}
            className="text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All Tutors →</span>
          </button>
        </div>

        {/* 2-Column Choice: Bisaya Tutor vs Filipino Tutor */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Bisaya Tutor Card */}
          <div 
            onClick={() => {
              sounds.playTap();
              setTutorFilter('cebuano');
              setShowTutorDirectory(true);
            }}
            className="p-3.5 bg-gradient-to-br from-blue-50/90 to-white dark:from-[#132735] dark:to-[#11222D] hover:from-blue-100/80 dark:hover:from-[#173244] rounded-2xl border border-blue-200/80 dark:border-blue-500/30 shadow-2xs transition-all cursor-pointer group flex flex-col justify-between min-h-[136px]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xl">🟦</span>
                <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 text-[9px] font-mono font-bold">
                  Vetted
                </span>
              </div>
              <h4 className="font-display font-black text-xs sm:text-sm text-stone-900 dark:text-white mt-1.5 group-hover:text-blue-600 transition-colors">
                Bisaya Tutor
              </h4>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium leading-tight mt-0.5">
                Cebuano conversation, pronunciation, grammar
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-blue-700 dark:text-blue-300">
              <span>Find Bisaya Tutor</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Filipino Tutor Card */}
          <div 
            onClick={() => {
              sounds.playTap();
              setTutorFilter('filipino');
              setShowTutorDirectory(true);
            }}
            className="p-3.5 bg-gradient-to-br from-amber-50/90 to-white dark:from-[#2a2415] dark:to-[#11222D] hover:from-amber-100/80 dark:hover:from-[#352c17] rounded-2xl border border-amber-200/80 dark:border-amber-500/30 shadow-2xs transition-all cursor-pointer group flex flex-col justify-between min-h-[136px]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xl">🟨</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 text-[9px] font-mono font-bold">
                  Vetted
                </span>
              </div>
              <h4 className="font-display font-black text-xs sm:text-sm text-stone-900 dark:text-white mt-1.5 group-hover:text-amber-600 transition-colors">
                Filipino Tutor
              </h4>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium leading-tight mt-0.5">
                Tagalog conversation, pronunciation, grammar
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-300">
              <span>Find Filipino Tutor</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>

        {/* Featured Tutor Spotlight */}
        {activeTutorsList.slice(0, 1).map((topTutor) => (
          <div 
            key={topTutor.id}
            className="p-3 bg-white dark:bg-[#11222D] rounded-2xl border border-stone-200/90 dark:border-white/10 shadow-2xs space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black font-display text-xs flex items-center justify-center shrink-0">
                  {topTutor.avatarInitials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h5 className="font-display font-bold text-xs text-stone-900 dark:text-white truncate">
                      {topTutor.name}
                    </h5>
                    <span title="SultiAI Academic Vetted">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                    {topTutor.title} · ₱{topTutor.hourlyRatePhp}/hr
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playTap();
                  setTutorFilter(topTutor.language === 'both' ? 'all' : topTutor.language);
                  setShowTutorDirectory(true);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold text-[10px] flex items-center gap-1 transition-all shrink-0 shadow-2xs cursor-pointer"
              >
                <span>Book Tutor →</span>
              </button>
            </div>
          </div>
        ))}

        {/* Discreet Academic Contact / Collaboration Note */}
        <div className="pt-1 px-1 flex items-center justify-between text-[10.5px] text-stone-600 dark:text-stone-300">
          <span>Interested in teaching or academic partnership?</span>
          <a
            href="mailto:genesis.diaz@jmc.edu.ph?subject=SultiAI%20Tutor%20%26%20Academic%20Inquiry"
            className="text-teal-700 dark:text-teal-300 hover:underline font-bold"
          >
            Contact Developer →
          </a>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LEARNING TOOLKIT — ALL 13 MODULES                                      */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs px-1">
          <div>
            <span className="font-display font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 text-[11px]">
              Learning Toolkit
            </span>
            <span className="text-[10px] text-stone-400 block font-medium">
              All 13 Modules · Independent Practice
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              setShowAllModules(!showAllModules);
            }}
            className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-500/30 hover:bg-teal-100 transition-colors cursor-pointer"
          >
            {showAllModules ? 'Show Top 6' : 'View All 13 Modules →'}
          </button>
        </div>

        {/* 2-Column Responsive Grid on Mobile */}
        <div className="grid grid-cols-2 gap-2.5">
          {displayedModules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => {
                sounds.playTap();
                onOpenQuickPractice(mod.id);
              }}
              className="p-3 bg-white dark:bg-[#11222D] hover:bg-stone-50 dark:hover:bg-[#152B37] rounded-2xl border border-stone-200/90 dark:border-white/10 text-left transition-all active:scale-[0.98] cursor-pointer shadow-2xs group flex flex-col justify-between min-h-[118px]"
            >
              {/* Header: Module number + icon */}
              <div className="flex items-start justify-between w-full">
                <span className="text-[10px] font-mono font-black text-stone-400 dark:text-stone-500">
                  {mod.num}
                </span>
                <span className="text-lg group-hover:scale-110 transition-transform">
                  {mod.icon}
                </span>
              </div>

              {/* Title & Purpose */}
              <div className="my-1">
                <h4 className="font-display font-black text-xs text-stone-900 dark:text-white leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {mod.title}
                </h4>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5 font-medium">
                  {mod.purpose}
                </p>
                {mod.gamificationBadge && (
                  <span className="inline-block mt-1 text-[8px] font-mono font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-200/50 dark:border-teal-700/40 truncate max-w-full">
                    {mod.gamificationBadge}
                  </span>
                )}
              </div>

              {/* Progress Bar + Arrow */}
              <div className="pt-1 w-full space-y-1">
                <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full transition-all"
                    style={{ width: `${mod.progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-stone-400">
                  <span>{mod.progressPercent}%</span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PRACTICE WITH SULTI (PRIMARY COMPANION CTA)                             */}
      {/* ========================================================================= */}
      <div className="p-5 bg-gradient-to-br from-purple-900 via-indigo-900 to-[#11222D] text-white rounded-3xl shadow-lg border border-purple-500/30 space-y-3.5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center font-bold text-base">
              🤖
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold">
              AI Speech Companion
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-500/40 text-purple-200 border border-purple-400/30">
            One Companion
          </span>
        </div>

        <div className="space-y-1 relative z-10">
          <h3 className="font-display font-black text-lg text-white leading-tight">
            Practice with SULTI
          </h3>
          <p className="text-xs text-purple-200 leading-relaxed font-normal">
            Speak naturally. Get contextual feedback. Learn from your mistakes. SULTI connects all 13 modules into one cohesive learning companion.
          </p>
        </div>

        {/* Connected Modules Chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-purple-200 pt-0.5 relative z-10">
          <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10">🎙️ Voice</span>
          <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10">🎭 Scenario</span>
          <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10">🎯 Pronunciation</span>
          <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10">🎧 Listening</span>
          <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10">🔄 Switch</span>
          <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10">🔁 Review</span>
        </div>

        <button
          onClick={() => {
            sounds.playTap();
            onOpenSulti?.('Kumusta SULTI! Gusto kong magpraktis og pagsulti sa Bisaya karon.');
          }}
          className="w-full min-h-[44px] bg-white text-purple-950 hover:bg-purple-50 rounded-2xl text-xs font-black py-2.5 px-4 flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer relative z-10 active:scale-[0.98]"
        >
          <MessageSquare className="w-4 h-4 text-purple-900" />
          <span>Start Speaking →</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 5. YOUR PROGRESS SECTION                                                  */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#11222D] rounded-3xl p-4 sm:p-5 border border-stone-200/90 dark:border-white/10 shadow-xs space-y-3.5 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-xs uppercase tracking-wider text-stone-900 dark:text-white">
            Your Progress
          </h3>
          <button
            onClick={() => {
              sounds.playTap();
              onGoToProfile?.();
            }}
            className="text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline cursor-pointer"
          >
            View Full Progress →
          </button>
        </div>

        {/* 4 Essential Metrics with Visual Progress Bars */}
        <div className="space-y-2.5 text-xs font-mono">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">COURSE PROGRESS</span>
              <span className="font-black text-stone-900 dark:text-white">72%</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: '72%' }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">SPEAKING</span>
              <span className="font-black text-blue-600 dark:text-blue-400">86%</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '86%' }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">VOCABULARY</span>
              <span className="font-black text-purple-600 dark:text-purple-400">74%</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: '74%' }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">PRONUNCIATION</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">82%</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '82%' }} />
            </div>
          </div>
        </div>

        {/* Milestone Summary Pill Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 dark:border-white/5 text-center text-xs">
          <div className="p-2 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
            <div className="font-black font-display text-sm text-amber-600 dark:text-amber-400">
              🔥 7 Days
            </div>
            <div className="text-[10px] text-stone-400 font-medium">Daily Streak</div>
          </div>

          <div className="p-2 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
            <div className="font-black font-display text-sm text-teal-600 dark:text-teal-400">
              ⭐ 1,240 XP
            </div>
            <div className="text-[10px] text-stone-400 font-medium">Experience</div>
          </div>

          <div className="p-2 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
            <div className="font-black font-display text-sm text-indigo-600 dark:text-indigo-400">
              🏆 6 Badges
            </div>
            <div className="text-[10px] text-stone-400 font-medium">Achievements</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. DAILY LEARNING GOALS                                                   */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#11222D] rounded-3xl p-4 sm:p-5 border border-stone-200/90 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-xs uppercase tracking-wider text-stone-900 dark:text-white flex items-center gap-1.5">
            <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Today's Learning Goal</span>
          </h3>
          <span className="text-[10px] font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-500/30">
            3 / 5 completed
          </span>
        </div>

        {/* Goal Checklist */}
        <div className="space-y-2">
          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🎙️</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">Voice Practice</span>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </span>
          </div>

          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🃏</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">Review Flashcards</span>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </span>
          </div>

          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🎯</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">Pronunciation Lab</span>
            </div>
            <span className="text-stone-400 font-medium">
              ○ 1 drill left
            </span>
          </div>

          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">📚</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">Learn Vocabulary</span>
            </div>
            <span className="text-stone-400 font-medium">
              ○ 2 words left
            </span>
          </div>
        </div>

        {/* Overall Completion Progress */}
        <div className="pt-1">
          <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full transition-all" style={{ width: '60%' }} />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. LEARN JOURNEY (THE COMPLETE ROADMAP HIERARCHY)                          */}
      {/* ========================================================================= */}
      <div className="bg-stone-50 dark:bg-[#11222D]/80 rounded-3xl p-4 sm:p-5 border border-stone-200/80 dark:border-white/10 space-y-3 text-center">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-teal-600 dark:text-teal-400 font-bold">
            Curriculum Architecture
          </span>
          <h4 className="font-display font-black text-xs text-stone-900 dark:text-white">
            Your Complete Learning Journey
          </h4>
        </div>

        {/* Stepped Journey Visualization */}
        <div className="py-2 flex flex-col items-center gap-1 font-mono text-xs">
          <span className="px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-black text-[10px]">
            START
          </span>
          <span className="text-stone-400">↓</span>
          <span className="font-bold text-stone-700 dark:text-stone-300 text-[11px]">Learn</span>
          <span className="text-stone-400">↓</span>
          <span className="font-bold text-stone-700 dark:text-stone-300 text-[11px]">Practice</span>
          <span className="text-stone-400">↓</span>
          <span className="font-black text-purple-600 dark:text-purple-400 text-xs">Speak with SULTI</span>
          <span className="text-stone-400">↓</span>
          <span className="font-bold text-stone-700 dark:text-stone-300 text-[11px]">Get Feedback</span>
          <span className="text-stone-400">↓</span>
          <span className="font-bold text-stone-700 dark:text-stone-300 text-[11px]">Track Progress</span>
          <span className="text-stone-400">↓</span>
          <span className="font-bold text-stone-700 dark:text-stone-300 text-[11px]">Assessment</span>
          <span className="text-stone-400">↓</span>
          <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-[10px] flex items-center gap-1 shadow-2xs">
            🏆 CERTIFICATE
          </span>
        </div>

        <p className="text-[10px] text-stone-400 dark:text-stone-500 max-w-xs mx-auto">
          "13 Modules. One Companion. Continuous Fluency."
        </p>
      </div>

      {/* ========================================================================= */}
      {/* TUTOR DIRECTORY & APPLICATION MODALS                                      */}
      {/* ========================================================================= */}
      <TutorDirectoryModal
        isOpen={showTutorDirectory}
        onClose={() => setShowTutorDirectory(false)}
        initialFilter={tutorFilter}
      />

      <ApplyTutorModal
        isOpen={showApplyTutorModal}
        onClose={() => setShowApplyTutorModal(false)}
        onSuccess={(newTutor) => {
          setActiveTutorsList(getApprovedTutors());
          setShowApplyTutorModal(false);
          setShowTutorDirectory(true);
        }}
      />

    </div>
  );
};
