import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, Loader2, CheckCircle, EyeOff, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const channel = 'email';
  const [target, setTarget] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!target) {
      setErrors({ target: `Please enter your ${channel}` });
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      await api.post('/auth/forgot-password', {
        target: target,
        channel: channel,
        purpose: 'reset'
      });
      setSuccess('Code sent successfully!');
      setStep(2);
    } catch (error) {
      setErrors({ general: error.response?.data?.detail || 'Account not found or error sending code' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    let isValid = true;
    const newErrors = {};

    if (!code || code.length !== 6) {
      newErrors.code = 'Enter a valid 6-digit code';
      isValid = false;
    }
    if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
      isValid = false;
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      await api.post('/auth/reset-password', {
        target: target,
        code: code,
        new_password: newPassword
      });
      setSuccess('Password reset successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setErrors({ general: error.response?.data?.detail || 'Invalid or expired verification code' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0A0A0F] to-[#1a0b2e] px-4 py-8 overflow-y-auto sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-h-[90vh] overflow-y-auto scrollbar-hide max-w-[450px] w-full space-y-8 bg-white/10 dark:bg-[#18181F]/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-[#2A2A35]"
      >
        {step === 2 && (
          <button
            type="button"
            onClick={() => { setStep(1); setErrors({}); setSuccess(''); }}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors -mt-2 -mb-2"
          >
            ← Back
          </button>
        )}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-violet-600 dark:bg-violet-500 rounded-xl flex items-center justify-center shadow-md">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
            {step === 1 ? 'Choose how you want to receive your reset code.' : 'Enter the code and your new password.'}
          </p>
        </div>

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

        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleSendCode}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  placeholder="name@company.com"
                  className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm bg-gray-50 dark:bg-gray-700/50 dark:text-white transition-colors duration-200 ${
                    errors.target ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-violet-500'
                  }`}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {errors.target && <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-pulse">{errors.target}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Sending...
                  </span>
                ) : 'Send Code'}
              </button>
            </div>
            <div className="mt-4 text-center text-sm">
              <Link to="/login" className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors">
                Back to login
              </Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm bg-gray-50 dark:bg-gray-700/50 dark:text-white transition-colors duration-200 ${
                      errors.code ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-violet-500'
                    }`}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    disabled={isLoading || success.includes('Redirect')}
                  />
                </div>
                {errors.code && <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-pulse">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm bg-gray-50 dark:bg-gray-700/50 dark:text-white pr-10 transition-colors duration-200 ${
                      errors.newPassword ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-violet-500'
                    }`}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading || success.includes('Redirect')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.newPassword && <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-pulse">{errors.newPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm bg-gray-50 dark:bg-gray-700/50 dark:text-white transition-colors duration-200 ${
                      errors.confirmPassword ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-violet-500'
                    }`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading || success.includes('Redirect')}
                  />
                </div>
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-pulse">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || success.includes('Redirect')}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Resetting...
                  </span>
                ) : 'Reset Password'}
              </button>
            </div>
            
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => { setStep(1); setCode(''); }}
                disabled={isLoading || success.includes('Redirect')}
                className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
              >
                Try a different {channel}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
