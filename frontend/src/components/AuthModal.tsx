/*
 * Shared frontend tasks:
 * Firebase sign-in/sign-up, Google login, admin login, and role-based access.
 */
import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Loader2, ShieldCheck, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import { isFirebaseConfigured, firebaseAuth } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup' | 'admin';
  onClose: () => void;
  onLoginSuccess: (
    name: string,
    email: string,
    role?: 'customer' | 'admin' | 'staff' | 'perfumer'
  ) => void;
  onAdminLogin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signup',
  onClose,
  onLoginSuccess,
  onAdminLogin,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'admin'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreed, setAgreed] = useState(true);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  // Dedicated Studio Console Login State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialMode) {
      setMode(initialMode);
      setErrorMsg(null);
      setAdminError(null);
      setEmailConfirmationRequired(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Clicking "Log In As Admin" opens the Studio Console login view
  const handleAdminLogin = () => {
    setMode('admin');
    setErrorMsg(null);
    setAdminError(null);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);

    try {
      const { data, error } = await firebaseAuth.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: adminPassword,
      });
      if (error) {
        throw error;
      }
      if (!data.user) {
        throw new Error('Admin sign-in did not return a user session.');
      }
      const role = data.user.app_metadata?.role;
      if (role !== 'admin' && role !== 'staff' && role !== 'perfumer') {
        const { error: signOutError } = await firebaseAuth.auth.signOut();
        if (signOutError) {
          throw signOutError;
        }
        throw new Error('This account is not authorized for the Studio Console.');
      }

      const displayName =
        data.user.user_metadata?.display_name ||
        data.user.email?.split('@')[0] ||
        'Scentify Studio Admin';
      onLoginSuccess(displayName, data.user.email || adminEmail, role);
      onAdminLogin?.();
      onClose();
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Admin sign-in failed.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setEmailConfirmationRequired(false);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (confirmPassword && password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const { data, error } = await firebaseAuth.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: name.trim() } },
        });
        if (error) {
          throw error;
        }

        if (data.session && data.user) {
          const displayName = name.trim() || data.user.email?.split('@')[0] || 'Studio Member';
          onLoginSuccess(displayName, data.user.email || email);
          onClose();
        } else {
          setEmailConfirmationRequired(true);
        }
      } else {
        const { data, error } = await firebaseAuth.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          throw error;
        }
        if (!data.user) {
          throw new Error('Sign-in did not return a user session.');
        }
        const displayName =
          data.user.user_metadata?.display_name ||
          data.user.user_metadata?.full_name ||
          data.user.email?.split('@')[0] ||
          'Studio Member';
        const role = data.user.app_metadata?.role;
        const isStudioStaff = role === 'admin' || role === 'staff' || role === 'perfumer';
        onLoginSuccess(
          displayName,
          data.user.email || email,
          isStudioStaff ? role : 'customer'
        );
        if (isStudioStaff) {
          onAdminLogin?.();
        }
        onClose();
      }
    } catch (err) {
      console.warn('Google Identity Platform auth error:', err);
      let message = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes('invalid login credentials')) {
        message = 'invalid_credentials';
      } else if (lowerMessage.includes('already registered')) {
        message = 'already_in_use';
      } else if (lowerMessage.includes('password should be at least')) {
        message = 'Password should be at least 6 characters.';
      } else if (lowerMessage.includes('provider is not enabled') || lowerMessage.includes('unsupported provider')) {
        message = 'email_not_enabled';
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    if (!isFirebaseConfigured) {
      setErrorMsg(
        'Google sign-in is unavailable because Google Identity Platform is not configured. Add the VITE_FIREBASE_* variables, then redeploy.'
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await firebaseAuth.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging in with Google:', error);
      setErrorMsg(
        error instanceof Error ? error.message : 'Google sign-in could not be completed.'
      );
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your email address to reset password.');
      return;
    }
    setErrorMsg(null);
    try {
      const { error } = await firebaseAuth.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) {
        throw error;
      }
      setForgotPasswordSent(true);
    } catch (err) {
      console.warn('Google Identity Platform password reset error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Unable to send password reset email.');
    }
  };

  const renderErrorBanner = () => {
    if (emailConfirmationRequired) {
      return (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
          Check your inbox to confirm your email address, then sign in.
        </div>
      );
    }
    if (!errorMsg) return null;

    if (errorMsg === 'invalid_credentials') {
      return (
        <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <div>
              <p className="font-semibold text-amber-950">
                {mode === 'login'
                  ? 'Invalid email or password.'
                  : 'Unable to register with these details.'}
              </p>
              {mode === 'login' && (
                <p className="text-[11px] text-amber-800 mt-0.5">
                  If you haven't created an account yet, please sign up first.
                </p>
              )}
            </div>
          </div>
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className="text-xs text-[#28192A] font-semibold underline hover:text-[#C9A25C] pl-6 block"
            >
              Click here to Sign Up with {email ? email : 'your email'} →
            </button>
          )}
        </div>
      );
    }

    if (errorMsg === 'already_in_use') {
      return (
        <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <div>
              <p className="font-semibold text-amber-950">
                An account already exists with {email || 'this email'}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className="text-xs text-[#28192A] font-semibold underline hover:text-[#C9A25C] mt-1 block"
              >
                Click here to Sign In →
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (errorMsg === 'email_not_enabled') {
      return (
        <div className="mb-5 p-4 bg-amber-50/90 border border-amber-300 text-xs text-amber-900 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-800" />
            <div>
              <p className="font-semibold text-amber-950">
                Email sign-in is not enabled in Google Identity Platform.
              </p>
              <p className="text-[11px] text-amber-900 mt-1 leading-relaxed">
                Enable Email/Password under Google Cloud → Identity Platform → Providers, then try again.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
        <span>{errorMsg}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#28192A]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative max-w-4xl w-full my-8 bg-[#FBF7F0] border border-[#DAD1C5] shadow-2xl overflow-hidden">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#6B6166] hover:text-[#28192A] transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {mode === 'admin' ? (
          /* ADMIN CONSOLE LOGIN SCREEN */
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* Left Decorative Studio Card */}
            <div className="hidden md:flex flex-col justify-between p-10 bg-[#28192A] text-[#FFFDF8] border-r border-[#C9A25C]/30">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#C9A25C] font-semibold block mb-3">
                  RESTRICTED ACCESS
                </span>
                <h2 className="font-serif text-3xl text-[#FFFDF8] leading-tight">
                  Studio Admin Console
                </h2>
                <p className="text-xs text-[#DAD1C5]/80 font-light mt-3 leading-relaxed">
                  Secure administration interface for managing orders, verifying PromptPay transfers, adjusting formulas, and monitoring live sales reports.
                </p>
              </div>

              <div className="my-8 flex justify-center">
                <div className="w-32 h-32 rounded-full border border-[#C9A25C]/40 bg-[#3D2540] flex items-center justify-center text-[#C9A25C] shadow-lg">
                  <ShieldCheck className="w-16 h-16 stroke-[1.2]" />
                </div>
              </div>

              <div className="pt-4 border-t border-[#DAD1C5]/20">
                <span className="text-[10px] font-mono text-[#C9A25C] tracking-widest uppercase block">
                  AUTHORIZATION REQUIRED
                </span>
                <span className="text-xs text-[#DAD1C5]/70 mt-0.5 block">
                  Studio Master Perfumer &amp; Operations Team
                </span>
              </div>
            </div>

            {/* Right Admin Form */}
            <div className="p-8 sm:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#28192A] text-[#FFFDF8] font-bold">
                  ADMIN CONSOLE
                </span>
                <span className="text-xs font-mono text-[#C9A25C]">Staff Only</span>
              </div>
              <h3 className="font-serif text-3xl text-[#28192A]">
                Console Login
              </h3>
              <p className="text-xs text-[#6B6166] font-light mt-1 mb-6">
                Enter your studio staff credentials to open the Admin Console.
              </p>

              {adminError && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#6B6166] text-[11px] uppercase tracking-wider mb-1.5 font-medium">
                    Staff Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Admin email"
                    required
                    className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3.5 py-3 text-xs text-[#28192A] placeholder-[#6B6166]/50 focus:outline-none focus:border-[#28192A] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[#6B6166] text-[11px] uppercase tracking-wider mb-1.5 font-medium">
                    Staff Password
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter admin password"
                      required
                      className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3.5 py-3 pr-11 text-xs text-[#28192A] placeholder-[#6B6166]/50 focus:outline-none focus:border-[#28192A] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword((visible) => !visible)}
                      aria-label={showAdminPassword ? 'Hide admin password' : 'Show admin password'}
                      aria-pressed={showAdminPassword}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-[#6B6166] hover:text-[#28192A]"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full py-3.5 px-4 bg-[#28192A] text-[#FFFDF8] hover:bg-[#3D2540] text-xs uppercase tracking-[0.15em] font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-xs cursor-pointer"
                >
                  {adminLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{adminLoading ? 'Authenticating Console...' : 'Authenticate & Open Console'}</span>
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#DAD1C5]/30 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setAdminError(null);
                  }}
                  className="text-xs text-[#6B6166] hover:text-[#28192A] underline"
                >
                  ← Return to Customer Member Login
                </button>
              </div>
            </div>

          </div>
        ) : mode === 'login' ? (
          /* LOGIN SCREEN MATCHING FIGMA PAGE 5 & 13 */
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* Left Decorative Studio Card */}
            <div className="hidden md:flex flex-col justify-between p-10 bg-[#FBF7F0] border-r border-[#DAD1C5]">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#6B6166] font-medium block mb-3">
                  WELCOME BACK
                </span>
                <h2 className="font-serif text-3xl text-[#28192A] leading-tight">
                  Your scent story <br />continues.
                </h2>
                <p className="text-xs text-[#6B6166] font-light mt-3 leading-relaxed">
                  Pick up where your imagination left off. Your saved blends and fragrance notes are waiting.
                </p>
              </div>

              <div className="my-8 flex justify-center">
                <img
                  src="/assets/botanicals/woody.png"
                  alt="Studio Botanical Study"
                  className="w-40 h-40 object-contain drop-shadow-xs"
                />
              </div>

              <div className="pt-4 border-t border-[#DAD1C5]/40">
                <span className="text-[10px] font-mono text-[#C9A25C] tracking-widest uppercase block">
                  01 / YOUR STUDIO
                </span>
                <span className="text-xs text-[#28192A] mt-0.5 block">
                  A place for every note, blend and new idea.
                </span>
              </div>
            </div>

            {/* Right Form */}
            <div className="p-8 sm:p-12 flex flex-col justify-center">
              <h3 className="font-serif text-3xl text-[#28192A]">
                Welcome back!
              </h3>
              <p className="text-xs text-[#6B6166] font-light mt-1 mb-6">
                Enter your credentials to access your account
              </p>

              {renderErrorBanner()}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#28192A] font-medium mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3.5 py-3 text-xs text-[#28192A] placeholder-[#6B6166]/60 focus:outline-none focus:border-[#28192A]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[#28192A] font-medium">Password</label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] text-[#6B6166] hover:text-[#28192A] underline"
                    >
                      forgot password
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3.5 py-3 pr-11 text-xs text-[#28192A] placeholder-[#6B6166]/60 focus:outline-none focus:border-[#28192A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-[#6B6166] hover:text-[#28192A]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {forgotPasswordSent && (
                  <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 border border-emerald-200">
                    A password reset link has been dispatched to your email.
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-none border-[#DAD1C5] text-[#28192A] focus:ring-0"
                  />
                  <label htmlFor="remember" className="text-xs text-[#6B6166]">
                    Remember for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#3D2540] transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{loading ? 'Verifying...' : 'Login'}</span>
                </button>
              </form>

              {/* Google Sign In option */}
              <div className="mt-6 pt-6 border-t border-[#DAD1C5]/40 text-center">
                <span className="text-[10px] uppercase tracking-widest text-[#6B6166] block mb-4">
                  or continue with
                </span>
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading}
                  className="w-full py-2.5 px-4 border border-[#DAD1C5] bg-[#FBF7F0] text-xs text-[#28192A] font-medium flex items-center justify-center gap-2.5 transition-colors hover:bg-[#E9DFC9] hover:border-[#C9A25C] active:bg-[#DCC99F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A25C] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs cursor-pointer relative z-50"
                >
                  <svg className="w-4 h-4 pointer-events-none" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="pointer-events-none">{googleLoading ? 'Redirecting...' : 'Sign in with Google'}</span>
                </button>
              </div>

              <div className="mt-6 text-center text-xs text-[#6B6166]">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className="font-medium text-[#28192A] underline hover:text-[#C9A25C]"
                >
                  Sign Up
                </button>
              </div>

              {/* Small Admin Side Login */}
              <div className="mt-5 pt-3.5 border-t border-[#DAD1C5]/30 text-center">
                <button
                  type="button"
                  onClick={handleAdminLogin}
                  className="text-[11px] text-[#6B6166]/75 hover:text-[#28192A] underline transition-colors"
                >
                  Log In As Admin
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* SIGNUP SCREEN MATCHING FIGMA PAGE 8 & 14 */
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* Left Form */}
            <div className="p-8 sm:p-12 flex flex-col justify-center order-2 md:order-1">
              <h3 className="font-serif text-3xl text-[#28192A]">
                Get Started Now
              </h3>
              <p className="text-xs text-[#6B6166] font-light mt-1 mb-6">
                Enter your Credentials to access your account
              </p>

              {renderErrorBanner()}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#28192A] font-medium mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3.5 py-3 text-xs text-[#28192A] placeholder-[#6B6166]/60 focus:outline-none focus:border-[#28192A]"
                  />
                </div>

                <div>
                  <label className="block text-[#28192A] font-medium mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3.5 py-3 text-xs text-[#28192A] placeholder-[#6B6166]/60 focus:outline-none focus:border-[#28192A]"
                  />
                </div>

                <div>
                  <label className="block text-[#28192A] font-medium mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password (min. 6 characters)"
                      className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3.5 py-3 pr-11 text-xs text-[#28192A] placeholder-[#6B6166]/60 focus:outline-none focus:border-[#28192A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-[#6B6166] hover:text-[#28192A]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-none border-[#DAD1C5] text-[#28192A] focus:ring-0"
                  />
                  <label htmlFor="terms" className="text-xs text-[#6B6166]">
                    I agree to the terms &amp; policy
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#3D2540] transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{loading ? 'Creating account...' : 'Signup'}</span>
                </button>
              </form>

              {/* Or continue with Google */}
              <div className="mt-6 pt-6 border-t border-[#DAD1C5]/40 text-center">
                <span className="text-[10px] uppercase tracking-widest text-[#6B6166] block mb-4">
                  Or
                </span>
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading}
                  className="w-full py-2.5 px-4 border border-[#DAD1C5] bg-[#FBF7F0] text-xs text-[#28192A] font-medium flex items-center justify-center gap-2.5 transition-colors hover:bg-[#E9DFC9] hover:border-[#C9A25C] active:bg-[#DCC99F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A25C] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs cursor-pointer relative z-50"
                >
                  <svg className="w-4 h-4 pointer-events-none" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="pointer-events-none">{googleLoading ? 'Redirecting...' : 'Sign in with Google'}</span>
                </button>
              </div>

              <div className="mt-6 text-center text-xs text-[#6B6166]">
                Have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="font-medium text-[#28192A] underline hover:text-[#C9A25C]"
                >
                  Sign In
                </button>
              </div>
              <div className="mt-5 pt-3.5 border-t border-[#DAD1C5]/30 text-center">
                <button
                  type="button"
                  onClick={handleAdminLogin}
                  className="text-[11px] text-[#6B6166]/75 hover:text-[#28192A] underline transition-colors"
                >
                  Log In As Admin
                </button>
              </div>
            </div>

            {/* Right Decorative Card */}
            <div className="hidden md:flex flex-col justify-between p-10 bg-[#FBF7F0] border-l border-[#DAD1C5] order-1 md:order-2">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#6B6166] font-medium block mb-3">
                  BEGIN HERE
                </span>
                <h2 className="font-serif text-3xl text-[#28192A] leading-tight">
                  A world of notes <br />awaits.
                </h2>
                <p className="text-xs text-[#6B6166] font-light mt-3 leading-relaxed">
                  Make room for curiosity. Explore ingredients, shape a fragrance, and keep your creations close.
                </p>
              </div>

              <div className="my-8 flex justify-center">
                <img
                  src="/assets/botanicals/floral.png"
                  alt="Floral Botanical Branch"
                  className="w-40 h-40 object-contain drop-shadow-xs"
                />
              </div>

              <div className="pt-4 border-t border-[#DAD1C5]/40">
                <span className="text-[10px] font-mono text-[#C9A25C] tracking-widest uppercase block">
                  01 / MAKE IT YOURS
                </span>
                <span className="text-xs text-[#28192A] mt-0.5 block">
                  Your collection begins with a single note.
                </span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
