import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Lock, Mail, ShieldCheck, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthOpen,
    setIsAuthOpen,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    login
  } = useStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inline field errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (!isAuthOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      setIsAuthOpen(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);

    if (!email.trim()) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must contain at least 6 characters.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      setIsAuthOpen(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCustomer = () => {
    login('wilberofficial2001@gmail.com', 'customer');
    setIsAuthOpen(false);
  };

  const handleDemoAdmin = () => {
    login('admin@novamart.store', 'admin');
    setIsAuthOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="fixed inset-0" onClick={() => !loading && setIsAuthOpen(false)} />

      <div className="relative bg-white rounded-lg max-w-sm w-full border border-slate-200 shadow-xl overflow-hidden z-10 p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 id="auth-modal-title" className="font-bold text-base text-slate-900">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Access your saved orders and hardware cart
            </p>
          </div>

          <button
            onClick={() => setIsAuthOpen(false)}
            disabled={loading}
            aria-label="Close authentication window"
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-md flex items-start gap-2 text-xs text-rose-700" role="alert">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <div>
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-md border border-slate-300 flex items-center justify-center gap-2.5 transition cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-2 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            or email
          </span>
        </div>

        {/* Email & Password Form with Inline Error Feedback */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="name@example.com"
                className={`w-full text-xs pl-8 pr-3 py-2 rounded-md border outline-none transition ${
                  emailError
                    ? 'border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                }`}
              />
            </div>
            {emailError && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{emailError}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder="Minimum 6 characters"
                className={`w-full text-xs pl-8 pr-3 py-2 rounded-md border outline-none transition ${
                  passwordError
                    ? 'border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                }`}
              />
            </div>
            {passwordError && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Logins */}
        <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Quick Sandbox Profiles
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoCustomer}
              className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 font-medium text-[11px] rounded border border-slate-200 flex items-center justify-center gap-1.5 transition"
            >
              <User className="w-3 h-3 text-slate-500" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={handleDemoAdmin}
              className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 font-medium text-[11px] rounded border border-slate-200 flex items-center justify-center gap-1.5 transition"
            >
              <ShieldCheck className="w-3 h-3 text-slate-500" />
              <span>Store Admin</span>
            </button>
          </div>
        </div>

        {/* Switch Mode */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {mode === 'signin' ? "Don't have an account?" : 'Already registered?'}{' '}
            <button
              onClick={() => {
                setErrorMsg(null);
                setEmailError(null);
                setPasswordError(null);
                setMode(mode === 'signin' ? 'signup' : 'signin');
              }}
              className="text-slate-900 font-semibold hover:underline"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
