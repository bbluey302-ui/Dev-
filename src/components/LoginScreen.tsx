import React, { useState } from 'react';
import { 
  Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, 
  CheckCircle2, AlertCircle, Shield, Globe, BookOpen, 
  Volume2, Compass, Heart, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/soundEffects';
import { ASSETS } from '../assets/images';

interface LoginScreenProps {
  onSuccess?: () => void;
  onContinueAsGuest?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onSuccess,
  onContinueAsGuest 
}) => {
  const { 
    loginWithEmail, 
    signUpWithEmail, 
    loginWithGoogle, 
    loginWithDemo, 
    resetPassword,
    isLoading,
    isSupabaseLive 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<'bisaya' | 'filipino'>('bisaya');

  // Handle Google Provider Sign-In
  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    sounds.playTap();
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        sounds.playCorrect();
        onSuccess?.();
      } else if (res.error) {
        setError(res.error);
        sounds.playWrong();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate with Google Provider.');
      sounds.playWrong();
    }
  };

  // Handle Email Provider Sign-In / Sign-Up
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Palihug isulod ang imong email address (Please enter your email).');
      sounds.playWrong();
      return;
    }

    if (mode === 'forgot') {
      sounds.playTap();
      const res = await resetPassword(cleanEmail);
      if (res.success) {
        sounds.playCorrect();
        setSuccessMessage(`Gipadala ang password reset link sa ${cleanEmail}. Palihug tan-awa ang imong inbox.`);
      } else {
        setError(res.error || 'Failed to send password recovery link.');
        sounds.playWrong();
      }
      return;
    }

    if (!password) {
      setError('Palihug isulod ang imong password (Please enter your password).');
      sounds.playWrong();
      return;
    }

    sounds.playTap();

    if (mode === 'signup') {
      const res = await signUpWithEmail(cleanEmail, password, name);
      if (res.success) {
        sounds.playCorrect();
        if (res.message) {
          setSuccessMessage(res.message);
        } else {
          onSuccess?.();
        }
      } else {
        setError(res.error || 'Account creation encountered an issue.');
        sounds.playWrong();
      }
    } else {
      const res = await loginWithEmail(cleanEmail, password);
      if (res.success) {
        sounds.playCorrect();
        onSuccess?.();
      } else {
        setError(res.error || 'Invalid email or password. Please verify your credentials.');
        sounds.playWrong();
      }
    }
  };

  // Quick preset demo login
  const handleQuickDemo = (demoEmail: string, demoName: string) => {
    sounds.playTap();
    loginWithDemo(demoEmail, demoName);
    sounds.playCorrect();
    onSuccess?.();
  };

  return (
    <div className="min-h-screen bg-[#0A121D] text-white flex flex-col justify-between selection:bg-teal-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Ambience & Cultural Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="w-full max-w-md mx-auto px-5 pt-6 pb-2 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl overflow-hidden border border-teal-500/30 bg-teal-950/60 p-0.5 shadow-md flex items-center justify-center">
            <img 
              src={ASSETS.tutorMascot} 
              alt="SultiAI Mascot" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <div className="font-display font-black text-lg tracking-tight leading-none text-white flex items-center gap-1">
              Sulti<span className="text-teal-400">AI</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold ml-1">
                v2.2
              </span>
            </div>
            <p className="text-[9.5px] font-mono text-stone-400 tracking-wider uppercase mt-0.5">
              Bisaya & Filipino Language Hub
            </p>
          </div>
        </div>

        {/* Supabase Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#11222D] border border-white/10 text-[10px] font-mono text-stone-400">
          <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-400 animate-pulse' : 'bg-teal-400'}`} />
          <span>{isSupabaseLive ? 'Supabase Live' : 'Cloud Ready'}</span>
        </div>
      </header>

      {/* Main Form Centerpiece */}
      <main className="w-full max-w-md mx-auto px-5 py-4 flex-1 flex flex-col justify-center relative z-10">
        {/* Welcome Hero Badge */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Maayong Pag-abot! (Welcome to SultiAI)</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white">
            {mode === 'login' && 'Sign in to continue learning'}
            {mode === 'signup' && 'Create your SultiAI account'}
            {mode === 'forgot' && 'Reset your password'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-xs mx-auto">
            {mode === 'login' && 'Practice conversational Bisaya & Filipino with your AI voice companion.'}
            {mode === 'signup' && 'Track streaks, save vocabulary, and earn Bahandi Gems across devices.'}
            {mode === 'forgot' && 'Enter your email address and we will dispatch a password recovery link.'}
          </p>
        </div>

        {/* Authentication Card */}
        <div className="bg-[#11222D] rounded-3xl p-6 border border-white/10 shadow-2xl space-y-5 backdrop-blur-xl">
          {/* PROVIDER 1: Google Provider Button */}
          {mode !== 'forgot' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-sm flex items-center justify-center gap-3 transition-all duration-150 shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                {/* Official Google Icon SVG */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Or Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                  O Gamita ang Email
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </div>
          )}

          {/* Error & Feedback Banner */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* PROVIDER 2: Email Provider Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3 h-3 text-teal-400" />
                  Pangalan (Display Name)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Genesis Diaz"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900/80 border border-white/15 focus:border-teal-400 focus:outline-none text-sm text-white placeholder-stone-500 transition-colors"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-teal-400" />
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ikaw@pananglitan.ph"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900/80 border border-white/15 focus:border-teal-400 focus:outline-none text-sm text-white placeholder-stone-500 transition-colors"
              />
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-teal-400" />
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playTap();
                        setMode('forgot');
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
                    >
                      Nakalimot sa Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-stone-900/80 border border-white/15 focus:border-teal-400 focus:outline-none text-sm text-white placeholder-stone-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-900/40 active:scale-[0.99] cursor-pointer disabled:opacity-60 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Palihug hulat...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In with Email'}
                    {mode === 'signup' && 'Create SultiAI Account'}
                    {mode === 'forgot' && 'Send Recovery Email'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switcher Footer */}
          <div className="pt-2 border-t border-white/10 text-center text-xs text-stone-400">
            {mode === 'login' ? (
              <p>
                Wala pa kay account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setMode('signup');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-teal-400 hover:text-teal-300 underline cursor-pointer"
                >
                  Sign Up Dinhi
                </button>
              </p>
            ) : (
              <p>
                Naa na kay account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setMode('login');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-teal-400 hover:text-teal-300 underline cursor-pointer"
                >
                  Balik sa Log In
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Demo Fast Track Card */}
        <div className="mt-4 p-3.5 bg-[#11222D]/60 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-mono text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              Quick One-Click Demo Access
            </span>
            <span className="text-[10px] text-teal-400 font-mono">Instant Try</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('genesis.diaz@sultiai.ph', 'Genesis Diaz')}
              className="px-3 py-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-white/10 text-left text-xs transition-colors cursor-pointer flex flex-col"
            >
              <span className="font-bold text-white text-[11.5px] truncate">Genesis Diaz</span>
              <span className="text-[9.5px] text-teal-400 font-mono">Level 3 • Davao Bisaya</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('maya.santos@sultiai.ph', 'Maya Santos')}
              className="px-3 py-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-white/10 text-left text-xs transition-colors cursor-pointer flex flex-col"
            >
              <span className="font-bold text-white text-[11.5px] truncate">Maya Santos</span>
              <span className="text-[9.5px] text-teal-400 font-mono">New Learner • Cebuano</span>
            </button>
          </div>
          {onContinueAsGuest && (
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="w-full text-center py-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            >
              Padayon isip Bisita (Explore as Guest) →
            </button>
          )}
        </div>
      </main>

      {/* Footer Credentials & Assurance */}
      <footer className="w-full max-w-md mx-auto px-5 py-4 text-center text-[10px] text-stone-500 space-y-1 relative z-10">
        <div>SultiAI Platform • Secured with Supabase Auth & JWT Sessions</div>
        <div>Conversational AI Language Learning for Bisaya & Regional Dialects</div>
      </footer>
    </div>
  );
};
