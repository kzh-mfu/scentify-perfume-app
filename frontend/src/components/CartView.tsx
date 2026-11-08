import React, { useState } from 'react';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Check, Lock, Sparkles, UserCheck } from 'lucide-react';
import { CartItem, ViewMode } from '../types';

interface CartViewProps {
  items: CartItem[];
  currentUser?: string | null;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToOrder: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  items,
  currentUser,
  onOpenAuth,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToOrder,
  onNavigate,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal > 1500 ? 0 : 50;
  const total = Math.max(0, subtotal - discount + (items.length > 0 ? shipping : 0));

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    if (promoCode.trim().toUpperCase() === 'SCENTIFY10' || promoCode.trim().toUpperCase() === 'STUDIO') {
      setPromoApplied(true);
      setPromoError(null);
    } else {
      setPromoError('Try code: SCENTIFY10');
    }
  };

  const handleProceed = () => {
    if (!currentUser) {
      if (onOpenAuth) {
        onOpenAuth('signup');
      }
      return;
    }
    onProceedToOrder();
  };

  // If user is not logged in: cart data must only be shown after log in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FBF7F0] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-10 pb-6 border-b border-[#DAD1C5]/40 text-center sm:text-left">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-2">
              Member Sanctuary
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#28192A]">
              Your Cart
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6166] font-light mt-1">
              Please sign up or log in to view your cart items and proceed to checkout.
            </p>
          </div>

          {/* Gated Access Card */}
          <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-xs">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#FBF7F0] border border-[#DAD1C5] flex items-center justify-center text-[#C9A25C]">
              <Lock className="w-7 h-7 stroke-[1.5]" />
            </div>

            <span className="text-[10px] uppercase font-mono tracking-widest text-[#6B6166] block mb-2">
              AUTHENTICATION REQUIRED
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A] mb-3">
              Sign up to view your cart &amp; checkout
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6166] font-light max-w-md mx-auto leading-relaxed mb-8">
              Cart data and custom perfume formulations are accessible only after logging in. Create a complimentary studio account or log in to view your bag and place your order.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => onOpenAuth?.('signup')}
                className="w-full sm:w-auto flex-1 py-3.5 px-6 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#3D2540] transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>Sign Up to View Cart</span>
                <ArrowRight className="w-4 h-4 text-[#C9A25C]" />
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth?.('login')}
                className="w-full sm:w-auto flex-1 py-3.5 px-6 bg-[#FBF7F0] border border-[#28192A] text-[#28192A] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#28192A] hover:text-[#FFFDF8] transition-colors"
              >
                Log In
              </button>
            </div>

            {/* Studio Privileges */}
            <div className="mt-10 pt-8 border-t border-[#DAD1C5]/50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-[#FBF7F0] border border-[#DAD1C5]/40">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9A25C] block mb-1">
                  01 / Formulations
                </span>
                <p className="text-[11px] text-[#6B6166] leading-relaxed">
                  Preserve your custom 3-note perfume blends and flacon specifications.
                </p>
              </div>
              <div className="p-4 bg-[#FBF7F0] border border-[#DAD1C5]/40">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9A25C] block mb-1">
                  02 / Secure Checkout
                </span>
                <p className="text-[11px] text-[#6B6166] leading-relaxed">
                  Fast address auto-fill and direct PromptPay verification with courier dispatch.
                </p>
              </div>
              <div className="p-4 bg-[#FBF7F0] border border-[#DAD1C5]/40">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9A25C] block mb-1">
                  03 / Perfumer Care
                </span>
                <p className="text-[11px] text-[#6B6166] leading-relaxed">
                  Real-time direct chat with our studio master perfumers for adjustments.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={() => onNavigate('scentify')}
                className="text-xs text-[#6B6166] hover:text-[#28192A] underline transition-colors"
              >
                ← Return to Scentify &amp; Ingredients
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-[#DAD1C5]/40 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#6B6166] font-medium block mb-2">
              Shopping Bag / 0{items.length} Items
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#28192A]">
              Your Cart
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6166] font-light mt-1">
              {items.length === 0
                ? 'Your fragrance bag is currently empty.'
                : `${items.length} items ready for payment`}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FBF7F0] border border-[#DAD1C5] text-xs text-[#28192A] self-start sm:self-auto">
            <UserCheck className="w-3.5 h-3.5 text-[#C9A25C]" />
            <span className="font-medium">Signed in as {currentUser}</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-[#FBF7F0] border border-[#DAD1C5] p-8 max-w-lg mx-auto">
            <ShoppingBag className="w-12 h-12 text-[#6B6166] mx-auto mb-4 stroke-1" />
            <h3 className="font-serif text-2xl text-[#28192A]">Your shopping bag is empty</h3>
            <p className="text-xs text-[#6B6166] mt-2 mb-6 font-light">
              Compose your personal scent or explore the signature botanical collection.
            </p>
            <button
              onClick={() => onNavigate('scentify')}
              className="px-6 py-3 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-widest hover:bg-[#3D2540] transition-colors"
            >
              Compose in Scentify →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Items Column */}
            <div className="lg:col-span-7 space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FBF7F0] border border-[#DAD1C5] p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-[#DAD1C5] transition-colors"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FBF7F0] border border-[#DAD1C5]/40 p-2 shrink-0 flex items-center justify-center">
                      <img
                        src={item.image || '/assets/botanicals/custom_bottle.png'}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-[#28192A]">{item.title}</h3>
                      <p className="text-xs text-[#6B6166] mt-0.5">{item.subtitle}</p>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-[11px] text-[#6B6166] hover:text-red-700 underline mt-2 block"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Quantity and Line Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-[#DAD1C5]/30">
                    <div className="flex items-center border border-[#DAD1C5] bg-[#FBF7F0]">
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="px-2.5 py-1 text-[#6B6166] hover:text-[#28192A] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 py-1 text-xs font-medium text-[#28192A]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-[#6B6166] hover:text-[#28192A] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="font-serif text-base sm:text-lg text-[#28192A] min-w-[80px] text-right font-medium">
                      ฿ {item.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Order Summary Card matching Figma */}
            <div className="lg:col-span-5 bg-[#FBF7F0] border border-[#DAD1C5] p-6 sm:p-8">
              <h2 className="font-serif text-2xl text-[#28192A] pb-4 border-b border-[#DAD1C5]/50">
                Order Summary
              </h2>

              <div className="py-5 space-y-3.5 text-xs text-[#6B6166]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#28192A]">฿ {subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-[#28192A] font-medium">
                    {shipping === 0 ? 'Free' : `฿ ${shipping}`}
                  </span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between text-[#C9A25C]">
                    <span>Studio Privilege (10%)</span>
                    <span>- ฿ {discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated tax</span>
                  <span className="text-[#28192A]">฿ 0</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 pb-6 border-t border-[#DAD1C5]/50 flex justify-between items-baseline">
                <span className="font-serif text-lg text-[#28192A]">Total</span>
                <span className="font-serif text-2xl font-medium text-[#28192A]">
                  ฿ {total.toLocaleString()}
                </span>
              </div>

              {/* Promo Code Input */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code (e.g. SCENTIFY10)"
                    disabled={promoApplied}
                    className="flex-1 bg-[#FBF7F0] border border-[#DAD1C5] px-3.5 py-2.5 text-xs text-[#28192A] placeholder-[#6B6166]/60 focus:outline-none focus:border-[#28192A]"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoApplied}
                    className="px-4 py-2.5 bg-[#FBF7F0] border border-[#DAD1C5] text-xs font-medium text-[#28192A] hover:bg-[#28192A] hover:text-[#FFFDF8] transition-colors disabled:opacity-50"
                  >
                    {promoApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
                {promoError && (
                  <p className="text-[11px] text-amber-800 mt-1.5">{promoError}</p>
                )}
                {promoApplied && (
                  <p className="text-[11px] text-emerald-800 mt-1.5 flex items-center gap-1">
                    <Check className="w-3 h-3" /> 10% discount applied to your order.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleProceed}
                  className="w-full py-4 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#3D2540] transition-colors text-center shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#C9A25C]" />
                </button>

                <button
                  onClick={() => onNavigate('collection')}
                  className="w-full py-2.5 text-xs text-[#6B6166] hover:text-[#28192A] text-center block transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-[#DAD1C5]/30 text-center">
                <span className="text-[10px] tracking-wider text-[#6B6166]/70 uppercase">
                  Secure checkout · Thai QR available at payment
                </span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};