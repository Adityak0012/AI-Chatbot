import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, Eye, EyeOff, Loader2, Zap, Brain, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const features = [
  { icon: Brain,  label: 'Intelligent reasoning across any topic' },
  { icon: Zap,    label: 'Instant answers, streamed in real time' },
  { icon: Shield, label: 'Private & secure — your data stays yours' },
];

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let isValid = true;
    const e = {};
    if (!formData.fullName)                { e.fullName   = 'Full name is required'; isValid = false; }
    if (!formData.identifier)              { e.identifier = 'Email or phone number is required'; isValid = false; }
    if (!formData.password)                { e.password   = 'Password is required'; isValid = false; }
    else if (formData.password.length < 6) { e.password   = 'Password must be at least 6 characters'; isValid = false; }
    setErrors(e);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier.trim());
      const payload = {
        full_name: formData.fullName,
        password: formData.password,
        email: isEmail ? formData.identifier.trim() : undefined,
        phone: !isEmail ? formData.identifier.trim() : undefined,
      };
      await api.post('/users/register', payload);
      navigate('/verify-otp', { state: { email: formData.identifier.trim() } });
    } catch (error) {
      const msg = error.response?.data?.detail || 'An error occurred during registration.';
      setErrors({ general: typeof msg === 'string' ? msg : 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const field = (key) => ({
    value: formData[key],
    onChange: e => { setFormData(p => ({ ...p, [key]: e.target.value })); if (errors[key]) setErrors(p => ({ ...p, [key]: '' })); },
  });

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
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#0A0A0A', marginBottom: 6 }}>
              Create an account
            </h1>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>
              Sign up to get started
            </p>

            <form onSubmit={handleSubmit} noValidate>

              {errors.general && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: 13, marginBottom: 16 }} role="alert">
                  {errors.general}
                </div>
              )}

              {/* Full name */}
              <div style={{ marginBottom: 14 }}>
                <label htmlFor="fullName" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  Full name
                </label>
                <LightInput
                  id="fullName" name="fullName" type="text" autoComplete="name"
                  placeholder="John Doe"
                  disabled={isLoading}
                  hasError={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'name-error' : undefined}
                  aria-invalid={!!errors.fullName}
                  {...field('fullName')}
                />
                {errors.fullName && <p id="name-error" style={{ fontSize: 12, color: '#DC2626', marginTop: 5 }} role="alert">{errors.fullName}</p>}
              </div>

              {/* Email or phone */}
              <div style={{ marginBottom: 14 }}>
                <label htmlFor="identifier" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  Email or phone number
                </label>
                <LightInput
                  id="identifier" name="identifier" type="text" autoComplete="email"
                  placeholder="name@company.com"
                  disabled={isLoading}
                  hasError={!!errors.identifier}
                  aria-describedby={errors.identifier ? 'id-error' : undefined}
                  aria-invalid={!!errors.identifier}
                  {...field('identifier')}
                />
                {errors.identifier && <p id="id-error" style={{ fontSize: 12, color: '#DC2626', marginTop: 5 }} role="alert">{errors.identifier}</p>}
              </div>

              {/* Password */}
              <div style={{ marginBottom: 22 }}>
                <label htmlFor="password" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <LightInput
                    id="password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    hasError={!!errors.password}
                    style={{ paddingRight: 44 }}
                    aria-describedby={errors.password ? 'pw-error' : undefined}
                    aria-invalid={!!errors.password}
                    {...field('password')}
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
                {errors.password && <p id="pw-error" style={{ fontSize: 12, color: '#DC2626', marginTop: 5 }} role="alert">{errors.password}</p>}
              </div>

              {/* Submit */}
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
                  ? <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Creating account…</>
                  : 'Create account'
                }
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
                Already have an account?{' '}
                <Link to="/login"
                  style={{ fontWeight: 600, color: '#0A0A0A', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                  Sign in
                </Link>
              </p>
            </form>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#C4C4C4', marginTop: 24, lineHeight: 1.5 }}>
              By creating an account, you agree to our{' '}
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

export default Register;

/* ─── Light-themed input (matches Login.jsx) ─── */
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
