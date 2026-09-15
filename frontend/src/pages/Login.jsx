import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Bot, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });

  const validate = () => {
    let isValid = true;
    const newErrors = { email: '', password: '', general: '' };

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      setIsLoading(true);
      setErrors({ ...errors, general: '' });
      
      try {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await api.post('/auth/login', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        if (response.data && response.data.access_token) {
          localStorage.setItem('access_token', response.data.access_token);
          navigate('/chat');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'An error occurred during login.';
        if (error.response?.status === 403) {
          try {
            await api.post('/auth/resend-otp', {
              target: email,
              channel: 'email',
              purpose: 'signup'
            });
          } catch (resendError) {
            console.error('Failed to resend OTP automatically:', resendError);
          }
          navigate('/verify-otp', { state: { email } });
          return;
        }
        setErrors({ ...errors, general: typeof errorMessage === 'string' ? errorMessage : 'Invalid credentials' });
      } finally {
        setIsLoading(false);
      }
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
        
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-violet-600 dark:bg-violet-500 rounded-xl flex items-center justify-center shadow-md">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            AI Chatbot Pro
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Form Section */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {location.state?.reason === 'session_expired' && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm text-center">
              Your session has expired. Please log in again.
            </div>
          )}
        {errors.general && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {errors.general}
            </div>
          )}
          <div className="space-y-4">
            
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm bg-gray-50 dark:bg-gray-700/50 dark:text-white transition-colors duration-200 ${
                    errors.email 
                      ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 dark:border-gray-600 focus:border-violet-500'
                  }`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-pulse">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm bg-gray-50 dark:bg-gray-700/50 dark:text-white pr-10 transition-colors duration-200 ${
                    errors.password 
                      ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 dark:border-gray-600 focus:border-violet-500'
                  }`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-pulse">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300 select-none cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors">
                Forgot password?
              </Link>
            </div>
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
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors">
              Sign up
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
