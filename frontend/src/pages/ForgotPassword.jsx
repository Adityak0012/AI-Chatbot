import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, Loader2, CheckCircle, Eye, EyeOff, ChevronLeft, Zap, Brain, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const features = [
  { icon: Brain,  label: 'Intelligent reasoning across any topic' },
  { icon: Zap,    label: 'Instant answers, streamed in real time' },
  { icon: Shield, label: 'Private & secure — your data stays yours' },
];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const channel = 'email';
  const [step, setStep]                   = useState(1);
  const [target, setTarget]               = useState('');
  const [code, setCode]                   = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading]         = useState(false);
  const [errors, setErrors]               = useState({});
  const [success, setSuccess]             = useState('');
  const [showPassword, setShowPassword]   = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!target) { setErrors({ target: 'Please enter your email' }); return; }
    setIsLoading(true);
    setErrors({});
    try {
      await api.post('/auth/forgot-password', { target, channel, purpose: 'reset' });
      setSuccess('Code sent! Check your inbox.');
      setStep(2);
    } catch (error) {
      setErrors({ general: error.response?.data?.detail || 'Account not found or error sending code' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!code || code.length !== 6)      newErrors.code            = 'Enter a valid 6-digit code';
    if (newPassword.length < 6)          newErrors.newPassword     = 'Password must be at least 6 characters';
    if (newPassword !== confirmPassword) newErrors.confirmPassword  = 'Passwords do not match';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setIsLoading(true);
    setErrors({});
    try {
      await api.post('/auth/reset-password', { target, code, new_password: newPassword });
      setSuccess('Password reset successfully! Redirecting…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setErrors({ general: error.response?.data?.detail || 'Invalid or expired verification code' });
    } finally {
      setIsLoading(false);
    }
  };

  const isRedirecting = success.includes('Redirect');

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#EFEFEF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: 'easeOut' }}
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: '920px',
          minHeight: '540px',
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 12px 48px rgba(0,0,0,0.09)',
          border: '1px solid rgba(0,0,0,0.07)',
          overflow: 'hidden',
        }}
      >
        {/* ── Left: Brand panel ── */}
        <div
          className="hidden md:flex flex-col"
          style={{
            width: '44%',
            flexShrink: 0,
            background: '#F7F7F7',
            padding: '40px 36px',
            borderRight: '1px solid rgba(0,0,0,0.07)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: 'auto' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={17} color="#FFFFFF" aria-hidden="true" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A', letterSpacing: '-0.01em' }}>
              AI Chatbot Pro
            </span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 32, paddingBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 16 }}>
              Built for every task
            </p>
            <h2 style={{ fontSize: '1.95rem', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.03em', color: '#0A0A0A', marginBottom: 14 }}>
              Your all-in-one<br />
              <span style={{ color: '#6B7280' }}>AI assistant</span>
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: '#6B7280', marginBottom: 32, maxWidth: 280 }}>
              Ask anything, generate content, analyze data, and solve problems — powered by the latest AI models.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {features.map(({ icon: Icon, label }) => (
                <li key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: '#EBEBEB', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={11} color="#4B5563" aria-hidden="true" />
                  </span>
                  <span style={{ fontSize: 13, color: '#4B5563' }}>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Right: Form panel ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 40px', minWidth: 0 }}>

          {/* Mobile wordmark */}
          <div className="flex md:hidden items-center gap-2 mb-8">
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={14} color="#FFFFFF" aria-hidden="true" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A' }}>AI Chatbot Pro</span>
          </div>

          <div style={{ maxWidth: 340, width: '100%', margin: '0 auto' }}>

            {/* Back nav */}
            {step === 1 ? (
              <Link
                to="/login"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 500, color: '#6B7280', textDecoration: 'none', marginBottom: 24 }}
                onMouseEnter={e => e.currentTarget.style.color = '#0A0A0A'}
                onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
              >
                <ChevronLeft size={15} aria-hidden="true" /> Back to sign in
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => { setStep(1); setErrors({}); setSuccess(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 500, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 24 }}
                onMouseEnter={e => e.currentTarget.style.color = '#0A0A0A'}
                onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
              >
                <ChevronLeft size={15} aria-hidden="true" /> Back
              </button>
            )}

            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#0A0A0A', marginBottom: 6 }}>
              Reset password
            </h1>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>
              {step === 1
                ? 'Enter your email to receive a reset code.'
                : `Enter the code sent to ${target} and choose a new password.`}
            </p>

            {/* Alerts */}
            {errors.general && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: 13, marginBottom: 16 }} role="alert">
                {errors.general}
              </div>
            )}
            {success && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }} role="status">
                <CheckCircle size={14} aria-hidden="true" /> {success}
              </div>
            )}

            {/* ── Step 1: send code ── */}
            {step === 1 && (
              <form onSubmit={handleSendCode} noValidate>
                <div style={{ marginBottom: 22 }}>
                  <label htmlFor="target" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                    Email address
                  </label>
                  <LightInput
                    id="target" name="target" type="email" autoComplete="email"
                    placeholder="name@company.com"
                    value={target}
                    onChange={e => { setTarget(e.target.value); if (errors.target) setErrors(p => ({ ...p, target: '' })); }}
                    disabled={isLoading}
                    hasError={!!errors.target}
                    aria-invalid={!!errors.target}
                  />
                  {errors.target && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 5 }} role="alert">{errors.target}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%', height: 44, borderRadius: 10,
                    background: '#1A1A1A', color: '#FFFFFF',
                    fontSize: 14, fontWeight: 600, border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.65 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    transition: 'background 0.15s, opacity 0.15s',
                    marginBottom: 20, letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#2D2D2D'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1A1A1A'; }}
                >
                  {isLoading ? <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Sending…</> : 'Send code'}
                </button>

                <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
                  Remember your password?{' '}
                  <Link to="/login"
                    style={{ fontWeight: 600, color: '#0A0A0A', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                    Sign in
                  </Link>
                </p>
              </form>
            )}

            {/* ── Step 2: verify code + new password ── */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} noValidate>
                {/* Verification code */}
                <div style={{ marginBottom: 14 }}>
                  <label htmlFor="code" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                    Verification code
                  </label>
                  <LightInput
                    id="code" name="code" type="text" inputMode="numeric" maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={e => { setCode(e.target.value.replace(/\D/g, '')); if (errors.code) setErrors(p => ({ ...p, code: '' })); }}
                    disabled={isLoading || isRedirecting}
                    hasError={!!errors.code}
                    style={{ textAlign: 'center', letterSpacing: '0.25em', fontSize: 18, fontWeight: 600 }}
                    aria-invalid={!!errors.code}
                  />
                  {errors.code && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 5 }} role="alert">{errors.code}</p>}
                </div>

                {/* New password */}
                <div style={{ marginBottom: 14 }}>
                  <label htmlFor="newPassword" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                    New password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <LightInput
                      id="newPassword" name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); if (errors.newPassword) setErrors(p => ({ ...p, newPassword: '' })); }}
                      disabled={isLoading || isRedirecting}
                      hasError={!!errors.newPassword}
                      style={{ paddingRight: 44 }}
                      aria-invalid={!!errors.newPassword}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(p => !p)}
                      style={{ position: 'absolute', insetBlock: 0, right: 0, paddingRight: 14, display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#374151'}
                      onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
                    >
                      {showPassword ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                    </button>
                  </div>
                  {errors.newPassword && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 5 }} role="alert">{errors.newPassword}</p>}
                </div>

                {/* Confirm password */}
                <div style={{ marginBottom: 22 }}>
                  <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                    Confirm password
                  </label>
                  <LightInput
                    id="confirmPassword" name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors(p => ({ ...p, confirmPassword: '' })); }}
                    disabled={isLoading || isRedirecting}
                    hasError={!!errors.confirmPassword}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  {errors.confirmPassword && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 5 }} role="alert">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isRedirecting}
                  style={{
                    width: '100%', height: 44, borderRadius: 10,
                    background: '#1A1A1A', color: '#FFFFFF',
                    fontSize: 14, fontWeight: 600, border: 'none',
                    cursor: (isLoading || isRedirecting) ? 'not-allowed' : 'pointer',
                    opacity: (isLoading || isRedirecting) ? 0.65 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    transition: 'background 0.15s, opacity 0.15s',
                    marginBottom: 20, letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => { if (!isLoading && !isRedirecting) e.currentTarget.style.background = '#2D2D2D'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1A1A1A'; }}
                >
                  {isLoading ? <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Resetting…</> : 'Reset password'}
                </button>

                <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
                  Wrong email?{' '}
                  <button
                    type="button"
                    onClick={() => { setStep(1); setCode(''); setErrors({}); setSuccess(''); }}
                    disabled={isLoading || isRedirecting}
                    style={{ fontWeight: 600, color: '#0A0A0A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Try a different email
                  </button>
                </p>
              </form>
            )}

            <p style={{ textAlign: 'center', fontSize: 11, color: '#C4C4C4', marginTop: 24, lineHeight: 1.5 }}>
              By continuing, you agree to our{' '}
              <span style={{ color: '#9CA3AF' }}>Terms of Service</span>{' '}
              and{' '}
              <span style={{ color: '#9CA3AF' }}>Privacy Policy</span>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

/* ─── Light-themed input (matches Login/Register) ─── */
function LightInput({ hasError, style = {}, ...props }) {
  const base = {
    width: '100%',
    height: 42,
    padding: '0 14px',
    borderRadius: 9,
    fontSize: 14,
    outline: 'none',
    background: '#F9FAFB',
    border: `1px solid ${hasError ? '#FECACA' : '#E5E7EB'}`,
    color: '#0A0A0A',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
    ...style,
  };

  return (
    <input
      style={base}
      onFocus={e => {
        e.target.style.borderColor = hasError ? '#EF4444' : '#9CA3AF';
        e.target.style.boxShadow = hasError ? '0 0 0 3px rgba(239,68,68,0.1)' : '0 0 0 3px rgba(0,0,0,0.06)';
        e.target.style.background = '#FFFFFF';
      }}
      onBlur={e => {
        e.target.style.borderColor = hasError ? '#FECACA' : '#E5E7EB';
        e.target.style.boxShadow = 'none';
        e.target.style.background = '#F9FAFB';
      }}
      {...props}
    />
  );
}
