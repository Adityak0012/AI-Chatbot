import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let isValid = true;
    const newErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }
    if (!formData.identifier) {
      newErrors.identifier = 'Email or phone number is required';
      isValid = false;
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
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
        const errorMessage = error.response?.data?.detail || 'An error occurred during registration.';
        setErrors({ general: typeof errorMessage === 'string' ? errorMessage : 'Registration failed' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0A0A0F] to-[#1a0b2e] px-4 py-8 overflow-y-auto sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-w-[450px] w-full space-y-8 bg-white/10 dark:bg-[#18181F]/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-[#2A2A35]"
      >
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors -mt-2 -mb-2"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-violet-600 dark:bg-violet-500 rounded-xl flex items-center justify-center shadow-md">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
            Sign up to get started with AI Chatbot Pro.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {errors.general}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm bg-gray-50 dark:bg-gray-700/50 dark:text-white transition-colors duration-200 ${
                    errors.fullName ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-violet-500'
                  }`}
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  disabled={isLoading}
                />
              </div>
              {errors.fullName && <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-pulse">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email or Phone Number
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  placeholder="name@company.com or phone number"
                  className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm bg-gray-50 dark:bg-gray-700/50 dark:text-white transition-colors duration-200 ${
                    errors.identifier ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-violet-500'
                  }`}
                  value={formData.identifier}
                  onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                  disabled={isLoading}
                />
              </div>
              {errors.identifier && <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-pulse">{errors.identifier}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm bg-gray-50 dark:bg-gray-700/50 dark:text-white pr-10 transition-colors duration-200 ${
                    errors.password ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-violet-500'
                  }`}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-pulse">{errors.password}</p>}
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
                  Creating account...
                </span>
              ) : 'Sign Up'}
            </button>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors">
              Sign in
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
