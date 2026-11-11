/*
 * Team member: Saw Keh Blu (6831503087)
 * Frontend tasks: footer content, links, and customer-facing studio information.
 */
import React from 'react';
import { ViewMode } from '../types';

interface FooterProps {
  onNavigate: (view: ViewMode) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#28192A] text-[#FFFDF8] pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-[#3D2540]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-12 border-b border-[#FFFDF8]/10 gap-8">
          
          {/* Logo & Subtitle */}
          <div className="flex flex-col">
            <span className="font-serif text-2xl tracking-[0.3em] font-light text-[#FFFDF8]">
              L O R E M
            </span>
            <span className="text-[9px] tracking-[0.4em] text-[#DAD1C5]/60 uppercase mt-1">
              P E R F U M E &nbsp; S T U D I O
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-xs tracking-wider text-[#DAD1C5]/80">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-[#C9A25C] transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('collection')}
              className="hover:text-[#C9A25C] transition-colors"
            >
              Collection
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-[#C9A25C] transition-colors"
            >
              Our Story
            </button>
            <button
              onClick={() => onNavigate('scentify')}
              className="hover:text-[#C9A25C] transition-colors"
            >
              Create Your Own
            </button>
            <button
              onClick={() => onNavigate('journal')}
              className="hover:text-[#C9A25C] transition-colors"
            >
              Journal
            </button>
            <button
              onClick={() => onNavigate('chat')}
              className="hover:text-[#C9A25C] transition-colors"
            >
              Contact
            </button>
          </div>

          {/* Social */}
          <div className="flex items-center space-x-4 text-xs text-[#DAD1C5]/70">
            <span className="text-[11px] tracking-widest uppercase">Follow Us</span>
            <a
              href="#instagram"
              onClick={(e) => e.preventDefault()}
              className="w-7 h-7 rounded-full border border-[#FFFDF8]/20 flex items-center justify-center hover:border-[#C9A25C] hover:text-[#C9A25C] transition-colors"
              title="Instagram"
            >
              <span className="text-[10px]">IG</span>
            </a>
            <a
              href="#linkedin"
              onClick={(e) => e.preventDefault()}
              className="w-7 h-7 rounded-full border border-[#FFFDF8]/20 flex items-center justify-center hover:border-[#C9A25C] hover:text-[#C9A25C] transition-colors"
              title="LinkedIn"
            >
              <span className="text-[10px]">IN</span>
            </a>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#DAD1C5]/50 gap-4">
          <p>© 2026 Scentify Perfume Studio. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-[#FFFDF8] transition-colors">
              Privacy Policy
            </a>
            <span>·</span>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-[#FFFDF8] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
