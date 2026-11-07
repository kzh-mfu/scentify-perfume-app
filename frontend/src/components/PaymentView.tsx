import React, { useState } from 'react';
import {
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  Download,
  Eye,
  ShieldCheck,
  Send,
  Sparkles,
  ExternalLink,
  ChevronRight,
  PackageCheck,
  X
} from 'lucide-react';
import { OrderDetails, CartItem, ViewMode } from '../types';

function getPlaceOrderErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (typeof error === 'object' && error !== null) {
    const details = error as Record<string, unknown>;
    const message = typeof details.message === 'string' ? details.message : null;
    const code = typeof details.code === 'string' ? details.code : null;
    const hint = typeof details.hint === 'string' ? details.hint : null;
    const extraDetails = typeof details.details === 'string' ? details.details : null;
    const diagnostic = [code && `Code: ${code}`, extraDetails, hint && `Hint: ${hint}`]
      .filter(Boolean)
      .join(' ');

    if (message) {
      return diagnostic ? `${message} (${diagnostic})` : message;
    }
  }

  return 'An unexpected error occurred while saving the order. Please try again.';
}

interface PaymentViewProps {
  order: OrderDetails;
  items: CartItem[];
  onSlipUploaded?: (fileDataUrl: string) => void;
  onPlaceOrder?: (payload: { slipUrl: string; orderId: string; total: number }) => Promise<void>;
  onNavigate: (view: ViewMode) => void;
}

export const PaymentView: React.FC<PaymentViewProps> = ({
  order,
  items,
  onSlipUploaded,
  onPlaceOrder,
  onNavigate,
}) => {
  const [uploadedSlip, setUploadedSlip] = useState<string | null>(order.paymentSlipUrl || null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState<string | null>(null);
  const [isOrderPlaced, setIsOrderPlaced] = useState(
    order.status === 'slip_uploaded' || order.status === 'verified'
  );
  const [previewSlipModal, setPreviewSlipModal] = useState<string | null>(null);

  const isSubmittedOrder =
    order.status === 'slip_uploaded' || order.status === 'verified';
  const displayedItems = isSubmittedOrder ? order.items : items;
  const subtotal = isSubmittedOrder
    ? order.subtotal
    : items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = isSubmittedOrder ? order.shipping : subtotal > 1500 ? 0 : 50;
  const total = isSubmittedOrder
    ? order.total
    : subtotal + (items.length > 0 ? shipping : 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setUploadedSlip(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateSampleSlip = () => {
    // Generate a sleek sample Thai PromptPay banking transfer slip
    const sampleSlip = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" fill="%23FFFFFF"><rect width="400" height="600" rx="16" fill="%23FBF7F0" stroke="%23DAD1C5" stroke-width="2"/><rect x="24" y="24" width="352" height="70" rx="8" fill="%2328192A"/><text x="44" y="55" fill="%23FFFDF8" font-family="serif" font-size="20">PromptPay Transfer</text><text x="44" y="75" fill="%23C9A25C" font-family="sans-serif" font-size="12">Successful Transaction</text><text x="44" y="140" fill="%236B6166" font-family="sans-serif" font-size="12">TO</text><text x="44" y="165" fill="%2328192A" font-family="serif" font-size="18" font-weight="bold">Scentify Perfume Studio</text><text x="44" y="220" fill="%236B6166" font-family="sans-serif" font-size="12">AMOUNT</text><text x="44" y="260" fill="%2328192A" font-family="serif" font-size="32" font-weight="bold">฿ ${total.toLocaleString()}.00</text><line x1="44" y1="290" x2="356" y2="290" stroke="%23DAD1C5"/><text x="44" y="330" fill="%236B6166" font-family="sans-serif" font-size="12">ORDER REF</text><text x="44" y="355" fill="%2328192A" font-family="sans-serif" font-size="14" font-weight="bold">${order.orderId}</text><text x="44" y="400" fill="%236B6166" font-family="sans-serif" font-size="12">DATE &amp; TIME</text><text x="44" y="425" fill="%2328192A" font-family="sans-serif" font-size="14">28 Oct 2026, 11:15</text><circle cx="200" cy="510" r="30" fill="%2328192A"/><path d="M190 510 L197 517 L212 502" fill="none" stroke="%23C9A25C" stroke-width="3"/></svg>`;
    setUploadedSlip(sampleSlip);
  };

  const handlePlaceOrderSubmit = async () => {
    if (!uploadedSlip) return;
    setIsPlacingOrder(true);
    setPlaceOrderError(null);
    try {
      if (onPlaceOrder) {
        await onPlaceOrder({
          slipUrl: uploadedSlip,
          orderId: order.orderId,
          total,
        });
      } else if (onSlipUploaded) {
        onSlipUploaded(uploadedSlip);
      }
      setIsOrderPlaced(true);
    } catch (error) {
      console.error('Failed to place order:', error);
      setIsOrderPlaced(false);
      setPlaceOrderError(`The order could not be saved: ${getPlaceOrderErrorMessage(error)}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-[#DAD1C5]/40 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-2">
              Secure Checkout · Step 3 of 3
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#28192A]">
              {isOrderPlaced ? 'Order Confirmation' : 'Complete Your Payment'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6166] font-light mt-1.5">
              {isOrderPlaced
                ? `Order #${order.orderId} has been successfully sent to the studio admin panel for verification.`
                : 'Scan the Thai QR code, attach your payment slip, then click Place Order to send to the admin panel.'}
            </p>
          </div>

        </div>

        {/* If Order is already placed, render the comprehensive Confirmation View */}
        {isOrderPlaced ? (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
            
            {/* Status Hero Card */}
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-8 sm:p-10 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#DAD1C5]/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-50 border border-emerald-300 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] uppercase font-mono bg-emerald-100 text-emerald-900 font-bold">
                        ORDER RECEIVED &amp; TRANSMITTED
                      </span>
                      <span className="text-xs font-mono text-[#6B6166]">
                        Ref: #{order.orderId}
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A] mt-1">
                      Thank You, {order.customerName || 'Studio Client'}
                    </h2>
                    <p className="text-xs text-[#6B6166] mt-0.5">
                      Your order and PromptPay payment slip have been sent directly to the Admin Panel.
                    </p>
                  </div>
                </div>

                <div className="text-right sm:text-right w-full sm:w-auto p-3 bg-[#FBF7F0] border border-[#DAD1C5]">
                  <span className="text-[10px] uppercase font-mono text-[#6B6166] block">Total Amount</span>
                  <span className="font-serif text-2xl text-[#28192A] font-semibold">
                    ฿ {total.toLocaleString()}.00
                  </span>
                </div>
              </div>

              {/* 4-Step Order Status Progress Bar */}
              <div className="mt-8 pt-2">
                <h3 className="text-[11px] uppercase tracking-widest font-mono text-[#6B6166] mb-4">
                  Order Progression Timeline
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Step 1 */}
                  <div className="p-3 bg-[#FBF7F0] border border-emerald-300 relative">
                    <div className="flex items-center gap-2 text-emerald-700 text-xs font-medium mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>1. Slip Uploaded</span>
                    </div>
                    <p className="text-[11px] text-[#6B6166]">
                      Slip attached &amp; order placed
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-mono text-emerald-600 font-bold">
                      COMPLETED
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 bg-[#FBF7F0] border border-amber-300 relative">
                    <div className="flex items-center gap-2 text-amber-800 text-xs font-medium mb-1">
                      <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                      <span>2. Admin Verification</span>
                    </div>
                    <p className="text-[11px] text-[#6B6166]">
                      Admin checking slip in panel
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-mono text-amber-700 font-bold">
                      IN REVIEW (ADMIN)
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 bg-[#FBF7F0]/60 border border-[#DAD1C5] opacity-75">
                    <div className="flex items-center gap-2 text-[#6B6166] text-xs font-medium mb-1">
                      <Sparkles className="w-4 h-4 text-[#C9A25C]" />
                      <span>3. Formulation</span>
                    </div>
                    <p className="text-[11px] text-[#6B6166]">
                      Master perfumer blending notes
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-mono text-[#6B6166]">
                      PENDING APPROVAL
                    </span>
                  </div>

                  {/* Step 4 */}
                  <div className="p-3 bg-[#FBF7F0]/60 border border-[#DAD1C5] opacity-75">
                    <div className="flex items-center gap-2 text-[#6B6166] text-xs font-medium mb-1">
                      <PackageCheck className="w-4 h-4 text-[#6B6166]" />
                      <span>4. Express Dispatch</span>
                    </div>
                    <p className="text-[11px] text-[#6B6166]">
                      DHL courier shipping
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-mono text-[#6B6166]">
                      QUEUED
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Slip & Dispatch Preview */}
              <div className="mt-8 pt-6 border-t border-[#DAD1C5]/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Uploaded Slip Info */}
                <div className="p-4 bg-[#FBF7F0] border border-[#DAD1C5] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {uploadedSlip && (
                      <img
                        src={uploadedSlip}
                        alt="Submitted Slip"
                        className="w-16 h-16 object-cover border border-[#DAD1C5] cursor-pointer hover:opacity-85 transition-opacity"
                        onClick={() => setPreviewSlipModal(uploadedSlip)}
                      />
                    )}
                    <div>
                      <span className="text-[10px] uppercase font-mono text-[#C9A25C] font-bold block">
                        Transmitted Payment Slip
                      </span>
                      <p className="text-xs font-medium text-[#28192A]">
                        PromptPay Transfer Slip
                      </p>
                      <button
                        onClick={() => uploadedSlip && setPreviewSlipModal(uploadedSlip)}
                        className="text-[11px] text-[#28192A] underline hover:text-[#C9A25C] flex items-center gap-1 mt-0.5"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View slip in full</span>
                      </button>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-[10px] uppercase font-mono font-semibold">
                    Awaiting Admin
                  </span>
                </div>

                {/* Delivery Address Details */}
                <div className="p-4 bg-[#FBF7F0] border border-[#DAD1C5] text-xs space-y-1">
                  <span className="text-[10px] uppercase font-mono text-[#C9A25C] font-bold block mb-1">
                    Shipping Destination
                  </span>
                  <p className="font-medium text-[#28192A]">{order.customerName}</p>
                  <p className="text-[#6B6166]">{order.address}, {order.city}, {order.province} {order.postalCode}</p>
                  <p className="text-[#6B6166]">Contact: {order.phone || 'Recorded'}</p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-[#DAD1C5]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  
                  <button
                    onClick={() => onNavigate('chat')}
                    className="flex-1 sm:flex-initial px-5 py-3 border border-[#28192A] text-[#28192A] text-xs uppercase tracking-wider hover:bg-[#28192A] hover:text-[#FFFDF8] transition-colors"
                  >
                    Chat with Perfumer
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onNavigate('profile')}
                    className="text-xs text-[#6B6166] hover:text-[#28192A] underline"
                  >
                    View in Profile Orders
                  </button>
                  <span className="text-[#DAD1C5]">·</span>
                  <button
                    onClick={() => onNavigate('home')}
                    className="text-xs text-[#6B6166] hover:text-[#28192A] underline"
                  >
                    Return to Home
                  </button>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Normal Payment Flow */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Thai QR Payment & Slip Attachment with Place Order Button */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Pay with Thai QR Card */}
              <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-6 sm:p-8">
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B6166] font-medium block">
                  PAYMENT METHOD
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A] mt-1">
                  Pay with Thai QR (PromptPay)
                </h2>
                <p className="text-xs text-[#6B6166] font-light mt-1">
                  Open your Thai mobile banking app (SCB, KBank, Bangkok Bank, Krungthai) and scan the QR code.
                </p>

                {/* QR Container */}
                <div className="mt-8 bg-[#FBF7F0] border border-[#DAD1C5] p-6 sm:p-8 flex flex-col items-center text-center max-w-md mx-auto">
                  <span className="text-[10px] tracking-[0.25em] text-[#C9A25C] uppercase font-semibold">
                    THAI QR PAYMENT
                  </span>
                  <span className="font-serif text-xl sm:text-2xl text-[#28192A] mt-1">
                    PromptPay
                  </span>

                  <div className="font-serif text-3xl sm:text-4xl font-semibold text-[#28192A] my-3">
                    ฿ {total.toLocaleString()}.00
                  </div>

                  <div className="text-xs text-[#6B6166] mb-4 space-y-0.5 font-mono">
                    <p>Order <strong className="text-[#28192A]">#{order.orderId}</strong></p>
                    <p className="font-sans">Scentify Perfume Studio</p>
                  </div>

                  {/* PromptPay QR Code Image */}
                  <div className="p-3 bg-white border border-[#DAD1C5] rounded-xs shadow-xs my-2">
                    <img
                      src="/assets/botanicals/promptpay_qr.png"
                      alt="PromptPay QR Code"
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                    />
                  </div>

                  <p className="text-[11px] text-[#6B6166] mt-4 font-light max-w-xs leading-relaxed">
                    Account: <strong>Scentify Perfume Studio Co., Ltd.</strong> · Scan with any Thai banking app.
                  </p>
                </div>

                {/* Upload Slip Box */}
                <div className="mt-8 pt-8 border-t border-[#DAD1C5]/40">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif text-xl text-[#28192A]">
                      Attach Transfer Slip
                    </h3>
                    <span className="text-[11px] font-mono text-[#C9A25C] uppercase">
                      Required for Order Placement
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6166] mt-0.5 mb-4">
                    Attach your banking receipt screenshot (JPG, PNG or PDF) to verify payment with our admin team.
                  </p>

                  {uploadedSlip ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-[#FBF7F0] border border-[#DAD1C5] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={uploadedSlip}
                            alt="Uploaded Slip"
                            className="w-16 h-16 object-cover border border-[#DAD1C5] rounded-xs cursor-pointer hover:opacity-85"
                            onClick={() => setPreviewSlipModal(uploadedSlip)}
                          />
                          <div className="text-left text-xs">
                            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Slip Attached Successfully</span>
                            </div>
                            <span className="text-[#6B6166] text-[11px] block mt-0.5">
                              Ready to place order and notify Admin Panel
                            </span>
                            <button
                              onClick={() => setPreviewSlipModal(uploadedSlip)}
                              className="text-[11px] underline text-[#28192A] hover:text-[#C9A25C] flex items-center gap-1 mt-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Click to view full slip</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer text-xs underline text-[#6B6166] hover:text-[#28192A] px-2 py-1">
                            Change File
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setUploadedSlip(null)}
                            className="text-xs text-rose-700 hover:underline px-2 py-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Prominent PLACE ORDER BUTTON */}
                      <div className="pt-2">
                        {placeOrderError && (
                          <p className="mb-3 p-3 bg-rose-50 border border-rose-200 text-xs text-rose-900" role="alert">
                            {placeOrderError}
                          </p>
                        )}
                        <button
                          onClick={handlePlaceOrderSubmit}
                          disabled={isPlacingOrder}
                          className="w-full py-4 bg-[#28192A] hover:bg-[#3D2540] text-[#FFFDF8] border border-[#C9A25C] text-sm uppercase tracking-[0.18em] font-medium transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
                        >
                          {isPlacingOrder ? (
                            <>
                              <div className="w-4 h-4 border-2 border-[#C9A25C] border-t-transparent rounded-full animate-spin" />
                              <span>Sending Order &amp; Slip to Admin Panel...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 text-[#C9A25C] group-hover:translate-x-1 transition-transform" />
                              <span>Place Order · ฿ {total.toLocaleString()}.00</span>
                            </>
                          )}
                        </button>
                        <p className="text-[11px] text-center text-[#6B6166] mt-2 font-light">
                          Clicking "Place Order" transmits all order details and slip to the Admin Panel for review.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <label className="flex-1 border-2 border-dashed border-[#DAD1C5] hover:border-[#28192A] p-6 text-center cursor-pointer transition-colors bg-[#FBF7F0]/30 hover:bg-[#FBF7F0]">
                          <Upload className="w-6 h-6 text-[#6B6166] mx-auto mb-2 stroke-[1.5]" />
                          <span className="text-xs font-medium text-[#28192A] block">+ Choose payment slip</span>
                          <span className="text-[10px] text-[#6B6166] mt-1 block">Click to upload slip from your device</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={handleSimulateSampleSlip}
                          className="shrink-0 px-5 py-4 border border-[#DAD1C5] bg-[#FBF7F0] text-xs text-[#28192A] hover:bg-[#DAD1C5]/30 transition-colors flex flex-col items-center justify-center text-center cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-[#C9A25C] mb-1" />
                          <span className="font-serif font-medium">Use Sample Slip</span>
                          <span className="text-[10px] text-[#6B6166] mt-0.5">Quick Demo Thai QR Receipt</span>
                        </button>
                      </div>

                      {/* Disabled Place Order until slip is attached */}
                      <button
                        disabled
                        className="w-full py-3.5 bg-[#DAD1C5]/50 text-[#6B6166] text-xs uppercase tracking-wider font-medium cursor-not-allowed flex items-center justify-center gap-2 border border-[#DAD1C5]"
                      >
                        <AlertCircle className="w-4 h-4 text-[#6B6166]" />
                        <span>Attach Payment Slip Above to Enable "Place Order"</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Right Column: Order Summary & Review Information */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-6 sm:p-8">
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B6166] font-medium block">
                  ORDER SUMMARY
                </span>
                <h2 className="font-serif text-2xl text-[#28192A] mt-1 pb-4 border-b border-[#DAD1C5]/50">
                  Your Bespoke Flacons
                </h2>

                <div className="py-4 space-y-4 divide-y divide-[#DAD1C5]/30">
                  {displayedItems.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex justify-between items-start text-xs">
                      <div>
                        <h4 className="font-serif text-sm text-[#28192A]">{item.title}</h4>
                        <p className="text-[11px] text-[#6B6166]">
                          {item.details?.size || '50 ml'} · Qty {item.quantity}
                        </p>
                      </div>
                      <span className="font-serif text-sm font-medium text-[#28192A]">
                        ฿ {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#DAD1C5]/50 space-y-2.5 text-xs text-[#6B6166]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#28192A]">฿ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping (DHL Express)</span>
                    <span className="text-[#28192A] font-medium">
                      {shipping === 0 ? 'Complimentary' : `฿ ${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#DAD1C5]/40 text-base font-serif text-[#28192A] font-medium">
                    <span>Total Due</span>
                    <span>฿ {total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Admin Verification Notice */}
                <div className="mt-6 p-4 bg-[#FBF7F0] border border-[#DAD1C5] text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-[#28192A] mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#C9A25C]" />
                    <span>Admin Verification Protocol</span>
                  </div>
                  <p className="text-[#6B6166] font-light leading-relaxed">
                    Once you attach your slip and click <strong>Place Order</strong>, all order information and receipt are sent to the Admin Panel. The studio administrator reviews the slip and confirms or cancels the order.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#DAD1C5]/30 flex flex-col gap-2">
                  <button
                    onClick={() => onNavigate('review-order')}
                    className="w-full py-2.5 border border-[#DAD1C5] text-xs text-[#28192A] hover:bg-[#DAD1C5]/20 transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Shipping Address</span>
                  </button>
                  <button
                    onClick={() => onNavigate('chat')}
                    className="text-center text-xs text-[#6B6166] hover:text-[#28192A] py-1"
                  >
                    Need Help? Chat with Perfumer
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#6B6166] text-center font-light">
                PromptPay payments are verified by our studio accounting team.
              </p>

            </div>

          </div>
        )}

      </div>

      {/* Slip Zoom Modal */}
      {previewSlipModal && (
        <div
          className="fixed inset-0 z-70 bg-[#28192A]/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewSlipModal(null)}
        >
          <div
            className="max-w-md w-full bg-[#FBF7F0] p-6 border border-[#DAD1C5] shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#DAD1C5] mb-4">
              <span className="font-serif text-lg text-[#28192A]">Payment Slip Preview</span>
              <button
                onClick={() => setPreviewSlipModal(null)}
                className="p-1 text-[#6B6166] hover:text-[#28192A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewSlipModal}
              alt="Payment Slip Preview"
              className="w-full h-auto object-contain border border-[#DAD1C5] max-h-[70vh]"
            />
            <div className="mt-4 pt-3 border-t border-[#DAD1C5] flex justify-end">
              <button
                onClick={() => setPreviewSlipModal(null)}
                className="px-4 py-2 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-wider"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
