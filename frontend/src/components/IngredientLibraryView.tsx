/* IngredientLibraryView.tsx
 * Team member: Kyaw Zin Htike (6831503011)
 * Frontend tasks: ingredient listing/searching and selecting ingredients for scent creation.
 */
import React, { useState } from 'react';
import { ArrowRight, Sparkles, Plus, Check, Info } from 'lucide-react';
import { ScentFamily, Ingredient, ViewMode } from '../types';
import { SCENT_FAMILIES } from '../data/perfumeData';

interface IngredientLibraryViewProps {
  onNavigate: (view: ViewMode) => void;
  onSelectIngredientToScentify: (ingredient: Ingredient) => void;
  scentFamilies?: ScentFamily[];
}

export const IngredientLibraryView: React.FC<IngredientLibraryViewProps> = ({
  onNavigate,
  onSelectIngredientToScentify,
  scentFamilies = SCENT_FAMILIES,
}) => {
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleQuickAdd = (ing: Ingredient, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIngredientToScentify(ing);
    setToastMessage(`Added ${ing.name} to your Scentify blend.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative text-[#28192A]">
      
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#28192A] text-[#FFFDF8] px-5 py-3 text-xs tracking-wider shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-[#C9A25C]" />
          <span>{toastMessage}</span>
          <button
            onClick={() => onNavigate('scentify')}
            className="ml-2 text-[#C9A25C] underline font-medium hover:text-[#FFFDF8]"
          >
            Open Scentify →
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#6B6166] font-medium block mb-3">
            The Scentify Ingredient Library
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#28192A] tracking-tight">
            An alphabet of scent.
          </h1>
          <p className="text-sm sm:text-base text-[#6B6166] font-light mt-3 max-w-xl">
            Explore the ingredients behind your next fragrance, arranged across all 6 botanical families.
          </p>
        </div>

        {/* Scent Family Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {scentFamilies.map((family) => (
            <div
              key={family.id}
              className="bg-[#FBF7F0] border border-[#DAD1C5] p-6 sm:p-8 flex flex-col justify-between hover:border-[#C9A25C] transition-all hover:shadow-sm"
            >
              {/* Card Header & Artwork */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B6166] font-medium">
                      {family.number} / SCENT FAMILY
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A] mt-1">
                      {family.name}
                    </h2>
                    <p className="text-xs text-[#6B6166] mt-0.5 italic">
                      {family.subtitle}
                    </p>
                  </div>

                  <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center p-1">
                    <img
                      src={family.image}
                      alt={family.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-xs"
                    />
                  </div>
                </div>

                <p className="text-xs text-[#6B6166] font-light mt-3 leading-relaxed">
                  {family.description}
                </p>
              </div>

              {/* Ingredients Matrix */}
              <div className="mt-8 pt-5 border-t border-[#DAD1C5]/40">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#6B6166] block mb-3 font-medium">
                  INGREDIENTS
                </span>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  {family.ingredients.map((ing) => (
                    <div
                      key={ing.id}
                      onClick={() => setSelectedIngredient(ing)}
                      className="group/item flex items-center justify-between py-1 px-1.5 rounded-sm hover:bg-[#FBF7F0] cursor-pointer transition-colors"
                    >
                      <span className="text-xs text-[#28192A] group-hover/item:text-[#C9A25C] transition-colors">
                        {ing.name}
                      </span>
                      <button
                        onClick={(e) => handleQuickAdd(ing, e)}
                        className="opacity-0 group-hover/item:opacity-100 p-1 text-[#C9A25C] hover:text-[#28192A] transition-all"
                        title={`Add ${ing.name} to custom perfume`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-3 border-t border-[#DAD1C5]/30 flex justify-between items-center">
                  <button
                    onClick={() => onNavigate('scentify')}
                    className="text-[11px] tracking-wider uppercase text-[#C9A25C] hover:text-[#28192A] font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <span>Blend in Scentify</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Scentify Quick CTA */}
        <div className="mt-16 p-8 bg-[#FBF7F0] border border-[#DAD1C5] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl text-[#28192A]">
              Ready to compose your personal formula?
            </h3>
            <p className="text-xs text-[#6B6166] mt-1">
              Combine top citrus accents, romantic florals, and deep grounding woods in Scentify.
            </p>
          </div>
          <button
            onClick={() => onNavigate('scentify')}
            className="shrink-0 px-6 py-3 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-widest hover:bg-[#3D2540] transition-colors"
          >
            Open Scentify →
          </button>
        </div>

      </div>

      {/* Ingredient Detail Modal */}
      {selectedIngredient && (
        <div
          className="fixed inset-0 z-50 bg-[#28192A]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedIngredient(null)}
        >
          <div
            className="bg-[#FBF7F0] border border-[#DAD1C5] max-w-md w-full p-6 sm:p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#C9A25C] font-medium">
              Ingredient Study · {selectedIngredient.familyName}
            </span>
            <h3 className="font-serif text-3xl text-[#28192A] mt-2">
              {selectedIngredient.name}
            </h3>
            <p className="text-sm text-[#6B6166] mt-3 font-light leading-relaxed">
              {selectedIngredient.description}
            </p>

            <div className="mt-6 pt-4 border-t border-[#DAD1C5]/40 flex justify-between items-center">
              <button
                onClick={() => {
                  onSelectIngredientToScentify(selectedIngredient);
                  setSelectedIngredient(null);
                  onNavigate('scentify');
                }}
                className="px-5 py-2.5 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-widest hover:bg-[#3D2540] transition-colors"
              >
                Add to Scentify Blend
              </button>
              <button
                onClick={() => setSelectedIngredient(null)}
                className="text-xs text-[#6B6166] hover:text-[#28192A] px-3 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
