/*
 * Team member: Saw Keh Blu (6831503087)
 * Frontend tasks: customer-care chat entry point and support-message creation.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Plus, MoreHorizontal, CheckCheck } from 'lucide-react';
import { ChatMessage, OrderDetails, ViewMode } from '../types';

interface CustomerCareViewProps {
  order: OrderDetails;
  messages: ChatMessage[];
  loadError?: string | null;
  onSendMessage: (text: string) => Promise<void>;
  onNavigate: (view: ViewMode) => void;
}

export const CustomerCareView: React.FC<CustomerCareViewProps> = ({
  order,
  messages,
  loadError,
  onSendMessage,
  onNavigate,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const emojis = ['🌿', '✨', '💐', '🍋', '🪵', '🤍', '🌸', '🌹', '🕊️'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    setIsSending(true);
    setSendError(null);
    try {
      await onSendMessage(text);
      setInputText('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Failed to send customer chat message:', error);
      setSendError(
        `Could not send message: ${error instanceof Error ? error.message : 'Unexpected error'}`
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    const message = inputText.trim();
    if (!message || isSending) return;
    void sendMessage(message);
  };

  const handleTopicClick = (topic: string) => {
    let query = '';
    if (topic === 'Order & delivery') {
      query = `Hi! Could you check the delivery timeline for my order #${order.orderId}?`;
    } else if (topic === 'Perfume ingredients') {
      query = `I would like to know more about the extraction process of the botanical Jasmine you use.`;
    } else if (topic === 'Custom fragrance') {
      query = `Could we adjust the base note balance in my custom formulation?`;
    } else if (topic === 'Payment & receipt') {
      query = `I have uploaded my PromptPay slip. Could you verify my payment?`;
    }
    if (query) {
      void sendMessage(query);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-[#DAD1C5]/40">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-2">
            Customer Care
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#28192A]">
            We are here to help.
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6166] font-light mt-1">
            Chat directly with the Scentify perfume studio about your order or fragrance.
          </p>
        </div>

        {/* 2-Column Chat Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Chat Interface */}
          <div className="lg:col-span-8 bg-[#FBF7F0] border border-[#DAD1C5] flex flex-col h-[650px] shadow-xs">
            
            {/* Chat Top Bar */}
            <div className="px-6 py-4 bg-[#FBF7F0] border-b border-[#DAD1C5]/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FBF7F0] border border-[#DAD1C5] flex items-center justify-center font-serif text-lg text-[#C9A25C] font-light shadow-2xs">
                  L
                </div>
                <div>
                  <h3 className="font-serif text-base text-[#28192A] font-medium leading-tight">
                    Scentify Perfume Studio
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span className="text-[10px] uppercase tracking-wider text-[#6B6166]">Direct studio chat</span>
                  </div>
                </div>
              </div>

              <button
                className="p-1.5 text-[#6B6166] hover:text-[#28192A] transition-colors"
                title="Options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#FBF7F0]">
              
              <div className="flex justify-center">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#6B6166]/70 bg-[#FBF7F0] px-3 py-1 border border-[#DAD1C5]/40 font-mono">
                  TODAY
                </span>
              </div>

              {messages.map((msg) => {
                const isStudio = msg.sender === 'studio';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isStudio ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-md p-4 text-xs leading-relaxed ${
                        isStudio
                          ? 'bg-[#28192A] text-[#FFFDF8] rounded-none shadow-xs'
                          : 'bg-[#FBF7F0] text-[#28192A] border border-[#DAD1C5] rounded-none shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-[#6B6166]/60 mt-1 px-1 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 bg-[#FBF7F0] border-t border-[#DAD1C5]/60 relative">
              {(loadError || sendError) && (
                <p role="alert" className="mb-3 border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">
                  {sendError || loadError}
                </p>
              )}
              {showEmojiPicker && (
                <div className="absolute bottom-16 left-4 bg-[#FBF7F0] border border-[#DAD1C5] p-2 flex gap-2 shadow-lg z-20">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setInputText((prev) => prev + emoji)}
                      className="p-1.5 hover:bg-[#FBF7F0] rounded text-base transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSend} className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-1.5">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Write a message..."
                    disabled={isSending}
                    className="flex-1 bg-transparent text-xs text-[#28192A] placeholder-[#6B6166]/60 focus:outline-none py-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1 text-[#6B6166] hover:text-[#28192A] transition-colors"
                    title="Insert emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputText((prev) => prev + ' [Attachment] ')}
                    className="p-1 text-[#6B6166] hover:text-[#28192A] transition-colors ml-1"
                    title="Add attachment"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="px-5 py-2.5 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-wider font-medium hover:bg-[#3D2540] transition-colors disabled:opacity-40 shrink-0"
                >
                  {isSending ? 'Sending…' : 'Send'}
                </button>
              </form>
            </div>

          </div>

          {/* Right Sidebar: Order Details & Topics */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Order Status Card */}
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-6">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B6166] font-medium block">
                YOUR ORDER
              </span>
              <h3 className="font-serif text-2xl text-[#28192A] mt-1 font-medium">
                #{order.orderId}
              </h3>
              <p className="text-xs text-[#6B6166] mt-0.5">
                Custom Fragrance · 50 ml
              </p>

              <div className="mt-4 pt-4 border-t border-[#DAD1C5]/40">
                <div className="px-3 py-2 bg-[#FBF7F0] border border-[#DAD1C5]/50 text-center text-xs text-[#28192A] font-medium">
                  Awaiting your confirmation
                </div>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={() => onNavigate('review-fragrance')}
                  className="text-xs text-[#C9A25C] hover:text-[#28192A] underline"
                >
                  View Fragrance Details →
                </button>
              </div>
            </div>

            {/* Quick Inquiry Topics matching Figma */}
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-6 space-y-3">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B6166] font-medium block mb-2">
                WHAT CAN WE HELP WITH?
              </span>

              {[
                'Order & delivery',
                'Perfume ingredients',
                'Custom fragrance',
                'Payment & receipt',
              ].map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicClick(topic)}
                  className="w-full text-left px-4 py-2.5 border border-[#DAD1C5]/60 hover:border-[#28192A] bg-[#FBF7F0] hover:bg-[#FBF7F0] text-xs text-[#28192A] transition-all flex items-center justify-between group"
                >
                  <span>{topic}</span>
                  <span className="text-[#6B6166] group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              ))}
            </div>

            {/* Response Time & Botanical Visual */}
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B6166] block">
                  RESPONSE TIME
                </span>
                <p className="text-xs text-[#28192A] font-medium mt-1">
                  Usually within a few hours
                </p>
                <p className="text-[11px] text-[#6B6166] mt-0.5">
                  Bangkok Studio (GMT+7)
                </p>
              </div>

              <div className="w-16 h-20 shrink-0 flex items-center justify-center">
                <img
                  src="/assets/botanicals/floral.png"
                  alt="Lavender study"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
