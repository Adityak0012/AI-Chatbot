import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Bot, Eye, EyeOff, Loader2, Zap, Brain, Shield, Mail, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

/* ── Left-panel features ── */
const features = [
  { icon: Brain,  label: 'Intelligent reasoning across any topic' },
  { icon: Zap,    label: 'Instant answers, streamed in real time' },
  { icon: Shield, label: 'Private & secure — your data stays yours' },
];

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors]             = useState({ email: '', password: '', general: '' });

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await fetch('http://localhost:8000/auth/google');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrors(p => ({ ...p, general: 'Google login is not configured.' }));
        setIsGoogleLoading(false);
      }
    } catch {
      setErrors(p => ({ ...p, general: 'Could not reach the server. Please try again.' }));
      setIsGoogleLoading(false);
    }
  };

  const validate = () => {
    let isValid = true;
    const e = { email: '', password: '', general: '' };
    if (!email)                           { e.email    = 'Email is required'; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(email)) { e.email    = 'Please enter a valid email address'; isValid = false; }
    if (!password)                        { e.password = 'Password is required'; isValid = false; }
    else if (password.length < 6)         { e.password = 'Password must be at least 6 characters'; isValid = false; }
    setErrors(e);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (response.data?.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        navigate('/chat');
      }
    } catch (error) {
      const msg = error.response?.data?.detail || 'An error occurred during login.';
      if (error.response?.status === 403) {
        try { await api.post('/auth/resend-otp', { target: email, channel: 'email', purpose: 'signup' }); }
        catch {}
        navigate('/verify-otp', { state: { email } });
        return;
      }
      setErrors(prev => ({ ...prev, general: typeof msg === 'string' ? msg : 'Invalid credentials' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* Page — always light */
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
            position: 'relative',
          }}
        >
          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: 'auto' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={17} color="#FFFFFF" aria-hidden="true" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A', letterSpacing: '-0.01em' }}>
              AI Chatbot Pro
            </span>
          </div>

          {/* Main copy */}
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

            {/* Feature list */}
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
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
            {/* Heading */}
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#0A0A0A', marginBottom: 6 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>
              Sign in to continue
            </p>

            {/* Google error */}
            {location.state?.googleError && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: 13, marginBottom: 20 }} role="alert">
                {location.state.googleError}
              </div>
            )}

            {/* Session expired */}
            {location.state?.reason === 'session_expired' && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', fontSize: 13, marginBottom: 20 }} role="alert">
                Your session expired. Please sign in again.
              </div>
            )}

            <AnimatePresence mode="wait">
              {!showEmailForm ? (
                /* ── Auth options view ── */
                <motion.div
                  key="auth-options"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  {/* Continue with Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    style={{
                      width: '100%', height: 44, borderRadius: 10,
                      background: '#FFFFFF', border: '1px solid #E5E7EB',
                      color: '#0A0A0A', fontSize: 14, fontWeight: 500,
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 10,
                      transition: 'border-color 0.15s, background 0.15s',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={e => { if (!isGoogleLoading) { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#F9FAFB'; } }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#FFFFFF'; }}
                  >
                    {isGoogleLoading
                      ? <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                      : <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>}
                    {isGoogleLoading ? 'Redirecting…' : 'Continue with Google'}
                  </button>

                  {/* Continue with Email */}
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(true)}
                    style={{
                      width: '100%', height: 44, borderRadius: 10,
                      background: '#1A1A1A', border: 'none',
                      color: '#FFFFFF', fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 10,
                      transition: 'background 0.15s',
                      letterSpacing: '-0.01em',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#2D2D2D'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#1A1A1A'; }}
                  >
                    <Mail size={15} aria-hidden="true" />
                    Continue with Email
                  </button>

                  <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 8 }}>
                    Don't have an account?{' '}
                    <Link to="/register"
                      style={{ fontWeight: 600, color: '#0A0A0A', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                      Create account
                    </Link>
                  </p>
                </motion.div>
              ) : (
                /* ── Email form view ── */
                <motion.div
                  key="email-form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Back link */}
                  <button
                    type="button"
                    onClick={() => { setShowEmailForm(false); setErrors({ email: '', password: '', general: '' }); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 500, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 20 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#0A0A0A'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                  >
                    <ChevronLeft size={15} aria-hidden="true" /> Back
                  </button>

                  <form onSubmit={handleSubmit} noValidate>

                    {/* General error */}
                    {errors.general && (
                      <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: 13, marginBottom: 16 }} role="alert">
                        {errors.general}
                      </div>
                    )}

                    {/* Email */}
                    <div style={{ marginBottom: 14 }}>
                      <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                        Email address
                      </label>
                      <LightInput
                        id="email" name="email" type="email" autoComplete="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
                        disabled={isLoading}
                        hasError={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && <p id="email-error" style={{ fontSize: 12, color: '#DC2626', marginTop: 5 }} role="alert">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: 14 }}>
                      <label htmlFor="password" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                        Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <LightInput
                          id="password" name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          value={password}
                          onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
                          disabled={isLoading}
                          hasError={!!errors.password}
                          style={{ paddingRight: 44 }}
                          aria-describedby={errors.password ? 'password-error' : undefined}
                          aria-invalid={!!errors.password}
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
                      {errors.password && <p id="password-error" style={{ fontSize: 12, color: '#DC2626', marginTop: 5 }} role="alert">{errors.password}</p>}
                    </div>

                    {/* Remember + Forgot */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          style={{ width: 14, height: 14, borderRadius: 4, accentColor: '#1A1A1A', cursor: 'pointer' }}
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          disabled={isLoading}
                        />
                        <span style={{ fontSize: 13, color: '#6B7280' }}>Remember me</span>
                      </label>
                      <Link to="/forgot-password" style={{ fontSize: 13, fontWeight: 500, color: '#374151', textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#0A0A0A'}
                        onMouseLeave={e => e.currentTarget.style.color = '#374151'}>
                        Forgot password?
                      </Link>
                    </div>

                    {/* Sign in button */}
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
                      {isLoading
                        ? <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Signing in…</>
                        : 'Sign in'
                      }
                    </button>

                    {/* Sign up */}
                    <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
                      Don't have an account?{' '}
                      <Link to="/register"
                        style={{ fontWeight: 600, color: '#0A0A0A', textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                        Create account
                      </Link>
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Privacy note */}
            <p style={{ textAlign: 'center', fontSize: 11, color: '#C4C4C4', marginTop: 24, lineHeight: 1.5 }}>
              By signing in, you agree to our{' '}
              <span style={{ color: '#9CA3AF' }}>Terms of Service</span>{' '}
              and{' '}
              <span style={{ color: '#9CA3AF' }}>Privacy Policy</span>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Light-themed input ─── */
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
