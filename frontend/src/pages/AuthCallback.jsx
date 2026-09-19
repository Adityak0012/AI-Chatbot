import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      localStorage.setItem('access_token', token);
      navigate('/chat', { replace: true });
    } else {
      navigate('/login', {
        replace: true,
        state: { googleError: error || 'Google login failed. Please try again.' },
      });
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EFEFEF' }}>
      <p style={{ fontSize: 14, color: '#6B7280' }}>Signing you in…</p>
    </div>
  );
}
