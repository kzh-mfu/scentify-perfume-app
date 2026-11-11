/* SearchResultsView.tsx
 * Team member: Kyaw Zin Htike (6831503011)
 * Frontend tasks: search results, filtering, and ingredient/perfume selection.
 */
import React, { useState, useMemo } from 'react';
import { Search, Sparkles, ShoppingBag, ArrowRight, X, SlidersHorizontal, Check } from 'lucide-react';
import { SCENT_FAMILIES, CATALOG_PERFUMES } from '../data/perfumeData';
import { ViewMode, Ingredient, CartItem, Composition } from '../types';

interface SearchResultsViewProps {
  initialQuery: string;
  onSearch: (query: string) => void;
  onNavigate: (view: ViewMode) => void;
  onAddToCart: (item: CartItem) => void;
  onSelectIngredientToScentify: (ingredient: Ingredient) => void;
  onLoadPerfumeIntoScentify?: (notes: { topNote: string; heartNote: string; baseNote: string; name?: string }) => void;
}

type FilterCategory = 'all' | 'perfumes' | 'ingredients' | 'families';

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  initialQuery,
  onSearch,
  onNavigate,
  onAddToCart,
  onSelectIngredientToScentify,
  onLoadPerfumeIntoScentify,
}) => {
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

  // Sync internal search input if parent initialQuery changes
  React.useEffect(() => {
    setSearchInput(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    onSearch(trimmed);
  };

  const handleClear = () => {
    setSearchInput('');
    onSearch('');
  };

  const handleQuickSuggestion = (term: string) => {
    setSearchInput(term);
    onSearch(term);
  };

  const handleAddPerfumeToBag = (perfume: typeof CATALOG_PERFUMES[0]) => {
    const cartItem: CartItem = {
      id: `perfume-${perfume.id}-${Date.now()}`,
      title: perfume.name,
      subtitle: `${perfume.subtitle} · ${perfume.size}`,
      description: perfume.description,
      price: perfume.price,
      quantity: 1,
      image: perfume.image,
      details: {
        notes: [...perfume.topNotes, ...perfume.heartNotes, ...perfume.baseNotes],
        size: perfume.size,
      },
    };
    onAddToCart(cartItem);
    setAddedItemId(perfume.id);
    setTimeout(() => setAddedItemId(null), 2500);
  };

  const handleCustomizePerfume = (perfume: typeof CATALOG_PERFUMES[0]) => {
    if (onLoadPerfumeIntoScentify) {
      onLoadPerfumeIntoScentify({
        topNote: perfume.topNotes[0] || 'Bergamot',
        heartNote: perfume.heartNotes[0] || 'Jasmine',
        baseNote: perfume.baseNotes[0] || 'Sandalwood',
        name: perfume.name,
      });
    }
    onNavigate('scentify');
  };

  // Perform search filtering
  const query = initialQuery.toLowerCase().trim();

  // 1. Matched Perfumes
  const matchedPerfumes = useMemo(() => {
    if (!query) return CATALOG_PERFUMES;
    return CATALOG_PERFUMES.filter((p) => {
      const matchName = p.name.toLowerCase().includes(query);
      const matchSub = p.subtitle.toLowerCase().includes(query);
      const matchFamily = p.family.toLowerCase().includes(query);
      const matchDesc = p.description.toLowerCase().includes(query);
      const matchMood = p.mood.toLowerCase().includes(query);
      const matchNotes = [...p.topNotes, ...p.heartNotes, ...p.baseNotes].some((note) =>
        note.toLowerCase().includes(query)
      );
      return matchName || matchSub || matchFamily || matchDesc || matchMood || matchNotes;
    });
  }, [query]);

  // 2. Matched Ingredients
  const matchedIngredients = useMemo(() => {
    const allIngredients = SCENT_FAMILIES.flatMap((f) => f.ingredients);
    if (!query) return allIngredients;
    return allIngredients.filter((ing) => {
      const matchName = ing.name.toLowerCase().includes(query);
      const matchDesc = ing.description.toLowerCase().includes(query);
      const matchFam = ing.familyName.toLowerCase().includes(query);
      return matchName || matchDesc || matchFam;
    });
  }, [query]);

  // 3. Matched Scent Families
  const matchedFamilies = useMemo(() => {
    if (!query) return SCENT_FAMILIES;
    return SCENT_FAMILIES.filter((f) => {
      const matchName = f.name.toLowerCase().includes(query);
      const matchDesc = f.description.toLowerCase().includes(query);
      const matchNotes = f.notes.some((n) => n.toLowerCase().includes(query));
      return matchName || matchDesc || matchNotes;
    });
  }, [query]);

  const totalResults = matchedPerfumes.length + matchedIngredients.length + matchedFamilies.length;

  const popularSuggestions = [
    'Bergamot',
    'Jasmine',
    'Oud',
    'Vanilla',
    'Rose',
    'Woody',
    'Fresh',
    'Amber',
    'Green Tea',
  ];

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#28192A] pb-24">
      {/* Top Breadcrumb & Title Bar */}
      <div className="border-b border-[#DAD1C5]/40 bg-[#FBF7F0]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#6B6166]">
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-[#28192A] transition-colors"
              >
                Home
              </button>
              <span>/</span>
              <span className="text-[#28192A] font-medium">Search Results</span>
            </div>
            <button
              onClick={() => onNavigate('scentify')}
              className="text-xs uppercase tracking-wider text-[#C9A25C] hover:text-[#28192A] font-medium flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Go to Scentify</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Search Bar Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-2">
            The Olfactory Search
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#28192A] font-medium mb-4">
            {initialQuery.trim() ? (
              <>
                Search Results for <span className="italic font-normal font-serif">"{initialQuery}"</span>
              </>
            ) : (
              'Search Our Perfumes & Ingredients'
            )}
          </h1>
          <p className="text-sm text-[#6B6166] max-w-lg mx-auto font-light">
            Explore ready-to-wear signature perfumes, raw botanical notes, and rare accords distilled in Scentify.
          </p>
        </div>

        {/* Dedicated Search Form (Pressing Enter triggers search without popups) */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-2xl mx-auto mb-6 relative"
        >
          <div className="relative flex items-center bg-[#FBF7F0] border-2 border-[#28192A] shadow-md focus-within:ring-2 focus-within:ring-[#C9A25C]/50 transition-all">
            <div className="pl-4 sm:pl-5 text-[#6B6166]">
              <Search className="w-5 h-5 stroke-[1.8]" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search perfumes, notes, bergamot, oud, jasmine, woody..."
              className="w-full py-3.5 sm:py-4 px-3 sm:px-4 bg-transparent font-serif text-base sm:text-lg text-[#28192A] placeholder-[#6B6166]/50 focus:outline-none"
              autoFocus
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-[#6B6166] hover:text-[#28192A] transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="m-1.5 px-5 sm:px-7 py-2.5 sm:py-3 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#3D2540] transition-colors shrink-0 shadow-xs"
            >
              Search
            </button>
          </div>
        </form>

        {/* Popular Suggestion Pills */}
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-2 mb-10 text-xs">
          <span className="text-[#6B6166] mr-1">Popular searches:</span>
          {popularSuggestions.map((term) => (
            <button
              key={term}
              onClick={() => handleQuickSuggestion(term)}
              className={`px-3 py-1 rounded-full border transition-colors ${
                initialQuery.toLowerCase() === term.toLowerCase()
                  ? 'bg-[#28192A] text-[#FFFDF8] border-[#28192A]'
                  : 'bg-[#FBF7F0] text-[#28192A] border-[#DAD1C5] hover:border-[#28192A] hover:bg-[#FBF7F0]'
              }`}
            >
              {term}
            </button>
          ))}
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#DAD1C5]/50 pb-4 mb-10 gap-4">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 font-medium uppercase tracking-wider transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#28192A] text-[#FFFDF8]'
                  : 'bg-[#FBF7F0] text-[#6B6166] hover:text-[#28192A]'
              }`}
            >
              All Results ({totalResults})
            </button>
            <button
              onClick={() => setActiveFilter('perfumes')}
              className={`px-3.5 py-1.5 font-medium uppercase tracking-wider transition-colors ${
                activeFilter === 'perfumes'
                  ? 'bg-[#28192A] text-[#FFFDF8]'
                  : 'bg-[#FBF7F0] text-[#6B6166] hover:text-[#28192A]'
              }`}
            >
              Perfumes ({matchedPerfumes.length})
            </button>
            <button
              onClick={() => setActiveFilter('ingredients')}
              className={`px-3.5 py-1.5 font-medium uppercase tracking-wider transition-colors ${
                activeFilter === 'ingredients'
                  ? 'bg-[#28192A] text-[#FFFDF8]'
                  : 'bg-[#FBF7F0] text-[#6B6166] hover:text-[#28192A]'
              }`}
            >
              Botanical Notes ({matchedIngredients.length})
            </button>
            <button
              onClick={() => setActiveFilter('families')}
              className={`px-3.5 py-1.5 font-medium uppercase tracking-wider transition-colors ${
                activeFilter === 'families'
                  ? 'bg-[#28192A] text-[#FFFDF8]'
                  : 'bg-[#FBF7F0] text-[#6B6166] hover:text-[#28192A]'
              }`}
            >
              Scent Families ({matchedFamilies.length})
            </button>
          </div>

          <div className="text-xs text-[#6B6166] tracking-wide">
            Found <span className="font-semibold text-[#28192A]">{totalResults}</span> matches
          </div>
        </div>

        {/* No Results Fallback */}
        {totalResults === 0 && (
          <div className="text-center py-16 px-4 bg-[#FBF7F0]/60 border border-[#DAD1C5]/50 max-w-2xl mx-auto">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FBF7F0] border border-[#DAD1C5] flex items-center justify-center text-[#6B6166]">
              <Search className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-2xl text-[#28192A] font-medium mb-2">
              No direct matches found for "{initialQuery}"
            </h3>
            <p className="text-sm text-[#6B6166] max-w-md mx-auto mb-6">
              Try searching for individual notes such as <em>Bergamot</em>, <em>Jasmine</em>, <em>Oud</em>, or browse our botanical scent families.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('collection')}
                className="px-6 py-2.5 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#3D2540] transition-colors"
              >
                Browse Ingredient Library
              </button>
              <button
                onClick={() => onNavigate('scentify')}
                className="px-6 py-2.5 border border-[#28192A] text-[#28192A] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#28192A] hover:text-[#FFFDF8] transition-colors"
              >
                Create Custom Fragrance
              </button>
            </div>
          </div>
        )}

        {/* Section 1: Signature Perfumes */}
        {(activeFilter === 'all' || activeFilter === 'perfumes') && matchedPerfumes.length > 0 && (
          <section className="mb-16">
            <div className="flex items-end justify-between border-b border-[#DAD1C5]/30 pb-3 mb-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block">
                  Studio Creations
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A] font-medium">
                  Signature Fragrances ({matchedPerfumes.length})
                </h2>
              </div>
              <span className="text-xs text-[#6B6166] hidden sm:inline">Handcrafted flacons</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {matchedPerfumes.map((perfume) => (
                <div
                  key={perfume.id}
                  className="bg-[#FBF7F0] border border-[#DAD1C5]/60 hover:border-[#28192A] transition-all duration-300 flex flex-col justify-between group shadow-xs hover:shadow-md"
                >
                  <div className="p-6">
                    <div className="relative mb-6 overflow-hidden bg-[#FBF7F0] p-6 flex items-center justify-center rounded-sm">
                      <img
                        src={perfume.image}
                        alt={perfume.name}
                        className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 right-3 text-[10px] uppercase font-mono tracking-wider text-[#28192A] bg-[#FBF7F0] border border-[#DAD1C5]/80 px-2 py-0.5">
                        {perfume.family}
                      </span>
                    </div>

                    <div className="mb-3">
                      <h3 className="font-serif text-xl sm:text-2xl text-[#28192A] font-medium group-hover:text-[#C9A25C] transition-colors">
                        {perfume.name}
                      </h3>
                      <p className="text-xs font-serif italic text-[#C9A25C] mt-0.5">
                        {perfume.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-[#6B6166] font-light leading-relaxed mb-4">
                      {perfume.description}
                    </p>

                    <div className="bg-[#FBF7F0]/70 p-3 rounded-sm mb-4 border border-[#DAD1C5]/30">
                      <span className="text-[10px] uppercase tracking-wider text-[#6B6166] block mb-1">
                        Olfactory Accord:
                      </span>
                      <div className="flex flex-wrap gap-1 text-[11px] text-[#28192A]">
                        {perfume.topNotes.concat(perfume.heartNotes, perfume.baseNotes).slice(0, 4).map((n) => (
                          <span
                            key={n}
                            className="bg-[#FBF7F0] px-2 py-0.5 border border-[#DAD1C5]/50 rounded-xs"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-2">
                      <span className="text-lg font-serif font-medium text-[#28192A]">
                        ฿{perfume.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-[#6B6166] uppercase tracking-wider">
                        {perfume.size} Eau de Parfum
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 border-t border-[#DAD1C5]/60 bg-[#FBF7F0]">
                    <button
                      onClick={() => handleAddPerfumeToBag(perfume)}
                      className="py-3 px-3 text-xs uppercase tracking-wider font-medium text-[#28192A] hover:bg-[#28192A] hover:text-[#FFFDF8] transition-colors flex items-center justify-center gap-1.5 border-r border-[#DAD1C5]/60"
                    >
                      {addedItemId === perfume.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Bag</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleCustomizePerfume(perfume)}
                      className="py-3 px-3 text-xs uppercase tracking-wider font-medium text-[#C9A25C] hover:bg-[#C9A25C] hover:text-[#FFFDF8] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Customize</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Botanical Ingredients & Notes */}
        {(activeFilter === 'all' || activeFilter === 'ingredients') && matchedIngredients.length > 0 && (
          <section className="mb-16">
            <div className="flex items-end justify-between border-b border-[#DAD1C5]/30 pb-3 mb-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block">
                  Pure Distillates
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A] font-medium">
                  Botanical Notes & Ingredients ({matchedIngredients.length})
                </h2>
              </div>
              <span className="text-xs text-[#6B6166] hidden sm:inline">Select note to blend in Scentify</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {matchedIngredients.map((ing) => (
                <div
                  key={ing.id}
                  className="bg-[#FBF7F0] border border-[#DAD1C5]/60 p-5 hover:border-[#28192A] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#6B6166] bg-[#DAD1C5]/30 px-2 py-0.5">
                        {ing.familyName}
                      </span>
                      {ing.isPopular && (
                        <span className="text-[10px] uppercase tracking-wider text-[#C9A25C] font-semibold flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          Signature
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg text-[#28192A] font-medium group-hover:text-[#C9A25C] transition-colors">
                      {ing.name}
                    </h3>
                    <p className="text-xs text-[#6B6166] font-light mt-1 mb-4 leading-relaxed">
                      {ing.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectIngredientToScentify(ing);
                      onNavigate('scentify');
                    }}
                    className="w-full py-2 px-3 border border-[#DAD1C5] hover:border-[#28192A] hover:bg-[#28192A] hover:text-[#FFFDF8] text-[#28192A] text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Blend in Scentify</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Scent Families */}
        {(activeFilter === 'all' || activeFilter === 'families') && matchedFamilies.length > 0 && (
          <section className="mb-12">
            <div className="flex items-end justify-between border-b border-[#DAD1C5]/30 pb-3 mb-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block">
                  Harmonies & Accords
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A] font-medium">
                  Scent Families ({matchedFamilies.length})
                </h2>
              </div>
              <button
                onClick={() => onNavigate('collection')}
                className="text-xs text-[#28192A] hover:text-[#C9A25C] underline font-medium"
              >
                View all in Collection →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedFamilies.map((fam) => (
                <div
                  key={fam.id}
                  onClick={() => onNavigate('collection')}
                  className="bg-[#FBF7F0]/70 border border-[#DAD1C5]/60 p-6 cursor-pointer hover:border-[#28192A] transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-[#C9A25C] font-bold">
                      {fam.number}
                    </span>
                    <span className="text-xs font-serif italic text-[#6B6166]">
                      {fam.subtitle}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-[#28192A] font-medium group-hover:text-[#C9A25C] transition-colors mb-2">
                    {fam.name} Family
                  </h3>
                  <p className="text-xs text-[#6B6166] font-light mb-4 line-clamp-2">
                    {fam.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#DAD1C5]/30">
                    {fam.notes.map((n) => (
                      <span
                        key={n}
                        className="text-[10px] uppercase font-mono tracking-wider text-[#28192A] bg-[#FBF7F0] px-2 py-0.5 border border-[#DAD1C5]/40"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
