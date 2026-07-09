import React, { useState, useEffect } from 'react';
import type { User, Account } from '../types';
import { DollarSign, Mail, Lock, Building, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pre-seed mock accounts database if empty (Only when Supabase is NOT configured)
  useEffect(() => {
    if (!isSupabaseConfigured) {
      const existingAccounts = localStorage.getItem('ajay_accounts');
      if (!existingAccounts) {
        const demoAccount: Account = {
          email: 'demo@company.com',
          password: 'password',
          companyName: 'Acme Corp'
        };
        localStorage.setItem('ajay_accounts', JSON.stringify([demoAccount]));
      }
    }
  }, []);

  const getAccounts = (): Account[] => {
    try {
      const accountsJson = localStorage.getItem('ajay_accounts');
      return accountsJson ? JSON.parse(accountsJson) : [];
    } catch {
      return [];
    }
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setCompanyName('');
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (!isLogin && !companyName.trim()) {
      setError('Please enter your company name.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (isSupabaseConfigured) {
      // Supabase Authentication
      if (isLogin) {
        const { data, error: loginErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (loginErr) {
          setError(loginErr.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          // Fetch company profile name
          const { data: profile } = await supabase
            .from('profiles')
            .select('company_name')
            .eq('id', data.user.id)
            .single();

          setSuccessMsg('Login successful!');
          setTimeout(() => {
            onAuthSuccess({
              email: data.user.email || email.trim(),
              companyName: profile?.company_name || 'My Company'
            });
            setLoading(false);
          }, 800);
        }
      } else {
        // Sign Up with Supabase
        const { data, error: signupErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              company_name: companyName.trim()
            }
          }
        });

        if (signupErr) {
          setError(signupErr.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          setSuccessMsg('Account created successfully! Logging you in...');
          setTimeout(() => {
            onAuthSuccess({
              email: email.trim(),
              companyName: companyName.trim()
            });
            setLoading(false);
          }, 1000);
        }
      }
    } else {
      // Local Mock Storage Authentication fallback
      const accounts = getAccounts();

      if (isLogin) {
        const userAccount = accounts.find(
          (acc) => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
        );

        if (userAccount) {
          setSuccessMsg('Login successful!');
          setTimeout(() => {
            onAuthSuccess({
              email: userAccount.email,
              companyName: userAccount.companyName
            });
            setLoading(false);
          }, 800);
        } else {
          setError('Invalid email or password. Hint: Try demo@company.com / password');
          setLoading(false);
        }
      } else {
        const emailExists = accounts.some(
          (acc) => acc.email.toLowerCase() === email.toLowerCase()
        );

        if (emailExists) {
          setError('This email is already registered.');
          setLoading(false);
          return;
        }

        const newAccount: Account = {
          email: email.toLowerCase(),
          password,
          companyName: companyName.trim()
        };

        const updatedAccounts = [...accounts, newAccount];
        localStorage.setItem('ajay_accounts', JSON.stringify(updatedAccounts));

        setSuccessMsg('Account created successfully! Logging you in...');
        setTimeout(() => {
          onAuthSuccess({
            email: newAccount.email,
            companyName: newAccount.companyName
          });
          setLoading(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center space-x-3 mb-6">
          <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-3 rounded-2xl shadow-xl shadow-violet-600/20">
            <DollarSign className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold font-display text-white tracking-tight">Ajay</h2>
        </div>
        <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-slate-400">
          Company Expense Management
        </h3>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="glass-panel p-8 rounded-3xl shadow-2xl relative border border-slate-800/80">
          {/* Glowing border top */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent"></div>

          {/* Setup notice banner if in local mock mode */}
          {!isSupabaseConfigured && (
            <div className="mb-6 bg-amber-500/15 border border-amber-500/20 text-amber-400 p-3 rounded-xl text-[10px] font-semibold leading-relaxed">
              ⚠️ Local Testing Mode active. Connect to Supabase by adding a <code>.env</code> file.
            </div>
          )}

          {/* Form Mode Toggle */}
          <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-850/50 mb-8 select-none">
            <button
              onClick={() => { if (!isLogin) handleToggle(); }}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isLogin 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { if (isLogin) handleToggle(); }}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                !isLogin 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-5 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-medium flex items-start space-x-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs font-medium flex items-center space-x-2 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1"></span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name Field (Signup Only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      setError('');
                    }}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Email Address Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="e.g. name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all"
                  required
                  disabled={loading}
                />
              </div>
              {!isSupabaseConfigured && isLogin && email === '' && (
                <p className="text-[10px] text-slate-500 mt-1.5 ml-1">
                  Demo email: <strong className="text-slate-400 font-semibold">demo@company.com</strong>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative font-sans">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder-slate-650 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isSupabaseConfigured && isLogin && password === '' && (
                <p className="text-[10px] text-slate-500 mt-1.5 ml-1">
                  Demo password: <strong className="text-slate-400 font-semibold">password</strong>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In to Workspace' : 'Set Up Account'}
              </button>
            </div>
          </form>

          {/* Prompt footer */}
          <div className="mt-8 text-center text-xs text-slate-500 font-medium">
            <span>
              {isLogin ? "Don't have an account yet?" : "Already have an account?"}{' '}
            </span>
            <button
              onClick={handleToggle}
              className="text-violet-400 hover:text-violet-300 hover:underline transition-colors font-semibold cursor-pointer"
              disabled={loading}
            >
              {isLogin ? 'Create one now' : 'Sign In instead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
