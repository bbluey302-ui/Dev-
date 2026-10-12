import React, { useState } from 'react';
import { X, Check, Sparkles, User, ShieldCheck } from 'lucide-react';
import { SULTI_AVATARS, SultiAvatar } from './types';
import { sounds } from '../../utils/soundEffects';
import { addNotification } from '../../utils/notificationService';
import { supabase } from '../../services/supabaseClient';

interface AvatarSelectionModalProps {
  currentAvatar: string;
  onSelectAvatar: (avatarUrl: string) => void;
  onClose: () => void;
  userId?: string;
}

export const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({
  currentAvatar,
  onSelectAvatar,
  onClose,
  userId,
}) => {
  const [selectedUrl, setSelectedUrl] = useState(currentAvatar);

  const handleConfirm = async () => {
    sounds.playTap();
    onSelectAvatar(selectedUrl);

    // Sync to Supabase profiles table if available
    if (supabase && userId) {
      try {
        await supabase.from('profiles').update({
          avatar_url: selectedUrl,
          updated_at: new Date().toISOString(),
        }).eq('id', userId);
      } catch (err) {
        console.warn('Avatar update warning:', err);
      }
    }

    addNotification({
      category: 'system',
      title: '🎭 New Avatar Selected',
      titleBisaya: 'Gibag-o ang Imong Avatar',
      message: 'Your profile avatar has been updated across your learning dashboard.',
      iconType: 'sparkles',
    });

    sounds.playCorrect();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#11222D] rounded-3xl border border-stone-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-labelledby="avatar-picker-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200/80 dark:border-white/10 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="avatar-picker-title" className="font-display font-black text-sm text-stone-900 dark:text-white">
                Choose SultiAI Avatar
              </h2>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">
                Select your persona for conversations and leaderboards
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Preview Hero */}
        <div className="p-4 bg-gradient-to-b from-teal-50/40 to-transparent dark:from-teal-950/20 dark:to-transparent flex items-center gap-4 border-b border-stone-100 dark:border-white/5">
          <div className="relative">
            <img
              src={selectedUrl}
              alt="Selected Preview"
              className="w-16 h-16 rounded-full object-cover border-4 border-teal-500 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] border-2 border-white dark:border-[#11222D]">
              ✓
            </span>
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Active Selection Preview
            </div>
            <div className="font-display font-black text-sm text-stone-900 dark:text-white">
              {SULTI_AVATARS.find((a) => a.url === selectedUrl)?.name || 'Custom Avatar'}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400">
              {SULTI_AVATARS.find((a) => a.url === selectedUrl)?.role || 'SultiAI Learner'}
            </div>
          </div>
        </div>

        {/* Avatars Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-3 gap-3 flex-1">
          {SULTI_AVATARS.map((avatar) => {
            const isSelected = selectedUrl === avatar.url;
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => {
                  sounds.playTap();
                  setSelectedUrl(avatar.url);
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer relative group ${
                  isSelected
                    ? 'bg-teal-50/80 dark:bg-teal-950/60 border-teal-500 shadow-md ring-2 ring-teal-500/30 scale-[1.02]'
                    : 'bg-white dark:bg-stone-800/60 border-stone-200 dark:border-white/10 hover:border-teal-400/60'
                }`}
              >
                <div className="relative">
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-stone-200 dark:border-white/10 group-hover:scale-105 transition-transform"
                  />
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-teal-500 text-stone-950 flex items-center justify-center text-[11px] font-black shadow-xs">
                      ✓
                    </span>
                  )}
                </div>
                <div className="min-w-0 w-full">
                  <div className="font-display font-black text-[11.5px] text-stone-900 dark:text-white truncate">
                    {avatar.name}
                  </div>
                  <div className="text-[9.5px] text-stone-500 dark:text-stone-400 truncate">
                    {avatar.tag}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200/80 dark:border-white/10 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/40">
          <span className="text-[10px] text-stone-400">
            {SULTI_AVATARS.length} official avatars available
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-stone-950 flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Avatar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
