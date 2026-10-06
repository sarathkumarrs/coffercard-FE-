import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
    Sparkles, 
    Lock, 
    User, 
    Mail, 
    Building, 
    ArrowRight, 
    Gift, 
    CheckCircle2, 
    AlertCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import Logo from './Logo';

const SignupForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        company_name: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${BASE_URL}/signup/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    company_name: formData.company_name
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.detail || 'Signup failed. Please try again.');
            }

            // Automatically log in the user
            await login({
                username: formData.username,
                password: formData.password
            });

            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-brand-sans">
            {/* Subtle background ambient blur */}
            <div className="absolute top-0 -right-20 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
            <div className="absolute bottom-0 -left-20 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

            {/* FLOATING 3D STICKERS */}
            <div className="hidden md:flex absolute top-16 right-24 animate-float-tilt-right pointer-events-none">
                <div className="bg-white rounded-2xl p-3 shadow-sticker border border-rose-100 flex items-center gap-2">
                    <div className="bg-rose-50 text-rose-500 p-1.5 rounded-xl">
                        <Gift className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black font-brand-outfit text-slate-800">FREE TRIAL</span>
                </div>
            </div>

            <div className="hidden md:flex absolute bottom-20 right-28 animate-float-gentle pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 border-2 border-amber-300 shadow-sticker flex items-center justify-center rotate-12">
                    <span className="text-amber-950 font-black text-lg">🪙</span>
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
                        onClick={() => navigate('/login')}
                        className="flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-500 hover:text-slate-900 transition-all"
                    >
                        Sign in
                    </button>
                    <button
                        type="button"
                        className="flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl bg-white text-slate-900 shadow-sm transition-all"
                    >
                        Create Account
                    </button>
                </div>

                <div className="mb-6 text-left">
                    <h2 className="text-2xl font-extrabold font-brand-outfit text-slate-900 tracking-tight">
                        Launch your store
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Turn walk-in shoppers into loyal repeat customers in minutes.
                    </p>
                </div>

                {/* Trust Pills */}
                <div className="mb-6 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                        <CheckCircle2 className="w-3 h-3 text-amber-600" /> 50+ In-store themes
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                        <CheckCircle2 className="w-3 h-3 text-amber-600" /> No hardware needed
                    </span>
                </div>

                {error && (
                    <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-3.5 rounded-2xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-left">
                            Business / Store Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Building className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                required
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                placeholder="e.g. Bella Café or Urban Threads"
                                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-slate-50/50 focus:bg-white"
                            />
                        </div>
                    </div>

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
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Choose a username"
                                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-slate-50/50 focus:bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-left">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="owner@store.com"
                                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-slate-50/50 focus:bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-left">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Minimum 8 characters"
                                className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-slate-50/50 focus:bg-white"
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

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-left">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="Confirm your password"
                                className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-slate-50/50 focus:bg-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 rounded-full btn-soft-amber font-black text-sm font-brand-outfit disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Create Free Store Account <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-amber-700 hover:text-amber-800">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;