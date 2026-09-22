import React, { useState } from 'react';
import { Check, Zap, Gem } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import api from '../services/api';

const FREE_FEATURES = [
  '20 messages per day',
  '1 AI model (basic)',
  'No file uploads',
  'No web search',
  '5 MB library storage',
];

const PRO_FEATURES = [
  'Unlimited messages',
  'All AI models',
  'File uploads (images, PDF, docs)',
  'Web search enabled',
  'Scheduled tasks',
  '5 GB library storage',
  'Priority speed',
  'Save & bookmark messages',
];

export default function Pricing() {
  const [billing, setBilling] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { userProfile, updateUserProfile } = useChat();

  const monthlyPrice = 299;
  const yearlyMonthly = 248;
  const yearlyTotal = 2978;

  const showToast = (msg) => {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--primary);color:#fff;padding:10px 20px;border-radius:999px;font-size:14px;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.2);`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  };

  const handleUpgrade = async () => {
    if (userProfile?.is_pro) return;
    setLoading(true);
    try {
      const res = await api.post('/payments/create-order', { billing });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: res.data.amount,
        currency: 'INR',
        name: 'Chatbot Pro',
        description: billing === 'monthly' ? 'Pro Plan Monthly' : 'Pro Plan Yearly',
        order_id: res.data.id,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', { ...response, billing });
            await updateUserProfile({});
            navigate('/chat');
            showToast('🎉 Welcome to Pro!');
          } catch {
            showToast('Payment verified but profile refresh failed. Please reload.');
          }
        },
        prefill: {
          name: userProfile?.full_name
            ? userProfile.full_name.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
            : '',
          email: userProfile?.email || '',
        },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setLoading(false);
        showToast('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      setLoading(false);
      const msg = err?.response?.data?.detail || 'Something went wrong. Please try again.';
      showToast(msg);
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar flex flex-col items-center py-6 px-4" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          <Gem size={13} style={{ color: 'var(--primary)' }} />
          Simple, transparent pricing
        </div>
        <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Choose your plan
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Start free. Upgrade when you're ready for more.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-3 mb-10 p-1 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <button
          onClick={() => setBilling('monthly')}
          className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
          style={billing === 'monthly'
            ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }
            : { color: 'var(--text-secondary)' }}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling('yearly')}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
          style={billing === 'yearly'
            ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }
            : { color: 'var(--text-secondary)' }}
        >
          Yearly
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: billing === 'yearly' ? 'rgba(255,255,255,0.25)' : '#10b981', color: '#fff' }}>
            Save 17%
          </span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl">
        {/* Free card */}
        <div className="flex-1 flex flex-col rounded-2xl p-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Free</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold" style={{ color: 'var(--text)' }}>₹0</span>
              <span className="text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>/month</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Perfect for trying things out.</p>
          </div>

          <ul className="flex-1 space-y-3 mb-8">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Check size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                {f}
              </li>
            ))}
          </ul>

          <button disabled
            className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed"
            style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            Current Plan
          </button>
        </div>

        {/* Pro card */}
        <div className="flex-1 flex flex-col rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: 'var(--surface)',
            border: '2px solid var(--primary)',
            boxShadow: '0 0 0 4px rgba(99,102,241,0.08)',
          }}>
          {/* Popular badge */}
          <div className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: '#fff' }}>
            Most Popular
          </div>

          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--primary)' }}>Pro</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold" style={{ color: 'var(--text)' }}>
                ₹{billing === 'monthly' ? monthlyPrice : yearlyMonthly}
              </span>
              <span className="text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>/month</span>
            </div>
            {billing === 'yearly' && (
              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                ₹{yearlyTotal} billed yearly
              </p>
            )}
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Everything, unlimited.</p>
          </div>

          <ul className="flex-1 space-y-3 mb-8">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text)' }}>
                <Check size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                {f}
              </li>
            ))}
          </ul>

          {userProfile?.is_pro ? (
            <button disabled
              className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed"
              style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              ✓ Already on Pro
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing…
                </span>
              ) : (
                <>
                  <Zap size={15} />
                  Upgrade to Pro
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
        Secure payments via Razorpay · Cancel anytime · No hidden fees
      </p>
    </div>
  );
}
