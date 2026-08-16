import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const target = location.state?.email || '';

  useEffect(() => {
    if (!target) {
      navigate('/login');
    }
  }, [target, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setErrors({ code: 'Please enter a valid 6-digit code' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      await api.post('/auth/verify-otp', {
        target: target,
        purpose: 'signup',
        code: code
      });
      setSuccess('Account verified successfully! Redirecting...');
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
      await api.post('/auth/resend-otp', {
        target: target,
        channel: 'email',
        purpose: 'signup'
      });
      setSuccess('A new code has been sent.');
    } catch (error) {
      setErrors({ general: 'Failed to resend code' });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0A0A0F] to-[#1a0b2e] px-4 py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-[450px] w-full space-y-8 bg-white/10 dark:bg-[#18181F]/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-[#2A2A35]"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-violet-600 dark:bg-violet-500 rounded-xl flex items-center justify-center shadow-md">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Verify your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
            We sent a code to {target}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {errors.general}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> {success}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                Enter 6-digit code
              </label>
              <div className="mt-2 flex justify-center">
                <input
                  type="text"
                  maxLength={6}
                  className={`appearance-none block w-48 text-center px-4 py-3 text-2xl tracking-widest border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 dark:bg-gray-700/50 dark:text-white transition-colors duration-200 ${
                    errors.code ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-violet-500'
                  }`}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  disabled={isLoading || success.includes('Redirect')}
                />
              </div>
              {errors.code && <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-pulse text-center">{errors.code}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || code.length !== 6 || success.includes('Redirect')}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Verifying...
                </span>
              ) : 'Verify'}
            </button>
          </div>
          
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend code'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
