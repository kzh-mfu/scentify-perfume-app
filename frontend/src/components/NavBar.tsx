import React, { useState } from "react";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Sparkles,
  User,
  ShieldCheck,
} from "lucide-react";
import { ViewMode } from "../types";

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  cartCount: number;
  userName?: string | null;
  isAdminUser?: boolean;
  onOpenAuth: (mode?: "login" | "signup") => void;
  onLogout?: () => void;
  onOpenSearch: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  cartCount,
  userName,
  isAdminUser,
  onOpenAuth,
  onLogout,
  onOpenSearch,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FBF7F0]/90 backdrop-blur-md border-b border-[#DAD1C5]/40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <button
            onClick={() => {
              onNavigate("home");
              setMobileMenuOpen(false);
            }}
            className="flex flex-col items-start text-left group focus:outline-none"
          >
            <span className="font-serif text-2xl sm:text-3xl font-medium tracking-[0.2em] text-[#28192A] group-hover:text-[#C9A25C] transition-colors">
              Scentify
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-[0.35em] text-[#6B6166] uppercase -mt-0.5 font-light">
              PERFUME STUDIO
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-9">
            <button
              onClick={() => onNavigate("home")}
              className={`text-sm tracking-wide transition-colors ${
                currentView === "home"
                  ? "text-[#C9A25C] font-medium"
                  : "text-[#28192A]/80 hover:text-[#28192A]"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate("collection")}
              className={`text-sm tracking-wide transition-colors ${
                currentView === "collection"
                  ? "text-[#C9A25C] font-medium"
                  : "text-[#28192A]/80 hover:text-[#28192A]"
              }`}
            >
              Collection
            </button>
            <button
              onClick={() => onNavigate("scentify")}
              className={`text-sm tracking-wide transition-colors flex items-center gap-1.5 ${
                currentView === "scentify"
                  ? "text-[#C9A25C] font-medium"
                  : "text-[#28192A]/80 hover:text-[#28192A]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25C]" />
              <span>Create Scent</span>
            </button>
            <button
              onClick={() => onNavigate("about")}
              className={`text-sm tracking-wide transition-colors ${
                currentView === "about"
                  ? "text-[#C9A25C] font-medium"
                  : "text-[#28192A]/80 hover:text-[#28192A]"
              }`}
            >
              About
            </button>
            <button
              onClick={() => onNavigate("journal")}
              className={`text-sm tracking-wide transition-colors ${
                currentView === "journal"
                  ? "text-[#C9A25C] font-medium"
                  : "text-[#28192A]/80 hover:text-[#28192A]"
              }`}
            >
              Journal
            </button>
          </nav>

          {/* Actions: Search, Cart, Auth & Shop Now */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Admin Console Shortcut if Admin */}
            {isAdminUser && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="px-3 py-1.5 bg-[#28192A] text-[#FBF7F0] border border-[#C9A25C] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#3D2540] transition-colors shadow-xs"
                title="Open Scentify Studio Full Page Admin Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A25C]" />
                <span className="hidden sm:inline">Admin Console</span>
              </button>
            )}

            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#28192A] hover:text-[#C9A25C] transition-colors focus:outline-none"
              aria-label="Search ingredients"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* Shopping Cart */}
            <button
              onClick={() => onNavigate("cart")}
              className="p-2 text-[#28192A] hover:text-[#C9A25C] transition-colors relative focus:outline-none"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#C9A25C] text-[#FFFDF8] text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Auth */}
            {userName ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => onNavigate("profile")}
                  className={`flex items-center gap-1.5 p-1.5 transition-colors text-xs ${
                    currentView === "profile"
                      ? "text-[#C9A25C] font-semibold"
                      : "text-[#28192A] hover:text-[#C9A25C]"
                  }`}
                  title={`View ${userName}'s Profile, Address & Orders`}
                >
                  <User className="w-4 h-4 stroke-[1.5]" />
                  <span className="max-w-[100px] truncate text-xs font-medium underline underline-offset-4 decoration-[#C9A25C]/40 hover:decoration-[#C9A25C]">
                    {userName}
                  </span>
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="text-[11px] text-[#6B6166] hover:text-red-700 underline transition-colors"
                  >
                    Log out
                  </button>
                )}
              </div>
            ) : !isAdminUser ? (
              <button
                onClick={() => onOpenAuth("signup")}
                className="hidden sm:inline-flex items-center text-xs tracking-[0.15em] uppercase font-medium text-[#28192A] hover:text-[#C9A25C] transition-colors py-1.5 px-3 border border-[#DAD1C5] hover:border-[#28192A]"
              >
                Sign Up
              </button>
            ) : null}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#28192A] md:hidden focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[1.5]" />
              ) : (
                <Menu className="w-6 h-6 stroke-[1.5]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FBF7F0] border-b border-[#DAD1C5] px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3">
            {isAdminUser && onOpenAdmin && (
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2.5 px-3 bg-[#28192A] text-[#FBF7F0] font-mono text-xs uppercase flex items-center justify-between border border-[#C9A25C]"
              >
                <span>Full Page Admin Portal</span>
                <ShieldCheck className="w-4 h-4 text-[#C9A25C]" />
              </button>
            )}

            <button
              onClick={() => {
                onNavigate("home");
                setMobileMenuOpen(false);
              }}
              className="text-left text-base font-serif text-[#28192A] py-1 border-b border-[#DAD1C5]/30 flex justify-between items-center"
            >
              <span>Home</span>
              <span className="text-xs font-sans text-[#C9A25C]">01</span>
            </button>
            <button
              onClick={() => {
                onNavigate("collection");
                setMobileMenuOpen(false);
              }}
              className="text-left text-base font-serif text-[#28192A] py-1 border-b border-[#DAD1C5]/30 flex justify-between items-center"
            >
              <span>Collection &amp; Ingredients</span>
              <span className="text-xs font-sans text-[#C9A25C]">02</span>
            </button>
            <button
              onClick={() => {
                onNavigate("scentify");
                setMobileMenuOpen(false);
              }}
              className="text-left text-base font-serif text-[#28192A] py-1 border-b border-[#DAD1C5]/30 flex justify-between items-center"
            >
              <span>Create Your Perfume (Scentify)</span>
              <span className="text-xs font-sans text-[#C9A25C]">03</span>
            </button>
            <button
              onClick={() => {
                onNavigate("review-fragrance");
                setMobileMenuOpen(false);
              }}
              className="text-left text-base font-serif text-[#28192A] py-1 border-b border-[#DAD1C5]/30 flex justify-between items-center"
            >
              <span>Review Custom Fragrance</span>
              <span className="text-xs font-sans text-[#C9A25C]">04</span>
            </button>
            <button
              onClick={() => {
                onNavigate("cart");
                setMobileMenuOpen(false);
              }}
              className="text-left text-base font-serif text-[#28192A] py-1 border-b border-[#DAD1C5]/30 flex justify-between items-center"
            >
              <span>Shopping Bag {cartCount > 0 ? `(${cartCount})` : ""}</span>
              <span className="text-xs font-sans text-[#C9A25C]">05</span>
            </button>
            <button
              onClick={() => {
                onNavigate("chat");
                setMobileMenuOpen(false);
              }}
              className="text-left text-base font-serif text-[#28192A] py-1 border-b border-[#DAD1C5]/30 flex justify-between items-center"
            >
              <span>Customer Care &amp; Perfumer Chat</span>
              <span className="text-xs font-sans text-[#C9A25C]">06</span>
            </button>
            <button
              onClick={() => {
                onNavigate("about");
                setMobileMenuOpen(false);
              }}
              className="text-left text-base font-serif text-[#28192A] py-1 border-b border-[#DAD1C5]/30"
            >
              Our Story (About)
            </button>
            <button
              onClick={() => {
                onNavigate("journal");
                setMobileMenuOpen(false);
              }}
              className="text-left text-base font-serif text-[#28192A] py-1"
            >
              Journal
            </button>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              onClick={() => {
                onNavigate("scentify");
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-[#28192A] text-[#FBF7F0] text-xs uppercase tracking-[0.2em] font-medium text-center"
            >
              Compose Perfume
            </button>
            {userName ? (
              <div className="flex items-center justify-between py-2.5 px-3 bg-[#FBF7F0] border border-[#DAD1C5] text-xs">
                <button
                  onClick={() => {
                    onNavigate("profile");
                    setMobileMenuOpen(false);
                  }}
                  className="text-left hover:text-[#C9A25C] text-[#28192A] flex-1"
                >
                  <span className="text-[10px] uppercase font-mono text-[#6B6166] block">
                    My Profile
                  </span>
                  <span>
                    <strong>{userName}</strong> (Address &amp; Orders) →
                  </span>
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-[#6B6166] hover:text-red-700 underline text-xs ml-2 shrink-0"
                  >
                    Log out
                  </button>
                )}
              </div>
            ) : !isAdminUser ? (
              <button
                onClick={() => {
                  onOpenAuth("signup");
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 border border-[#28192A] text-[#28192A] text-xs uppercase tracking-[0.2em] text-center hover:bg-[#28192A] hover:text-[#FBF7F0] transition-colors"
              >
                Sign Up
              </button>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
};
