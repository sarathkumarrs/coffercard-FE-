import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from '../services/api';
import { Sparkles, Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

const ResetPasswordPage = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [passwords, setPasswords] = useState({
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (passwords.password !== passwords.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (passwords.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${BASE_URL}/password-reset-confirm/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: uid,
                    token: token,
                    new_password: passwords.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.error || data.details || 'Failed to reset password';
                throw new Error(errorMsg);
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/login', {
                    state: { message: 'Password reset successful! Please log in with your new password.' }
                });
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to reset password. The link may be invalid or expired.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-brand-sans">
            {/* Ambient background blur */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

            {/* Brand Logo Header */}
            <div 
                onClick={() => navigate('/')} 
                className="mb-8 cursor-pointer z-10"
            >
                <Logo size="lg" theme="light" />
            </div>

            {/* Main Card */}
            <div className="max-w-md w-full bg-white rounded-[32px] p-7 sm:p-10 shadow-supercard border border-slate-100 relative z-10">
                <div className="mb-6 text-left">
                    <h2 className="text-2xl font-extrabold font-brand-outfit text-slate-900 tracking-tight">
                        Choose a new password
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Must be at least 8 characters.
                    </p>
                </div>

                {success ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-5 rounded-2xl text-center">
                        <CheckCircle2 className="w-10 h-10 text-amber-600 mx-auto mb-2" />
                        <h3 className="font-bold font-brand-outfit text-base">Password Updated!</h3>
                        <p className="text-xs text-amber-700 mt-1">
                            Redirecting to login page in 3 seconds...
                        </p>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-3.5 rounded-2xl flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-left">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={passwords.password}
                                        onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                                        placeholder="Minimum 8 characters"
                                        className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 focus:bg-white"
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
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        placeholder="Re-enter password"
                                        className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 focus:bg-white"
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

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm font-brand-outfit transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? 'Saving...' : 'Update Password'} <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </>
                )}

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <Link to="/login" className="text-xs font-bold text-amber-700 hover:text-amber-800">
                        Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
