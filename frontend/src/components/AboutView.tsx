import React from 'react';
import { ArrowRight, Sparkles, Compass, Leaf, Droplets } from 'lucide-react';
import { ViewMode } from '../types';

interface AboutViewProps {
  onNavigate: (view: ViewMode) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#28192A]">
      
      {/* Editorial Hero Banner */}
      <section className="relative overflow-hidden border-b border-[#DAD1C5]/30 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-4">
              Our Heritage &amp; Ethos
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#28192A] tracking-tight leading-[1.15]">
              The Story of <br />
              <span className="italic font-normal">Scentify Perfume Studio.</span>
            </h1>
            <p className="text-base sm:text-lg text-[#6B6166] font-light mt-6 leading-relaxed max-w-2xl">
              Founded in the mist-veiled hills of Chiang Rai, Northern Thailand, we honor the ancient communion between botanical flora and personal memory.
            </p>
          </div>
        </div>
      </section>

      {/* Main Narrative Section */}
      <section className="py-16 sm:py-24 border-b border-[#DAD1C5]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Imagery */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-6 sm:p-10 relative">
                <img
                  src="/assets/botanicals/hero_display.png"
                  alt="Scentify Studio bottles and botanicals"
                  className="w-full object-contain filter drop-shadow-sm"
                />
                <div className="mt-4 pt-4 border-t border-[#DAD1C5]/30 flex justify-between items-center text-[11px] text-[#6B6166]">
                  <span>Scentify Still Life Study</span>
                  <span className="font-mono">Chiang Rai, 2026</span>
                </div>
              </div>
            </div>

            {/* Right Story Copy */}
            <div className="lg:col-span-6 space-y-6 text-sm sm:text-base text-[#6B6166] font-light leading-relaxed">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A] font-normal leading-snug">
                Fragrance as an intimate portrait — whispered, never shouted.
              </h2>
              
              <p>
                In an era of mass-produced, uniform fragrances, Scentify was established with a singular conviction: your scent should be as personal and unrepeatable as your signature.
              </p>

              <p>
                Each bottle begins with authentic raw essences. We cultivate and distill in small artisanal batches, collaborating with regional growers in Northern Thailand to hand-harvest nocturnal Sambac jasmine at dusk, wild aged agarwood (oud), and highland citrus blossoms.
              </p>

              <div className="p-6 bg-[#FBF7F0] border-l-2 border-[#C9A25C] my-8">
                <blockquote className="font-serif italic text-base sm:text-lg text-[#28192A] leading-relaxed">
                  “A true bespoke perfume is not a mask for the world to notice; it is a quiet invitation into who you are.”
                </blockquote>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B6166] block mt-2 font-medium">
                  Master Perfumer · Scentify Studio
                </span>
              </div>

              <p>
                Through our digital Scentify, we grant you direct control over the formulation pyamid. You choose the luminous opening, the emotional floral heart, and the lingering woody base that together tell your story.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* The Three Pillars Grid */}
      <section className="py-20 bg-[#FBF7F0]/60 border-b border-[#DAD1C5]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-2">
              Our Craft
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#28192A]">
              The Three Studio Pillars
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1 */}
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-[#FBF7F0] border border-[#DAD1C5]/60 flex items-center justify-center text-[#C9A25C] mb-6">
                  <Leaf className="w-6 h-6 stroke-[1.5]" />
                </div>
                <span className="text-xs font-mono text-[#C9A25C] tracking-widest block mb-1">01 / BOTANICALS</span>
                <h3 className="font-serif text-2xl text-[#28192A] mb-3">Pure Mountain Sourcing</h3>
                <p className="text-xs sm:text-sm text-[#6B6166] font-light leading-relaxed">
                  We reject synthetic shortcuts. Every droplet is derived from regenerative floral farms and ethical distillers across Southeast Asia and Grasse.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#DAD1C5]/30">
                <span className="text-[10px] uppercase tracking-wider text-[#6B6166]">Ethically Harvested</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-[#FBF7F0] border border-[#DAD1C5]/60 flex items-center justify-center text-[#C9A25C] mb-6">
                  <Droplets className="w-6 h-6 stroke-[1.5]" />
                </div>
                <span className="text-xs font-mono text-[#C9A25C] tracking-widest block mb-1">02 / DISTILLATION</span>
                <h3 className="font-serif text-2xl text-[#28192A] mb-3">Slow Hydro-Extraction</h3>
                <p className="text-xs sm:text-sm text-[#6B6166] font-light leading-relaxed">
                  Gentle low-temperature hydro-distillation and traditional enfleurage capture the delicate, volatile floral top notes without thermal degradation.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#DAD1C5]/30">
                <span className="text-[10px] uppercase tracking-wider text-[#6B6166]">Cold Extraction Process</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-[#FBF7F0] border border-[#DAD1C5]/60 flex items-center justify-center text-[#C9A25C] mb-6">
                  <Compass className="w-6 h-6 stroke-[1.5]" />
                </div>
                <span className="text-xs font-mono text-[#C9A25C] tracking-widest block mb-1">03 / Scentify</span>
                <h3 className="font-serif text-2xl text-[#28192A] mb-3">Individual Formulation</h3>
                <p className="text-xs sm:text-sm text-[#6B6166] font-light leading-relaxed">
                  Your formula is archived in our studio records under your personal account. Whenever you wish to re-blend or adjust notes, your history is waiting.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#DAD1C5]/30">
                <span className="text-[10px] uppercase tracking-wider text-[#6B6166]">Personal Formula Archive</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Scent Scentify Invitation Banner */}
      <section className="py-20 bg-[#FBF7F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#28192A] text-[#FFFDF8] p-10 sm:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-2">
                Your Story in Scent
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#FFFDF8] mb-3">
                Begin your fragrance journey today.
              </h2>
              <p className="text-xs sm:text-sm text-[#DAD1C5]/80 font-light leading-relaxed">
                Explore our six botanical families or enter the Scentify to formulate your custom 50 ml eau de parfum.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('scentify')}
                className="px-7 py-3.5 bg-[#FBF7F0] text-[#28192A] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#FBF7F0] transition-colors shadow-xs"
              >
                Create Scent →
              </button>
              <button
                onClick={() => onNavigate('collection')}
                className="px-6 py-3.5 border border-[#FFFDF8]/30 text-[#FFFDF8] text-xs uppercase tracking-[0.2em] font-medium hover:border-[#FFFDF8] transition-colors"
              >
                Browse Ingredients
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};