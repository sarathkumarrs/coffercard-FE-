import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../services/api';
import { 
    Sparkles, 
    Lock, 
    User, 
    Mail, 
    ArrowRight, 
    Gift, 
    CheckCircle2, 
    AlertCircle, 
    X,
    Eye,
    EyeOff
} from 'lucide-react';
import Logo from '../components/Logo';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [resetError, setResetError] = useState('');
    const [isSubmittingReset, setIsSubmittingReset] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();
    const location = useLocation();
    const [message] = useState(location.state?.message || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login(credentials);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsSubmittingReset(true);
        setResetError('');
        setResetMessage('');

        try {
            const response = await fetch(`${BASE_URL}/password-reset/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: resetEmail }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.details || 'Failed to send reset email');
            }

            setResetMessage(data.message || 'Password reset link sent! Check your inbox.');
            setResetEmail('');
            setTimeout(() => {
                setShowForgotPassword(false);
                setResetMessage('');
            }, 4000);
        } catch (err) {
            setResetError(err.message || 'Failed to send reset email. Please try again.');
        } finally {
            setIsSubmittingReset(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-brand-sans">
            {/* Subtle background ambient blur */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

            {/* FLOATING 3D STICKERS */}
            <div className="hidden md:flex absolute top-16 left-24 animate-float-tilt-left pointer-events-none">
                <div className="bg-white rounded-2xl p-3 shadow-sticker border border-rose-100 flex items-center gap-2">
                    <div className="bg-rose-50 text-rose-500 p-1.5 rounded-xl">
                        <Gift className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black font-brand-outfit text-slate-800">₹100 OFF</span>
                </div>
            </div>

            <div className="hidden md:flex absolute bottom-20 left-28 animate-float-gentle pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 border-2 border-amber-300 shadow-sticker flex items-center justify-center -rotate-12">
                    <span className="text-amber-950 font-black text-lg">🪙</span>
                </div>
            </div>

            <div className="hidden md:flex absolute top-20 right-28 animate-float-tilt-right pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 shadow-sticker flex items-center justify-center text-slate-950 font-black text-xl font-brand-outfit rotate-12">
                    %
                </div>
            </div>

            {/* Brand Logo Header */}
            <div 
                onClick={() => navigate('/')} 
                className="mb-8 z-10"
            >
                <Logo size="lg" theme="light" />
            </div>

            {/* Main Auth Card */}
            <div className="max-w-md w-full bg-white rounded-[32px] p-7 sm:p-10 shadow-supercard border border-slate-100 relative z-10">
                {/* Header Switcher Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
                    <button
                        type="button"
                        className="flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl bg-white text-slate-900 shadow-sm transition-all"
                    >
                        Sign in
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/signup')}
                        className="flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-500 hover:text-slate-900 transition-all"
                    >
                        Create Account
                    </button>
                </div>

                <div className="mb-6 text-left">
                    <h2 className="text-2xl font-extrabold font-brand-outfit text-slate-900 tracking-tight">
                        Welcome back
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Sign in to manage your reward campaigns and in-store claims.
                    </p>
                </div>

                {message && (
                    <div className="mb-5 bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm p-3.5 rounded-2xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-3.5 rounded-2xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-left">
                            Username
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                required
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                placeholder="Enter your username"
                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-slate-50/50 focus:bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-left">
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
                            >
                                Forgot?
                            </button>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                placeholder="Enter your password"
                                className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-slate-50/50 focus:bg-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm font-brand-outfit transition-all shadow-md hover:shadow-amber-500/20 hover:scale-[1.02] transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500">
                        Don't have a merchant account?{' '}
                        <Link to="/signup" className="font-bold text-amber-700 hover:text-amber-800">
                            Create free account
                        </Link>
                    </p>
                </div>
            </div>

            {/* FORGOT PASSWORD MODAL */}
            {showForgotPassword && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-left relative">
                        <button
                            onClick={() => {
                                setShowForgotPassword(false);
                                setResetError('');
                                setResetMessage('');
                            }}
                            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                            <Mail className="w-6 h-6" />
                        </div>

                        <h3 className="text-xl font-bold font-brand-outfit text-slate-900">
                            Reset Password
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
                            Enter the email associated with your merchant account to receive a reset link.
                        </p>

                        {resetMessage && (
                            <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm p-3 rounded-2xl flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                <span>{resetMessage}</span>
                            </div>
                        )}

                        {resetError && (
                            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-3 rounded-2xl flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                                <span>{resetError}</span>
                            </div>
                        )}

                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    placeholder="vendor@company.com"
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmittingReset}
                                className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm font-brand-outfit transition-all shadow-md disabled:opacity-50"
                            >
                                {isSubmittingReset ? 'Sending link...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;