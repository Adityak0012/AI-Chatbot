import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const VerifyOtp = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [code, setCode]           = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors]       = useState({});
  const [success, setSuccess]     = useState('');

  const target = location.state?.email || '';

  useEffect(() => {
    if (!target) navigate('/login');
  }, [target, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) { setErrors({ code: 'Please enter a valid 6-digit code' }); return; }
    setIsLoading(true);
    setErrors({});
    try {
      await api.post('/auth/verify-otp', { target, purpose: 'signup', code });
      setSuccess('Account verified! Redirecting…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setErrors({ general: error.response?.data?.detail || 'Invalid or expired verification code' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrors({});
    setSuccess('');
    try {
      await api.post('/auth/resend-otp', { target, channel: 'email', purpose: 'signup' });
      setSuccess('A new code has been sent.');
    } catch {
      setErrors({ general: 'Failed to resend code' });
    } finally {
      setIsResending(false);
    }
  };

  const inputBase = 'w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 bg-[var(--surface-2)] text-[var(--text)] placeholder-[var(--placeholder)] border focus:ring-2 focus:ring-[var(--ring)]';
  const inputOk   = 'border-[var(--border)] focus:border-[var(--primary)]';
  const inputErr  = 'border-red-500/60 focus:border-red-500 focus:ring-red-500/30';

  const isRedirecting = success.includes('Redirect');

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[var(--bg)] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-[440px] w-full bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-[0_24px_64px_var(--shadow)] p-8"
      >
        <div className="text-center mb-7">
          <div className="mx-auto h-12 w-12 rounded-xl flex items-center justify-center shadow-lg mb-5" style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
            <Bot className="h-7 w-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">Verify your account</h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            We sent a 6-digit code to <span className="font-medium text-[var(--text)]">{target}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {errors.general && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center" role="alert">
              {errors.general}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center flex items-center justify-center gap-2" role="status">
              <CheckCircle className="w-4 h-4" aria-hidden="true" /> {success}
            </div>
          )}

          <div>
            <label htmlFor="otp-code" className="block text-sm font-medium text-[var(--text)] mb-1.5 text-center">Verification code</label>
            <input
              id="otp-code" name="code" type="text" inputMode="numeric" maxLength={6}
              placeholder="123456"
              className={`${inputBase} ${errors.code ? inputErr : inputOk} text-center tracking-widest text-xl font-semibold`}
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '')); if (errors.code) setErrors(p => ({ ...p, code: '' })); }}
              disabled={isLoading || isRedirecting}
              aria-invalid={!!errors.code}
              aria-describedby={errors.code ? 'code-error' : undefined}
            />
            {errors.code && <p id="code-error" className="mt-1.5 text-xs text-red-400 text-center" role="alert">{errors.code}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6 || isRedirecting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
          >
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Verifying…</> : 'Verify account'}
          </button>

          <p className="text-center text-sm text-[var(--text-secondary)]">
            Didn't receive a code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || isRedirecting}
              className="font-medium text-[var(--primary)] hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              {isResending ? 'Sending…' : 'Resend code'}
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
