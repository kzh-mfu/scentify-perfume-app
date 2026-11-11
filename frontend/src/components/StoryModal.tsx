/*
 * Team member: Saw Keh Blu (6831503087)
 * Frontend tasks: studio story content, media presentation, and modal interactions.
 */
import React from 'react';
import { X, Play, Volume2, Sparkles } from 'lucide-react';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScentify: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  isOpen,
  onClose,
  onOpenScentify,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#28192A]/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative max-w-2xl w-full bg-[#FBF7F0] border border-[#DAD1C5] shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-[#6B6166] hover:text-[#28192A]"
          aria-label="Close Story"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-2">
          Documentary Short · Chiang Rai Studio
        </span>
        <h2 className="font-serif text-3xl text-[#28192A] mb-4">
          The Art of Personal Fragrance
        </h2>

        {/* Video Simulator Container */}
        <div className="relative bg-[#28192A] aspect-video w-full flex flex-col items-center justify-center text-center p-6 border border-[#DAD1C5]/40 shadow-inner overflow-hidden group">
          <img
            src="/assets/botanicals/hero_display.png"
            alt="Scentify bottles and pressed botanicals"
            className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700 select-none"
          />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#FBF7F0]/90 border border-[#C9A25C] flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-[#28192A] fill-[#28192A] ml-1" />
            </div>
            <span className="text-xs uppercase tracking-widest text-[#FFFDF8] mt-4 font-medium">
              Watch The Botanical Extraction Process (3:15)
            </span>
            <p className="text-[11px] text-[#DAD1C5]/80 mt-1 max-w-md font-light">
              Follow our perfumers across northern mountains as they distill rare sambac jasmine and wild agarwood into timeless flacons.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#6B6166]">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#C9A25C]" />
            <span>Stereo sound · Subtitled in English &amp; Thai</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenScentify();
              }}
              className="px-5 py-2.5 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-wider hover:bg-[#3D2540] transition-colors"
            >
              Compose Scent Now →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
