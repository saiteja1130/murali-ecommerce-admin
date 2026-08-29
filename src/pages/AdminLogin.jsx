import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const { login } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both administrator email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials or unauthorized admin email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Subtle luxury background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C69E58]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#506040]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-white border border-[#E8E4DC] shadow-md mb-2">
          <img
            src="/assets/images/Logo.png"
            alt="Murari's Glam & Glow"
            className="h-16 w-auto object-contain mx-auto"
          />
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-[0.14em] text-[#1D241C]">
          MURARI'S
        </h1>
        <p className="text-xs uppercase tracking-[0.25em] text-[#C69E58] font-semibold">
          Glam & Glow • Administration Suite
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-[#E8E4DC] shadow-xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A68758] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sumilux.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-[#A68758] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A68758] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6864] hover:text-[#1A1A1A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C8A87C]" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-xs text-[#6B6864]">
          Protected by Secure Encryption
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-2xl border border-[#E8E4DC] shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
              Password Reset
            </h3>
            <p className="text-xs text-[#6B6864] leading-relaxed">
              For security reasons, admin passwords must be reset by contacting IT Support at <span className="font-mono text-[#1A1A1A]">security@sumilux.com</span>.
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 bg-[#1A1A1A] text-white text-xs font-medium rounded-xl hover:bg-[#333333]"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
