import React, { useState } from 'react';
import { Bot, User, Key, ArrowRight, UserPlus, LogIn, Shield, Briefcase, UserCheck } from 'lucide-react';
import { UserRole } from '../types';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole, email: string, token?: string, userDetails?: any) => void;
  onCancel?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onCancel }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('citizen@civic.org');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('CITIZEN');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      onLoginSuccess(data.user.role, data.user.email, data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate credentials');
    } finally {
      setLoading(false);
    }
  };

  const performRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name.trim() || email.split('@')[0],
          role: selectedRole
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      onLoginSuccess(data.user.role, data.user.email, data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Failed to register user');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      performLogin(email, password);
    } else {
      performRegister();
    }
  };

  const handleDemoSelect = (_role: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    performLogin(demoEmail, 'password123');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">
            {mode === 'login' ? 'AutoOps Sign In' : 'Create AutoOps Account'}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            {mode === 'login' ? 'Access your operational portal' : 'Register with selected system role'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
              mode === 'login'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
              mode === 'register'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 font-mono">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Select System Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('CITIZEN')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center space-y-1 transition-all ${
                      selectedRole === 'CITIZEN'
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300 ring-1 ring-teal-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span className="text-[10px] font-mono font-bold uppercase">Citizen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('EMPLOYEE')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center space-y-1 transition-all ${
                      selectedRole === 'EMPLOYEE'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span className="text-[10px] font-mono font-bold uppercase">Staff</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('ADMIN')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center space-y-1 transition-all ${
                      selectedRole === 'ADMIN'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span className="text-[10px] font-mono font-bold uppercase">Admin</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@autoops.gov"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Processing...' : mode === 'login' ? 'Login to Portal' : `Create ${selectedRole} Account`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Accounts Selector */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <span className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center">
            Instant Demo Credentials (1-Click Login)
          </span>

          <div className="space-y-2">
            {/* Citizen */}
            <button
              onClick={() => handleDemoSelect('CITIZEN', 'citizen@civic.org')}
              className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xs">
                  U
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-teal-400 transition-colors">
                    Citizen / Public User
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">citizen@civic.org</div>
                </div>
              </div>
              <span className="text-xs font-mono text-teal-400 font-semibold group-hover:translate-x-1 transition-transform">
                Enter →
              </span>
            </button>

            {/* Employee */}
            <button
              onClick={() => handleDemoSelect('EMPLOYEE', 'aman@autoops.gov')}
              className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
                  E
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                    Field Specialist (Aman Verma)
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">aman@autoops.gov</div>
                </div>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                Enter →
              </span>
            </button>

            {/* Admin */}
            <button
              onClick={() => handleDemoSelect('ADMIN', 'admin@autoops.gov')}
              className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                  A
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    Admin Command Operator
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">admin@autoops.gov</div>
                </div>
              </div>
              <span className="text-xs font-mono text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                Enter →
              </span>
            </button>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors pt-2 font-mono"
          >
            ← Back to Landing Page
          </button>
        )}
      </div>
    </div>
  );
};
