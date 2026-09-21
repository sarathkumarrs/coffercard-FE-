import React, { useState } from 'react';
import { 
    Sparkles, ArrowRight, Instagram, Facebook, 
    ScrollText, Lock, Volume2, VolumeX, Check
} from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

const THEMES = [
    { id: 'modern', category: 'light', bgHex: '#FFFFFF', bgClass: 'bg-white text-slate-900' },
    { id: 'emerald', category: 'light', bgHex: '#F0FDF4', bgClass: 'bg-[#F0FDF4] text-slate-900' },
    { id: 'sunset', category: 'light', bgHex: '#FFF1F2', bgClass: 'bg-[#FFF1F2] text-slate-900' },
    { id: 'champagne', category: 'light', bgHex: '#FAF8F5', bgClass: 'bg-[#FAF8F5] text-stone-900' },
    { id: 'luxury', category: 'dark', bgHex: '#090A0F', bgClass: 'bg-[#090A0F] text-white' },
    { id: 'midnight', category: 'dark', bgHex: '#0B0F19', bgClass: 'bg-[#0B0F19] text-white' },
    { id: 'cyberpunk', category: 'dark', bgHex: '#0D051D', bgClass: 'bg-[#0D051D] text-white' },
    { id: 'stealth', category: 'dark', bgHex: '#000000', bgClass: 'bg-black text-white' }
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

const SocialGuidelines = ({ campaign, onComplete }) => {
    const [socialClicks, setSocialClicks] = useState({
        instagram: false,
        facebook: false
    });
    const [animating, setAnimating] = useState('');
    const [isMuted, setIsMuted] = useState(soundManager.isMuted());

    // Custom Design & Branding Configuration
    const design = campaign?.design_settings || {};
    const primaryColor = design.primary_color || '#4f46e5';
    const secondaryColor = design.secondary_color || '#f59e0b';
    const bgStyle = design.bg_style || 'theme_default';
    const bgSolidColor = design.bg_solid_color || '#0f172a';
    const bgImageUrl = design.bg_image_url || '';
    const fontFamily = design.font_family || 'sans';
    const logoUrl = design.logo_url || campaign?.vendor_logo;
    const logoSize = design.logo_size || 'md';

    // Editable Copy for Unlock Screen
    const unlockBadge = design.unlock_badge || 'VIP Campaign Unlock';
    const unlockHeadline = design.unlock_headline || design.headline || campaign?.name || "Let's Play & Win";
    const unlockSubheadline = design.unlock_subheadline || "Complete these quick steps to unlock your chance to win instant rewards!";
    const guidelinesTitle = design.guidelines_title || "Campaign Guidelines";
    const unlockBtnText = design.unlock_btn_text || "Start Game Now";

    const fontClass = 
        fontFamily === 'serif' ? 'font-brand-serif' :
        fontFamily === 'display' ? 'font-brand-display' :
        fontFamily === 'outfit' ? 'font-brand-outfit' : 'font-brand-sans';

    const currentTheme = THEMES.find(t => t.id === (design.theme_style || 'modern')) || THEMES[0];
    const isLightMode = 
        bgStyle === 'mesh_light' ||
        (bgStyle === 'theme_default' && currentTheme.category === 'light') ||
        (bgStyle === 'custom_solid' && isColorLight(bgSolidColor));

    // Compute dynamic background styles matching game screen
    const getBgConfig = () => {
        if (bgStyle === 'custom_solid') {
            return {
                className: `min-h-screen flex flex-col justify-between transition-colors duration-300 ${isLightMode ? 'text-slate-900' : 'text-white'} ${fontClass}`,
                style: { backgroundColor: bgSolidColor }
            };
        }
        if (bgStyle === 'custom_image' && bgImageUrl) {
            return {
                className: `min-h-screen flex flex-col justify-between transition-colors duration-300 text-white ${fontClass}`,
                style: {
                    backgroundImage: `linear-gradient(rgba(10, 15, 29, 0.82), rgba(10, 15, 29, 0.88)), url(${bgImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    backgroundColor: '#0F172A'
                }
            };
        }
        if (bgStyle === 'mesh_dark') {
            return {
                className: `min-h-screen flex flex-col justify-between transition-colors duration-300 bg-mesh-aurora text-white ${fontClass}`,
                style: { backgroundColor: '#07090E' }
            };
        }
        if (bgStyle === 'mesh_light') {
            return {
                className: `min-h-screen flex flex-col justify-between transition-colors duration-300 bg-mesh-light text-slate-900 ${fontClass}`,
                style: { backgroundColor: '#FFFFFF' }
            };
        }
        return {
            className: `min-h-screen flex flex-col justify-between transition-colors duration-300 ${currentTheme.bgClass} ${fontClass}`,
            style: { backgroundColor: currentTheme.bgHex }
        };
    };

    const bgConfig = getBgConfig();

    const handleSocialClick = (platform) => {
        setAnimating(platform);
        soundManager.playTick(750);
        setTimeout(() => {
            setSocialClicks(prev => ({
                ...prev,
                [platform]: true
            }));
            setAnimating('');
            soundManager.playTick(950);
        }, 400);
    };

    const ensureProtocol = (url) => {
        if (!url) return '';
        if (url.match(/^https?:\/\//i)) {
            return url;
        }
        return `https://${url}`;
    };

    const defaultGuidelines = [
        'Follow our official social page to unlock your game challenge.',
        'Play the challenge to win instant discount vouchers, store credits, or gifts.',
        'Present your winning voucher code in-store or apply online at checkout!'
    ];

    const rawGuidelines = (campaign?.guidelines || '')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

    const guidelines = rawGuidelines.length > 0 ? rawGuidelines : defaultGuidelines;

    const hasInstagram = !!campaign?.instagram_link;
    const hasFacebook = !!campaign?.facebook_link;

    const totalRequired = (hasInstagram ? 1 : 0) + (hasFacebook ? 1 : 0);
    const completedCount = (hasInstagram && socialClicks.instagram ? 1 : 0) + (hasFacebook && socialClicks.facebook ? 1 : 0);

    const allRequiredSocialsClicked =
        (!hasInstagram || socialClicks.instagram) &&
        (!hasFacebook || socialClicks.facebook);

    const handleStartGame = () => {
        soundManager.playTick(900);
        if (onComplete) {
            onComplete();
        }
    };

    return (
        <div className={bgConfig.className} style={bgConfig.style}>
            {/* Ambient Background Glows */}
            <div 
                style={{
                    background: `radial-gradient(circle, ${primaryColor}22 0%, ${secondaryColor}12 45%, transparent 70%)`
                }}
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full blur-3xl pointer-events-none"
            />

            {/* Sound Toggle Button */}
            <button
                type="button"
                onClick={() => {
                    const nextMuted = soundManager.toggleMute();
                    setIsMuted(nextMuted);
                }}
                className={`fixed top-4 right-4 z-40 px-3 py-1.5 rounded-full shadow-md border backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold ${
                    isLightMode
                        ? 'bg-white/90 hover:bg-white text-gray-800 border-gray-200/80'
                        : 'bg-slate-900/90 hover:bg-slate-800 text-white border-white/15'
                }`}
                title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
                {isMuted ? <VolumeX size={15} className="text-rose-500" /> : <Volume2 size={15} className="text-emerald-500 animate-pulse" />}
                <span className="text-[11px] uppercase tracking-wider hidden sm:inline">{isMuted ? 'Muted' : 'Sound'}</span>
            </button>

            {/* Main Content Container */}
            <div className="w-full max-w-xl mx-auto py-8 sm:py-12 px-4 relative z-10 flex-1 flex flex-col justify-center">
                
                {/* Brand Header */}
                <div className="text-center mb-6 sm:mb-8">
                    {/* Brand Logo */}
                    {logoUrl && (
                        <div className="mb-4 flex justify-center">
                            <img 
                                src={logoUrl} 
                                alt={campaign?.vendor_name || 'Brand Logo'} 
                                className={`w-auto object-contain rounded-xl drop-shadow-md transition-all ${
                                    logoSize === 'sm' ? 'h-8 sm:h-9' : logoSize === 'lg' ? 'h-14 sm:h-16' : 'h-11 sm:h-12'
                                }`}
                            />
                        </div>
                    )}

                    {/* Glowing Unlock Badge */}
                    <div className="flex justify-center mb-3">
                        <span 
                            style={{ 
                                borderColor: isLightMode ? primaryColor + '40' : primaryColor + '50', 
                                color: primaryColor,
                                backgroundColor: isLightMode ? primaryColor + '10' : primaryColor + '18'
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border backdrop-blur-md shadow-xs"
                        >
                            <Sparkles size={13} style={{ color: secondaryColor }} />
                            {unlockBadge}
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-2 sm:mb-3">
                        {unlockHeadline}
                    </h1>

                    {/* Subheadline */}
                    <p className={`text-sm sm:text-base max-w-md mx-auto leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                        {unlockSubheadline}
                    </p>
                </div>

                {/* 3-Step Journey Indicator */}
                <div className={`mb-6 p-3 rounded-2xl border backdrop-blur-md flex items-center justify-between text-xs font-semibold ${
                    isLightMode 
                        ? 'bg-white/80 border-slate-200 text-slate-700 shadow-sm' 
                        : 'bg-white/[0.06] border-white/10 text-slate-300'
                }`}>
                    <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                            allRequiredSocialsClicked 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-indigo-600 text-white animate-pulse'
                        }`}>
                            {allRequiredSocialsClicked ? '✓' : '1'}
                        </span>
                        <span>{allRequiredSocialsClicked ? 'Followed & Unlocked' : 'Follow to Unlock'}</span>
                    </div>
                    <div className="h-0.5 flex-1 mx-3 bg-slate-400/30 relative">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-500" 
                            style={{ width: allRequiredSocialsClicked ? '100%' : completedCount > 0 ? '50%' : '0%' }}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                            allRequiredSocialsClicked 
                                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/50 animate-bounce' 
                                : 'bg-slate-700/50 text-slate-400'
                        }`}>
                            2
                        </span>
                        <span>Play Challenge</span>
                    </div>
                </div>

                {/* Guidelines Card */}
                <div className={`rounded-3xl p-5 sm:p-7 border backdrop-blur-xl shadow-2xl mb-6 transition-all ${
                    isLightMode 
                        ? 'bg-white/95 border-slate-200/80 shadow-slate-200/50' 
                        : 'bg-white/[0.07] border-white/15 shadow-black/40'
                }`}>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-500/20">
                        <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                            <span 
                                style={{ backgroundColor: primaryColor }} 
                                className="w-2.5 h-2.5 rounded-full animate-pulse" 
                            />
                            <ScrollText size={18} style={{ color: primaryColor }} />
                            <span>{guidelinesTitle}</span>
                        </h2>
                        {totalRequired > 0 && (
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                                allRequiredSocialsClicked 
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                            }`}>
                                {completedCount}/{totalRequired} Steps Done
                            </span>
                        )}
                    </div>

                    <ol className="space-y-3.5">
                        {guidelines.map((guideline, index) => (
                            <li key={index} className="flex items-start gap-3 text-xs sm:text-sm">
                                <span 
                                    style={{ 
                                        borderColor: primaryColor + '50', 
                                        color: isLightMode ? primaryColor : '#E0E7FF',
                                        backgroundColor: primaryColor + '18'
                                    }}
                                    className="flex-shrink-0 w-6 h-6 rounded-full border font-black text-xs flex items-center justify-center mt-0.5 shadow-xs"
                                >
                                    {index + 1}
                                </span>
                                <span className={`flex-1 leading-relaxed ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>
                                    {guideline}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Social Media Follow Action Buttons */}
                <div className="space-y-3">
                    {hasInstagram && (
                        <a
                            href={ensureProtocol(campaign.instagram_link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleSocialClick('instagram')}
                            className={`
                                w-full py-3.5 px-5 rounded-2xl flex items-center justify-between
                                border backdrop-blur-md transition-all duration-300 shadow-md group
                                ${socialClicks.instagram
                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 ring-2 ring-emerald-500/20'
                                    : 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] border-white/20 text-white hover:brightness-110 hover:scale-[1.01]'}
                                ${animating === 'instagram' ? 'scale-105' : ''}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${socialClicks.instagram ? 'bg-emerald-500/30' : 'bg-white/20'}`}>
                                    <Instagram size={20} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-sm sm:text-base">
                                        {socialClicks.instagram ? 'Followed on Instagram' : 'Follow on Instagram'}
                                    </div>
                                    <div className="text-[11px] opacity-80">
                                        {socialClicks.instagram ? 'Step verified • Ready to play' : 'Tap to follow and unlock instant reward'}
                                    </div>
                                </div>
                            </div>
                            {socialClicks.instagram ? (
                                <span className="flex items-center gap-1 text-xs font-black bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-full">
                                    <Check size={14} /> Unlocked
                                </span>
                            ) : (
                                <ArrowRight size={18} className="text-white group-hover:translate-x-1 transition-transform" />
                            )}
                        </a>
                    )}

                    {hasFacebook && (
                        <a
                            href={ensureProtocol(campaign.facebook_link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleSocialClick('facebook')}
                            className={`
                                w-full py-3.5 px-5 rounded-2xl flex items-center justify-between
                                border backdrop-blur-md transition-all duration-300 shadow-md group
                                ${socialClicks.facebook
                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 ring-2 ring-emerald-500/20'
                                    : 'bg-gradient-to-r from-[#1877F2] to-[#0D65D9] border-white/20 text-white hover:brightness-110 hover:scale-[1.01]'}
                                ${animating === 'facebook' ? 'scale-105' : ''}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${socialClicks.facebook ? 'bg-emerald-500/30' : 'bg-white/20'}`}>
                                    <Facebook size={20} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-sm sm:text-base">
                                        {socialClicks.facebook ? 'Followed on Facebook' : 'Follow on Facebook'}
                                    </div>
                                    <div className="text-[11px] opacity-80">
                                        {socialClicks.facebook ? 'Step verified • Ready to play' : 'Tap to follow and unlock instant reward'}
                                    </div>
                                </div>
                            </div>
                            {socialClicks.facebook ? (
                                <span className="flex items-center gap-1 text-xs font-black bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-full">
                                    <Check size={14} /> Unlocked
                                </span>
                            ) : (
                                <ArrowRight size={18} className="text-white group-hover:translate-x-1 transition-transform" />
                            )}
                        </a>
                    )}

                    {/* Start Game Action Button */}
                    <button
                        type="button"
                        onClick={handleStartGame}
                        disabled={!allRequiredSocialsClicked}
                        className={`
                            w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg
                            flex items-center justify-center gap-2 shadow-xl transition-all duration-300
                            ${allRequiredSocialsClicked
                                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-slate-950 hover:brightness-105 hover:scale-[1.01] active:scale-95 cursor-pointer ring-4 ring-amber-400/30 shadow-amber-500/20'
                                : 'bg-white/10 text-slate-400 border border-white/10 cursor-not-allowed'}
                        `}
                    >
                        {allRequiredSocialsClicked ? (
                            <>
                                <Sparkles size={19} className="text-slate-950 animate-spin" style={{ animationDuration: '3s' }} />
                                <span>{unlockBtnText}</span>
                                <ArrowRight size={20} className="text-slate-950 animate-bounce" style={{ animationDirection: 'alternate' }} />
                            </>
                        ) : (
                            <span className="flex items-center gap-2 text-sm sm:text-base">
                                <Lock size={17} />
                                Follow {hasInstagram ? 'on Instagram' : 'on Social'} to Unlock Game
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="py-4 text-center text-xs opacity-60">
                <span>Powered by </span>
                <a href="https://coffercard.com" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                    coffercard.com
                </a>
            </div>
        </div>
    );
};

export default SocialGuidelines;