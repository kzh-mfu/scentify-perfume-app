import React, { useState } from 'react';
import { Check, Plus, ArrowRight, Sparkles, RefreshCw, AlertCircle, Info, Sliders, FlaskConical } from 'lucide-react';
import { Composition, ViewMode, Ingredient, ScentFamily, BottleOption, CustomizationRule, MasterFormula } from '../types';
import { SCENT_FAMILIES } from '../data/perfumeData';
import { INITIAL_BOTTLE_OPTIONS, INITIAL_CUSTOMIZATION_RULES, INITIAL_MASTER_FORMULAS } from '../data/adminDatabaseData';

interface ScentifyViewProps {
  composition: Composition;
  onUpdateComposition: (comp: Composition) => void;
  onNavigate: (view: ViewMode) => void;
  scentFamilies?: ScentFamily[];
  bottles?: BottleOption[];
  rules?: CustomizationRule[];
  formulas?: MasterFormula[];
}

export const ScentifyView: React.FC<ScentifyViewProps> = ({
  composition,
  onUpdateComposition,
  onNavigate,
  scentFamilies = SCENT_FAMILIES,
  bottles = INITIAL_BOTTLE_OPTIONS,
  rules = INITIAL_CUSTOMIZATION_RULES,
  formulas = INITIAL_MASTER_FORMULAS,
}) => {
  const [notice, setNotice] = useState<string | null>(null);

  // Derive the active selected notes array from composition
  const selectedNotes: string[] = [
    composition.topNote,
    composition.heartNote,
    composition.baseNote,
  ].filter(Boolean);

  // Active rules evaluation
  const maxNotesRule = rules.find((r) => r.active && r.type === 'max_notes');
  const maxNotesAllowed = maxNotesRule?.params?.maxNotes || 3;

  const forbiddenRules = rules.filter((r) => r.active && r.type === 'forbidden_pairing');
  const recommendedPairingRules = rules.filter((r) => r.active && r.type === 'recommended_pairing');

  // Check forbidden pairings in current notes
  const activeViolation = forbiddenRules.find((r) => {
    if (!r.params?.familyA || !r.params?.familyB) return false;
    const hasA = selectedNotes.some((n) => n.toLowerCase().includes(r.params!.familyA!.toLowerCase()));
    const hasB = selectedNotes.some((n) => n.toLowerCase().includes(r.params!.familyB!.toLowerCase()));
    return hasA && hasB;
  });

  const isSelected = (noteName: string) => selectedNotes.includes(noteName);

  const handleToggleIngredient = (ingName: string) => {
    if (isSelected(ingName)) {
      // Deselecting: remove from array
      const remaining = selectedNotes.filter((n) => n !== ingName);
      onUpdateComposition({
        ...composition,
        topNote: remaining[0] || '',
        heartNote: remaining[1] || '',
        baseNote: remaining[2] || '',
      });
      setNotice(null);
    } else {
      // Trying to select: enforce active max notes rule
      if (selectedNotes.length < maxNotesAllowed) {
        const next = [...selectedNotes, ingName];
        onUpdateComposition({
          ...composition,
          topNote: next[0] || '',
          heartNote: next[1] || '',
          baseNote: next[2] || '',
        });
        setNotice(null);
      } else {
        // Already at max allowed notes: swap the last note
        const replaced = [...selectedNotes.slice(0, maxNotesAllowed - 1), ingName];
        onUpdateComposition({
          ...composition,
          topNote: replaced[0] || '',
          heartNote: replaced[1] || '',
          baseNote: replaced[2] || '',
        });
        setNotice(
          `Maximum ${maxNotesAllowed} harmonic notes: replaced "${selectedNotes[selectedNotes.length - 1]}" with "${ingName}".`
        );
        setTimeout(() => setNotice(null), 4000);
      }
    }
  };

  const handleApplyFormula = (formula: MasterFormula) => {
    onUpdateComposition({
      ...composition,
      topNote: formula.topNote,
      heartNote: formula.heartNote,
      baseNote: formula.baseNote,
      bottleSize: formula.recommendedBottle || composition.bottleSize,
    });
    setNotice(`Loaded Master Formula: "${formula.name}"`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleResetToDefault = () => {
    onUpdateComposition({
      ...composition,
      topNote: 'Bergamot',
      heartNote: 'Jasmine',
      baseNote: 'Sandalwood',
    });
    setNotice(null);
  };

  const getHarmonicDescription = () => {
    if (selectedNotes.length === 0) {
      return 'Select your botanical notes to formulate your bespoke personal fragrance.';
    }
    const top = selectedNotes[0] ? `A luminous ${selectedNotes[0].toLowerCase()} opening` : 'A crisp opening';
    const heart = selectedNotes[1] ? `a rich ${selectedNotes[1].toLowerCase()} heart` : 'a delicate heart';
    const base = selectedNotes[2] ? `and a lingering ${selectedNotes[2].toLowerCase()} finish.` : 'and a warm finish.';
    return `${top}, ${heart}, ${base}`;
  };

  const activeBottles = bottles.filter((b) => b.inStock);

  return (
    <div className="min-h-screen bg-[#FBF7F0] pb-36 text-[#28192A]">
      
      {/* Top Header Section */}
      <section className="pt-12 sm:pt-16 pb-10 border-b border-[#DAD1C5]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7">
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#6B6166] font-medium block mb-3">
                Scentify Studio / 01
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#28192A] tracking-tight leading-[1.1]">
                Create your own <br />perfume.
              </h1>
              <p className="text-sm sm:text-base text-[#6B6166] font-light mt-4 max-w-md">
                A fragrance with your own signature, composed one ingredient at a time using natural botanical distillations.
              </p>
            </div>

            {/* Right Bottle Artwork */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="p-3 bg-white/40 rounded-xl border border-[#DAD1C5]/40 shadow-xs">
                <img
                  src="/assets/botanicals/hero_bottles.png"
                  alt="Scentify formulation bottles"
                  className="max-h-48 sm:max-h-56 object-contain"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Master Formulas Preset Carousel (from Admin) */}
      {formulas.filter((f) => f.active).length > 0 && (
        <section className="py-5 bg-[#FBF7F0] border-b border-[#DAD1C5]/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Studio Master Blends (Select as Starting Formula)</span>
              </span>
              <span className="text-[11px] text-[#6B6166]">
                Curated by our Studio Perfumers
              </span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {formulas
                .filter((f) => f.active)
                .map((formula) => {
                  const isMatching =
                    composition.topNote === formula.topNote &&
                    composition.heartNote === formula.heartNote &&
                    composition.baseNote === formula.baseNote;

                  return (
                    <button
                      key={formula.id}
                      onClick={() => handleApplyFormula(formula)}
                      className={`px-3.5 py-2 border text-left shrink-0 transition-all ${
                        isMatching
                          ? 'border-[#C9A25C] bg-[#28192A] text-[#FBF7F0] shadow-sm'
                          : 'border-[#DAD1C5] bg-[#FBF7F0] hover:border-[#28192A] text-[#28192A]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-sm font-medium">{formula.name}</span>
                        {isMatching && (
                          <span className="text-[9px] bg-[#C9A25C] text-[#28192A] font-bold px-1.5 py-0.2">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] opacity-75 mt-0.5 font-light">
                        {formula.topNote} · {formula.heartNote} · {formula.baseNote}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* Subhead & Olfactory Rules Guidance */}
      <section className="py-6 border-b border-[#DAD1C5]/30 bg-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-1">
                The Botanical Library
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A]">
                Find your perfect notes.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6B6166] max-w-md font-light leading-relaxed">
              Select your botanical extracts across each scent family. (Maximum {maxNotesAllowed} harmonic notes active).
            </p>
          </div>

          {/* Active Olfactory Pairing Recommendation */}
          {recommendedPairingRules.length > 0 && (
            <div className="mt-3.5 p-3 bg-[#FBF7F0] border border-[#C9A25C]/40 text-xs text-[#28192A] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#C9A25C] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#28192A]">Perfumer's Pairing Rule: </span>
                <span className="text-[#6B6166]">
                  {recommendedPairingRules[0]?.description ||
                    'Select a woody base to anchor delicate citrus and floral top notes.'}
                </span>
              </div>
            </div>
          )}

          {/* Rule Violation Notice */}
          {activeViolation && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-xs text-red-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>Olfactory Caution:</strong> {activeViolation.params?.reason || activeViolation.description}
              </span>
            </div>
          )}

          {/* General Replacement Notice Alert */}
          {notice && (
            <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 animate-in fade-in duration-150">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{notice}</span>
            </div>
          )}
        </div>
      </section>

      {/* Scent Families Formulation Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {scentFamilies.map((family) => (
          <div
            key={family.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-[#DAD1C5]/40 pb-16"
          >
            {/* Family Metadata & Botanical Study */}
            <div className="lg:col-span-4 flex items-start gap-6">
              <div className="flex-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#6B6166] font-medium block">
                  {family.number} / SCENT FAMILY
                </span>
                <h3 className="font-serif text-3xl text-[#28192A] mt-1">
                  {family.name}
                </h3>
                <p className="text-xs text-[#6B6166] mt-0.5 italic">
                  {family.subtitle}
                </p>
                <p className="text-xs text-[#6B6166] font-light mt-2 leading-relaxed">
                  {family.description}
                </p>
              </div>

              <div className="w-24 h-24 shrink-0 flex items-center justify-center p-1 bg-[#FBF7F0] border border-[#DAD1C5]/40">
                <img
                  src={family.image}
                  alt={`${family.name} Botanical Study`}
                  className="max-h-full max-w-full object-contain filter drop-shadow-2xs"
                />
              </div>
            </div>

            {/* Ingredients List for this family */}
            <div className="lg:col-span-8 space-y-3">
              {family.ingredients.map((item, idx) => {
                const selected = isSelected(item.name);
                const itemNum = String(idx + 1).padStart(2, '0');
                
                // Which slot in the notes is this?
                const noteIndex = selectedNotes.indexOf(item.name);
                const roleLabel =
                  noteIndex === 0
                    ? 'Top Note'
                    : noteIndex === 1
                    ? 'Heart Note'
                    : noteIndex === 2
                    ? 'Base Note'
                    : null;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleIngredient(item.name)}
                    className={`p-5 rounded-none border transition-all cursor-pointer flex items-center justify-between group ${
                      selected
                        ? 'border-[#C9A25C] bg-[#FBF7F0] shadow-xs ring-1 ring-[#C9A25C]/40'
                        : 'border-[#DAD1C5]/60 bg-[#FBF7F0] hover:border-[#DAD1C5]'
                    }`}
                  >
                    <div className="flex items-baseline gap-5">
                      <span className="text-xs font-mono text-[#6B6166]/70">{itemNum}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-lg text-[#28192A] group-hover:text-[#C9A25C] transition-colors">
                            {item.name}
                          </h4>
                          {item.isPopular && (
                            <span className="text-[9px] font-mono tracking-wider uppercase bg-[#C9A25C]/20 text-[#28192A] px-1.5 py-0.5">
                              Popular
                            </span>
                          )}
                          {roleLabel && (
                            <span className="text-[10px] font-mono tracking-wider uppercase bg-[#28192A] text-[#FFFDF8] px-2 py-0.5">
                              {roleLabel}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6B6166] font-light mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`w-8 h-8 flex items-center justify-center transition-colors ${
                        selected
                          ? 'text-[#C9A25C]'
                          : 'text-[#6B6166] group-hover:text-[#28192A]'
                      }`}
                      aria-label={selected ? `Deselect ${item.name}` : `Select ${item.name}`}
                    >
                      {selected ? (
                        <Check className="w-5 h-5 stroke-[2]" />
                      ) : (
                        <Plus className="w-5 h-5 stroke-[1.5]" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Composition & Bottle Bar */}
      <aside
        aria-label="Selected custom perfume composition bar"
        className="fixed bottom-0 inset-x-0 z-30 bg-[#FBF7F0]/95 backdrop-blur-md border-t border-[#DAD1C5] py-4 px-4 sm:px-6 lg:px-8 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#6B6166] font-medium">
                Your Composition / 0{selectedNotes.length} of 0{maxNotesAllowed} Ingredients
              </span>
              <span className="text-[10px] font-mono text-[#C9A25C] uppercase">
                {selectedNotes.length === maxNotesAllowed
                  ? '✓ Complete'
                  : `(Select ${maxNotesAllowed - selectedNotes.length} more)`}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="font-serif text-xl sm:text-2xl text-[#28192A]">
                {selectedNotes.length > 0 ? selectedNotes.join(' · ') : 'No notes selected yet'}
              </h3>
            </div>
            <p className="text-xs text-[#6B6166] font-light mt-0.5">
              {getHarmonicDescription()}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
            
            {/* Bottle size quick selector */}
            {activeBottles.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#FBF7F0] border border-[#DAD1C5] p-1">
                {activeBottles.map((b) => (
                  <button
                    key={b.bottle_id}
                    onClick={() =>
                      onUpdateComposition({
                        ...composition,
                        bottleSize: b.size,
                      })
                    }
                    className={`px-2.5 py-1 text-[11px] font-mono transition-colors ${
                      composition.bottleSize === b.size
                        ? 'bg-[#28192A] text-[#FBF7F0] font-semibold'
                        : 'text-[#6B6166] hover:text-[#28192A]'
                    }`}
                  >
                    {b.size} (฿{b.price.toLocaleString()})
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleResetToDefault}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs text-[#6B6166] hover:text-[#28192A]"
              title="Reset to default (Bergamot · Jasmine · Sandalwood)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={() => onNavigate('review-fragrance')}
              disabled={selectedNotes.length === 0}
              className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#3D2540] transition-colors shadow-sm disabled:opacity-50"
            >
              <span>Review fragrance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </aside>

    </div>
  );
};