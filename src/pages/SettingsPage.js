import React, { useState, useEffect } from 'react';
import { BASE_URL, fetchWithAuth } from '../services/api';
import { 
    Settings as SettingsIcon, 
    Save, 
    Building, 
    Phone, 
    MapPin, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    ExternalLink,
    Store
} from 'lucide-react';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        company_name: '',
        company_phone: '',
        company_address: '',
        company_location: '',
        redemption_instructions: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(`${BASE_URL}/vendors/settings/`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Failed to fetch settings: ${response.status}`);
            }

            const data = await response.json();
            setSettings({
                company_name: data.company_name || '',
                company_phone: data.company_phone || '',
                company_address: data.company_address || '',
                company_location: data.company_location || '',
                redemption_instructions: data.redemption_instructions || ''
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage({ type: 'error', text: `Failed to load settings: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetchWithAuth(`${BASE_URL}/vendors/settings/`, {
                method: 'PUT',
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                throw new Error(`Failed to save settings: ${response.status}`);
            }

            const data = await response.json();
            setSettings(data);
            setMessage({ type: 'success', text: 'Store settings saved successfully!' });

            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3500);
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: `Failed to save settings: ${error.message}` });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center font-brand-sans">
                <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium text-sm">
                    Loading store profile...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 font-brand-sans pb-12">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-black font-brand-outfit text-slate-900 tracking-tight">
                    Store Settings & Profile
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Configure your business profile, location details, and customer redemption instructions.
                </p>
            </div>

            {/* Notification Banner */}
            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold transition-all ${
                    message.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                    {message.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* 1. Store Identity Section */}
                <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-supercard border border-slate-100 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Store className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black font-brand-outfit text-slate-900">
                                Business Identity
                            </h2>
                            <p className="text-xs text-slate-400">
                                Shown on customer campaign games and digital prize vouchers.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Store / Company Name
                            </label>
                            <div className="relative">
                                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    name="company_name"
                                    value={settings.company_name}
                                    onChange={handleChange}
                                    placeholder="Your Business Name"
                                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Contact Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="tel"
                                    name="company_phone"
                                    value={settings.company_phone}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Physical Location */}
                <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-supercard border border-slate-100 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black font-brand-outfit text-slate-900">
                                Location & Directions
                            </h2>
                            <p className="text-xs text-slate-400">
                                Helps customers locate your outlet to redeem their in-store rewards.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Physical Store Address
                            </label>
                            <textarea
                                name="company_address"
                                value={settings.company_address}
                                onChange={handleChange}
                                rows="2"
                                placeholder="123 Market Street, Downtown, City"
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 focus:bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Google Maps Link (Optional)
                            </label>
                            <input
                                type="url"
                                name="company_location"
                                value={settings.company_location}
                                onChange={handleChange}
                                placeholder="https://maps.google.com/..."
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 focus:bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Cashier Redemption Guidelines */}
                <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-supercard border border-slate-100 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black font-brand-outfit text-slate-900">
                                Cashier Redemption Guidelines
                            </h2>
                            <p className="text-xs text-slate-400">
                                Instructions displayed to winning customers on their digital voucher screen.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Customer Instructions
                        </label>
                        <textarea
                            name="redemption_instructions"
                            value={settings.redemption_instructions}
                            onChange={handleChange}
                            rows="3"
                            placeholder="e.g. Show this screen to the counter cashier before bill payment to apply your discount."
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 focus:bg-white"
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3.5 rounded-full btn-soft-amber font-black text-sm font-brand-outfit transition-all shadow-md hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-4 h-4" /> Save Store Settings
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;
