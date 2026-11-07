import React, { useState } from 'react';
import { Edit2, ShieldAlert, ArrowRight, Check } from 'lucide-react';
import { OrderDetails, CartItem, ViewMode } from '../types';

interface ReviewOrderViewProps {
  order: OrderDetails;
  items: CartItem[];
  currentUser?: string | null;
  onOpenSignUp?: () => void;
  onUpdateAddress: (addressData: Partial<OrderDetails>) => void;
  onProceedToPayment: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const ReviewOrderView: React.FC<ReviewOrderViewProps> = ({
  order,
  items,
  currentUser,
  onOpenSignUp,
  onUpdateAddress,
  onProceedToPayment,
  onNavigate,
}) => {
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [formData, setFormData] = useState({
    customerName: order.customerName || currentUser || 'Guest Customer',
    address: order.address,
    city: order.city,
    province: order.province,
    postalCode: order.postalCode,
    phone: order.phone,
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 1500 ? 0 : 50;
  const total = subtotal + (items.length > 0 ? shipping : 0);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAddress(formData);
    setIsEditingAddress(false);
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-[#DAD1C5]/40">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#28192A]">
            Review Your Order
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6166] font-light mt-1.5">
            Please confirm everything looks right before placing your order.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Shipping Address & Order Items */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Shipping Address Card */}
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-6 sm:p-8 relative">
              <div className="flex items-center justify-between pb-4 border-b border-[#DAD1C5]/30 mb-4">
                <h2 className="font-serif text-xl sm:text-2xl text-[#28192A]">Shipping Address</h2>
                <button
                  onClick={() => setIsEditingAddress(true)}
                  className="text-xs text-[#28192A] hover:text-[#C9A25C] underline font-medium flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="text-xs text-[#6B6166] space-y-1.5 leading-relaxed">
                {currentUser ? (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#28192A]">{order.customerName || currentUser}</p>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Member
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#28192A]">
                        {order.customerName ? order.customerName : 'Guest Customer'}
                      </p>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-[#DAD1C5]/40 text-[#6B6166]">
                        Not logged in
                      </span>
                    </div>
                    {onOpenSignUp && (
                      <button
                        type="button"
                        onClick={onOpenSignUp}
                        className="text-xs text-[#C9A25C] hover:text-[#28192A] underline font-medium self-start sm:self-auto"
                      >
                        Sign up to save details →
                      </button>
                    )}
                  </div>
                )}
                <p>{order.address}</p>
                <p>{order.city}, {order.postalCode}, {order.country}</p>
                <p className="pt-1 text-[#28192A]">{order.phone}</p>
              </div>
            </div>

            {/* Order Items Card */}
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-6 sm:p-8">
              <h2 className="font-serif text-xl sm:text-2xl text-[#28192A] pb-4 border-b border-[#DAD1C5]/30 mb-5">
                Order Items
              </h2>

              <div className="space-y-5 divide-y divide-[#DAD1C5]/30">
                {items.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-base text-[#28192A]">
                        {item.title} — {item.subtitle.split('·')[0]?.trim()}
                      </h3>
                      <p className="text-xs text-[#6B6166] mt-0.5">
                        {item.details?.size || '50 ml'} · Qty {item.quantity}
                      </p>
                    </div>
                    <div className="font-serif text-base text-[#28192A] font-medium shrink-0">
                      ฿ {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

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

            {/* Action */}
            <div className="space-y-3">
              {!currentUser && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Sign up required before placing order</span>
                  </div>
                  {onOpenSignUp && (
                    <button
                      type="button"
                      onClick={onOpenSignUp}
                      className="text-xs font-semibold underline text-[#28192A] hover:text-[#C9A25C]"
                    >
                      Sign Up
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  if (!currentUser) {
                    if (onOpenSignUp) onOpenSignUp();
                    return;
                  }
                  onProceedToPayment();
                }}
                className="w-full py-4 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#3D2540] transition-colors text-center shadow-xs flex items-center justify-center gap-2"
              >
                <span>{currentUser ? 'Proceed to Checkout' : 'Sign Up to Proceed to Checkout'}</span>
                <ArrowRight className="w-4 h-4 text-[#C9A25C]" />
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-[#6B6166] underline cursor-pointer hover:text-[#28192A]">
                  Manual verification required
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DAD1C5]/30 text-center">
              <button
                onClick={() => onNavigate('cart')}
                className="text-xs text-[#6B6166] hover:text-[#28192A]"
              >
                ← Back to Cart
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Edit Address Modal */}
      {isEditingAddress && (
        <div className="fixed inset-0 z-50 bg-[#28192A]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF7F0] border border-[#DAD1C5] max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-serif text-2xl text-[#28192A] mb-4">
              Edit Shipping Address
            </h3>
            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#6B6166] uppercase tracking-wider text-[10px] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3.5 py-2.5 text-xs text-[#28192A] focus:outline-none focus:border-[#28192A]"
                />
              </div>

              <div>
                <label className="block text-[#6B6166] uppercase tracking-wider text-[10px] mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3.5 py-2.5 text-xs text-[#28192A] focus:outline-none focus:border-[#28192A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B6166] uppercase tracking-wider text-[10px] mb-1">
                    City / District
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3.5 py-2.5 text-xs text-[#28192A] focus:outline-none focus:border-[#28192A]"
                  />
                </div>
                <div>
                  <label className="block text-[#6B6166] uppercase tracking-wider text-[10px] mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3.5 py-2.5 text-xs text-[#28192A] focus:outline-none focus:border-[#28192A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#6B6166] uppercase tracking-wider text-[10px] mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3.5 py-2.5 text-xs text-[#28192A] focus:outline-none focus:border-[#28192A]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#DAD1C5]/30">
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="px-4 py-2 border border-[#DAD1C5] text-xs text-[#6B6166] hover:text-[#28192A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-wider hover:bg-[#3D2540]"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
