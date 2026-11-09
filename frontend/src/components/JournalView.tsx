import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { ViewMode } from '../types';

interface JournalViewProps {
  onNavigate: (view: ViewMode) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const articles = [
    {
      id: 'bergamot-dual-nature',
      vol: 'Vol. 14',
      date: 'October 2026',
      readTime: '4 min read',
      category: 'formulation',
      categoryLabel: 'Formulation Study',
      title: 'The Dual Nature of Bergamot: Balancing Citrus Sparkle with Floral Cream',
      summary:
        'Why high-altitude sunlight and slow cold-press extraction create the crystalline top note essential to opening bespoke perfumery without sharp chemical acidity.',
      image: '/assets/botanicals/citrus.png',
      quote: '“A great opening does not shout; it invites the nose forward into the heart.”',
    },
    {
      id: 'jasmine-harvest',
      vol: 'Vol. 13',
      date: 'September 2026',
      readTime: '6 min read',
      category: 'field',
      categoryLabel: 'Field Study',
      title: 'Harvesting Sambac Jasmine at Twilight in Northern Thailand',
      summary:
        'The delicate twenty-minute window when jasmine petals release their richest indolic heart before dawn breaks, capturing the soul of tropical night air.',
      image: '/assets/botanicals/floral.png',
      quote: '“Timing in perfumery is measured in minutes, between moonset and first ray.”',
    },
    {
      id: 'woods-and-oud',
      vol: 'Vol. 12',
      date: 'August 2026',
      readTime: '5 min read',
      category: 'ingredients',
      categoryLabel: 'Ingredients & Sillage',
      title: 'Sandalwood and Oud: Grounding Volatile Essences for All-Day Sillage',
      summary:
        'Exploring how deep resinous woods act as an anchor, letting personal body warmth slowly unveil secret fragrance layers throughout the wear cycle.',
      image: '/assets/botanicals/woody.png',
      quote: '“Base notes are the memory that remains on the collar long after the room is empty.”',
    },
  ];

  const filteredArticles = activeCategory === 'all'
    ? articles
    : articles.filter(a => a.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#28192A] py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-3">
            The Olfactory Journal
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#28192A] tracking-tight">
            Essays, Notes &amp; Studies.
          </h1>
          <p className="text-sm sm:text-base text-[#6B6166] font-light mt-4 leading-relaxed">
            Musings on botanical extraction, scent harmony, and the unspoken language of natural perfume.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mt-8 pt-4 border-t border-[#DAD1C5]/40">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-1.5 text-xs tracking-wider transition-colors ${
                activeCategory === 'all'
                  ? 'bg-[#28192A] text-[#FFFDF8]'
                  : 'bg-[#FBF7F0] text-[#6B6166] hover:text-[#28192A] border border-[#DAD1C5]/40'
              }`}
            >
              All Essays ({articles.length})
            </button>
            <button
              onClick={() => setActiveCategory('formulation')}
              className={`px-4 py-1.5 text-xs tracking-wider transition-colors ${
                activeCategory === 'formulation'
                  ? 'bg-[#28192A] text-[#FFFDF8]'
                  : 'bg-[#FBF7F0] text-[#6B6166] hover:text-[#28192A] border border-[#DAD1C5]/40'
              }`}
            >
              Formulation
            </button>
            <button
              onClick={() => setActiveCategory('field')}
              className={`px-4 py-1.5 text-xs tracking-wider transition-colors ${
                activeCategory === 'field'
                  ? 'bg-[#28192A] text-[#FFFDF8]'
                  : 'bg-[#FBF7F0] text-[#6B6166] hover:text-[#28192A] border border-[#DAD1C5]/40'
              }`}
            >
              Field Studies
            </button>
            <button
              onClick={() => setActiveCategory('ingredients')}
              className={`px-4 py-1.5 text-xs tracking-wider transition-colors ${
                activeCategory === 'ingredients'
                  ? 'bg-[#28192A] text-[#FFFDF8]'
                  : 'bg-[#FBF7F0] text-[#6B6166] hover:text-[#28192A] border border-[#DAD1C5]/40'
              }`}
            >
              Ingredients &amp; Sillage
            </button>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="space-y-16">
          {filteredArticles.map((article, idx) => (
            <article
              key={article.id}
              className="bg-[#FBF7F0] border border-[#DAD1C5] p-6 sm:p-10 lg:p-12 hover:border-[#C9A25C] transition-all hover:shadow-xs"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center gap-3 text-xs text-[#6B6166]">
                    <span className="font-mono text-[#C9A25C]">{article.vol}</span>
                    <span>·</span>
                    <span>{article.categoryLabel}</span>
                    <span>·</span>
                    <span>{article.readTime}</span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A] leading-snug">
                    {article.title}
                  </h2>

                  <p className="text-sm text-[#6B6166] font-light leading-relaxed">
                    {article.summary}
                  </p>

                  <div className="p-4 bg-[#FBF7F0] border-l border-[#C9A25C] text-xs font-serif italic text-[#28192A]">
                    {article.quote}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate('scentify')}
                      className="inline-flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-[#28192A] hover:text-[#C9A25C] transition-colors"
                    >
                      <span>Explore this scent profile in Scentify</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-4 flex justify-center bg-[#FBF7F0] p-6 border border-[#DAD1C5]/30">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="max-h-48 object-contain filter drop-shadow-xs"
                  />
                </div>

              </div>
            </article>
          ))}
        </div>

        {/* Bottom invitation */}
        <div className="mt-20 p-8 sm:p-12 bg-[#FBF7F0] border border-[#DAD1C5] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-2xl text-[#28192A]">
              Translate these botanical studies into your personal bottle.
            </h3>
            <p className="text-xs text-[#6B6166] mt-1 font-light">
              Visit Scentify to combine citrus, floral, and woody essences in balanced proportions.
            </p>
          </div>
          <button
            onClick={() => onNavigate('scentify')}
            className="shrink-0 px-6 py-3 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-widest hover:bg-[#3D2540] transition-colors"
          >
            Formulate in Scentify →
          </button>
        </div>

      </div>
    </div>
  );
};