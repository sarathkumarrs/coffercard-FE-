import React, { useState } from 'react';
import { 
    Palette, Sparkles, ExternalLink, Check, Store, Type, AlignLeft, 
    Globe, Eye, RefreshCw, Smartphone, Monitor, Image as ImageIcon,
    Sliders, Layout, ShieldCheck, Sun, Moon, Lock, LockOpen, ScrollText,
    Instagram, Facebook, ArrowRight
} from 'lucide-react';
import { BASE_URL, fetchWithAuth } from '../services/api';

const THEMES = [
    // ☀️ CLEAN LIGHT PRESETS (Apple, Stripe, Shopify High-Converting Retail)
    {
        id: 'modern',
        category: 'light',
        name: 'Studio Minimalist',
        badge: 'Clean Light',
        desc: 'Apple & Stripe clean aesthetic with crisp contrast & royal blue',
        primary: '#2563EB',
        secondary: '#F59E0B',
        bgHex: '#FFFFFF',
        previewGradient: 'from-blue-600 via-indigo-600 to-slate-900',
        swatchBg: '#F8FAFC',
        bgClass: 'bg-white text-slate-900',
        subtextClass: 'text-slate-600',
        cardClass: 'bg-white/95 border-slate-200 shadow-xl text-slate-900',
    },
    {
        id: 'emerald',
        category: 'light',
        name: 'Nordic Botanical',
        badge: 'Clean Light',
        desc: 'Organic mint & forest hues for wellness, food, groceries & cafes',
        primary: '#059669',
        secondary: '#D97706',
        bgHex: '#F0FDF4',
        previewGradient: 'from-emerald-600 via-teal-600 to-emerald-800',
        swatchBg: '#F0FDF4',
        bgClass: 'bg-[#F0FDF4] text-slate-900',
        subtextClass: 'text-emerald-800/80',
        cardClass: 'bg-white/95 border-emerald-100 shadow-xl text-slate-900',
    },
    {
        id: 'sunset',
        category: 'light',
        name: 'Sunset Rose',
        badge: 'Clean Light',
        desc: 'Vibrant coral & warm amber for lifestyle, fashion & beauty brands',
        primary: '#E11D48',
        secondary: '#F59E0B',
        bgHex: '#FFF1F2',
        previewGradient: 'from-rose-500 via-pink-600 to-amber-500',
        swatchBg: '#FFF1F2',
        bgClass: 'bg-[#FFF1F2] text-slate-900',
        subtextClass: 'text-rose-900/70',
        cardClass: 'bg-white/95 border-rose-100 shadow-xl text-slate-900',
    },
    {
        id: 'champagne',
        category: 'light',
        name: 'Champagne Alabaster',
        badge: 'Clean Light',
        desc: 'Warm ivory & rich bronze gold for boutique luxury & jewelry stores',
        primary: '#B45309',
        secondary: '#F59E0B',
        bgHex: '#FAF8F5',
        previewGradient: 'from-amber-700 via-yellow-600 to-stone-800',
        swatchBg: '#FAF8F5',
        bgClass: 'bg-[#FAF8F5] text-stone-900',
        subtextClass: 'text-stone-600',
        cardClass: 'bg-white/95 border-amber-200/60 shadow-xl text-stone-900',
    },

    // 🌙 LUXURY DARK PRESETS (VIP, Nightlife, Gaming & Fintech)
    {
        id: 'luxury',
        category: 'dark',
        name: 'Obsidian 24K Gold',
        badge: 'Luxury Dark',
        desc: 'Velvet black titanium with radiant metallic gold & champagne glows',
        primary: '#F59E0B',
        secondary: '#FCD34D',
        bgHex: '#090A0F',
        previewGradient: 'from-amber-400 via-amber-600 to-slate-950',
        swatchBg: '#090A0F',
        bgClass: 'bg-[#090A0F] text-white',
        subtextClass: 'text-amber-100/70',
        cardClass: 'bg-white/[0.07] border-white/15 backdrop-blur-xl shadow-2xl text-white',
    },
    {
        id: 'midnight',
        category: 'dark',
        name: 'Midnight Executive',
        badge: 'Luxury Dark',
        desc: 'Deep navy glass with electric indigo & frost cyan highlights',
        primary: '#6366F1',
        secondary: '#38BDF8',
        bgHex: '#0B0F19',
        previewGradient: 'from-indigo-500 via-blue-600 to-slate-950',
        swatchBg: '#0B0F19',
        bgClass: 'bg-[#0B0F19] text-white',
        subtextClass: 'text-slate-300',
        cardClass: 'bg-white/[0.07] border-white/15 backdrop-blur-xl shadow-2xl text-white',
    },
    {
        id: 'cyberpunk',
        category: 'dark',
        name: 'Cyberpunk Neon',
        badge: 'Luxury Dark',
        desc: 'Futuristic neon fuchsia & electric cyan for gaming & nightlife',
        primary: '#D946EF',
        secondary: '#06B6D4',
        bgHex: '#0D051D',
        previewGradient: 'from-fuchsia-600 via-purple-700 to-slate-950',
        swatchBg: '#0D051D',
        bgClass: 'bg-[#0D051D] text-white',
        subtextClass: 'text-purple-200/70',
        cardClass: 'bg-white/[0.08] border-purple-500/30 backdrop-blur-xl shadow-2xl text-white',
    },
    {
        id: 'stealth',
        category: 'dark',
        name: 'Stealth Onyx',
        badge: 'Luxury Dark',
        desc: 'Ultra-minimalist pure carbon black with crisp diamond white & silver',
        primary: '#FFFFFF',
        secondary: '#94A3B8',
        bgHex: '#000000',
        previewGradient: 'from-slate-200 via-slate-500 to-black',
        swatchBg: '#000000',
        bgClass: 'bg-black text-white',
        subtextClass: 'text-slate-400',
        cardClass: 'bg-white/[0.06] border-white/15 backdrop-blur-xl shadow-2xl text-white',
    }
];

const isColorLight = (hexColor) => {
    if (!hexColor || typeof hexColor !== 'string') return false;
    const hex = hexColor.replace('#', '');
    if (hex.length !== 6 && hex.length !== 3) return false;
    const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
    const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6;
};

const FONTS = [
    { id: 'sans', name: 'Plus Jakarta (Clean)', class: 'font-brand-sans' },
    { id: 'serif', name: 'Playfair (Luxury)', class: 'font-brand-serif' },
    { id: 'display', name: 'Space Grotesk (Tech)', class: 'font-brand-display' },
    { id: 'outfit', name: 'Outfit (Modern)', class: 'font-brand-outfit' },
];

const COLOR_SWATCHES = [
    '#4F46E5', '#7C3AED', '#EC4899', '#EF4444', 
    '#F59E0B', '#10B981', '#06B6D4', '#0F172A'
];

const CampaignDesignModal = ({ campaign, onClose, onUpdated }) => {
    const existingDesign = campaign.design_settings || {};
    
    // Core Settings
    const [themeStyle, setThemeStyle] = useState(existingDesign.theme_style || 'modern');
    const [primaryColor, setPrimaryColor] = useState(existingDesign.primary_color || '#4F46E5');
    const [secondaryColor, setSecondaryColor] = useState(existingDesign.secondary_color || '#F59E0B');
    const [bgStyle, setBgStyle] = useState(existingDesign.bg_style || 'theme_default');
    const [bgSolidColor, setBgSolidColor] = useState(existingDesign.bg_solid_color || '#0f172a');
    const [bgImageUrl, setBgImageUrl] = useState(existingDesign.bg_image_url || '');
    const [fontFamily, setFontFamily] = useState(existingDesign.font_family || 'sans');
    const [logoUrl, setLogoUrl] = useState(existingDesign.logo_url || campaign.vendor_logo || '');
    const [logoSize, setLogoSize] = useState(existingDesign.logo_size || 'md');
    const [badgeText, setBadgeText] = useState(existingDesign.badge_text || '');
    const [cardStyle, setCardStyle] = useState(existingDesign.card_style || 'glass');
    
    // Messaging & CTA
    const [headline, setHeadline] = useState(existingDesign.headline || '');
    const [subheadline, setSubheadline] = useState(existingDesign.subheadline || '');
    const [storeUrl, setStoreUrl] = useState(existingDesign.store_url || '');
    const [ctaText, setCtaText] = useState(existingDesign.cta_text || 'Redeem & Shop Now');
    
    // Unlock Screen Settings & Copy
    const [showSocialPage, setShowSocialPage] = useState(campaign.show_social_page || false);
    const [unlockBadge, setUnlockBadge] = useState(existingDesign.unlock_badge || 'VIP Campaign Unlock');
    const [unlockHeadline, setUnlockHeadline] = useState(existingDesign.unlock_headline || '');
    const [unlockSubheadline, setUnlockSubheadline] = useState(existingDesign.unlock_subheadline || '');
    const [guidelinesTitle, setGuidelinesTitle] = useState(existingDesign.guidelines_title || 'Campaign Guidelines');
    const [guidelinesText, setGuidelinesText] = useState(campaign.guidelines || '');
    const [instagramLink, setInstagramLink] = useState(campaign.instagram_link || '');
    const [facebookLink, setFacebookLink] = useState(campaign.facebook_link || '');
    const [unlockBtnText, setUnlockBtnText] = useState(existingDesign.unlock_btn_text || 'Start Game Now');

    // Modal UI states
    const [activeTab, setActiveTab] = useState('colors'); // 'colors' | 'typography' | 'copy' | 'unlock' | 'preview'
    const [presetFilter, setPresetFilter] = useState('all'); // 'all' | 'light' | 'dark'
    const [previewDevice, setPreviewDevice] = useState('mobile'); // 'mobile' | 'desktop'
    const [previewScreen, setPreviewScreen] = useState('game'); // 'game' | 'unlock'
    const [saving, setSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [error, setError] = useState(null);

    const publicUrl = `/campaign/${campaign.unique_code}`;

    const currentTheme = THEMES.find(t => t.id === themeStyle) || THEMES[0];
    const isLightMode = 
        bgStyle === 'mesh_light' ||
        (bgStyle === 'theme_default' && currentTheme.category === 'light') ||
        (bgStyle === 'custom_solid' && isColorLight(bgSolidColor));

    const handleApplyTheme = (theme) => {
        setThemeStyle(theme.id);
        setPrimaryColor(theme.primary);
        setSecondaryColor(theme.secondary);
        setBgStyle('theme_default');
        setBgSolidColor(theme.bgHex);
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        setError(null);
        setSavedSuccess(false);

        const updatedDesign = {
            theme_style: themeStyle,
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            bg_style: bgStyle,
            bg_solid_color: bgSolidColor,
            bg_image_url: bgImageUrl.trim(),
            font_family: fontFamily,
            logo_url: logoUrl.trim(),
            logo_size: logoSize,
            badge_text: badgeText.trim(),
            card_style: cardStyle,
            headline: headline.trim(),
            subheadline: subheadline.trim(),
            store_url: storeUrl.trim(),
            cta_text: ctaText.trim() || 'Redeem & Shop Now',
            unlock_badge: unlockBadge.trim(),
            unlock_headline: unlockHeadline.trim(),
            unlock_subheadline: unlockSubheadline.trim(),
            guidelines_title: guidelinesTitle.trim(),
            unlock_btn_text: unlockBtnText.trim()
        };

        try {
            const payload = {
                ...campaign,
                start_date: new Date(campaign.start_date).toISOString(),
                end_date: new Date(campaign.end_date).toISOString(),
                show_social_page: showSocialPage,
                instagram_link: instagramLink.trim(),
                facebook_link: facebookLink.trim(),
                guidelines: guidelinesText.trim(),
                design_settings: updatedDesign
            };

            const response = await fetchWithAuth(`${BASE_URL}/campaigns/${campaign.id}/`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || errData.message || 'Failed to update campaign design');
            }

            const updatedCampaign = await response.json();
            setSavedSuccess(true);
            if (onUpdated) onUpdated(updatedCampaign);
            setTimeout(() => {
                setSavedSuccess(false);
            }, 3500);
        } catch (err) {
            console.error('Error saving campaign design:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Helper for Live Preview background styling with opaque solid bases
    const getPreviewBgStyle = () => {
        if (bgStyle === 'custom_solid') {
            return { backgroundColor: bgSolidColor };
        }
        if (bgStyle === 'custom_image' && bgImageUrl) {
            return {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url(${bgImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#ffffff',
                backgroundColor: '#0F172A'
            };
        }
        if (bgStyle === 'mesh_dark') {
            return { backgroundColor: '#07090E' };
        }
        if (bgStyle === 'mesh_light') {
            return { backgroundColor: '#FFFFFF' };
        }
        // theme_default: guarantees solid base to eliminate any murky slate bleeding
        return {
            backgroundColor: currentTheme.bgHex
        };
    };

    const getPreviewBgClass = () => {
        if (bgStyle === 'mesh_dark') return 'bg-mesh-aurora text-white';
        if (bgStyle === 'mesh_light') return 'bg-mesh-light text-slate-900';
        if (bgStyle === 'custom_solid') return isLightMode ? 'text-slate-900' : 'text-white';
        if (bgStyle === 'custom_image') return 'text-white';
        return currentTheme.bgClass;
    };

    const getCardClasses = () => {
        if (cardStyle === 'solid') {
            return isLightMode
                ? 'bg-white text-slate-900 shadow-xl border border-slate-200'
                : 'bg-slate-900/90 text-white shadow-2xl border border-slate-800';
        }
        if (cardStyle === 'outline') {
            return isLightMode
                ? 'border-2 border-slate-300 bg-white/50 text-slate-900'
                : 'border-2 border-white/25 bg-black/20 text-white';
        }
        // 'glass' (default)
        return isLightMode
            ? 'bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-200/40 text-slate-900'
            : 'bg-white/[0.08] backdrop-blur-xl border border-white/15 shadow-2xl text-white';
    };

    const getFontClass = () => {
        const found = FONTS.find(f => f.id === fontFamily);
        return found ? found.class : 'font-brand-sans';
    };

    return (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden border border-gray-100">
                
                {/* Modal Header */}
                <div className="px-5 sm:px-7 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-amber-400 p-0.5 flex items-center justify-center shadow-lg">
                            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-300">
                                <Palette size={20} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                                    Brand & Design Studio
                                </h2>
                                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                                    Live Customizer
                                </span>
                            </div>
                            <p className="text-xs text-gray-300">
                                Styling for <span className="font-bold text-white">"{campaign.name}"</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 transition-all border border-white/10"
                        >
                            <Eye size={13} />
                            <span>View Game Page</span>
                            <ExternalLink size={12} />
                        </a>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                            aria-label="Close modal"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Sub-Header Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50/80 px-5 sm:px-7 gap-1 sm:gap-2 overflow-x-auto text-xs font-bold">
                    <button
                        onClick={() => setActiveTab('colors')}
                        className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                            activeTab === 'colors'
                                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs rounded-t-lg'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <Palette size={15} />
                        <span>1. Colors & Themes</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('typography')}
                        className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                            activeTab === 'typography'
                                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs rounded-t-lg'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <Type size={15} />
                        <span>2. Logo & Typography</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('copy')}
                        className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                            activeTab === 'copy'
                                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs rounded-t-lg'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <Store size={15} />
                        <span>3. Messaging & Store Link</span>
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('unlock');
                            setPreviewScreen('unlock');
                        }}
                        className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                            activeTab === 'unlock'
                                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs rounded-t-lg'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <LockOpen size={15} />
                        <span>4. Unlock Screen</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`md:hidden py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                            activeTab === 'preview'
                                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs rounded-t-lg'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <Smartphone size={15} />
                        <span>Live Preview</span>
                    </button>
                </div>

                {/* Main Split-Screen Workspace */}
                <div className="flex-1 flex overflow-hidden">
                    
                    {/* Left Panel: Configuration Controls */}
                    <div className={`w-full md:w-1/2 p-5 sm:p-7 overflow-y-auto space-y-6 ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`}>
                        
                        {error && (
                            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                                ⚠️ {error}
                            </div>
                        )}

                        {savedSuccess && (
                            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black rounded-2xl flex items-center gap-2 shadow-xs">
                                <Check size={16} /> Changes successfully saved and published live!
                            </div>
                        )}

                        {/* TAB 1: COLORS & THEMES */}
                        {activeTab === 'colors' && (
                            <div className="space-y-6">
                                {/* Presets */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                                            <Sparkles size={14} className="text-indigo-600" />
                                            Standard Brand Themes
                                        </label>
                                        <span className="text-[11px] font-semibold text-indigo-600">8 Curated Styles</span>
                                    </div>

                                    {/* Filter Tabs: All, Clean Light, Luxury Dark */}
                                    <div className="flex items-center gap-1.5 mb-3 bg-gray-100 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setPresetFilter('all')}
                                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                                                presetFilter === 'all'
                                                    ? 'bg-white text-gray-900 shadow-xs'
                                                    : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                        >
                                            All Themes ({THEMES.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPresetFilter('light')}
                                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                                presetFilter === 'light'
                                                    ? 'bg-white text-blue-700 shadow-xs'
                                                    : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                        >
                                            <Sun size={13} className="text-amber-500" />
                                            <span>Clean Light (4)</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPresetFilter('dark')}
                                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                                presetFilter === 'dark'
                                                    ? 'bg-white text-indigo-900 shadow-xs'
                                                    : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                        >
                                            <Moon size={13} className="text-indigo-500" />
                                            <span>Luxury Dark (4)</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2.5">
                                        {THEMES.filter(t => presetFilter === 'all' || t.category === presetFilter).map((theme) => {
                                            const isSelected = themeStyle === theme.id && bgStyle === 'theme_default';
                                            return (
                                                <button
                                                    key={theme.id}
                                                    type="button"
                                                    onClick={() => handleApplyTheme(theme)}
                                                    className={`p-3 rounded-2xl border text-left transition-all relative group ${
                                                        isSelected
                                                            ? 'border-indigo-600 ring-2 ring-indigo-500/25 bg-indigo-50/40 shadow-md'
                                                            : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-xs'
                                                    }`}
                                                >
                                                    {/* Header Bar with Gradient & Swatches */}
                                                    <div className={`h-9 rounded-xl bg-gradient-to-r ${theme.previewGradient} mb-2.5 p-1.5 flex items-center justify-between shadow-xs`}>
                                                        <div className="flex items-center gap-1">
                                                            <span 
                                                                style={{ backgroundColor: theme.primary }} 
                                                                className="w-3.5 h-3.5 rounded-full border border-white/80 shadow-xs" 
                                                                title={`Primary: ${theme.primary}`}
                                                            />
                                                            <span 
                                                                style={{ backgroundColor: theme.secondary }} 
                                                                className="w-3.5 h-3.5 rounded-full border border-white/80 shadow-xs" 
                                                                title={`Accent: ${theme.secondary}`}
                                                            />
                                                            <span 
                                                                style={{ backgroundColor: theme.bgHex }} 
                                                                className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs" 
                                                                title={`Base: ${theme.bgHex}`}
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-black/40 text-white backdrop-blur-xs">
                                                                {theme.category === 'light' ? '☀️ Light' : '🌙 Dark'}
                                                            </span>
                                                            {isSelected && (
                                                                <span className="w-4 h-4 rounded-full bg-white text-indigo-700 flex items-center justify-center text-[10px] font-black shadow-xs">
                                                                    ✓
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <p className="text-xs font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                                        {theme.name}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-tight">
                                                        {theme.desc}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Color Pickers */}
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">
                                            Custom Brand Palette
                                        </h3>
                                        <span className="text-[11px] text-indigo-600 font-semibold">Live Color Sync</span>
                                    </div>

                                    {/* Primary Brand Color */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                                            <span>Primary Brand Color (Buttons & Highlights)</span>
                                            <span className="font-mono text-[11px] text-gray-500">{primaryColor}</span>
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="w-10 h-10 rounded-xl cursor-pointer border border-gray-300 p-0.5 bg-white shadow-xs"
                                            />
                                            <input
                                                type="text"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="flex-1 px-3 py-2 text-xs font-mono border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden uppercase"
                                                placeholder="#4F46E5"
                                            />
                                        </div>
                                        {/* Quick Swatches */}
                                        <div className="flex gap-1.5 mt-2">
                                            {COLOR_SWATCHES.map((hex) => (
                                                <button
                                                    key={hex}
                                                    type="button"
                                                    onClick={() => setPrimaryColor(hex)}
                                                    style={{ backgroundColor: hex }}
                                                    className={`w-6 h-6 rounded-lg border border-white shadow-xs transition-transform hover:scale-110 ${
                                                        primaryColor.toUpperCase() === hex ? 'ring-2 ring-indigo-600 scale-105' : ''
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Secondary Accent Color */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                                            <span>Accent Color (Stars, Badges, Glows)</span>
                                            <span className="font-mono text-[11px] text-gray-500">{secondaryColor}</span>
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={secondaryColor}
                                                onChange={(e) => setSecondaryColor(e.target.value)}
                                                className="w-10 h-10 rounded-xl cursor-pointer border border-gray-300 p-0.5 bg-white shadow-xs"
                                            />
                                            <input
                                                type="text"
                                                value={secondaryColor}
                                                onChange={(e) => setSecondaryColor(e.target.value)}
                                                className="flex-1 px-3 py-2 text-xs font-mono border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden uppercase"
                                                placeholder="#F59E0B"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Background Style */}
                                <div>
                                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-2">
                                        Background Experience
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'theme_default', name: 'Preset Gradient', icon: '🎨' },
                                            { id: 'mesh_dark', name: 'Deep Aurora Mesh (Dark)', icon: '🌌' },
                                            { id: 'mesh_light', name: 'Subtle Glass Mesh (Light)', icon: '✨' },
                                            { id: 'custom_solid', name: 'Solid Custom Color', icon: '⬛' },
                                            { id: 'custom_image', name: 'Custom Wallpaper Image', icon: '🖼️' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setBgStyle(opt.id)}
                                                className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition-all ${
                                                    bgStyle === opt.id
                                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                                                }`}
                                            >
                                                <span>{opt.icon}</span>
                                                <span className="truncate">{opt.name}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Conditional background inputs */}
                                    {bgStyle === 'custom_solid' && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={bgSolidColor}
                                                onChange={(e) => setBgSolidColor(e.target.value)}
                                                className="w-9 h-9 rounded-xl border p-0.5 bg-white shadow-xs cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={bgSolidColor}
                                                onChange={(e) => setBgSolidColor(e.target.value)}
                                                className="flex-1 px-3 py-2 text-xs font-mono border rounded-xl"
                                                placeholder="#0F172A"
                                            />
                                        </div>
                                    )}

                                    {bgStyle === 'custom_image' && (
                                        <div className="mt-3">
                                            <input
                                                type="url"
                                                value={bgImageUrl}
                                                onChange={(e) => setBgImageUrl(e.target.value)}
                                                className="w-full px-3 py-2 text-xs border rounded-xl"
                                                placeholder="https://example.com/store-hero-wallpaper.jpg"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                Tip: Paste an image URL from Unsplash or your CDN. Dark overlay is automatically applied for contrast.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 2: LOGO & TYPOGRAPHY */}
                        {activeTab === 'typography' && (
                            <div className="space-y-6">
                                {/* Brand Logo Input */}
                                <div>
                                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <ImageIcon size={14} className="text-indigo-600" />
                                        Brand Logo
                                    </label>
                                    <div className="space-y-3">
                                        <input
                                            type="url"
                                            value={logoUrl}
                                            onChange={(e) => setLogoUrl(e.target.value)}
                                            placeholder="https://yourstore.com/logo.png"
                                            className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                                        />
                                        
                                        {/* Logo Size Selection */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-600">Logo Size:</span>
                                            {['sm', 'md', 'lg'].map((sz) => (
                                                <button
                                                    key={sz}
                                                    type="button"
                                                    onClick={() => setLogoSize(sz)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                                                        logoSize === sz
                                                            ? 'bg-indigo-600 text-white shadow-xs'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {sz === 'sm' ? 'Small' : sz === 'md' ? 'Medium' : 'Large'}
                                                </button>
                                            ))}
                                        </div>

                                        {logoUrl && (
                                            <div className="p-3 bg-gray-50 border rounded-xl flex items-center gap-3">
                                                <div className="w-16 h-12 bg-white rounded-lg border flex items-center justify-center p-1 overflow-hidden shadow-xs">
                                                    <img src={logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                                                </div>
                                                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                                    <Check size={14} /> Logo connected
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Typography / Fonts */}
                                <div>
                                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Type size={14} className="text-indigo-600" />
                                        Brand Font Family
                                    </label>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        {FONTS.map((font) => (
                                            <button
                                                key={font.id}
                                                type="button"
                                                onClick={() => setFontFamily(font.id)}
                                                className={`p-3 rounded-2xl border text-left transition-all ${
                                                    fontFamily === font.id
                                                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                            >
                                                <p className={`text-sm font-bold text-gray-900 ${font.class}`}>
                                                    {font.name}
                                                </p>
                                                <p className="text-[11px] text-gray-500 mt-1">
                                                    The quick brown fox jumps
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tagline / Header Badge */}
                                <div>
                                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <ShieldCheck size={14} className="text-indigo-600" />
                                        Hero Tagline / Badge
                                    </label>
                                    <input
                                        type="text"
                                        value={badgeText}
                                        onChange={(e) => setBadgeText(e.target.value)}
                                        placeholder="e.g. OFFICIAL VIP STORE PROMOTION"
                                        className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden uppercase tracking-wider"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Displays inside a glowing pill badge above the game title.
                                    </p>
                                </div>

                                {/* Card Stage Styling */}
                                <div>
                                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Layout size={14} className="text-indigo-600" />
                                        Game Stage Container Styling
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'glass', label: 'Frosted Glass', icon: '✨' },
                                            { id: 'solid', label: 'Solid Card', icon: '📄' },
                                            { id: 'outline', label: 'Minimalist', icon: '◻️' },
                                        ].map((card) => (
                                            <button
                                                key={card.id}
                                                type="button"
                                                onClick={() => setCardStyle(card.id)}
                                                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                                                    cardStyle === card.id
                                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                }`}
                                            >
                                                <span className="block text-sm mb-0.5">{card.icon}</span>
                                                <span>{card.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: MESSAGING & STORE LINK */}
                        {activeTab === 'copy' && (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <Type size={14} className="text-indigo-600" />
                                        Custom Headline (Hero Title)
                                    </label>
                                    <input
                                        type="text"
                                        value={headline}
                                        onChange={(e) => setHeadline(e.target.value)}
                                        placeholder={campaign.name || 'e.g. Spin & Win Exclusive Discounts!'}
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <AlignLeft size={14} className="text-indigo-600" />
                                        Promotional Subtitle / Hook
                                    </label>
                                    <textarea
                                        value={subheadline}
                                        onChange={(e) => setSubheadline(e.target.value)}
                                        placeholder="e.g. Try your luck today! Unlock instant coupons, free shipping, and gift cards."
                                        rows={3}
                                        className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                                    />
                                </div>

                                <div className="pt-2 border-t border-gray-100">
                                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <Store size={14} className="text-indigo-600" />
                                        Storefront / Checkout URL ("Redeem & Shop Now")
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-xs">
                                            <Globe size={14} />
                                        </span>
                                        <input
                                            type="url"
                                            value={storeUrl}
                                            onChange={(e) => setStoreUrl(e.target.value)}
                                            placeholder="https://yourstore.com/checkout"
                                            className="w-full pl-8 pr-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Winners are automatically sent to this URL with 1-click redemption.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5">
                                        Post-Win Redeem Button Label
                                    </label>
                                    <input
                                        type="text"
                                        value={ctaText}
                                        onChange={(e) => setCtaText(e.target.value)}
                                        placeholder="Redeem & Shop Now"
                                        className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'unlock' && (
                            <div className="space-y-5">
                                {/* Toggle Pre-game unlock screen */}
                                <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-black text-indigo-950 flex items-center gap-2">
                                                <Lock size={16} className="text-indigo-600" />
                                                Enable Pre-Game Social Unlock Screen
                                            </h3>
                                            <p className="text-xs text-indigo-900/80 mt-0.5 leading-relaxed">
                                                Visitors must view rules and follow your Instagram or Facebook before playing.
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={showSocialPage} 
                                                onChange={(e) => setShowSocialPage(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <Sparkles size={14} className="text-indigo-600" />
                                        Unlock Screen Badge Pill
                                    </label>
                                    <input
                                        type="text"
                                        value={unlockBadge}
                                        onChange={(e) => setUnlockBadge(e.target.value)}
                                        placeholder="e.g. VIP Campaign Unlock"
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <Type size={14} className="text-indigo-600" />
                                        Unlock Screen Headline
                                    </label>
                                    <input
                                        type="text"
                                        value={unlockHeadline}
                                        onChange={(e) => setUnlockHeadline(e.target.value)}
                                        placeholder={headline || campaign.name || 'e.g. Follow & Play to Win'}
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <AlignLeft size={14} className="text-indigo-600" />
                                        Unlock Subtitle / Hook
                                    </label>
                                    <textarea
                                        value={unlockSubheadline}
                                        onChange={(e) => setUnlockSubheadline(e.target.value)}
                                        placeholder="Complete these quick steps to unlock your chance to win instant rewards!"
                                        rows={2}
                                        className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                                    />
                                </div>

                                <div className="pt-2 border-t border-gray-100">
                                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <ScrollText size={14} className="text-indigo-600" />
                                        Guidelines Box Title
                                    </label>
                                    <input
                                        type="text"
                                        value={guidelinesTitle}
                                        onChange={(e) => setGuidelinesTitle(e.target.value)}
                                        placeholder="Campaign Guidelines"
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <AlignLeft size={14} className="text-indigo-600" />
                                            Campaign Guidelines / Rules (1 per line)
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-normal">Each line creates a numbered step</span>
                                    </label>
                                    <textarea
                                        value={guidelinesText}
                                        onChange={(e) => setGuidelinesText(e.target.value)}
                                        placeholder={"Follow our official page to unlock play\nComplete the game challenge to win exclusive prizes\nPresent voucher to redeem in-store"}
                                        rows={4}
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-mono text-xs"
                                    />
                                </div>

                                <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                            <Instagram size={14} className="text-pink-600" />
                                            Instagram Follow URL
                                        </label>
                                        <input
                                            type="url"
                                            value={instagramLink}
                                            onChange={(e) => setInstagramLink(e.target.value)}
                                            placeholder="https://instagram.com/yourbrand"
                                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                            <Facebook size={14} className="text-blue-600" />
                                            Facebook Follow URL
                                        </label>
                                        <input
                                            type="url"
                                            value={facebookLink}
                                            onChange={(e) => setFacebookLink(e.target.value)}
                                            placeholder="https://facebook.com/yourbrand"
                                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <Sparkles size={14} className="text-indigo-600" />
                                        Unlocked Play Button Label
                                    </label>
                                    <input
                                        type="text"
                                        value={unlockBtnText}
                                        onChange={(e) => setUnlockBtnText(e.target.value)}
                                        placeholder="🎮 Start Game Now"
                                        className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                                    />
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Panel: Live Split-Screen Interactive Preview */}
                    <div className={`w-full md:w-1/2 bg-slate-900 border-l border-gray-800 flex flex-col ${activeTab !== 'preview' ? 'hidden md:flex' : 'flex'}`}>
                        
                        {/* Device Frame Switcher */}
                        <div className="px-3 py-2 bg-slate-950 border-b border-gray-800 flex items-center justify-between gap-2">
                            {/* Screen View Switcher: Game View vs Unlock Screen */}
                            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setPreviewScreen('game')}
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                                        previewScreen === 'game'
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    🎮 Game View
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewScreen('unlock')}
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                                        previewScreen === 'unlock'
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <Lock size={11} /> Unlock Screen
                                </button>
                            </div>

                            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setPreviewDevice('mobile')}
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                                        previewDevice === 'mobile'
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <Smartphone size={12} /> Mobile
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewDevice('desktop')}
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                                        previewDevice === 'desktop'
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <Monitor size={12} /> Desktop
                                </button>
                            </div>
                        </div>

                        {/* Simulated Device Canvas Screen */}
                        <div className="flex-1 p-4 flex items-center justify-center overflow-hidden bg-slate-950/70">
                            
                            <div
                                style={getPreviewBgStyle()}
                                className={`transition-all duration-300 overflow-y-auto ${getPreviewBgClass()} ${getFontClass()} ${
                                    previewDevice === 'mobile'
                                        ? 'w-[320px] h-[520px] rounded-[36px] border-[6px] border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.8)] p-4 flex flex-col justify-between'
                                        : 'w-full h-full rounded-2xl border border-gray-800 p-6 flex flex-col justify-between shadow-2xl'
                                }`}
                            >
                                {previewScreen === 'unlock' ? (
                                    <div className="w-full flex flex-col justify-between flex-1 py-1">
                                        {/* Simulated Header */}
                                        <div className="text-center pt-1">
                                            {logoUrl ? (
                                                <div className="mb-1.5 flex justify-center">
                                                    <img
                                                        src={logoUrl}
                                                        alt="Brand Logo"
                                                        className={`object-contain rounded-lg drop-shadow-md ${
                                                            logoSize === 'sm' ? 'h-6' : logoSize === 'lg' ? 'h-10' : 'h-8'
                                                        }`}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="mb-1.5 flex justify-center">
                                                    <div
                                                        style={{ backgroundColor: primaryColor }}
                                                        className="w-7 h-7 rounded-xl text-white font-black flex items-center justify-center text-xs shadow-md"
                                                    >
                                                        {campaign.vendor_name ? campaign.vendor_name.charAt(0).toUpperCase() : '🎁'}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-center mb-1">
                                                <span
                                                    style={{ 
                                                        borderColor: isLightMode ? primaryColor + '40' : primaryColor + '60', 
                                                        color: primaryColor,
                                                        backgroundColor: isLightMode ? primaryColor + '10' : primaryColor + '20'
                                                    }}
                                                    className="inline-block text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full backdrop-blur-md border shadow-xs"
                                                >
                                                    {unlockBadge || 'VIP Campaign Unlock'}
                                                </span>
                                            </div>

                                            <h2 className={`text-base font-black tracking-tight leading-snug ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                                                {unlockHeadline || headline || campaign.name}
                                            </h2>

                                            <p className={`text-[10px] max-w-xs mx-auto mt-0.5 line-clamp-2 ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                                                {unlockSubheadline || 'Complete these quick steps to unlock your chance to win instant rewards!'}
                                            </p>
                                        </div>

                                        {/* Simulated Step Indicator */}
                                        <div className={`my-2 p-2 rounded-xl border backdrop-blur-xs flex items-center justify-between text-[9px] font-bold ${
                                            isLightMode ? 'bg-white/80 border-slate-200 text-slate-700' : 'bg-white/[0.06] border-white/10 text-slate-300'
                                        }`}>
                                            <span className="text-emerald-500 font-black">1. Follow Social</span>
                                            <span>→</span>
                                            <span>2. Unlock Play</span>
                                            <span>→</span>
                                            <span>3. Win Prize</span>
                                        </div>

                                        {/* Guidelines Card */}
                                        <div className={`my-1 p-2.5 rounded-2xl border backdrop-blur-md text-left text-[11px] ${
                                            isLightMode ? 'bg-white/90 border-slate-200 text-slate-800' : 'bg-white/[0.08] border-white/15 text-slate-200'
                                        }`}>
                                            <div className="font-bold text-[10px] mb-1.5 flex items-center gap-1 border-b border-gray-500/20 pb-1">
                                                <ScrollText size={12} style={{ color: primaryColor }} />
                                                <span>{guidelinesTitle || 'Campaign Guidelines'}</span>
                                            </div>
                                            <ol className="space-y-1">
                                                {(guidelinesText || 'Follow our official page to unlock play\nComplete the game challenge to win exclusive rewards\nPresent winning voucher in-store to redeem')
                                                    .split('\n')
                                                    .map(l => l.trim())
                                                    .filter(Boolean)
                                                    .slice(0, 3)
                                                    .map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-1.5 text-[9px]">
                                                            <span 
                                                                style={{ backgroundColor: primaryColor + '25', color: primaryColor }}
                                                                className="flex-shrink-0 w-3.5 h-3.5 rounded-full font-bold flex items-center justify-center text-[8px] mt-0.5"
                                                            >
                                                                {idx + 1}
                                                            </span>
                                                            <span className="line-clamp-2">{item}</span>
                                                        </li>
                                                    ))}
                                            </ol>
                                        </div>

                                        {/* Social Follow Buttons & CTA */}
                                        <div className="space-y-1.5 pt-1">
                                            {instagramLink && (
                                                <div className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white flex items-center justify-between text-[9px] font-bold shadow-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <Instagram size={12} />
                                                        <span>Follow on Instagram</span>
                                                    </div>
                                                    <ArrowRight size={11} />
                                                </div>
                                            )}
                                            {facebookLink && (
                                                <div className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-[#1877F2] to-[#0D65D9] text-white flex items-center justify-between text-[9px] font-bold shadow-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <Facebook size={12} />
                                                        <span>Follow on Facebook</span>
                                                    </div>
                                                    <ArrowRight size={11} />
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1.5 shadow-md"
                                            >
                                                <Sparkles size={12} />
                                                <span>{unlockBtnText || 'Start Game Now'}</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Simulated Header */}
                                        <div className="text-center pt-2">
                                            {/* Brand Logo */}
                                            {logoUrl ? (
                                                <div className="mb-2 flex justify-center">
                                                    <img
                                                        src={logoUrl}
                                                        alt="Brand Logo"
                                                        className={`object-contain rounded-lg drop-shadow-md ${
                                                            logoSize === 'sm' ? 'h-7' : logoSize === 'lg' ? 'h-12' : 'h-9'
                                                        }`}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="mb-2 flex justify-center">
                                                    <div
                                                        style={{ backgroundColor: primaryColor }}
                                                        className="w-8 h-8 rounded-xl text-white font-black flex items-center justify-center text-xs shadow-md"
                                                    >
                                                        {campaign.vendor_name ? campaign.vendor_name.charAt(0).toUpperCase() : '🎁'}
                                                    </div>
                                                </div>
                                            )}

                                    {/* Tagline / Badge */}
                                    <div className="flex justify-center mb-1.5">
                                        <span
                                            style={{ 
                                                borderColor: isLightMode ? primaryColor + '40' : primaryColor + '60', 
                                                color: primaryColor,
                                                backgroundColor: isLightMode ? primaryColor + '10' : primaryColor + '20'
                                            }}
                                            className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full backdrop-blur-md border shadow-xs"
                                        >
                                            {badgeText || `${campaign.vendor_name || 'VIP Store'} Presents`}
                                        </span>
                                    </div>

                                    {/* Headline */}
                                    <h1 className={`text-lg font-black tracking-tight leading-snug drop-shadow-xs ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                                        {headline || campaign.name}
                                    </h1>

                                    {/* Subheadline */}
                                    <p className={`text-[11px] max-w-xs mx-auto mt-1 line-clamp-2 ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                                        {subheadline || 'Play the lucky mini-game for instant discounts & rewards!'}
                                    </p>
                                </div>

                                {/* Realistic Interactive Mini-Game Stage Container */}
                                <div className="my-auto py-2 flex flex-col items-center">
                                    <div className={`w-full max-w-[260px] p-3.5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all ${getCardClasses()}`}>
                                        
                                        {/* Ambient Glow */}
                                        <div
                                            style={{ backgroundColor: primaryColor }}
                                            className="absolute -top-10 -left-10 w-24 h-24 rounded-full blur-2xl opacity-30 pointer-events-none"
                                        />
                                        <div
                                            style={{ backgroundColor: secondaryColor }}
                                            className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-30 pointer-events-none"
                                        />

                                        {/* 1. SLOT MACHINE */}
                                        {campaign.campaign_type === 'slot' && (
                                            <div className="w-full relative z-10">
                                                <div className="bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 py-1 px-2 rounded-lg text-center mb-2 shadow-xs border border-yellow-200">
                                                    <span className="text-slate-950 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1">
                                                        ★ JACKPOT 777 REELS ★
                                                    </span>
                                                </div>
                                                <div className="relative bg-black/95 p-2 rounded-xl border border-amber-500/60 flex items-center justify-center gap-1.5 shadow-inner">
                                                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-red-500/80 z-10 pointer-events-none flex items-center justify-between px-0.5">
                                                        <span className="text-[7px] text-red-300 font-bold">▶</span>
                                                        <span className="text-[7px] text-red-300 font-bold">◀</span>
                                                    </div>
                                                    <div className="flex-1 h-16 bg-gradient-to-b from-slate-100 via-white to-slate-200 rounded-lg flex items-center justify-center text-2xl shadow-sm border border-slate-300">
                                                        💎
                                                    </div>
                                                    <div className="flex-1 h-16 bg-gradient-to-b from-slate-100 via-white to-slate-200 rounded-lg flex items-center justify-center text-2xl shadow-sm border border-slate-300 ring-2 ring-amber-400">
                                                        7️⃣
                                                    </div>
                                                    <div className="flex-1 h-16 bg-gradient-to-b from-slate-100 via-white to-slate-200 rounded-lg flex items-center justify-center text-2xl shadow-sm border border-slate-300">
                                                        💎
                                                    </div>
                                                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                                                        <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-red-600 to-rose-400 shadow-md border border-red-200"></div>
                                                        <div className="w-1 h-4 bg-slate-300 rounded-full"></div>
                                                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                                                    </div>
                                                </div>
                                                <button
                                                    style={{ backgroundColor: primaryColor }}
                                                    className="w-full mt-2.5 py-1.5 rounded-xl text-white font-black text-[11px] uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all"
                                                >
                                                    PULL LEVER ⚡
                                                </button>
                                            </div>
                                        )}

                                        {/* 2. SPIN WHEEL */}
                                        {(campaign.campaign_type === 'spin' || (!campaign.campaign_type || (campaign.campaign_type !== 'slot' && campaign.campaign_type !== 'box' && campaign.campaign_type !== 'scratch'))) && (
                                            <div className="w-full flex flex-col items-center relative z-10">
                                                <div className="relative w-32 h-32 flex items-center justify-center">
                                                    <div className="absolute -top-1 z-20 flex flex-col items-center pointer-events-none">
                                                        <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[12px] border-t-amber-400 drop-shadow-md"></div>
                                                    </div>
                                                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-lg relative flex items-center justify-center">
                                                        <div
                                                            style={{
                                                                background: `conic-gradient(
                                                                    ${primaryColor} 0deg 45deg,
                                                                    #10B981 45deg 90deg,
                                                                    ${secondaryColor} 90deg 135deg,
                                                                    #EC4899 135deg 180deg,
                                                                    ${primaryColor} 180deg 225deg,
                                                                    #06B6D4 225deg 270deg,
                                                                    ${secondaryColor} 270deg 315deg,
                                                                    #8B5CF6 315deg 360deg
                                                                )`
                                                            }}
                                                            className="w-full h-full rounded-full shadow-inner relative flex items-center justify-center border-2 border-white/50"
                                                        >
                                                            <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-amber-300 shadow-md flex items-center justify-center text-amber-300 font-black text-[11px]">
                                                                ★
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    style={{ backgroundColor: primaryColor }}
                                                    className="w-full mt-2.5 py-1.5 rounded-xl text-white font-black text-[11px] uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all"
                                                >
                                                    SPIN WHEEL 🎡
                                                </button>
                                            </div>
                                        )}

                                        {/* 3. SCRATCH CARD */}
                                        {campaign.campaign_type === 'scratch' && (
                                            <div className="w-full relative z-10">
                                                <div className="flex items-center justify-between pb-1 border-b border-amber-400/30 text-[9px] font-mono">
                                                    <span className="font-bold text-amber-500 uppercase">VIP SCRATCH PASS</span>
                                                    <span className="opacity-60 text-gray-400">#8942-A</span>
                                                </div>
                                                <div className="relative mt-1.5 h-20 rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-900 flex items-center justify-center">
                                                    <div className="text-center p-2">
                                                        <span className="text-[9px] uppercase font-bold tracking-wider text-amber-300">You Won</span>
                                                        <p className="text-base font-black text-white">25% OFF</p>
                                                        <span className="text-[8px] text-emerald-400 font-mono font-bold">CODE: LUCKY25</span>
                                                    </div>
                                                    <div className="absolute right-0 top-0 bottom-0 w-3/5 bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 border-l border-white/60 flex flex-col items-center justify-center shadow-md">
                                                        <span className="text-lg">🪙</span>
                                                        <span className="text-[8px] font-black text-slate-800 uppercase tracking-wider">Scratch Here</span>
                                                    </div>
                                                </div>
                                                <button
                                                    style={{ backgroundColor: primaryColor }}
                                                    className="w-full mt-2.5 py-1.5 rounded-xl text-white font-black text-[11px] uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all"
                                                >
                                                    SCRATCH CARD 🎟️
                                                </button>
                                            </div>
                                        )}

                                        {/* 4. MYSTERY BOX */}
                                        {campaign.campaign_type === 'box' && (
                                            <div className="w-full flex flex-col items-center relative z-10">
                                                <div className="flex items-center justify-center gap-2 py-1">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/20 shadow-md flex items-center justify-center text-xl opacity-70 scale-90">
                                                        🎁
                                                    </div>
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-white shadow-xl flex flex-col items-center justify-center relative animate-pulse">
                                                        <span className="text-2xl">✨</span>
                                                        <span className="text-[7px] font-black uppercase tracking-wider text-slate-950 mt-0.5">LUCKY</span>
                                                    </div>
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/20 shadow-md flex items-center justify-center text-xl opacity-70 scale-90">
                                                        🎁
                                                    </div>
                                                </div>
                                                <button
                                                    style={{ backgroundColor: primaryColor }}
                                                    className="w-full mt-2 py-1.5 rounded-xl text-white font-black text-[11px] uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all"
                                                >
                                                    OPEN LUCKY BOX 🎁
                                                </button>
                                            </div>
                                        )}

                                    </div>
                                </div>

                                {/* Simulated CTA Button */}
                                <div className="pt-2 text-center">
                                    <div
                                        style={{ borderColor: isLightMode ? primaryColor + '30' : primaryColor + '40' }}
                                        className={`p-2 rounded-xl backdrop-blur-xs border flex items-center justify-between text-[11px] ${
                                            isLightMode ? 'bg-slate-900/5 text-slate-900' : 'bg-black/30 text-white'
                                        }`}
                                    >
                                        <span className="font-bold truncate opacity-80">
                                            🎁 Instant Voucher
                                        </span>
                                        <span
                                            style={{ backgroundColor: secondaryColor }}
                                            className="px-2 py-0.5 rounded-md text-[10px] font-black text-slate-950 shadow-xs"
                                        >
                                            {ctaText || 'Redeem'}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                    </div>

                        </div>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="px-5 sm:px-7 py-3.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                        <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                            Theme: <strong className="text-gray-800 capitalize">{themeStyle}</strong> ({primaryColor})
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            style={{ backgroundColor: primaryColor }}
                            className="px-6 py-2.5 text-white text-xs font-black rounded-xl shadow-md hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <RefreshCw size={14} className="animate-spin" />
                                    <span>Saving Design...</span>
                                </>
                            ) : (
                                <>
                                    <Check size={15} />
                                    <span>Save & Publish Design</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CampaignDesignModal;
