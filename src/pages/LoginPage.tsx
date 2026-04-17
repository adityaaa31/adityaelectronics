import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, CheckCircle, KeyRound } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { LOGO_URL } from '../constants';
import toast from 'react-hot-toast';

// step: 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-password'
type Step = 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-password';

const LoginPage = () => {
  const [step, setStep] = React.useState<Step>('login');
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { identifier, password });
      setAuth(res.data.user, res.data.token);
      toast.success('Welcome back!');
      navigate(res.data.user.role === 'admin' ? '/admin' : '/');
    } catch (e: any) {
      const msg = e.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      toast.success('OTP sent! Check your inbox.');
      setStep('forgot-otp');
    } catch (e: any) {
      const msg = e.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter the 6-digit OTP');
    setStep('forgot-password');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail, otp, newPassword });
      toast.success('Password reset successfully! Please login.');
      setStep('login');
      setForgotEmail(''); setOtp(''); setNewPassword(''); setConfirmPassword('');
    } catch (e: any) {
      const msg = e.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const resetToLogin = () => {
    setStep('login');
    setForgotEmail(''); setOtp(''); setNewPassword(''); setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 transition-colors duration-300"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200 dark:shadow-none overflow-hidden">
            <img src={LOGO_URL} alt="Aditya Electronics Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {step === 'login' ? 'Welcome Back' : 'Reset Password'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {step === 'login' && 'Login to your Aditya Electronics account'}
            {step === 'forgot-email' && 'Enter your registered email'}
            {step === 'forgot-otp' && `OTP sent to ${forgotEmail}`}
            {step === 'forgot-password' && 'Set your new password'}
          </p>
        </div>

        {/* Login */}
        {step === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Email or Phone Number" value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all dark:text-white" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="password" placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all dark:text-white" required />
            </div>
            <div className="text-right -mt-2">
              <button type="button" onClick={() => setStep('forgot-email')}
                className="text-sm text-red-600 dark:text-red-500 hover:underline font-medium">
                Forgot Password?
              </button>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-100 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Logging in...' : 'Login Now'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        )}

        {/* Step 1: Enter email */}
        {step === 'forgot-email' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="email" placeholder="Enter your registered email" value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all dark:text-white" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Sending OTP...' : 'Send OTP'}
              {!loading && <ArrowRight size={20} />}
            </button>
            <button type="button" onClick={resetToLogin}
              className="w-full text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Back to Login
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP */}
        {step === 'forgot-otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
              <p className="text-sm text-red-800 dark:text-red-400">
                We've sent a 6-digit OTP to <strong>{forgotEmail}</strong>
              </p>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Enter 6-digit OTP" value={otp}
                onChange={e => setOtp(e.target.value)} maxLength={6}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all dark:text-white" required />
            </div>
            <button type="submit"
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2">
              Verify OTP <CheckCircle size={20} />
            </button>
            <button type="button" onClick={() => setStep('forgot-email')}
              className="w-full text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Change Email
            </button>
          </form>
        )}

        {/* Step 3: New password */}
        {step === 'forgot-password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="password" placeholder="New Password" value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all dark:text-white" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="password" placeholder="Confirm New Password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all dark:text-white" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password'}
              {!loading && <CheckCircle size={20} />}
            </button>
          </form>
        )}

        {step === 'login' && (
          <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-red-600 dark:text-red-500 font-bold hover:underline">
              Register here
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LoginPage;
