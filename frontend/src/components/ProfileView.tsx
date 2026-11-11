/*
 * Team member: Htoo Myat Aung (6831503006)
 * Frontend tasks: profile display, shipping-address editing, and purchase-history navigation.
 */
import React, { useState } from 'react';
import {
  User,
  MapPin,
  Package,
  Sparkles,
  LogOut,
  Edit2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Save,
} from 'lucide-react';
import { OrderDetails, PurchaseHistoryOrder, ViewMode } from '../types';
import { updateShippingAddress } from '../firebase';

interface ProfileViewProps {
  userName: string;
  userEmail?: string;
  order: OrderDetails;
  purchaseHistory: PurchaseHistoryOrder[];
  purchaseHistoryError?: string | null;
  onUpdateAddress: (addressData: Partial<OrderDetails>) => void;
  onLogout: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userName,
  userEmail,
  order,
  purchaseHistory,
  purchaseHistoryError,
  onUpdateAddress,
  onLogout,
  onNavigate,
}) => {
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [addressForm, setAddressForm] = useState({
    customerName: order.customerName || userName,
    address: order.address || '123 Riverside Road, Muang District',
    city: order.city || 'Chiang Rai',
    province: order.province || 'Chiang Rai',
    postalCode: order.postalCode || '57000',
    country: order.country || 'Thailand',
    phone: order.phone || '+66 91 234 5678',
  });

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await updateShippingAddress(addressForm);
      onUpdateAddress(addressForm);
      setIsEditingAddress(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save shipping address to Google Cloud:', err);
      setSaveError(err instanceof Error ? err.message : 'Unable to save the shipping address.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-10 border-b border-[#DAD1C5]/40 gap-4">
          <div>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-2">
              Member Studio Profile
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#28192A]">
              Welcome, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6166] font-light mt-1.5">
              Manage your personal shipping address, bespoke fragrance formulations, and past orders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('scentify')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-wider hover:bg-[#3D2540] transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25C]" />
              <span>Create Scent</span>
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#DAD1C5] hover:border-[#28192A] text-xs text-[#6B6166] hover:text-[#28192A] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Success toast notification */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Shipping address successfully updated and saved to your studio profile.</span>
            </div>
          </div>
        )}
        {saveError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-xs text-rose-900" role="alert">
            {saveError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Account & Shipping Address */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Account Info Card */}
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-6 sm:p-7">
              <div className="flex items-center gap-4 pb-5 border-b border-[#DAD1C5]/40">
                <div className="w-14 h-14 bg-[#28192A] text-[#C9A25C] flex items-center justify-center font-serif text-2xl font-light rounded-none shadow-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#28192A]">{userName}</h3>
                  <p className="text-xs text-[#6B6166]">{userEmail || 'Member'}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-800">
                      Verified Scentify Account
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 text-xs space-y-2 text-[#6B6166]">
                <div className="flex justify-between">
                  <span>Membership:</span>
                  <span className="font-medium text-[#28192A]">Scentify Studio Patron</span>
                </div>
                <div className="flex justify-between">
                  <span>Joined:</span>
                  <span className="text-[#28192A]">October 2026</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Bespoke Formulas:</span>
                  <span className="text-[#28192A] font-medium">2 Blends</span>
                </div>
              </div>
            </div>

            {/* Saved Shipping Address Card */}
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-6 sm:p-7 relative shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#DAD1C5]/40 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C9A25C]" />
                  <h3 className="font-serif text-xl text-[#28192A]">Shipping Address</h3>
                </div>
                <button
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-xs text-[#28192A] hover:text-[#C9A25C] underline font-medium flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingAddress ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              {isEditingAddress ? (
                <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs animate-in fade-in duration-150">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#6B6166] mb-1">
                      Recipient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.customerName}
                      onChange={(e) => setAddressForm({ ...addressForm, customerName: e.target.value })}
                      className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A] focus:outline-none focus:border-[#28192A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#6B6166] mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A] focus:outline-none focus:border-[#28192A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#6B6166] mb-1">
                        City / District
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A] focus:outline-none focus:border-[#28192A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#6B6166] mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A] focus:outline-none focus:border-[#28192A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#6B6166] mb-1">
                        Province
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.province}
                        onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                        className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A] focus:outline-none focus:border-[#28192A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#6B6166] mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A] focus:outline-none focus:border-[#28192A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#6B6166] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A] focus:outline-none focus:border-[#28192A]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="px-3 py-1.5 border border-[#DAD1C5] text-xs text-[#6B6166] hover:text-[#28192A]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-1.5 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-wider hover:bg-[#3D2540] flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 text-[#C9A25C]" />
                      <span>{saving ? 'Saving...' : 'Save Address'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-xs text-[#6B6166] space-y-1.5 leading-relaxed">
                  <p className="text-sm font-semibold text-[#28192A]">
                    {addressForm.customerName || userName}
                  </p>
                  <p>{addressForm.address}</p>
                  <p>
                    {addressForm.city}, {addressForm.province} {addressForm.postalCode}
                  </p>
                  <p>{addressForm.country}</p>
                  <p className="pt-1 text-[#28192A] font-medium">{addressForm.phone}</p>

                  <div className="pt-3 border-t border-[#DAD1C5]/30 flex items-center gap-2 text-[11px] text-[#6B6166]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Default delivery destination for all orders</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Purchase History */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#DAD1C5]/40 mb-6">
                <div className="flex items-center gap-2.5">
                  <Package className="w-5 h-5 text-[#C9A25C]" />
                  <h2 className="font-serif text-2xl text-[#28192A]">Purchase History</h2>
                </div>
                <span className="text-xs text-[#6B6166]">
                  {purchaseHistory.length} {purchaseHistory.length === 1 ? 'order' : 'orders'} recorded
                </span>
              </div>

              {purchaseHistoryError ? (
                <p className="py-8 text-center text-sm text-rose-800" role="alert">
                  {purchaseHistoryError}
                </p>
              ) : purchaseHistory.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-[#DAD1C5] bg-[#FBF7F0]/40">
                  <ShoppingBag className="w-9 h-9 text-[#C9A25C] mx-auto mb-3 stroke-1" />
                  <h3 className="font-serif text-xl text-[#28192A]">No purchases yet</h3>
                  <p className="text-xs text-[#6B6166] mt-2">
                    Your orders will appear here after you place one.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {purchaseHistory.map((purchase) => (
                    <div
                      key={purchase.orderId}
                      className="border border-[#DAD1C5]/70 bg-[#FBF7F0]/40 p-5 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#DAD1C5]/40">
                        <div>
                          <span className="text-[10px] tracking-widest uppercase text-[#6B6166]">
                            ORDER REF
                          </span>
                          <h4 className="font-mono text-sm font-semibold text-[#28192A]">
                            #{purchase.orderId}
                          </h4>
                          <span className="text-[11px] text-[#6B6166]">
                            {new Date(purchase.date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2.5 py-1 text-[11px] font-medium border border-amber-200 text-amber-800 bg-amber-50">
                            {purchase.status}
                          </span>
                          <div className="font-serif text-base font-semibold text-[#28192A] mt-1">
                            ฿ {purchase.total.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        {purchase.items.map((item) => (
                          <div key={item.id} className="flex justify-between gap-4 text-[#6B6166]">
                            <div>
                              <span className="font-medium text-[#28192A]">{item.title}</span>
                              <span className="text-[11px] block">
                                {item.subtitle || item.details?.notes?.join(' · ')}
                              </span>
                            </div>
                            <span className="shrink-0 font-medium text-[#28192A]">
                              Qty {item.quantity} · ฿ {item.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom inquiry prompt */}
              <div className="mt-8 pt-6 border-t border-[#DAD1C5]/40 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FBF7F0] p-4">
                <div className="text-xs text-[#6B6166]">
                  <p className="font-medium text-[#28192A]">Need assistance with a recent batch?</p>
                  <p>Our studio team provides complimentary fragrance consultation.</p>
                </div>
                <button
                  onClick={() => onNavigate('chat')}
                  className="shrink-0 px-4 py-2 border border-[#28192A] text-[#28192A] text-xs uppercase tracking-wider hover:bg-[#28192A] hover:text-[#FFFDF8] transition-colors"
                >
                  Contact Studio
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
