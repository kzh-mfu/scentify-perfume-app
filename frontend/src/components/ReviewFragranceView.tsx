/*
 * Team member: Thuta Naing (6831503029)
 * Frontend tasks: review selected fragrance items, quantities, and prices before ordering.
 */
import React, { useState } from 'react';
import { CheckCircle2, MessageSquare, ArrowRight, ShieldCheck, Sparkles, Edit3 } from 'lucide-react';
import { Composition, ViewMode, CartItem, BottleOption } from '../types';
import { INITIAL_BOTTLE_OPTIONS } from '../data/adminDatabaseData';

interface ReviewFragranceViewProps {
  composition: Composition;
  onConfirmAndShip: (customItem: CartItem) => void;
  onRequestChange: () => void;
  onNavigate: (view: ViewMode) => void;
  bottles?: BottleOption[];
}

export const ReviewFragranceView: React.FC<ReviewFragranceViewProps> = ({
  composition,
  onConfirmAndShip,
  onRequestChange,
  onNavigate,
  bottles = INITIAL_BOTTLE_OPTIONS,
}) => {
  const activeBottles = bottles.filter((b) => b.inStock);
  const defaultSize =
    activeBottles.find((b) => b.size === composition.bottleSize)?.size ||
    activeBottles[0]?.size ||
    '50 ml';

  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);

  const matchedBottle = activeBottles.find((b) => b.size === selectedSize) || activeBottles[0] || {
    size: '50 ml',
    price: 1680,
    bottleType: 'Classic Flacon',
  };

  const price = matchedBottle.price;

  const handleConfirm = () => {
    const customItem: CartItem = {
      id: `custom-${Date.now()}`,
      title: 'Custom Fragrance',
      subtitle: `${composition.topNote} · ${composition.heartNote} · ${composition.baseNote} · ${selectedSize}`,
      description: 'Handcrafted personal eau de parfum formulation',
      price: price,
      quantity: 1,
      image: '/assets/botanicals/custom_bottle.png',
      details: {
        notes: [composition.topNote, composition.heartNote, composition.baseNote],
        size: selectedSize,
      },
    };
    onConfirmAndShip(customItem);
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-[#28192A]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-[#DAD1C5]/40 gap-4">
          <div>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-2">
              Your Perfume is Ready
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#28192A]">
              Review Your Custom Fragrance
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6166] font-light mt-2 max-w-xl">
              Our perfumer has prepared your final blend. Please review the details below and confirm before we ship.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center px-3.5 py-1.5 bg-white border border-[#DAD1C5] text-xs text-[#28192A] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#C9A25C] animate-pulse"></span>
            <span className="font-medium tracking-wide">Awaiting your confirmation</span>
          </div>
        </div>

        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Fragrance Blueprint & Bottle Card */}
          <div className="lg:col-span-7 bg-[#FBF7F0] border border-[#DAD1C5] p-6 sm:p-10 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#DAD1C5]/30 pb-4 mb-6">
              <div>
                <span className="text-[10px] tracking-widest text-[#6B6166] uppercase">ORDER #BESPOKE-STUDIO</span>
                <h2 className="font-serif text-2xl text-[#28192A] mt-0.5">Your Custom Fragrance</h2>
                <span className="text-xs text-[#6B6166] font-light">Prepared by the Scentify Perfume Studio</span>
              </div>
              <button
                onClick={() => onNavigate('scentify')}
                className="text-xs text-[#C9A25C] hover:text-[#28192A] flex items-center gap-1"
                title="Edit Formula"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            {/* Bottle Mockup and Notes breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center py-4">
              
              {/* Bottle graphic with 'L' Monogram */}
              <div className="sm:col-span-5 bg-[#FBF7F0] border border-[#DAD1C5]/60 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-36 border border-[#28192A]/30 relative flex items-center justify-center bg-[#FBF7F0] shadow-xs">
                  <span className="font-serif text-5xl font-light text-[#C9A25C] select-none">
                    L
                  </span>
                  <div className="absolute top-0 inset-x-0 h-4 border-b border-[#28192A]/20 bg-[#FBF7F0]"></div>
                </div>
                <span className="text-[10px] tracking-[0.25em] text-[#28192A] font-medium uppercase mt-4">
                  {selectedSize.toUpperCase()} · EAU DE PARFUM
                </span>
                <span className="text-[9px] tracking-widest text-[#6B6166] mt-0.5">
                  Natural Artisanal Extraction
                </span>
              </div>

              {/* Formulation details & Dynamic Bottle Picker */}
              <div className="sm:col-span-7 space-y-4">
                <div className="space-y-3 pb-3 border-b border-[#DAD1C5]/30">
                  <div>
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#6B6166] font-medium block">
                      TOP NOTE
                    </span>
                    <span className="font-serif text-base text-[#28192A]">
                      {composition.topNote || 'Bergamot'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#6B6166] font-medium block">
                      HEART NOTE
                    </span>
                    <span className="font-serif text-base text-[#28192A]">
                      {composition.heartNote || 'Jasmine'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#6B6166] font-medium block">
                      BASE NOTE
                    </span>
                    <span className="font-serif text-base text-[#28192A]">
                      {composition.baseNote || 'Sandalwood'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#6B6166] font-medium block">
                      BOTTLE STYLE
                    </span>
                    <span className="font-serif text-base text-[#28192A]">
                      {matchedBottle.bottleType || 'Classic Flacon'} · {selectedSize}
                    </span>
                  </div>
                </div>

                {/* Dynamic Size toggle from Admin */}
                <div className="pt-2">
                  <span className="text-xs text-[#6B6166] block mb-2 font-medium">
                    Select Bottle Capacity:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeBottles.map((b) => (
                      <button
                        key={b.bottle_id}
                        onClick={() => setSelectedSize(b.size)}
                        className={`px-3 py-1.5 text-xs font-mono border transition-all ${
                          selectedSize === b.size
                            ? 'border-[#28192A] bg-[#28192A] text-[#FBF7F0] font-semibold'
                            : 'border-[#DAD1C5] bg-[#FBF7F0] text-[#28192A] hover:border-[#28192A]'
                        }`}
                      >
                        {b.size} (฿{b.price.toLocaleString()})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Shipping note footer */}
            <div className="mt-8 pt-5 border-t border-[#DAD1C5]/40 flex flex-col sm:flex-row justify-between text-xs text-[#6B6166] gap-2">
              <div>
                <span className="text-[10px] tracking-widest uppercase text-[#C9A25C] font-semibold block">SHIPPING TO</span>
                <span>Bangkok &amp; Nationwide (Complimentary for orders above ฿1,500)</span>
              </div>
              <div>
                <span className="text-[10px] tracking-widest uppercase text-[#C9A25C] font-semibold block">DISPATCH TIMELINE</span>
                <span>Prepared fresh &amp; dispatched within 24–48 hours</span>
              </div>
            </div>

          </div>

          {/* Right Column: Order Confirmation Card */}
          <div className="lg:col-span-5 bg-[#FBF7F0] border border-[#DAD1C5] p-6 sm:p-8 shadow-xs">
            <h3 className="font-serif text-xl text-[#28192A] pb-4 mb-4 border-b border-[#DAD1C5]/40">
              Formula Summary
            </h3>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between py-1 border-b border-[#DAD1C5]/20">
                <span className="text-[#6B6166]">Bespoke Formulation</span>
                <span className="font-mono font-medium text-[#28192A]">
                  ฿{price.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#DAD1C5]/20">
                <span className="text-[#6B6166]">Selected Flacon Capacity</span>
                <span className="font-mono text-[#28192A]">{selectedSize}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#DAD1C5]/20">
                <span className="text-[#6B6166]">Shipping Fee</span>
                <span className="font-mono text-emerald-700 font-medium">
                  {price >= 1500 ? 'FREE (฿0)' : '฿50'}
                </span>
              </div>

              <div className="flex justify-between pt-3 text-sm font-semibold text-[#28192A] border-t border-[#DAD1C5]">
                <span>Total Amount</span>
                <span className="font-serif text-xl text-[#28192A]">
                  ฿{(price >= 1500 ? price : price + 50).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full py-4 bg-[#28192A] text-[#FBF7F0] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#3D2540] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Add to shopping bag &amp; proceed</span>
              <ArrowRight className="w-4 h-4 text-[#C9A25C]" />
            </button>

            <button
              onClick={onRequestChange}
              className="w-full mt-3 py-2.5 bg-transparent border border-[#DAD1C5] text-xs text-[#6B6166] hover:text-[#28192A] hover:bg-[#FBF7F0] transition-colors"
            >
              Request perfume adjustment with perfumer
            </button>

            <div className="mt-6 p-4 bg-[#FBF7F0] border border-[#DAD1C5]/50 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#C9A25C] shrink-0 mt-0.5" />
              <div className="text-[11px] text-[#6B6166] leading-relaxed">
                <strong className="text-[#28192A] font-medium block">Studio Integrity Guarantee</strong>
                Every bespoke bottle is individually poured, matured, and sealed in our Chiang Rai atelier with serial verification.
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
