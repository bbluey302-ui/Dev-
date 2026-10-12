import React, { useState } from 'react';
import { 
  X, GraduationCap, Check, Share2, Sparkles, Trophy, Map, LayoutGrid 
} from 'lucide-react';
import { Module, Lesson, UserProfile } from '../types';
import { CourseData, COURSES } from '../data/coursesData';
import { LanguageJourneyMap } from './learn/LanguageJourneyMap';
import { LearnDashboard } from './learn/LearnDashboard';
import { CourseRoadmapView } from './learn/CourseRoadmapView';
import { QuickPracticeModal } from './learn/QuickPracticeModal';
import { sounds } from '../utils/soundEffects';

interface LearnScreenProps {
  modules: Module[];
  completedLessons: string[];
  onStartLesson: (lesson: Lesson) => void;
  onOpenSulti?: (prefillPrompt?: string) => void;
  profile?: UserProfile;
  onAddPracticeMinutes?: (mins: number) => void;
  onGoToProfile?: () => void;
}

export const LearnScreen: React.FC<LearnScreenProps> = ({
  modules,
  completedLessons,
  onStartLesson,
  onOpenSulti,
  profile,
  onAddPracticeMinutes,
  onGoToProfile,
}) => {
  // Navigation View: 'dashboard' = Courses & Roadmaps overview & tutors
  //                  'journey_map' = Game-like level map (Candy Crush / Duolingo style)
  //                  'course_view' = Detailed syllabus roadmap
  const [currentView, setCurrentView] = useState<'journey_map' | 'dashboard' | 'course_view'>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<CourseData>(COURSES[0]);
  const [activeQuickTool, setActiveQuickTool] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [copiedCert, setCopiedCert] = useState(false);

  // Flatten all lessons across modules to find the next active lesson
  const allLessons = modules.flatMap((m) => m.lessons);
  const nextLessonToLearn: Lesson = allLessons.find((l) => !completedLessons.includes(l.id)) || allLessons[0];
  const nextLessonModule = modules.find((m) => m.lessons.some((l) => l.id === nextLessonToLearn?.id)) || modules[0];

  const handleSelectCourse = (course: CourseData) => {
    setSelectedCourse(course);
    setCurrentView('course_view');
  };

  const handleCopyCertCode = () => {
    sounds.playTap();
    navigator.clipboard?.writeText('SULTI-JMC-2026-GD88');
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  };

  return (
    <div className="pb-24 px-4 pt-1 max-w-md mx-auto select-none space-y-3">
      
      {/* View Switcher Bar (Language Journey Map vs Course Syllabus) */}
      <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#11222D] rounded-2xl border border-stone-200/80 dark:border-white/10 shadow-2xs text-xs font-bold">
        <button
          onClick={() => {
            sounds.playTap();
            setCurrentView('journey_map');
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            currentView === 'journey_map'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Language Journey</span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setCurrentView('dashboard');
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            currentView === 'dashboard'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Curriculum Hub</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRIMARY EXPERIENCE: LANGUAGE JOURNEY GAME MAP                          */}
      {/* ========================================================================= */}
      {currentView === 'journey_map' && (
        <LanguageJourneyMap
          profile={profile}
          completedLessons={completedLessons}
          modules={modules}
          onStartLesson={onStartLesson}
          onOpenSulti={onOpenSulti}
          onOpenQuickPractice={(toolId) => setActiveQuickTool(toolId)}
          onOpenCertificateModal={() => setShowCertificateModal(true)}
          onGoToProfile={onGoToProfile}
        />
      )}

      {/* ========================================================================= */}
      {/* 2. CURRICULUM HUB / DASHBOARD                                             */}
      {/* ========================================================================= */}
      {currentView === 'dashboard' && (
        <LearnDashboard
          profile={profile}
          nextLesson={nextLessonToLearn}
          nextLessonModule={nextLessonModule}
          courses={COURSES}
          onStartLesson={onStartLesson}
          onSelectCourse={handleSelectCourse}
          onOpenQuickPractice={(tool) => setActiveQuickTool(tool)}
          onOpenSulti={onOpenSulti}
          onGoToProfile={onGoToProfile}
        />
      )}

      {/* ========================================================================= */}
      {/* 3. COURSE DETAIL & ROADMAP ("What am I learning and what is my roadmap?")  */}
      {/* ========================================================================= */}
      {currentView === 'course_view' && (
        <CourseRoadmapView
          course={selectedCourse}
          modules={modules}
          completedLessons={completedLessons}
          onBackToDashboard={() => setCurrentView('dashboard')}
          onStartLesson={onStartLesson}
          onOpenSulti={onOpenSulti}
          onOpenCertificateModal={() => setShowCertificateModal(true)}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. INDEPENDENT QUICK PRACTICE MODAL (Voice, Scenarios, Flashcards, Phrasebook) */}
      {/* ========================================================================= */}
      <QuickPracticeModal
        isOpen={Boolean(activeQuickTool)}
        tool={activeQuickTool}
        onClose={() => setActiveQuickTool(null)}
        onOpenSulti={onOpenSulti}
      />

      {/* ========================================================================= */}
      {/* 5. VERIFIED ACADEMIC CREDENTIAL CERTIFICATE MODAL                         */}
      {/* ========================================================================= */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#11222D] rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-white/10 space-y-4 text-center relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                sounds.playTap();
                setShowCertificateModal(false);
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Academic Seal */}
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-500 border-2 border-amber-300 dark:border-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <GraduationCap className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-teal-800 dark:text-teal-300 font-extrabold bg-teal-50 dark:bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-700">
                Jose Maria College Foundation, Inc.
              </span>
              <h3 className="font-display font-black text-lg text-stone-900 dark:text-white pt-1">
                Certificate of Bisaya Foundations
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Conferred to <span className="font-bold text-stone-900 dark:text-white">{profile?.name || 'Genesis Diaz'}</span> for successful completion and 92% mastery of Davao & Cebuano Bisaya fundamentals.
              </p>
            </div>

            {/* Detailed Academic Verification Data */}
            <div className="bg-stone-50 dark:bg-[#152B37] rounded-2xl p-3.5 border border-stone-200 dark:border-white/10 text-left space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Curriculum:</span>
                <span className="font-bold text-stone-900 dark:text-white">8 Levels · 40 Challenges</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Acoustic Accuracy:</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">91.4% Whisper STT</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Verification Code:</span>
                <span className="font-bold text-stone-900 dark:text-white">SULTI-JMC-2026-GD88</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleCopyCertCode}
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 transition-all"
              >
                {copiedCert ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied Verification Code!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Copy Verification Credential</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
