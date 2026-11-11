/*
 * Team member: Saw Keh Blu (6831503087)
 * Frontend tasks: home page presentation, navigation, and customer entry points.
 */
import React from 'react';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { ViewMode } from '../types';

interface HomeViewProps {
  onNavigate: (view: ViewMode) => void;
  onOpenStoryModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenStoryModal }) => {
  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#28192A]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#DAD1C5]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-16 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-5 flex flex-col items-start z-10">
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#6B6166] font-medium mb-4 sm:mb-6">
                The Art of Personal Fragrance
              </span>
              
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-[#28192A] mb-6">
                A scent <br />
                <span className="italic font-normal">of your own.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-[#6B6166] font-light max-w-md leading-relaxed mb-8 sm:mb-10">
                Compose a fragrance as individual as you are. Distinctive natural botanicals distilled into a signature that moves with you.
              </p>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <button
                  onClick={() => onNavigate('scentify')}
                  className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#3D2540] transition-all shadow-sm hover:shadow-md group"
                >
                  <span>Create your perfume</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onOpenStoryModal}
                  className="inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.18em] text-[#28192A] hover:text-[#C9A25C] font-medium transition-colors py-2"
                >
                  <span className="w-7 h-7 rounded-full border border-[#28192A]/30 flex items-center justify-center">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </span>
                  <span>Watch Our Story</span>
                </button>
              </div>
            </div>

            {/* Right Visual: 3 Bottles with pressed botanicals */}
            <div className="lg:col-span-7 relative">
              <div className="relative rounded-2xl bg-gradient-to-b from-[#FBF7F0]/80 to-[#FFFDF8] p-4 sm:p-6 border border-[#DAD1C5]/30 shadow-xs">
                
                {/* Botanical overlay artwork */}
                <div className="w-full flex justify-center">
                  <img
                    src="/assets/botanicals/hero_display.png"
                    alt="Scentify Signature Bottles: Violet, Magnolia, Pansy"
                    className="w-full max-h-[460px] object-contain drop-shadow-sm select-none"
                    onError={(e) => {
                      // Fallback in case of image load delay
                      (e.target as HTMLImageElement).src = '/assets/botanicals/hero_bottles.png';
                    }}
                  />
                </div>

                {/* Subtitle labels */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-serif text-xs sm:text-sm font-medium text-[#28192A]">Violet</span>
                    <span className="text-[9px] sm:text-[10px] tracking-widest text-[#6B6166] uppercase mt-0.5">
                      Soft Floral · Green
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-serif text-xs sm:text-sm font-medium text-[#28192A]">Magnolia</span>
                    <span className="text-[9px] sm:text-[10px] tracking-widest text-[#6B6166] uppercase mt-0.5">
                      Airy Floral · Radiant
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-serif text-xs sm:text-sm font-medium text-[#28192A]">Pansy</span>
                    <span className="text-[9px] sm:text-[10px] tracking-widest text-[#6B6166] uppercase mt-0.5">
                      Powdery · Soft Musk
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Mid Statement Section */}
      <section className="py-16 sm:py-20 border-b border-[#DAD1C5]/30 bg-[#FBF7F0]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-[#DAD1C5]/40">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#28192A]">
                A fragrance, one note at a time.
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 max-w-md">
              <p className="text-sm text-[#6B6166] font-light leading-relaxed">
                Distinctive ingredients, artfully combined into a scent that is uniquely yours.
              </p>
              <button
                onClick={() => onNavigate('collection')}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-widest hover:bg-[#3D2540] transition-colors"
              >
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Three Featured Scent Families */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
            
            {/* 01 Citrus */}
            <div
              onClick={() => onNavigate('scentify')}
              className="group cursor-pointer bg-[#FBF7F0] p-8 border border-[#DAD1C5]/50 hover:border-[#C9A25C] transition-all flex flex-col justify-between hover:shadow-md"
            >
              <div>
                <span className="text-xs font-mono text-[#C9A25C] tracking-widest">01</span>
                <h3 className="font-serif text-2xl text-[#28192A] mt-2 group-hover:text-[#C9A25C] transition-colors">
                  Citrus
                </h3>
                <p className="text-xs text-[#6B6166] mt-3 font-light leading-relaxed">
                  Bright, fresh notes that uplift and energize. A luminous beginning to your story.
                </p>
              </div>

              <div className="my-8 flex justify-center">
                <img
                  src="/assets/botanicals/citrus.png"
                  alt="Citrus Botanical Study"
                  className="w-36 h-36 object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="pt-4 border-t border-[#DAD1C5]/30">
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B6166] group-hover:text-[#28192A] transition-colors">
                  Bergamot / Lemon / Grapefruit
                </span>
              </div>
            </div>

            {/* 02 Floral */}
            <div
              onClick={() => onNavigate('scentify')}
              className="group cursor-pointer bg-[#FBF7F0] p-8 border border-[#DAD1C5]/50 hover:border-[#C9A25C] transition-all flex flex-col justify-between hover:shadow-md"
            >
              <div>
                <span className="text-xs font-mono text-[#C9A25C] tracking-widest">02</span>
                <h3 className="font-serif text-2xl text-[#28192A] mt-2 group-hover:text-[#C9A25C] transition-colors">
                  Floral
                </h3>
                <p className="text-xs text-[#6B6166] mt-3 font-light leading-relaxed">
                  Elegant blooms that add depth and emotion. Timeless, expressive, endlessly personal.
                </p>
              </div>

              <div className="my-8 flex justify-center">
                <img
                  src="/assets/botanicals/floral.png"
                  alt="Floral Botanical Study"
                  className="w-36 h-36 object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="pt-4 border-t border-[#DAD1C5]/30">
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B6166] group-hover:text-[#28192A] transition-colors">
                  Rose / Jasmine / Ylang Ylang
                </span>
              </div>
            </div>

            {/* 03 Woody */}
            <div
              onClick={() => onNavigate('scentify')}
              className="group cursor-pointer bg-[#FBF7F0] p-8 border border-[#DAD1C5]/50 hover:border-[#C9A25C] transition-all flex flex-col justify-between hover:shadow-md"
            >
              <div>
                <span className="text-xs font-mono text-[#C9A25C] tracking-widest">03</span>
                <h3 className="font-serif text-2xl text-[#28192A] mt-2 group-hover:text-[#C9A25C] transition-colors">
                  Woody
                </h3>
                <p className="text-xs text-[#6B6166] mt-3 font-light leading-relaxed">
                  Warm, grounding notes that linger. A lasting impression that feels like you.
                </p>
              </div>

              <div className="my-8 flex justify-center">
                <img
                  src="/assets/botanicals/woody.png"
                  alt="Woody Botanical Study"
                  className="w-36 h-36 object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="pt-4 border-t border-[#DAD1C5]/30">
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B6166] group-hover:text-[#28192A] transition-colors">
                  Sandalwood / Cedarwood / Vetiver
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Composition Callout Banner */}
      <section className="py-20 bg-[#FBF7F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden">
            
            <div className="relative z-10 max-w-xl">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A25C] font-medium">
                Your Composition Begins Here
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#28192A] mt-3 mb-3">
                Every note tells a story. Make yours.
              </h2>
              <p className="text-sm text-[#6B6166] font-light">
                Explore the ingredient library, then blend the notes that speak to you.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                onClick={() => onNavigate('scentify')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#3D2540] transition-colors shadow-xs"
              >
                <span>Begin creating</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Subtle background botanical accent */}
            <img
              src="/assets/botanicals/floral.png"
              alt=""
              className="absolute right-0 -bottom-10 w-64 h-64 opacity-15 pointer-events-none select-none blur-[0.5px]"
            />
          </div>
        </div>
      </section>

    </div>
  );
};
