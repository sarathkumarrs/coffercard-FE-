import React, { useState } from 'react';
import { Sparkles, User, Mail, Phone, ArrowRight, ShieldCheck, Gift } from 'lucide-react';
import Logo from './Logo';

const UserRegistrationModal = ({ campaign, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validatePhone = (phone) => {
        // Allow 10 to 15 digits (to support country codes)
        const digitsOnly = phone.replace(/\D/g, '');
        return digitsOnly.length >= 10 && digitsOnly.length <= 15;
    };

    const handlePhoneChange = (e) => {
        const phone = e.target.value;
        setFormData({ ...formData, phone });

        // Clear error when user starts typing
        if (errors.phone || errors.submit) {
            setErrors({ ...errors, phone: '', submit: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        // Validate phone number
        if (!validatePhone(formData.phone)) {
            setErrors({ ...errors, phone: 'Please enter a valid phone number (10-15 digits)' });
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                submit: err.message || 'Registration failed. Please try again.'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const campaignTitle = campaign?.design_settings?.headline || campaign?.name || 'Exclusive Reward Game';
    const storeName = campaign?.vendor_name || 'Store Rewards';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-md my-auto bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 font-brand-inter animate-in fade-in zoom-in-95 duration-200">
                
                {/* Decorative Top Accent Glow */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />

                {/* Header Section */}
                <div className="text-center mb-6 relative">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 text-xs font-black tracking-wide uppercase mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        <span>Instant Reward Unlock</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black font-brand-outfit text-slate-900 tracking-tight">
                        Enter Details to Play
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                        Join <span className="font-bold text-slate-700">{storeName}</span> to play <span className="font-bold text-amber-600">{campaignTitle}</span> and win discount vouchers.
                    </p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                            Full Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all shadow-inner"
                                placeholder="e.g. Alex Morgan"
                                required
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all shadow-inner"
                                placeholder="alex@example.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Input */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                            Mobile Number (For Voucher SMS)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Phone className="w-4 h-4" />
                            </div>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                className={`w-full pl-10 pr-4 py-3 bg-slate-50/70 border rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all shadow-inner ${
                                    errors.phone ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-amber-400'
                                }`}
                                placeholder="10-digit mobile number"
                                required
                            />
                        </div>
                        {errors.phone && (
                            <p className="text-red-500 text-xs font-semibold mt-1.5 pl-1">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    {/* Submit Error Alert */}
                    {errors.submit && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                            {errors.submit}
                        </div>
                    )}

                    {/* Action Button: Soft Amber Pill Gradient */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 rounded-full btn-soft-amber font-black text-sm font-brand-outfit transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Submit & Play Now</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Trust Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Your details are protected & strictly used for claim verification</span>
                </div>
            </div>
        </div>
    );
};

export default UserRegistrationModal;